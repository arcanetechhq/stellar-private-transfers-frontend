import type { CoinData, DepositSlot } from "@auditable/privacy-pool-zk-sdk";
import { privacyPoolService } from "./privacy-pool-service";
import { ZERO_STROOPS } from "./privacy-pool-confidential-proof-helpers";

export async function buildRecipientAndOptionalChangeDeposits(parameters: {
  recipientPrivateAddressStpl1: string;
  transferStroops: bigint;
  changeStroops: bigint;
  selfPrivateAddressStpl1ForChange: string | undefined;
  tokenAddress: string;
}): Promise<{
  recipientSlot: Awaited<ReturnType<typeof privacyPoolService.buildAlignedDepositSlot>>;
  deposits: [DepositSlot, DepositSlot];
  changeCoin?: {
    commitment_hex: string;
    coin: CoinData;
    depositScalarHex: string;
    precommitementHex: string;
  };
}> {
  const recipientSlot = await privacyPoolService.buildAlignedDepositSlot({
    privateAddressStpl1: parameters.recipientPrivateAddressStpl1.trim(),
    amountStroops: parameters.transferStroops,
    tokenAddress: parameters.tokenAddress,
  });
  let deposits: [DepositSlot, DepositSlot] = [recipientSlot.deposit, "dummy"];
  let changeCoin:
    | {
        commitment_hex: string;
        coin: CoinData;
        depositScalarHex: string;
        precommitementHex: string;
      }
    | undefined;
  if (parameters.changeStroops <= ZERO_STROOPS) {
    const paddingSlot = await privacyPoolService.buildAlignedDepositSlot({
      privateAddressStpl1: parameters.recipientPrivateAddressStpl1.trim(),
      amountStroops: ZERO_STROOPS,
      tokenAddress: parameters.tokenAddress,
    });
    return { recipientSlot, deposits: [recipientSlot.deposit, paddingSlot.deposit] };
  }
  if (parameters.changeStroops > ZERO_STROOPS) {
    const changeSlot = await privacyPoolService.buildAlignedDepositSlot({
      privateAddressStpl1: parameters.selfPrivateAddressStpl1ForChange!.trim(),
      amountStroops: parameters.changeStroops,
      tokenAddress: parameters.tokenAddress,
    });
    deposits = [recipientSlot.deposit, changeSlot.deposit];
    changeCoin = {
      commitment_hex: changeSlot.commitment_hex,
      coin: changeSlot.coin,
      depositScalarHex: changeSlot.depositScalarHex,
      precommitementHex: changeSlot.precommitementHex,
    };
  }
  return { recipientSlot, deposits, changeCoin };
}
