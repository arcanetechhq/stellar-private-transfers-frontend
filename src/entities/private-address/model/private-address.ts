import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  PrivateAddressState,
  PrivateAddressNonceEntry,
  PrivateAddressPersistedShape,
} from "./types";

const initialPersisted: PrivateAddressPersistedShape = {
  byNonce: {},
  defaultNonce: undefined,
};

const initialState: PrivateAddressState = {
  ...initialPersisted,
  scalarByNonce: {},
};

const privateAddressSlice = createSlice({
  name: "privateAddress",
  initialState,
  reducers: {
    hydrateFromStorage: (
      state,
      action: PayloadAction<PrivateAddressPersistedShape | undefined>,
    ) => {
      const payload = action.payload ?? initialPersisted;
      state.byNonce = {};
      state.scalarByNonce = {};
      for (const [nonceKey, persisted] of Object.entries(payload.byNonce)) {
        const { recipientScalarHex, ...entry } = persisted;
        state.byNonce[nonceKey] = entry;
        const hex = recipientScalarHex?.trim();
        if (hex) {
          state.scalarByNonce[nonceKey] = hex;
        }
      }
      state.defaultNonce = payload.defaultNonce ?? undefined;
    },
    resetForWalletChange: () => ({ ...initialState }),
    setPrivateAddressRecord: (
      state,
      action: PayloadAction<{ nonce: string; entry: PrivateAddressNonceEntry }>,
    ) => {
      const { privateAddress, createdAt } = action.payload.entry;
      state.byNonce[action.payload.nonce] = { privateAddress, createdAt };
    },
    setPrivateAddressRecordAndScalar: (
      state,
      action: PayloadAction<{
        nonce: string;
        entry: PrivateAddressNonceEntry;
        scalarHex: string;
      }>,
    ) => {
      const { privateAddress, createdAt } = action.payload.entry;
      state.byNonce[action.payload.nonce] = { privateAddress, createdAt };
      state.scalarByNonce[action.payload.nonce] = action.payload.scalarHex;
    },
    setDefaultNonce: (state, action: PayloadAction<string | undefined>) => {
      state.defaultNonce = action.payload;
    },
    setScalarForNonce: (
      state,
      action: PayloadAction<{ nonce: string; scalarHex: string }>,
    ) => {
      state.scalarByNonce[action.payload.nonce] = action.payload.scalarHex;
    },
    clearScalars: (state) => {
      state.scalarByNonce = {};
    },
  },
});

export const {
  hydrateFromStorage,
  resetForWalletChange,
  setPrivateAddressRecord,
  setPrivateAddressRecordAndScalar,
  setDefaultNonce,
  setScalarForNonce,
  clearScalars,
} = privateAddressSlice.actions;

export const privateAddressReducer = privateAddressSlice.reducer;

export type PrivateAddressRootState = { privateAddress: PrivateAddressState };

export const selectPrivateAddressState = (state: PrivateAddressRootState) =>
  state.privateAddress;

export const selectPrivateAddressByNonce =
  (nonce: string | undefined) => (state: PrivateAddressRootState) =>
    nonce ? state.privateAddress.byNonce[nonce] : undefined;

export const selectDefaultNonce = (state: PrivateAddressRootState) =>
  state.privateAddress.defaultNonce;

export const selectScalarByNonce =
  (nonce: string | undefined) => (state: PrivateAddressRootState) =>
    nonce ? state.privateAddress.scalarByNonce[nonce] : undefined;

export const selectNonceByPrivateAddress =
  (privateAddress: string | undefined) => (state: PrivateAddressRootState) => {
    const trimmed = privateAddress?.trim();
    if (!trimmed) {
      return;
    }
    const { byNonce } = state.privateAddress;
    const match = Object.entries(byNonce).find(
      ([, entry]) => entry.privateAddress.trim() === trimmed,
    );
    return match?.[0];
  };

export const selectScalarByPrivateAddress =
  (privateAddress: string | undefined) => (state: PrivateAddressRootState) => {
    const nonce = selectNonceByPrivateAddress(privateAddress)(state);
    return selectScalarByNonce(nonce)(state);
  };

const selectPrivateAddressByNonceMap = (state: PrivateAddressRootState) =>
  state.privateAddress.byNonce;

export const selectAllPrivateAddressNonces = createSelector(
  [selectPrivateAddressByNonceMap],
  (byNonce) => Object.keys(byNonce),
);
