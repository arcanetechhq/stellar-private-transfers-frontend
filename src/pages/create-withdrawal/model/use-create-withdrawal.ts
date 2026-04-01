import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import {
  MOCK_TOKENS, PERCENTAGE_DIVISOR, NETWORK_FEE, type Token,
} from "./create-withdrawal";
import { isNumericDecimalInput } from "../lib/is-numeric-decimal-input";

export function useCreateWithdrawal() {
  const navigate = useNavigate();
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToken, setSelectedToken] = useState(MOCK_TOKENS[0]);
  const [amount, setAmount] = useState("");
  const [destinationWallet, setDestinationWallet] = useState("0x742d...3f8c");

  const filteredTokens = useMemo(() => {
    const filtered = MOCK_TOKENS.filter(
      (token) =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.ticker.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    filtered.sort((leftItem, rightItem) => {
      if (leftItem.balance > 0 && rightItem.balance === 0) return -1;
      if (leftItem.balance === 0 && rightItem.balance > 0) return 1;
      return rightItem.balance * rightItem.price - leftItem.balance * leftItem.price;
    });
    return filtered;
  }, [searchQuery]);

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setShowTokenPicker(false);
    setSearchQuery("");
  };

  const handlePercentage = (percentage: number) => {
    const value = (selectedToken.balance * percentage) / PERCENTAGE_DIVISOR;
    setAmount(value.toString());
  };

  const handleMaxAmount = () => {
    setAmount(selectedToken.balance.toString());
  };

  const fiatValue = useMemo(() => {
    if (!amount || Number.isNaN(Number.parseFloat(amount))) return 0;
    return Number.parseFloat(amount) * selectedToken.price;
  }, [amount, selectedToken]);

  const receivedAmount = useMemo(() => {
    if (!amount || Number.isNaN(Number.parseFloat(amount))) return 0;
    return Number.parseFloat(amount);
  }, [amount]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    navigate("/transfer-success/withdrawal_new_001");
  };

  const handleGoBack = () => {
    navigate("/");
  };

  const handleAmountChange = (value: string) => {
    if (value === "" || isNumericDecimalInput(value)) {
      setAmount(value);
    }
  };

  const canSubmit =
    amount !== "" &&
    Number.parseFloat(amount) > 0 &&
    Number.parseFloat(amount) <= selectedToken.balance &&
    destinationWallet !== "";

  return {
    showTokenPicker, setShowTokenPicker,
    showContactPicker, setShowContactPicker,
    searchQuery, setSearchQuery,
    selectedToken, filteredTokens, handleTokenSelect,
    amount, handleAmountChange, handlePercentage, handleMaxAmount,
    destinationWallet, setDestinationWallet,
    fiatValue, receivedAmount, networkFee: NETWORK_FEE,
    handleSubmit, handleGoBack, canSubmit,
  };
}
