import { useEffect, useState } from "react";

export function usePrivateAssetStealthNonce(
  defaultNonce: string | undefined,
  nonces: string[],
) {
  const [viewingNonce, setViewingNonce] = useState<string | undefined>();

  useEffect(() => {
    if (defaultNonce && !viewingNonce) {
      setViewingNonce(defaultNonce);
    }
  }, [defaultNonce, viewingNonce]);

  useEffect(() => {
    if (!viewingNonce && nonces.length > 0) {
      setViewingNonce(defaultNonce ?? nonces[0]);
    }
  }, [nonces, defaultNonce, viewingNonce]);

  const effectiveNonce =
    viewingNonce ?? defaultNonce ?? nonces[0] ?? undefined;
  const normalizedNonce =
    effectiveNonce && nonces.includes(effectiveNonce)
      ? effectiveNonce
      : nonces[0];

  useEffect(() => {
    if (
      nonces.length > 0 &&
      effectiveNonce &&
      !nonces.includes(effectiveNonce)
    ) {
      setViewingNonce(nonces[0]);
    }
  }, [nonces, effectiveNonce]);

  return { viewingNonce, setViewingNonce, normalizedNonce };
}
