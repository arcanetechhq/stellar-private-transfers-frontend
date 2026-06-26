import type { OnboardingPayload } from "contract";
import type { InspectKytPassageApproved } from "@auditable/privacy-pool-zk-sdk";
import { Buffer } from "buffer";
import { Operation, TransactionBuilder, rpc, xdr } from "@stellar/stellar-sdk";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import {
  getRequiredApiBaseUrl,
  getRequiredKytPassageRegistryContractId,
} from "@/shared/stellar/stellar-network-environment";
import { resolvePoolApplicationId } from "./build-transaction-audit-parameters";
import type { KytApplicationIdHints } from "./privacy-pool-proof-types";

const KYT_REGISTER_FEE_STROOPS = "1000000";
const KYT_REGISTER_TIMEOUT_SECONDS = 300;
const KYT_REGISTER_MAX_POLLS = 60;
const KYT_REGISTER_POLL_INTERVAL_MS = 1000;

type KytInspectResponse =
  | InspectKytPassageApproved
  | {
      status: "rejected" | "needs_review";
      reasonCode?: string;
      decisionId?: string;
    };

export interface DecryptedKytAuditSlot {
  slot: number;
  decryptOk: boolean;
  auditTagValid: boolean;
  noteAuditPublicKey?: [string, string];
  expectedAuditPublicKey?: [string, string];
  plaintext?: string[];
}

export interface RequestKytPassageForPoolInteractionInput {
  owner: string;
  poolContract: string;
  proofHex: string;
  publicHex: string;
  onboarding?: OnboardingPayload;
  decryptedAuditSlots?: DecryptedKytAuditSlot[];
  applicationIdsPlaintext?: KytApplicationIdHints;
  networkPassphrase: string;
  sorobanRpcUrl: string;
}

type LatestLedgerRpcResponse = {
  result?: {
    sequence?: number | string;
    latestLedger?: number | string;
  };
  error?: {
    message?: string;
  };
};

function buildApplicationIdHints(applicationId: string): [
  string,
  string,
  string,
  string,
] {
  return [applicationId, applicationId, applicationId, applicationId];
}

function buildNonce(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
}

function buildInspectUrl(): string {
  return `${getRequiredApiBaseUrl()}/kyt/passages/inspect`;
}

function parseLedgerSequence(value: number | string | undefined): number | undefined {
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isSafeInteger(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return undefined;
}

async function fetchCurrentLedger(sorobanRpcUrl: string): Promise<number> {
  const response = await fetch(sorobanRpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getLatestLedger",
    }),
  });
  const body = (await response.json()) as LatestLedgerRpcResponse;
  if (!response.ok || body.error) {
    const details = body.error?.message ?? response.statusText;
    throw new Error(`Failed to fetch current ledger from Soroban RPC: ${details}`);
  }
  const sequence =
    parseLedgerSequence(body.result?.sequence) ??
    parseLedgerSequence(body.result?.latestLedger);
  if (sequence === undefined) {
    throw new Error("Failed to fetch current ledger from Soroban RPC: invalid payload");
  }
  return sequence;
}

function kytJsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
}

async function parseInspectResponse(response: Response): Promise<KytInspectResponse> {
  const body = (await response.json()) as KytInspectResponse;
  if (!response.ok) {
    throw new Error(`KYT inspect failed: ${JSON.stringify(body)}`);
  }
  return body;
}

function passageIdToScValue(passageId: string): xdr.ScVal {
  return xdr.ScVal.scvBytes(Buffer.from(passageId.replace(/^0x/, ""), "hex"));
}

export function approvalSignatureToBytes(signature: string): Buffer {
  const clean = signature.trim();
  return /^(0x)?[0-9a-fA-F]{128}$/.test(clean)
    ? Buffer.from(clean.replace(/^0x/i, ""), "hex")
    : Buffer.from(clean, "base64");
}

function signatureToScValue(signature: string): xdr.ScVal {
  const bytes = approvalSignatureToBytes(signature);
  return xdr.ScVal.scvBytes(bytes);
}

async function waitForKytRegistration(parameters: {
  server: rpc.Server;
  hash: string;
}): Promise<void> {
  for (let attempt = 0; attempt < KYT_REGISTER_MAX_POLLS; attempt += 1) {
    const response = await parameters.server.getTransaction(parameters.hash);
    if (response.status === "SUCCESS") {
      return;
    }
    if (response.status === "FAILED") {
      throw new Error("KYT passage registration failed on-chain");
    }
    await new Promise((resolve) => {
      setTimeout(resolve, KYT_REGISTER_POLL_INTERVAL_MS);
    });
  }
  throw new Error("KYT passage registration was not confirmed in time");
}

export async function registerKytPassage(parameters: {
  approval: InspectKytPassageApproved;
  owner: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
}): Promise<void> {
  const kytRegistry = getRequiredKytPassageRegistryContractId();
  const server = new rpc.Server(parameters.sorobanRpcUrl, { allowHttp: true });
  const sourceAccount = await server.getAccount(parameters.owner);
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: KYT_REGISTER_FEE_STROOPS,
    networkPassphrase: parameters.networkPassphrase,
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: kytRegistry,
        function: "register_passage",
        args: [
          passageIdToScValue(parameters.approval.passageId),
          xdr.ScVal.scvU32(parameters.approval.expiresAtLedger),
          signatureToScValue(parameters.approval.signature),
        ],
      }),
    )
    .setTimeout(KYT_REGISTER_TIMEOUT_SECONDS)
    .build();
  const preparedTransaction = await server.prepareTransaction(transaction);
  const { signedTxXdr } = await StellarWalletsKit.signTransaction(
    preparedTransaction.toXDR(),
    {
      networkPassphrase: parameters.networkPassphrase,
      address: parameters.owner,
    },
  );
  const signedTransaction = TransactionBuilder.fromXDR(
    signedTxXdr,
    parameters.networkPassphrase,
  );
  const result = await server.sendTransaction(signedTransaction);
  const status = String(result.status);
  if (status !== "PENDING" && status !== "SUCCESS") {
    throw new Error(`KYT passage registration submit failed: ${status}`);
  }
  await waitForKytRegistration({ server, hash: result.hash });
}

export async function requestKytPassageForPoolInteraction(
  input: RequestKytPassageForPoolInteractionInput,
): Promise<InspectKytPassageApproved> {
  const applicationId = resolvePoolApplicationId();
  const applicationIdsPlaintext =
    input.applicationIdsPlaintext ?? buildApplicationIdHints(applicationId);
  const kytRegistry = getRequiredKytPassageRegistryContractId();
  const currentLedger = await fetchCurrentLedger(input.sorobanRpcUrl);
  const response = await fetch(buildInspectUrl(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(
      {
        owner: input.owner,
        poolContract: input.poolContract,
        kytRegistry,
        proofBytes: input.proofHex,
        publicSignalsBytes: input.publicHex,
        applicationIdsPlaintext,
        decryptedAuditSlots: input.decryptedAuditSlots,
        onboarding: input.onboarding,
        nonce: buildNonce(),
        currentLedger,
      },
      kytJsonReplacer,
    ),
  });
  const body = await parseInspectResponse(response);
  if (body.status !== "approved") {
    throw new Error(`KYT inspect rejected: ${body.reasonCode ?? body.status}`);
  }
  return body;
}
