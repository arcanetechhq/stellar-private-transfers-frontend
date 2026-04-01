import React from "react";
import { useCreateDeposit } from "../model/use-create-deposit";
import { PageHeader } from "./page-header";
import { DepositForm } from "./deposit-form";
import { DepositSummary } from "./deposit-summary";
import { TokenPickerModal } from "./token-picker-modal";

export function CreateDeposit() {
  const deposit = useCreateDeposit();

  return (
    <div
      className="p-8"
      style={{ backgroundColor: "#F6F7F9", minHeight: "100%" }}
    >
      <div className="mx-auto max-w-5xl">
        <PageHeader onBack={() => deposit.navigate("/")} />
        <form onSubmit={deposit.handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DepositForm
                selectedToken={deposit.selectedToken}
                amount={deposit.amount}
                onAmountChange={deposit.handleAmountChange}
                onMaxAmount={deposit.handleMaxAmount}
                onPercentage={deposit.handlePercentage}
                onOpenTokenPicker={() => deposit.setShowTokenPicker(true)}
              />
            </div>
            <div className="lg:col-span-1">
              <DepositSummary
                selectedToken={deposit.selectedToken}
                amount={deposit.amount}
                fiatValue={deposit.fiatValue}
                networkFee={deposit.networkFee}
                receivedAmount={deposit.receivedAmount}
                canSubmit={deposit.canSubmit}
              />
            </div>
          </div>
        </form>
      </div>
      {deposit.showTokenPicker && (
        <TokenPickerModal
          filteredTokens={deposit.filteredTokens}
          selectedTokenId={deposit.selectedToken.id}
          searchQuery={deposit.searchQuery}
          onSearchChange={deposit.setSearchQuery}
          onTokenSelect={deposit.handleTokenSelect}
          onClose={() => deposit.setShowTokenPicker(false)}
        />
      )}
    </div>
  );
}
