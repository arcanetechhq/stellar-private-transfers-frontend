import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { type AssetWithTrustline } from "@/entities/asset";
import { getMaxWithdrawStroops, selectCoinItems } from "@/entities/coin";
import { isValidStellarPublicAddress } from "@/shared/lib/stellar/is-valid-stellar-public-address";
import { amountInputToStroops } from "@/shared/lib/stellar/stroops";
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
  const exceedsNoteLimit =
    amountStroops !== undefined &&
    amountStroops > ZERO_STROOPS &&
    maxNoteStroops > ZERO_STROOPS &&
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
    handleMaxAmount: amountInputs.handleMaxAmount,
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
