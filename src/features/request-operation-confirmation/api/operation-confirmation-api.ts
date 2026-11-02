export class OperationConfirmationRequestError extends Error {
  readonly blockingOperationId?: string;

  constructor(blockingOperationId?: string) {
    super("Operation Confirmation request failed");
    this.name = "OperationConfirmationRequestError";
    if (blockingOperationId) {
      this.blockingOperationId = blockingOperationId;
    }
  }
}

export type ConfirmationPeriodBody =
  | { kind: "all" | "week" | "month" | "year" }
  | { kind: "custom"; from: string; to: string };

export type ConfirmationPreviewRow = {
  id: string;
  date: string;
  type: string;
  amount: string;
  asset: string;
  transactionId: string;
  contract: string;
  chain: string;
  sender: string;
  recipient: string;
};

export type ConfirmationPreview = {
  rowCount: number;
  readable: boolean;
  rows?: ConfirmationPreviewRow[];
  blockingOperationId?: string;
};

export type PreviewNotice =
  | { kind: "none" }
  | { kind: "empty" }
  | { kind: "blocking"; operationId: string }
  | { kind: "rows"; rows: ConfirmationPreviewRow[] };

type JsonRecord = Record<string, unknown>;

async function postConfirmation(input: {
  url: string;
  body: unknown;
}): Promise<Response> {
  const response = await fetch(input.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input.body),
  });
  return response;
}

function assertOk(response: Response): void {
  if (!response.ok) {
    throw new OperationConfirmationRequestError();
  }
}

export async function openOperationConfirmationChallenge(input: {
  apiBaseUrl: string;
  applicationId: string;
  subject: string;
  period: ConfirmationPeriodBody;
}): Promise<{ challenge: string; expiresAt: string }> {
  const response = await postConfirmation({
    url: `${input.apiBaseUrl}/operation-confirmations/challenges`,
    body: {
      applicationId: input.applicationId,
      subject: input.subject,
      period: input.period,
    },
  });
  assertOk(response);
  const payload = (await response.json()) as JsonRecord;
  const challenge = payload.challenge;
  const expiresAt = payload.expiresAt;
  if (typeof challenge !== "string" || typeof expiresAt !== "string") {
    throw new OperationConfirmationRequestError();
  }
  return { challenge, expiresAt };
}

export async function previewOperationConfirmation(input: {
  apiBaseUrl: string;
  challenge: string;
  signature: string;
}): Promise<ConfirmationPreview> {
  const response = await postConfirmation({
    url: `${input.apiBaseUrl}/operation-confirmations/preview`,
    body: { challenge: input.challenge, signature: input.signature },
  });
  assertOk(response);
  return previewFromPayload((await response.json()) as JsonRecord);
}

export async function issueOperationConfirmation(input: {
  apiBaseUrl: string;
  challenge: string;
  signature: string;
}): Promise<Blob> {
  const response = await postConfirmation({
    url: `${input.apiBaseUrl}/operation-confirmations/issuances`,
    body: { challenge: input.challenge, signature: input.signature },
  });
  if (!response.ok) {
    throw new OperationConfirmationRequestError(
      await readBlockingOperationId(response),
    );
  }
  return response.blob();
}

export function canDownloadOperationConfirmation(
  preview: ConfirmationPreview | undefined,
  busy: boolean,
): boolean {
  return preview?.readable === true && !busy;
}

export function previewNotice(
  preview: ConfirmationPreview | undefined,
  blockingOperationId?: string,
): PreviewNotice {
  if (blockingOperationId) {
    return { kind: "blocking", operationId: blockingOperationId };
  }
  if (!preview) {
    return { kind: "none" };
  }
  if (!preview.readable && preview.blockingOperationId) {
    return { kind: "blocking", operationId: preview.blockingOperationId };
  }
  if (preview.rows && preview.rows.length > 0) {
    return { kind: "rows", rows: preview.rows };
  }
  if (preview.readable && preview.rowCount === 0) {
    return { kind: "empty" };
  }
  return { kind: "none" };
}

function previewFromPayload(payload: JsonRecord): ConfirmationPreview {
  const rows = previewRows(payload.rows);
  const blockingOperationId = text(payload.blockingOperationId);
  return {
    rowCount: typeof payload.rowCount === "number" ? payload.rowCount : 0,
    readable: payload.readable === true,
    ...(rows.length > 0 ? { rows } : {}),
    ...(blockingOperationId ? { blockingOperationId } : {}),
  };
}

function previewRows(value: unknown): ConfirmationPreviewRow[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    const row = previewRow(item);
    return row ? [row] : [];
  });
}

function previewRow(value: unknown): ConfirmationPreviewRow | undefined {
  if (!isRecord(value)) {
    return;
  }
  const row = {
    id: text(value.id),
    date: text(value.date),
    type: text(value.type),
    amount: text(value.amount),
    asset: text(value.asset),
    transactionId: text(value.transactionId),
    contract: text(value.contract),
    chain: text(value.chain),
    sender: text(value.sender),
    recipient: text(value.recipient),
  };
  if (Object.values(row).includes(undefined)) {
    return;
  }
  return row as ConfirmationPreviewRow;
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object";
}

function text(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return;
  }
}

async function readBlockingOperationId(
  response: Response,
): Promise<string | undefined> {
  const payload = await readJson(response);
  if (!isRecord(payload)) {
    return;
  }
  return text(payload.blockingOperationId);
}
