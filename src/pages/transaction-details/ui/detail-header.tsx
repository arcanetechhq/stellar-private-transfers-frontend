import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ArrowLeft, Download, Share2 } from "lucide-react";

interface DetailHeaderProperties {
  transactionId: string | undefined;
}

export function DetailHeader(properties: DetailHeaderProperties) {
  const { transactionId } = properties;
  const { t: translate } = useTranslation("transactionDetails");

  return (
    <div className="mb-6">
      <Link
        to="/history"
        className="mb-4 inline-flex items-center gap-2 text-[var(--foreground-secondary)] transition-colors hover:text-[var(--foreground-primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {translate("backToHistory")}
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-semibold text-[var(--foreground-primary)]">
            {translate("title")}
          </h1>
          <p className="text-[var(--foreground-secondary)]">
            {translate("idPrefix")}
            {transactionId}
          </p>
        </div>
      </div>
    </div>
  );
}
