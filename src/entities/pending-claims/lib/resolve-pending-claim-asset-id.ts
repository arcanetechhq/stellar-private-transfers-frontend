import type { AssetDto } from "@/entities/asset";
import { assetLegToTokenAddress } from "@/shared/lib/privacy-sdk/index.js";
import { normalizeSorobanContractId } from "@/shared/stellar/normalize-soroban-contract-id.js";
import type { PendingClaimItem } from "../model/pending-claim-types.js";

function hexToDecimal(hex: string): string {
  const clean = hex.trim().replace(/^0x/u, "");
  return BigInt(`0x${clean || "0"}`).toString();
}

function readPendingClaimTokenAddress(claim: PendingClaimItem): string {
  const assetHi = hexToDecimal(claim.assetHiHex);
  const assetLo = hexToDecimal(claim.assetLoHex);
  return assetLegToTokenAddress(assetHi, assetLo);
}

function normalizeTokenContractForMatch(tokenContract: string): string {
  try {
    return normalizeSorobanContractId(tokenContract);
  } catch {
    return tokenContract.trim();
  }
}

export function resolveAssetIdFromTokenAddress(
  tokenAddress: string,
  assets: AssetDto[] | undefined,
): string | undefined {
  const normalized = normalizeTokenContractForMatch(tokenAddress);
  const matched = assets?.find((asset) => {
    const clientContract = asset.clientContract?.trim();
    if (!clientContract) {
      return false;
    }
    return normalizeTokenContractForMatch(clientContract) === normalized;
  });
  return matched?.assetId;
}

export function resolvePendingClaimAssetId(
  claim: PendingClaimItem,
  assets: AssetDto[] | undefined,
): string | undefined {
  return resolveAssetIdFromTokenAddress(
    readPendingClaimTokenAddress(claim),
    assets,
  );
}
