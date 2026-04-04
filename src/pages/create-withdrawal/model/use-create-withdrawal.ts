import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { selectWalletPublicKey } from "@/entities/wallet";
import {
  buildPrivateTransferAssets,
  useGetAssetsQuery,
  type AssetWithTrustline,
} from "@/entities/asset";
import { selectFinalizedAggregatesForStealth } from "@/entities/coin";
import { PERCENTAGE_DIVISOR, NETWORK_FEE } from "./create-withdrawal";
import { isNumericDecimalInput } from "../lib/is-numeric-decimal-input";
import { isValidStellarPublicAddress } from "../lib/is-valid-stellar-address";
import { useWithdrawalSender } from "./use-withdrawal-sender";
import { useSelectedPrivateToken } from "./use-selected-private-token";
import { usePrivateWithdrawal } from "./use-private-withdrawal";
import { usePrivateWithdrawalSubmitHandler } from "./use-private-withdrawal-submit-handler";

interface WithdrawalCanSubmitInput {
  senderStealthAddress: string;
  selectedAsset: AssetWithTrustline | undefined;
  amount: string;
  numericBalance: number;
  destinationWallet: string;
}

function computeWithdrawalCanSubmit(input: WithdrawalCanSubmitInput): boolean {
  const numericAmount = Number.parseFloat(input.amount);
  return (
    input.senderStealthAddress !== "" &&
    input.selectedAsset !== undefined &&
    input.amount !== "" &&
    !Number.isNaN(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= input.numericBalance &&
    input.destinationWallet !== "" &&
    isValidStellarPublicAddress(input.destinationWallet.trim())
  );
}

function useWithdrawalAmountInputs(selectedAsset: AssetWithTrustline | undefined) {
  const [amount, setAmount] = useState("");
  const numericBalance = selectedAsset
    ? Number.parseFloat(selectedAsset.balance ?? "0")
    : 0;
  const handlePercentage = (percentage: number) => {
    setAmount(((numericBalance * percentage) / PERCENTAGE_DIVISOR).toString());
  };
  const handleMaxAmount = () => {
    if (selectedAsset?.balance) {
      setAmount(selectedAsset.balance);
    }
  };
  const receivedAmount = useMemo(() => {
    if (!amount || Number.isNaN(Number.parseFloat(amount))) return 0;
    return Number.parseFloat(amount);
  }, [amount]);
  const handleAmountChange = (value: string) => {
    if (value === "" || isNumericDecimalInput(value)) {
      setAmount(value);
    }
  };
  return { amount, handleAmountChange, handlePercentage, handleMaxAmount, receivedAmount, numericBalance };
}

export function useCreateWithdrawal() {
  const navigate = useNavigate();
  const { submit } = usePrivateWithdrawal();
  const [searchParameters] = useSearchParams();
  const assetIdFromUrl = searchParameters.get("assetId");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const withdrawalSender = useWithdrawalSender();
  const aggregates = useAppSelector(
    selectFinalizedAggregatesForStealth(
      withdrawalSender.senderStealthAddress || undefined,
    ),
  );
  const { data: assetCatalog } = useGetAssetsQuery();
  const privateAssets = useMemo(
    () => buildPrivateTransferAssets(aggregates, assetCatalog),
    [aggregates, assetCatalog],
  );
  const tokenUi = useSelectedPrivateToken(privateAssets, assetIdFromUrl);
  const [destinationWallet, setDestinationWallet] = useState("");
  useEffect(() => {
    if (publicKey && !destinationWallet) {
      setDestinationWallet(publicKey);
    }
  }, [publicKey]);
  const selectedAsset = tokenUi.selectedToken;
  const amountInputs = useWithdrawalAmountInputs(selectedAsset);
  const canSubmit = computeWithdrawalCanSubmit({
    senderStealthAddress: withdrawalSender.senderStealthAddress,
    selectedAsset,
    amount: amountInputs.amount,
    numericBalance: amountInputs.numericBalance,
    destinationWallet,
  });
  const numericAmount = Number.parseFloat(amountInputs.amount);
  const destinationTrim = destinationWallet.trim();
  const { submitError, handleSubmit } = usePrivateWithdrawalSubmitHandler({
    canSubmit,
    setIsSubmitting,
    selectedAsset,
    submit,
    navigate,
    senderStealthAddress: withdrawalSender.senderStealthAddress,
    destinationTrim,
    numericAmount: Number.isNaN(numericAmount) ? 0 : numericAmount,
  });
  return {
    assets: privateAssets,
    showTokenPicker: tokenUi.showTokenPicker,
    setShowTokenPicker: tokenUi.setShowTokenPicker,
    selectedToken: selectedAsset,
    handleTokenSelect: tokenUi.handleTokenSelect,
    amount: amountInputs.amount,
    handleAmountChange: amountInputs.handleAmountChange,
    handlePercentage: amountInputs.handlePercentage,
    handleMaxAmount: amountInputs.handleMaxAmount,
    destinationWallet,
    setDestinationWallet,
    receivedAmount: amountInputs.receivedAmount,
    networkFee: NETWORK_FEE,
    handleSubmit,
    handleGoBack: () => navigate("/"),
    canSubmit,
    isSubmitting,
    submitError,
    senderNonce: withdrawalSender.effectiveSenderNonce,
    setSenderNonce: withdrawalSender.setSenderNonce,
    nonces: withdrawalSender.nonces,
    byNonce: withdrawalSender.byNonce,
  };
}
