import React from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import type {
  TransferSuccessFlow,
  TransferSuccessViewModel,
} from "../lib/build-transfer-success-view";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";
import { buildTransactionsPathWithSelection } from "@/widgets/transaction-list";

interface TransferSuccessDetailRowProperties {
  label: string;
  value: string;
  title?: string;
  testId?: string;
}

function TransferSuccessDetailRow({
  label,
  value,
  title,
  testId,
}: TransferSuccessDetailRowProperties): React.JSX.Element {
  return (
    <div className="private-deposit-success-card__detail">
      <span>{label}</span>
      <strong title={title} data-testid={testId}>
        {value}
      </strong>
    </div>
  );
}

interface TransferSuccessPanelProperties {
  view: TransferSuccessViewModel;
  sourceWallet: string | undefined;
}

function resolvePageTitleKey(flow: TransferSuccessFlow): string {
  if (flow === "deposit") {
    return "successPageTitle";
  }
  return "success.title";
}

function resolveHeroTitleKey(flow: TransferSuccessFlow): string {
  if (flow === "deposit") {
    return "successTitle";
  }
  if (flow === "withdrawal") {
    return "successWithdrawalTitle";
  }
  return "success.title";
}

function resolveDescriptionKey(flow: TransferSuccessFlow): string {
  if (flow === "deposit") {
    return "successDescription";
  }
  if (flow === "withdrawal") {
    return "successWithdrawalDescription";
  }
  return "success.subtitle";
}

export function TransferSuccessPanel({
  view,
  sourceWallet,
}: TransferSuccessPanelProperties): React.JSX.Element {
  const navigate = useNavigate();
  const { t: translateDeposit } = useTranslation("deposit");
  const { t: translateTransfer } = useTranslation("transfer");
  const isDepositFlow = view.flow === "deposit";

  const pageTitle = isDepositFlow
    ? translateDeposit(resolvePageTitleKey(view.flow))
    : translateTransfer(resolvePageTitleKey(view.flow));

  const heroTitle = isDepositFlow
    ? translateDeposit(resolveHeroTitleKey(view.flow))
    : translateTransfer(resolveHeroTitleKey(view.flow));

  const description = isDepositFlow
    ? translateDeposit(resolveDescriptionKey(view.flow), {
        amount: view.amountDisplay,
        asset: view.ticker,
      })
    : translateTransfer(resolveDescriptionKey(view.flow));

  const safeTransactionId = encodeURIComponent(view.txId);
  const sourceWalletDisplay = sourceWallet ?? "—";

  return (
    <>
      <div
        className="private-deposit-success-card"
        role="status"
        aria-live="polite"
      >
        <div className="private-deposit-success-card__hero">
          <span
            className="private-deposit-success-card__icon"
            aria-hidden="true"
          >
            <Check size={34} strokeWidth={1.8} />
          </span>
          <span className="private-deposit-success-card__copy">
            <h3 className="private-deposit-success-card__heading">
              {heroTitle}
            </h3>
            <p className="private-deposit-success-card__description">
              {description}
            </p>
          </span>
        </div>

        <div
          className="private-deposit-success-card__details"
          aria-label={translateTransfer("success.detailsLabel")}
        >
          <TransferSuccessDetailRow
            label={translateTransfer("success.transferAmount")}
            value={view.amountWithTicker}
          />
          <TransferSuccessDetailRow
            label={translateTransfer("success.asset")}
            value={view.ticker}
          />
          {isDepositFlow ? (
            <>
              <TransferSuccessDetailRow
                label={translateDeposit("successDetailNetwork")}
                value="Stellar"
              />
              <TransferSuccessDetailRow
                label={translateDeposit("successDetailSourceWallet")}
                value={shortenStellarAddress(sourceWalletDisplay, 4, 3)}
                title={sourceWallet}
              />
              <TransferSuccessDetailRow
                label={translateTransfer("success.transactionId")}
                value={view.transactionIdShort}
                title={view.fullTransactionId}
                testId="tx-hash"
              />
            </>
          ) : (
            <>
              <TransferSuccessDetailRow
                label={translateTransfer("success.time")}
                value={view.formattedTime}
              />
              <TransferSuccessDetailRow
                label={translateTransfer("success.transactionId")}
                value={view.transactionIdShort}
                title={view.fullTransactionId}
                testId="tx-hash"
              />
              <TransferSuccessDetailRow
                label={translateTransfer("success.status")}
                value={translateTransfer("success.statusCompleted")}
              />
            </>
          )}
        </div>

        <div className="private-deposit-success-card__actions">
          {isDepositFlow ? (
            <button
              type="button"
              className="private-deposit-success-card__button private-deposit-success-card__button--secondary"
              onClick={() => navigate("/deposit")}
            >
              {translateDeposit("depositAgain")}
            </button>
          ) : view.showActions ? (
            <Link
              to={buildTransactionsPathWithSelection(safeTransactionId)}
              className="private-deposit-success-card__button private-deposit-success-card__button--secondary"
            >
              {translateTransfer("success.openDetails")}
            </Link>
          ) : null}
          <button
            type="button"
            className={`private-deposit-success-card__button private-deposit-success-card__button--primary${
              !isDepositFlow && !view.showActions
                ? " private-deposit-success-card__button--solo"
                : ""
            }`}
            onClick={() => navigate("/")}
          >
            {translateTransfer("success.done")}
          </button>
        </div>
      </div>
    </>
  );
}
