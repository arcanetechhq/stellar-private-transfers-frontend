import { useTranslation } from "react-i18next";
import { useAssetLookup } from "@/entities/asset";
import type { Transaction } from "@/entities/transaction";
import { isPendingClaimTransactionId } from "@/entities/pending-claims";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useAppSelector } from "@/store";
import { AssetRowIcon } from "@/shared/ui/asset-row-icon";
import { formatTransactionTableSubtitle } from "../lib/format-transaction-table-subtitle";
import {
  getAmountPrefix,
  getAmountToneClass,
} from "../lib/transaction-display";
import { TransactionClaimActionCell } from "./transaction-claim-action-cell";

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
  const { t: translate } = useTranslation("transactions");
  const assetMap = useAssetLookup();
  const asset = assetMap.get(transaction.assetId);
  const walletPublicKey = useAppSelector(selectWalletPublicKey);
  const assetFallback = asset?.name ?? transaction.assetId.toUpperCase();
  const subtitle = formatTransactionTableSubtitle(transaction, walletPublicKey, {
    privateTransferLabel: translate("privateTransferSubtitle"),
    pendingClaimLabel: translate("pendingClaimSubtitle"),
    pendingClaimSettledLabel: translate("pendingClaimSettledSubtitle"),
    claimCreditLabel: translate("claimCreditSubtitle"),
    assetFallback,
  });

  return (
    <div className="transaction-from-to-cell">
      <AssetRowIcon
        ticker={transaction.assetId.toUpperCase()}
        logoUrl={asset?.logoUrl}
      />
      <div className="transaction-from-to-cell__copy">
        <span className="transaction-from-to-cell__title">{title}</span>
        <span className="transaction-from-to-cell__subtitle">{subtitle}</span>
      </div>
    </div>
  );
}

type TransactionActivityCellProperties = {
  transaction: Transaction;
  title: string;
  claimingId?: number;
  canClaim?: boolean;
  onClaim?: (transactionId: string) => void;
};

export function TransactionActivityCell({
  transaction,
  title,
  claimingId,
  canClaim,
  onClaim,
}: TransactionActivityCellProperties) {
  return (
    <div className="transaction-activity-cell">
      <TransactionFromToCell transaction={transaction} title={title} />
      {onClaim && canClaim ? (
        <TransactionClaimActionCell
          transaction={transaction}
          claimingId={claimingId}
          canClaim={canClaim}
          onClaim={onClaim}
        />
      ) : null}
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
    isPendingClaimTransactionId(transaction.id) &&
    transaction.status === "completed"
  ) {
    return "neutral";
  }
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
  const amountPrefix =
    isPendingClaimTransactionId(transaction.id) &&
    transaction.status === "completed"
      ? ""
      : getAmountPrefix(transaction.type);
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
