import { createAsyncThunk } from "@reduxjs/toolkit";
import { Api, Server } from "@stellar/stellar-sdk/rpc";
import { parseStellarRpcUnixTimestampSeconds } from "@/shared/lib/stellar/stellar-rpc-unix-timestamp";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import {
  extractInvokedPoolContractFromEnvelope,
  tryExtractTransferAmountRawFromMeta,
} from "@/shared/lib/stellar/soroban-transaction-meta";

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

function buildSorobanSuccessPayload(
  trimmed: string,
  response: Api.GetSuccessfulTransactionResponse,
): SorobanTransactionDetailsFulfilled {
  const envelope = response.envelopeXdr;
  const meta = response.resultMetaXdr;
  const invokedPoolContractId =
    extractInvokedPoolContractFromEnvelope(envelope);
  const transferAmountRaw =
    invokedPoolContractId === undefined
      ? undefined
      : tryExtractTransferAmountRawFromMeta(meta, invokedPoolContractId);
  const responseRecord = response as {
    createdAt?: unknown;
    created_at?: unknown;
  };
  const createdAt = parseStellarRpcUnixTimestampSeconds(
    responseRecord.createdAt ?? responseRecord.created_at,
  );
  return {
    txHash: trimmed,
    rpcStatus: "SUCCESS",
    invokedPoolContractId,
    transferAmountRaw,
    ledger: response.ledger,
    createdAt,
  };
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
    const { sorobanRpcUrl } = getDefaultStellarNetworkConfig();
    const server = new Server(sorobanRpcUrl, { allowHttp: true });
    let response: Api.GetTransactionResponse;
    try {
      response = await server.getTransaction(trimmed);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Soroban request failed";
      return rejectWithValue({ kind: "rpc_error", message });
    }
    if (response.status === Api.GetTransactionStatus.NOT_FOUND) {
      return rejectWithValue({
        kind: "not_found",
        message: "Transaction not found",
      });
    }
    if (response.status === Api.GetTransactionStatus.FAILED) {
      return rejectWithValue({
        kind: "failed",
        message: "Transaction failed on network",
      });
    }
    return buildSorobanSuccessPayload(
      trimmed,
      response as Api.GetSuccessfulTransactionResponse,
    );
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
