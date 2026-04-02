export const DEFAULT_BLOOM_M = 2048;
export const DEFAULT_BLOOM_K = 7;

const BITS_PER_BYTE = 8;
const BYTE_INDEX_SHIFT = 3;
const BIT_INDEX_MASK = 7;
const HIGH_BIT = 0x80;
const BYTE_MASK = 0xFF;
const U32_SHIFT_24 = 24;
const U32_SHIFT_16 = 16;
const U32_SHIFT_8 = 8;

export function bloomByteLength(bitCount: number): number {
  return Math.ceil(bitCount / BITS_PER_BYTE);
}

type SetBitParameters = { bloom: Uint8Array; bitCount: number; bitIndex: number };

function setBit({ bloom, bitCount, bitIndex }: SetBitParameters): void {
  if (bitIndex < 0 || bitIndex >= bitCount) return;
  const byteIndex = bitIndex >> BYTE_INDEX_SHIFT;
  const bitInByte = bitIndex & BIT_INDEX_MASK;
  const current = bloom[byteIndex] ?? 0;
  bloom[byteIndex] = current | (HIGH_BIT >> bitInByte);
}

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(
    await globalThis.crypto.subtle.digest("SHA-256", data as BufferSource),
  );
}

type BloomHashParameters = { tag: Uint8Array; hashRound: number; bitCount: number };

async function bloomHashIndex({ tag, hashRound, bitCount }: BloomHashParameters): Promise<number> {
  const input = new Uint8Array(tag.length + 1);
  input.set(tag);
  input[tag.length] = hashRound & BYTE_MASK;
  const hash = await sha256(input);
  const u32 =
    (hash[0]! << U32_SHIFT_24) |
    (hash[1]! << U32_SHIFT_16) |
    (hash[2]! << U32_SHIFT_8) |
    hash[3]!;
  return (u32 >>> 0) % bitCount;
}

export interface BuildBloomParameters {
  tags: Uint8Array[];
  bitCount: number;
  hashCount: number;
}

export async function buildBloomBitmap({ tags, bitCount, hashCount }: BuildBloomParameters): Promise<Uint8Array> {
  const bloom = new Uint8Array(bloomByteLength(bitCount));
  for (const tag of tags) {
    for (let round = 0; round < hashCount; round++) {
      const bitIndex = await bloomHashIndex({ tag, hashRound: round, bitCount });
      setBit({ bloom, bitCount, bitIndex });
    }
  }
  return bloom;
}

export function bloomBitsToBase64(bits: Uint8Array): string {
  let bin = "";
  for (const bit of bits) {
    bin += String.fromCodePoint(bit);
  }
  return btoa(bin);
}
