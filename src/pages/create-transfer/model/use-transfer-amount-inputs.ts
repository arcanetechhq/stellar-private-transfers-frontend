import { useState } from "react";
import type { AssetWithTrustline } from "@/entities/asset";
import { isNumericDecimalInput } from "@/shared/lib/numeric-decimal-input";
import { PERCENTAGE_DIVISOR } from "./create-transfer";

export function useTransferAmountInputs(
  selectedAsset: AssetWithTrustline | undefined,
) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const numericBalance = selectedAsset
    ? Number.parseFloat(selectedAsset.balance ?? "0")
    : 0;
  const handlePercentage = (percentage: number) => {
    const value = (numericBalance * percentage) / PERCENTAGE_DIVISOR;
    setAmount(value.toString());
  };
  const handleMaxAmount = () => {
    if (selectedAsset?.balance) {
      setAmount(selectedAsset.balance.replaceAll(",", ""));
    }
  };
  const handleAmountChange = (value: string) => {
    if (value === "" || isNumericDecimalInput(value)) {
      setAmount(value);
    }
  };
  return {
    amount,
    handleAmountChange,
    recipient,
    setRecipient,
    handlePercentage,
    handleMaxAmount,
  };
}
