import { useMemo } from "react";
import { useAppSelector } from "@/store";
import {
  selectDefaultNonce,
  selectPrivateAddressState,
} from "@/entities/private-address";

export function useWithdrawalSender() {
  const { byNonce } = useAppSelector(selectPrivateAddressState);
  const defaultNonceValue = useAppSelector(selectDefaultNonce);
  const senderPrivateAddress = useMemo(() => {
    const entry = defaultNonceValue
      ? byNonce[defaultNonceValue]?.privateAddress
      : undefined;
    return entry ? entry.trim() : "";
  }, [byNonce, defaultNonceValue]);
  return {
    effectiveSenderNonce: defaultNonceValue,
    senderPrivateAddress,
  };
}
