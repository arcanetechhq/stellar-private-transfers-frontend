import type { AppDispatch } from "@/store";
import type { CoinWithMetadata } from "@/entities/coin";
import { postCoinDeliveryBestEffort } from "@/entities/coin-deliveries";
import { buildCoinDeliveryPostBody } from "@/features/deposit";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops";

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
