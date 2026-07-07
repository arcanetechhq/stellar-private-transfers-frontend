import { useEffect, useMemo, useRef } from "react";
import { useStore } from "react-redux";
import { useAppSelector } from "@/store";
import {
  ensurePrivateAddressScalarForNonce,
  selectPrivateAddressState,
} from "@/entities/private-address";
import { selectWalletPublicKey } from "@/entities/wallet";

export function EnsureMissingPrivateAddressScalars() {
  const store = useStore();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { byNonce, scalarByNonce } = useAppSelector(selectPrivateAddressState);
  const attemptedReference = useRef(new Set<string>());
  const lastWalletReference = useRef<string | undefined>(undefined);

  const missingSignature = useMemo(() => {
    const keys = Object.keys(byNonce).toSorted();
    return keys
      .filter(
        (nonceKey) =>
          Boolean(byNonce[nonceKey]?.privateAddress?.trim()) &&
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
        const result = await ensurePrivateAddressScalarForNonce({
          getState: store.getState,
          publicKey,
          nonce,
        });
        if (cancelled) {
          return;
        }
        if (result.ok) {
          attemptedReference.current.add(nonce);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [publicKey, missingSignature, store]);
}
