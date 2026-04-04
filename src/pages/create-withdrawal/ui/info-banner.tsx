import React from "react";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

export function InfoBanner() {
  const { t: translate } = useTranslation("withdrawal");
  return (
    <div className="rounded-lg border border-[var(--warning-border)] bg-[var(--warning-bg)] p-4">
      <div className="flex gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
        <div>
          <p className="mb-1 text-[14px] leading-5 font-semibold text-[var(--warning-foreground)]">
            {translate("aboutWithdrawals")}
          </p>
          <p className="text-[13px] leading-[18px] text-[var(--warning-foreground)]">
            {translate("aboutWithdrawalsText")}
          </p>
        </div>
      </div>
    </div>
  );
}
