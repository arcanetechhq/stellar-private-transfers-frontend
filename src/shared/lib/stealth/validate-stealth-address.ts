import { decodeStealthAddress } from "@auditable/privacy-pool-zk-sdk";

const STEALTH_PREFIX = "stpl1";

export function isValidStealthAddressString(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed.startsWith(STEALTH_PREFIX)) {
    return false;
  }
  try {
    decodeStealthAddress(trimmed);
    return true;
  } catch {
    return false;
  }
}
