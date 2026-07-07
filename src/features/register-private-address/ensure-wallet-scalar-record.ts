import type { AppDispatch } from "@/store";
import type { Store } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import {
  ensurePrivateAddressScalarForNonce,
  readPrivateAddressRecordFromStorage,
  runWalletCreatePrivateAddressFlow,
  selectScalarByNonce,
  type EnsureScalarResult,
} from "@/entities/private-address";
import { readWalletScalarFromState } from "@/shared/lib/privacy-sdk/read-wallet-scalar-from-state.js";
import {
  readStoredPrivateAddressFromSdkState,
} from "@/shared/lib/privacy-sdk/wallet-private-address-sdk-branch.js";
import {
  readWalletDefaultPrivateAddressNonceFromSdkState,
  saveWalletPrivateAddressRecordToSdkState,
  setWalletDefaultPrivateAddressNonceToSdkState,
} from "@/shared/lib/privacy-sdk/wallet-private-address-sdk-state.js";
import { saveWalletPrivateAddressScalarToSdkState } from "@/shared/lib/privacy-sdk/wallet-scalar-sdk-state.js";
import { store } from "@/store/store.js";

function scalarUnavailableMessage(result: EnsureScalarResult): string {
  if (result.ok) {
    return "Private address scalar is unavailable";
  }
  if (result.reason === "mismatch") {
    return "Private address no longer matches wallet signature; reconnect wallet and try again";
  }
  if (result.reason === "sign_failed") {
    return "Wallet signature was rejected or failed";
  }
  if (result.reason === "no_address") {
    return "Private address is missing";
  }
  return "Private address scalar is unavailable";
}

function readStoredPrivateAddress(input: {
  getState: Store<RootState>["getState"];
  publicKey: string;
  nonce: string;
}): string | undefined {
  return readStoredPrivateAddressFromSdkState({
    state: input.getState(),
    owner: input.publicKey,
    nonce: input.nonce,
  });
}

async function ensureDefaultNonce(publicKey: string, nonce: string): Promise<void> {
  const existing = readWalletDefaultPrivateAddressNonceFromSdkState({
    state: store.getState(),
    owner: publicKey,
  });
  if (!existing) {
    await setWalletDefaultPrivateAddressNonceToSdkState({ owner: publicKey, nonce });
  }
}

async function ensureWalletPrivateAddressForScalar(parameters: {
  getState: Store<RootState>["getState"];
  publicKey: string;
  nonce: string;
}): Promise<void> {
  const fromState = readStoredPrivateAddress({
    getState: parameters.getState,
    publicKey: parameters.publicKey,
    nonce: parameters.nonce,
  });
  const fromDisk = readPrivateAddressRecordFromStorage(
    parameters.publicKey,
    parameters.nonce,
  );
  if (!fromState && !fromDisk?.privateAddress.trim()) {
    await runWalletCreatePrivateAddressFlow({
      getState: parameters.getState,
      publicKey: parameters.publicKey,
      trimmedNonce: parameters.nonce,
      setStatus: () => {
        return;
      },
      setErrorKind: () => {
        return;
      },
    });
    return;
  }
  if (fromDisk?.privateAddress.trim() && !fromState) {
    const diskScalar = fromDisk.recipientScalarHex?.trim();
    await saveWalletPrivateAddressRecordToSdkState({
      owner: parameters.publicKey,
      nonce: parameters.nonce,
      privateAddress: fromDisk.privateAddress,
      createdAt: fromDisk.createdAt,
    });
    if (diskScalar) {
      await saveWalletPrivateAddressScalarToSdkState({
        owner: parameters.publicKey,
        nonce: parameters.nonce,
        scalarHex: diskScalar,
      });
    }
    await ensureDefaultNonce(parameters.publicKey, parameters.nonce);
  }
}

function resolveStoredScalar(parameters: {
  getState: Store<RootState>["getState"];
  publicKey: string;
  privateAddressStpl1?: string;
  defaultNonce: string;
}): string | undefined {
  return (
    readWalletScalarFromState({
      getState: parameters.getState,
      publicKey: parameters.publicKey,
      privateAddressStpl1: parameters.privateAddressStpl1 ?? "",
      defaultNonce: parameters.defaultNonce,
    }) ?? selectScalarByNonce(parameters.defaultNonce)(parameters.getState())?.trim()
  );
}

export async function ensureWalletScalarRecord(parameters: {
  dispatch: AppDispatch;
  getState: Store<RootState>["getState"];
  publicKey: string;
  defaultNonce: string;
  privateAddressStpl1?: string;
}): Promise<string> {
  const trimmedPublicKey = parameters.publicKey.trim();
  const trimmedNonce = parameters.defaultNonce.trim();
  const cachedScalar = resolveStoredScalar({
    getState: parameters.getState,
    publicKey: trimmedPublicKey,
    privateAddressStpl1: parameters.privateAddressStpl1,
    defaultNonce: trimmedNonce,
  });
  if (cachedScalar) {
    return cachedScalar;
  }
  await ensureWalletPrivateAddressForScalar({
    getState: parameters.getState,
    publicKey: trimmedPublicKey,
    nonce: trimmedNonce,
  });
  const scalarResult = await ensurePrivateAddressScalarForNonce({
    getState: parameters.getState,
    publicKey: trimmedPublicKey,
    nonce: trimmedNonce,
  });
  if (!scalarResult.ok) {
    throw new Error(scalarUnavailableMessage(scalarResult));
  }
  const scalar = resolveStoredScalar({
    getState: parameters.getState,
    publicKey: trimmedPublicKey,
    privateAddressStpl1: parameters.privateAddressStpl1,
    defaultNonce: trimmedNonce,
  });
  if (!scalar) {
    throw new Error("Private address scalar is unavailable");
  }
  return scalar;
}
