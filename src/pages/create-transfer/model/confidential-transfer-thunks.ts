import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "@/store";
import { selectCoinItems } from "@/entities/coin";
import { selectWalletPublicKey } from "@/entities/wallet";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import { runConfidentialTransferMutation } from "../lib/run-confidential-transfer-mutation";

export interface SubmitConfidentialTransferPayload {
  senderPrivateAddress: string;
  recipientStellarAddress: string;
  assetId: string;
  tokenContractRaw: string;
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
    const senderTrim = payload.senderPrivateAddress.trim();
    const finalizedCoinsForSenderAndAsset = selectCoinItems(state).filter(
      (item) =>
        item.privateAddress === senderTrim &&
        item.status === "finalized" &&
        item.assetId === payload.assetId,
    );
    const { sorobanRpcUrl, networkPassphrase } =
      getDefaultStellarNetworkConfig();
    try {
      return await runConfidentialTransferMutation({
        dispatch,
        walletPublicKey,
        networkPassphrase,
        sorobanRpcUrl,
        senderPrivateAddress: senderTrim,
        recipientStellarAddress: payload.recipientStellarAddress.trim(),
        recipientPrivateAddressStpl1: "",
        assetId: payload.assetId,
        tokenContractRaw: payload.tokenContractRaw,
        amountDisplay: payload.amountDisplay,
        finalizedCoinsForSenderAndAsset,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Transfer failed";
      return rejectWithValue(message);
    }
  },
);
