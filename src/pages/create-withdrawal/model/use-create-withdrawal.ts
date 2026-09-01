import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { type AssetWithTrustline } from "@/entities/asset";
import { getMaxWithdrawStroops, selectCoinItems } from "@/entities/coin";
import { isValidStellarPublicAddress } from "@/shared/lib/stellar/is-valid-stellar-public-address";
import {
  amountInputToStroops,
  stroopsToAmountInputString,
} from "@/shared/lib/stellar/stroops";
import { ZERO_STROOPS } from "@/shared/lib/privacy-sdk/constants";
import { parseWithdrawalAmountInput } from "../lib/format-withdrawal-amount";
import { useWithdrawalPrivateAssets } from "./use-withdrawal-private-assets";
import { useWithdrawalAmountInputs } from "./use-withdrawal-amount-inputs";
import { useWithdrawalConfirmSlice } from "./use-withdrawal-confirm-slice";

export type { WithdrawalFlowStep } from "./use-withdrawal-flow-step-handlers";

interface WithdrawalCanSubmitInput {
  senderPrivateAddress: string;
  selectedAsset: AssetWithTrustline | undefined;
  amount: string;
  numericBalance: number;
  maxNoteStroops: bigint;
  destinationWallet: string;
}

function hasValidWithdrawalAmount(input: WithdrawalCanSubmitInput): boolean {
  const numericAmount = parseWithdrawalAmountInput(input.amount);
  const amountStroops = amountInputToStroops(input.amount);
  return (
    input.amount !== "" &&
    !Number.isNaN(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= input.numericBalance &&
    amountStroops !== undefined &&
    amountStroops > ZERO_STROOPS &&
    amountStroops <= input.maxNoteStroops
  );
}

function computeWithdrawalCanSubmit(input: WithdrawalCanSubmitInput): boolean {
  return (
    input.senderPrivateAddress !== "" &&
    input.selectedAsset !== undefined &&
    hasValidWithdrawalAmount(input) &&
    input.destinationWallet !== "" &&
    isValidStellarPublicAddress(input.destinationWallet.trim())
  );
}

function maxWithdrawInput(maxNoteStroops: bigint): string | undefined {
  if (maxNoteStroops <= ZERO_STROOPS) {
    return undefined;
  }
  return stroopsToAmountInputString(maxNoteStroops);
}

function bindWithdrawMaxHandler(input: {
  maxAmountInput: string | undefined;
  fallback: () => void;
  changeAmount: (value: string) => void;
}): () => void {
  return () => {
    if (input.maxAmountInput) {
      input.changeAmount(input.maxAmountInput);
      return;
    }
    input.fallback();
  };
}

function withdrawalNoteLimitAlert(input: {
  translate: (key: string) => string;
  amountStroops: bigint | undefined;
  maxNoteStroops: bigint;
}): { title: string; subtitle: string } | undefined {
  const exceeds =
    input.amountStroops !== undefined &&
    input.amountStroops > ZERO_STROOPS &&
    input.maxNoteStroops > ZERO_STROOPS &&
    input.amountStroops > input.maxNoteStroops;
  if (!exceeds) {
    return undefined;
  }
  return {
    title: input.translate("amountExceedsNoteLimitTitle"),
    subtitle: input.translate("amountExceedsNoteLimitSubtitle"),
  };
}

export function useCreateWithdrawal() {
  const { t: translate } = useTranslation("withdrawal");
  const [searchParameters] = useSearchParams();
  const assetIdFromUrl = searchParameters.get("assetId");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const coins = useAppSelector(selectCoinItems);
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
  const noteLimitAlert = withdrawalNoteLimitAlert({
    translate,
    amountStroops,
    maxNoteStroops,
  });
  const canSubmit = computeWithdrawalCanSubmit({
    senderPrivateAddress: withdrawalSender.senderPrivateAddress,
    selectedAsset,
    amount: amountInputs.amount,
    numericBalance: amountInputs.numericBalance,
    maxNoteStroops,
    destinationWallet,
  });
  const numericAmount = parseWithdrawalAmountInput(amountInputs.amount);
  const maxAmountInput = maxWithdrawInput(maxNoteStroops);
  const confirm = useWithdrawalConfirmSlice({
    canSubmit,
    selectedAsset,
    senderPrivateAddress: withdrawalSender.senderPrivateAddress,
    destinationTrim: destinationWallet.trim(),
    numericAmount: Number.isNaN(numericAmount) ? 0 : numericAmount,
  });
  return {
    assets: privateAssets,
    selectedToken: selectedAsset,
    handleTokenSelect: tokenUi.handleTokenSelect,
    amount: amountInputs.amount,
    handleAmountChange: amountInputs.handleAmountChange,
    handlePercentage: amountInputs.handlePercentage,
    handleMaxAmount: bindWithdrawMaxHandler({
      maxAmountInput,
      fallback: amountInputs.handleMaxAmount,
      changeAmount: amountInputs.handleAmountChange,
    }),
    destinationWallet,
    receivedAmount: amountInputs.receivedAmount,
    canSubmit,
    isSubmitting: confirm.isSubmitting,
    submitError: confirm.submitError,
    noteLimitAlert,
    step: confirm.step,
    successResult: confirm.successResult,
    handleOpenReview: confirm.handleOpenReview,
    handleCloseReview: confirm.handleCloseReview,
    handleConfirmWithdraw: confirm.handleConfirmWithdraw,
    handleRetry: confirm.handleRetry,
    handleFallback: confirm.handleFallback,
    relayAction: confirm.relayAction,
    handleSuccessDone: confirm.handleSuccessDone,
    senderNonce: withdrawalSender.effectiveSenderNonce,
  };
}
