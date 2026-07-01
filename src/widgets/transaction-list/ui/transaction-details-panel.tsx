import { useEffect, useMemo, useState, type ReactNode } from "react";
import "./transaction-details-panel.css";
import {
  Calendar,
  FileDown,
  FileText,
  Network,
  ReceiptText,
  RefreshCw,
  WalletCards,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAssetLookup } from "@/entities/asset";
import type { Transaction } from "@/entities/transaction";
import { formatSenderCounterpartyForDisplay } from "@/shared/lib/format-sender-counterparty-for-display";
import { TokenIcon } from "@/shared/ui/token-icon";
import {
  getAmountPrefix,
  getStatusLabel,
  getTransactionLabel,
} from "../lib/transaction-display";
import { useTransactionDetailsPanel } from "../model/use-transaction-details-panel";
import { TransactionDetailRow } from "./transaction-detail-row";

type DetailTab = "details" | "timeline" | "attachments";

type TransactionDetailsPanelProperties = {
  transaction: Transaction;
  onClose: () => void;
};

function isIncomingType(type: Transaction["type"]): boolean {
  return type === "received" || type === "deposit";
}

function isPendingStatus(status: Transaction["status"]): boolean {
  return (
    status === "pending" ||
    status === "processing" ||
    status === "created"
  );
}

