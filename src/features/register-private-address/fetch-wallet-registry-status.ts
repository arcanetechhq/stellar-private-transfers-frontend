import type { AppDispatch } from "@/store";
import type { Store } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import {
  ensurePrivateAddressScalarForNonce,
  selectPrivateAddressByNonce,
} from "@/entities/private-address";
import { readWalletScalarFromState } from "@/shared/lib/privacy-sdk/read-wallet-scalar-from-state.js";
import {
  getPrivacySdkClientOrThrow,
  tryGetPrivacySdkClient,
} from "@/shared/lib/privacy-sdk/transact-context.js";
import { syncRegisteredWalletPrivateAddress } from "./ensure-wallet-private-address";
import type { WalletRegistryStatus } from "./wallet-private-address-context";

async function resolveRegisteredStatus(parameters: {
  dispatch: AppDispatch;
  getState: Store<RootState>["getState"];
  publicKey: string;
  defaultNonce: string;
  lookup: Awaited<ReturnType<ReturnType<typeof getPrivacySdkClientOrThrow>["checkRegistrationStatus"]>>;
}): Promise<WalletRegistryStatus> {
  if (parameters.lookup.status !== "registered" || !parameters.lookup.privateAddressStpl1) {
    return "unregistered";
  }
  await syncRegisteredWalletPrivateAddress({
    dispatch: parameters.dispatch,
    publicKey: parameters.publicKey,
    lookup: {
      status: "registered",
      privateAddressStpl1: parameters.lookup.privateAddressStpl1,
      publicKeyXHex: parameters.lookup.publicKeyXHex ?? "",
      publicKeyYHex: parameters.lookup.publicKeyYHex ?? "",
    },
    nonce: parameters.defaultNonce,
  });
  await hydrateDefaultScalar({
    getState: parameters.getState,
    publicKey: parameters.publicKey,
    nonce: parameters.defaultNonce,
  });
  return "active";
}

async function hydrateDefaultScalar(parameters: {
  getState: Store<RootState>["getState"];
  publicKey: string;
  nonce: string;
}): Promise<void> {
  const trimmedNonce = parameters.nonce.trim();
  if (!trimmedNonce) {
    return;
  }
  const address = selectPrivateAddressByNonce(trimmedNonce)(
    parameters.getState(),
  )?.privateAddress;
  if (!address?.trim()) {
    return;
  }
  const cachedScalar = readWalletScalarFromState({
    getState: parameters.getState,
    publicKey: parameters.publicKey,
    privateAddressStpl1: address,
    defaultNonce: trimmedNonce,
  });
  if (cachedScalar) {
    return;
  }
  await ensurePrivateAddressScalarForNonce({
    getState: parameters.getState,
    publicKey: parameters.publicKey,
    nonce: trimmedNonce,
  });
}

export async function fetchWalletRegistryStatus(parameters: {
  dispatch: AppDispatch;
  getState: Store<RootState>["getState"];
  publicKey: string;
  defaultNonce: string;
}): Promise<WalletRegistryStatus> {
  const trimmedPublicKey = parameters.publicKey.trim();
  const privacyClient = tryGetPrivacySdkClient();
  if (!privacyClient) {
    return "checking";
  }
  try {
    const lookup = await privacyClient.checkRegistrationStatus({
      address: trimmedPublicKey,
      walletPublicKey: trimmedPublicKey,
    });
    if (lookup.status === "registered") {
      return resolveRegisteredStatus({
        dispatch: parameters.dispatch,
        getState: parameters.getState,
        publicKey: trimmedPublicKey,
        defaultNonce: parameters.defaultNonce,
        lookup,
      });
    }
    return "unregistered";
  } catch {
    return "lookup_failed";
  }
}
