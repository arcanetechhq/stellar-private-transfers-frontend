import type { Dispatch, SetStateAction } from "react";
import type { NavigateFunction } from "react-router";
import type { AppDispatch } from "@/store";
import type { AssetWithTrustline } from "@/entities/asset";
import {
  readRelayAction,
  type RelayActionState,
} from "@/shared/lib/protocol-relay";
import {
  type ConfidentialTransferSuccess,
  readConfidentialTransferSubmitError,
  runConfidentialTransferSubmitFlow,
} from "./confidential-transfer-submit-flow";

export type ConfidentialTransferSubmit = (payload: {
  senderPrivateAddress: string;
  recipientStellarAddress: string;
  assetId: string;
  tokenContractRaw: string;
  amountDisplay: number;
}) => Promise<{ txId: string; coinDeliveryWarning?: string }>;

export type ConfidentialTransferSubmitParameters = {
  dispatch: AppDispatch;
  canSubmit: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setIsPreparingWallet: Dispatch<SetStateAction<boolean>>;
  selectedAsset: AssetWithTrustline | undefined;
  submit: ConfidentialTransferSubmit;
  navigate: NavigateFunction;
  ensureWalletPrivateAddress: () => Promise<string>;
  ensureWalletScalar: (privateAddressStpl1?: string) => Promise<string>;
  recipientTrim: string;
  numericAmount: number;
  walletPublicKey: string;
  onSuccess?: (result: ConfidentialTransferSuccess) => void;
};

export type RelayActionControls = {
  setSubmitError: Dispatch<SetStateAction<string | undefined>>;
  setRelayAction: Dispatch<SetStateAction<RelayActionState | undefined>>;
};

export async function confirmConfidentialTransfer(input: {
  parameters: ConfidentialTransferSubmitParameters;
  controls: RelayActionControls;
}): Promise<void> {
  if (!input.parameters.selectedAsset) {
    return;
  }
  if (!input.parameters.canSubmit) {
    input.controls.setSubmitError("Complete all fields before sending");
    return;
  }
  input.parameters.setIsPreparingWallet(true);
  input.controls.setSubmitError(undefined);
  input.controls.setRelayAction(undefined);
  try {
    await runConfidentialTransferSubmitFlow({
      navigate: input.parameters.navigate,
      ensureWalletPrivateAddress: input.parameters.ensureWalletPrivateAddress,
      ensureWalletScalar: input.parameters.ensureWalletScalar,
      submit: input.parameters.submit,
      selectedAsset: input.parameters.selectedAsset,
      recipientTrim: input.parameters.recipientTrim,
      numericAmount: input.parameters.numericAmount,
      onWalletReady: () => {
        input.parameters.setIsPreparingWallet(false);
        input.parameters.setIsSubmitting(true);
      },
      onSuccess: input.parameters.onSuccess,
    });
  } catch (error: unknown) {
    console.error("Private transfer failed:", error);
    input.controls.setSubmitError(readConfidentialTransferSubmitError(error));
    input.controls.setRelayAction(readRelayAction(error));
  } finally {
    input.parameters.setIsPreparingWallet(false);
    input.parameters.setIsSubmitting(false);
  }
}
