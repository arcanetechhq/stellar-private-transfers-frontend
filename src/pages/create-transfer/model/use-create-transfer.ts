import { useState, useMemo, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { selectWalletPublicKey } from "@/entities/wallet";
import {
  useAssetsWithTrustlines,
  type AssetWithTrustline,
} from "@/entities/asset";
import {
  QUICK_PERCENTAGE_OPTIONS,
  PERCENTAGE_DIVISOR,
  NETWORK_FEE,
} from "./create-transfer";
import { isNumericDecimalInput } from "../lib/numeric-input";

export function useCreateTransfer() {
  const navigate = useNavigate();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { assets } = useAssetsWithTrustlines(publicKey);

  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [selectedToken, setSelectedToken] = useState<
    AssetWithTrustline | undefined
  >();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [note, setNote] = useState("");

  const selectedAsset = selectedToken ?? assets[0];

  const handleTokenSelect = (asset: AssetWithTrustline) => {
    setSelectedToken(asset);
    setShowTokenPicker(false);
  };

  const numericBalance = selectedAsset
    ? Number.parseFloat(selectedAsset.balance ?? "0")
    : 0;

  const handlePercentage = (percentage: number) => {
    const value = (numericBalance * percentage) / PERCENTAGE_DIVISOR;
    setAmount(value.toString());
  };

  const handleMaxAmount = () => {
    if (selectedAsset?.balance) {
      setAmount(selectedAsset.balance);
    }
  };

  const totalAmount = useMemo(() => {
    if (!amount || Number.isNaN(Number.parseFloat(amount))) return NETWORK_FEE;
    return Number.parseFloat(amount) + NETWORK_FEE;
  }, [amount]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    navigate("/transfer-success/tx_new_001");
  };

  const navigateHome = () => navigate("/");

  const handleAmountChange = (value: string) => {
    if (value === "" || isNumericDecimalInput(value)) {
      setAmount(value);
    }
  };

  const canSubmit =
    selectedAsset !== undefined &&
    amount !== "" &&
    !Number.isNaN(Number.parseFloat(amount)) &&
    Number.parseFloat(amount) > 0 &&
    Number.parseFloat(amount) <= numericBalance &&
    recipient !== "";

  return {
    assets,
    showTokenPicker,
    setShowTokenPicker,
    showContactPicker,
    setShowContactPicker,
    selectedToken: selectedAsset,
    amount,
    handleAmountChange,
    recipient,
    setRecipient,
    note,
    setNote,
    quickPercentageOptions: QUICK_PERCENTAGE_OPTIONS,
    handleTokenSelect,
    handlePercentage,
    handleMaxAmount,
    totalAmount,
    handleSubmit,
    navigateHome,
    canSubmit,
  };
}
