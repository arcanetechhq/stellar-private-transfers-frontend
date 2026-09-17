import type { ProtocolFeeQuoteRequest } from "./quote-request.js";

export type ProtocolFeeQuote = {
  requiredFee: string;
  feeAsset: string;
  feeCollectorPrivateAddress: string;
  feeRate: string;
};

function requireQuoteString(raw: unknown, field: string): string {
  const text = `${raw ?? ""}`.trim();
  if (!text) {
    throw new Error(`Fee Quote is missing ${field}.`);
  }
  return text;
}

function parseRequiredFee(raw: unknown): string {
  const text = requireQuoteString(raw, "Required Fee");
  if (!/^\d+$/u.test(text)) {
    throw new Error("Fee Quote Required Fee must be an integer minor-unit string.");
  }
  return text;
}

export async function quoteProtocolFee(input: {
  apiBaseUrl: string;
  request: ProtocolFeeQuoteRequest;
}): Promise<ProtocolFeeQuote> {
  const response = await fetch(`${input.apiBaseUrl}/kyt/fees/quote`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input.request),
  });
  const payload = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(`Fee Quote failed: ${JSON.stringify(payload)}`);
  }
  return {
    requiredFee: parseRequiredFee(payload.requiredFee),
    feeAsset: requireQuoteString(payload.feeAsset, "Fee Asset"),
    feeCollectorPrivateAddress: requireQuoteString(
      payload.feeCollectorPrivateAddress,
      "Fee Collector Private Address",
    ),
    feeRate: requireQuoteString(payload.feeRate, "Fee Rate"),
  };
}
