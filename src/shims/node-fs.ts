export function readFileSync(): Uint8Array {
  throw new Error("fs.readFileSync is not available in the browser build");
}

export function existsSync(): boolean {
  return false;
}
