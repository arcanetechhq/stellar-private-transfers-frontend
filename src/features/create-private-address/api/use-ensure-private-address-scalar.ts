import { useCallback } from "react";
import { useStore } from "react-redux";
import {
  ensurePrivateAddressScalarForNonce,
  type EnsureScalarResult,
} from "@/entities/private-address";

export function useEnsurePrivateAddressScalar(publicKey: string | undefined) {
  const store = useStore();

  const ensureScalar = useCallback(
    async (nonce: string): Promise<EnsureScalarResult> => {
      if (!publicKey) {
        return { ok: false, reason: "invalid" };
      }
      return ensurePrivateAddressScalarForNonce({
        getState: store.getState,
        publicKey,
        nonce,
      });
    },
    [publicKey, store],
  );

  return { ensureScalar };
}
