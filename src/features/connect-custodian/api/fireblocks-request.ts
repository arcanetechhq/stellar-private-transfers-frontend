import { signFireblocksJwt } from "./fireblocks-jwt";
import { FireblocksWizardError } from "../model/fireblocks-wizard-error";

const API_PREFIX = "/v1";
const EMPTY_BODY = "";

export type FireblocksCall = {
  baseUrl: string;
  uriPath: string;
  apiKey: string;
  signingKey: CryptoKey;
};

export function fireblocksRequestUrl(baseUrl: string, uriPath: string): string {
  const origin = baseUrl.endsWith(API_PREFIX)
    ? baseUrl.slice(0, -API_PREFIX.length)
    : baseUrl;
  return `${origin}${uriPath}`;
}

async function fetchFireblocks(
  url: string,
  headers: { apiKey: string; token: string },
): Promise<Response> {
  try {
    return await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": headers.apiKey,
        Authorization: `Bearer ${headers.token}`,
      },
    });
  } catch {
    throw new FireblocksWizardError("browser-blocked");
  }
}

async function readFireblocksPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!response.ok) {
    throw new FireblocksWizardError("http", response.status);
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
  const token = await signFireblocksJwt({
    uriPath: input.uriPath,
    body: EMPTY_BODY,
    apiKey: input.apiKey,
    signingKey: input.signingKey,
  });
  const response = await fetchFireblocks(
    fireblocksRequestUrl(input.baseUrl, input.uriPath),
    { apiKey: input.apiKey, token },
  );
  return readFireblocksPayload(response);
}
