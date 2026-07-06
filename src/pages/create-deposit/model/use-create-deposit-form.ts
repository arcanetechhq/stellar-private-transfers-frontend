import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import {
  useAssetsWithTrustlines,
  type AssetWithTrustline,
} from "@/entities/asset";
import { useWalletPrivateAddress } from "@/features/register-private-address";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import { NETWORK_FEE } from "./create-deposit";
import { computeDepositSpendableBalanceDisplay } from "../lib/compute-deposit-spendable-balance";
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
  const { privateAddressStpl1, defaultNonce, actionsEnabled } =
    useWalletPrivateAddress();
  const { assets } = useAssetsWithTrustlines(publicKey);

  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [selectedToken, setSelectedToken] = useState<
    AssetWithTrustline | undefined
  >();
  const [amount, setAmount] = useState("");
  const selectedPrivateAddressNonce = defaultNonce;
  const selectedPrivateAddress = privateAddressStpl1;

  const selectedAsset = resolveSelectedDepositAsset({
    selectedToken,
    assets,
    assetIdFromUrl,
  });

  const spendableBalanceDisplay = computeDepositSpendableBalanceDisplay(
    selectedAsset,
    selectedAsset?.balance,
  );

  const {
    handleTokenSelect,
    handleAmountChange,
    handlePercentage,
    handleMaxAmount,
  } = useDepositFormHandlers({
    spendableBalanceDisplay,
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
  const hasPrivateAddressScalar = true;
  const hasPrivateAddress = true;

  const canSubmit = actionsEnabled && computeDepositCanSubmit({
    selectedAsset,
    amount,
    numericAmount,
    spendableBalanceDisplay,
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
