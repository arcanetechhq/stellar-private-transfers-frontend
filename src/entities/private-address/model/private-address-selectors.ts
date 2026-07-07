import { createSelector } from "@reduxjs/toolkit";
import { selectWalletPublicKey } from "@/entities/wallet";
import type { RootState } from "@/store";
import { readWalletPrivateAddressViewFromSdkState } from "@/shared/lib/privacy-sdk/wallet-private-address-sdk-branch.js";
import type {
  PrivateAddressNonceEntry,
  PrivateAddressState,
} from "./types";

export type PrivateAddressRootState = RootState;

function readPrivateAddressView(state: RootState): PrivateAddressState {
  return readWalletPrivateAddressViewFromSdkState({
    state,
    owner: selectWalletPublicKey(state),
  });
}

export const selectPrivateAddressState = (state: RootState): PrivateAddressState =>
  readPrivateAddressView(state);

export const selectPrivateAddressByNonce =
  (nonce: string | undefined) =>
  (state: RootState): PrivateAddressNonceEntry | undefined =>
    nonce ? readPrivateAddressView(state).byNonce[nonce] : undefined;

export const selectDefaultNonce = (state: RootState): string | undefined =>
  readPrivateAddressView(state).defaultNonce;

export const selectScalarByNonce =
  (nonce: string | undefined) => (state: RootState): string | undefined =>
    nonce ? readPrivateAddressView(state).scalarByNonce[nonce] : undefined;

export const selectNonceByPrivateAddress =
  (privateAddress: string | undefined) => (state: RootState): string | undefined => {
    const trimmed = privateAddress?.trim();
    if (!trimmed) {
      return;
    }
    const { byNonce } = readPrivateAddressView(state);
    const match = Object.entries(byNonce).find(
      ([, entry]) => entry.privateAddress.trim() === trimmed,
    );
    return match?.[0];
  };

export const selectScalarByPrivateAddress =
  (privateAddress: string | undefined) => (state: RootState): string | undefined => {
    const nonce = selectNonceByPrivateAddress(privateAddress)(state);
    return selectScalarByNonce(nonce)(state);
  };

const selectPrivateAddressByNonceMap = (state: RootState) =>
  readPrivateAddressView(state).byNonce;

export const selectAllPrivateAddressNonces = createSelector(
  [selectPrivateAddressByNonceMap],
  (byNonce) => Object.keys(byNonce),
);
