import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

export function useSenderNonceState(
  nonces: string[],
  defaultNonceValue: string | undefined,
): [string | undefined, Dispatch<SetStateAction<string | undefined>>] {
  const [senderNonce, setSenderNonce] = useState<string | undefined>();
  useEffect(() => {
    if (defaultNonceValue && !senderNonce) {
      setSenderNonce(defaultNonceValue);
    }
  }, [defaultNonceValue, senderNonce]);
  useEffect(() => {
    if (!senderNonce && nonces.length > 0) {
      setSenderNonce(defaultNonceValue ?? nonces[0]);
    }
  }, [nonces, defaultNonceValue, senderNonce]);
  useEffect(() => {
    if (nonces.length > 0 && senderNonce && !nonces.includes(senderNonce)) {
      setSenderNonce(nonces[0]);
    }
  }, [nonces, senderNonce]);
  return [senderNonce, setSenderNonce];
}
