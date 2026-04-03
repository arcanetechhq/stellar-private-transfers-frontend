export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let index = 0; index < bin.length; index++) {
    out[index] = bin.codePointAt(index) ?? 0;
  }
  return out;
}
