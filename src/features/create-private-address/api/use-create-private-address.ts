import { useCallback, useState } from "react";
import { store, useAppDispatch, type AppDispatch } from "@/store";
import {
  readPrivateAddressRecordFromStorage,
  runWalletCreatePrivateAddressFlow,
  setPrivateAddressRecord,
} from "@/entities/private-address";
import { DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE } from "@/shared/lib/private-address/privacy-pool-sdk-private-address";

export type CreatePrivateAddressStatus = "idle" | "pending" | "success" | "error";

export type CreatePrivateAddressErrorKind = "unsupported_sign_message" | "unknown";

type HydrateFromDiskResult = { kind: "none" } | { kind: "ok" };

type HydrateFromDiskParameters = {
  dispatch: AppDispatch;
  publicKey: string;
  trimmedNonce: string;
};

async function hydrateFromDiskIfPresent(
  parameters: HydrateFromDiskParameters,
): Promise<HydrateFromDiskResult> {
  const { dispatch, publicKey, trimmedNonce } = parameters;
  const fromDisk = readPrivateAddressRecordFromStorage(publicKey, trimmedNonce);
  if (!fromDisk?.privateAddress.trim()) {
    return { kind: "none" };
  }
  dispatch(setPrivateAddressRecord({ nonce: trimmedNonce, entry: fromDisk }));
  return { kind: "ok" };
}

export function useCreatePrivateAddress(publicKey: string | undefined) {
  const dispatch = useAppDispatch();
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
      const fromState =
        store.getState().privateAddress.byNonce[trimmedNonce];
      if (fromState?.privateAddress.trim()) {
        return;
      }
      const hydrate = await hydrateFromDiskIfPresent({
        dispatch,
        publicKey,
        trimmedNonce,
      });
      if (hydrate.kind === "ok") {
        setStatus("success");
        return;
      }
      await runWalletCreatePrivateAddressFlow({
        dispatch,
        getState: store.getState,
        publicKey,
        trimmedNonce,
        setStatus,
        setErrorKind,
      });
    },
    [publicKey, dispatch],
  );

  return { create, status, errorKind, reset };
}
