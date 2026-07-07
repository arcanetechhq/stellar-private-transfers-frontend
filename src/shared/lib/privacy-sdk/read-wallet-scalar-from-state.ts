import type { RootState } from "@/store";
import {
  readPrivateAddressRecordFromStorage,
} from "@/entities/private-address/lib/persist-private-address";
import {
  selectScalarByNonce,
  selectScalarByPrivateAddress,
} from "@/entities/private-address/model/private-address-selectors";
import { DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE } from "@/shared/lib/privacy-sdk/index.js";
import { readWalletScalarHexFromSdkState } from "@/shared/lib/privacy-sdk/wallet-scalar-sdk-state.js";

export function readWalletScalarFromState(input: {
  getState: () => RootState;
  publicKey: string;
  privateAddressStpl1: string;
  defaultNonce?: string;
}): string | undefined {
  const trimmedPublicKey = input.publicKey.trim();
  const nonce = (input.defaultNonce ?? DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE).trim();
  const fromSdk = readWalletScalarHexFromSdkState({
    state: input.getState(),
    owner: trimmedPublicKey,
    nonce,
  });
  if (fromSdk) {
    return fromSdk;
  }
  const trimmedAddress = input.privateAddressStpl1.trim();
  const fromAddress = selectScalarByPrivateAddress(trimmedAddress)(
    input.getState(),
  )?.trim();
  if (fromAddress) {
    return fromAddress;
  }
  const fromNonce = selectScalarByNonce(nonce)(input.getState())?.trim();
  if (fromNonce) {
    return fromNonce;
  }
  const fromDisk = readPrivateAddressRecordFromStorage(trimmedPublicKey, nonce);
  return fromDisk?.recipientScalarHex?.trim() || undefined;
}
