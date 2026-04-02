import React from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AssetPickerModal } from "@/features/pick-asset";
import { PickContactModal } from "@/features/pick-contact";
import { useCreateWithdrawal } from "../model/use-create-withdrawal";
import { AssetSelector } from "./asset-selector";
import { AmountInput } from "./amount-input";
import { DestinationInput } from "./destination-input";
import { InfoBanner } from "./info-banner";
import { WithdrawalSummary } from "./withdrawal-summary";

interface PageHeaderProperties {
  onGoBack: () => void;
}

function PageHeader({ onGoBack }: PageHeaderProperties) {
  const { t: translate } = useTranslation("withdrawal");

  return (
    <div className="mb-6">
      <button
        onClick={onGoBack}
        className="mb-4 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-[14px] leading-[20px] text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {translate("backToHome")}
      </button>
      <h1 className="font-semibold" style={{ fontSize: "32px", lineHeight: "40px", color: "#121826" }}>
        {translate("pageTitle")}
      </h1>
      <p className="mt-1" style={{ fontSize: "16px", lineHeight: "24px", color: "#667085" }}>
        {translate("pageSubtitle")}
      </p>
    </div>
  );
}

export function CreateWithdrawal() {
  const state = useCreateWithdrawal();

  return (
    <div className="p-8" style={{ backgroundColor: "#F6F7F9", minHeight: "100%" }}>
      <div className="mx-auto max-w-5xl">
        <PageHeader onGoBack={state.handleGoBack} />
        <form onSubmit={state.handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-xl bg-white p-6" style={{ border: "1px solid #E7EAF0" }}>
                <div className="space-y-6">
                  <AssetSelector
                    selectedToken={state.selectedToken}
                    onOpenPicker={() => state.setShowTokenPicker(true)}
                  />
                  <AmountInput
                    amount={state.amount}
                    onAmountChange={state.handleAmountChange}
                    onPercentage={state.handlePercentage}
                    onMaxAmount={state.handleMaxAmount}
                  />
                  <DestinationInput
                    destinationWallet={state.destinationWallet}
                    onDestinationChange={state.setDestinationWallet}
                    onOpenContactPicker={() => state.setShowContactPicker(true)}
                  />
                  <InfoBanner />
                </div>
              </div>
            </div>
            <WithdrawalSummary
              selectedToken={state.selectedToken}
              amount={state.amount}
              networkFee={state.networkFee}
              receivedAmount={state.receivedAmount}
              destinationWallet={state.destinationWallet}
              canSubmit={state.canSubmit}
            />
          </div>
        </form>
      </div>
      {state.showTokenPicker && (
        <AssetPickerModal
          assets={state.assets}
          selectedAssetId={state.selectedToken?.assetId}
          onSelect={state.handleTokenSelect}
          onClose={() => state.setShowTokenPicker(false)}
        />
      )}
      <PickContactModal
        open={state.showContactPicker}
        selectedAddress={state.destinationWallet}
        onSelect={state.setDestinationWallet}
        onClose={() => state.setShowContactPicker(false)}
      />
    </div>
  );
}
