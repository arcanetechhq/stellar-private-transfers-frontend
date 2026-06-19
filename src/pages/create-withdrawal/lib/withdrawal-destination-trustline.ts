import type { AssetWithTrustline } from "@/entities/asset";
import { fetchAccountBalances } from "@/shared/stellar/fetch-account-balances";
import { horizonServer } from "@/shared/stellar/horizon-server";

function destinationHasTrustline(parameters: {
  asset: AssetWithTrustline;
  balances: Awaited<ReturnType<typeof fetchAccountBalances>>;
}): boolean {
  return parameters.balances.some(
    (entry) =>
      entry.assetCode?.toUpperCase() === parameters.asset.assetId.toUpperCase() &&
      entry.assetIssuer === parameters.asset.issuerAddress,
  );
}

export async function assertWithdrawalDestinationCanReceiveAsset(parameters: {
  asset: AssetWithTrustline;
  destinationAddress: string;
}): Promise<void> {
  const issuer = parameters.asset.issuerAddress?.trim();
  if (!issuer) {
    return;
  }
  let balances: Awaited<ReturnType<typeof fetchAccountBalances>>;
  try {
    balances = await fetchAccountBalances(
      horizonServer,
      parameters.destinationAddress.trim(),
    );
  } catch {
    throw new Error("Destination account was not found on Stellar");
  }
  if (!destinationHasTrustline({ asset: parameters.asset, balances })) {
    throw new Error(
      `Destination account must add a ${parameters.asset.assetId.toUpperCase()} trustline before withdrawal`,
    );
  }
}
