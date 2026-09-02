import type { EscrowTagChallenge } from "./request-escrow-tag-challenge.js";

export type IssuedBlindedRecipientTag = {
  epoch: number;
  tag: string;
};

function parseIssuedTags(payload: unknown): IssuedBlindedRecipientTag[] {
  if (typeof payload !== "object" || payload === null) {
    throw new TypeError("Invalid escrow tag issue response");
  }
  const tags = (payload as { tags?: unknown }).tags;
  if (!Array.isArray(tags)) {
    throw new TypeError("Invalid escrow tag issue response");
  }
  return tags.map((entry) => parseIssuedTag(entry));
}

function parseIssuedTag(entry: unknown): IssuedBlindedRecipientTag {
  if (typeof entry !== "object" || entry === null) {
    throw new TypeError("Invalid issued blinded recipient tag");
  }
  const record = entry as Record<string, unknown>;
  if (typeof record.epoch !== "number" || typeof record.tag !== "string") {
    throw new TypeError("Invalid issued blinded recipient tag");
  }
  return { epoch: record.epoch, tag: record.tag };
}

export async function issueEscrowTags(input: {
  storageOrigin: string;
  challenge: EscrowTagChallenge;
  signature: string;
  signerPublicKey: string;
  fetchImpl?: typeof fetch;
}): Promise<IssuedBlindedRecipientTag[]> {
  const fetchImpl = input.fetchImpl ?? globalThis.fetch;
  const response = await fetchImpl(
    `${input.storageOrigin}/api/escrow-tags/issue`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        stellarAddress: input.challenge.stellarAddress,
        nonce: input.challenge.nonce,
        issuedAt: input.challenge.issuedAt,
        expiresAt: input.challenge.expiresAt,
        challengeMac: input.challenge.challengeMac,
        signature: input.signature,
        signerPublicKey: input.signerPublicKey,
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`Escrow tag issue failed: ${response.status}`);
  }
  return parseIssuedTags(await response.json());
}
