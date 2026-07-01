import React from "react";
import "./deposit.css";
import { useTranslation } from "react-i18next";
import {
  DEPOSIT_NETWORK_OPTIONS,
  WALLET_DEPOSIT_NETWORK_ID,
  type DepositAddressMode,
  type DepositMode,
  parseDepositBalance,
} from "../lib";
import { useDepositAddressUi } from "../model/use-deposit-address-ui";
import { useCreateDeposit } from "../model/use-create-deposit";
import { DepositAddressPanel } from "./deposit-address-panel";
import { DepositAssetSelect } from "./deposit-asset-select";
import { DepositModeSwitch } from "./deposit-mode-switch";
import { DepositNetworkSelect } from "./deposit-network-select";
import { DepositWalletPanel } from "./deposit-wallet-panel";

function resolveDepositTitleKey(mode: DepositMode): string {
  if (mode === "wallet") {
    return "titleFromWallet";
  }
  if (mode === "privateAddress") {
    return "titlePrivateAddress";
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
  const numericBalance = parseDepositBalance(selectedAsset?.balance);
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
  const [depositMode, setDepositMode] = React.useState<DepositMode>("address");
  const addressMode: DepositAddressMode =
    depositMode === "privateAddress" ? "privateAddress" : "address";
  const addressUi = useDepositAddressUi(
    depositMode === "wallet" ? "address" : addressMode,
  );
  const isWalletDepositMode = depositMode === "wallet";
  const walletNetworkOptions = React.useMemo(
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

  function handleModeChange(mode: DepositMode) {
    setDepositMode(mode);
    addressUi.resetAddressState();
  }

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

          <DepositModeSwitch mode={depositMode} onModeChange={handleModeChange} />

          <div
            className="deposit-select-row"
            data-mode={isWalletDepositMode ? "wallet" : "address"}
          >
            <DepositNetworkSelect
              selectedNetworkId={
                isWalletDepositMode
                  ? WALLET_DEPOSIT_NETWORK_ID
                  : addressUi.selectedNetwork.id
              }
              disabled={addressUi.showAddressLoading}
              options={isWalletDepositMode ? walletNetworkOptions : undefined}
              onSelect={addressUi.selectNetwork}
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
              />
            ) : (
              <DepositAddressPanel
                selectedNetwork={addressUi.selectedNetwork}
                currentAddress={addressUi.currentDepositAddress}
                showAddressLoading={addressUi.showAddressLoading}
                showPrivateAddressEmpty={addressUi.showPrivateAddressEmpty}
                canRotateAddress={addressUi.canRotateAddress}
                isPrivateAddressMode={addressUi.isPrivateAddressMode}
                onGeneratePrivateAddress={addressUi.generatePrivateAddress}
                onGenerateNewAddress={addressUi.generateNewAddress}
              />
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
