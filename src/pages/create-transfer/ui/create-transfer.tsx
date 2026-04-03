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
    <div className="min-h-full bg-[var(--surface-primary)] p-8">
      <div className="mx-auto max-w-5xl">
        <PageHeader onBack={transfer.navigateHome} />
        <form onSubmit={transfer.handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
              senderNonce={transfer.senderNonce}
              onSenderNonceChange={transfer.setSenderNonce}
              nonces={transfer.nonces}
              byNonce={transfer.byNonce}
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
        excludeStealthAddress={transfer.senderStealthAddress}
        stealthRows={transfer.stealthRowsForPicker}
      />
    </div>
    </React.Fragment>
  );
}
