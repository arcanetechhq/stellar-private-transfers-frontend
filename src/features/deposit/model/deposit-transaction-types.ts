import type { AssetWithTrustline } from "@/entities/asset";

export interface DepositTransactionInput {
  asset: AssetWithTrustline;
  amountDisplay: number;
  privateAddress: string;
}

export interface DepositTransactionResult {
  txId: string;
  commitmentHex: string;
  assetId: string;
  poolContract: string;
  amountDisplay: number;
}
