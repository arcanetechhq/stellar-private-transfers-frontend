import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  fetchSorobanTransactionDetails,
  type SorobanTransactionDetailsFulfilled,
} from "./fetch-soroban-transaction-details";

export interface Transaction {
  id: string;
  date: string;
  type: "sent" | "received" | "deposit" | "withdrawal" | "merge" | "claim";
  assetId: string;
  amount: number;
  counterparty: string;
  senderPrivateAddress?: string;
  status: "completed" | "pending" | "processing" | "created" | "failed";
  confirmationStatus: "created" | "sent" | "viewed" | "used" | "none";
  disclosureStatus: "none" | "partial" | "full" | "pending";
}

export type ChainDetailsEntry =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "succeeded"; data: SorobanTransactionDetailsFulfilled }
  | { status: "failed"; error: string };

export interface TransactionState {
  items: Transaction[];
  chainDetailsByHash: Record<string, ChainDetailsEntry>;
  transactionsLoaded: boolean;
}

const initialState: TransactionState = {
  items: [],
  chainDetailsByHash: {},
  transactionsLoaded: false,
};

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    replaceTransactionItems: (state, action: PayloadAction<Transaction[]>) => {
      state.items = action.payload;
      state.transactionsLoaded = true;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id,
      );
      if (index === -1) {
        state.items.unshift(action.payload);
      } else {
        state.items[index] = action.payload;
      }
    },
    resetForWalletChange: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSorobanTransactionDetails.pending, (state, action) => {
        const hash = action.meta.arg.trim();
        if (!hash) {
          return;
        }
        state.chainDetailsByHash[hash] = { status: "loading" };
      })
      .addCase(fetchSorobanTransactionDetails.fulfilled, (state, action) => {
        const hash = action.payload.txHash;
        state.chainDetailsByHash[hash] = {
          status: "succeeded",
          data: action.payload,
        };
      })
      .addCase(fetchSorobanTransactionDetails.rejected, (state, action) => {
        const hash = action.meta.arg.trim();
        if (!hash) {
          return;
        }
        const message =
          action.payload?.message ??
          (action.error.message || "Failed to load transaction");
        state.chainDetailsByHash[hash] = { status: "failed", error: message };
      });
  },
});

export const { replaceTransactionItems, addTransaction, resetForWalletChange } =
  transactionSlice.actions;

export const transactionReducer = transactionSlice.reducer;

export type TransactionRootState = { transaction: TransactionState };

export const selectTransactions = (state: TransactionRootState) =>
  state.transaction.items;

export const selectAreTransactionsLoaded = (state: TransactionRootState) =>
  state.transaction.transactionsLoaded;

export const selectTransactionById =
  (id: string) => (state: TransactionRootState) =>
    state.transaction.items.find((item) => item.id === id);

export const selectChainDetailsForHash =
  (txHash: string) => (state: TransactionRootState) => {
    const trimmed = txHash.trim();
    if (!trimmed) {
      return;
    }
    return state.transaction.chainDetailsByHash[trimmed];
  };
