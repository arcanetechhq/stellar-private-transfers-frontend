import { useEffect, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectStealthState } from "@/entities/stealth-address";
import { selectWalletPublicKey } from "@/entities/wallet";
import { ensureStealthScalarForNonce } from "@/features/create-stealth-address";

export function EnsureMissingStealthScalars() {
  const dispatch = useAppDispatch();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { byNonce, scalarByNonce } = useAppSelector(selectStealthState);
  const attemptedReference = useRef(new Set<string>());
  const lastWalletReference = useRef<string | undefined>(undefined);

  const missingSignature = useMemo(() => {
    const keys = Object.keys(byNonce).toSorted();
    return keys
      .filter(
        (nonceKey) =>
          Boolean(byNonce[nonceKey]?.stealthAddress?.trim()) &&
          !scalarByNonce[nonceKey],
      )
      .join("\0");
  }, [byNonce, scalarByNonce]);

  useEffect(() => {
    if (publicKey !== lastWalletReference.current) {
      lastWalletReference.current = publicKey;
      attemptedReference.current = new Set();
    }
    if (!publicKey || !missingSignature) {
      return;
    }
    const missingNonces = missingSignature.split("\0").filter(Boolean);
    let cancelled = false;
    const run = async () => {
      for (const nonce of missingNonces) {
        if (cancelled) {
          return;
        }
        if (attemptedReference.current.has(nonce)) {
          continue;
        }
        await ensureStealthScalarForNonce({ dispatch, publicKey, nonce });
        if (cancelled) {
          return;
        }
        attemptedReference.current.add(nonce);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [publicKey, missingSignature, dispatch]);
}
