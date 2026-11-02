export class OperationConfirmationRequestError extends Error {
  constructor() {
    super("Operation Confirmation request failed");
    this.name = "OperationConfirmationRequestError";
  }
}

export type ConfirmationPeriodBody =
  | { kind: "all" | "week" | "month" | "year" }
  | { kind: "custom"; from: string; to: string };

export type ConfirmationPreview = {
  rowCount: number;
  readable: boolean;
};

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
  if (!response.ok) {
    throw new OperationConfirmationRequestError();
  }
  return response;
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
  const payload = (await response.json()) as JsonRecord;
  if (payload.rowCount !== 0 || payload.readable !== true) {
    return {
      rowCount: Number(payload.rowCount ?? 0),
      readable: payload.readable === true,
    };
  }
  return { rowCount: 0, readable: true };
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
  return response.blob();
}
