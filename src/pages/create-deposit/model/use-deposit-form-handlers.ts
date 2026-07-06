import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { AssetWithTrustline } from "@/entities/asset";
import { isNumericDecimalInput } from "@/shared/lib/numeric-decimal-input";
import { formatDepositSpendableBalanceInput } from "../lib/compute-deposit-spendable-balance";
import { PERCENTAGE_DIVISOR } from "./create-deposit";

export interface UseDepositFormHandlersInput {
  spendableBalanceDisplay: number;
  selectedAsset: AssetWithTrustline | undefined;
  setAmount: Dispatch<SetStateAction<string>>;
  setSelectedToken: Dispatch<SetStateAction<AssetWithTrustline | undefined>>;
  setShowTokenPicker: Dispatch<SetStateAction<boolean>>;
}

export function useDepositFormHandlers({
  spendableBalanceDisplay,
  selectedAsset,
  setAmount,
  setSelectedToken,
  setShowTokenPicker,
}: UseDepositFormHandlersInput) {
  const handleTokenSelect = useCallback(
    (asset: AssetWithTrustline) => {
      setSelectedToken(asset);
      setShowTokenPicker(false);
    },
    [setSelectedToken, setShowTokenPicker],
  );

  const handleAmountChange = useCallback(
    (value: string) => {
      if (value === "" || isNumericDecimalInput(value)) {
        setAmount(value);
      }
    },
    [setAmount],
  );

  const handlePercentage = useCallback(
    (percentage: number) => {
      const value =
        (spendableBalanceDisplay * percentage) / PERCENTAGE_DIVISOR;
      setAmount(value.toString());
    },
    [spendableBalanceDisplay, setAmount],
  );

  const handleMaxAmount = useCallback(() => {
    if (!selectedAsset?.balance) {
      return;
    }
    setAmount(
      formatDepositSpendableBalanceInput(
        selectedAsset,
        selectedAsset.balance,
      ),
    );
  }, [selectedAsset, setAmount]);

  return {
    handleTokenSelect,
    handleAmountChange,
    handlePercentage,
    handleMaxAmount,
  };
}
