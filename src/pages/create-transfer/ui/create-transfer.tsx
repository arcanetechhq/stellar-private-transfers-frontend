import React from "react";
import { useCreateTransfer } from "../model/use-create-transfer";
import { PageHeader } from "./page-header";
import { TransferForm } from "./transfer-form";
import { TransferSummary } from "./transfer-summary";
import { TokenPickerModal } from "./token-picker-modal";
import { PickContactModal } from "@/features/pick-contact";

export function CreateTransfer() {
  const transfer = useCreateTransfer();
  return (
    <div
      className="p-8"
      style={{ backgroundColor: "#F6F7F9", minHeight: "100%" }}
    >
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
              note={transfer.note}
              onNoteChange={transfer.setNote}
              onOpenTokenPicker={() => transfer.setShowTokenPicker(true)}
              onOpenContactPicker={() => transfer.setShowContactPicker(true)}
              onPercentage={transfer.handlePercentage}
              onMaxAmount={transfer.handleMaxAmount}
            />
            <TransferSummary
              selectedToken={transfer.selectedToken}
              amount={transfer.amount}
              fiatValue={transfer.fiatValue}
              recipient={transfer.recipient}
              totalAmount={transfer.totalAmount}
              canSubmit={transfer.canSubmit}
            />
          </div>
        </form>
      </div>
      {transfer.showTokenPicker && (
        <TokenPickerModal
          filteredTokens={transfer.filteredTokens}
          selectedTokenId={transfer.selectedToken.id}
          searchQuery={transfer.searchQuery}
          onSearchChange={transfer.setSearchQuery}
          onSelect={transfer.handleTokenSelect}
          onClose={() => transfer.setShowTokenPicker(false)}
        />
      )}
      <PickContactModal
        open={transfer.showContactPicker}
        selectedAddress={transfer.recipient}
        onSelect={transfer.setRecipient}
        onClose={() => transfer.setShowContactPicker(false)}
      />
    </div>
  );
}
