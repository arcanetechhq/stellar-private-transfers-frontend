import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
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
  hasClaimedFaucetToday,
} from "@/features/faucet";

type FaucetRowState =
  | "idle"
  | "adding"
  | "ready"
  | "claiming"
  | "success"
  | "limited";

interface ResolveFaucetRowStateInput {
  asset: AssetWithTrustline;
  canClaim: boolean;
  isSubmittingTrustline: boolean;
  isClaimLoading: boolean;
  claimedToday: boolean;
}

function resolveFaucetRowState({
  asset,
  canClaim,
  isSubmittingTrustline,
  isClaimLoading,
  claimedToday,
}: ResolveFaucetRowStateInput): FaucetRowState {
  if (asset.trustlineStatus === "loading" || isSubmittingTrustline) {
    return "adding";
  }
  if (isClaimLoading) {
    return "claiming";
  }
  if (claimedToday && canClaim) {
    return "limited";
  }
  const addRequired = asset.trustlineStatus !== "native";
  if (
    canClaim &&
    addRequired &&
    asset.trustlineStatus === "exists"
  ) {
    return "ready";
  }
  return "idle";
}

function resolveActionLabel(
  rowState: FaucetRowState,
  canClaim: boolean,
  addRequired: boolean,
  translate: TFunction<"assets">,
): string {
  const isReady = rowState === "ready";
  const canShowClaim =
    isReady ||
    rowState === "limited" ||
    (!addRequired && rowState === "idle" && canClaim);
  if (canShowClaim) {
    return translate("faucet.claimLabel");
  }
  return translate("trustline.add");
}

function resolveStatusLabel(
  rowState: FaucetRowState,
  symbol: string,
  claimAmount: string,
  translate: TFunction<"assets">,
): string {
  switch (rowState) {
    case "adding": {
      return translate("faucet.statusPreparing");
    }
    case "ready": {
      return translate("faucet.statusReady", { amount: claimAmount, symbol });
    }
    case "claiming": {
      return translate("faucet.statusClaiming");
    }
    case "success": {
      return translate("faucet.statusClaimed", { amount: claimAmount, symbol });
    }
    case "limited": {
      return translate("faucet.statusLimited");
    }
    default: {
      return translate("faucet.statusAvailable", { amount: claimAmount, symbol });
    }
  }
}

function FaucetRowActionLoader({ label }: { label: string }) {
  return (
    <>
      <span className="activity-loader" aria-hidden="true">
        <span className="activity-loader__spinner" />
      </span>
      <span>{label}</span>
    </>
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
  const dispatch = useAppDispatch();
  const pendingTrustlineAssetId = useAppSelector(selectTrustlinePendingAssetId);
  const isClaimLoading = useAppSelector((state) =>
    selectIsClaimLoadingForAsset(state, asset.assetId),
  );
  const [claimedToday, setClaimedToday] = useState(false);

  useEffect(() => {
    setClaimedToday(
      walletPublicKey
        ? hasClaimedFaucetToday(walletPublicKey, asset.assetId)
        : false,
    );
  }, [walletPublicKey, asset.assetId]);

  const symbol = asset.assetId.toUpperCase();
  const isSubmittingTrustline =
    pendingTrustlineAssetId !== undefined &&
    pendingTrustlineAssetId === asset.assetId;
  const canClaim = isAssetFaucetClaimable(showFaucet, asset);
  const claimAmount = faucetClaimAmountLabel(asset);
  const addRequired = asset.trustlineStatus !== "native";
  const rowState = resolveFaucetRowState({
    asset,
    canClaim,
    isSubmittingTrustline,
    isClaimLoading,
    claimedToday,
  });
  const isBusy = rowState === "adding" || rowState === "claiming";
  const needsTrustline = asset.trustlineStatus === "missing";
  const showAction = needsTrustline || canClaim;
  const actionDisabled =
    isBusy || !walletPublicKey || rowState === "limited";

  const actionLabel = resolveActionLabel(
    rowState,
    canClaim,
    addRequired,
    translate,
  );
  const pendingLabel = isSubmittingTrustline
    ? translate("faucet.addPendingLabel")
    : translate("faucet.claimPendingLabel");
  const statusLabel = resolveStatusLabel(
    rowState,
    symbol,
    claimAmount,
    translate,
  );

  const handleAction = () => {
    if (isBusy || !walletPublicKey || rowState === "limited") {
      return;
    }

    if (needsTrustline) {
      const issuerAddress = asset.issuerAddress ?? undefined;
      if (!issuerAddress) {
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
      return;
    }

    if (!canClaim) {
      return;
    }

    const claimPromise =
      asset.trustlineStatus === "native"
        ? dispatch(
            claimNativeFaucetThunk({
              publicKey: walletPublicKey,
              assetId: asset.assetId,
            }),
          )
        : dispatch(
            claimIssuedAssetThunk({
              publicKey: walletPublicKey,
              assetId: asset.assetId,
            }),
          );

    void claimPromise.then((result) => {
      if (claimNativeFaucetThunk.fulfilled.match(result)) {
        setClaimedToday(true);
        return;
      }
      if (claimIssuedAssetThunk.fulfilled.match(result)) {
        setClaimedToday(true);
      }
    });
  };

  return (
    <div className="faucet-menu__row" data-state={rowState} role="none">
      <span
        className="faucet-menu__asset-icon"
        data-token={symbol}
        aria-hidden="true"
      >
        {asset.logoUrl ? (
          <img src={asset.logoUrl} alt="" />
        ) : (
          <span>{symbol.slice(0, 1)}</span>
        )}
      </span>
      <span className="faucet-menu__asset-copy">
        <strong>{symbol}</strong>
        <small>{asset.name}</small>
        <small className="faucet-menu__status" data-state={rowState}>
          {statusLabel}
        </small>
      </span>
      {showAction ? (
        <button
          type="button"
          className="faucet-menu__action"
          data-state={rowState}
          data-testid={`faucet-claim-${symbol.toLowerCase()}`}
          disabled={actionDisabled}
          role="menuitem"
          onClick={handleAction}
        >
          {isBusy ? (
            <FaucetRowActionLoader label={pendingLabel} />
          ) : rowState === "success" ? (
            <>
              <Check size={16} strokeWidth={1.8} />
              <span>{translate("faucet.successLabel")}</span>
            </>
          ) : (
            actionLabel
          )}
        </button>
      ) : (
        <span className="faucet-menu__action-slot" aria-hidden="true" />
      )}
    </div>
  );
}
