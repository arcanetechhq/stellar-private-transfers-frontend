import React from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCreateWithdrawal } from "../model/use-create-withdrawal";
import { AssetSelector } from "./asset-selector";
import { AmountInput } from "./amount-input";
import { DestinationInput } from "./destination-input";
import { InfoBanner } from "./info-banner";
import { WithdrawalSummary } from "./withdrawal-summary";
import { TokenPickerModal } from "./token-picker-modal";
import { PickContactModal } from "@/features/pick-contact";

interface PageHeaderProperties {
  onGoBack: () => void;
}

function PageHeader(properties: PageHeaderProperties) {
  const { onGoBack } = properties;
  const { t: translate } = useTranslation("withdrawal");

  return (
    <div className="mb-6">
      <button
        onClick={onGoBack}
        className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
        style={{ fontSize: "14px", lineHeight: "20px", color: "#667085", border: "1px solid #E7EAF0", backgroundColor: "#FFFFFF" }}
        onMouseEnter={(event) => (event.currentTarget.style.backgroundColor = "#F6F7F9")}
        onMouseLeave={(event) => (event.currentTarget.style.backgroundColor = "#FFFFFF")}
      >
        <ArrowLeft className="h-4 w-4" />
        {translate("backToHome")}
      </button>
      <h1
        className="font-semibold"
        style={{ fontSize: "32px", lineHeight: "40px", color: "#121826" }}
      >
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
              <div
                className="rounded-xl bg-white p-6"
                style={{ border: "1px solid #E7EAF0" }}
              >
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
              fiatValue={state.fiatValue}
              networkFee={state.networkFee}
              receivedAmount={state.receivedAmount}
              destinationWallet={state.destinationWallet}
              canSubmit={state.canSubmit}
            />
          </div>
        </form>
      </div>
      <TokenPickerModal
        visible={state.showTokenPicker}
        tokens={state.filteredTokens}
        selectedTokenId={state.selectedToken.id}
        searchQuery={state.searchQuery}
        onSearchChange={state.setSearchQuery}
        onSelect={state.handleTokenSelect}
        onClose={() => state.setShowTokenPicker(false)}
      />
      <PickContactModal
        open={state.showContactPicker}
        selectedAddress={state.destinationWallet}
        onSelect={state.setDestinationWallet}
        onClose={() => state.setShowContactPicker(false)}
      />
    </div>
  );
}
