import { useEffect, useState } from "react";
import {
  buildBloomBitmap,
  bloomBitsToBase64,
  DEFAULT_BLOOM_M,
  DEFAULT_BLOOM_K,
  bloomByteLength,
} from "@/shared/lib/coin-delivery";
import { base64ToBytes } from "@/features/poll-coin-deliveries";

const EMPTY_BLOOM_BITS_BASE64 = bloomBitsToBase64(
  Buffer.alloc(bloomByteLength(DEFAULT_BLOOM_M), 0),
);

export function useBloomBitsForSeenTags(
  seenTags: string[],
): string | undefined {
  const [bloomBitsBase64, setBloomBitsBase64] = useState<string | undefined>();

  useEffect(() => {
    if (seenTags.length === 0) {
      setBloomBitsBase64(EMPTY_BLOOM_BITS_BASE64);
      return;
    }
    let cancelled = false;
    const build = async () => {
      const bitmap = await buildBloomBitmap({
        tags: seenTags.map((tag) => base64ToBytes(tag)),
        bitCount: DEFAULT_BLOOM_M,
        hashCount: DEFAULT_BLOOM_K,
      });
      if (!cancelled) {
        setBloomBitsBase64(bloomBitsToBase64(bitmap));
      }
    };
    void build();
    return () => {
      cancelled = true;
    };
  }, [seenTags]);

  return bloomBitsBase64;
}
