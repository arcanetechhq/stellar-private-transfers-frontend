import type { CoinData } from "@/shared/lib/privacy-sdk/types.js";

export type CoinStatus = "pending" | "finalized" | "spent";

export interface CoinWithMetadata {
  commitmentHex: string;
  coin: CoinData;
  depositScalarHex?: string;
  precommitementHex?: string;
  privateAddress: string;
  assetId: string;
  poolContract: string;
  amountDisplay: number;
  status: CoinStatus;
  txId?: string;
}

export interface CoinEntry {
  commitmentHex: string;
  coin: CoinData;
  depositScalarHex?: string;
  precommitementHex?: string;
}

export { type CoinData } from "@/shared/lib/privacy-sdk/types.js";

export interface AggregatedPrivateAssetRow {
  assetId: string;
  poolContract: string;
  totalAmountDisplay: number;
}
