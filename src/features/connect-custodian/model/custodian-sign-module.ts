import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { activeAddress, activeModules, wcSessionPaths } from "@creit-tech/stellar-wallets-kit/state";
import { ModuleType, Networks, type ModuleInterface } from "@creit-tech/stellar-wallets-kit/types";
import {
  WALLET_CONNECT_ID,
  WalletConnectAllowedMethods,
  WalletConnectTargetChain,
  type WalletConnectModule,
} from "@creit-tech/stellar-wallets-kit/modules/wallet-connect";
import { FIREBLOCKS_WALLET_PROVIDER } from "@/entities/wallet";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import { openCustodianSigningSession, type CustodianSigningModule } from "./custodian-signing-session";
import { signatureHexFromMessageEnvelope, signatureHex } from "./custodian-message-signature";
import { prepareCustodianEnvelope } from "./custodian-archived-restore";
import { envelopeForCustodianSigning } from "./custodian-sign-envelope";
import { custodianSignRequestOptions } from "./custodian-sign-request";
import { FireblocksWizardError } from "./fireblocks-wizard-error";
import { isRecord } from "./record-value";

type SignClient = WalletConnectModule["signClient"];

type SignOptions = {
  networkPassphrase?: string;
  address?: string;
};

export class CustodianSignModule implements ModuleInterface, CustodianSigningModule {
  moduleType = ModuleType.BRIDGE_WALLET;
  productId = WALLET_CONNECT_ID;
  productName = FIREBLOCKS_WALLET_PROVIDER;
  productUrl = "https://www.fireblocks.com";
  productIcon = "";
  wcParams = { allowedChains: [WalletConnectTargetChain.TESTNET] };
  modal: CustodianSigningModule["modal"] = {
    open: () => undefined,
    close: () => undefined,
  };

  private client: SignClient | undefined;

  get signClient(): SignClient {
    if (!this.client) {
      throw new FireblocksWizardError("invalid-response");
    }
    return this.client;
  }

  attach(client: SignClient, modal: CustodianSigningModule["modal"]): void {
    this.client = client;
    this.modal = modal;
  }

