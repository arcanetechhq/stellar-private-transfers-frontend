import {
  Account,
  Operation,
  TransactionBuilder,
  rpc,
  xdr,
  type Transaction,
} from "@stellar/stellar-sdk";
import { envelopeForCustodianSigning } from "./custodian-sign-envelope";

const NETWORK_WRITE_BYTE_LIMIT = 132_096;
const RESOURCE_EXT = "resourceExt";
const SOROBAN_DATA = "sorobanData";
const ENVELOPE_TYPE_TX = "envelopeTypeTx";
const RESTORE_ATTEMPTS = 4;
const SETTLED_WAIT_MS = 90_000;

type SignXdr = (xdrText: string) => Promise<string>;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function archivedLedgerKeys(xdrText: string): xdr.LedgerKey[] {
  const envelope = xdr.TransactionEnvelope.fromXDR(xdrText, "base64");
  if (envelope.switch().name !== ENVELOPE_TYPE_TX) {
    return [];
  }
  const transaction = envelope.v1().tx();
  if (transaction.ext().arm() !== SOROBAN_DATA) {
    return [];
  }
  const data = transaction.ext().sorobanData();
  if (data.ext().arm() !== RESOURCE_EXT) {
    return [];
  }
  const writes = data.resources().footprint().readWrite();
  const keys: xdr.LedgerKey[] = [];
  for (const entry of data.ext().resourceExt().archivedSorobanEntries()) {
    const key = writes[Number(entry)];
    if (key) {
      keys.push(key);
    }
  }
  return keys;
}

function declaredWriteBytes(tx: Transaction): number {
  const envelope = tx.toEnvelope();
  if (envelope.switch().name !== ENVELOPE_TYPE_TX) {
    return 0;
  }
  const ext = envelope.v1().tx().ext();
  if (ext.arm() !== SOROBAN_DATA) {
    return 0;
  }
  return ext.sorobanData().resources().writeBytes();
}

function restoreDraft(input: {
  account: Account;
  passphrase: string;
  keys: xdr.LedgerKey[];
}): Transaction {
  const account = new Account(
    input.account.accountId(),
    input.account.sequenceNumber(),
  );
  const soroban = new xdr.SorobanTransactionData({
    ext: new xdr.SorobanTransactionDataExt(0),
    resources: new xdr.SorobanResources({
      footprint: new xdr.LedgerFootprint({
        readOnly: [],
        readWrite: input.keys,
      }),
      instructions: 0,
      diskReadBytes: 0,
      writeBytes: 0,
    }),
    resourceFee: xdr.Int64.fromString("0"),
  });
  return new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: input.passphrase,
  })
    .addOperation(Operation.restoreFootprint({}))
    .setSorobanData(soroban)
    .setTimeout(300)
    .build();
}

async function largestRestoreBatch(input: {
  server: rpc.Server;
  account: Account;
  passphrase: string;
  keys: xdr.LedgerKey[];
}): Promise<{ count: number; tx: Transaction }> {
  let chosen: Transaction | undefined;
  let count = 0;
  for (let index = 0; index < input.keys.length; index += 1) {
    const draft = restoreDraft({
      account: input.account,
      passphrase: input.passphrase,
      keys: input.keys.slice(0, index + 1),
    });
    const simulation = await input.server.simulateTransaction(draft);
    if (rpc.Api.isSimulationError(simulation) || !rpc.Api.isSimulationSuccess(simulation)) {
      if (!chosen) {
        throw new Error("Custodian restore could not be prepared");
      }
      break;
    }
    const assembled = rpc.assembleTransaction(draft, simulation).build();
    if (declaredWriteBytes(assembled) > NETWORK_WRITE_BYTE_LIMIT) {
      if (!chosen) {
        throw new Error("Custodian restore exceeds the network write limit");
      }
      break;
    }
    chosen = assembled;
    count = index + 1;
  }
  if (!chosen) {
    throw new Error("Custodian restore could not be prepared");
  }
  return { count, tx: chosen };
}

