import type { AppDispatch } from "@/store";
import { store } from "@/store";
import {
  clearScalars,
  readPrivateAddressRecordFromStorage,
  runWalletCreatePrivateAddressFlow,
  setDefaultNonce,
  setPrivateAddressRecord,
} from "@/entities/private-address";
import type { RegistryLookupResult } from "@/shared/lib/registry/registry-lookup";
import { DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE } from "@/shared/lib/private-address/privacy-pool-sdk-private-address";

function readStoredPrivateAddress(nonce: string): string | undefined {
  return store.getState().privateAddress.byNonce[nonce]?.privateAddress?.trim();
}

function ensureDefaultNonce(dispatch: AppDispatch, nonce: string): void {
  const currentDefault = store.getState().privateAddress.defaultNonce;
  if (currentDefault === undefined) {
    dispatch(setDefaultNonce(nonce));
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

export function syncRegisteredWalletPrivateAddress(parameters: {
  dispatch: AppDispatch;
  publicKey: string;
  lookup: Extract<RegistryLookupResult, { status: "registered" }>;
  nonce?: string;
}): string {
  const trimmedNonce = (
    parameters.nonce ?? DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE
  ).trim();
  const registryAddress = parameters.lookup.privateAddressStpl1.trim();
  const fromState = readStoredPrivateAddress(trimmedNonce);
  const fromDisk = readPrivateAddressRecordFromStorage(
    parameters.publicKey,
    trimmedNonce,
  );
  const diskAddress = fromDisk?.privateAddress?.trim();
  const localAddress = fromState ?? diskAddress;
  if (localAddress && localAddress !== registryAddress) {
    parameters.dispatch(clearScalars());
  }
  const resolved = resolveRegisteredPrivateAddressEntry({
    registryAddress,
    fromState,
    fromDisk,
    diskAddress,
  });
  if (resolved.action === "persist") {
    parameters.dispatch(
      setPrivateAddressRecord({ nonce: trimmedNonce, entry: resolved.entry }),
    );
  } else if (fromDisk && !fromState) {
    parameters.dispatch(
      setPrivateAddressRecord({ nonce: trimmedNonce, entry: fromDisk }),
    );
  }
  ensureDefaultNonce(parameters.dispatch, trimmedNonce);
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
  const fromState = readStoredPrivateAddress(trimmedNonce);
  if (fromState) {
    return fromState;
  }
  const fromDisk = readPrivateAddressRecordFromStorage(
    parameters.publicKey,
    trimmedNonce,
  );
  const diskPrivateAddress = fromDisk?.privateAddress?.trim();
  if (diskPrivateAddress) {
    parameters.dispatch(
      setPrivateAddressRecord({ nonce: trimmedNonce, entry: fromDisk }),
    );
    ensureDefaultNonce(parameters.dispatch, trimmedNonce);
    return diskPrivateAddress;
  }
  await runWalletCreatePrivateAddressFlow({
    dispatch: parameters.dispatch,
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
  const created = readStoredPrivateAddress(trimmedNonce);
  if (!created) {
    throw new Error("Private address was not created");
  }
  ensureDefaultNonce(parameters.dispatch, trimmedNonce);
  return created;
}
