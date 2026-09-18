import React from "react";
import "@/shared/styles/transfer-flow.css";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey, useWalletProviderLabel } from "@/entities/wallet";
import { useCreateWithdrawal } from "../model/use-create-withdrawal";
import { WithdrawalReviewModal } from "./withdrawal-review-modal";
import { WithdrawalSendPanel } from "./withdrawal-send-panel";
import { WithdrawalSuccessModal } from "./withdrawal-success-modal";

function resolveDestinationLabel(input: {
  publicKey: string | undefined;
  providerLabel: string;
  connectedWalletLabel: string;
  walletProviderSuffix: string;
}): string {
  if (!input.publicKey) {
    return input.connectedWalletLabel;
  }
  return `${input.providerLabel} ${input.walletProviderSuffix}`;
}

export function CreateWithdrawal(): React.JSX.Element {
  const withdrawal = useCreateWithdrawal();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const providerLabel = useWalletProviderLabel();
  const { t: translate } = useTranslation("withdrawal");

  return (
    <div className="workspace__inner">
      <div className="transfer-route">
        <div className="transfer-flow">
          <h2 className="transfer-flow__title">{translate("flowTitle")}</h2>
          <WithdrawalSendPanel
            assets={withdrawal.assets}
            selectedToken={withdrawal.selectedToken}
            amount={withdrawal.amount}
            totalAmount={withdrawal.receivedAmount}
            canContinue={withdrawal.canSubmit}
            isSubmitting={withdrawal.isSubmitting}
            {...(withdrawal.step === "form" && withdrawal.noteLimitAlert
              ? { noteLimitAlert: withdrawal.noteLimitAlert }
              : {})}
            onAmountChange={withdrawal.handleAmountChange}
            onTokenSelect={withdrawal.handleTokenSelect}
            onMaxAmount={withdrawal.handleMaxAmount}
            onContinue={withdrawal.handleOpenReview}
          />
        </div>
      </div>

      <WithdrawalReviewModal
        open={withdrawal.step === "review"}
        selectedToken={withdrawal.selectedToken}
        amount={withdrawal.amount}
        isSubmitting={withdrawal.isSubmitting}
        submitError={withdrawal.submitError}
        retryAllowed={withdrawal.relayAction?.retryAllowed}
        fallbackAllowed={withdrawal.relayAction?.fallbackAllowed}
        onRetry={withdrawal.handleRetry}
        onFallback={withdrawal.handleFallback}
        onClose={withdrawal.handleCloseReview}
        onConfirm={withdrawal.handleConfirmWithdraw}
      />

      <WithdrawalSuccessModal
        open={withdrawal.step === "success"}
        result={withdrawal.successResult}
        destinationLabel={resolveDestinationLabel({
          publicKey: publicKey ?? undefined,
          providerLabel,
          connectedWalletLabel: translate("connectedWallet"),
          walletProviderSuffix: translate("walletProviderSuffix"),
        })}
        onDone={withdrawal.handleSuccessDone}
      />
    </div>
  );
}
