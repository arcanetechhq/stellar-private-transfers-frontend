import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "@/store";
import { selectCoinItems } from "@/entities/coin";
import { selectScalarByPrivateAddress } from "@/entities/private-address";
import { selectWalletPublicKey } from "@/entities/wallet";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import { runConfidentialTransferMutation } from "../lib/run-confidential-transfer-mutation";

export interface SubmitConfidentialTransferPayload {
  senderPrivateAddress: string;
  recipientPrivateAddressStpl1: string;
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
    const senderPrivKeyScalarHex =
      selectScalarByPrivateAddress(senderTrim)(state);
    if (!senderPrivKeyScalarHex?.trim()) {
      return rejectWithValue(
        "PrivateAddress key scalar is missing; open private address settings first",
      );
    }
    const { sorobanRpcUrl, networkPassphrase } =
      getDefaultStellarNetworkConfig();
    try {
      return await runConfidentialTransferMutation({
        dispatch,
        walletPublicKey,
        networkPassphrase,
        sorobanRpcUrl,
        senderPrivKeyScalarHex,
        senderPrivateAddress: senderTrim,
        recipientPrivateAddressStpl1: payload.recipientPrivateAddressStpl1.trim(),
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
