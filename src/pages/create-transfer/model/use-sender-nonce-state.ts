import type { Dispatch, SetStateAction } from "react";
import { useNormalizedNonceState } from "@/shared/hooks/use-normalized-nonce-state";

export function useSenderNonceState(
  nonces: string[],
  defaultNonceValue: string | undefined,
): [string | undefined, Dispatch<SetStateAction<string | undefined>>] {
  const { nonce, setNonce } = useNormalizedNonceState(
    defaultNonceValue,
    nonces,
  );
  return [nonce, setNonce];
}
