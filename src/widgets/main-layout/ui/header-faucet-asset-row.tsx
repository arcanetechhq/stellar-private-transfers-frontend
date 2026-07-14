import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import type { AssetWithTrustline } from "@/entities/asset";
import {
  faucetClaimAmountLabel,
  isAssetFaucetClaimable,
  selectIsClaimLoadingForAsset,
  selectTrustlinePendingAssetId,
} from "@/entities/asset";
import {
  hasClaimedFaucetToday,
  useClaimFaucet,
} from "@/features/faucet";

type FaucetRowState = "idle" | "claiming" | "success" | "limited";

interface ResolveFaucetRowStateInput {
  canClaim: boolean;
  isBusy: boolean;
  claimedToday: boolean;
}

function resolveFaucetRowState({
  canClaim,
  isBusy,
  claimedToday,
}: ResolveFaucetRowStateInput): FaucetRowState {
  if (isBusy) {
    return "claiming";
  }
  if (claimedToday && canClaim) {
    return "limited";
  }
  return "idle";
}

function resolveStatusLabel(
  rowState: FaucetRowState,
  symbol: string,
  claimAmount: string,
  translate: TFunction<"assets">,
): string {
  switch (rowState) {
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
  const { claimNative, claimIssued } = useClaimFaucet();
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
  const isBusy = isClaimLoading || isSubmittingTrustline;
  const rowState = resolveFaucetRowState({
    canClaim,
    isBusy,
    claimedToday,
  });
  const showAction = canClaim || isBusy;
  const actionDisabled =
    isBusy ||
    !walletPublicKey ||
    rowState === "limited" ||
    asset.trustlineStatus === "loading";

  const statusLabel = resolveStatusLabel(
    rowState,
    symbol,
    claimAmount,
    translate,
  );

  const handleClaim = () => {
    if (isBusy || !walletPublicKey || rowState === "limited" || !canClaim) {
      return;
    }

    const runClaim = async () => {
      try {
        if (asset.trustlineStatus === "native") {
          await claimNative({
            publicKey: walletPublicKey,
            assetId: asset.assetId,
          });
          setClaimedToday(true);
          return;
        }

        const issuerAddress = asset.issuerAddress ?? undefined;
        const needsTrustline = asset.trustlineStatus === "missing";
        if (needsTrustline && !issuerAddress) {
          return;
        }

        await claimIssued({
          publicKey: walletPublicKey,
          assetId: asset.assetId,
          assetCode: symbol,
          issuerAddress,
          ensureTrustline: needsTrustline,
        });
        setClaimedToday(true);
      } catch {
        return;
      }
    };

    void runClaim();
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
          onClick={handleClaim}
        >
          {isBusy ? (
            <FaucetRowActionLoader
              label={translate("faucet.claimPendingLabel")}
            />
          ) : rowState === "success" ? (
            <>
              <Check size={16} strokeWidth={1.8} />
              <span>{translate("faucet.successLabel")}</span>
            </>
          ) : (
            translate("faucet.claimLabel")
          )}
        </button>
      ) : (
        <span className="faucet-menu__action-slot" aria-hidden="true" />
      )}
    </div>
  );
}
