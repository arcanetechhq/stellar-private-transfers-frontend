import type { CoinData, StateFile } from "@auditable/privacy-pool-zk-sdk";
import { privacyPoolService } from "./privacy-pool-service";
import { buildRecipientAndOptionalChangeDeposits } from "./build-recipient-change-deposits";
import {
  changeStroopsAfterDualTransfer,
  dualWithdrawLegsWithSharedRoot,
  requireChangeRecipientWhenPartial,
  senderWithdrawFrAndScalar,
} from "./privacy-pool-confidential-proof-helpers";

export async function prepareConfidentialTransferProofDual(parameters: {
  coinA: CoinData;
  coinB: CoinData;
  state: StateFile;
  senderGAddress: string;
  senderPrivKeyScalarHex: string;
  ephemeralA: { xHex: string; yHex: string };
  ephemeralB: { xHex: string; yHex: string };
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
  const noteA = BigInt(parameters.coinA.value);
  const noteB = BigInt(parameters.coinB.value);
  const totalNotes = noteA + noteB;
  const changeStroops = changeStroopsAfterDualTransfer(
    parameters.transferStroops,
    totalNotes,
  );
  requireChangeRecipientWhenPartial(
    changeStroops,
    parameters.selfStealthStpl1ForChange,
  );
  const { legA, legB } = dualWithdrawLegsWithSharedRoot({
    sdk,
    coinA: parameters.coinA,
    coinB: parameters.coinB,
    state: parameters.state,
    ephemeralA: parameters.ephemeralA,
    ephemeralB: parameters.ephemeralB,
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
      stateRoot: legA.witness.stateRoot,
      withdrawAddressHi: hi,
      withdrawAddressLo: lo,
      privKeyScalar,
    },
    [legA.withdrawObject, legB.withdrawObject],
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
