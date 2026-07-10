import React from "react";
import "@/shared/styles/transfer-flow.css";
import { useTranslation } from "react-i18next";
import type { AssetWithTrustline } from "@/entities/asset";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops";
import type { DepositMode } from "../lib/deposit-mode";
import {
  computeDepositSpendableBalanceStroops,
  depositAmountInputToStroops,
  isNativeXlmDepositAsset,
  NATIVE_XLM_DEPOSIT_RESERVE_XLM,
} from "../lib/compute-deposit-spendable-balance";
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
  selectedAsset: AssetWithTrustline | undefined,
  submitErrorMessage: string | undefined,
  translate: (key: string, options?: Record<string, string>) => string,
): string | undefined {
  if (submitErrorMessage) {
    return submitErrorMessage;
  }

  const amountStroops = depositAmountInputToStroops(amount);
  if (amountStroops === undefined || amountStroops <= 0n) {
    return undefined;
  }

  const balanceStroops =
    depositAmountInputToStroops(selectedAsset?.balance ?? "0") ?? 0n;
  const spendableBalanceStroops = computeDepositSpendableBalanceStroops(
    selectedAsset,
    selectedAsset?.balance,
  );
  const exceedsSpendableBalance = amountStroops > spendableBalanceStroops;

  if (
    exceedsSpendableBalance &&
    isNativeXlmDepositAsset(selectedAsset) &&
    amountStroops <= balanceStroops
  ) {
    return translate("nativeXlmReserveRequired", {
      amount: NATIVE_XLM_DEPOSIT_RESERVE_XLM.toString(),
    });
  }

  const exceedsBalance = amountStroops > balanceStroops;
  if (!exceedsBalance && !exceedsSpendableBalance) {
    return undefined;
  }

  const shortfallStroops = exceedsSpendableBalance
    ? amountStroops - spendableBalanceStroops
    : amountStroops - balanceStroops;
  const shortfall = stroopsToDisplayAmount(shortfallStroops);
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
  const [depositMode, setDepositMode] = React.useState<DepositMode>("wallet");
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

          {/* <DepositNetworkSelect
            selectedNetworkId={WALLET_DEPOSIT_NETWORK_ID}
            options={stellarNetworkOptions}
            onSelect={() => undefined}
          /> */}

          {isWalletDepositMode && (
            <div
              className="deposit-select-row"
              data-mode={isWalletDepositMode ? "wallet" : "publicAddress"}
            >
              <DepositAssetSelect
                assets={deposit.assets}
                selectedAsset={deposit.selectedToken}
                onSelect={deposit.handleTokenSelect}
              />
            </div>
          )}

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
