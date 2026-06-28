import { useEffect, useState } from "react";

export function useNormalizedNonceState(
  defaultNonce: string | undefined,
  nonces: string[],
) {
  const [nonce, setNonce] = useState<string | undefined>();

  useEffect(() => {
    if (defaultNonce && !nonce) {
      setNonce(defaultNonce);
    }
  }, [defaultNonce, nonce]);

  useEffect(() => {
    if (!nonce && nonces.length > 0) {
      setNonce(defaultNonce ?? nonces[0]);
    }
  }, [nonces, defaultNonce, nonce]);

  const effectiveNonce = nonce ?? defaultNonce ?? nonces[0] ?? undefined;
  const normalizedNonce =
    effectiveNonce && nonces.includes(effectiveNonce)
      ? effectiveNonce
      : nonces[0];

  useEffect(() => {
    if (nonces.length > 0 && effectiveNonce && !nonces.includes(effectiveNonce)) {
      setNonce(nonces[0]);
    }
  }, [nonces, effectiveNonce]);

  return { nonce, setNonce, normalizedNonce };
}
