import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { type AssetDto, useGetAssetsQuery } from "@/entities/asset";
import {
  type AggregatedPrivateAssetRow,
  selectFinalizedAggregatesForStealth,
} from "@/entities/coin";
import { selectWalletPublicKey } from "@/entities/wallet";
import { buildPrivateTransferAssets } from "../lib/private-transfer-asset-list";
import { QUICK_PERCENTAGE_OPTIONS } from "./create-transfer";
import { useConfidentialTransferSubmitHandler } from "./use-confidential-transfer-submit-handler";
import { useConfidentialTransfer } from "./use-confidential-transfer";
import { useSelectedPrivateToken } from "./use-selected-private-token";
import { useTransferAmountInputs } from "./use-transfer-amount-inputs";
import { useTransferRecipientAndSubmitGates } from "./use-transfer-validation";
import { useTransferSender } from "./use-transfer-sender";

function withZeroAmountAssets(
  aggregates: AggregatedPrivateAssetRow[],
  assetCatalog: AssetDto[] | undefined,
): AggregatedPrivateAssetRow[] {
  const byAssetId = new Map(
    aggregates.map((aggregate) => [aggregate.assetId, aggregate]),
  );
  if (assetCatalog) {
    for (const asset of assetCatalog) {
      if (byAssetId.has(asset.assetId)) {
        continue;
      }
      byAssetId.set(asset.assetId, {
        assetId: asset.assetId,
        poolContract: asset.poolContract ?? "",
        totalAmountDisplay: 0,
      });
    }
  }
  return [...byAssetId.values()].toSorted((left, right) =>
    left.assetId.localeCompare(right.assetId),
  );
}

export function useCreateTransfer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { submit } = useConfidentialTransfer();
  const [searchParameters] = useSearchParams();
  const assetIdFromUrl = searchParameters.get("assetId");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const transferSender = useTransferSender();
  const aggregates = useAppSelector(
    selectFinalizedAggregatesForStealth(
      transferSender.senderStealthAddress || undefined,
    ),
  );
  const { data: assetCatalog } = useGetAssetsQuery();
  const aggregatesWithZeroAssets = useMemo(() => {
    return withZeroAmountAssets(aggregates, assetCatalog);
  }, [aggregates, assetCatalog]);
  const privateTransferAssets = useMemo(
    () => buildPrivateTransferAssets(aggregatesWithZeroAssets, assetCatalog),
    [aggregatesWithZeroAssets, assetCatalog],
  );
  const tokenUi = useSelectedPrivateToken(
    privateTransferAssets,
    assetIdFromUrl,
  );
  const selectedAsset = tokenUi.selectedToken;
  const amountInputs = useTransferAmountInputs(selectedAsset);
  const validation = useTransferRecipientAndSubmitGates({
    publicKey,
    senderStealthAddress: transferSender.senderStealthAddress,
    recipient: amountInputs.recipient,
    selectedAsset,
    amount: amountInputs.amount,
    isSubmitting,
  });
  const { submitError, handleSubmit } = useConfidentialTransferSubmitHandler({
    dispatch,
    canSubmit: validation.canSubmit,
    setIsSubmitting,
    selectedAsset,
    submit,
    navigate,
    senderStealthAddress: transferSender.senderStealthAddress,
    recipientTrim: validation.recipientTrim,
    numericAmount: validation.numericAmount,
  });
  return {
    assets: privateTransferAssets,
    showTokenPicker: tokenUi.showTokenPicker,
    setShowTokenPicker: tokenUi.setShowTokenPicker,
    showContactPicker: tokenUi.showContactPicker,
    setShowContactPicker: tokenUi.setShowContactPicker,
    selectedToken: selectedAsset,
    amount: amountInputs.amount,
    handleAmountChange: amountInputs.handleAmountChange,
    recipient: amountInputs.recipient,
    setRecipient: amountInputs.setRecipient,
    quickPercentageOptions: QUICK_PERCENTAGE_OPTIONS,
    handleTokenSelect: tokenUi.handleTokenSelect,
    handlePercentage: amountInputs.handlePercentage,
    handleMaxAmount: amountInputs.handleMaxAmount,
    totalAmount: validation.totalAmount,
    handleSubmit,
    canSubmit: validation.canSubmit,
    isSubmitting,
    submitError,
    senderNonce: transferSender.effectiveSenderNonce,
    senderStealthAddress: transferSender.senderStealthAddress,
    recipientValid: validation.recipientValid,
    recipientDiffersFromSender: validation.recipientDiffersFromSender,
    recipientErrorKey: validation.recipientErrorKey,
  };
}
