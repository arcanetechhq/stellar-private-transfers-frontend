export type EscrowTagChallenge = {
  stellarAddress: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
  challengeMac: string;
  message: string;
};

function requireText(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`Invalid escrow tag challenge ${label}`);
  }
  return value;
}

function parseChallenge(payload: unknown): EscrowTagChallenge {
  if (typeof payload !== "object" || payload === null) {
    throw new TypeError("Invalid escrow tag challenge");
  }
  const record = payload as Record<string, unknown>;
  return {
    stellarAddress: requireText(record.stellarAddress, "stellarAddress"),
    nonce: requireText(record.nonce, "nonce"),
    issuedAt: requireText(record.issuedAt, "issuedAt"),
    expiresAt: requireText(record.expiresAt, "expiresAt"),
    challengeMac: requireText(record.challengeMac, "challengeMac"),
    message: requireText(record.message, "message"),
  };
}

export async function requestEscrowTagChallenge(input: {
  storageOrigin: string;
  stellarAddress: string;
  fetchImpl?: typeof fetch;
}): Promise<EscrowTagChallenge> {
  const fetchImpl = input.fetchImpl ?? globalThis.fetch;
  const response = await fetchImpl(
    `${input.storageOrigin}/api/escrow-tags/challenge`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stellarAddress: input.stellarAddress }),
    },
  );
  if (!response.ok) {
    throw new Error(`Escrow tag challenge failed: ${response.status}`);
  }
  return parseChallenge(await response.json());
}
