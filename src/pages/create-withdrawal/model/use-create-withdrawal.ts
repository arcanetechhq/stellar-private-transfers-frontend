import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { type AssetWithTrustline } from "@/entities/asset";
import { isNumericDecimalInput } from "@/shared/lib/numeric-decimal-input";
import { isValidStellarPublicAddress } from "@/shared/lib/stellar/is-valid-stellar-public-address";
import {
  parseWithdrawalAmountInput,
  parseWithdrawalBalance,
} from "../lib/format-withdrawal-amount";
import { PERCENTAGE_DIVISOR } from "./create-withdrawal";
import type { PrivateWithdrawalSuccess } from "./private-withdrawal-success";
import { usePrivateWithdrawal } from "./use-private-withdrawal";
import { usePrivateWithdrawalSubmitHandler } from "./use-private-withdrawal-submit-handler";
import { useWithdrawalPrivateAssets } from "./use-withdrawal-private-assets";

export type WithdrawalFlowStep = "form" | "review" | "success";

interface WithdrawalCanSubmitInput {
  senderPrivateAddress: string;
  selectedAsset: AssetWithTrustline | undefined;
  amount: string;
  numericBalance: number;
  destinationWallet: string;
}

function computeWithdrawalCanSubmit(input: WithdrawalCanSubmitInput): boolean {
  const numericAmount = parseWithdrawalAmountInput(input.amount);
  return (
    input.senderPrivateAddress !== "" &&
    input.selectedAsset !== undefined &&
    input.amount !== "" &&
    !Number.isNaN(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= input.numericBalance &&
    input.destinationWallet !== "" &&
    isValidStellarPublicAddress(input.destinationWallet.trim())
  );
}

function useWithdrawalAmountInputs(
  selectedAsset: AssetWithTrustline | undefined,
) {
  const [amount, setAmount] = useState("");
  const numericBalance = parseWithdrawalBalance(selectedAsset?.balance);
  const handlePercentage = (percentage: number) => {
    setAmount(((numericBalance * percentage) / PERCENTAGE_DIVISOR).toString());
  };
  const handleMaxAmount = () => {
    if (selectedAsset?.balance) {
      setAmount(selectedAsset.balance.replaceAll(",", ""));
    }
  };
  const receivedAmount = useMemo(() => {
    if (!amount) {
      return 0;
    }
    return parseWithdrawalAmountInput(amount);
  }, [amount]);
  const handleAmountChange = (value: string) => {
    if (value === "" || isNumericDecimalInput(value)) {
      setAmount(value);
    }
  };
  return {
    amount,
    handleAmountChange,
    handlePercentage,
    handleMaxAmount,
    receivedAmount,
    numericBalance,
  };
}

export function useCreateWithdrawal() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { submit } = usePrivateWithdrawal();
  const [searchParameters] = useSearchParams();
  const assetIdFromUrl = searchParameters.get("assetId");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<WithdrawalFlowStep>("form");
  const [successResult, setSuccessResult] = useState<
    PrivateWithdrawalSuccess | undefined
  >();
  const { withdrawalSender, privateAssets, tokenUi } =
    useWithdrawalPrivateAssets(assetIdFromUrl);
  const [destinationWallet, setDestinationWallet] = useState("");
  useEffect(() => {
    if (publicKey) {
      setDestinationWallet(publicKey);
    } else {
      setDestinationWallet("");
    }
  }, [publicKey]);
  const selectedAsset = tokenUi.selectedToken;
  const amountInputs = useWithdrawalAmountInputs(selectedAsset);
  const canSubmit = computeWithdrawalCanSubmit({
    senderPrivateAddress: withdrawalSender.senderPrivateAddress,
    selectedAsset,
    amount: amountInputs.amount,
    numericBalance: amountInputs.numericBalance,
    destinationWallet,
  });
  const numericAmount = parseWithdrawalAmountInput(amountInputs.amount);
  const destinationTrim = destinationWallet.trim();
  const { submitError, setSubmitError, handleConfirmWithdraw } =
    usePrivateWithdrawalSubmitHandler({
      dispatch,
      canSubmit,
      setIsSubmitting,
      selectedAsset,
      submit,
      navigate,
      senderPrivateAddress: withdrawalSender.senderPrivateAddress,
      ensureSenderScalar: withdrawalSender.ensureSenderScalar,
      destinationTrim,
      numericAmount: Number.isNaN(numericAmount) ? 0 : numericAmount,
      onSuccess: (result) => {
        setSuccessResult(result);
        setStep("success");
      },
    });

  function handleOpenReview() {
    if (!canSubmit || isSubmitting) {
      return;
    }
    setSubmitError(undefined);
    setStep("review");
  }

  function handleCloseReview() {
    if (isSubmitting) {
      return;
    }
    setStep("form");
  }

  function handleSuccessDone() {
    navigate("/", { flushSync: true });
  }

  return {
    assets: privateAssets,
    selectedToken: selectedAsset,
    handleTokenSelect: tokenUi.handleTokenSelect,
    amount: amountInputs.amount,
    handleAmountChange: amountInputs.handleAmountChange,
    handlePercentage: amountInputs.handlePercentage,
    handleMaxAmount: amountInputs.handleMaxAmount,
    destinationWallet,
    receivedAmount: amountInputs.receivedAmount,
    canSubmit,
    isSubmitting,
    submitError,
    step,
    successResult,
    handleOpenReview,
    handleCloseReview,
    handleConfirmWithdraw,
    handleSuccessDone,
    senderNonce: withdrawalSender.effectiveSenderNonce,
  };
}
