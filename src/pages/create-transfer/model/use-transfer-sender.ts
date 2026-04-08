import { useMemo } from "react";
import { useAppSelector } from "@/app/hooks";
import {
  selectDefaultNonce,
  selectStealthState,
} from "@/entities/stealth-address";

export function useTransferSender() {
  const { byNonce } = useAppSelector(selectStealthState);
  const defaultNonceValue = useAppSelector(selectDefaultNonce);
  const senderStealthAddress = useMemo(() => {
    const entry = defaultNonceValue
      ? byNonce[defaultNonceValue]?.stealthAddress
      : undefined;
    return entry ? entry.trim() : "";
  }, [byNonce, defaultNonceValue]);
  return {
    effectiveSenderNonce: defaultNonceValue,
    senderStealthAddress,
  };
}
