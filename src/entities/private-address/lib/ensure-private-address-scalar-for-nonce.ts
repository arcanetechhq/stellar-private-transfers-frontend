import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import type { RootState } from "@/store";
import {
  readPrivateAddressRecordFromStorage,
} from "./persist-private-address";
import { selectPrivateAddressByNonce } from "../model/private-address-selectors";
import type { PrivateAddressNonceEntry } from "../model/types";
import { buildPrivateAddressSignMessage } from "@/shared/lib/privacy-sdk/index.js";
import { recipientScalarHexFromStellarSignature } from "@/shared/lib/private-address/recipient-scalar-hex";
import { getSpendScalarDomain } from "@/shared/stellar/stellar-network-environment";
import { readWalletPrivateAddressViewFromSdkState } from "@/shared/lib/privacy-sdk/wallet-private-address-sdk-branch.js";
import { saveWalletPrivateAddressRecordToSdkState } from "@/shared/lib/privacy-sdk/wallet-private-address-sdk-state.js";
import {
  readWalletScalarHexFromSdkState,
  saveWalletPrivateAddressScalarToSdkState,
} from "@/shared/lib/privacy-sdk/wallet-scalar-sdk-state.js";

export type EnsureScalarResult =
  | { ok: true }
  | {
      ok: false;
      reason: "invalid" | "no_address" | "mismatch" | "sign_failed";
    };

type EnsurePrivateAddressScalarParameters = {
  getState: () => RootState;
  publicKey: string;
  nonce: string;
};

type SignScalarParameters = {
  publicKey: string;
  trimmed: string;
  entry: PrivateAddressNonceEntry;
};

const inFlightScalarEnsure = new Map<string, Promise<EnsureScalarResult>>();

function ensureKey(publicKey: string, nonce: string): string {
  return `${publicKey.trim()}\0${nonce.trim()}`;
}

async function persistScalarToSdkState(input: {
  publicKey: string;
  nonce: string;
  scalarHex: string;
}): Promise<void> {
  await saveWalletPrivateAddressScalarToSdkState({
    owner: input.publicKey.trim(),
    nonce: input.nonce.trim(),
    scalarHex: input.scalarHex.trim(),
  });
}

async function persistPrivateAddressRecordToSdkState(input: {
  publicKey: string;
  nonce: string;
  entry: PrivateAddressNonceEntry;
}): Promise<void> {
  await saveWalletPrivateAddressRecordToSdkState({
    owner: input.publicKey.trim(),
    nonce: input.nonce.trim(),
    privateAddress: input.entry.privateAddress,
    createdAt: input.entry.createdAt,
  });
}

async function trySignAndStoreScalar(
  parameters: SignScalarParameters,
): Promise<EnsureScalarResult> {
  const { publicKey, trimmed, entry } = parameters;
  try {
    const domain = getSpendScalarDomain();
    const message = buildPrivateAddressSignMessage(publicKey, domain, trimmed);
    const { networkPassphrase } = await StellarWalletsKit.getNetwork();
    const { signedMessage } = await StellarWalletsKit.signMessage(message, {
      address: publicKey,
      networkPassphrase,
    });
    const scalarHex = await recipientScalarHexFromStellarSignature(
      signedMessage,
      domain,
    );
    await persistPrivateAddressRecordToSdkState({
      publicKey,
      nonce: trimmed,
      entry,
    });
    await persistScalarToSdkState({ publicKey, nonce: trimmed, scalarHex });
    return { ok: true };
  } catch {
    return { ok: false, reason: "sign_failed" };
  }
}

type ResolveScalarParameters = {
  getState: () => RootState;
  publicKey: string;
  trimmed: string;
};

async function restoreScalarFromLegacySources(input: {
  parameters: ResolveScalarParameters;
  scalarHex: string;
  entry: PrivateAddressNonceEntry;
}): Promise<EnsureScalarResult> {
  const { publicKey, trimmed } = input.parameters;
  await persistPrivateAddressRecordToSdkState({
    publicKey,
    nonce: trimmed,
    entry: input.entry,
  });
  await persistScalarToSdkState({
    publicKey,
    nonce: trimmed,
    scalarHex: input.scalarHex,
  });
  return { ok: true };
}

async function resolveScalarWithoutSigning(
  parameters: ResolveScalarParameters,
): Promise<EnsureScalarResult | undefined> {
  const { getState, publicKey, trimmed } = parameters;
  const state = getState();
  const fromSdk = readWalletScalarHexFromSdkState({
    state,
    owner: publicKey,
    nonce: trimmed,
  });
  if (fromSdk) {
    return { ok: true };
  }
  const view = readWalletPrivateAddressViewFromSdkState({
    state,
    owner: publicKey,
  });
  const existingScalar = view.scalarByNonce[trimmed]?.trim();
  if (existingScalar) {
    await persistScalarToSdkState({
      publicKey,
      nonce: trimmed,
      scalarHex: existingScalar,
    });
    return { ok: true };
  }
  const fromDisk = readPrivateAddressRecordFromStorage(publicKey, trimmed);
  const diskScalar = fromDisk?.recipientScalarHex?.trim();
  if (diskScalar && fromDisk) {
    return restoreScalarFromLegacySources({
      parameters,
      scalarHex: diskScalar,
      entry: fromDisk,
    });
  }
  return undefined;
}

async function runEnsurePrivateAddressScalarForNonce(
  parameters: EnsurePrivateAddressScalarParameters,
  trimmed: string,
): Promise<EnsureScalarResult> {
  const { getState, publicKey } = parameters;
  const resolved = await resolveScalarWithoutSigning({
    getState,
    publicKey,
    trimmed,
  });
  if (resolved) {
    return resolved;
  }
  const fromStore = selectPrivateAddressByNonce(trimmed)(getState());
  const fromDisk = readPrivateAddressRecordFromStorage(publicKey, trimmed);
  const entry = fromStore ?? fromDisk;
  if (!entry || !entry.privateAddress.trim()) {
    return { ok: false, reason: "no_address" };
  }
  return trySignAndStoreScalar({
    publicKey,
    trimmed,
    entry,
  });
}

export async function ensurePrivateAddressScalarForNonce(
  parameters: EnsurePrivateAddressScalarParameters,
): Promise<EnsureScalarResult> {
  const trimmed = parameters.nonce.trim();
  if (!trimmed) {
    return { ok: false, reason: "invalid" };
  }
  const key = ensureKey(parameters.publicKey, trimmed);
  const inFlight = inFlightScalarEnsure.get(key);
  if (inFlight) {
    return inFlight;
  }
  const run = runEnsurePrivateAddressScalarForNonce(parameters, trimmed);
  inFlightScalarEnsure.set(key, run);
  try {
    return await run;
  } finally {
    inFlightScalarEnsure.delete(key);
  }
}
