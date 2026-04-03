import { useMemo } from "react";
import { useAppSelector } from "@/app/hooks";
import {
  selectDefaultNonce,
  selectStealthState,
} from "@/entities/stealth-address";
import type { StealthPickerRow } from "@/features/pick-contact";
import { useSenderNonceState } from "./use-sender-nonce-state";

export function useTransferSender() {
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
  const stealthRowsForPicker = useMemo((): StealthPickerRow[] => {
    return nonces
      .map((nonceKey) => {
        const address = byNonce[nonceKey]?.stealthAddress?.trim();
        if (!address || address === senderStealthAddress) {
          return;
        }
        return { id: nonceKey, nonceKey, stealthAddress: address };
      })
      .filter((row): row is StealthPickerRow => row !== undefined);
  }, [nonces, byNonce, senderStealthAddress]);
  return {
    setSenderNonce,
    effectiveSenderNonce,
    nonces,
    byNonce,
    senderStealthAddress,
    stealthRowsForPicker,
  };
}