async function waitForTransaction(server: rpc.Server, hash: string): Promise<void> {
  const deadline = Date.now() + SETTLED_WAIT_MS;
  while (Date.now() < deadline) {
    const result = await server.getTransaction(hash);
    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return;
    }
    if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Custodian restore failed");
    }
    await delay(1_000);
  }
  throw new Error("Custodian restore did not settle");
}

function rejectionCode(sent: rpc.Api.SendTransactionResponse): string {
  const result = sent.errorResult;
  if (!result) {
    return sent.status;
  }
  try {
    const inner = result.result();
    const name = inner.switch().name;
    if (name !== "txFailed") {
      return `${sent.status} ${name}`;
    }
    const operation = inner.results()[0];
    if (!operation || operation.switch().name !== "opInner") {
      return `${sent.status} ${name}`;
    }
    const body = operation.tr();
    const operationName = body.switch().name;
    const detail = body.value();
    const detailName =
      detail && typeof detail.switch === "function" ? detail.switch().name : "";
    return `${sent.status} ${name} ${operationName} ${detailName}`.trim();
  } catch {
    return sent.status;
  }
}

async function sendRestore(
  server: rpc.Server,
  signedXdr: string,
  passphrase: string,
): Promise<void> {
  const sent = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, passphrase),
  );
  if (sent.status === "ERROR" || (sent.hash ?? "").trim().length === 0) {
    throw new Error(`Custodian restore was rejected (${rejectionCode(sent)})`);
  }
  await waitForTransaction(server, sent.hash);
}

async function restoreArchivedKeys(input: {
  server: rpc.Server;
  xdrText: string;
  passphrase: string;
  keys: xdr.LedgerKey[];
  signXdr: SignXdr;
}): Promise<void> {
  const source = TransactionBuilder.fromXDR(input.xdrText, input.passphrase).source;
  let remaining = input.keys;
  while (remaining.length > 0) {
    const account = await input.server.getAccount(source);
    const batch = await largestRestoreBatch({
      server: input.server,
      account,
      passphrase: input.passphrase,
      keys: remaining,
    });
    await sendRestore(
      input.server,
      await input.signXdr(batch.tx.toXDR()),
      input.passphrase,
    );
    remaining = remaining.slice(batch.count);
  }
}

async function resimulateInvoke(input: {
  server: rpc.Server;
  xdrText: string;
  passphrase: string;
}): Promise<string> {
  const source = TransactionBuilder.fromXDR(input.xdrText, input.passphrase);
  const account = await input.server.getAccount(source.source);
  const envelope = xdr.TransactionEnvelope.fromXDR(input.xdrText, "base64");
  const transaction = envelope.v1().tx();
  transaction.seqNum(
    xdr.Int64.fromString((BigInt(account.sequenceNumber()) + 1n).toString()),
  );
  transaction.ext(new xdr.TransactionExt(0));
  envelope.v1().signatures([]);
  const rebuilt = TransactionBuilder.fromXDR(envelope.toXDR("base64"), input.passphrase);
  const simulation = await input.server.simulateTransaction(rebuilt);
  if (!rpc.Api.isSimulationSuccess(simulation)) {
    throw new Error("Custodian transaction could not be prepared");
  }
  return rpc.assembleTransaction(rebuilt, simulation).build().toXDR();
}

export async function prepareCustodianEnvelope(input: {
  xdrText: string;
  passphrase: string;
  rpcUrl: string;
  signXdr: SignXdr;
}): Promise<string> {
  let current = input.xdrText;
  const server = new rpc.Server(input.rpcUrl);
  for (let attempt = 0; attempt < RESTORE_ATTEMPTS; attempt += 1) {
    const keys = archivedLedgerKeys(current);
    if (keys.length === 0) {
      return envelopeForCustodianSigning(current);
    }
    await restoreArchivedKeys({
      server,
      xdrText: current,
      passphrase: input.passphrase,
      keys,
      signXdr: input.signXdr,
    });
    await delay(2_000);
    current = await resimulateInvoke({
      server,
      xdrText: input.xdrText,
      passphrase: input.passphrase,
    });
  }
  throw new Error("Custodian transaction still needs archived entries");
}
