import { StrKey } from "@stellar/stellar-sdk";

function isEd25519PublicKey(address: string): boolean {
  try {
    StrKey.decodeEd25519PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

function isMed25519PublicKey(address: string): boolean {
  try {
    StrKey.decodeMed25519PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function isValidStellarPublicAddress(address: string): boolean {
  return isEd25519PublicKey(address) || isMed25519PublicKey(address);
}
