import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import {
  useAssetsWithTrustlines,
  type AssetWithTrustline,
} from "@/entities/asset";
import {
  selectDefaultNonce,
  selectScalarByNonce,
  selectStealthByNonce,
} from "@/entities/stealth-address";
import { NETWORK_FEE } from "./create-deposit";
import { resolveSelectedDepositAsset } from "./resolve-selected-deposit-asset";
import { computeDepositCanSubmit } from "./compute-deposit-can-submit";
import { computeReceivedAmount } from "./compute-received-amount";
import { useDepositFormHandlers } from "./use-deposit-form-handlers";

export interface UseCreateDepositFormOptions {
  isSubmitting: boolean;
}

export function useCreateDepositForm({
  isSubmitting,
}: UseCreateDepositFormOptions) {
  const [searchParameters] = useSearchParams();
  const assetIdFromUrl = searchParameters.get("assetId");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { assets } = useAssetsWithTrustlines(publicKey);

  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [selectedToken, setSelectedToken] = useState<
    AssetWithTrustline | undefined
  >();
  const [amount, setAmount] = useState("");
  const selectedStealthNonce = useAppSelector(selectDefaultNonce);
  const selectedStealthAddress = useAppSelector(
    (state) =>
      selectStealthByNonce(selectedStealthNonce)(state)?.stealthAddress ?? "",
  );

  const recipientScalar = useAppSelector(
    selectScalarByNonce(selectedStealthNonce ?? ""),
  );

  const selectedAsset = resolveSelectedDepositAsset({
    selectedToken,
    assets,
    assetIdFromUrl,
  });

  const numericBalance = selectedAsset
    ? Number.parseFloat(selectedAsset.balance ?? "0")
    : 0;

  const {
    handleTokenSelect,
    handleAmountChange,
    handlePercentage,
    handleMaxAmount,
  } = useDepositFormHandlers({
    numericBalance,
    selectedAsset,
    setAmount,
    setSelectedToken,
    setShowTokenPicker,
  });

  const receivedAmount = useMemo(() => computeReceivedAmount(amount), [amount]);

  const numericAmount = Number.parseFloat(amount);
  const hasPoolContract = Boolean(selectedAsset?.poolContract?.trim());
  const hasStealthScalar = Boolean(recipientScalar?.trim());
  const hasStealthAddress = Boolean(selectedStealthAddress.trim());

  const canSubmit = computeDepositCanSubmit({
    selectedAsset,
    amount,
    numericAmount,
    numericBalance,
    hasPoolContract,
    hasStealthAddress,
    hasStealthScalar,
    isSubmitting,
  });

  return {
    assets,
    showTokenPicker,
    setShowTokenPicker,
    selectedToken: selectedAsset,
    amount,
    handleTokenSelect,
    handleAmountChange,
    handlePercentage,
    handleMaxAmount,
    networkFee: NETWORK_FEE,
    receivedAmount,
    canSubmit,
    selectedStealthNonce,
    destinationStealthPreview: selectedStealthAddress,
    selectedAsset,
    numericAmount,
  };
}
