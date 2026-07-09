import type { AppDispatch } from "@/store";
import {
  addAssetTrustlineThunk,
  type AssetWithTrustline,
} from "@/entities/asset";
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

async function fetchDestinationBalances(
  destinationAddress: string,
): Promise<Awaited<ReturnType<typeof fetchAccountBalances>>> {
  try {
    return await fetchAccountBalances(
      horizonServer,
      destinationAddress.trim(),
    );
  } catch {
    throw new Error("Destination account was not found on Stellar");
  }
}

async function ensureOwnWalletTrustline(parameters: {
  dispatch: AppDispatch;
  asset: AssetWithTrustline;
  publicKey: string;
}): Promise<void> {
  const balances = await fetchDestinationBalances(parameters.publicKey);
  if (destinationHasTrustline({ asset: parameters.asset, balances })) {
    return;
  }
  const issuerAddress = parameters.asset.issuerAddress?.trim();
  if (!issuerAddress) {
    throw new Error(`Missing issuer for asset ${parameters.asset.assetId}.`);
  }
  await parameters.dispatch(
    addAssetTrustlineThunk({
      assetId: parameters.asset.assetId,
      assetCode: parameters.asset.assetId.toUpperCase(),
      issuerAddress,
      publicKey: parameters.publicKey,
    }),
  ).unwrap();
}

async function assertThirdPartyDestinationCanReceiveAsset(parameters: {
  asset: AssetWithTrustline;
  destinationAddress: string;
}): Promise<void> {
  const balances = await fetchDestinationBalances(parameters.destinationAddress);
  if (!destinationHasTrustline({ asset: parameters.asset, balances })) {
    throw new Error(
      `Destination account must add a ${parameters.asset.assetId.toUpperCase()} trustline before withdrawal`,
    );
  }
}

export async function ensureWithdrawalDestinationCanReceiveAsset(parameters: {
  dispatch: AppDispatch;
  asset: AssetWithTrustline;
  destinationAddress: string;
  connectedPublicKey: string;
}): Promise<void> {
  const issuer = parameters.asset.issuerAddress?.trim();
  if (!issuer) {
    return;
  }
  const destinationTrim = parameters.destinationAddress.trim();
  const connectedTrim = parameters.connectedPublicKey.trim();
  if (
    destinationTrim !== "" &&
    connectedTrim !== "" &&
    destinationTrim === connectedTrim
  ) {
    await ensureOwnWalletTrustline({
      dispatch: parameters.dispatch,
      asset: parameters.asset,
      publicKey: connectedTrim,
    });
    return;
  }
  await assertThirdPartyDestinationCanReceiveAsset({
    asset: parameters.asset,
    destinationAddress: destinationTrim,
  });
}
