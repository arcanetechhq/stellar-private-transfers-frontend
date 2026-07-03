import React from "react";
import { useTranslation } from "react-i18next";
import type { DepositMode } from "../lib/deposit-mode";
import {
  DEPOSIT_NETWORK_OPTIONS,
  WALLET_DEPOSIT_NETWORK_ID,
} from "../lib/deposit-mock-data";
import { useDepositAddressUi } from "../model/use-deposit-address-ui";
import { useCreateDeposit } from "../model/use-create-deposit";
import { DepositAddressPanel } from "./deposit-address-panel";
import { DepositAssetSelect } from "./deposit-asset-select";
import { DepositModeSwitch } from "./deposit-mode-switch";
import { DepositNetworkSelect } from "./deposit-network-select";
import { DepositWalletPanel } from "./deposit-wallet-panel";

import "./deposit.css";

function resolveDepositTitleKey(mode: DepositMode): string {
  if (mode === "wallet") {
    return "titleFromWallet";
  }
  return "titlePublicAddress";
}

function buildWalletErrorMessage(
  amount: string,
  selectedAsset: { balance?: string; assetId: string } | undefined,
  submitErrorMessage: string | undefined,
  translate: (key: string, options?: Record<string, string>) => string,
): string | undefined {
  if (submitErrorMessage) {
    return submitErrorMessage;
  }

  const numericAmount = Number.parseFloat(amount);
  const numericBalance = Number.parseFloat(selectedAsset?.balance ?? "0");
  const hasAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const exceedsBalance =
    hasAmount &&
    Number.isFinite(numericBalance) &&
    numericAmount > numericBalance;

  if (!exceedsBalance) {
    return undefined;
  }

  const shortfall = numericAmount - numericBalance;
  const ticker = selectedAsset?.assetId.toUpperCase() ?? "";
  return translate("insufficientBalance", {
    amount: `${shortfall.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    })} ${ticker}`.trim(),
  });
}

export function CreateDeposit(): React.JSX.Element {
  const { t: translate } = useTranslation("deposit");
  const deposit = useCreateDeposit();
  const [depositMode, setDepositMode] = React.useState<DepositMode>("publicAddress");
  const addressUi = useDepositAddressUi();
  const isWalletDepositMode = depositMode === "wallet";
  const stellarNetworkOptions = React.useMemo(
    () =>
      DEPOSIT_NETWORK_OPTIONS.filter(
        (network) => network.id === WALLET_DEPOSIT_NETWORK_ID,
      ),
    [],
  );
  const walletErrorMessage = buildWalletErrorMessage(
    deposit.amount,
    deposit.selectedToken,
    deposit.submitErrorMessage,
    translate,
  );

  return (
    <div className="workspace__inner">
      <div className="deposit-route">
        <form
          className="deposit-flow"
          data-testid="deposit-crypto-screen"
          onSubmit={deposit.handleSubmit}
        >
          <h2 className="deposit-flow__title">
            {translate(resolveDepositTitleKey(depositMode))}
          </h2>

          <DepositModeSwitch
            mode={depositMode}
            onModeChange={setDepositMode}
          />

          <div
            className="deposit-select-row"
            data-mode={isWalletDepositMode ? "wallet" : "publicAddress"}
          >
            <DepositNetworkSelect
              selectedNetworkId={WALLET_DEPOSIT_NETWORK_ID}
              options={stellarNetworkOptions}
              onSelect={() => undefined}
            />

            {isWalletDepositMode ? (
              <DepositAssetSelect
                assets={deposit.assets}
                selectedAsset={deposit.selectedToken}
                onSelect={deposit.handleTokenSelect}
              />
            ) : null}
          </div>

          <div className="deposit-flow__body">
            {isWalletDepositMode ? (
              <DepositWalletPanel
                selectedAsset={deposit.selectedToken}
                amount={deposit.amount}
                canSubmit={deposit.canSubmit}
                isSubmitting={deposit.isSubmitting}
                errorMessage={walletErrorMessage}
                onAmountChange={deposit.handleAmountChange}
                onMaxAmount={deposit.handleMaxAmount}
                onPercentage={deposit.handlePercentage}
              />
            ) : (
              <DepositAddressPanel
                selectedNetwork={addressUi.selectedNetwork}
                publicAddress={addressUi.publicAddress}
                transferLink={addressUi.transferLink}
              />
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
