import type { Dispatch, SetStateAction } from "react";
import type { NavigateFunction } from "react-router";
import type { AppDispatch } from "@/store";
import type { AssetWithTrustline } from "@/entities/asset";
import { mapPrivacySdkError } from "@/shared/lib/privacy-sdk/map-privacy-sdk-errors.js";
import {
  formatProtocolRelayError,
  ProtocolRelayClientError,
  readRelayAction,
} from "@/shared/lib/protocol-relay";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import { ensureWithdrawalDestinationCanReceiveAsset } from "../lib/withdrawal-destination-trustline";
import type { PrivateWithdrawalSuccess } from "./private-withdrawal-success";
import { isRejectedWithValue } from "@reduxjs/toolkit";

export type PrivateWithdrawalSubmit = (payload: {
  senderPrivateAddress: string;
  assetId: string;
  tokenContractRaw: string;
  amountDisplay: number;
  destinationAddress: string;
}) => Promise<{ txId: string; coinDeliveryWarning?: string }>;

export type PrivateWithdrawalSubmitParameters = {
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
};

export type WithdrawalRelayControls = {
  setSubmitError: Dispatch<SetStateAction<string | undefined>>;
  setRelayAction: Dispatch<
    SetStateAction<ReturnType<typeof readRelayAction>>
  >;
};

export function readWithdrawalSubmitError(error: unknown): string {
  if (error instanceof ProtocolRelayClientError) {
    return formatProtocolRelayError(error);
  }
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

function presentWithdrawalSuccess(input: {
  parameters: PrivateWithdrawalSubmitParameters;
  selectedAsset: AssetWithTrustline;
  result: { txId: string; coinDeliveryWarning?: string };
}): void {
  const poolContract = getRequiredPrivacyPoolContractId();
  const successResult: PrivateWithdrawalSuccess = {
    txId: input.result.txId,
    amount: input.parameters.numericAmount,
    assetId: input.selectedAsset.assetId,
    destination: input.parameters.destinationTrim,
    poolContract,
    coinDeliveryWarning: input.result.coinDeliveryWarning,
  };
  if (input.parameters.onSuccess) {
    input.parameters.onSuccess(successResult);
    return;
  }
  input.parameters.navigate(
    `/transfer-success/${encodeURIComponent(input.result.txId)}`,
    {
      state: {
        txId: input.result.txId,
        amount: input.parameters.numericAmount,
        assetId: input.selectedAsset.assetId,
        poolContract,
        coinDeliveryWarning: input.result.coinDeliveryWarning,
      },
    },
  );
}

export async function confirmPrivateWithdrawal(input: {
  parameters: PrivateWithdrawalSubmitParameters;
  controls: WithdrawalRelayControls;
}): Promise<void> {
  if (!input.parameters.canSubmit || !input.parameters.selectedAsset) {
    return;
  }
  input.parameters.setIsSubmitting(true);
  input.controls.setSubmitError(undefined);
  input.controls.setRelayAction(undefined);
  try {
    await ensureWithdrawalDestinationCanReceiveAsset({
      dispatch: input.parameters.dispatch,
      asset: input.parameters.selectedAsset,
      destinationAddress: input.parameters.destinationTrim,
      connectedPublicKey: input.parameters.connectedPublicKey,
    });
    const selectedAsset = input.parameters.selectedAsset;
    const result = await input.parameters.submit({
      senderPrivateAddress: input.parameters.senderPrivateAddress,
      assetId: selectedAsset.assetId,
      tokenContractRaw: selectedAsset.clientContract ?? "",
      amountDisplay: input.parameters.numericAmount,
      destinationAddress: input.parameters.destinationTrim,
    });
    presentWithdrawalSuccess({
      parameters: input.parameters,
      selectedAsset,
      result,
    });
  } catch (error: unknown) {
    input.controls.setSubmitError(logWithdrawalFailure(error));
    input.controls.setRelayAction(readRelayAction(error));
  } finally {
    input.parameters.setIsSubmitting(false);
  }
}
