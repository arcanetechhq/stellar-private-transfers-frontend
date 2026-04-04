import { DEFAULT_STEALTH_SIGN_NONCE, PrivacyPoolSDK } from "@auditable/privacy-pool-zk-sdk";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import type { AppDispatch } from "@/app/store";
import type { CoinWithMetadata } from "@/entities/coin";
import { postCoinDeliveryBestEffort } from "@/entities/coin-deliveries";
import { buildCoinDeliveryPostBody } from "@/features/deposit/lib/build-coin-delivery-post-body";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops";

export async function signWithdrawDestinationStealthMessage(
  destinationTrim: string,
): Promise<string> {
  const signMessageText = PrivacyPoolSDK.buildStealthAddressSignMessage(
    destinationTrim,
    DEFAULT_STEALTH_SIGN_NONCE,
  );
  const { networkPassphrase } = await StellarWalletsKit.getNetwork();
  const { signedMessage } = await StellarWalletsKit.signMessage(signMessageText, {
    address: destinationTrim,
    networkPassphrase,
  });
  return signedMessage;
}

export async function postPrivateWithdrawChangeDeliveryIfNeeded(parameters: {
  dispatch: AppDispatch;
  changeCoin: {
    commitment_hex: string;
    coin: CoinWithMetadata["coin"];
    depositScalarHex: string;
  };
  senderTrim: string;
  assetId: string;
  poolContract: string;
  txId: string;
}): Promise<string | undefined> {
  const changeDisplay = stroopsToDisplayAmount(
    BigInt(parameters.changeCoin.coin.value),
  );
  return postCoinDeliveryBestEffort(parameters.dispatch, () =>
    buildCoinDeliveryPostBody({
      recipientStealthStpl1: parameters.senderTrim,
      commitmentHex: parameters.changeCoin.commitment_hex,
      coin: parameters.changeCoin.coin,
      depositScalarHex: parameters.changeCoin.depositScalarHex,
      assetId: parameters.assetId,
      amountDisplay: changeDisplay,
      txId: parameters.txId,
    }),
  );
}
