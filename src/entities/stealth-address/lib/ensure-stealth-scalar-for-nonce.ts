import { PrivacyPoolSDK } from "@auditable/privacy-pool-zk-sdk";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import type { Dispatch, UnknownAction } from "redux";
import { readStealthRecordFromStorage } from "./persist-stealth";
import { setStealthRecordAndScalar } from "../model/stealth-address";
import type { StealthNonceEntry } from "../model/types";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { recipientScalarHexFromStellarSignature } from "@/shared/lib/stealth/recipient-scalar-hex";
import type { StealthAddressState } from "../model/types";

export type EnsureScalarResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "no_address" | "mismatch" | "sign_failed" };

type MinimalRootForEnsure = {
  stealthAddress: StealthAddressState;
};

type EnsureStealthScalarParameters = {
  dispatch: Dispatch<UnknownAction>;
  getState: () => MinimalRootForEnsure;
  publicKey: string;
  nonce: string;
};

type SignScalarParameters = {
  dispatch: Dispatch<UnknownAction>;
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
    dispatch(
      setStealthRecordAndScalar({
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

export async function ensureStealthScalarForNonce(
  parameters: EnsureStealthScalarParameters,
): Promise<EnsureScalarResult> {
  const { dispatch, getState, publicKey, nonce } = parameters;
  const trimmed = nonce.trim();
  if (!trimmed) {
    return { ok: false, reason: "invalid" };
  }
  const existingScalar = getState().stealthAddress.scalarByNonce[trimmed];
  if (existingScalar) {
    return { ok: true };
  }
  const fromStore = getState().stealthAddress.byNonce[trimmed];
  const entry =
    fromStore ?? readStealthRecordFromStorage(publicKey, trimmed);
  if (!entry || !entry.stealthAddress.trim()) {
    return { ok: false, reason: "no_address" };
  }
  return trySignAndStoreScalar({ dispatch, publicKey, trimmed, entry });
}
