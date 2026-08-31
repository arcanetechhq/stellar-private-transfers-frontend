import { type FormEvent, useCallback } from "react";
import { useNavigate } from "react-router";
import { useWalletPrivateAddress } from "@/features/register-private-address";
import type { AssetWithTrustline } from "@/entities/asset";
import { useDepositTransaction } from "@/features/deposit";
import { useCreateDepositForm } from "./use-create-deposit-form";

type SubmitDepositResult = {
  txId: string;
  assetId: string;
  amountDisplay: number;
  poolContract: string;
};

type SubmitDepositFunction = (parameters: {
  asset: AssetWithTrustline;
  amountDisplay: number;
  privateAddress: string;
}) => Promise<SubmitDepositResult>;

async function submitDepositSuccessFlow(input: {
  submitDeposit: SubmitDepositFunction;
  navigate: ReturnType<typeof useNavigate>;
  selectedAsset: AssetWithTrustline;
  numericAmount: number;
  destinationPrivateAddressPreview: string;
}) {
  const result = await input.submitDeposit({
    asset: input.selectedAsset,
    amountDisplay: input.numericAmount,
    privateAddress: input.destinationPrivateAddressPreview.trim(),
  });
  input.navigate(`/transfer-success/${encodeURIComponent(result.txId)}`, {
    state: {
      amount: result.amountDisplay,
      assetId: result.assetId,
      poolContract: result.poolContract,
      txId: result.txId,
      flow: "deposit",
    },
  });
}

export function useCreateDeposit() {
  const navigate = useNavigate();
  const { privateAddressStpl1 } = useWalletPrivateAddress();
  const {
    mutateAsync: submitDeposit,
    isPending: isSubmitting,
    error: submitError,
  } = useDepositTransaction();
  const form = useCreateDepositForm({ isSubmitting });

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const trimmedPrivateAddress = privateAddressStpl1.trim();
      if (!form.selectedAsset || !form.canSubmit || isSubmitting || !trimmedPrivateAddress) {
        return;
      }
      try {
        await submitDepositSuccessFlow({
          submitDeposit,
          navigate,
          selectedAsset: form.selectedAsset,
          numericAmount: form.numericAmount,
          destinationPrivateAddressPreview: trimmedPrivateAddress,
        });
      } catch (error: unknown) {
        console.error("Deposit failed:", error);
      }
    },
    [
      form.canSubmit,
      form.numericAmount,
      form.selectedAsset,
      isSubmitting,
      navigate,
      privateAddressStpl1,
      submitDeposit,
    ],
  );

  return {
    assets: form.assets,
    navigate,
    showTokenPicker: form.showTokenPicker,
    setShowTokenPicker: form.setShowTokenPicker,
    selectedToken: form.selectedToken,
    amount: form.amount,
    handleTokenSelect: form.handleTokenSelect,
    handleAmountChange: form.handleAmountChange,
    handlePercentage: form.handlePercentage,
    handleMaxAmount: form.handleMaxAmount,
    networkFee: form.networkFee,
    receivedAmount: form.receivedAmount,
    handleSubmit,
    canSubmit: form.canSubmit && !isSubmitting,
    selectedPrivateAddressNonce: form.selectedPrivateAddressNonce,
    destinationPrivateAddressPreview: form.destinationPrivateAddressPreview,
    isSubmitting,
    shouldGeneratePrivateAddress: false,
    submitErrorMessage: submitError?.message,
  };
}
