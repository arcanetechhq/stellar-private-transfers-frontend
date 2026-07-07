import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { useGetAssetsQuery, type AssetDto } from "@/entities/asset";
import { selectWalletPublicKey } from "@/entities/wallet";
import {
  useSdkPendingClaimsList,
  type PendingClaimItem,
} from "@/entities/pending-claims";
import { tokenAddressToAssetLeg } from "@/shared/lib/privacy-sdk/index.js";
import { usePrivacySdkClient } from "@/app/providers/privacy-sdk-provider";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import { useWalletPrivateAddress } from "@/features/register-private-address";
import { runPendingClaim } from "../lib/run-pending-claim";
import { PendingClaimCard } from "./pending-claim-card";

function hexToDecimal(hex: string): string {
  const clean = hex.trim().replace(/^0x/u, "");
  return BigInt(`0x${clean || "0"}`).toString();
}

function assetMatchesClaim(asset: AssetDto, claim: PendingClaimItem): boolean {
  return assetMatchesLegs(asset, {
    assetHiHex: claim.assetHiHex,
    assetLoHex: claim.assetLoHex,
  });
}

function assetMatchesLegs(
  asset: AssetDto,
  legs: { assetHiHex: string; assetLoHex: string },
): boolean {
  if (!asset.clientContract) {
    return false;
  }
  try {
    const [assetHi, assetLo] = tokenAddressToAssetLeg(asset.clientContract);
    return (
      assetHi === hexToDecimal(legs.assetHiHex) &&
      assetLo === hexToDecimal(legs.assetLoHex)
    );
  } catch {
    return false;
  }
}

function useClaimAssetMap(claims: PendingClaimItem[]): Map<number, AssetDto> {
  const { data: assets } = useGetAssetsQuery();
  return useMemo(() => {
    const map = new Map<number, AssetDto>();
    for (const claim of claims) {
      const asset = assets?.find((candidate) =>
        assetMatchesClaim(candidate, claim),
      );
      if (asset) {
        map.set(claim.id, asset);
      }
    }
    return map;
  }, [assets, claims]);
}

function PendingClaimsContent(parameters: {
  translate: (key: string) => string;
  isLoading: boolean;
  isError: boolean;
  hasData: boolean;
  claimError: string | undefined;
  visibleClaims: PendingClaimItem[];
  assetByClaimId: Map<number, AssetDto>;
  claimingId: number | undefined;
  onClaim: (claim: PendingClaimItem) => Promise<void>;
}) {
  const {
    translate,
    isLoading,
    isError,
    hasData,
    claimError,
    visibleClaims,
    assetByClaimId,
    claimingId,
    onClaim,
  } = parameters;
  return (
    <div className="min-h-full bg-[var(--background)] p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-2xl font-semibold text-[var(--foreground-primary)]">
          {translate("title")}
        </h1>
        <p className="mb-6 text-sm text-[var(--foreground-secondary)]">
          {translate("subtitle")}
        </p>
        {isLoading ? (
          <p className="text-sm text-[var(--foreground-secondary)]">
            {translate("loading")}
          </p>
        ) : undefined}
        {isError ? (
          <p className="text-sm text-[var(--error)]">{translate("loadError")}</p>
        ) : undefined}
        {claimError ? (
          <p className="mb-4 rounded-xl border border-[var(--error)] bg-[var(--surface-card)] p-4 text-sm text-[var(--error)]">
            {claimError}
          </p>
        ) : undefined}
        {hasData && visibleClaims.length === 0 ? (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)] p-6 text-sm text-[var(--foreground-secondary)]">
            {translate("empty")}
          </p>
        ) : undefined}
        {visibleClaims.length > 0 ? (
          <ul className="space-y-3">
            {visibleClaims.map((claim) => (
              <PendingClaimCard
                key={claim.id}
                claim={claim}
                asset={assetByClaimId.get(claim.id)}
                claimingId={claimingId}
                onClaim={onClaim}
                translate={translate}
              />
            ))}
          </ul>
        ) : undefined}
      </div>
    </div>
  );
}

function usePendingClaimsPageModel(translate: (key: string) => string) {
  const dispatch = useAppDispatch();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { client: privacyClient } = usePrivacySdkClient();
  const { ensureWalletPrivateAddress, refreshRegistryStatus } =
    useWalletPrivateAddress();
  const [claimingId, setClaimingId] = useState<number | undefined>();
  const [claimedIds, setClaimedIds] = useState<Set<number>>(() => new Set());
  const [claimError, setClaimError] = useState<string | undefined>();
  const { data: assets } = useGetAssetsQuery();
  const resolveClaimAsset = useMemo(
    () => (tokenAddress: string) =>
      assets?.find((asset) => asset.clientContract === tokenAddress)?.assetId,
    [assets],
  );
  const {
    claims,
    isLoading,
    isError,
    reload,
  } = useSdkPendingClaimsList(publicKey ?? undefined, resolveClaimAsset);
  const visibleClaims = useMemo(
    () => claims.filter((claim) => !claimedIds.has(claim.id)),
    [claims, claimedIds],
  );
  const assetByClaimId = useClaimAssetMap(visibleClaims);

  async function handleClaim(claim: PendingClaimItem) {
    const trimmedPublicKey = publicKey?.trim();
    const asset = assetByClaimId.get(claim.id);
    if (!trimmedPublicKey || !asset || claimingId !== undefined) {
      return;
    }
    setClaimError(undefined);
    setClaimingId(claim.id);
    try {
      const permanentPrivateAddress = await ensureWalletPrivateAddress();
      const { networkPassphrase, sorobanRpcUrl } =
        getDefaultStellarNetworkConfig();
      await runPendingClaim({
        dispatch,
        claim,
        asset,
        walletPublicKey: trimmedPublicKey,
        permanentPrivateAddress,
        networkPassphrase,
        sorobanRpcUrl,
      });
      await refreshRegistryStatus();
      if (privacyClient) {
        await privacyClient.removePendingClaims([String(claim.id)]);
      }
      setClaimedIds((current) => new Set(current).add(claim.id));
      await reload();
    } catch (error: unknown) {
      setClaimError(
        error instanceof Error ? error.message : translate("claimError"),
      );
    } finally {
      setClaimingId(undefined);
    }
  }
  return {
    publicKey,
    hasData: !isLoading,
    isLoading,
    isError,
    visibleClaims,
    assetByClaimId,
    claimingId,
    claimError,
    handleClaim,
  };
}

export function PendingClaimsPage() {
  const { t: translate } = useTranslation("pendingClaims");
  const model = usePendingClaimsPageModel(translate);

  if (!model.publicKey) {
    return (
      <div className="p-8">
        <p className="text-sm text-[var(--foreground-secondary)]">
          {translate("connectWalletPrompt")}
        </p>
      </div>
    );
  }

  return (
    <React.Fragment>
      <PendingClaimsContent
        translate={translate}
        isLoading={model.isLoading}
        isError={model.isError}
        hasData={model.hasData}
        claimError={model.claimError}
        visibleClaims={model.visibleClaims}
        assetByClaimId={model.assetByClaimId}
        claimingId={model.claimingId}
        onClaim={model.handleClaim}
      />
    </React.Fragment>
  );
}
