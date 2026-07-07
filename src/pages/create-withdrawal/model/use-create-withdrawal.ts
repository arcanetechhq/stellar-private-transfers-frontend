import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { type AssetWithTrustline } from "@/entities/asset";
import { isValidStellarPublicAddress } from "@/shared/lib/stellar/is-valid-stellar-public-address";
import { parseWithdrawalAmountInput } from "../lib/format-withdrawal-amount";
import type { PrivateWithdrawalSuccess } from "./private-withdrawal-success";
import { usePrivateWithdrawal } from "./use-private-withdrawal";
import { usePrivateWithdrawalSubmitHandler } from "./use-private-withdrawal-submit-handler";
import { useWithdrawalPrivateAssets } from "./use-withdrawal-private-assets";
import { useWithdrawalAmountInputs } from "./use-withdrawal-amount-inputs";
import {
  useWithdrawalFlowStepHandlers,
  type WithdrawalFlowStep,
} from "./use-withdrawal-flow-step-handlers";

export type { WithdrawalFlowStep } from "./use-withdrawal-flow-step-handlers";

interface WithdrawalCanSubmitInput {
  senderPrivateAddress: string;
  selectedAsset: AssetWithTrustline | undefined;
  amount: string;
  numericBalance: number;
  destinationWallet: string;
}

function computeWithdrawalCanSubmit(input: WithdrawalCanSubmitInput): boolean {
  const numericAmount = parseWithdrawalAmountInput(input.amount);
  return (
    input.senderPrivateAddress !== "" &&
    input.selectedAsset !== undefined &&
    input.amount !== "" &&
    !Number.isNaN(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= input.numericBalance &&
    input.destinationWallet !== "" &&
    isValidStellarPublicAddress(input.destinationWallet.trim())
  );
}

export function useCreateWithdrawal() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { submit } = usePrivateWithdrawal();
  const [searchParameters] = useSearchParams();
  const assetIdFromUrl = searchParameters.get("assetId");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<WithdrawalFlowStep>("form");
  const [successResult, setSuccessResult] = useState<
    PrivateWithdrawalSuccess | undefined
  >();
  const { withdrawalSender, privateAssets, tokenUi } =
    useWithdrawalPrivateAssets(assetIdFromUrl);
  const [destinationWallet, setDestinationWallet] = useState("");
  useEffect(() => {
    setDestinationWallet(publicKey ?? "");
  }, [publicKey]);
  const selectedAsset = tokenUi.selectedToken;
  const amountInputs = useWithdrawalAmountInputs(selectedAsset);
  const canSubmit = computeWithdrawalCanSubmit({
    senderPrivateAddress: withdrawalSender.senderPrivateAddress,
    selectedAsset,
    amount: amountInputs.amount,
    numericBalance: amountInputs.numericBalance,
    destinationWallet,
  });
  const numericAmount = parseWithdrawalAmountInput(amountInputs.amount);
  const destinationTrim = destinationWallet.trim();
  const { submitError, setSubmitError, handleConfirmWithdraw } =
    usePrivateWithdrawalSubmitHandler({
      dispatch,
      canSubmit,
      setIsSubmitting,
      selectedAsset,
      submit,
      navigate,
      senderPrivateAddress: withdrawalSender.senderPrivateAddress,
      destinationTrim,
      numericAmount: Number.isNaN(numericAmount) ? 0 : numericAmount,
      onSuccess: (result) => {
        setSuccessResult(result);
        setStep("success");
      },
    });
  const { handleOpenReview, handleCloseReview, handleSuccessDone } =
    useWithdrawalFlowStepHandlers({
      navigate,
      canSubmit,
      isSubmitting,
      setSubmitError,
      setStep,
    });

  return {
    assets: privateAssets,
    selectedToken: selectedAsset,
    handleTokenSelect: tokenUi.handleTokenSelect,
    amount: amountInputs.amount,
    handleAmountChange: amountInputs.handleAmountChange,
    handlePercentage: amountInputs.handlePercentage,
    handleMaxAmount: amountInputs.handleMaxAmount,
    destinationWallet,
    receivedAmount: amountInputs.receivedAmount,
    canSubmit,
    isSubmitting,
    submitError,
    step,
    successResult,
    handleOpenReview,
    handleCloseReview,
    handleConfirmWithdraw,
    handleSuccessDone,
    senderNonce: withdrawalSender.effectiveSenderNonce,
  };
}
