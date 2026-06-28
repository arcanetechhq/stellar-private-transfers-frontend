import { useNormalizedNonceState } from "@/shared/hooks/use-normalized-nonce-state";

export function usePrivateAssetPrivateAddressNonce(
  defaultNonce: string | undefined,
  nonces: string[],
) {
  const {
    nonce: viewingNonce,
    setNonce: setViewingNonce,
    normalizedNonce,
  } = useNormalizedNonceState(defaultNonce, nonces);

  return { viewingNonce, setViewingNonce, normalizedNonce };
}
