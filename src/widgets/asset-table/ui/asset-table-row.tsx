import React from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { TokenIcon } from "@/shared/ui/token-icon";
import { Skeleton } from "@/shared/ui/skeleton";
import type { AssetWithTrustline } from "@/entities/asset";
import {
  isAssetFaucetClaimable,
  selectIsClaimLoadingForAsset,
} from "@/entities/asset";
import {
  claimIssuedAssetThunk,
  claimNativeFaucetThunk,
  FaucetButton,
} from "@/features/faucet";
import { AssetActionButton } from "./asset-action-button";

interface TrustlineTarget {
  assetId: string;
  assetCode: string;
  issuerAddress: string;
}

function formatBalance(raw: string): string {
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return raw;
  if (value < 1) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 8,
    });
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface AssetTableRowProperties {
  asset: AssetWithTrustline;
  pendingAssetId: string | undefined;
  showFaucet: boolean;
  walletPublicKey: string | undefined;
  onAddTrustline: (target: TrustlineTarget) => void;
}

function AssetFaucetButton({
  asset,
  walletPublicKey,
  showFaucet,
}: {
  asset: AssetWithTrustline;
  walletPublicKey: string | undefined;
  showFaucet: boolean;
}) {
  const dispatch = useAppDispatch();
  const isClaimLoading = useAppSelector((state) =>
    selectIsClaimLoadingForAsset(state, asset.assetId),
  );
  const isNative = asset.trustlineStatus === "native";

  const status = isClaimLoading ? "loading" : "idle";

  function handleMint(address: string) {
    if (!walletPublicKey) {
      return Promise.resolve();
    }
    if (isNative) {
      return dispatch(
        claimNativeFaucetThunk({
          publicKey: address,
          assetId: asset.assetId,
        }),
      ).unwrap();
    }
    return dispatch(
      claimIssuedAssetThunk({
        publicKey: address,
        assetId: asset.assetId,
      }),
    ).unwrap();
  }

  if (!isAssetFaucetClaimable(showFaucet, asset)) {
    return;
  }

  return (
    <FaucetButton
      address={walletPublicKey ?? ""}
      status={status}
      onMint={handleMint}
    />
  );
}

export function AssetTableRow({
  asset,
  pendingAssetId,
  showFaucet,
  walletPublicKey,
  onAddTrustline,
}: AssetTableRowProperties) {
  const isSubmitting =
    pendingAssetId !== undefined && pendingAssetId === asset.assetId;

  function renderBalance() {
    if (asset.trustlineStatus === "loading") {
      return <Skeleton className="h-5 w-20" />;
    }
    if (asset.balance !== undefined && asset.balance !== null) {
      return (
        <React.Fragment>
          <p className="text-[15px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
            {formatBalance(asset.balance)}
          </p>
          <p className="text-[13px] leading-[18px] text-[var(--foreground-secondary)]">
            {asset.assetId.toUpperCase()}
          </p>
        </React.Fragment>
      );
    }
    return (
      <p className="text-[15px] leading-[20px] font-semibold text-[var(--foreground-tertiary)]">
        —
      </p>
    );
  }

  return (
    <div className="px-6 py-4 transition-colors hover:bg-[var(--surface-hover)]">
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-5 flex items-center gap-4">
          <TokenIcon
            ticker={asset.assetId.toUpperCase()}
            logoUrl={asset.logoUrl}
            size={44}
          />
          <div>
            <p className="mb-0.5 text-[15px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
              {asset.assetId.toUpperCase()}
            </p>
            <p className="text-[13px] leading-[18px] text-[var(--foreground-secondary)]">
              {asset.name}
            </p>
          </div>
        </div>

        <div className="col-span-4">{renderBalance()}</div>

        <div className="col-span-3 flex items-center justify-end gap-2">
          <AssetFaucetButton
            asset={asset}
            walletPublicKey={walletPublicKey}
            showFaucet={showFaucet}
          />
          <AssetActionButton
            assetId={asset.assetId}
            assetCode={asset.assetId.toUpperCase()}
            issuerAddress={asset.issuerAddress ?? undefined}
            trustlineStatus={asset.trustlineStatus}
            isSubmitting={isSubmitting}
            onAddTrustline={onAddTrustline}
          />
        </div>
      </div>
    </div>
  );
}
