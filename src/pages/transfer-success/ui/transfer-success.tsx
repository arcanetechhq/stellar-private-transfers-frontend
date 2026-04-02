import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, FileDown } from "lucide-react";
import { Link, useLocation, useParams } from "react-router";
import { Card, CardContent } from "@/shared/ui/surface-card";
import { TokenIcon } from "@/shared/ui/token-icon";
import { useAssetByPoolContract } from "@/entities/asset";
import {
  buildTransferSuccessViewModel,
  type TransferSuccessLocationState,
} from "../lib/build-transfer-success-view";

function TransferSuccessHero() {
  const { t: translate } = useTranslation("transfer");
  return (
    <div className="mb-8 text-center">
      <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--success-bg)]">
        <CheckCircle2 className="h-12 w-12 text-[var(--success)]" />
      </div>
      <h1 className="mb-2 text-2xl font-semibold text-[var(--foreground-primary)]">
        {translate("success.title")}
      </h1>
      <p className="text-[var(--foreground-secondary)]">
        {translate("success.subtitle")}
      </p>
    </div>
  );
}

interface TransferSuccessMetaProperties {
  amountDisplay: string;
  ticker: string;
  logoUrl: string | undefined;
  formattedTime: string;
  transactionIdShort: string;
  fullTransactionId: string;
}

function TransferSuccessMeta({
  amountDisplay,
  ticker,
  logoUrl,
  formattedTime,
  transactionIdShort,
  fullTransactionId,
}: TransferSuccessMetaProperties) {
  const { t: translate } = useTranslation("transfer");

  return (
    <Card className="mb-6">
      <CardContent className="space-y-6 py-8">
        <div className="border-b border-[var(--border)] pb-6 text-center">
          <div className="mb-2 text-sm text-[var(--foreground-secondary)]">
            {translate("success.transferAmount")}
          </div>
          <div className="flex items-center justify-center gap-3">
            <TokenIcon
              ticker={ticker}
              logoUrl={logoUrl}
              size="lg"
            />
            <div className="text-4xl font-semibold text-[var(--foreground-primary)]">
              {amountDisplay} {ticker}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between border-b border-[var(--border-soft)] py-3">
            <span className="text-[var(--foreground-secondary)]">
              {translate("success.time")}
            </span>
            <span className="font-medium text-[var(--foreground-primary)]">
              {formattedTime}
            </span>
          </div>

          <div className="flex justify-between border-b border-[var(--border-soft)] py-3">
            <span className="text-[var(--foreground-secondary)]">
              {translate("success.transactionId")}
            </span>
            <span
              className="max-w-[60%] truncate font-mono text-sm font-medium text-[var(--foreground-primary)]"
              title={fullTransactionId}
            >
              {transactionIdShort}
            </span>
          </div>

          <div className="flex justify-between py-3">
            <span className="text-[var(--foreground-secondary)]">
              {translate("success.status")}
            </span>
            <span className="inline-flex items-center rounded-md border border-[var(--success-bg)] bg-[var(--success-bg)] px-2.5 py-1 text-xs font-medium text-[var(--success-foreground)]">
              {translate("success.statusCompleted")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TransferSuccessActions({ transactionId }: { transactionId: string }) {
  const { t: translate } = useTranslation("transfer");
  const safeId = encodeURIComponent(transactionId);

  return (
    <div className="mb-8">
      <Link
        to={`/transaction/${safeId}`}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)]"
      >
        <FileDown className="h-5 w-5" />
        {translate("success.openDetails")}
      </Link>
    </div>
  );
}

function TransferSuccessFooter() {
  const { t: translate } = useTranslation("transfer");
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--info-bg)] p-4">
      <p className="text-sm text-[var(--info-foreground)]">
        {translate("success.privacyNotice")}
      </p>
    </div>
  );
}

export function TransferSuccess() {
  const { t: translate, i18n } = useTranslation("transfer");
  const location = useLocation();
  const { id: routeId } = useParams();
  const state = location.state as TransferSuccessLocationState | undefined;

  const poolContract = state?.poolContract?.trim();
  const assetMatch = useAssetByPoolContract(poolContract);
  const view = buildTransferSuccessViewModel({
    state,
    routeId,
    assetMatch,
    fallbackTransactionLabel: translate("success.transactionId"),
    language: i18n.language,
  });

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <TransferSuccessHero />
        <TransferSuccessMeta
          amountDisplay={view.amountDisplay}
          ticker={view.ticker}
          logoUrl={view.logoUrl}
          formattedTime={view.formattedTime}
          transactionIdShort={view.transactionIdShort}
          fullTransactionId={view.fullTransactionId}
        />
        {view.showActions ? (
          <TransferSuccessActions transactionId={view.txId} />
        ) : undefined}
        <TransferSuccessFooter />
      </div>
    </div>
  );
}
