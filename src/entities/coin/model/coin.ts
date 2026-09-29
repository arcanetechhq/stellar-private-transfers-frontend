import type { CoinData } from "@/shared/lib/privacy-sdk/types.js";

export type DeadOnArrivalReason =
  | "commitment_mismatch"
  | "nullifier_consumed";

export type CoinStatus = "pending" | "finalized" | "spent" | "dead";

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
  deadReason?: DeadOnArrivalReason;
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
