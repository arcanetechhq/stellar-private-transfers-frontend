import { useMemo, useState } from "react";
import { type AssetWithTrustline } from "@/entities/asset";
import { isNumericDecimalInput } from "@/shared/lib/numeric-decimal-input";
import {
  parseWithdrawalAmountInput,
  parseWithdrawalBalance,
} from "../lib/format-withdrawal-amount";
import { PERCENTAGE_DIVISOR } from "./create-withdrawal";

export function useWithdrawalAmountInputs(
  selectedAsset: AssetWithTrustline | undefined,
) {
  const [amount, setAmount] = useState("");
  const numericBalance = parseWithdrawalBalance(selectedAsset?.balance);
  const handlePercentage = (percentage: number) => {
    setAmount(((numericBalance * percentage) / PERCENTAGE_DIVISOR).toString());
  };
  const handleMaxAmount = () => {
    if (selectedAsset?.balance) {
      setAmount(selectedAsset.balance.replaceAll(",", ""));
    }
  };
  const receivedAmount = useMemo(() => {
    if (!amount) {
      return 0;
    }
    return parseWithdrawalAmountInput(amount);
  }, [amount]);
  const handleAmountChange = (value: string) => {
    if (value === "" || isNumericDecimalInput(value)) {
      setAmount(value);
    }
  };
  return {
    amount,
    handleAmountChange,
    handlePercentage,
    handleMaxAmount,
    receivedAmount,
    numericBalance,
  };
}
