import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useAssetsWithTrustlines, type AssetWithTrustline } from "@/entities/asset";
import { PERCENTAGE_DIVISOR, NETWORK_FEE } from "./create-withdrawal";
import { isNumericDecimalInput } from "../lib/is-numeric-decimal-input";

interface WithdrawalCanSubmitInput {
  selectedAsset: AssetWithTrustline | undefined;
  amount: string;
  numericBalance: number;
  destinationWallet: string;
}

function computeWithdrawalCanSubmit(input: WithdrawalCanSubmitInput): boolean {
  const numericAmount = Number.parseFloat(input.amount);
  return (
    input.selectedAsset !== undefined &&
    input.amount !== "" &&
    !Number.isNaN(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= input.numericBalance &&
    input.destinationWallet !== ""
  );
}

export function useCreateWithdrawal() {
  const navigate = useNavigate();
  const [searchParameters] = useSearchParams();
  const assetIdFromUrl = searchParameters.get("assetId");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { assets } = useAssetsWithTrustlines(publicKey);

  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [selectedToken, setSelectedToken] = useState<AssetWithTrustline | undefined>();
  const [amount, setAmount] = useState("");
  const [destinationWallet, setDestinationWallet] = useState("");

  const selectedAsset =
    selectedToken ??
    assets.find((asset) => asset.assetId === assetIdFromUrl) ??
    assets[0];

  const numericBalance = selectedAsset
    ? Number.parseFloat(selectedAsset.balance ?? "0")
    : 0;

  const handleTokenSelect = (asset: AssetWithTrustline) => {
    setSelectedToken(asset);
    setShowTokenPicker(false);
  };

  const handlePercentage = (percentage: number) => {
    const value = (numericBalance * percentage) / PERCENTAGE_DIVISOR;
    setAmount(value.toString());
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    navigate("/transfer-success/withdrawal_new_001");
  };

  const handleAmountChange = (value: string) => {
    if (value === "" || isNumericDecimalInput(value)) {
      setAmount(value);
    }
  };

  return {
    assets,
    showTokenPicker,
    setShowTokenPicker,
    showContactPicker,
    setShowContactPicker,
    selectedToken: selectedAsset,
    handleTokenSelect,
    amount,
    handleAmountChange,
    handlePercentage,
    handleMaxAmount,
    destinationWallet,
    setDestinationWallet,
    receivedAmount,
    networkFee: NETWORK_FEE,
    handleSubmit,
    handleGoBack: () => navigate("/"),
    canSubmit: computeWithdrawalCanSubmit({
      selectedAsset,
      amount,
      numericBalance,
      destinationWallet,
    }),
  };
}
