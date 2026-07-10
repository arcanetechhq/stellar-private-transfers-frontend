import type { AssetWithTrustline } from "@/entities/asset";
import { depositAmountInputToStroops } from "../lib/compute-deposit-spendable-balance";

export interface DepositCanSubmitInput {
  selectedAsset: AssetWithTrustline | undefined;
  amount: string;
  spendableBalanceStroops: bigint;
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
  const amountStroops = depositAmountInputToStroops(input.amount);
  if (amountStroops === undefined || amountStroops <= 0n) {
    return false;
  }
  if (amountStroops > input.spendableBalanceStroops) {
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
