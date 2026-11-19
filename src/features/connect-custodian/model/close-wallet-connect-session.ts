import { WALLET_CONNECT_ID } from "@creit-tech/stellar-wallets-kit/modules/wallet-connect";
import {
  activeAddress,
  activeModules,
  wcSessionPaths,
} from "@creit-tech/stellar-wallets-kit/state";
import { isRecord } from "./record-value";

const SESSION_CLOSED_CODE = -1;
const CLOSING_TOPIC = "custodian-closing";

type SessionPath = { publicKey: string; topic: string };

type SignClientSession = {
  disconnect: (input: {
    topic: string;
    reason: { message: string; code: number };
  }) => Promise<void>;
  session?: {
    values?: unknown;
  };
};

function readTopic(value: unknown): string {
  if (!isRecord(value) || typeof value.topic !== "string") {
    return "";
  }
  return value.topic.trim();
}

function readSessionTopics(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }
  return values.map((item) => readTopic(item)).filter((topic) => topic.length > 0);
}

function readSignClient(): SignClientSession | undefined {
  const walletModule = activeModules.value.find(
    (item) => item.productId === WALLET_CONNECT_ID,
  );
  if (!isRecord(walletModule)) {
    return undefined;
  }
  const signClient = walletModule.signClient;
  if (!isRecord(signClient) || typeof signClient.disconnect !== "function") {
    return undefined;
  }
  return signClient as SignClientSession;
}

async function disconnectTopic(
  signClient: SignClientSession,
  topic: string,
): Promise<void> {
  try {
    await signClient.disconnect({
      topic,
      reason: { message: "Session closed", code: SESSION_CLOSED_CODE },
    });
  } catch {
    return;
  }
}

function pathsWithoutTopics(paths: SessionPath[], topics: string[]): SessionPath[] {
  const blocked = new Set([...topics, CLOSING_TOPIC]);
  return paths.filter((path) => !blocked.has(path.topic));
}

async function disconnectTopics(topics: string[]): Promise<void> {
  const unique = [
    ...new Set(topics.filter((topic) => topic.length > 0 && topic !== CLOSING_TOPIC)),
  ];
  const signClient = readSignClient();
  wcSessionPaths.value = pathsWithoutTopics(wcSessionPaths.value, unique);
  if (!signClient || unique.length === 0) {
    return;
  }
  wcSessionPaths.value = [
    ...wcSessionPaths.value,
    { publicKey: CLOSING_TOPIC, topic: CLOSING_TOPIC },
  ];
  try {
    for (const topic of unique) {
      await disconnectTopic(signClient, topic);
    }
  } finally {
    wcSessionPaths.value = wcSessionPaths.value.filter(
      (path) => path.topic !== CLOSING_TOPIC,
    );
  }
}

function clearActiveAddress(address: string): void {
  if (activeAddress.value === address) {
    activeAddress.value = undefined;
  }
}

export async function closeCustodianWalletConnectTopic(topic: string): Promise<void> {
  const trimmed = topic.trim();
  if (trimmed.length === 0) {
    return;
  }
  wcSessionPaths.value = wcSessionPaths.value.filter((path) => path.topic !== trimmed);
  await disconnectTopics([trimmed]);
}

export async function closeCustodianWalletConnectSession(
  address: string,
): Promise<void> {
  const trimmed = address.trim();
  if (trimmed.length === 0) {
    return;
  }
  const rememberedTopics = wcSessionPaths.value
    .filter((path) => path.publicKey === trimmed)
    .map((path) => path.topic);
  wcSessionPaths.value = wcSessionPaths.value.filter(
    (path) => path.publicKey !== trimmed,
  );
  clearActiveAddress(trimmed);
  await disconnectTopics(rememberedTopics);
}

export async function closeAllCustodianWalletConnectSessions(
  address: string | undefined,
): Promise<void> {
  const signClient = readSignClient();
  const liveTopics = signClient
    ? readSessionTopics(signClient.session?.values)
    : [];
  wcSessionPaths.value = [];
  clearActiveAddress(address?.trim() ?? "");
  await disconnectTopics(liveTopics);
}
