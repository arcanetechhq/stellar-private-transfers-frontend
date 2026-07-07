import { useCallback, useState } from "react";
import { store } from "@/store";
import {
  readPrivateAddressRecordFromStorage,
  runWalletCreatePrivateAddressFlow,
  selectPrivateAddressByNonce,
} from "@/entities/private-address";
import { DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE } from "@/shared/lib/privacy-sdk/index.js";
import { saveWalletPrivateAddressRecordToSdkState } from "@/shared/lib/privacy-sdk/wallet-private-address-sdk-state.js";

export type CreatePrivateAddressStatus = "idle" | "pending" | "success" | "error";

export type CreatePrivateAddressErrorKind = "unsupported_sign_message" | "unknown";

type HydrateFromDiskResult = { kind: "none" } | { kind: "ok" };

type HydrateFromDiskParameters = {
  publicKey: string;
  trimmedNonce: string;
};

async function hydrateFromDiskIfPresent(
  parameters: HydrateFromDiskParameters,
): Promise<HydrateFromDiskResult> {
  const { publicKey, trimmedNonce } = parameters;
  const fromDisk = readPrivateAddressRecordFromStorage(publicKey, trimmedNonce);
  if (!fromDisk?.privateAddress.trim()) {
    return { kind: "none" };
  }
  await saveWalletPrivateAddressRecordToSdkState({
    owner: publicKey,
    nonce: trimmedNonce,
    privateAddress: fromDisk.privateAddress,
    createdAt: fromDisk.createdAt,
  });
  return { kind: "ok" };
}

export function useCreatePrivateAddress(publicKey: string | undefined) {
  const [status, setStatus] = useState<CreatePrivateAddressStatus>("idle");
  const [errorKind, setErrorKind] = useState<
    CreatePrivateAddressErrorKind | undefined
  >();

  const reset = useCallback(() => {
    setStatus("idle");
    setErrorKind(undefined);
  }, []);

  const create = useCallback(
    async (nonce: string = DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE) => {
      const trimmedNonce = nonce.trim();
      if (!publicKey || !trimmedNonce) {
        setErrorKind("unknown");
        setStatus("error");
        return;
      }
      const fromState = selectPrivateAddressByNonce(trimmedNonce)(store.getState());
      if (fromState?.privateAddress.trim()) {
        return;
      }
      const hydrate = await hydrateFromDiskIfPresent({
        publicKey,
        trimmedNonce,
      });
      if (hydrate.kind === "ok") {
        setStatus("success");
        return;
      }
      await runWalletCreatePrivateAddressFlow({
        getState: store.getState,
        publicKey,
        trimmedNonce,
        setStatus,
        setErrorKind,
      });
    },
    [publicKey],
  );

  return { create, status, errorKind, reset };
}
