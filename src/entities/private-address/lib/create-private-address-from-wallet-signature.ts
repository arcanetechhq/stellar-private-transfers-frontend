import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import type { RootState } from "@/store";
import { getPrivacyPoolService, buildPrivateAddressSignMessage } from "@/shared/lib/privacy-sdk/index.js";
import { recipientScalarHexFromStellarSignature } from "@/shared/lib/private-address/recipient-scalar-hex";
import { getSpendScalarDomain } from "@/shared/stellar/stellar-network-environment";
import { syncLocalPrivateAddressToSdkState } from "@/shared/lib/privacy-sdk/sync-local-private-address-to-sdk-state.js";
import {
  readWalletDefaultPrivateAddressNonceFromSdkState,
  saveWalletPrivateAddressRecordToSdkState,
  setWalletDefaultPrivateAddressNonceToSdkState,
} from "@/shared/lib/privacy-sdk/wallet-private-address-sdk-state.js";
import { saveWalletPrivateAddressScalarToSdkState } from "@/shared/lib/privacy-sdk/wallet-scalar-sdk-state.js";

type CreatePrivateAddressFromWalletParameters = {
  getState: () => RootState;
  publicKey: string;
  trimmedNonce: string;
};

export async function createPrivateAddressFromWalletSignature(
  parameters: CreatePrivateAddressFromWalletParameters,
): Promise<void> {
  const { getState, publicKey, trimmedNonce } = parameters;
  const domain = getSpendScalarDomain();
  const message = buildPrivateAddressSignMessage(publicKey, domain, trimmedNonce);
  const { networkPassphrase } = await StellarWalletsKit.getNetwork();
  const { signedMessage } = await StellarWalletsKit.signMessage(message, {
    address: publicKey,
    networkPassphrase,
  });
  const privateAddress =
    await getPrivacyPoolService().generatePrivateAddressFromStellarSignature(
      signedMessage,
      domain,
    );
  const createdAt = Date.now();
  const scalarHex = await recipientScalarHexFromStellarSignature(
    signedMessage,
    domain,
  );
  await saveWalletPrivateAddressRecordToSdkState({
    owner: publicKey,
    nonce: trimmedNonce,
    privateAddress,
    createdAt,
  });
  await syncLocalPrivateAddressToSdkState({
    walletPublicKey: publicKey,
    privateAddressStpl1: privateAddress,
    registered: false,
  });
  await saveWalletPrivateAddressScalarToSdkState({
    owner: publicKey,
    nonce: trimmedNonce,
    scalarHex,
  });
  const existingDefault = readWalletDefaultPrivateAddressNonceFromSdkState({
    state: getState(),
    owner: publicKey,
  });
  if (!existingDefault) {
    await setWalletDefaultPrivateAddressNonceToSdkState({
      owner: publicKey,
      nonce: trimmedNonce,
    });
  }
}
