import React from "react";
import { Link } from "react-router";
import { ArrowDownToLine, Plus, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TrustlineStatus } from "@/entities/asset";
import { cn } from "@/shared/lib/cn";

interface TrustlineTarget {
  assetId: string;
  assetCode: string;
  issuerAddress: string;
}

interface AssetActionButtonProperties {
  assetId: string;
  assetCode: string;
  issuerAddress: string | undefined;
  trustlineStatus: TrustlineStatus;
  isSubmitting: boolean;
  onAddTrustline: (target: TrustlineTarget) => void;
}

const BASE_CLASSES =
  "inline-flex w-24 items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[13px] font-semibold leading-[18px] transition-colors";

const OUTLINE_CLASSES =
  "border border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)] hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] disabled:pointer-events-none disabled:opacity-50";

const PRIMARY_CLASSES =
  "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] disabled:pointer-events-none disabled:opacity-70";

export function AssetActionButton({
  assetId,
  assetCode,
  issuerAddress,
  trustlineStatus,
  isSubmitting,
  onAddTrustline,
}: AssetActionButtonProperties) {
  const { t: translate } = useTranslation("assets");

  if (trustlineStatus === "loading") {
    return (
      <button type="button" disabled className={cn(BASE_CLASSES, OUTLINE_CLASSES)}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      </button>
    );
  }

  if (trustlineStatus === "missing") {
    return (
      <button
        type="button"
        disabled={isSubmitting}
        className={cn(BASE_CLASSES, PRIMARY_CLASSES)}
        onClick={() => {
          if (issuerAddress) {
            onAddTrustline({ assetId, assetCode, issuerAddress });
          }
        }}
      >
        {isSubmitting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            <Plus className="h-3.5 w-3.5" />
            {translate("trustline.add")}
          </>
        )}
      </button>
    );
  }

  return (
    <Link
      to={`/deposit?assetId=${encodeURIComponent(assetId)}`}
      className="block w-24"
    >
      <button type="button" className={cn(BASE_CLASSES, OUTLINE_CLASSES, "w-full")}>
        <ArrowDownToLine className="h-3.5 w-3.5" />
        {translate("trustline.deposit")}
      </button>
    </Link>
  );
}
