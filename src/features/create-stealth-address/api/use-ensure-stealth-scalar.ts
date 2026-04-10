import { useCallback } from "react";
import { useStore } from "react-redux";
import { useAppDispatch } from "@/store";
import {
  ensureStealthScalarForNonce,
  type EnsureScalarResult,
} from "@/entities/stealth-address";

export function useEnsureStealthScalar(publicKey: string | undefined) {
  const dispatch = useAppDispatch();
  const store = useStore();

  const ensureScalar = useCallback(
    async (nonce: string): Promise<EnsureScalarResult> => {
      if (!publicKey) {
        return { ok: false, reason: "invalid" };
      }
      return ensureStealthScalarForNonce({
        dispatch,
        getState: store.getState,
        publicKey,
        nonce,
      });
    },
    [publicKey, dispatch, store],
  );

  return { ensureScalar };
}
