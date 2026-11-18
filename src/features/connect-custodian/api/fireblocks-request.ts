import { signFireblocksJwt } from "./fireblocks-jwt";
import { FireblocksWizardError } from "../model/fireblocks-wizard-error";
import { isRecord } from "../model/record-value";

const API_PREFIX = "/v1";
const EMPTY_BODY = "";
const GET_METHOD = "GET";

export type FireblocksMethod = "GET" | "POST" | "PUT";

export type FireblocksCall = {
  baseUrl: string;
  uriPath: string;
  apiKey: string;
  signingKey: CryptoKey;
  method?: FireblocksMethod;
  body?: string;
};

export function fireblocksRequestUrl(baseUrl: string, uriPath: string): string {
  const origin = baseUrl.endsWith(API_PREFIX)
    ? baseUrl.slice(0, -API_PREFIX.length)
    : baseUrl;
  return `${origin}${uriPath}`;
}

function readErrorDetail(text: string): string | undefined {
  try {
    const payload = JSON.parse(text) as unknown;
    if (!isRecord(payload) || typeof payload.message !== "string") {
      return undefined;
    }
    const detail = payload.message.trim();
    return detail.length > 0 ? detail : undefined;
  } catch {
    return undefined;
  }
}

async function fetchFireblocks(
  url: string,
  request: { apiKey: string; token: string; method: FireblocksMethod; body: string },
): Promise<Response> {
  try {
    return await fetch(url, {
      method: request.method,
      headers: {
        "X-API-Key": request.apiKey,
        Authorization: `Bearer ${request.token}`,
        ...(request.body.length > 0
          ? { "Content-Type": "application/json" }
          : {}),
      },
      ...(request.body.length > 0 ? { body: request.body } : {}),
    });
  } catch {
    throw new FireblocksWizardError("browser-blocked");
  }
}

async function readFireblocksPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!response.ok) {
    const detail = readErrorDetail(text);
    throw detail === undefined
      ? new FireblocksWizardError("http", response.status)
      : new FireblocksWizardError("http", response.status, detail);
  }
  if (text.length === 0) {
    return {};
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new FireblocksWizardError("invalid-response");
  }
}

export async function callFireblocks(input: FireblocksCall): Promise<unknown> {
  const body = input.body ?? EMPTY_BODY;
  const method = input.method ?? GET_METHOD;
  const token = await signFireblocksJwt({
    uriPath: input.uriPath,
    body,
    apiKey: input.apiKey,
    signingKey: input.signingKey,
  });
  const response = await fetchFireblocks(
    fireblocksRequestUrl(input.baseUrl, input.uriPath),
    { apiKey: input.apiKey, token, method, body },
  );
  return readFireblocksPayload(response);
}
