export interface StealthNonceEntry {
  stealthAddress: string;
  createdAt: number;
}

export type StealthPersistedNonceEntry = StealthNonceEntry & {
  recipientScalarHex?: string;
};

export interface StealthPersistedShape {
  byNonce: Record<string, StealthPersistedNonceEntry>;
  defaultNonce: string | undefined;
}

export interface StealthAddressState extends StealthPersistedShape {
  scalarByNonce: Record<string, string>;
}