function formatTransactionDateTime(dateRaw: string): {
  dateLabel: string;
  timeLabel: string;
} {
  const parsed = new Date(dateRaw);
  return {
    dateLabel: parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    timeLabel: parsed.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

type TransactionStatusTone = "positive" | "warning" | "danger" | "accent" | "neutral";

function resolveTransactionStatusTone(
  status: Transaction["status"],
): TransactionStatusTone {
  switch (status) {
    case "completed": {
      return "positive";
    }
    case "pending":
    case "processing":
    case "created": {
      return "warning";
    }
    case "failed": {
      return "danger";
    }
    default: {
      return "neutral";
    }
  }
}

function TransactionDetailsStatusBadge({
  tone,
  children,
}: {
  tone: TransactionStatusTone;
  children: ReactNode;
}) {
  return (
    <span className="transaction-details__status-badge" data-tone={tone}>
      <span className="transaction-details__status-dot" data-tone={tone} aria-hidden="true" />
      {children}
    </span>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="transaction-info-section">
      <h3 className="transaction-info-section__title">{title}</h3>
      <div className="transaction-info-section__rows">{children}</div>
    </section>
  );
}

export function TransactionDetailsPanel({
  transaction,
  onClose,
}: TransactionDetailsPanelProperties) {
  const { t: translateDetails } = useTranslation("transactionDetails");
  const { t: translateTransactions } = useTranslation("transactions");
  const [activeTab, setActiveTab] = useState<DetailTab>("details");
  const [refreshing, setRefreshing] = useState(false);
  const { chainEntry } = useTransactionDetailsPanel(transaction.id);
  const assetMap = useAssetLookup();
  const asset = assetMap.get(transaction.assetId);

  const { dateLabel, timeLabel } = formatTransactionDateTime(transaction.date);
  const isIncoming = isIncomingType(transaction.type);
  const isPending = isPendingStatus(transaction.status);
  const direction = isIncoming
    ? translateTransactions("details.directionIncoming")
    : translateTransactions("details.directionOutgoing");
  const statusLabel = getStatusLabel(transaction.status, (key) =>
    translateTransactions(key),
  );
  const title = getTransactionLabel(transaction.type, (key) =>
    translateTransactions(key),
  );
  const counterpartyTrimmed = transaction.counterparty.trim();
  const counterpartyDisplay =
    counterpartyTrimmed === ""
      ? "—"
      : formatSenderCounterpartyForDisplay(counterpartyTrimmed);
  const amountPrefix = getAmountPrefix(transaction.type);
  const amountDisplay = `${amountPrefix}${transaction.amount.toLocaleString()} ${transaction.assetId.toUpperCase()}`;
  const paymentRail = translateTransactions("details.paymentRail", {
    asset: transaction.assetId.toUpperCase(),
  });

  const detailTabs = useMemo(
    () => [
      { value: "details" as const, label: translateTransactions("details.tabs.details") },
      { value: "timeline" as const, label: translateTransactions("details.tabs.timeline") },
      {
        value: "attachments" as const,
        label: translateTransactions("details.tabs.attachments"),
      },
    ],
    [translateTransactions],
  );

  const timelineItems = useMemo(
    () => [
      {
        icon: WalletCards,
        title: isIncoming
          ? translateTransactions("details.timeline.receivedTitle")
          : translateTransactions("details.timeline.sentTitle"),
        text: translateTransactions("details.timeline.processingText"),
        time: timeLabel,
      },
      {
        icon: Network,
        title: translateTransactions("details.timeline.networkTitle"),
        text: translateTransactions("details.timeline.networkText"),
        time: translateTransactions("details.timeline.networkTime"),
      },
      {
        icon: ReceiptText,
        title: isPending
          ? translateTransactions("details.timeline.pendingTitle")
          : translateTransactions("details.timeline.balanceTitle"),
        text: isPending
          ? translateTransactions("details.timeline.pendingText")
          : translateTransactions("details.timeline.balanceText"),
        time: isPending
          ? translateTransactions("details.timeline.waiting")
          : translateTransactions("details.timeline.balanceTime"),
      },
      {
        icon: Calendar,
        title: isPending
          ? translateTransactions("details.timeline.inProgressTitle")
          : translateTransactions("details.timeline.completedTitle"),
        text: isPending
          ? translateTransactions("details.timeline.inProgressText")
          : translateTransactions("details.timeline.completedText"),
        time: dateLabel,
      },
    ],
    [dateLabel, isIncoming, isPending, timeLabel, translateTransactions],
  );

  useEffect(() => {
    setActiveTab("details");
  }, [transaction.id]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleRefresh() {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 650);
  }

  return (
    <section className="transaction-details ui-card">
      <button
        type="button"
        className="ui-icon-button transaction-details__close"
        aria-label={translateTransactions("details.close")}
        onClick={onClose}
      >
        <X aria-hidden="true" size={16} strokeWidth={1.7} />
      </button>

      <div className="transaction-details__hero">
        <span className="transaction-details__asset-icon">
          <TokenIcon
            ticker={transaction.assetId.toUpperCase()}
            logoUrl={asset?.logoUrl}
            size="lg"
          />
        </span>
        <div className="transaction-details__hero-copy">
          <h2 className="transaction-details__title">{title}</h2>
          <p className="transaction-details__subtitle">{counterpartyDisplay}</p>
        </div>
        <p
          className="transaction-details__amount"
          data-tone={isPending ? "warning" : isIncoming ? "positive" : "danger"}
        >
          {amountDisplay}
        </p>
        <div className="transaction-details__meta">
          <TransactionDetailsStatusBadge tone={resolveTransactionStatusTone(transaction.status)}>
            {statusLabel}
          </TransactionDetailsStatusBadge>
          <span className="transaction-details__meta-text">
            {direction} · {paymentRail}
          </span>
        </div>
        {/* <div className="transaction-details__actions">
          <button type="button" className="transaction-details__action-button">
            <FileDown aria-hidden="true" size={16} strokeWidth={1.7} />
            {translateDetails("downloadConfirmation")}
          </button>
          <button
            type="button"
            className="ui-icon-button transactions-refresh-button"
            data-active={refreshing}
            aria-label={translateTransactions("refresh")}
            onClick={handleRefresh}
          >
            <RefreshCw aria-hidden="true" size={16} strokeWidth={1.7} />
          </button>
        </div> */}
      </div>

      <div className="transaction-details__tabs">
        <div className="transaction-details__tabs-list" role="tablist">
          {detailTabs.map((tab) => (
            <button
              type="button"
              key={tab.value}
              className="transaction-details__tab"
              role="tab"
              data-active={activeTab === tab.value}
              aria-selected={activeTab === tab.value}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "details" ? (
          <div className="transaction-info-stack">
            <DetailSection title={translateTransactions("details.sections.transaction")}>
              <TransactionDetailRow
                label={translateTransactions("tableHeaders.date")}
                value={`${dateLabel}, ${timeLabel}`}
              />
              <TransactionDetailRow
                label={translateTransactions("details.fields.direction")}
                value={direction}
              />
              <TransactionDetailRow
                label={translateTransactions("details.fields.status")}
                value={statusLabel}
              />
              <TransactionDetailRow
                label={translateTransactions("details.fields.reference")}
                value={transaction.id}
                copyable
              />
            </DetailSection>
            <DetailSection title={translateTransactions("details.sections.payment")}>
              <TransactionDetailRow
                label={translateTransactions("details.fields.asset")}
                value={`${transaction.assetId.toUpperCase()} · ${asset?.name ?? transaction.assetId}`}
              />
              <TransactionDetailRow
                label={translateTransactions("details.fields.network")}
                value={translateTransactions("details.networkLabel")}
              />
              <TransactionDetailRow
                label={translateTransactions("details.fields.amount")}
                value={amountDisplay}
              />
              <TransactionDetailRow
                label={translateTransactions("details.fields.fee")}
                value={translateTransactions("details.feeFree")}
              />
            </DetailSection>
            <DetailSection title={translateTransactions("details.sections.counterparty")}>
              <TransactionDetailRow
                label={
                  isIncoming
                    ? translateTransactions("details.fields.sender")
                    : translateTransactions("details.fields.recipient")
                }
                value={counterpartyDisplay}
              />
              <TransactionDetailRow
                label={translateTransactions("details.fields.from")}
                value={
                  isIncoming
                    ? counterpartyDisplay
                    : translateTransactions("details.fields.privateAccount")
                }
              />
              <TransactionDetailRow
                label={translateTransactions("details.fields.to")}
                value={
                  isIncoming
                    ? translateTransactions("details.fields.privateAccount")
                    : counterpartyDisplay
                }
              />
              <TransactionDetailRow
                label={translateTransactions("details.fields.transactionHash")}
                value={transaction.id}
                copyable
              />
            </DetailSection>
            {chainEntry?.status === "loading" ? (
              <p className="transaction-details__chain-hint">
                {translateDetails("chainLoading")}
              </p>
            ) : null}
          </div>
        ) : null}

        {activeTab === "timeline" ? (
          <div className="transaction-timeline">
            {timelineItems.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === timelineItems.length - 1;

              return (
                <div className="transaction-timeline__item" key={item.title}>
                  <div className="transaction-timeline__track">
                    <span className="transaction-timeline__marker">
                      <Icon aria-hidden="true" />
                    </span>
                    {isLast ? null : (
                      <span className="transaction-timeline__line" aria-hidden="true" />
                    )}
                  </div>
                  <div className="transaction-timeline__copy">
                    <p className="transaction-timeline__title">{item.title}</p>
                    <p className="transaction-timeline__text">{item.text}</p>
                    <p className="transaction-timeline__time">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {activeTab === "attachments" ? (
          <div className="transaction-attachments">
            {!isPending ? (
              <div className="transaction-attachment">
                <span className="transaction-attachment__icon" aria-hidden="true">
                  <FileText />
                </span>
                <span className="transaction-attachment__copy">
                  <span className="transaction-attachment__title">
                    {translateTransactions("details.attachments.proofTitle", {
                      reference: transaction.id.slice(0, 8),
                    })}
                  </span>
                  <span className="transaction-attachment__meta">
                    {translateTransactions("details.attachments.proofMeta")}
                  </span>
                </span>
              </div>
            ) : null}
            <div className="transaction-upload">
              <p className="transaction-upload__text">
                {isPending
                  ? translateTransactions("details.attachments.pendingEmpty")
                  : translateTransactions("details.attachments.empty")}
              </p>
              <button
                type="button"
                className="transaction-details__action-button"
                disabled
              >
                {translateTransactions("details.attachments.upload")}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
