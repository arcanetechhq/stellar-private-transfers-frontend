import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { type AssetWithTrustline } from "@/entities/asset";
import { getMaxWithdrawStroops, selectCoinItems } from "@/entities/coin";
import { isValidStellarPublicAddress } from "@/shared/lib/stellar/is-valid-stellar-public-address";
import { amountInputToStroops } from "@/shared/lib/stellar/stroops";
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
  maxNoteStroops: bigint;
  destinationWallet: string;
}

function computeWithdrawalCanSubmit(input: WithdrawalCanSubmitInput): boolean {
  const numericAmount = parseWithdrawalAmountInput(input.amount);
  const amountStroops = amountInputToStroops(input.amount);
  return (
    input.senderPrivateAddress !== "" &&
    input.selectedAsset !== undefined &&
    input.amount !== "" &&
    !Number.isNaN(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= input.numericBalance &&
    amountStroops !== undefined &&
    amountStroops > 0n &&
    amountStroops <= input.maxNoteStroops &&
    input.destinationWallet !== "" &&
    isValidStellarPublicAddress(input.destinationWallet.trim())
  );
}

export function useCreateWithdrawal() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t: translate } = useTranslation("withdrawal");
  const { submit } = usePrivateWithdrawal();
  const [searchParameters] = useSearchParams();
  const assetIdFromUrl = searchParameters.get("assetId");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const coins = useAppSelector(selectCoinItems);
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
  const maxNoteStroops = useMemo(
    () =>
      getMaxWithdrawStroops({
        coins,
        privateAddress: withdrawalSender.senderPrivateAddress,
        assetId: selectedAsset?.assetId ?? "",
      }),
    [coins, selectedAsset?.assetId, withdrawalSender.senderPrivateAddress],
  );
  const amountStroops = amountInputToStroops(amountInputs.amount);
  const exceedsNoteLimit =
    amountStroops !== undefined &&
    amountStroops > 0n &&
    maxNoteStroops > 0n &&
    amountStroops > maxNoteStroops;
  const noteLimitAlert = exceedsNoteLimit
    ? {
        title: translate("amountExceedsNoteLimitTitle"),
        subtitle: translate("amountExceedsNoteLimitSubtitle"),
      }
    : undefined;
  const canSubmit = computeWithdrawalCanSubmit({
    senderPrivateAddress: withdrawalSender.senderPrivateAddress,
    selectedAsset,
    amount: amountInputs.amount,
    numericBalance: amountInputs.numericBalance,
    maxNoteStroops,
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
      connectedPublicKey: publicKey?.trim() ?? "",
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
    noteLimitAlert,
    step,
    successResult,
    handleOpenReview,
    handleCloseReview,
    handleConfirmWithdraw,
    handleSuccessDone,
    senderNonce: withdrawalSender.effectiveSenderNonce,
  };
}
