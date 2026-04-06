import type { CoinData, StateFile } from "@auditable/privacy-pool-zk-sdk";
import { privacyPoolService } from "./privacy-pool-service";
import { buildRecipientAndOptionalChangeDeposits } from "./build-recipient-change-deposits";
import {
  MIN_CONFIDENTIAL_TRANSFER_STROOPS,
  requireChangeRecipientWhenPartial,
  senderWithdrawFrAndScalar,
  withdrawWitnessForCoin,
} from "./privacy-pool-confidential-proof-helpers";

export async function prepareConfidentialTransferProof(parameters: {
  coin: CoinData;
  state: StateFile;
  senderGAddress: string;
  senderPrivKeyScalarHex: string;
  depositorEphemeralXHex: string;
  depositorEphemeralYHex: string;
  transferStroops: bigint;
  recipientStealthStpl1: string;
  selfStealthStpl1ForChange: string | undefined;
}): Promise<{
  proof_hex: string;
  public_hex: string;
  recipientCoin: {
    commitment_hex: string;
    coin: CoinData;
    depositScalarHex: string;
  };
  changeCoin?: { commitment_hex: string; coin: CoinData; depositScalarHex: string };
}> {
  const sdk = await privacyPoolService.getInitializedSdk();
  const noteStroops = BigInt(parameters.coin.value);
  if (parameters.transferStroops < MIN_CONFIDENTIAL_TRANSFER_STROOPS) {
    throw new Error("Transfer amount must be positive");
  }
  if (parameters.transferStroops > noteStroops) {
    throw new Error("Transfer amount exceeds note value");
  }
  const changeStroops = noteStroops - parameters.transferStroops;
  requireChangeRecipientWhenPartial(
    changeStroops,
    parameters.selfStealthStpl1ForChange,
  );
  const { witness, withdrawObject } = withdrawWitnessForCoin({
    sdk,
    coin: parameters.coin,
    state: parameters.state,
    xHex: parameters.depositorEphemeralXHex,
    yHex: parameters.depositorEphemeralYHex,
  });
  const { hi, lo, privKeyScalar } = senderWithdrawFrAndScalar({
    senderGAddress: parameters.senderGAddress,
    senderPrivKeyScalarHex: parameters.senderPrivKeyScalarHex,
  });
  const { recipientSlot, deposits, changeCoin } =
    await buildRecipientAndOptionalChangeDeposits({
      recipientStealthStpl1: parameters.recipientStealthStpl1,
      transferStroops: parameters.transferStroops,
      changeStroops,
      selfStealthStpl1ForChange: parameters.selfStealthStpl1ForChange,
    });
  const proof = await sdk.proveTransaction(
    {
      stateRoot: witness.stateRoot,
      withdrawAddressHi: hi,
      withdrawAddressLo: lo,
      privKeyScalar,
    },
    [withdrawObject, "dummy"],
    deposits,
  );
  return {
    ...proof,
    recipientCoin: {
      commitment_hex: recipientSlot.commitment_hex,
      coin: recipientSlot.coin,
      depositScalarHex: recipientSlot.depositScalarHex,
    },
    changeCoin,
  };
}

export { prepareConfidentialTransferProofDual } from "./privacy-pool-confidential-proof-dual";
