import { PrivacyPoolSDK } from "@auditable/privacy-pool-zk-sdk";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { store, type AppDispatch } from "@/app/store";
import {
  readStealthRecordFromStorage,
  setScalarForNonce,
  setStealthRecord,
  type StealthNonceEntry,
} from "@/entities/stealth-address";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { recipientScalarHexFromStellarSignature } from "@/shared/lib/stealth/recipient-scalar-hex";

export type EnsureScalarResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "no_address" | "mismatch" | "sign_failed" };

type EnsureStealthScalarParameters = {
  dispatch: AppDispatch;
  publicKey: string;
  nonce: string;
};

type SignScalarParameters = {
  dispatch: AppDispatch;
  publicKey: string;
  trimmed: string;
  entry: StealthNonceEntry;
};

async function trySignAndStoreScalar(
  parameters: SignScalarParameters,
): Promise<EnsureScalarResult> {
  const { dispatch, publicKey, trimmed, entry } = parameters;
  try {
    const message = PrivacyPoolSDK.buildStealthAddressSignMessage(
      publicKey,
      trimmed,
    );
    const { networkPassphrase } = await StellarWalletsKit.getNetwork();
    const { signedMessage } = await StellarWalletsKit.signMessage(message, {
      address: publicKey,
      networkPassphrase,
    });
    const stealthAddress =
      await privacyPoolService.generateStealthAddressFromStellarSignature(
        signedMessage,
      );
    if (stealthAddress !== entry.stealthAddress) {
      return { ok: false, reason: "mismatch" };
    }
    const scalarHex =
      await recipientScalarHexFromStellarSignature(signedMessage);
    dispatch(setScalarForNonce({ nonce: trimmed, scalarHex }));
    return { ok: true };
  } catch {
    return { ok: false, reason: "sign_failed" };
  }
}

export async function ensureStealthScalarForNonce(
  parameters: EnsureStealthScalarParameters,
): Promise<EnsureScalarResult> {
  const { dispatch, publicKey, nonce } = parameters;
  const trimmed = nonce.trim();
  if (!trimmed) {
    return { ok: false, reason: "invalid" };
  }
  const existingScalar =
    store.getState().stealthAddress.scalarByNonce[trimmed];
  if (existingScalar) {
    return { ok: true };
  }
  let entry = store.getState().stealthAddress.byNonce[trimmed];
  if (!entry) {
    entry = readStealthRecordFromStorage(publicKey, trimmed);
    if (entry?.stealthAddress.trim()) {
      dispatch(setStealthRecord({ nonce: trimmed, entry }));
    }
  }
  if (!entry?.stealthAddress.trim()) {
    return { ok: false, reason: "no_address" };
  }
  return trySignAndStoreScalar({ dispatch, publicKey, trimmed, entry });
}
