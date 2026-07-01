import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { NavigateFunction } from "react-router";
import type { AppDispatch } from "@/store";
import type { AssetWithTrustline } from "@/entities/asset";
import { addTransaction, buildUserTransaction } from "@/entities/transaction";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";

type ConfidentialTransferSubmit = (payload: {
  senderPrivateAddress: string;
  senderPrivKeyScalarHex: string;
  recipientStellarAddress: string;
  assetId: string;
  tokenContractRaw: string;
  amountDisplay: number;
}) => Promise<{ txId: string; coinDeliveryWarning?: string }>;

export function readConfidentialTransferSubmitError(error: unknown): string {
  if (isRejectedWithValue(error)) {
    const payload = error.payload;
    return typeof payload === "string" ? payload : "Transfer failed";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Transfer failed";
}

async function prepareWalletTransferKeys(parameters: {
  ensureWalletPrivateAddress: () => Promise<string>;
  ensureWalletScalar: () => Promise<string>;
}): Promise<{ senderPrivateAddress: string; senderPrivKeyScalarHex: string }> {
  const senderPrivateAddress = await parameters.ensureWalletPrivateAddress();
  const senderPrivKeyScalarHex = await parameters.ensureWalletScalar();
  return { senderPrivateAddress, senderPrivKeyScalarHex };
}

async function submitPreparedConfidentialTransfer(parameters: {
  submit: ConfidentialTransferSubmit;
  selectedAsset: AssetWithTrustline;
  recipientTrim: string;
  numericAmount: number;
  senderPrivateAddress: string;
  senderPrivKeyScalarHex: string;
}): Promise<{ txId: string; coinDeliveryWarning?: string }> {
  return parameters.submit({
    senderPrivateAddress: parameters.senderPrivateAddress,
    senderPrivKeyScalarHex: parameters.senderPrivKeyScalarHex,
    recipientStellarAddress: parameters.recipientTrim,
    assetId: parameters.selectedAsset.assetId,
    tokenContractRaw: parameters.selectedAsset.clientContract ?? "",
    amountDisplay: parameters.numericAmount,
  });
}

export type ConfidentialTransferSuccess = {
  txId: string;
  amount: number;
  assetId: string;
  recipient: string;
  poolContract: string;
  coinDeliveryWarning?: string;
};

function recordSuccessfulTransfer(parameters: {
  dispatch: AppDispatch;
  navigate: NavigateFunction;
  selectedAsset: AssetWithTrustline;
  recipientTrim: string;
  numericAmount: number;
  senderPrivateAddress: string;
  txId: string;
  coinDeliveryWarning?: string;
  onSuccess?: (result: ConfidentialTransferSuccess) => void;
}): void {
  const poolContract = getRequiredPrivacyPoolContractId();
  parameters.dispatch(
    addTransaction(
      buildUserTransaction({
        txId: parameters.txId,
        type: "sent",
        assetId: parameters.selectedAsset.assetId,
        amount: parameters.numericAmount,
        counterparty: parameters.recipientTrim,
        senderPrivateAddress: parameters.senderPrivateAddress.trim(),
      }),
    ),
  );
  const successResult: ConfidentialTransferSuccess = {
    txId: parameters.txId,
    amount: parameters.numericAmount,
    assetId: parameters.selectedAsset.assetId,
    recipient: parameters.recipientTrim,
    poolContract,
    coinDeliveryWarning: parameters.coinDeliveryWarning,
  };
  if (parameters.onSuccess) {
    parameters.onSuccess(successResult);
    return;
  }
  parameters.navigate(
    `/transfer-success/${encodeURIComponent(parameters.txId)}`,
    {
      state: {
        txId: successResult.txId,
        amount: successResult.amount,
        assetId: successResult.assetId,
        poolContract: successResult.poolContract,
        coinDeliveryWarning: successResult.coinDeliveryWarning,
        flow: "transfer",
      },
    },
  );
}

export async function runConfidentialTransferSubmitFlow(parameters: {
  dispatch: AppDispatch;
  navigate: NavigateFunction;
  ensureWalletPrivateAddress: () => Promise<string>;
  ensureWalletScalar: () => Promise<string>;
  submit: ConfidentialTransferSubmit;
  selectedAsset: AssetWithTrustline;
  recipientTrim: string;
  numericAmount: number;
  onWalletReady: () => void;
  onSuccess?: (result: ConfidentialTransferSuccess) => void;
}): Promise<void> {
  const preparedWallet = await prepareWalletTransferKeys(parameters);
  parameters.onWalletReady();
  const submitted = await submitPreparedConfidentialTransfer({
    submit: parameters.submit,
    selectedAsset: parameters.selectedAsset,
    recipientTrim: parameters.recipientTrim,
    numericAmount: parameters.numericAmount,
    senderPrivateAddress: preparedWallet.senderPrivateAddress,
    senderPrivKeyScalarHex: preparedWallet.senderPrivKeyScalarHex,
  });
  recordSuccessfulTransfer({
    dispatch: parameters.dispatch,
    navigate: parameters.navigate,
    selectedAsset: parameters.selectedAsset,
    recipientTrim: parameters.recipientTrim,
    numericAmount: parameters.numericAmount,
    senderPrivateAddress: preparedWallet.senderPrivateAddress,
    txId: submitted.txId,
    coinDeliveryWarning: submitted.coinDeliveryWarning,
    onSuccess: parameters.onSuccess,
  });
}
