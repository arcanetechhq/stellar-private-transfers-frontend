import type { AssetWithTrustline } from "@/entities/asset";

export interface DepositCanSubmitInput {
  selectedAsset: AssetWithTrustline | undefined;
  amount: string;
  numericAmount: number;
  numericBalance: number;
  hasPoolContract: boolean;
  hasStealthAddress: boolean;
  hasStealthScalar: boolean;
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
  if (input.numericAmount > input.numericBalance) {
    return false;
  }
  if (!input.hasPoolContract) {
    return false;
  }
  if (!input.hasStealthAddress) {
    return false;
  }
  if (!input.hasStealthScalar) {
    return false;
  }
  return !input.isSubmitting;
}
