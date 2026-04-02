import React, { useEffect } from "react";
import { TokenIcon } from "@/shared/ui/token-icon";
import { Skeleton } from "@/shared/ui/skeleton";
import type { AssetWithTrustline } from "@/entities/asset";
import {
  FaucetButton,
  useFaucetForAsset,
  useFaucetForNative,
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
  onMintSuccess?: () => void;
}

function AssetFaucetButton({
  asset,
  walletPublicKey,
  onMintSuccess,
}: {
  asset: AssetWithTrustline;
  walletPublicKey: string | undefined;
  onMintSuccess?: () => void;
}) {
  const isNative = asset.trustlineStatus === "native";
  const nativeFaucet = useFaucetForNative();
  const assetFaucet = useFaucetForAsset(asset.assetId);

  const faucet = isNative ? nativeFaucet : assetFaucet;

  useEffect(() => {
    if (faucet.status === "success") {
      onMintSuccess?.();
    }
  }, [faucet.status, onMintSuccess]);

  return (
    <FaucetButton
      address={walletPublicKey ?? ""}
      status={faucet.status}
      onMint={faucet.mint}
    />
  );
}

export function AssetTableRow({
  asset,
  pendingAssetId,
  showFaucet,
  walletPublicKey,
  onAddTrustline,
  onMintSuccess,
}: AssetTableRowProperties) {
  const isSubmitting =
    pendingAssetId !== undefined && pendingAssetId === asset.assetId;

  const isNative = asset.trustlineStatus === "native";
  const canFaucet =
    showFaucet &&
    (isNative ||
      (asset.mintable && asset.trustlineStatus === "exists"));

  function renderBalance() {
    if (asset.trustlineStatus === "loading") {
      return <Skeleton className="h-5 w-20" />;
    }
    if (asset.balance !== undefined && asset.balance !== null) {
      return (
        <>
          <p className="text-[15px] font-semibold leading-[20px] text-[var(--foreground-primary)]">
            {formatBalance(asset.balance)}
          </p>
          <p className="text-[13px] leading-[18px] text-[var(--foreground-secondary)]">
            {asset.assetId.toUpperCase()}
          </p>
        </>
      );
    }
    return (
      <p className="text-[15px] font-semibold leading-[20px] text-[var(--foreground-tertiary)]">
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
            <p className="mb-0.5 text-[15px] font-semibold leading-[20px] text-[var(--foreground-primary)]">
              {asset.assetId.toUpperCase()}
            </p>
            <p className="text-[13px] leading-[18px] text-[var(--foreground-secondary)]">
              {asset.name}
            </p>
          </div>
        </div>

        <div className="col-span-4">{renderBalance()}</div>

        <div className="col-span-3 flex items-center justify-end gap-2">
          {canFaucet && (
            <AssetFaucetButton
              asset={asset}
              walletPublicKey={walletPublicKey}
              onMintSuccess={onMintSuccess}
            />
          )}
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
