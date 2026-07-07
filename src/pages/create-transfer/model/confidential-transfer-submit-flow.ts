import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { NavigateFunction } from "react-router";
import type { AppDispatch } from "@/store";
import type { AssetWithTrustline } from "@/entities/asset";
import { addTransaction, buildUserTransaction } from "@/entities/transaction";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";

type ConfidentialTransferSubmit = (payload: {
  senderPrivateAddress: string;
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
}): Promise<{ senderPrivateAddress: string }> {
  const senderPrivateAddress = await parameters.ensureWalletPrivateAddress();
  return { senderPrivateAddress };
}

async function submitPreparedConfidentialTransfer(parameters: {
  submit: ConfidentialTransferSubmit;
  selectedAsset: AssetWithTrustline;
  recipientTrim: string;
  numericAmount: number;
  senderPrivateAddress: string;
}): Promise<{ txId: string; coinDeliveryWarning?: string }> {
  return parameters.submit({
    senderPrivateAddress: parameters.senderPrivateAddress,
    recipientStellarAddress: parameters.recipientTrim,
    assetId: parameters.selectedAsset.assetId,
    tokenContractRaw: parameters.selectedAsset.clientContract ?? "",
    amountDisplay: parameters.numericAmount,
  });
}

function recordSuccessfulTransfer(parameters: {
  dispatch: AppDispatch;
  navigate: NavigateFunction;
  selectedAsset: AssetWithTrustline;
  recipientTrim: string;
  numericAmount: number;
  senderPrivateAddress: string;
  txId: string;
  coinDeliveryWarning?: string;
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
  parameters.navigate(
    `/transfer-success/${encodeURIComponent(parameters.txId)}`,
    {
      state: {
        txId: parameters.txId,
        amount: parameters.numericAmount,
        assetId: parameters.selectedAsset.assetId,
        poolContract,
        coinDeliveryWarning: parameters.coinDeliveryWarning,
      },
    },
  );
}

export async function runConfidentialTransferSubmitFlow(parameters: {
  dispatch: AppDispatch;
  navigate: NavigateFunction;
  ensureWalletPrivateAddress: () => Promise<string>;
  submit: ConfidentialTransferSubmit;
  selectedAsset: AssetWithTrustline;
  recipientTrim: string;
  numericAmount: number;
  onWalletReady: () => void;
}): Promise<void> {
  const preparedWallet = await prepareWalletTransferKeys(parameters);
  parameters.onWalletReady();
  const submitted = await submitPreparedConfidentialTransfer({
    submit: parameters.submit,
    selectedAsset: parameters.selectedAsset,
    recipientTrim: parameters.recipientTrim,
    numericAmount: parameters.numericAmount,
    senderPrivateAddress: preparedWallet.senderPrivateAddress,
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
  });
}
