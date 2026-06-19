export interface PrivateAddressNonceEntry {
  privateAddress: string;
  createdAt: number;
}

export type PrivateAddressPersistedNonceEntry = PrivateAddressNonceEntry & {
  recipientScalarHex?: string;
};

export interface PrivateAddressPersistedShape {
  byNonce: Record<string, PrivateAddressPersistedNonceEntry>;
  defaultNonce: string | undefined;
}

export interface PrivateAddressState extends PrivateAddressPersistedShape {
  scalarByNonce: Record<string, string>;
}
