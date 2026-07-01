import React from "react";
import "@/shared/styles/transfer-flow.css";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { selectContacts } from "@/entities/contact";
import { useCreateTransfer } from "../model/use-create-transfer";
import { TransferReviewModal } from "./transfer-review-modal";
import { TransferSendPanel } from "./transfer-send-panel";
import { TransferSuccessModal } from "./transfer-success-modal";

function resolveRecipientLabel(
  recipient: string,
  contacts: { name: string; stellarAddress: string }[],
  manualRecipientLabel: string,
): string {
  const recipientTrim = recipient.trim();
  const contact = contacts.find(
    (item) => item.stellarAddress.trim() === recipientTrim,
  );
  if (contact) {
    return contact.name;
  }
  if (recipientTrim) {
    return manualRecipientLabel;
  }
  return "—";
}

export function CreateTransfer(): React.JSX.Element {
  const transfer = useCreateTransfer();
  const contacts = useAppSelector(selectContacts);
  const { t: translate } = useTranslation("transfer");

  return (
    <div className="workspace__inner">
      <div className="transfer-route">
        <div className="transfer-flow">
          <TransferSendPanel
            assets={transfer.assets}
            selectedToken={transfer.selectedToken}
            amount={transfer.amount}
            recipient={transfer.recipient}
            recipientErrorKey={transfer.recipientErrorKey}
            recipientRegistryStatus={transfer.recipientRegistryStatus}
            totalAmount={transfer.totalAmount}
            canContinue={transfer.canSubmit}
            isSubmitting={transfer.isSubmitting}
            excludeStellarAddress={transfer.publicKey ?? undefined}
            onAmountChange={transfer.handleAmountChange}
            onRecipientChange={transfer.setRecipient}
            onTokenSelect={transfer.handleTokenSelect}
            onMaxAmount={transfer.handleMaxAmount}
            onContinue={transfer.handleOpenReview}
          />
        </div>
      </div>

      <TransferReviewModal
        open={transfer.step === "review"}
        selectedToken={transfer.selectedToken}
        amount={transfer.amount}
        recipient={transfer.recipient}
        isSubmitting={transfer.isSubmitting}
        submitError={transfer.submitError}
        onClose={transfer.handleCloseReview}
        onConfirm={transfer.handleConfirmSend}
      />

      <TransferSuccessModal
        open={transfer.step === "success"}
        result={transfer.successResult}
        recipientLabel={resolveRecipientLabel(
          transfer.recipient,
          contacts,
          translate("manualRecipient"),
        )}
        onDone={transfer.handleSuccessDone}
      />
    </div>
  );
}
