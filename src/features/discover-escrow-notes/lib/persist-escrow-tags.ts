import type { IssuedBlindedRecipientTag } from "./issue-escrow-tags.js";

const STORAGE_KEY_PREFIX = "stellar-payment-escrow-tags-v1";

export type EscrowTagStore = {
  read: (signerAddress: string) => IssuedBlindedRecipientTag[] | undefined;
  write: (input: {
    signerAddress: string;
    tags: readonly IssuedBlindedRecipientTag[];
  }) => void;
};

export function escrowTagsStorageKey(signerAddress: string): string {
  return `${STORAGE_KEY_PREFIX}:${signerAddress.trim()}`;
}

function parseStoredTag(entry: unknown): IssuedBlindedRecipientTag | undefined {
  if (typeof entry !== "object" || entry === null) {
    return undefined;
  }
  const record = entry as Record<string, unknown>;
  if (typeof record.epoch !== "number" || typeof record.tag !== "string") {
    return undefined;
  }
  const tag = record.tag.trim();
  if (tag.length === 0) {
    return undefined;
  }
  return { epoch: record.epoch, tag };
}

export function parseStoredEscrowTags(
  raw: string | undefined,
): IssuedBlindedRecipientTag[] | undefined {
  if (!raw) {
    return undefined;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return undefined;
    }
    const tags = parsed
      .map((entry: unknown) => parseStoredTag(entry))
      .filter(
        (entry): entry is IssuedBlindedRecipientTag => entry !== undefined,
      );
    return tags.length > 0 ? tags : undefined;
  } catch {
    return undefined;
  }
}

export function createMemoryEscrowTagStore(
  initial?: ReadonlyMap<string, IssuedBlindedRecipientTag[]>,
): EscrowTagStore {
  const vault = new Map<string, IssuedBlindedRecipientTag[]>(
    initial ? [...initial.entries()] : [],
  );
  return {
    read(signerAddress) {
      const tags = vault.get(signerAddress.trim());
      return tags && tags.length > 0 ? tags : undefined;
    },
    write(input) {
      const address = input.signerAddress.trim();
      if (!address || input.tags.length === 0) {
        return;
      }
      vault.set(address, [...input.tags]);
    },
  };
}

export const localStorageEscrowTagStore: EscrowTagStore = {
  read(signerAddress) {
    const address = signerAddress.trim();
    if (!address) {
      return;
    }
    try {
      return parseStoredEscrowTags(
        localStorage.getItem(escrowTagsStorageKey(address)) ?? undefined,
      );
    } catch {
      return;
    }
  },
  write(input) {
    const address = input.signerAddress.trim();
    if (!address || input.tags.length === 0) {
      return;
    }
    try {
      localStorage.setItem(
        escrowTagsStorageKey(address),
        JSON.stringify(input.tags),
      );
    } catch {
      return;
    }
  },
};
