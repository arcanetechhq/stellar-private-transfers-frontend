import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useAssetLookup } from "@/entities/asset";
import { StatusBadge } from "@/shared/ui/status-badge";
import { AssetRowIcon } from "@/shared/ui/asset-row-icon";
import { cn } from "@/shared/lib/cn";
import type { Transaction } from "@/entities/transaction";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useAppSelector } from "@/store";
import {
  formatTransactionTableSubtitle,
  transactionTableSubtitleTitle,
} from "../lib/format-transaction-table-subtitle";
import {
  getStatusLabel,
  getStatusVariant,
  getAmountToneClass,
  getAmountPrefix,
  resolveTransactionActivityTitle,
} from "../lib/transaction-display";
import { buildTransactionsPathWithSelection } from "../lib/transactions-selection-path";
import { TransactionTypeIcon } from "./transaction-type-icon";

interface TransactionTableRowProperties {
  transaction: Transaction;
}

interface TransactionDateCellProperties {
  date: string;
}

function TransactionDateCell(properties: TransactionDateCellProperties) {
  return (
    <td className="px-6 py-4 text-sm leading-5 whitespace-nowrap text-[var(--foreground-secondary)]">
      {new Date(properties.date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
      <br />
      <span className="text-xs text-[var(--foreground-tertiary)]">
        {new Date(properties.date).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </td>
  );
}

function readTransactionCounterpartyCopy(input: {
  transaction: Transaction;
  walletPublicKey: string | undefined;
  assetLabel: string;
  translateTransactions: (key: string) => string;
}): { display: string; title: string | undefined } {
  return {
    display: formatTransactionTableSubtitle({
      transaction: input.transaction,
      walletPublicKey: input.walletPublicKey,
      options: {
        privateTransferLabel: input.translateTransactions(
          "privateTransferSubtitle",
        ),
        claimCreditLabel: input.translateTransactions("claimCreditSubtitle"),
        assetFallback: input.assetLabel,
      },
    }),
    title: transactionTableSubtitleTitle(
      input.transaction,
      input.walletPublicKey,
    ),
  };
}

function navigateOnRowActivate(input: {
  event: React.KeyboardEvent<HTMLTableRowElement>;
  detailsPath: string;
  navigate: (path: string) => void;
}): void {
  if (input.event.key !== "Enter" && input.event.key !== " ") {
    return;
  }
  input.event.preventDefault();
  input.navigate(input.detailsPath);
}

export function TransactionTableRow(properties: TransactionTableRowProperties) {
  const { t: translateHistory } = useTranslation("history");
  const { t: translateTransactions } = useTranslation("transactions");
  const { transaction } = properties;
  const navigate = useNavigate();
  const assetMap = useAssetLookup();
  const asset = assetMap.get(transaction.assetId);
  const assetLabel = asset?.name ?? transaction.assetId;
  const amountToneClass = getAmountToneClass(transaction.type);
  const walletPublicKey = useAppSelector(selectWalletPublicKey);
  const counterparty = readTransactionCounterpartyCopy({
    transaction,
    walletPublicKey,
    assetLabel,
    translateTransactions,
  });
  const detailsPath = buildTransactionsPathWithSelection(transaction.id);

  return (
    <tr
      className="cursor-pointer transition-colors hover:bg-[var(--surface-hover)] focus-visible:bg-[var(--surface-hover)] focus-visible:outline-none"
      role="link"
      tabIndex={0}
      onClick={() => navigate(detailsPath)}
      onKeyDown={(event) =>
        navigateOnRowActivate({ event, detailsPath, navigate })
      }
    >
      <TransactionDateCell date={transaction.date} />
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <TransactionTypeIcon type={transaction.type} />
          <span className="text-sm leading-5 font-semibold text-[var(--foreground-primary)]">
            {resolveTransactionActivityTitle(transaction, (key) =>
              translateTransactions(key),
            )}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <AssetRowIcon
            ticker={transaction.assetId.toUpperCase()}
            logoUrl={asset?.logoUrl}
          />
          <span className="text-sm leading-5 font-semibold text-[var(--foreground-primary)]">
            {assetLabel}
          </span>
        </div>
      </td>
      <td
        className={cn(
          "px-6 py-4 text-sm leading-5 font-semibold whitespace-nowrap",
          amountToneClass,
        )}
      >
        {getAmountPrefix(transaction.type)}
        {transaction.amount.toLocaleString()}
      </td>
      <td
        className="px-6 py-4 font-mono text-[13px] leading-[18px] whitespace-nowrap text-[var(--foreground-secondary)]"
        title={counterparty.title}
      >
        {counterparty.display}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge variant={getStatusVariant(transaction.status)}>
          {getStatusLabel(transaction.status, translateHistory)}
        </StatusBadge>
      </td>
    </tr>
  );
}
