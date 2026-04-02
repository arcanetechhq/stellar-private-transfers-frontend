import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useAssetsWithTrustlines, type AssetWithTrustline } from "@/entities/asset";
import { PERCENTAGE_DIVISOR, NETWORK_FEE } from "./create-withdrawal";
import { isNumericDecimalInput } from "../lib/is-numeric-decimal-input";

export function useCreateWithdrawal() {
  const navigate = useNavigate();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { assets } = useAssetsWithTrustlines(publicKey);

  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [selectedToken, setSelectedToken] = useState<AssetWithTrustline | undefined>();
  const [amount, setAmount] = useState("");
  const [destinationWallet, setDestinationWallet] = useState("");

  const selectedAsset = selectedToken ?? assets[0];

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

  const handleGoBack = () => navigate("/");

  const handleAmountChange = (value: string) => {
    if (value === "" || isNumericDecimalInput(value)) {
      setAmount(value);
    }
  };

  const numericAmount = Number.parseFloat(amount);
  const canSubmit =
    selectedAsset !== undefined &&
    amount !== "" &&
    !Number.isNaN(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= numericBalance &&
    destinationWallet !== "";

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
    handleGoBack,
    canSubmit,
  };
}
