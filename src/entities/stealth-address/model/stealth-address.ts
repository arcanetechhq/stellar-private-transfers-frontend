import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { StealthAddressState, StealthNonceEntry, StealthPersistedShape } from "./types";

const initialPersisted: StealthPersistedShape = {
  byNonce: {},
  defaultNonce: undefined,
};

const initialState: StealthAddressState = {
  ...initialPersisted,
  scalarByNonce: {},
};

const stealthAddressSlice = createSlice({
  name: "stealthAddress",
  initialState,
  reducers: {
    hydrateFromStorage: (
      state,
      action: PayloadAction<StealthPersistedShape | undefined>,
    ) => {
      const payload = action.payload ?? initialPersisted;
      state.byNonce = { ...payload.byNonce };
      state.defaultNonce = payload.defaultNonce ?? undefined;
      state.scalarByNonce = {};
    },
    resetForWalletChange: () => ({ ...initialState }),
    setStealthRecord: (
      state,
      action: PayloadAction<{ nonce: string; entry: StealthNonceEntry }>,
    ) => {
      state.byNonce[action.payload.nonce] = action.payload.entry;
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
  setStealthRecord,
  setDefaultNonce,
  setScalarForNonce,
  clearScalars,
} = stealthAddressSlice.actions;

export const stealthAddressReducer = stealthAddressSlice.reducer;

export type StealthAddressRootState = { stealthAddress: StealthAddressState };

export const selectStealthState = (state: StealthAddressRootState) =>
  state.stealthAddress;

export const selectStealthByNonce =
  (nonce: string | undefined) => (state: StealthAddressRootState) =>
    nonce ? state.stealthAddress.byNonce[nonce] : undefined;

export const selectDefaultNonce = (state: StealthAddressRootState) =>
  state.stealthAddress.defaultNonce;

export const selectScalarByNonce =
  (nonce: string | undefined) => (state: StealthAddressRootState) =>
    nonce ? state.stealthAddress.scalarByNonce[nonce] : undefined;

export const selectAllStealthNonces = (state: StealthAddressRootState) =>
  Object.keys(state.stealthAddress.byNonce);
