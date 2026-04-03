import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "@/app/store";
import { selectCoinItems } from "@/entities/coin";
import { selectWalletPublicKey } from "@/entities/wallet";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import { runConfidentialTransferMutation } from "../lib/run-confidential-transfer-mutation";

export interface SubmitConfidentialTransferPayload {
  senderStealthAddress: string;
  recipientStealthStpl1: string;
  assetId: string;
  poolContractRaw: string;
  amountDisplay: number;
}

export const submitConfidentialTransferThunk = createAsyncThunk<
  { txId: string; coinDeliveryWarning?: string },
  SubmitConfidentialTransferPayload,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  "createTransfer/submitConfidential",
  async (payload, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const walletPublicKey = selectWalletPublicKey(state);
    if (!walletPublicKey?.trim()) {
      return rejectWithValue("Wallet not connected");
    }
    const senderTrim = payload.senderStealthAddress.trim();
    const finalizedCoinsForSenderAndAsset = selectCoinItems(state).filter(
      (item) =>
        item.stealthAddress === senderTrim &&
        item.status === "finalized" &&
        item.assetId === payload.assetId,
    );
    const { sorobanRpcUrl, networkPassphrase } = getDefaultStellarNetworkConfig();
    try {
      return await runConfidentialTransferMutation({
        dispatch,
        walletPublicKey,
        networkPassphrase,
        sorobanRpcUrl,
        senderStealthAddress: senderTrim,
        recipientStealthStpl1: payload.recipientStealthStpl1.trim(),
        assetId: payload.assetId,
        poolContractRaw: payload.poolContractRaw,
        amountDisplay: payload.amountDisplay,
        finalizedCoinsForSenderAndAsset,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Transfer failed";
      return rejectWithValue(message);
    }
  },
);
