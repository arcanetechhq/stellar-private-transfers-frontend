import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AssetRowIcon } from "@/shared/ui/asset-row-icon";
import {
  formatAggregatedBalance,
  formatUsdAmount,
} from "../lib/format-asset-balance-amount";

export type PendingAssetClaimRowModel = {
  claimId: number;
  transactionId: string;
  assetId: string;
  assetName: string;
  logoUrl?: string | null;
  amountDisplay: number;
  usdAmount: number;
};

type PendingAssetClaimControls = {
  claimingId: number | undefined;
  canClaim: boolean;
  onClaim: (transactionId: string) => void;
};

type PendingAssetClaimRowProperties = {
  row: PendingAssetClaimRowModel;
  claimControls: PendingAssetClaimControls;
};

export function PendingAssetClaimRow({
  row,
  claimControls,
}: PendingAssetClaimRowProperties) {
  const { t: translateAssets } = useTranslation("assets");
  const { t: translatePending } = useTranslation("pendingClaims");
  const ticker = row.assetId.toUpperCase();
  const isClaiming = claimControls.claimingId === row.claimId;
  const isClaimBusy = claimControls.claimingId !== undefined;
  const receiveDisabled = !claimControls.canClaim || isClaimBusy;

  return (
    <div className="pending-asset-claim">
      <div className="asset-balance-row pending-asset-claim__balance">
        <AssetRowIcon ticker={ticker} logoUrl={row.logoUrl} />
        <span className="asset-balance-row__identity">
          <span className="asset-balance-row__title">
            <span className="asset-balance-row__code">{ticker}</span>
            <span className="asset-balance-row__badge">
              {translateAssets("privateAssets.networkStellar")}
            </span>
          </span>
          <span className="asset-balance-row__name">{row.assetName}</span>
        </span>
        <span className="asset-balance-row__amount">
          <span className="asset-balance-row__balance">
            {formatAggregatedBalance(row.amountDisplay)} {ticker}
          </span>
          <span className="asset-balance-row__fiat">
            ${formatUsdAmount(row.usdAmount)}
          </span>
        </span>
      </div>
      {/* <div className="pending-asset-claim__divider" aria-hidden="true" /> */}
      <div className="pending-asset-claim__footer">
        <span className="pending-asset-claim__status">
          <span className="pending-asset-claim__dot" aria-hidden="true" />
          <span className="pending-asset-claim__label">
            {translatePending("readyToReceive")}
          </span>
        </span>
        <button
          type="button"
          className="period-select__button pending-asset-claim__receive"
          disabled={receiveDisabled}
          aria-busy={isClaiming}
          onClick={() => {
            if (receiveDisabled) {
              return;
            }
            claimControls.onClaim(row.transactionId);
          }}
        >
          {isClaiming ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              <span>{translatePending("receiving")}</span>
            </>
          ) : (
            translatePending("receive")
          )}
        </button>
      </div>
    </div>
  );
}
