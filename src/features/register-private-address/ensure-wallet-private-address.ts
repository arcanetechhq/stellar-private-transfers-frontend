import type { AppDispatch } from "@/store";
import { store } from "@/store";
import {
  readPrivateAddressRecordFromStorage,
  runWalletCreatePrivateAddressFlow,
} from "@/entities/private-address";
type RegistryLookupResult =
  | {
      status: "registered";
      privateAddressStpl1: string;
      publicKeyXHex: string;
      publicKeyYHex: string;
    }
  | { status: "unregistered" };
import { DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE } from "@/shared/lib/privacy-sdk/index.js";
import { readWalletScalarFromState } from "@/shared/lib/privacy-sdk/read-wallet-scalar-from-state.js";
import {
  readStoredPrivateAddressFromSdkState,
} from "@/shared/lib/privacy-sdk/wallet-private-address-sdk-branch.js";
import {
  clearWalletPrivateAddressScalarsForOwner,
  readWalletDefaultPrivateAddressNonceFromSdkState,
  saveWalletPrivateAddressRecordToSdkState,
  setWalletDefaultPrivateAddressNonceToSdkState,
} from "@/shared/lib/privacy-sdk/wallet-private-address-sdk-state.js";

function readStoredPrivateAddress(publicKey: string, nonce: string): string | undefined {
  return readStoredPrivateAddressFromSdkState({
    state: store.getState(),
    owner: publicKey,
    nonce,
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

function resolveRegisteredPrivateAddressEntry(parameters: {
  registryAddress: string;
  fromState: string | undefined;
  fromDisk: ReturnType<typeof readPrivateAddressRecordFromStorage>;
  diskAddress: string | undefined;
}):
  | { action: "keep"; address: string }
  | { action: "persist"; entry: { privateAddress: string; createdAt: number } } {
  const localAddress = parameters.fromState ?? parameters.diskAddress;
  if (localAddress === parameters.registryAddress) {
    return { action: "keep", address: localAddress };
  }
  if (
    parameters.fromDisk &&
    parameters.diskAddress === parameters.registryAddress
  ) {
    return { action: "persist", entry: parameters.fromDisk };
  }
  return {
    action: "persist",
    entry: {
      privateAddress: parameters.registryAddress,
      createdAt: Date.now(),
    },
  };
}

export async function syncRegisteredWalletPrivateAddress(parameters: {
  dispatch: AppDispatch;
  publicKey: string;
  lookup: Extract<RegistryLookupResult, { status: "registered" }>;
  nonce?: string;
}): Promise<string> {
  const trimmedNonce = (
    parameters.nonce ?? DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE
  ).trim();
  const trimmedPublicKey = parameters.publicKey.trim();
  const registryAddress = parameters.lookup.privateAddressStpl1.trim();
  const fromState = readStoredPrivateAddress(trimmedPublicKey, trimmedNonce);
  const fromDisk = readPrivateAddressRecordFromStorage(
    trimmedPublicKey,
    trimmedNonce,
  );
  const diskAddress = fromDisk?.privateAddress.trim();
  const localAddress = fromState ?? diskAddress;
  if (localAddress && localAddress !== registryAddress) {
    await clearWalletPrivateAddressScalarsForOwner(store.getState(), trimmedPublicKey);
  }
  const resolved = resolveRegisteredPrivateAddressEntry({
    registryAddress,
    fromState,
    fromDisk,
    diskAddress,
  });
  if (resolved.action === "persist") {
    await saveWalletPrivateAddressRecordToSdkState({
      owner: trimmedPublicKey,
      nonce: trimmedNonce,
      privateAddress: resolved.entry.privateAddress,
      createdAt: resolved.entry.createdAt,
    });
  } else if (fromDisk && !fromState) {
    await saveWalletPrivateAddressRecordToSdkState({
      owner: trimmedPublicKey,
      nonce: trimmedNonce,
      privateAddress: fromDisk.privateAddress,
      createdAt: fromDisk.createdAt,
    });
  }
  await ensureDefaultNonce(trimmedPublicKey, trimmedNonce);
  return registryAddress;
}

export async function ensureWalletPrivateAddressRecord(parameters: {
  dispatch: AppDispatch;
  publicKey: string;
  nonce?: string;
}): Promise<string> {
  const trimmedNonce = (
    parameters.nonce ?? DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE
  ).trim();
  const trimmedPublicKey = parameters.publicKey.trim();
  const cachedScalar = readWalletScalarFromState({
    getState: store.getState,
    publicKey: trimmedPublicKey,
    privateAddressStpl1: "",
    defaultNonce: trimmedNonce,
  });
  const fromState = readStoredPrivateAddress(trimmedPublicKey, trimmedNonce);
  if (fromState) {
    return fromState;
  }
  const fromDisk = readPrivateAddressRecordFromStorage(
    trimmedPublicKey,
    trimmedNonce,
  );
  if (fromDisk?.privateAddress.trim()) {
    await saveWalletPrivateAddressRecordToSdkState({
      owner: trimmedPublicKey,
      nonce: trimmedNonce,
      privateAddress: fromDisk.privateAddress,
      createdAt: fromDisk.createdAt,
    });
    await ensureDefaultNonce(trimmedPublicKey, trimmedNonce);
    return fromDisk.privateAddress.trim();
  }
  if (cachedScalar) {
    throw new Error("Private address is missing for stored scalar");
  }
  await runWalletCreatePrivateAddressFlow({
    getState: store.getState,
    publicKey: parameters.publicKey,
    trimmedNonce,
    setStatus: () => {
      return;
    },
    setErrorKind: () => {
      return;
    },
  });
  const created = readStoredPrivateAddress(trimmedPublicKey, trimmedNonce);
  if (!created) {
    throw new Error("Private address was not created");
  }
  await ensureDefaultNonce(trimmedPublicKey, trimmedNonce);
  return created;
}
