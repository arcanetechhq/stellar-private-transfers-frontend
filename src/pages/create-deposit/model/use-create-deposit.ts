import { type FormEvent, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store";
import { useCreateStealthAddress } from "@/features/create-stealth-address";
import type { AssetWithTrustline } from "@/entities/asset";
import { addTransaction, buildUserTransaction } from "@/entities/transaction";
import { selectWalletPublicKey } from "@/entities/wallet";
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
  stealthAddress: string;
}) => Promise<SubmitDepositResult>;

type SubmitDepositSuccessParameters = {
  submitDeposit: SubmitDepositFunction;
  dispatch: ReturnType<typeof useAppDispatch>;
  navigate: ReturnType<typeof useNavigate>;
  selectedAsset: AssetWithTrustline;
  numericAmount: number;
  destinationStealthPreview: string;
};

async function submitDepositSuccessFlow({
  submitDeposit,
  dispatch,
  navigate,
  selectedAsset,
  numericAmount,
  destinationStealthPreview,
}: SubmitDepositSuccessParameters) {
  const trimmedDestinationStealth = destinationStealthPreview.trim();
  const result = await submitDeposit({
    asset: selectedAsset,
    amountDisplay: numericAmount,
    stealthAddress: trimmedDestinationStealth,
  });
  dispatch(
    addTransaction(
      buildUserTransaction({
        txId: result.txId,
        type: "deposit",
        assetId: result.assetId,
        amount: result.amountDisplay,
        counterparty: trimmedDestinationStealth,
        senderStealthAddress: trimmedDestinationStealth,
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
}

export function useCreateDeposit() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { create: createStealthAddress, status: createStealthStatus } =
    useCreateStealthAddress(publicKey);
  const {
    mutateAsync: submitDeposit,
    isPending: isSubmitting,
    error: submitError,
  } = useDepositTransaction();
  const form = useCreateDepositForm({ isSubmitting });
  const shouldGeneratePrivateAddress =
    !form.destinationStealthPreview.trim();
  const isGeneratingPrivateAddress = createStealthStatus === "pending";
  const isActionPending = isSubmitting || isGeneratingPrivateAddress;
  const canSubmitAction = shouldGeneratePrivateAddress
    ? Boolean(publicKey?.trim()) && !isActionPending
    : form.canSubmit;

  const handleSubmit = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    if (shouldGeneratePrivateAddress) {
      if (form.selectedStealthNonce?.trim()) {
        await createStealthAddress(form.selectedStealthNonce);
        return;
      }
      await createStealthAddress();
      return;
    }
    if (!form.canSubmit || !form.selectedAsset) {
      return;
    }
    try {
      await submitDepositSuccessFlow({
        submitDeposit,
        dispatch,
        navigate,
        selectedAsset: form.selectedAsset,
        numericAmount: form.numericAmount,
        destinationStealthPreview: form.destinationStealthPreview,
      });
    } catch {
      return;
    }
  }, [
    createStealthAddress,
    dispatch,
    form.canSubmit,
    form.destinationStealthPreview,
    form.numericAmount,
    form.selectedAsset,
    form.selectedStealthNonce,
    navigate,
    shouldGeneratePrivateAddress,
    submitDeposit,
  ]);

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
    canSubmit: canSubmitAction,
    selectedStealthNonce: form.selectedStealthNonce,
    destinationStealthPreview: form.destinationStealthPreview,
    isSubmitting: isActionPending,
    shouldGeneratePrivateAddress,
    submitErrorMessage: submitError?.message,
  };
}
