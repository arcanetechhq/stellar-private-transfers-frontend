import type { AppDispatch } from "@/store";
import type { Store } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import {
  ensurePrivateAddressScalarForNonce,
  type EnsureScalarResult,
} from "@/entities/private-address";
import { ensureWalletPrivateAddressRecord } from "./ensure-wallet-private-address";

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

export async function ensureWalletScalarRecord(parameters: {
  dispatch: AppDispatch;
  getState: Store<RootState>["getState"];
  publicKey: string;
  defaultNonce: string;
}): Promise<string> {
  const trimmedPublicKey = parameters.publicKey.trim();
  await ensureWalletPrivateAddressRecord({
    dispatch: parameters.dispatch,
    publicKey: trimmedPublicKey,
    nonce: parameters.defaultNonce,
  });
  const scalarResult = await ensurePrivateAddressScalarForNonce({
    dispatch: parameters.dispatch,
    getState: parameters.getState,
    publicKey: trimmedPublicKey,
    nonce: parameters.defaultNonce,
  });
  if (!scalarResult.ok) {
    throw new Error(scalarUnavailableMessage(scalarResult));
  }
  const scalar =
    parameters
      .getState()
      .privateAddress.scalarByNonce[parameters.defaultNonce]?.trim();
  if (!scalar) {
    throw new Error("Private address scalar is unavailable");
  }
  return scalar;
}
