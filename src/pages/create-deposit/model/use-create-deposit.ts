import { type FormEvent, useCallback, useState } from "react";
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
  const { ensureWalletPrivateAddress, ensureWalletScalar } =
    useWalletPrivateAddress();
  const {
    mutateAsync: submitDeposit,
    isPending: isSubmitting,
    error: submitError,
  } = useDepositTransaction();
  const form = useCreateDepositForm({ isSubmitting });
  const [isPreparingWallet, setIsPreparingWallet] = useState(false);
  const isActionPending = isSubmitting || isPreparingWallet;

  const handleSubmit = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    if (!form.selectedAsset || isActionPending) {
      return;
    }
    setIsPreparingWallet(true);
    try {
      const privateAddress = await ensureWalletPrivateAddress();
      await ensureWalletScalar();
      if (!form.canSubmit) {
        return;
      }
      await submitDepositSuccessFlow({
        submitDeposit,
        dispatch,
        navigate,
        selectedAsset: form.selectedAsset,
        numericAmount: form.numericAmount,
        destinationPrivateAddressPreview: privateAddress,
        walletPublicKey,
      });
    } catch (error: unknown) {
      console.error("Deposit failed:", error);
    } finally {
      setIsPreparingWallet(false);
    }
  }, [
    dispatch,
    ensureWalletPrivateAddress,
    ensureWalletScalar,
    form.canSubmit,
    form.destinationPrivateAddressPreview,
    form.numericAmount,
    form.selectedAsset,
    isActionPending,
    navigate,
    submitDeposit,
    walletPublicKey,
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
    canSubmit: form.canSubmit && !isActionPending,
    selectedPrivateAddressNonce: form.selectedPrivateAddressNonce,
    destinationPrivateAddressPreview: form.destinationPrivateAddressPreview,
    isSubmitting: isActionPending,
    shouldGeneratePrivateAddress: false,
    submitErrorMessage: submitError?.message,
  };
}
