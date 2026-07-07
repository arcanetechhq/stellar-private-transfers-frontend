import { createAsyncThunk } from "@reduxjs/toolkit";
import { getPrivacySdkClientOrThrow } from "@/shared/lib/privacy-sdk/transact-context.js";

export interface SorobanTransactionDetailsFulfilled {
  txHash: string;
  rpcStatus: "SUCCESS";
  invokedPoolContractId: string | undefined;
  transferAmountRaw: string | undefined;
  ledger: number;
  createdAt: number | undefined;
}

export type SorobanFetchReject =
  | { kind: "not_found"; message: string }
  | { kind: "failed"; message: string }
  | { kind: "rpc_error"; message: string };

type ChainEntryLite = { status?: string };

type TransactionStateSlice = {
  transaction: { chainDetailsByHash: Record<string, ChainEntryLite | undefined> };
};

const MILLISECONDS_PER_SECOND = 1000;

function parseCreatedAtSeconds(createdAt: string | undefined): number | undefined {
  if (!createdAt) {
    return undefined;
  }
  const parsed = Date.parse(createdAt);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return Math.trunc(parsed / MILLISECONDS_PER_SECOND);
}

export const fetchSorobanTransactionDetails = createAsyncThunk<
  SorobanTransactionDetailsFulfilled,
  string,
  { rejectValue: SorobanFetchReject }
>(
  "transaction/fetchSorobanTransactionDetails",
  async (txHash, { rejectWithValue }) => {
    const trimmed = txHash.trim();
    if (!trimmed) {
      return rejectWithValue({ kind: "rpc_error", message: "Missing tx hash" });
    }
    try {
      const privacyClient = getPrivacySdkClientOrThrow();
      const details = await privacyClient.getTransactionDetails(trimmed);
      if (details.status === "failed") {
        return rejectWithValue({
          kind: "failed",
          message: "Transaction failed on network",
        });
      }
      return {
        txHash: trimmed,
        rpcStatus: "SUCCESS",
        invokedPoolContractId: details.invokedPoolContractId,
        transferAmountRaw: details.transferAmountRaw,
        ledger: details.ledger ?? 0,
        createdAt: parseCreatedAtSeconds(details.createdAt),
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Soroban request failed";
      if (message.toLowerCase().includes("not found")) {
        return rejectWithValue({
          kind: "not_found",
          message: "Transaction not found",
        });
      }
      return rejectWithValue({ kind: "rpc_error", message });
    }
  },
  {
    condition: (txHash, { getState }) => {
      const trimmed = txHash.trim();
      if (!trimmed) {
        return false;
      }
      const state = getState() as TransactionStateSlice;
      const entry = state.transaction.chainDetailsByHash[trimmed];
      if (entry?.status === "loading") {
        return false;
      }
      if (entry?.status === "succeeded") {
        return false;
      }
      return true;
    },
  },
);
