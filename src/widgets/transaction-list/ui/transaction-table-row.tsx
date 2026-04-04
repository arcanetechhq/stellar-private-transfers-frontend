import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ExternalLink } from "lucide-react";
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

interface ViewDetailsCellProperties {
  id: string;
  title: string;
}

function ViewDetailsCell(properties: ViewDetailsCellProperties) {
  return (
    <td className="px-6 py-4 whitespace-nowrap">
      <Link to={`/transaction/${properties.id}`}>
        <button
          type="button"
          className="rounded-lg p-2 text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
          title={properties.title}
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      </Link>
    </td>
  );
}

export function TransactionTableRow(properties: TransactionTableRowProperties) {
  const { t: translate } = useTranslation("history");
  const { transaction } = properties;
  const assetMap = useAssetLookup();
  const asset = assetMap.get(transaction.assetId);
  const assetLabel = asset?.name ?? transaction.assetId;
  const amountToneClass = getAmountToneClass(transaction.type);
  const counterpartyTrimmed = transaction.counterparty.trim();
  const counterpartyDisplay =
    counterpartyTrimmed === ""
      ? "—"
      : formatSenderCounterpartyForDisplay(counterpartyTrimmed);

  return (
    <tr className="transition-colors hover:bg-[var(--surface-hover)]">
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
      <ViewDetailsCell id={transaction.id} title={translate("viewDetails")} />
    </tr>
  );
}
