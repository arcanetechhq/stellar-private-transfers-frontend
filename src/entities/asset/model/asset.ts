import type { AssetDto } from "../api/asset-api";

export type TrustlineStatus = "native" | "loading" | "exists" | "missing";

export interface AssetWithTrustline extends AssetDto {
  trustlineStatus: TrustlineStatus;
  balance: string | undefined;
}
