import { type FormEvent, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "@/app/hooks";
import {
  addTransaction,
  buildUserTransaction,
} from "@/entities/transaction";
import { useDepositTransaction } from "@/features/deposit";
import { useCreateDepositForm } from "./use-create-deposit-form";

export function useCreateDeposit() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    mutateAsync: submitDeposit,
    isPending: isSubmitting,
    error: submitError,
  } = useDepositTransaction();
  const form = useCreateDepositForm({ isSubmitting });

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!form.canSubmit || !form.selectedAsset) {
        return;
      }
      try {
        const result = await submitDeposit({
          asset: form.selectedAsset,
          amountDisplay: form.numericAmount,
          stealthAddress: form.destinationStealthPreview.trim(),
        });
        const destinationStealth = form.destinationStealthPreview.trim();
        dispatch(
          addTransaction(
            buildUserTransaction({
              txId: result.txId,
              type: "deposit",
              assetId: result.assetId,
              amount: result.amountDisplay,
              counterparty: destinationStealth,
              senderStealthAddress: destinationStealth,
            }),
          ),
        );
        navigate(`/transfer-success/${encodeURIComponent(result.txId)}`, {
          state: {
            amount: result.amountDisplay,
            assetId: result.assetId,
            poolContract: result.poolContract,
            txId: result.txId,
          },
        });
      } catch {
        return;
      }
    },
    [
      dispatch,
      form.canSubmit,
      form.destinationStealthPreview,
      form.numericAmount,
      form.selectedAsset,
      navigate,
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
    canSubmit: form.canSubmit,
    selectedStealthNonce: form.selectedStealthNonce,
    handleStealthSelect: form.handleStealthSelect,
    destinationStealthPreview: form.destinationStealthPreview,
    isSubmitting,
    submitErrorMessage: submitError?.message,
  };
}
