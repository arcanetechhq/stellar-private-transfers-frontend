import { type FormEvent, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store";
import { useWalletPrivateAddress } from "@/features/register-private-address";
import type { AssetWithTrustline } from "@/entities/asset";
import { selectWalletPublicKey } from "@/entities/wallet";
import { addTransaction, buildUserTransaction } from "@/entities/transaction";
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
  walletPublicKey: string;
};

async function submitDepositSuccessFlow({
  submitDeposit,
  dispatch,
  navigate,
  selectedAsset,
  numericAmount,
  destinationPrivateAddressPreview,
  walletPublicKey,
}: SubmitDepositSuccessParameters) {
  const trimmedDestinationPrivateAddress = destinationPrivateAddressPreview.trim();
  const trimmedWalletPublicKey = walletPublicKey.trim();
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
        counterparty: trimmedWalletPublicKey,
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
      flow: "deposit",
    },
  });
}

export function useCreateDeposit() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const walletPublicKey = useAppSelector(selectWalletPublicKey) ?? "";
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
          dispatch,
          navigate,
          selectedAsset: form.selectedAsset,
          numericAmount: form.numericAmount,
          destinationPrivateAddressPreview: trimmedPrivateAddress,
          walletPublicKey,
        });
      } catch (error: unknown) {
        console.error("Deposit failed:", error);
      }
    },
    [
      dispatch,
      form.canSubmit,
      form.numericAmount,
      form.selectedAsset,
      isSubmitting,
      navigate,
      privateAddressStpl1,
      submitDeposit,
      walletPublicKey,
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
