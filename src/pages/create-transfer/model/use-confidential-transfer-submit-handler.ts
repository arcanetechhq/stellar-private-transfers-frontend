import {
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import type { NavigateFunction } from "react-router";
import type { AppDispatch } from "@/store";
import type { AssetWithTrustline } from "@/entities/asset";
import {
  readConfidentialTransferSubmitError,
  runConfidentialTransferSubmitFlow,
} from "./confidential-transfer-submit-flow";

type ConfidentialTransferSubmit = (payload: {
  senderPrivateAddress: string;
  senderPrivKeyScalarHex: string;
  recipientStellarAddress: string;
  assetId: string;
  tokenContractRaw: string;
  amountDisplay: number;
}) => Promise<{ txId: string; coinDeliveryWarning?: string }>;

export function useConfidentialTransferSubmitHandler(parameters: {
  dispatch: AppDispatch;
  canSubmit: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setIsPreparingWallet: Dispatch<SetStateAction<boolean>>;
  selectedAsset: AssetWithTrustline | undefined;
  submit: ConfidentialTransferSubmit;
  navigate: NavigateFunction;
  ensureWalletPrivateAddress: () => Promise<string>;
  ensureWalletScalar: () => Promise<string>;
  recipientTrim: string;
  numericAmount: number;
}) {
  const [submitError, setSubmitError] = useState<string | undefined>();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!parameters.selectedAsset) {
      return;
    }
    if (!parameters.canSubmit) {
      setSubmitError("Complete all fields before sending");
      return;
    }
    parameters.setIsPreparingWallet(true);
    setSubmitError(undefined);
    try {
      await runConfidentialTransferSubmitFlow({
        dispatch: parameters.dispatch,
        navigate: parameters.navigate,
        ensureWalletPrivateAddress: parameters.ensureWalletPrivateAddress,
        ensureWalletScalar: parameters.ensureWalletScalar,
        submit: parameters.submit,
        selectedAsset: parameters.selectedAsset,
        recipientTrim: parameters.recipientTrim,
        numericAmount: parameters.numericAmount,
        onWalletReady: () => {
          parameters.setIsPreparingWallet(false);
          parameters.setIsSubmitting(true);
        },
      });
    } catch (error: unknown) {
      setSubmitError(readConfidentialTransferSubmitError(error));
    } finally {
      parameters.setIsPreparingWallet(false);
      parameters.setIsSubmitting(false);
    }
  };

  return { submitError, handleSubmit };
}
