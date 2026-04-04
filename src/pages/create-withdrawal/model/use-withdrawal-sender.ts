import { useMemo } from "react";
import { useAppSelector } from "@/app/hooks";
import {
  selectDefaultNonce,
  selectStealthState,
} from "@/entities/stealth-address";
import { useSenderNonceState } from "./use-sender-nonce-state";

export function useWithdrawalSender() {
  const { byNonce } = useAppSelector(selectStealthState);
  const defaultNonceValue = useAppSelector(selectDefaultNonce);
  const nonces = useMemo(() => Object.keys(byNonce).toSorted(), [byNonce]);
  const [senderNonce, setSenderNonce] = useSenderNonceState(
    nonces,
    defaultNonceValue,
  );
  const effectiveSenderNonce =
    senderNonce && nonces.includes(senderNonce) ? senderNonce : nonces[0];
  const senderStealthAddress = useMemo(() => {
    const entry = effectiveSenderNonce
      ? byNonce[effectiveSenderNonce]?.stealthAddress
      : undefined;
    return entry ? entry.trim() : "";
  }, [byNonce, effectiveSenderNonce]);
  return {
    setSenderNonce,
    effectiveSenderNonce,
    nonces,
    byNonce,
    senderStealthAddress,
  };
}
