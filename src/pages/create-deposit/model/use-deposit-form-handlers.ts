import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { AssetWithTrustline } from "@/entities/asset";
import { PERCENTAGE_DIVISOR } from "./create-deposit";
import { isNumericDecimalInput } from "../lib/validation";

export interface UseDepositFormHandlersInput {
  numericBalance: number;
  selectedAsset: AssetWithTrustline | undefined;
  setAmount: Dispatch<SetStateAction<string>>;
  setSelectedToken: Dispatch<SetStateAction<AssetWithTrustline | undefined>>;
  setShowTokenPicker: Dispatch<SetStateAction<boolean>>;
  setSelectedStealthNonce: Dispatch<SetStateAction<string | undefined>>;
  setSelectedStealthAddress: Dispatch<SetStateAction<string>>;
}

export function useDepositFormHandlers({
  numericBalance,
  selectedAsset,
  setAmount,
  setSelectedToken,
  setShowTokenPicker,
  setSelectedStealthNonce,
  setSelectedStealthAddress,
}: UseDepositFormHandlersInput) {
  const handleStealthSelect = useCallback(
    (nonce: string, address: string) => {
      setSelectedStealthNonce(nonce);
      setSelectedStealthAddress(address);
    },
    [setSelectedStealthAddress, setSelectedStealthNonce],
  );

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
      const value = (numericBalance * percentage) / PERCENTAGE_DIVISOR;
      setAmount(value.toString());
    },
    [numericBalance, setAmount],
  );

  const handleMaxAmount = useCallback(() => {
    if (selectedAsset?.balance) {
      setAmount(selectedAsset.balance);
    }
  }, [selectedAsset?.balance, setAmount]);

  return {
    handleStealthSelect,
    handleTokenSelect,
    handleAmountChange,
    handlePercentage,
    handleMaxAmount,
  };
}
