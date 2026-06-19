import { useCallback } from "react";
import { useStore } from "react-redux";
import { useAppDispatch } from "@/store";
import {
  ensurePrivateAddressScalarForNonce,
  type EnsureScalarResult,
} from "@/entities/private-address";

export function useEnsurePrivateAddressScalar(publicKey: string | undefined) {
  const dispatch = useAppDispatch();
  const store = useStore();

  const ensureScalar = useCallback(
    async (nonce: string): Promise<EnsureScalarResult> => {
      if (!publicKey) {
        return { ok: false, reason: "invalid" };
      }
      return ensurePrivateAddressScalarForNonce({
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
