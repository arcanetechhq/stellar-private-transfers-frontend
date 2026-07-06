import type { AssetWithTrustline } from "@/entities/asset";

export interface DepositCanSubmitInput {
  selectedAsset: AssetWithTrustline | undefined;
  amount: string;
  numericAmount: number;
  spendableBalanceDisplay: number;
  hasPoolContract: boolean;
  hasPrivateAddress: boolean;
  hasPrivateAddressScalar: boolean;
  isSubmitting: boolean;
}

export function computeDepositCanSubmit(input: DepositCanSubmitInput): boolean {
  if (input.selectedAsset === undefined) {
    return false;
  }
  if (input.amount === "") {
    return false;
  }
  if (Number.isNaN(input.numericAmount)) {
    return false;
  }
  if (input.numericAmount <= 0) {
    return false;
  }
  if (input.numericAmount > input.spendableBalanceDisplay) {
    return false;
  }
  if (!input.hasPoolContract) {
    return false;
  }
  if (!input.hasPrivateAddress) {
    return false;
  }
  if (!input.hasPrivateAddressScalar) {
    return false;
  }
  return !input.isSubmitting;
}
