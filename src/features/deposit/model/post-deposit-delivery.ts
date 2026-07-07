import {
  buildCoinDeliveryPostBody,
  type PostCoinDeliveryBody,
} from "@/entities/coin-deliveries";
import type { CoinWithMetadata } from "@/entities/coin";

interface PostDepositDeliveryInput {
  coinItem: CoinWithMetadata;
  postCoinDelivery: (body: PostCoinDeliveryBody) => {
    unwrap: () => Promise<unknown>;
  };
}

export async function postDepositDelivery({
  coinItem,
  postCoinDelivery,
}: PostDepositDeliveryInput): Promise<void> {
  try {
    const body = await buildCoinDeliveryPostBody({
      recipientPrivateAddressStpl1: coinItem.privateAddress,
      commitmentHex: coinItem.commitmentHex,
      coin: coinItem.coin,
      depositScalarHex: coinItem.depositScalarHex,
      precommitementHex: coinItem.precommitementHex,
      assetId: coinItem.assetId,
      amountDisplay: coinItem.amountDisplay,
      txId: coinItem.txId,
    });
    await postCoinDelivery(body).unwrap();
  } catch {
    await Promise.resolve();
  }
}
