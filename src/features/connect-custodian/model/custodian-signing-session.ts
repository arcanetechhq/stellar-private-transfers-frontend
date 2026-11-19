import { wcSessionPaths, selectedNetwork } from "@creit-tech/stellar-wallets-kit/state";
import { Networks } from "@creit-tech/stellar-wallets-kit/types";
import {
  WalletConnectAllowedMethods,
  WalletConnectModule,
  WalletConnectTargetChain,
} from "@creit-tech/stellar-wallets-kit/modules/wallet-connect";
import { FireblocksWizardError } from "./fireblocks-wizard-error";

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

function sessionChains(
  module: WalletConnectModule,
): WalletConnectTargetChain[] {
  return module.wcParams.allowedChains ?? [WalletConnectTargetChain.TESTNET];
}

function accountKey(account: string): string {
  const parts = account.split(":");
  const key =
    parts.length >= CAIP_ACCOUNT_SEGMENTS ? (parts[2] ?? "") : account;
  return key.trim();
}

function rememberApprovedAccounts(session: ApprovedSession): string | undefined {
  const accounts = session.namespaces.stellar?.accounts ?? [];
  const keys = accounts
    .map((account) => accountKey(account))
    .filter((key) => key.length > 0);
  wcSessionPaths.value = [
    ...wcSessionPaths.value,
    ...keys.map((publicKey) => ({ publicKey, topic: session.topic })),
  ];
  return keys[0];
}

async function acceptSigningSession(
  module: WalletConnectModule,
  approval: () => Promise<ApprovedSession>,
): Promise<{ address: string; topic: string }> {
  try {
    const session = await approval();
    const address = rememberApprovedAccounts(session);
    module.modal.close();
    if (!address) {
      throw new FireblocksWizardError("invalid-response");
    }
    return { address, topic: session.topic };
  } catch (error) {
    module.modal.close();
    throw error;
  }
}

export async function openCustodianSigningSession(
  module: WalletConnectModule,
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
