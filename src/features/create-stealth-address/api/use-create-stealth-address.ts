import { useCallback, useState } from "react";
import { DEFAULT_STEALTH_SIGN_NONCE } from "@auditable/privacy-pool-zk-sdk";
import { store, type AppDispatch } from "@/app/store";
import { useAppDispatch } from "@/app/hooks";
import { readStealthRecordFromStorage, setStealthRecord } from "@/entities/stealth-address";
import { runWalletCreateStealthFlow } from "../lib/run-wallet-create-stealth";

export type CreateStealthStatus = "idle" | "pending" | "success" | "error";

export type CreateStealthErrorKind = "unsupported_sign_message" | "unknown";

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
  const fromDisk = readStealthRecordFromStorage(publicKey, trimmedNonce);
  if (!fromDisk?.stealthAddress.trim()) {
    return { kind: "none" };
  }
  dispatch(setStealthRecord({ nonce: trimmedNonce, entry: fromDisk }));
  return { kind: "ok" };
}

export function useCreateStealthAddress(publicKey: string | undefined) {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<CreateStealthStatus>("idle");
  const [errorKind, setErrorKind] = useState<
    CreateStealthErrorKind | undefined
  >();

  const reset = useCallback(() => {
    setStatus("idle");
    setErrorKind(undefined);
  }, []);

  const create = useCallback(
    async (nonce: string = DEFAULT_STEALTH_SIGN_NONCE) => {
      const trimmedNonce = nonce.trim();
      if (!publicKey || !trimmedNonce) {
        setErrorKind("unknown");
        setStatus("error");
        return;
      }
      const fromState =
        store.getState().stealthAddress.byNonce[trimmedNonce];
      if (fromState?.stealthAddress.trim()) {
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
      await runWalletCreateStealthFlow({
        dispatch,
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

export { DEFAULT_STEALTH_SIGN_NONCE } from "@auditable/privacy-pool-zk-sdk";
