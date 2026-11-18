import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { activeModules } from "@creit-tech/stellar-wallets-kit/state";
import { Networks } from "@creit-tech/stellar-wallets-kit/types";
import {
  WalletConnectModule,
  WalletConnectTargetChain,
} from "@creit-tech/stellar-wallets-kit/modules/wallet-connect";
import { FIREBLOCKS_WALLET_PROVIDER } from "@/entities/wallet";
import { readClientEnvironment } from "@/shared/lib/privacy-sdk/read-client-environment";
import { openCustodianSigningSession } from "./custodian-signing-session";
import { FireblocksWizardError } from "./fireblocks-wizard-error";

const REOWN_PROJECT_ID = "VITE_REOWN_PROJECT_ID";
const SIGN_CLIENT_WAIT_MS = 100;
const SIGN_CLIENT_ATTEMPTS = 50;
const SESSION_METADATA_NAME = "Arcane private payments";

type UriModal = {
  open: (options?: { uri?: string }) => void;
  close: () => void;
};

type Deferred<Value> = {
  promise: Promise<Value>;
  resolve: (value: Value) => void;
  reject: (error: unknown) => void;
};

export type SilentStellarSession = {
  walletConnectUri: Promise<string>;
  approved: Promise<void>;
};

export function readReownProjectId(): string | undefined {
  return readClientEnvironment(REOWN_PROJECT_ID);
}

function defer<Value>(): Deferred<Value> {
  let resolve: ((value: Value) => void) | undefined;
  let reject: ((error: unknown) => void) | undefined;
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  if (resolve === undefined || reject === undefined) {
    throw new FireblocksWizardError("invalid-response");
  }
  return { promise, resolve, reject };
}

function settleAddress(): void {
  return;
}

function ignoreRejection(): void {
  return;
}

function sessionMetadata(): {
  name: string;
  description: string;
  url: string;
  icons: string[];
} {
  const origin = globalThis.location.origin;
  return {
    name: SESSION_METADATA_NAME,
    description: SESSION_METADATA_NAME,
    url: origin,
    icons: [`${origin}/favicon.ico`],
  };
}

function captureWalletConnectUri(
  modal: WalletConnectModule["modal"],
  onUri: (walletConnectUri: string) => void,
): void {
  const sink = modal as unknown as UriModal;
  const originalClose = sink.close.bind(sink);
  let captured = false;
  sink.open = (options) => {
    const walletConnectUri = options?.uri?.trim() ?? "";
    if (captured || walletConnectUri.length === 0) {
      return;
    }
    captured = true;
    onUri(walletConnectUri);
  };
  sink.close = () => {
    try {
      originalClose();
    } catch {
      return;
    }
  };
}

function installWalletConnectModule(module: WalletConnectModule): void {
  const others = activeModules.value.filter(
    (item) => item.productId !== module.productId,
  );
  activeModules.value = [...others, module];
  StellarWalletsKit.setWallet(module.productId);
}

class SilentStellarWalletConnect extends WalletConnectModule {
  constructor(projectId: string) {
    super({
      projectId,
      metadata: sessionMetadata(),
      allowedChains: [WalletConnectTargetChain.TESTNET],
    });
    this.productName = FIREBLOCKS_WALLET_PROVIDER;
  }

  async getAddress(): Promise<{ address: string }> {
    return openCustodianSigningSession(this);
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return {
      network: "testnet",
      networkPassphrase: Networks.TESTNET,
    };
  }
}

async function waitForSignClient(module: WalletConnectModule): Promise<void> {
  for (let attempt = 0; attempt < SIGN_CLIENT_ATTEMPTS; attempt += 1) {
    if (module.signClient) {
      return;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, SIGN_CLIENT_WAIT_MS);
    });
  }
  throw new FireblocksWizardError("invalid-response");
}

function wrapSessionError(error: unknown): FireblocksWizardError {
  return error instanceof FireblocksWizardError
    ? error
    : new FireblocksWizardError("invalid-response");
}

export function startSilentStellarSession(
  projectId: string,
): SilentStellarSession {
  const module = new SilentStellarWalletConnect(projectId);
  const uriDeferred = defer<string>();
  captureWalletConnectUri(module.modal, (walletConnectUri) => {
    uriDeferred.resolve(walletConnectUri);
  });
  installWalletConnectModule(module);
  const approved = waitForSignClient(module)
    .then(() => module.getAddress())
    .then(settleAddress)
    .catch((error: unknown) => {
      const wrapped = wrapSessionError(error);
      uriDeferred.reject(wrapped);
      throw wrapped;
    });
  void approved.catch(ignoreRejection);
  return {
    walletConnectUri: uriDeferred.promise,
    approved,
  };
}
