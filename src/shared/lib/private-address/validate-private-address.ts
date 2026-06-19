import { decodePrivateAddress } from "./privacy-pool-sdk-private-address";

const PRIVATE_ADDRESS_PREFIX = "stpl1";

export function isValidPrivateAddressString(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed.startsWith(PRIVATE_ADDRESS_PREFIX)) {
    return false;
  }
  try {
    decodePrivateAddress(trimmed);
    return true;
  } catch {
    return false;
  }
}
