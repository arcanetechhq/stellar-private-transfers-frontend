import { wcSessionPaths, selectedNetwork } from "@creit-tech/stellar-wallets-kit/state";
import { Networks } from "@creit-tech/stellar-wallets-kit/types";
import {
  WalletConnectAllowedMethods,
  WalletConnectModule,
  WalletConnectTargetChain,
} from "@creit-tech/stellar-wallets-kit/modules/wallet-connect";
import { FireblocksWizardError } from "./fireblocks-wizard-error";
import { grantStellarSigningMethods } from "./custodian-message-signature";

const CAIP_ACCOUNT_SEGMENTS = 3;

type ApprovedSession = {
  topic: string;
  namespaces: {
    stellar?: {
      accounts?: string[];
    };
  };
};

function assertSupportedNetwork(): void {
  const network = selectedNetwork.value;
  if (network === Networks.PUBLIC || network === Networks.TESTNET) {
    return;
  }
  throw new FireblocksWizardError("invalid-response");
}

export type CustodianSigningModule = {
  signClient: WalletConnectModule["signClient"];
  wcParams: Pick<WalletConnectModule["wcParams"], "allowedChains">;
  modal: {
    open: (options?: { uri?: string }) => void;
    close: () => void;
  };
  runChecks: () => Promise<void>;
};

function sessionChains(
  module: CustodianSigningModule,
): WalletConnectTargetChain[] {
  return module.wcParams.allowedChains ?? [WalletConnectTargetChain.TESTNET];
}

function accountKey(account: string): string {
  const parts = account.split(":");
  const key =
    parts.length >= CAIP_ACCOUNT_SEGMENTS ? (parts[2] ?? "") : account;
  return key.trim();
}

function stellarAccounts(session: ApprovedSession): string[] {
  const namespaces = session.namespaces as Record<
    string,
    { accounts?: string[] } | undefined
  >;
  const accounts: string[] = [];
  for (const [key, value] of Object.entries(namespaces)) {
    if (key !== "stellar" && !key.startsWith("stellar:")) {
      continue;
    }
    for (const account of value?.accounts ?? []) {
      if (account.trim().length > 0) {
        accounts.push(account);
      }
    }
  }
  return accounts;
}

function rememberApprovedAccounts(session: ApprovedSession): string | undefined {
  const accounts = stellarAccounts(session);
  const keys = accounts
    .map((account) => accountKey(account))
    .filter((key) => key.length > 0);
  wcSessionPaths.value = [
    ...wcSessionPaths.value.filter((path) => !keys.includes(path.publicKey)),
    ...keys.map((publicKey) => ({ publicKey, topic: session.topic })),
  ];
  return keys[0];
}

async function acceptSigningSession(
  module: CustodianSigningModule,
  approval: () => Promise<ApprovedSession>,
): Promise<{ address: string; topic: string }> {
  try {
    const session = await approval();
    grantStellarSigningMethods(module.signClient, session.topic);
    const address = rememberApprovedAccounts(session);
    module.modal.close();
    if (!address) {
      throw new FireblocksWizardError(
        "invalid-response",
        undefined,
        "WalletConnect session did not include a Stellar address",
      );
    }
    return { address, topic: session.topic };
  } catch (error) {
    module.modal.close();
    throw error;
  }
}

let signingSession: Promise<{ address: string; topic: string }> | undefined;

function rememberedSession(): { address: string; topic: string } | undefined {
  const path = wcSessionPaths.value.at(-1);
  const address = path?.publicKey.trim() ?? "";
  const topic = path?.topic.trim() ?? "";
  if (address.length === 0 || topic.length === 0) {
    return undefined;
  }
  return { address, topic };
}

async function connectSigningSession(
  module: CustodianSigningModule,
): Promise<{ address: string; topic: string }> {
  await module.runChecks();
  assertSupportedNetwork();
  const chains = sessionChains(module);
  const pending = await module.signClient.connect({
    requiredNamespaces: {
      stellar: {
        methods: [
          WalletConnectAllowedMethods.SIGN,
          WalletConnectAllowedMethods.SIGN_MESSAGE,
        ],
        chains,
        events: [],
      },
    },
    optionalNamespaces: {
      stellar: {
        methods: [
          WalletConnectAllowedMethods.SIGN_AND_SUBMIT,
          WalletConnectAllowedMethods.SIGN_AUTH_ENTRY,
        ],
        chains,
        events: [],
      },
    },
  });
  if (pending.uri) {
    module.modal.open({ uri: pending.uri });
  }
  return acceptSigningSession(module, pending.approval);
}

export function openCustodianSigningSession(
  module: CustodianSigningModule,
  options?: { fresh?: boolean },
): Promise<{ address: string; topic: string }> {
  if (signingSession) {
    return signingSession;
  }
  if (!options?.fresh) {
    const existing = rememberedSession();
    if (existing) {
      return Promise.resolve(existing);
    }
  }
  const pending = connectSigningSession(module).finally(() => {
    signingSession = undefined;
  });
  signingSession = pending;
  return pending;
}

export function bindSessionToPaymentAddress(address: string): void {
  const trimmed = address.trim();
  const paths = wcSessionPaths.value;
  const topic = paths.at(-1)?.topic;
  if (!trimmed || !topic) {
    return;
  }
  const bound = paths.some(
    (path) => path.publicKey === trimmed && path.topic === topic,
  );
  if (bound) {
    return;
  }
  wcSessionPaths.value = [
    ...paths.filter((path) => path.publicKey !== trimmed),
    { publicKey: trimmed, topic },
  ];
}
