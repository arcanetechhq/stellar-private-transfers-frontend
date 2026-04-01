export interface StealthNonceEntry {
  stealthAddress: string;
  createdAt: number;
}

export interface StealthPersistedShape {
  byNonce: Record<string, StealthNonceEntry>;
  defaultNonce: string | undefined;
}

export interface StealthAddressState extends StealthPersistedShape {
  scalarByNonce: Record<string, string>;
}
