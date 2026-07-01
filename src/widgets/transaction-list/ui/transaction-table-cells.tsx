import { useAssetLookup } from "@/entities/asset";
import type { Transaction } from "@/entities/transaction";
import { formatSenderCounterpartyForDisplay } from "@/shared/lib/format-sender-counterparty-for-display";
import { TokenIcon } from "@/shared/ui/token-icon";
import {
  getAmountPrefix,
  getAmountToneClass,
} from "../lib/transaction-display";

type TransactionDateCellProperties = {
  date: string;
};

export function TransactionDateCell({ date }: TransactionDateCellProperties) {
  const parsedDate = new Date(date);

  return (
    <div className="transaction-date-cell">
      <span className="transaction-date-cell__date">
        {parsedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </span>
      <span className="transaction-date-cell__time">
        {parsedDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}

type TransactionFromToCellProperties = {
  transaction: Transaction;
  title: string;
};

export function TransactionFromToCell({
  transaction,
  title,
}: TransactionFromToCellProperties) {
  const assetMap = useAssetLookup();
  const asset = assetMap.get(transaction.assetId);
  const counterpartyTrimmed = transaction.counterparty.trim();
  const subtitle =
    counterpartyTrimmed === ""
      ? asset?.name ?? transaction.assetId.toUpperCase()
      : formatSenderCounterpartyForDisplay(counterpartyTrimmed);

  return (
    <div className="transaction-from-to-cell">
      <TokenIcon
        ticker={transaction.assetId.toUpperCase()}
        logoUrl={asset?.logoUrl}
        // size="sm"
        className="w-full h-full"
      />
      <div className="transaction-from-to-cell__copy">
        <span className="transaction-from-to-cell__title">{title}</span>
        <span className="transaction-from-to-cell__subtitle">{subtitle}</span>
      </div>
    </div>
  );
}

type TransactionAmountCellProperties = {
  transaction: Transaction;
};

function getAmountTone(
  transaction: Transaction,
): "positive" | "negative" | "pending" | "neutral" {
  if (
    transaction.status === "pending" ||
    transaction.status === "processing" ||
    transaction.status === "created"
  ) {
    return "pending";
  }
  const toneClass = getAmountToneClass(transaction.type);
  if (toneClass.includes("success")) {
    return "positive";
  }
  if (toneClass.includes("error")) {
    return "negative";
  }
  return "neutral";
}

export function TransactionAmountCell({
  transaction,
}: TransactionAmountCellProperties) {
  const amountPrefix = getAmountPrefix(transaction.type);
  const tone = getAmountTone(transaction);

  return (
    <div className="transaction-amount-cell">
      <span className="transaction-amount-cell__value" data-tone={tone}>
        {amountPrefix}
        {transaction.amount.toLocaleString()}
      </span>
      <span className="transaction-amount-cell__asset">
        {transaction.assetId.toUpperCase()}
      </span>
    </div>
  );
}
