import { addCoin, markCoinSpent, type CoinWithMetadata } from "@/entities/coin";
import { postCoinDeliveryBestEffort } from "@/entities/coin-deliveries";
import { buildCoinDeliveryPostBody } from "@/entities/coin-deliveries";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops";
import type { RunConfidentialTransferInput } from "./confidential-transfer-mutation-types";

type TransferOutputCoin = {
  commitment_hex: string;
  coin: CoinWithMetadata["coin"];
  depositScalarHex: string;
  precommitementHex: string;
};

export async function finalizeConfidentialTransferDeliveries(parameters: {
  input: RunConfidentialTransferInput;
  poolContract: string;
  recipientTrim: string;
  senderTrim: string;
  txId: string;
  recipientCoin: TransferOutputCoin;
  changeCoin?: TransferOutputCoin;
  picked: CoinWithMetadata[];
  suppressRecipientDelivery: boolean;
}): Promise<string | undefined> {
  const {
    input,
    poolContract,
    recipientTrim,
    senderTrim,
    txId,
    recipientCoin,
    changeCoin,
    picked,
    suppressRecipientDelivery,
  } = parameters;
  for (const coinRow of picked) {
    input.dispatch(markCoinSpent(coinRow.coin.commitment));
  }
  if (changeCoin) {
    input.dispatch(
      addCoin({
        commitmentHex: changeCoin.commitment_hex,
        coin: changeCoin.coin,
        depositScalarHex: changeCoin.depositScalarHex,
        precommitementHex: changeCoin.precommitementHex,
        privateAddress: senderTrim,
        assetId: input.assetId,
        poolContract,
        amountDisplay: stroopsToDisplayAmount(BigInt(changeCoin.coin.value)),
        status: "pending",
        txId,
      }),
    );
  }
  const warnings: string[] = [];
  if (!suppressRecipientDelivery) {
    const recipientWarning = await postCoinDeliveryBestEffort(input.dispatch, () =>
      buildCoinDeliveryPostBody({
        recipientPrivateAddressStpl1: recipientTrim,
        commitmentHex: recipientCoin.commitment_hex,
        coin: recipientCoin.coin,
        depositScalarHex: recipientCoin.depositScalarHex,
        precommitementHex: recipientCoin.precommitementHex,
        assetId: input.assetId,
        amountDisplay: input.amountDisplay,
        txId,
      }),
    );
    if (recipientWarning) {
      warnings.push(recipientWarning);
    }
  }
  if (changeCoin) {
    const changeWarning = await postCoinDeliveryBestEffort(input.dispatch, () =>
      buildCoinDeliveryPostBody({
        recipientPrivateAddressStpl1: senderTrim,
        commitmentHex: changeCoin.commitment_hex,
        coin: changeCoin.coin,
        depositScalarHex: changeCoin.depositScalarHex,
        precommitementHex: changeCoin.precommitementHex,
        assetId: input.assetId,
        amountDisplay: stroopsToDisplayAmount(BigInt(changeCoin.coin.value)),
        txId,
      }),
    );
    if (changeWarning && !suppressRecipientDelivery) {
      warnings.push(changeWarning);
    }
  }
  return warnings.length > 0 ? warnings.join("; ") : undefined;
}
