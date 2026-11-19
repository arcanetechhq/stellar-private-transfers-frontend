import {
  Account,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import {
  WalletConnectAllowedMethods,
  type WalletConnectModule,
} from "@creit-tech/stellar-wallets-kit/modules/wallet-connect";
import { custodianSignRequestOptions } from "./custodian-sign-request";
import { FireblocksWizardError } from "./fireblocks-wizard-error";
import { isRecord } from "./record-value";

type SignClient = WalletConnectModule["signClient"];

const MESSAGE_OPERATION = "arcane-sign";
const TRANSACTION_FEE = "100";
const TRANSACTION_SEQUENCE = "0";

export function grantStellarSigningMethods(client: SignClient, topic: string): void {
  const session = client.session.get(topic);
  const stellar = session.namespaces.stellar;
  if (!stellar) {
    return;
  }
  for (const method of [
    WalletConnectAllowedMethods.SIGN_MESSAGE,
    WalletConnectAllowedMethods.SIGN_AUTH_ENTRY,
  ]) {
    if (!stellar.methods.includes(method)) {
      stellar.methods.push(method);
    }
  }
}

export async function signatureHexFromMessageEnvelope(input: {
  client: SignClient;
  topic: string;
  chainId: string;
  address: string;
  message: string;
  networkPassphrase?: string;
}): Promise<string> {
  const passphrase = input.networkPassphrase ?? Networks.TESTNET;
  const digest = await digestHex(input.message);
  const transaction = new TransactionBuilder(new Account(input.address, TRANSACTION_SEQUENCE), {
    fee: TRANSACTION_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(
      Operation.manageData({
        name: MESSAGE_OPERATION,
        value: digest,
      }),
    )
    .setTimeout(0)
    .build();
  const response: unknown = await input.client.request({
    topic: input.topic,
    chainId: input.chainId,
    expiry: custodianSignRequestOptions().expiry,
    request: {
      method: WalletConnectAllowedMethods.SIGN,
      params: { xdr: transaction.toXDR() },
    },
  });
  if (!isRecord(response) || typeof response.signedXDR !== "string") {
    throw new FireblocksWizardError("invalid-response");
  }
  return signatureHexFromSignedXdr(response.signedXDR, passphrase);
}

export function signatureHex(signature: string): string {
  const trimmed = signature.trim();
  if (/^[0-9a-f]+$/iu.test(trimmed) && trimmed.length % 2 === 0) {
    return trimmed.toLowerCase();
  }
  const binary = atob(trimmed);
  return [...binary]
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
}
async function digestHex(message: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(message),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function signatureHexFromSignedXdr(signedXdr: string, passphrase: string): string {
  const transaction = TransactionBuilder.fromXDR(signedXdr, passphrase);
  const signature = transaction.signatures[0]?.signature();
  if (!signature || signature.length === 0) {
    throw new FireblocksWizardError("invalid-response");
  }
  return [...signature]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
