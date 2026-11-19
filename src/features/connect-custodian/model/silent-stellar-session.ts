import SignClient from "@walletconnect/sign-client";
import { readClientEnvironment } from "@/shared/lib/privacy-sdk/read-client-environment";
import { releaseWalletConnectApproval } from "../api/fireblocks-web3-connection";
import { openCustodianSigningSession } from "./custodian-signing-session";
import {
  CustodianSignModule,
  installCustodianSignModule,
} from "./custodian-sign-module";
import { FireblocksWizardError } from "./fireblocks-wizard-error";
import { isRecord } from "./record-value";

const REOWN_PROJECT_ID = "VITE_REOWN_PROJECT_ID";
const SESSION_METADATA_NAME = "Arcane private payments";
const SESSION_HOLDER = "__arcaneSilentStellarSession";
const SIGN_CLIENT_HOLDER = "__arcaneSilentSignClient";
const WALLET_CONNECT_DATABASE = /walletconnect|wc@/iu;

type Deferred<Value> = {
  promise: Promise<Value>;
  resolve: (value: Value) => void;
  reject: (error: unknown) => void;
};

type SessionHolder = { current?: SilentStellarSession };

export type SilentStellarSession = {
  walletConnectUri: Promise<string>;
  approved: Promise<string>;
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

function sessionHolder(): SessionHolder {
  const host = globalThis as typeof globalThis &
    Record<string, SessionHolder | undefined>;
  const existing = host[SESSION_HOLDER];
  if (existing) {
    return existing;
  }
  const created: SessionHolder = {};
  host[SESSION_HOLDER] = created;
  return created;
}

function readMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message.trim();
  }
  if (isRecord(error) && typeof error.message === "string") {
    return error.message.trim();
  }
  return "";
}

function sessionFailureDetail(error: unknown): string {
  const message = readMessage(error);
  if (message.length > 0 && message !== "invalid-response") {
    return message;
  }
  return "WalletConnect session was not approved";
}

function wrapSessionError(error: unknown): FireblocksWizardError {
  if (error instanceof FireblocksWizardError && error.detail) {
    return error;
  }
  return new FireblocksWizardError(
    "invalid-response",
    undefined,
    sessionFailureDetail(error),
  );
}

function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      resolve();
    };
    request.onblocked = () => {
      resolve();
    };
  });
}

async function clearWalletConnectStorage(): Promise<void> {
  if (typeof indexedDB === "undefined" || !indexedDB.databases) {
    return;
  }
  const databases = await indexedDB.databases();
  const names = databases
    .map((database) => database.name ?? "")
    .filter((name) => WALLET_CONNECT_DATABASE.test(name));
  await Promise.all(names.map((name) => deleteDatabase(name)));
}

async function sharedSignClient(projectId: string): Promise<SignClient> {
  const host = globalThis as typeof globalThis &
    Record<string, Promise<SignClient> | undefined>;
  const existing = host[SIGN_CLIENT_HOLDER];
  if (existing) {
    return existing;
  }
  const pending = clearWalletConnectStorage().then(() =>
    SignClient.init({
      projectId,
      metadata: sessionMetadata(),
    }),
  );
  host[SIGN_CLIENT_HOLDER] = pending;
  try {
    return await pending;
  } catch (error) {
    delete host[SIGN_CLIENT_HOLDER];
    throw error;
  }
}

function beginSilentSession(projectId: string): SilentStellarSession {
  const uriDeferred = defer<string>();
  const module = new CustodianSignModule();
  const approved = sharedSignClient(projectId)
    .then((client) => {
      module.attach(client, {
        open: (options) => {
          const walletConnectUri = options?.uri?.trim() ?? "";
          if (walletConnectUri.length > 0) {
            uriDeferred.resolve(walletConnectUri);
          }
        },
        close: () => undefined,
      });
      installCustodianSignModule(module);
      return openCustodianSigningSession(module, { fresh: true });
    })
    .then((result) => result.topic)
    .catch((error: unknown) => {
      const wrapped = wrapSessionError(error);
      uriDeferred.reject(wrapped);
      throw wrapped;
    })
    .finally(() => {
      releaseWalletConnectApproval();
    });
  void approved.catch(ignoreRejection);
  return {
    walletConnectUri: uriDeferred.promise,
    approved,
  };
}

export function startSilentStellarSession(
  projectId: string,
): SilentStellarSession {
  const holder = sessionHolder();
  if (holder.current) {
    return holder.current;
  }
  const session = beginSilentSession(projectId);
  holder.current = session;
  void session.approved.finally(() => {
    if (holder.current === session) {
      holder.current = undefined;
    }
  });
  return session;
}
