import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { readPrivateAddressRecordFromStorage } from "./persist-private-address";
import { setPrivateAddressRecordAndScalar } from "../model/private-address";
import type { PrivateAddressNonceEntry } from "../model/types";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { recipientScalarHexFromStellarSignature } from "@/shared/lib/private-address/recipient-scalar-hex";
import { buildPrivateAddressSignMessage } from "@/shared/lib/private-address/privacy-pool-sdk-private-address";
import type { PrivateAddressState } from "../model/types";

export type EnsureScalarResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "no_address" | "mismatch" | "sign_failed" };

type MinimalRootForEnsure = {
  privateAddress: PrivateAddressState;
};

type EnsurePrivateAddressScalarParameters = {
  dispatch: Dispatch<UnknownAction>;
  getState: () => MinimalRootForEnsure;
  publicKey: string;
  nonce: string;
};

type SignScalarParameters = {
  dispatch: Dispatch<UnknownAction>;
  publicKey: string;
  trimmed: string;
  entry: PrivateAddressNonceEntry;
};

async function trySignAndStoreScalar(
  parameters: SignScalarParameters,
): Promise<EnsureScalarResult> {
  const { dispatch, publicKey, trimmed, entry } = parameters;
  try {
    const message = buildPrivateAddressSignMessage(
      publicKey,
      trimmed,
    );
    const { networkPassphrase } = await StellarWalletsKit.getNetwork();
    const { signedMessage } = await StellarWalletsKit.signMessage(message, {
      address: publicKey,
      networkPassphrase,
    });
    const privateAddress =
      await privacyPoolService.generatePrivateAddressFromStellarSignature(
        signedMessage,
      );
    if (privateAddress !== entry.privateAddress) {
      return { ok: false, reason: "mismatch" };
    }
    const scalarHex =
      await recipientScalarHexFromStellarSignature(signedMessage);
    dispatch(
      setPrivateAddressRecordAndScalar({
        nonce: trimmed,
        entry,
        scalarHex,
      }),
    );
    return { ok: true };
  } catch {
    return { ok: false, reason: "sign_failed" };
  }
}

export async function ensurePrivateAddressScalarForNonce(
  parameters: EnsurePrivateAddressScalarParameters,
): Promise<EnsureScalarResult> {
  const { dispatch, getState, publicKey, nonce } = parameters;
  const trimmed = nonce.trim();
  if (!trimmed) {
    return { ok: false, reason: "invalid" };
  }
  const existingScalar = getState().privateAddress.scalarByNonce[trimmed];
  if (existingScalar) {
    return { ok: true };
  }
  const fromStore = getState().privateAddress.byNonce[trimmed];
  const entry =
    fromStore ?? readPrivateAddressRecordFromStorage(publicKey, trimmed);
  if (!entry || !entry.privateAddress.trim()) {
    return { ok: false, reason: "no_address" };
  }
  return trySignAndStoreScalar({ dispatch, publicKey, trimmed, entry });
}
