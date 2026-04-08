import React from "react";
import { AssetPickerModal } from "@/features/pick-asset";
import { useCreateDeposit } from "../model/use-create-deposit";
import { PageHeader } from "./page-header";
import { DepositForm } from "./deposit-form";
import { DepositSummary } from "./deposit-summary";

export function CreateDeposit() {
  const deposit = useCreateDeposit();

  return (
    <div className="min-h-full bg-[var(--background)] p-8">
      <div className="mx-auto max-w-5xl">
        <PageHeader onBack={() => deposit.navigate("/")} />
        <form onSubmit={deposit.handleSubmit}>
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DepositForm
                selectedToken={deposit.selectedToken}
                amount={deposit.amount}
                onAmountChange={deposit.handleAmountChange}
                onMaxAmount={deposit.handleMaxAmount}
                onPercentage={deposit.handlePercentage}
                onOpenTokenPicker={() => deposit.setShowTokenPicker(true)}
                selectedStealthNonce={deposit.selectedStealthNonce}
                onStealthSelect={deposit.handleStealthSelect}
                errorMessage={deposit.submitErrorMessage}
              />
            </div>
            <div className="lg:col-span-1">
              <DepositSummary
                selectedToken={deposit.selectedToken}
                amount={deposit.amount}
                networkFee={deposit.networkFee}
                receivedAmount={deposit.receivedAmount}
                canSubmit={deposit.canSubmit}
                isSubmitting={deposit.isSubmitting}
                destinationPreview={deposit.destinationStealthPreview}
              />
            </div>
          </div>
        </form>
      </div>
      {deposit.showTokenPicker && (
        <AssetPickerModal
          customAssetFilter={(asset) =>
            asset.trustlineStatus !== "missing" &&
            Number.parseFloat(asset.balance ?? "0") > 0
          }
          assets={deposit.assets}
          selectedAssetId={deposit.selectedToken?.assetId}
          onSelect={deposit.handleTokenSelect}
          onClose={() => deposit.setShowTokenPicker(false)}
        />
      )}
    </div>
  );
}
