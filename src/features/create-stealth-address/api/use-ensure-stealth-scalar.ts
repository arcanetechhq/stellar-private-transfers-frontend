import { useCallback } from "react";
import { useAppDispatch } from "@/app/hooks";
import {
  ensureStealthScalarForNonce,
  type EnsureScalarResult,
} from "../lib/ensure-stealth-scalar-for-nonce";

export function useEnsureStealthScalar(publicKey: string | undefined) {
  const dispatch = useAppDispatch();

  const ensureScalar = useCallback(
    async (nonce: string): Promise<EnsureScalarResult> => {
      if (!publicKey) {
        return { ok: false, reason: "invalid" };
      }
      return ensureStealthScalarForNonce({ dispatch, publicKey, nonce });
    },
    [publicKey, dispatch],
  );

  return { ensureScalar };
}
