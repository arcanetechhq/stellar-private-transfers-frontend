import React from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AssetPickerModal } from "@/features/pick-asset";
import {
  StealthAddressSelect,
  stealthAddressSelectLabelClassName,
} from "@/features/pick-stealth-address";
import type { StealthAddressState } from "@/entities/stealth-address";
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
      <h1 className="text-[32px] leading-10 font-semibold text-[var(--foreground-primary)]">
        {translate("pageTitle")}
      </h1>
      <p className="mt-1 text-base leading-6 text-[var(--foreground-secondary)]">
        {translate("pageSubtitle")}
      </p>
    </div>
  );
}

interface SenderFieldProperties {
  label: string;
  placeholder: string;
  senderNonce: string | undefined;
  onSenderNonceChange: (value: string) => void;
  nonces: string[];
  byNonce: StealthAddressState["byNonce"];
}

function SenderField(properties: SenderFieldProperties) {
  const {
    label,
    placeholder,
    senderNonce,
    onSenderNonceChange,
    nonces,
    byNonce,
  } = properties;
  return (
    <StealthAddressSelect
      label={label}
      triggerId="withdrawal-sender-stealth"
      value={senderNonce}
      onValueChange={onSenderNonceChange}
      placeholder={placeholder}
      nonces={nonces}
      byNonce={byNonce}
      labelClassName={stealthAddressSelectLabelClassName}
    />
  );
}

export function CreateWithdrawal() {
  const state = useCreateWithdrawal();
  const { t: translate } = useTranslation("withdrawal");

  return (
    <div className="min-h-full bg-[var(--surface-primary)] p-8">
      <div className="mx-auto max-w-5xl">
        <PageHeader onGoBack={state.handleGoBack} />
        <form onSubmit={state.handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
                <div className="space-y-6">
                  <SenderField
                    label={translate("senderStealth")}
                    placeholder={translate("senderStealthPlaceholder")}
                    senderNonce={state.senderNonce}
                    onSenderNonceChange={state.setSenderNonce}
                    nonces={state.nonces}
                    byNonce={state.byNonce}
                  />
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
              isSubmitting={state.isSubmitting}
              submitError={state.submitError}
            />
          </div>
        </form>
      </div>
      {state.showTokenPicker && (
        <AssetPickerModal
          assets={state.assets}
          customAssetFilter={(asset) =>
            Number.parseFloat(asset.balance ?? "0") > 0
          }
          selectedAssetId={state.selectedToken?.assetId}
          onSelect={state.handleTokenSelect}
          onClose={() => state.setShowTokenPicker(false)}
        />
      )}
    </div>
  );
}