  async runChecks(): Promise<void> {
    if (!this.client) {
      throw new FireblocksWizardError("invalid-response");
    }
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getAddress(): Promise<{ address: string }> {
    const session = await openCustodianSigningSession(this);
    return { address: session.address };
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return { network: "testnet", networkPassphrase: Networks.TESTNET };
  }

  private async signPreparedEnvelope(
    xdrText: string,
    chainId: string,
    address?: string,
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    const account = (address ?? "").trim();
    const signed = await requestRecord(this.signClient, {
      topic: sessionTopic(address),
      chainId,
      method: WalletConnectAllowedMethods.SIGN,
      params: {
        xdr: envelopeForCustodianSigning(xdrText),
        chain: chainId,
        ...(account.length > 0 ? { account: `${chainId}:${account}` } : {}),
      },
    });
    return {
      signedTxXdr: requiredField(signed, "signedXDR"),
      signerAddress: optionalField(signed, "signerAddress") ?? address,
    };
  }

  async signTransaction(
    xdrText: string,
    opts?: SignOptions,
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    const chainId = targetChain(opts?.networkPassphrase);
    const network = getDefaultStellarNetworkConfig();
    const prepared = await prepareCustodianEnvelope({
      xdrText,
      passphrase: opts?.networkPassphrase ?? network.networkPassphrase,
      rpcUrl: network.sorobanRpcUrl,
      signXdr: async (restoreXdr) =>
        (await this.signPreparedEnvelope(restoreXdr, chainId, opts?.address)).signedTxXdr,
    });
    return this.signPreparedEnvelope(prepared, chainId, opts?.address);
  }

  async signAuthEntry(
    authEntry: string,
    opts?: SignOptions,
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    const signed = await requestRecord(this.signClient, {
      topic: sessionTopic(opts?.address),
      chainId: targetChain(opts?.networkPassphrase),
      method: WalletConnectAllowedMethods.SIGN_AUTH_ENTRY,
      params: { entryXdr: authEntry },
    });
    return {
      signedAuthEntry: requiredField(signed, "signedAuthEntry"),
      signerAddress: optionalField(signed, "signerAddress") ?? opts?.address,
    };
  }

  async signMessage(
    message: string,
    opts?: SignOptions,
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    const topic = sessionTopic(opts?.address);
    const chainId = targetChain(opts?.networkPassphrase);
    const address = (opts?.address ?? activeAddress.value ?? "").trim();
    const account = address.length > 0 ? `${chainId}:${address}` : "";
    try {
      const signed = await requestRecord(this.signClient, {
        topic,
        chainId,
        method: WalletConnectAllowedMethods.SIGN_MESSAGE,
        params: {
          message,
          messageEncoding: "utf-8",
          chain: chainId,
          ...(account.length > 0 ? { account } : {}),
        },
      });
      return {
        signedMessage: signatureHex(requiredField(signed, "signature")),
        signerAddress: optionalField(signed, "signerAddress") ?? address,
      };
    } catch (messageError) {
      try {
        const signedMessage = await signatureHexFromMessageEnvelope({
          client: this.signClient,
          topic,
          chainId,
          address,
          message,
          networkPassphrase: opts?.networkPassphrase,
        });
        return { signedMessage, signerAddress: address };
      } catch (envelopeError) {
        throw messageError instanceof Error ? messageError : envelopeError;
      }
    }
  }
}

export function installCustodianSignModule(module: CustodianSignModule): void {
  const others = activeModules.value.filter((item) => item.productId !== module.productId);
  activeModules.value = [...others, module];
  StellarWalletsKit.setWallet(module.productId);
}

function targetChain(passphrase?: string): string {
  return passphrase === Networks.PUBLIC
    ? WalletConnectTargetChain.PUBLIC
    : WalletConnectTargetChain.TESTNET;
}

function sessionTopic(address?: string): string {
  const key = (address ?? activeAddress.value ?? "").trim();
  const path =
    wcSessionPaths.value.findLast((item) => item.publicKey === key) ??
    wcSessionPaths.value.at(-1);
  const topic = path?.topic.trim() ?? "";
  if (topic.length === 0) {
    throw new FireblocksWizardError(
      "invalid-response",
      undefined,
      "WalletConnect session was not approved",
    );
  }
  return topic;
}

function liveSessionTopics(client: SignClient): string[] {
  const store = client.session as { getAll?: () => Array<{ topic?: string }> };
  return (store.getAll?.() ?? [])
    .map((session) => session.topic?.trim() ?? "")
    .filter((topic) => topic.length > 0);
}

function topicOnClient(client: SignClient, preferred: string): string {
  const live = liveSessionTopics(client);
  if (live.includes(preferred)) {
    return preferred;
  }
  const topic = live.at(-1) ?? "";
  if (topic.length === 0) {
    throw new FireblocksWizardError(
      "invalid-response",
      undefined,
      "WalletConnect session was not approved",
    );
  }
  return topic;
}

async function requestRecord(
  client: SignClient,
  input: {
    topic: string;
    chainId: string;
    method: string;
    params: Record<string, string>;
  },
): Promise<Record<string, unknown>> {
  let response: unknown;
  try {
    response = await client.request({
      topic: topicOnClient(client, input.topic),
      chainId: input.chainId,
      expiry: custodianSignRequestOptions().expiry,
      request: { method: input.method, params: input.params },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    const payload = input.params.xdr ?? input.params.entryXdr ?? input.params.message ?? "";
    if (message.includes("Request expired") && payload.length > 0) {
      throw new Error(`${message} (payload ${String(payload.length)})`);
    }
    throw error;
  }
  if (!isRecord(response)) {
    throw new FireblocksWizardError("invalid-response");
  }
  return response;
}

function requiredField(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new FireblocksWizardError("invalid-response");
  }
  return value;
}

function optionalField(record: Record<string, unknown>, field: string): string | undefined {
  const value = record[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }
  return value;
}
