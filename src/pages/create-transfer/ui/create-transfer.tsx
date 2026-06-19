import React from "react";
import { AssetPickerModal } from "@/features/pick-asset";
import { PickContactModal } from "@/features/pick-contact";
import { useCreateTransfer } from "../model/use-create-transfer";
import { PageHeader } from "./page-header";
import { TransferForm } from "./transfer-form";
import { TransferSummary } from "./transfer-summary";

export function CreateTransfer() {
  const transfer = useCreateTransfer();
  return (
    <React.Fragment>
      <div className="min-h-full bg-[var(--background)] p-8">
        <div className="mx-auto max-w-7xl">
          <PageHeader />
          <form onSubmit={transfer.handleSubmit}>
            <div className="grid grid-cols-3 gap-6">
              <TransferForm
                selectedToken={transfer.selectedToken}
                amount={transfer.amount}
                onAmountChange={transfer.handleAmountChange}
                recipient={transfer.recipient}
                onRecipientChange={transfer.setRecipient}
                recipientErrorKey={transfer.recipientErrorKey}
                onOpenTokenPicker={() => transfer.setShowTokenPicker(true)}
                onOpenContactPicker={() => transfer.setShowContactPicker(true)}
                onPercentage={transfer.handlePercentage}
                onMaxAmount={transfer.handleMaxAmount}
              />
              <TransferSummary
                selectedToken={transfer.selectedToken}
                amount={transfer.amount}
                recipient={transfer.recipient}
                totalAmount={transfer.totalAmount}
                canSubmit={transfer.canSubmit}
                isSubmitting={transfer.isSubmitting}
                submitError={transfer.submitError}
              />
            </div>
          </form>
        </div>
        {transfer.showTokenPicker ? (
          <AssetPickerModal
            assets={transfer.assets}
            selectedAssetId={transfer.selectedToken?.assetId}
            onSelect={transfer.handleTokenSelect}
            onClose={() => transfer.setShowTokenPicker(false)}
          />
        ) : undefined}
        <PickContactModal
          open={transfer.showContactPicker}
          selectedAddress={transfer.recipient}
          onSelect={transfer.setRecipient}
          onClose={() => transfer.setShowContactPicker(false)}
          excludePrivateAddress={transfer.senderPrivateAddress}
        />
      </div>
    </React.Fragment>
  );
}
