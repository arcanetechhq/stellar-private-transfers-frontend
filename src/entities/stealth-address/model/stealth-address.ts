import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  StealthAddressState,
  StealthNonceEntry,
  StealthPersistedShape,
} from "./types";

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
    setStealthRecord: (
      state,
      action: PayloadAction<{ nonce: string; entry: StealthNonceEntry }>,
    ) => {
      const { stealthAddress, createdAt } = action.payload.entry;
      state.byNonce[action.payload.nonce] = { stealthAddress, createdAt };
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

export const selectNonceByStealthAddress =
  (stealthAddress: string | undefined) => (state: StealthAddressRootState) => {
    const trimmed = stealthAddress?.trim();
    if (!trimmed) {
      return;
    }
    const { byNonce } = state.stealthAddress;
    const match = Object.entries(byNonce).find(
      ([, entry]) => entry.stealthAddress.trim() === trimmed,
    );
    return match?.[0];
  };

export const selectScalarByStealthAddress =
  (stealthAddress: string | undefined) => (state: StealthAddressRootState) => {
    const nonce = selectNonceByStealthAddress(stealthAddress)(state);
    return selectScalarByNonce(nonce)(state);
  };

const selectStealthByNonceMap = (state: StealthAddressRootState) =>
  state.stealthAddress.byNonce;

export const selectAllStealthNonces = createSelector(
  [selectStealthByNonceMap],
  (byNonce) => Object.keys(byNonce),
);
