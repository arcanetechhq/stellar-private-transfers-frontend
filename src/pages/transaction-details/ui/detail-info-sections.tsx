import React from "react";
import { StatusBadge } from "@/shared/ui/status-badge";
import { TokenIcon } from "@/shared/ui/token-icon";
import type { Transaction } from "@/entities/transaction";
import { getStatusVariant } from "@/widgets/transaction-list";
import type { ResolvedDetailAsset } from "../lib/detail-info-resolvers";
import {
  resolveDetailRecipientDisplay,
  resolveDetailSenderDisplay,
} from "../lib/detail-meta-sender-recipient";

interface DetailInfoChainBannerProperties {
  chainHint: string;
}

export function DetailInfoChainBanner(
  properties: DetailInfoChainBannerProperties,
) {
  return (
    <p className="text-sm text-[var(--foreground-secondary)]">
      {properties.chainHint}
    </p>
  );
}

interface DetailInfoAmountAssetGridProperties {
  amountContent: string;
  displayAsset: ResolvedDetailAsset;
  amountLabel: string;
  assetLabel: string;
}

export function DetailInfoAmountAssetGrid(
  properties: DetailInfoAmountAssetGridProperties,
) {
  const { amountContent, displayAsset, amountLabel, assetLabel } = properties;
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="mb-1 text-sm text-[var(--foreground-secondary)]">
          {amountLabel}
        </div>
        <div className="text-2xl font-semibold text-[var(--foreground-primary)]">
          {amountContent}
        </div>
      </div>
      <div>
        <div className="mb-1 text-sm text-[var(--foreground-secondary)]">
          {assetLabel}
        </div>
        <div className="flex items-center gap-2">
          <TokenIcon
            ticker={displayAsset.ticker}
            logoUrl={displayAsset.asset?.logoUrl}
            size="lg"
          />
          <div className="text-2xl font-semibold text-[var(--foreground-primary)]">
            {displayAsset.assetLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DetailInfoMetaRowsProperties {
  hasPrivateRecord: boolean;
  storedTransaction: Transaction | undefined;
  dateTimeDisplay: string;
  transactionStatusLabel: string;
  completedStatusLabel: string;
  senderLabel: string;
  recipientLabel: string;
  dateTimeLabel: string;
  privateLabel: string;
}

export function DetailInfoMetaRows(properties: DetailInfoMetaRowsProperties) {
  const {
    hasPrivateRecord,
    storedTransaction,
    dateTimeDisplay,
    transactionStatusLabel,
    completedStatusLabel,
    senderLabel,
    recipientLabel,
    dateTimeLabel,
    privateLabel,
  } = properties;
  const recipientDisplay = resolveDetailRecipientDisplay({
    hasPrivateRecord,
    storedTransaction,
    privateLabel,
  });
  const senderResolved = resolveDetailSenderDisplay({
    hasPrivateRecord,
    storedTransaction,
    privateLabel,
  });
  return (
    <div className="space-y-3 border-t border-[var(--border-soft)] pt-4">
      <div className="flex justify-between">
        <span className="text-[var(--foreground-secondary)]">
          {transactionStatusLabel}
        </span>
        <StatusBadge variant={getStatusVariant("completed")}>
          {completedStatusLabel}
        </StatusBadge>
      </div>
      <div className="flex justify-between">
        <span className="text-[var(--foreground-secondary)]">{senderLabel}</span>
        <span
          className="font-mono text-sm font-medium text-[var(--foreground-primary)]"
          title={senderResolved.title}
        >
          {senderResolved.text}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-[var(--foreground-secondary)]">
          {recipientLabel}
        </span>
        <span className="font-mono text-sm font-medium text-[var(--foreground-primary)]">
          {recipientDisplay}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-[var(--foreground-secondary)]">{dateTimeLabel}</span>
        <span className="font-medium text-[var(--foreground-primary)]">
          {dateTimeDisplay}
        </span>
      </div>
    </div>
  );
}
