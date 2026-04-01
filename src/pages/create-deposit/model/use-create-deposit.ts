import { type FormEvent, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  type Token,
  mockTokens,
  PERCENTAGE_DIVISOR,
  NETWORK_FEE,
} from "./create-deposit";
import { isNumericDecimalInput } from "../lib/validation";

export function useCreateDeposit() {
  const navigate = useNavigate();
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token>(mockTokens[0]);
  const [amount, setAmount] = useState("");

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

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setShowTokenPicker(false);
    setSearchQuery("");
  };

  const handleAmountChange = (value: string) => {
    if (value === "" || isNumericDecimalInput(value)) {
      setAmount(value);
    }
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
    navigate("/transfer-success/deposit_new_001");
  };

  const canSubmit =
    amount !== "" &&
    Number.parseFloat(amount) > 0 &&
    Number.parseFloat(amount) <= selectedToken.balance;

  return {
    navigate,
    showTokenPicker,
    setShowTokenPicker,
    searchQuery,
    setSearchQuery,
    selectedToken,
    amount,
    filteredTokens,
    handleTokenSelect,
    handleAmountChange,
    handlePercentage,
    handleMaxAmount,
    fiatValue,
    networkFee: NETWORK_FEE,
    receivedAmount,
    handleSubmit,
    canSubmit,
  };
}
