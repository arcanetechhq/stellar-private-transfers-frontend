import { isRecord } from "./record-value";

const SESSION_STORAGE_KEY = "arcane.fireblocks-custodian.session";

export type FireblocksSession = {
  apiKey: string;
  pemAccepted: boolean;
};

function parseSession(value: unknown): FireblocksSession | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  if (typeof value.apiKey !== "string" || value.apiKey.trim().length === 0) {
    return undefined;
  }
  return {
    apiKey: value.apiKey.trim(),
    pemAccepted: value.pemAccepted === true,
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
  const stored: FireblocksSession = {
    apiKey: session.apiKey.trim(),
    pemAccepted: session.pemAccepted,
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stored));
}
