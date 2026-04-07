import React from "react";
import { Loader2 } from "lucide-react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { AssetWithTrustline } from "@/entities/asset";
import {
  faucetClaimAmountLabel,
  isAssetFaucetClaimable,
  selectIsClaimLoadingForAsset,
  selectTrustlinePendingAssetId,
} from "@/entities/asset";
import { addAssetTrustlineThunk } from "@/features/add-asset-trustline";
import {
  claimIssuedAssetThunk,
  claimNativeFaucetThunk,
} from "@/features/faucet";
import { Button } from "@/shared/ui/button";
import { TokenIcon } from "@/shared/ui/token-icon";

function HeaderFaucetRowTrustlineLoading() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled
      className="min-w-[7.5rem] shrink-0"
    >
      <Loader2 className="size-3.5 animate-spin" />
    </Button>
  );
}

interface HeaderFaucetRowMissingTrustlineProperties {
  asset: AssetWithTrustline;
  symbol: string;
  walletPublicKey: string | undefined;
  isSubmittingTrustline: boolean;
  translate: TFunction<"assets">;
}

function HeaderFaucetRowMissingTrustline({
  asset,
  symbol,
  walletPublicKey,
  isSubmittingTrustline,
  translate,
}: HeaderFaucetRowMissingTrustlineProperties) {
  const dispatch = useAppDispatch();
  const issuerAddress = asset.issuerAddress ?? undefined;

  return (
    <Button
      type="button"
      variant="default"
      size="sm"
      disabled={isSubmittingTrustline || !walletPublicKey || !issuerAddress}
      className="min-w-[7.5rem] shrink-0"
      onClick={() => {
        if (!walletPublicKey || !issuerAddress) {
          return;
        }
        void dispatch(
          addAssetTrustlineThunk({
            assetId: asset.assetId,
            assetCode: symbol,
            issuerAddress,
            publicKey: walletPublicKey,
          }),
        );
      }}
    >
      {isSubmittingTrustline ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        translate("trustline.add")
      )}
    </Button>
  );
}

interface HeaderFaucetRowClaimProperties {
  asset: AssetWithTrustline;
  symbol: string;
  claimAmount: string;
  walletPublicKey: string | undefined;
  isClaimLoading: boolean;
  translate: TFunction<"assets">;
}

function HeaderFaucetRowClaim({
  asset,
  symbol,
  claimAmount,
  walletPublicKey,
  isClaimLoading,
  translate,
}: HeaderFaucetRowClaimProperties) {
  const dispatch = useAppDispatch();
  const isNative = asset.trustlineStatus === "native";

  return (
    <Button
      type="button"
      variant="default"
      size="sm"
      disabled={isClaimLoading || !walletPublicKey}
      className="min-w-[7.5rem] max-w-[11rem] shrink-0 truncate"
      onClick={() => {
        if (!walletPublicKey) {
          return;
        }
        if (isNative) {
          void dispatch(
            claimNativeFaucetThunk({
              publicKey: walletPublicKey,
              assetId: asset.assetId,
            }),
          );
        } else {
          void dispatch(
            claimIssuedAssetThunk({
              publicKey: walletPublicKey,
              assetId: asset.assetId,
            }),
          );
        }
      }}
    >
      {isClaimLoading ? (
        <Loader2 className="size-3.5 shrink-0 animate-spin" />
      ) : (
        translate("faucet.claimWithAmount", {
          amount: claimAmount,
          symbol,
        })
      )}
    </Button>
  );
}

interface HeaderFaucetAssetRowProperties {
  asset: AssetWithTrustline;
  walletPublicKey: string | undefined;
  showFaucet: boolean;
}

export function HeaderFaucetAssetRow({
  asset,
  walletPublicKey,
  showFaucet,
}: HeaderFaucetAssetRowProperties) {
  const { t: translate } = useTranslation("assets");
  const pendingTrustlineAssetId = useAppSelector(selectTrustlinePendingAssetId);
  const isClaimLoading = useAppSelector((state) =>
    selectIsClaimLoadingForAsset(state, asset.assetId),
  );

  const symbol = asset.assetId.toUpperCase();
  const isSubmittingTrustline =
    pendingTrustlineAssetId !== undefined &&
    pendingTrustlineAssetId === asset.assetId;
  const canClaim = isAssetFaucetClaimable(showFaucet, asset);
  const claimAmount = faucetClaimAmountLabel(asset);

  let action: React.ReactNode;
  if (asset.trustlineStatus === "loading") {
    action = <HeaderFaucetRowTrustlineLoading />;
  } else if (asset.trustlineStatus === "missing") {
    action = (
      <HeaderFaucetRowMissingTrustline
        asset={asset}
        symbol={symbol}
        walletPublicKey={walletPublicKey}
        isSubmittingTrustline={isSubmittingTrustline}
        translate={translate}
      />
    );
  } else if (canClaim) {
    action = (
      <HeaderFaucetRowClaim
        asset={asset}
        symbol={symbol}
        claimAmount={claimAmount}
        walletPublicKey={walletPublicKey}
        isClaimLoading={isClaimLoading}
        translate={translate}
      />
    );
  } else {
    action = (
      <span className="text-foreground-tertiary min-w-[7.5rem] text-right text-xs">
        —
      </span>
    );
  }

  return (
    <div className="border-border-soft flex items-center gap-3 border-b py-2 last:border-b-0">
      <TokenIcon ticker={symbol} logoUrl={asset.logoUrl} size="sm" />
      <span className="text-foreground-primary min-w-0 flex-1 truncate text-sm font-medium">
        {symbol}
      </span>
      {action}
    </div>
  );
}
