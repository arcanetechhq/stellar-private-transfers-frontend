import {
  FIREBLOCKS_ENVIRONMENTS,
  fireblocksEnvironmentFor,
  type FireblocksEnvironmentId,
} from "./fireblocks-environment";
import { isRecord } from "./record-value";

const SESSION_STORAGE_KEY = "arcane.fireblocks-custodian.session";

export type FireblocksSession = {
  apiKey: string;
  environmentId: FireblocksEnvironmentId;
  baseUrl: string;
};

function parseSession(value: unknown): FireblocksSession | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const environment = FIREBLOCKS_ENVIRONMENTS.find(
    (item) => item.id === value.environmentId,
  );
  if (!environment) {
    return undefined;
  }
  if (typeof value.apiKey !== "string" || value.apiKey.trim().length === 0) {
    return undefined;
  }
  if (value.baseUrl !== environment.baseUrl) {
    return undefined;
  }
  return {
    apiKey: value.apiKey.trim(),
    environmentId: environment.id,
    baseUrl: environment.baseUrl,
  };
}

export function readFireblocksSession(): FireblocksSession | undefined {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  if (raw.length === 0) {
    return undefined;
  }
  try {
    return parseSession(JSON.parse(raw) as unknown);
  } catch {
    return undefined;
  }
}

export function saveFireblocksSession(session: FireblocksSession): void {
  const environment = fireblocksEnvironmentFor(session.environmentId);
  const stored: FireblocksSession = {
    apiKey: session.apiKey,
    environmentId: environment.id,
    baseUrl: environment.baseUrl,
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stored));
}
