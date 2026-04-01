import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import type { FormEvent } from "react";
import {
  mockTokens,
  mockPercentageDivisor,
  networkFee,
  type MockToken,
} from "./create-transfer";
import { isNumericDecimalInput } from "../lib/numeric-input";

export function useCreateTransfer() {
  const navigate = useNavigate();
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToken, setSelectedToken] = useState(mockTokens[0]);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [note, setNote] = useState("");

  const filteredTokens = useMemo(() => {
    const filtered = mockTokens.filter(
      (token) =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    );
    filtered.sort((leftItem, rightItem) => {
      if (leftItem.balance > 0 && rightItem.balance === 0) return -1;
      if (leftItem.balance === 0 && rightItem.balance > 0) return 1;
      return rightItem.balance * rightItem.price - leftItem.balance * leftItem.price;
    });
    return filtered;
  }, [searchQuery]);

  const handleTokenSelect = (token: MockToken) => {
    setSelectedToken(token);
    setShowTokenPicker(false);
    setSearchQuery("");
  };

  const handlePercentage = (percentage: number) => {
    const value = (selectedToken.balance * percentage) / mockPercentageDivisor;
    setAmount(value.toString());
  };

  const handleMaxAmount = () => setAmount(selectedToken.balance.toString());

  const fiatValue = useMemo(() => {
    if (!amount || Number.isNaN(Number.parseFloat(amount))) return 0;
    return Number.parseFloat(amount) * selectedToken.price;
  }, [amount, selectedToken]);

  const totalAmount = useMemo(() => {
    if (!amount || Number.isNaN(Number.parseFloat(amount))) return networkFee;
    return Number.parseFloat(amount) + networkFee;
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
    amount !== "" && Number.parseFloat(amount) > 0 &&
    Number.parseFloat(amount) <= selectedToken.balance && recipient !== "";

  return {
    showTokenPicker,
    setShowTokenPicker,
    showContactPicker,
    setShowContactPicker,
    searchQuery,
    setSearchQuery,
    selectedToken,
    amount,
    handleAmountChange,
    recipient,
    setRecipient,
    note,
    setNote,
    filteredTokens,
    handleTokenSelect,
    handlePercentage,
    handleMaxAmount,
    fiatValue,
    totalAmount,
    handleSubmit,
    navigateHome,
    canSubmit,
  };
}
