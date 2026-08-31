import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { getMaxWithdrawStroops, selectCoinItems } from "@/entities/coin";
import { selectWalletPublicKey } from "@/entities/wallet";
import { amountInputToStroops } from "@/shared/lib/stellar/stroops";
import { ZERO_STROOPS } from "@/shared/lib/privacy-sdk/constants";
import { useWalletPrivateAddress } from "@/features/register-private-address";
import { useConfidentialTransfer } from "./use-confidential-transfer";
import { useTransferRecipientAndSubmitGates } from "./use-transfer-validation";
import { useRecipientRegistryStatus } from "./use-recipient-registry-status";
import { useTransferAssetModel } from "./use-transfer-asset-model";
import type { TransferFlowStep } from "./use-transfer-flow-step-handlers";
import type { ConfidentialTransferSuccess } from "./confidential-transfer-submit-flow";

export function useTransferFormSlice() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t: translate } = useTranslation("transfer");
  const { submit } = useConfidentialTransfer();
  const [searchParameters] = useSearchParams();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const coins = useAppSelector(selectCoinItems);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingWallet, setIsPreparingWallet] = useState(false);
  const [step, setStep] = useState<TransferFlowStep>("form");
  const [successResult, setSuccessResult] = useState<
    ConfidentialTransferSuccess | undefined
  >();
  const wallet = useWalletPrivateAddress();
  const { assets, tokenUi, amountInputs, selectedAsset } = useTransferAssetModel(
    wallet.privateAddressStpl1,
    searchParameters.get("assetId"),
    searchParameters.get("recipient") ?? "",
  );
  const maxNoteStroops = useMemo(
    () =>
      getMaxWithdrawStroops({
        coins,
        privateAddress: wallet.privateAddressStpl1,
        assetId: selectedAsset?.assetId ?? "",
      }),
    [coins, selectedAsset?.assetId, wallet.privateAddressStpl1],
  );
  const amountStroops = amountInputToStroops(amountInputs.amount);
  const exceedsNoteLimit =
    amountStroops !== undefined &&
    amountStroops > ZERO_STROOPS &&
    maxNoteStroops > ZERO_STROOPS &&
    amountStroops > maxNoteStroops;
  const recipientRegistryStatus = useRecipientRegistryStatus({
    recipient: amountInputs.recipient,
    walletPublicKey: publicKey,
  });
  const validation = useTransferRecipientAndSubmitGates({
    publicKey,
    senderPrivateAddress: wallet.privateAddressStpl1,
    recipient: amountInputs.recipient,
    selectedAsset,
    amount: amountInputs.amount,
    maxNoteStroops,
    isSubmitting: isSubmitting || isPreparingWallet,
    actionsEnabled: wallet.actionsEnabled,
    recipientRegistryStatus,
  });
  return {
    dispatch,
    navigate,
    submit,
    publicKey,
    isSubmitting,
    setIsSubmitting,
    isPreparingWallet,
    setIsPreparingWallet,
    step,
    setStep,
    successResult,
    setSuccessResult,
    wallet,
    assets,
    tokenUi,
    amountInputs,
    selectedAsset,
    noteLimitAlert: exceedsNoteLimit
      ? {
          title: translate("amountExceedsNoteLimitTitle"),
          subtitle: translate("amountExceedsNoteLimitSubtitle"),
        }
      : undefined,
    recipientRegistryStatus,
    validation,
  };
}
