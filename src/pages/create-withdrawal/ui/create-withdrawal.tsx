import React from "react";
import "@/shared/styles/transfer-flow.css";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey, useWalletProviderLabel } from "@/entities/wallet";
import { useCreateWithdrawal } from "../model/use-create-withdrawal";
import { WithdrawalReviewModal } from "./withdrawal-review-modal";
import { WithdrawalSendPanel } from "./withdrawal-send-panel";
import { WithdrawalSuccessModal } from "./withdrawal-success-modal";

function resolveDestinationLabel(
  publicKey: string | null,
  providerLabel: string,
  connectedWalletLabel: string,
  walletProviderSuffix: string,
): string {
  if (!publicKey) {
    return connectedWalletLabel;
  }
  return `${providerLabel} ${walletProviderSuffix}`;
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
          <WithdrawalSendPanel
            assets={withdrawal.assets}
            selectedToken={withdrawal.selectedToken}
            amount={withdrawal.amount}
            totalAmount={withdrawal.receivedAmount}
            canContinue={withdrawal.canSubmit}
            isSubmitting={withdrawal.isSubmitting}
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
        onClose={withdrawal.handleCloseReview}
        onConfirm={withdrawal.handleConfirmWithdraw}
      />

      <WithdrawalSuccessModal
        open={withdrawal.step === "success"}
        result={withdrawal.successResult}
        destinationLabel={resolveDestinationLabel(
          publicKey,
          providerLabel,
          translate("connectedWallet"),
          translate("walletProviderSuffix"),
        )}
        onDone={withdrawal.handleSuccessDone}
      />
    </div>
  );
}
