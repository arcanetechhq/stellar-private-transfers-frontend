import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { store, type AppDispatch } from "@/store";
import {
  setDefaultNonce,
  setPrivateAddressRecordAndScalar,
} from "@/entities/private-address";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { recipientScalarHexFromStellarSignature } from "@/shared/lib/private-address/recipient-scalar-hex";
import { buildPrivateAddressSignMessage } from "@/shared/lib/private-address/privacy-pool-sdk-private-address";

type CreatePrivateAddressFromWalletParameters = {
  dispatch: AppDispatch;
  publicKey: string;
  trimmedNonce: string;
};

export async function createPrivateAddressFromWalletSignature(
  parameters: CreatePrivateAddressFromWalletParameters,
): Promise<void> {
  const { dispatch, publicKey, trimmedNonce } = parameters;
  const message = buildPrivateAddressSignMessage(
    publicKey,
    trimmedNonce,
  );
  const { networkPassphrase } = await StellarWalletsKit.getNetwork();
  const { signedMessage } = await StellarWalletsKit.signMessage(message, {
    address: publicKey,
    networkPassphrase,
  });
  const privateAddress =
    await privacyPoolService.generatePrivateAddressFromStellarSignature(
      signedMessage,
    );
  const createdAt = Date.now();
  const scalarHex = await recipientScalarHexFromStellarSignature(signedMessage);
  dispatch(
    setPrivateAddressRecordAndScalar({
      nonce: trimmedNonce,
      entry: { privateAddress, createdAt },
      scalarHex,
    }),
  );
  const currentDefault = store.getState().privateAddress.defaultNonce;
  if (currentDefault === undefined) {
    dispatch(setDefaultNonce(trimmedNonce));
  }
}
