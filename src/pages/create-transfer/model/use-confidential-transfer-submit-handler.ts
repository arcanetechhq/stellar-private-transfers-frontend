import { isRejectedWithValue } from "@reduxjs/toolkit";
import {
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import type { NavigateFunction } from "react-router";
import type { AppDispatch } from "@/store";
import type { AssetWithTrustline } from "@/entities/asset";
import { addTransaction, buildUserTransaction } from "@/entities/transaction";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";

type ConfidentialTransferSubmit = (payload: {
  senderStealthAddress: string;
  recipientStealthStpl1: string;
  assetId: string;
  tokenContractRaw: string;
  amountDisplay: number;
}) => Promise<{ txId: string; coinDeliveryWarning?: string }>;

export function useConfidentialTransferSubmitHandler(parameters: {
  dispatch: AppDispatch;
  canSubmit: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  selectedAsset: AssetWithTrustline | undefined;
  submit: ConfidentialTransferSubmit;
  navigate: NavigateFunction;
  senderStealthAddress: string;
  recipientTrim: string;
  numericAmount: number;
}) {
  const [submitError, setSubmitError] = useState<string | undefined>();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!parameters.canSubmit) {
      return;
    }
    const poolContract = getRequiredPrivacyPoolContractId();
    parameters.setIsSubmitting(true);
    setSubmitError(undefined);
    try {
      const result = await parameters.submit({
        senderStealthAddress: parameters.senderStealthAddress,
        recipientStealthStpl1: parameters.recipientTrim,
        assetId: parameters.selectedAsset.assetId,
        tokenContractRaw: parameters.selectedAsset.clientContract ?? "",
        amountDisplay: parameters.numericAmount,
      });
      parameters.dispatch(
        addTransaction(
          buildUserTransaction({
            txId: result.txId,
            type: "sent",
            assetId: parameters.selectedAsset.assetId,
            amount: parameters.numericAmount,
            counterparty: parameters.recipientTrim,
            senderStealthAddress: parameters.senderStealthAddress.trim(),
          }),
        ),
      );
      parameters.navigate(`/transfer-success/${encodeURIComponent(result.txId)}`, {
        state: {
          txId: result.txId,
          amount: parameters.numericAmount,
          assetId: parameters.selectedAsset.assetId,
          poolContract,
          coinDeliveryWarning: result.coinDeliveryWarning,
        },
      });
    } catch (error: unknown) {
      if (isRejectedWithValue(error)) {
        const payload = error.payload;
        setSubmitError(
          typeof payload === "string" ? payload : "Transfer failed",
        );
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Transfer failed");
      }
    } finally {
      parameters.setIsSubmitting(false);
    }
  };

  return { submitError, handleSubmit };
}
