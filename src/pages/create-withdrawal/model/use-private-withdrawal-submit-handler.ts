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
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import { assertWithdrawalDestinationCanReceiveAsset } from "../lib/withdrawal-destination-trustline";
import type { PrivateWithdrawalSuccess } from "./private-withdrawal-success";

type PrivateWithdrawalSubmit = (payload: {
  senderPrivateAddress: string;
  assetId: string;
  tokenContractRaw: string;
  amountDisplay: number;
  destinationAddress: string;
}) => Promise<{ txId: string; coinDeliveryWarning?: string }>;

function pushWithdrawalSuccess(parameters: {
  dispatch: AppDispatch;
  navigate: NavigateFunction;
  poolContract: string;
  senderPrivateAddress: string;
  destinationTrim: string;
  selectedAsset: AssetWithTrustline;
  numericAmount: number;
  result: { txId: string; coinDeliveryWarning?: string };
}): void {
  parameters.dispatch(
    addTransaction(
      buildUserTransaction({
        txId: parameters.result.txId,
        type: "withdrawal",
        assetId: parameters.selectedAsset.assetId,
        amount: parameters.numericAmount,
        counterparty: parameters.destinationTrim,
        senderPrivateAddress: parameters.senderPrivateAddress.trim(),
      }),
    ),
  );
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
      await assertWithdrawalDestinationCanReceiveAsset({
        asset: parameters.selectedAsset,
        destinationAddress: parameters.destinationTrim,
      });
      const selectedAsset = parameters.selectedAsset;
      const result = await parameters.submit({
        senderPrivateAddress: parameters.senderPrivateAddress,
        assetId: selectedAsset.assetId,
        tokenContractRaw: selectedAsset.clientContract ?? "",
        amountDisplay: parameters.numericAmount,
        destinationAddress: parameters.destinationTrim,
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
      pushWithdrawalSuccess({
        dispatch: parameters.dispatch,
        navigate: parameters.navigate,
        poolContract,
        senderPrivateAddress: parameters.senderPrivateAddress,
        destinationTrim: parameters.destinationTrim,
        selectedAsset,
        numericAmount: parameters.numericAmount,
        result,
      });
    } catch (error: unknown) {
      console.error("Withdrawal failed:", error);
      if (isRejectedWithValue(error)) {
        const payload = error.payload;
        setSubmitError(
          typeof payload === "string" ? payload : "Withdrawal failed",
        );
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Withdrawal failed");
      }
    } finally {
      parameters.setIsSubmitting(false);
    }
  }

  async function handleConfirmWithdraw() {
    await performWithdrawal();
  }

  return { submitError, setSubmitError, handleConfirmWithdraw };
}
