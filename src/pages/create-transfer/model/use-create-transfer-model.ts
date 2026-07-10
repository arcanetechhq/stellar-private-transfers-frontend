import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { getMaxWithdrawStroops, selectCoinItems } from "@/entities/coin";
import { selectWalletPublicKey } from "@/entities/wallet";
import { amountInputToStroops } from "@/shared/lib/stellar/stroops";
import { useWalletPrivateAddress } from "@/features/register-private-address";
import type { ConfidentialTransferSuccess } from "./confidential-transfer-submit-flow";
import { useConfidentialTransferSubmitHandler } from "./use-confidential-transfer-submit-handler";
import { useConfidentialTransfer } from "./use-confidential-transfer";
import { useTransferRecipientAndSubmitGates } from "./use-transfer-validation";
import { useRecipientRegistryStatus } from "./use-recipient-registry-status";
import { useTransferAssetModel } from "./use-transfer-asset-model";
import type { TransferFlowStep } from "./use-transfer-flow-step-handlers";

export function useCreateTransferModel() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t: translate } = useTranslation("transfer");
  const { submit } = useConfidentialTransfer();
  const [searchParameters] = useSearchParams();
  const assetIdFromUrl = searchParameters.get("assetId");
  const recipientFromUrl = searchParameters.get("recipient") ?? "";
  const publicKey = useAppSelector(selectWalletPublicKey);
  const coins = useAppSelector(selectCoinItems);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingWallet, setIsPreparingWallet] = useState(false);
  const [step, setStep] = useState<TransferFlowStep>("form");
  const [successResult, setSuccessResult] = useState<
    ConfidentialTransferSuccess | undefined
  >();
  const {
    privateAddressStpl1: senderPrivateAddress,
    defaultNonce: senderNonce,
    actionsEnabled,
    ensureWalletPrivateAddress,
    ensureWalletScalar,
  } = useWalletPrivateAddress();
  const { assets, tokenUi, amountInputs, selectedAsset } = useTransferAssetModel(
    senderPrivateAddress,
    assetIdFromUrl,
    recipientFromUrl,
  );
  const maxNoteStroops = useMemo(
    () =>
      getMaxWithdrawStroops({
        coins,
        privateAddress: senderPrivateAddress,
        assetId: selectedAsset?.assetId ?? "",
      }),
    [coins, selectedAsset?.assetId, senderPrivateAddress],
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
  const recipientRegistryStatus = useRecipientRegistryStatus({
    recipient: amountInputs.recipient,
    walletPublicKey: publicKey,
  });
  const validation = useTransferRecipientAndSubmitGates({
    publicKey,
    senderPrivateAddress,
    recipient: amountInputs.recipient,
    selectedAsset,
    amount: amountInputs.amount,
    maxNoteStroops,
    isSubmitting: isSubmitting || isPreparingWallet,
    actionsEnabled,
    recipientRegistryStatus,
  });
  const { submitError, setSubmitError, handleConfirmSend } =
    useConfidentialTransferSubmitHandler({
      dispatch,
      canSubmit: validation.canSubmit,
      setIsSubmitting,
      setIsPreparingWallet,
      selectedAsset,
      submit,
      navigate,
      ensureWalletPrivateAddress,
      ensureWalletScalar,
      recipientTrim: validation.recipientTrim,
      numericAmount: validation.numericAmount,
      onSuccess: (result) => {
        setSuccessResult(result);
        setStep("success");
      },
    });

  return {
    navigate,
    assets,
    tokenUi,
    amountInputs,
    selectedAsset,
    validation,
    recipientRegistryStatus,
    senderPrivateAddress,
    senderNonce,
    publicKey,
    step,
    successResult,
    submitError,
    setSubmitError,
    setStep,
    handleConfirmSend,
    noteLimitAlert,
    isActionPending: isSubmitting || isPreparingWallet,
  };
}
