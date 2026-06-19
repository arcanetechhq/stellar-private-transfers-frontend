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
  selectPrivateAddressByNonce,
} from "@/entities/private-address";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
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
  const selectedPrivateAddressNonce = useAppSelector(selectDefaultNonce);
  const selectedPrivateAddress = useAppSelector(
    (state) =>
      selectPrivateAddressByNonce(selectedPrivateAddressNonce)(state)?.privateAddress ?? "",
  );

  const recipientScalar = useAppSelector(
    selectScalarByNonce(selectedPrivateAddressNonce ?? ""),
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
  const hasPoolContract = (() => {
    try {
      return Boolean(getRequiredPrivacyPoolContractId());
    } catch {
      return false;
    }
  })();
  const hasPrivateAddressScalar = Boolean(recipientScalar?.trim());
  const hasPrivateAddress = Boolean(selectedPrivateAddress.trim());

  const canSubmit = computeDepositCanSubmit({
    selectedAsset,
    amount,
    numericAmount,
    numericBalance,
    hasPoolContract,
    hasPrivateAddress,
    hasPrivateAddressScalar,
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
    selectedPrivateAddressNonce,
    destinationPrivateAddressPreview: selectedPrivateAddress,
    selectedAsset,
    numericAmount,
  };
}
