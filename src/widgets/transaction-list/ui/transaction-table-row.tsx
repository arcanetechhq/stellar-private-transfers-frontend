import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useAssetLookup } from "@/entities/asset";
import { StatusBadge } from "@/shared/ui/status-badge";
import { TokenIcon } from "@/shared/ui/token-icon";
import { cn } from "@/shared/lib/cn";
import { formatSenderCounterpartyForDisplay } from "@/shared/lib/format-sender-counterparty-for-display";
import type { Transaction } from "@/entities/transaction";
import {
  getTransactionLabel,
  getStatusLabel,
  getStatusVariant,
  getAmountToneClass,
  getAmountPrefix,
} from "../lib/transaction-display";
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

export function TransactionTableRow(properties: TransactionTableRowProperties) {
  const { t: translate } = useTranslation("history");
  const { transaction } = properties;
  const navigate = useNavigate();
  const assetMap = useAssetLookup();
  const asset = assetMap.get(transaction.assetId);
  const assetLabel = asset?.name ?? transaction.assetId;
  const amountToneClass = getAmountToneClass(transaction.type);
  const counterpartyTrimmed = transaction.counterparty.trim();
  const counterpartyDisplay =
    counterpartyTrimmed === ""
      ? "—"
      : formatSenderCounterpartyForDisplay(counterpartyTrimmed);
  const detailsPath = `/transaction/${transaction.id}`;

  const handleRowClick = () => {
    navigate(detailsPath);
  };

  const handleRowKeyDown: React.KeyboardEventHandler<HTMLTableRowElement> = (
    event,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    navigate(detailsPath);
  };

  return (
    <tr
      className="cursor-pointer transition-colors hover:bg-[var(--surface-hover)] focus-visible:bg-[var(--surface-hover)] focus-visible:outline-none"
      role="link"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
    >
      <TransactionDateCell date={transaction.date} />
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <TransactionTypeIcon type={transaction.type} />
          <span className="text-sm leading-5 font-semibold text-[var(--foreground-primary)]">
            {getTransactionLabel(transaction.type, translate)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <TokenIcon
            ticker={transaction.assetId.toUpperCase()}
            logoUrl={asset?.logoUrl}
            size="sm"
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
        title={
          counterpartyTrimmed === "" ? undefined : transaction.counterparty
        }
      >
        {counterpartyDisplay}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge variant={getStatusVariant(transaction.status)}>
          {getStatusLabel(transaction.status, translate)}
        </StatusBadge>
      </td>
    </tr>
  );
}
