import { isRejectedWithValue } from "@reduxjs/toolkit";
import {
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { NavigateFunction } from "react-router";
import type { AppDispatch } from "@/store";
import type { AssetWithTrustline } from "@/entities/asset";
import { addTransaction, buildUserTransaction } from "@/entities/transaction";
import { mapPrivacySdkError } from "@/shared/lib/privacy-sdk/map-privacy-sdk-errors.js";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import { ensureWithdrawalDestinationCanReceiveAsset } from "../lib/withdrawal-destination-trustline";
import type { PrivateWithdrawalSuccess } from "./private-withdrawal-success";

type PrivateWithdrawalSubmit = (payload: {
  senderPrivateAddress: string;
  assetId: string;
  tokenContractRaw: string;
  amountDisplay: number;
  destinationAddress: string;
}) => Promise<{ txId: string; coinDeliveryWarning?: string }>;

function readWithdrawalSubmitError(error: unknown): string {
  if (isRejectedWithValue(error)) {
    const payload = error.payload;
    if (typeof payload === "string" && payload.trim().length > 0) {
      return payload;
    }
    return mapPrivacySdkError(payload);
  }
  return mapPrivacySdkError(error);
}

function logWithdrawalFailure(error: unknown): string {
  const mapped = readWithdrawalSubmitError(error);
  console.error("Withdrawal failed:", error);
  console.error("Withdrawal failed (mapped):", mapped);
  return mapped;
}

function recordWithdrawalTransaction(parameters: {
  dispatch: AppDispatch;
  senderPrivateAddress: string;
  destinationTrim: string;
  selectedAsset: AssetWithTrustline;
  numericAmount: number;
  txId: string;
}): void {
  parameters.dispatch(
    addTransaction(
      buildUserTransaction({
        txId: parameters.txId,
        type: "withdrawal",
        assetId: parameters.selectedAsset.assetId,
        amount: parameters.numericAmount,
        counterparty: parameters.destinationTrim,
        senderPrivateAddress: parameters.senderPrivateAddress.trim(),
      }),
    ),
  );
}

function navigateWithdrawalSuccess(parameters: {
  navigate: NavigateFunction;
  poolContract: string;
  selectedAsset: AssetWithTrustline;
  numericAmount: number;
  result: { txId: string; coinDeliveryWarning?: string };
}): void {
  parameters.navigate(`/transfer-success/${encodeURIComponent(parameters.result.txId)}`, {
    state: {
      txId: parameters.result.txId,
      amount: parameters.numericAmount,
      assetId: parameters.selectedAsset.assetId,
      poolContract: parameters.poolContract,
      coinDeliveryWarning: parameters.result.coinDeliveryWarning,
    },
  });
}

export function usePrivateWithdrawalSubmitHandler(parameters: {
  dispatch: AppDispatch;
  canSubmit: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  selectedAsset: AssetWithTrustline | undefined;
  submit: PrivateWithdrawalSubmit;
  navigate: NavigateFunction;
  senderPrivateAddress: string;
  destinationTrim: string;
  connectedPublicKey: string;
  numericAmount: number;
  onSuccess?: (result: PrivateWithdrawalSuccess) => void;
}) {
  const [submitError, setSubmitError] = useState<string | undefined>();

  async function performWithdrawal() {
    if (!parameters.canSubmit || !parameters.selectedAsset) {
      return;
    }
    const poolContract = getRequiredPrivacyPoolContractId();
    parameters.setIsSubmitting(true);
    setSubmitError(undefined);
    try {
      await ensureWithdrawalDestinationCanReceiveAsset({
        dispatch: parameters.dispatch,
        asset: parameters.selectedAsset,
        destinationAddress: parameters.destinationTrim,
        connectedPublicKey: parameters.connectedPublicKey,
      });
      const selectedAsset = parameters.selectedAsset;
      const result = await parameters.submit({
        senderPrivateAddress: parameters.senderPrivateAddress,
        assetId: selectedAsset.assetId,
        tokenContractRaw: selectedAsset.clientContract ?? "",
        amountDisplay: parameters.numericAmount,
        destinationAddress: parameters.destinationTrim,
      });
      recordWithdrawalTransaction({
        dispatch: parameters.dispatch,
        senderPrivateAddress: parameters.senderPrivateAddress,
        destinationTrim: parameters.destinationTrim,
        selectedAsset,
        numericAmount: parameters.numericAmount,
        txId: result.txId,
      });
      const successResult: PrivateWithdrawalSuccess = {
        txId: result.txId,
        amount: parameters.numericAmount,
        assetId: selectedAsset.assetId,
        destination: parameters.destinationTrim,
        poolContract,
        coinDeliveryWarning: result.coinDeliveryWarning,
      };
      if (parameters.onSuccess) {
        parameters.onSuccess(successResult);
        return;
      }
      navigateWithdrawalSuccess({
        navigate: parameters.navigate,
        poolContract,
        selectedAsset,
        numericAmount: parameters.numericAmount,
        result,
      });
    } catch (error: unknown) {
      setSubmitError(logWithdrawalFailure(error));
    } finally {
      parameters.setIsSubmitting(false);
    }
  }

  async function handleConfirmWithdraw() {
    await performWithdrawal();
  }

  return { submitError, setSubmitError, handleConfirmWithdraw };
}
