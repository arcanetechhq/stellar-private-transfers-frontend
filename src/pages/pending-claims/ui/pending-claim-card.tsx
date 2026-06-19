import React from "react";
import type { AssetDto } from "@/entities/asset";
import type { PendingClaimItem } from "@/entities/pending-claims";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";
import { TokenIcon } from "@/shared/ui/token-icon";

const DEFAULT_ASSET_DECIMALS = 7;
const DECIMAL_RADIX = 10n;
const ZERO_FRACTION = 0n;

function resolveDecimals(decimals: number | null | undefined): number {
  return decimals === null || decimals === undefined
    ? DEFAULT_ASSET_DECIMALS
    : decimals;
}

function trimTrailingZeros(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === "0") {
    end -= 1;
  }
  return value.slice(0, end);
}

function formatBaseUnits(
  value: string,
  decimals: number | null | undefined = DEFAULT_ASSET_DECIMALS,
): string {
  const digits = resolveDecimals(decimals);
  const base = DECIMAL_RADIX ** BigInt(digits);
  const raw = BigInt(value);
  const whole = raw / base;
  const fraction = raw % base;
  if (digits === 0 || fraction === ZERO_FRACTION) {
    return whole.toLocaleString("en-US");
  }
  const fractionText = trimTrailingZeros(fraction.toString().padStart(digits, "0"));
  return `${whole.toLocaleString("en-US")}.${fractionText}`;
}

export function PendingClaimCard(parameters: {
  claim: PendingClaimItem;
  asset: AssetDto | undefined;
  claimingId: number | undefined;
  onClaim: (claim: PendingClaimItem) => Promise<void>;
  translate: (key: string) => string;
}) {
  const { claim, asset, claimingId, onClaim, translate } = parameters;
  const symbol = asset?.assetId.toUpperCase() ?? translate("unknownAsset");
  const canClaim =
    asset !== undefined &&
    (claim.commitmentHex ?? "").trim() !== "" &&
    claimingId === undefined;
  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] p-4">
      <div className="flex min-w-0 items-center gap-3">
        <TokenIcon ticker={symbol} logoUrl={asset?.logoUrl} size="lg" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground-primary)]">
            {formatBaseUnits(claim.noteValue, asset?.decimals)} {symbol}
          </p>
          <p className="mt-1 font-mono text-xs text-[var(--foreground-secondary)]">
            {translate("fromTx")}: {shortenStellarAddress(claim.poolTxId)}
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled={!canClaim}
        className="rounded-[10px] bg-[var(--foreground-primary)] px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
        onClick={() => {
          onClaim(claim);
        }}
      >
        {claimingId === claim.id ? translate("claiming") : translate("claim")}
      </button>
    </li>
  );
}
