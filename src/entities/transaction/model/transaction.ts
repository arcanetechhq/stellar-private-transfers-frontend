import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Transaction {
  id: string;
  date: string;
  type: "sent" | "received" | "deposit" | "withdrawal" | "merge";
  assetId: string;
  amount: number;
  counterparty: string;
  status: "completed" | "pending" | "processing" | "created" | "failed";
  confirmationStatus: "created" | "sent" | "viewed" | "used" | "none";
  disclosureStatus: "none" | "partial" | "full" | "pending";
}

export interface TransactionState {
  items: Transaction[];
}

const initialState: TransactionState = {
  items: [],
};

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    hydrateTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.items = action.payload;
    },
    resetForWalletChange: () => initialState,
  },
});

export const { hydrateTransactions, resetForWalletChange } =
  transactionSlice.actions;

export const transactionReducer = transactionSlice.reducer;

export type TransactionRootState = { transaction: TransactionState };

export const selectTransactions = (state: TransactionRootState) =>
  state.transaction.items;

export const selectTransactionById =
  (id: string) => (state: TransactionRootState) =>
    state.transaction.items.find((item) => item.id === id);
