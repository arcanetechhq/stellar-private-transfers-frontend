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
import { assertWithdrawalDestinationCanReceiveAsset } from "../lib/withdrawal-destination-trustline";

type PrivateWithdrawalSubmit = (payload: {
  senderPrivateAddress: string;
  assetId: string;
  tokenContractRaw: string;
  amountDisplay: number;
  destinationAddress: string;
}) => Promise<{ txId: string; coinDeliveryWarning?: string }>;

export function usePrivateWithdrawalSubmitHandler(parameters: {
  dispatch: AppDispatch;
  canSubmit: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  selectedAsset: AssetWithTrustline | undefined;
  submit: PrivateWithdrawalSubmit;
  navigate: NavigateFunction;
  senderPrivateAddress: string;
  ensureSenderScalar: () => Promise<string>;
  destinationTrim: string;
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
      await assertWithdrawalDestinationCanReceiveAsset({
        asset: parameters.selectedAsset,
        destinationAddress: parameters.destinationTrim,
      });
      await parameters.ensureSenderScalar();
      const result = await parameters.submit({
        senderPrivateAddress: parameters.senderPrivateAddress,
        assetId: parameters.selectedAsset.assetId,
        tokenContractRaw: parameters.selectedAsset.clientContract ?? "",
        amountDisplay: parameters.numericAmount,
        destinationAddress: parameters.destinationTrim,
      });
      parameters.dispatch(
        addTransaction(
          buildUserTransaction({
            txId: result.txId,
            type: "withdrawal",
            assetId: parameters.selectedAsset.assetId,
            amount: parameters.numericAmount,
            counterparty: parameters.destinationTrim,
            senderPrivateAddress: parameters.senderPrivateAddress.trim(),
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
  };

  return { submitError, handleSubmit };
}
