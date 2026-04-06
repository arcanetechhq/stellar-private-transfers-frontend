import {
  ed25519PubkeyPayloadHexToWithdrawFrDecimals,
  withdrawObjectFromMerkleWitness,
} from "@auditable/privacy-pool-zk-sdk";
import type {
  CoinData,
  DepositObject,
  DepositSlot,
  PrivacyPoolSDK,
  StateFile,
} from "@auditable/privacy-pool-zk-sdk";
import {
  dualWithdrawLegsWithSharedRoot,
  leafEphemeralCoords,
  MIN_CONFIDENTIAL_TRANSFER_STROOPS,
  requireChangeRecipientWhenPartial,
  ZERO_STROOPS,
} from "./privacy-pool-confidential-proof-helpers";
import { ed25519PublicKeyHexFromStellarAccount } from "@/shared/lib/stellar/ed25519-public-key-hex-from-account";
import { privKeyScalarDecimalFromRecipientScalarHex } from "./priv-key-scalar-decimal-from-recipient-scalar-hex";

export type AlignedDepositSlotBuilder = (
  stealthAddressStpl1: string,
  amountStroops: bigint,
) => Promise<{
  deposit: DepositObject;
  commitment_hex: string;
  coin: CoinData;
  depositScalarHex: string;
}>;

async function resolveWithdrawChangeDeposits(parameters: {
  changeStroops: bigint;
  changeStealthAddressStpl1: string | undefined;
  buildAlignedDepositSlot: AlignedDepositSlotBuilder;
}): Promise<{
  deposits: [DepositSlot, DepositSlot];
  changeCoin?: { commitment_hex: string; coin: CoinData; depositScalarHex: string };
}> {
  if (parameters.changeStroops <= ZERO_STROOPS) {
    return { deposits: ["dummy", "dummy"] };
  }
  const stpl1 = parameters.changeStealthAddressStpl1?.trim() ?? "";
  if (!stpl1) {
    throw new Error(
      "Stealth address is required to return the unused balance to the pool (partial withdraw)",
    );
  }
  const slot = await parameters.buildAlignedDepositSlot(stpl1, parameters.changeStroops);
  return {
    deposits: [slot.deposit, "dummy"],
    changeCoin: {
      commitment_hex: slot.commitment_hex,
      coin: slot.coin,
      depositScalarHex: slot.depositScalarHex,
    },
  };
}

export async function proveWithdrawTransact(parameters: {
  sdk: PrivacyPoolSDK;
  buildAlignedDepositSlot: AlignedDepositSlotBuilder;
  coin: CoinData;
  state: StateFile;
  destinationStellarAddress: string;
  privKeyScalarHex: string;
  depositorEphemeralXHex: string;
  depositorEphemeralYHex: string;
  withdrawAmountStroops: bigint;
  changeStealthAddressStpl1: string | undefined;
}): Promise<{
  proof_hex: string;
  public_hex: string;
  changeCoin?: { commitment_hex: string; coin: CoinData; depositScalarHex: string };
}> {
  const noteStroops = BigInt(parameters.coin.value);
  if (parameters.withdrawAmountStroops < MIN_CONFIDENTIAL_TRANSFER_STROOPS) {
    throw new Error("Withdraw amount must be positive");
  }
  if (parameters.withdrawAmountStroops > noteStroops) {
    throw new Error("Withdraw amount exceeds note value");
  }
  const witness = parameters.sdk.buildWithdrawMerkleWitness(
    parameters.coin,
    parameters.state,
  );
  const ephemeralCoords = leafEphemeralCoords(
    parameters.depositorEphemeralXHex,
    parameters.depositorEphemeralYHex,
  );
  const primaryWithdraw = withdrawObjectFromMerkleWitness(witness, ephemeralCoords);
  const pkHex = ed25519PublicKeyHexFromStellarAccount(
    parameters.destinationStellarAddress,
  );
  const { hi, lo } = ed25519PubkeyPayloadHexToWithdrawFrDecimals(pkHex);
  const privKeyScalar = privKeyScalarDecimalFromRecipientScalarHex(
    parameters.privKeyScalarHex,
  );
  const changeStroops = noteStroops - parameters.withdrawAmountStroops;
  const { deposits, changeCoin } = await resolveWithdrawChangeDeposits({
    changeStroops,
    changeStealthAddressStpl1: parameters.changeStealthAddressStpl1,
    buildAlignedDepositSlot: parameters.buildAlignedDepositSlot,
  });
  const proof = await parameters.sdk.proveTransaction(
    {
      stateRoot: witness.stateRoot,
      withdrawAddressHi: hi,
      withdrawAddressLo: lo,
      privKeyScalar,
    },
    [primaryWithdraw, "dummy"],
    deposits,
  );
  return { ...proof, changeCoin };
}

export async function proveWithdrawTransactDual(parameters: {
  sdk: PrivacyPoolSDK;
  buildAlignedDepositSlot: AlignedDepositSlotBuilder;
  coinA: CoinData;
  coinB: CoinData;
  state: StateFile;
  destinationStellarAddress: string;
  privKeyScalarHex: string;
  ephemeralA: { xHex: string; yHex: string };
  ephemeralB: { xHex: string; yHex: string };
  withdrawAmountStroops: bigint;
  changeStealthAddressStpl1: string | undefined;
}): Promise<{
  proof_hex: string;
  public_hex: string;
  changeCoin?: { commitment_hex: string; coin: CoinData; depositScalarHex: string };
}> {
  const noteA = BigInt(parameters.coinA.value);
  const noteB = BigInt(parameters.coinB.value);
  const totalNotes = noteA + noteB;
  if (parameters.withdrawAmountStroops < MIN_CONFIDENTIAL_TRANSFER_STROOPS) {
    throw new Error("Withdraw amount must be positive");
  }
  if (parameters.withdrawAmountStroops > totalNotes) {
    throw new Error("Withdraw amount exceeds combined note value");
  }
  const changeStroops = totalNotes - parameters.withdrawAmountStroops;
  requireChangeRecipientWhenPartial(
    changeStroops,
    parameters.changeStealthAddressStpl1,
  );
  const { legA, legB } = dualWithdrawLegsWithSharedRoot({
    sdk: parameters.sdk,
    coinA: parameters.coinA,
    coinB: parameters.coinB,
    state: parameters.state,
    ephemeralA: parameters.ephemeralA,
    ephemeralB: parameters.ephemeralB,
  });
  const pkHex = ed25519PublicKeyHexFromStellarAccount(
    parameters.destinationStellarAddress,
  );
  const { hi, lo } = ed25519PubkeyPayloadHexToWithdrawFrDecimals(pkHex);
  const privKeyScalar = privKeyScalarDecimalFromRecipientScalarHex(
    parameters.privKeyScalarHex,
  );
  const { deposits, changeCoin } = await resolveWithdrawChangeDeposits({
    changeStroops,
    changeStealthAddressStpl1: parameters.changeStealthAddressStpl1,
    buildAlignedDepositSlot: parameters.buildAlignedDepositSlot,
  });
  const proof = await parameters.sdk.proveTransaction(
    {
      stateRoot: legA.witness.stateRoot,
      withdrawAddressHi: hi,
      withdrawAddressLo: lo,
      privKeyScalar,
    },
    [legA.withdrawObject, legB.withdrawObject],
    deposits,
  );
  return { ...proof, changeCoin };
}
