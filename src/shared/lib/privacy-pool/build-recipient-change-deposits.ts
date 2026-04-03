import type { CoinData, DepositSlot } from "@auditable/privacy-pool-zk-sdk";
import { privacyPoolService } from "./privacy-pool-service";
import { ZERO_STROOPS } from "./privacy-pool-confidential-proof-helpers";

export async function buildRecipientAndOptionalChangeDeposits(parameters: {
  recipientStealthStpl1: string;
  transferStroops: bigint;
  changeStroops: bigint;
  selfStealthStpl1ForChange: string | undefined;
}): Promise<{
  recipientSlot: Awaited<ReturnType<typeof privacyPoolService.buildAlignedDepositSlot>>;
  deposits: [DepositSlot, DepositSlot];
  changeCoin?: { commitment_hex: string; coin: CoinData; depositScalarHex: string };
}> {
  const recipientSlot = await privacyPoolService.buildAlignedDepositSlot(
    parameters.recipientStealthStpl1.trim(),
    parameters.transferStroops,
  );
  let deposits: [DepositSlot, DepositSlot] = [recipientSlot.deposit, "dummy"];
  let changeCoin:
    | { commitment_hex: string; coin: CoinData; depositScalarHex: string }
    | undefined;
  if (parameters.changeStroops > ZERO_STROOPS) {
    const changeSlot = await privacyPoolService.buildAlignedDepositSlot(
      parameters.selfStealthStpl1ForChange!.trim(),
      parameters.changeStroops,
    );
    deposits = [recipientSlot.deposit, changeSlot.deposit];
    changeCoin = {
      commitment_hex: changeSlot.commitment_hex,
      coin: changeSlot.coin,
      depositScalarHex: changeSlot.depositScalarHex,
    };
  }
  return { recipientSlot, deposits, changeCoin };
}
