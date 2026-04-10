import { PrivacyPoolSDK } from "@auditable/privacy-pool-zk-sdk";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { store, type AppDispatch } from "@/store";
import {
  setDefaultNonce,
  setStealthRecordAndScalar,
} from "@/entities/stealth-address";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { recipientScalarHexFromStellarSignature } from "@/shared/lib/stealth/recipient-scalar-hex";

type CreateStealthFromWalletParameters = {
  dispatch: AppDispatch;
  publicKey: string;
  trimmedNonce: string;
};

export async function createStealthAddressFromWalletSignature(
  parameters: CreateStealthFromWalletParameters,
): Promise<void> {
  const { dispatch, publicKey, trimmedNonce } = parameters;
  const message = PrivacyPoolSDK.buildStealthAddressSignMessage(
    publicKey,
    trimmedNonce,
  );
  const { networkPassphrase } = await StellarWalletsKit.getNetwork();
  const { signedMessage } = await StellarWalletsKit.signMessage(message, {
    address: publicKey,
    networkPassphrase,
  });
  const stealthAddress =
    await privacyPoolService.generateStealthAddressFromStellarSignature(
      signedMessage,
    );
  const createdAt = Date.now();
  const scalarHex = await recipientScalarHexFromStellarSignature(signedMessage);
  dispatch(
    setStealthRecordAndScalar({
      nonce: trimmedNonce,
      entry: { stealthAddress, createdAt },
      scalarHex,
    }),
  );
  const currentDefault = store.getState().stealthAddress.defaultNonce;
  if (currentDefault === undefined) {
    dispatch(setDefaultNonce(trimmedNonce));
  }
}
