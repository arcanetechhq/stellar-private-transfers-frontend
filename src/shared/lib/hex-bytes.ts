const HEX_RADIX = 16;
const HEX_PAIR_WIDTH = 2;

export function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / HEX_PAIR_WIDTH);
  for (let index = 0; index < out.length; index++) {
    out[index] = Number.parseInt(
      hex.slice(index * HEX_PAIR_WIDTH, index * HEX_PAIR_WIDTH + HEX_PAIR_WIDTH),
      HEX_RADIX,
    );
  }
  return out;
}

export function bytesToHexLower(bytes: Uint8Array): string {
  let result = "";
  for (const byte of bytes) {
    result += byte.toString(HEX_RADIX).padStart(HEX_PAIR_WIDTH, "0");
  }
  return result;
}
