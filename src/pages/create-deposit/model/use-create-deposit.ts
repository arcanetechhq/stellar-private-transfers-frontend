import { type FormEvent, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store";
import { useCreatePrivateAddress } from "@/features/create-private-address";
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
  privateAddress: string;
}) => Promise<SubmitDepositResult>;

type SubmitDepositSuccessParameters = {
  submitDeposit: SubmitDepositFunction;
  dispatch: ReturnType<typeof useAppDispatch>;
  navigate: ReturnType<typeof useNavigate>;
  selectedAsset: AssetWithTrustline;
  numericAmount: number;
  destinationPrivateAddressPreview: string;
};

async function submitDepositSuccessFlow({
  submitDeposit,
  dispatch,
  navigate,
  selectedAsset,
  numericAmount,
  destinationPrivateAddressPreview,
}: SubmitDepositSuccessParameters) {
  const trimmedDestinationPrivateAddress = destinationPrivateAddressPreview.trim();
  const result = await submitDeposit({
    asset: selectedAsset,
    amountDisplay: numericAmount,
    privateAddress: trimmedDestinationPrivateAddress,
  });
  dispatch(
    addTransaction(
      buildUserTransaction({
        txId: result.txId,
        type: "deposit",
        assetId: result.assetId,
        amount: result.amountDisplay,
        counterparty: trimmedDestinationPrivateAddress,
        senderPrivateAddress: trimmedDestinationPrivateAddress,
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
  const { create: createPrivateAddress, status: createPrivateAddressStatus } =
    useCreatePrivateAddress(publicKey);
  const {
    mutateAsync: submitDeposit,
    isPending: isSubmitting,
    error: submitError,
  } = useDepositTransaction();
  const form = useCreateDepositForm({ isSubmitting });
  const shouldGeneratePrivateAddress =
    !form.destinationPrivateAddressPreview.trim();
  const isGeneratingPrivateAddress = createPrivateAddressStatus === "pending";
  const isActionPending = isSubmitting || isGeneratingPrivateAddress;
  const canSubmitAction = shouldGeneratePrivateAddress
    ? Boolean(publicKey?.trim()) && !isActionPending
    : form.canSubmit;

  const handleSubmit = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    if (shouldGeneratePrivateAddress) {
      if (form.selectedPrivateAddressNonce?.trim()) {
        await createPrivateAddress(form.selectedPrivateAddressNonce);
        return;
      }
      await createPrivateAddress();
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
        destinationPrivateAddressPreview: form.destinationPrivateAddressPreview,
      });
    } catch {
      return;
    }
  }, [
    createPrivateAddress,
    dispatch,
    form.canSubmit,
    form.destinationPrivateAddressPreview,
    form.numericAmount,
    form.selectedAsset,
    form.selectedPrivateAddressNonce,
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
    selectedPrivateAddressNonce: form.selectedPrivateAddressNonce,
    destinationPrivateAddressPreview: form.destinationPrivateAddressPreview,
    isSubmitting: isActionPending,
    shouldGeneratePrivateAddress,
    submitErrorMessage: submitError?.message,
  };
}
