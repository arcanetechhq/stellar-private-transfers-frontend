export interface PendingClaimItem {
  id: number;
  ownerAddress: string;
  poolTxId: string;
  commitmentHex: string;
  nullifierHex: string;
  futureNullifierHashHex: string;
  noteValue: string;
  assetHiHex: string;
  assetLoHex: string;
  nullifierFieldHex: string;
  secretHex: string;
  tempPublicKeyXHex: string;
  tempPublicKeyYHex: string;
  encryptedRecoveryBase64: string;
  createdAtLedger: number;
  createdAt: string;
}

export interface PendingClaimsListResponse {
  data: PendingClaimItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
