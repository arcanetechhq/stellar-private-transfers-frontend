import {
  ed25519PubkeyPayloadHexToWithdrawFrDecimals,
} from "@auditable/privacy-pool-zk-sdk";
import type {
  CoinData,
  DepositObject,
  DepositSlot,
  PrivacyPoolSDK,
  StateFile,
  WithdrawObject,
} from "@auditable/privacy-pool-zk-sdk";
import {
  dualWithdrawLegsWithSharedRoot,
  MIN_CONFIDENTIAL_TRANSFER_STROOPS,
  requireChangeRecipientWhenPartial,
  ZERO_STROOPS,
} from "./privacy-pool-confidential-proof-helpers";
import { ed25519PublicKeyHexFromStellarAccount } from "@/shared/lib/stellar/ed25519-public-key-hex-from-account";
import { privKeyScalarDecimalFromRecipientScalarHex } from "./priv-key-scalar-decimal-from-recipient-scalar-hex";
import { withTokenAddressPublicInputs } from "./prove-transaction-input";
import {
  buildPoolTransactionAuditParameters,
  resolvePoolApplicationId,
} from "./build-transaction-audit-parameters";
import type { TransactionAuditParams } from "@auditable/privacy-pool-zk-sdk";

export type AlignedDepositSlotBuilder = (
  parameters: {
    privateAddressStpl1: string;
    amountStroops: bigint;
    tokenAddress: string;
  },
) => Promise<{
  deposit: DepositObject;
  commitment_hex: string;
  coin: CoinData;
  depositScalarHex: string;
  precommitementHex: string;
}>;

export type WithdrawChangeCoin = {
  commitment_hex: string;
  coin: CoinData;
  depositScalarHex: string;
  precommitementHex: string;
};

export async function resolveWithdrawChangeDeposits(parameters: {
  changeStroops: bigint;
  changePrivateAddressStpl1: string | undefined;
  buildAlignedDepositSlot: AlignedDepositSlotBuilder;
  tokenAddress: string;
}): Promise<{
  deposits: [DepositSlot, DepositSlot];
  changeCoin?: WithdrawChangeCoin;
}> {
  if (parameters.changeStroops <= ZERO_STROOPS) {
    return { deposits: ["dummy", "dummy"] };
  }
  const stpl1 = parameters.changePrivateAddressStpl1?.trim() ?? "";
  if (!stpl1) {
    throw new Error(
      "Private address is required to return the unused balance to the pool (partial withdraw)",
    );
  }
  const slot = await parameters.buildAlignedDepositSlot({
    privateAddressStpl1: stpl1,
    amountStroops: parameters.changeStroops,
    tokenAddress: parameters.tokenAddress,
  });
  return {
    deposits: [slot.deposit, "dummy"],
    changeCoin: {
      commitment_hex: slot.commitment_hex,
      coin: slot.coin,
      depositScalarHex: slot.depositScalarHex,
      precommitementHex: slot.precommitementHex,
    },
  };
}

export async function prepareDualWithdrawProofInputs(parameters: {
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
  changePrivateAddressStpl1: string | undefined;
  tokenAddress: string;
}): Promise<{
  publicInput: ReturnType<typeof withTokenAddressPublicInputs>;
  audit: TransactionAuditParams;
  withdrawLegs: [WithdrawObject, WithdrawObject];
  deposits: [DepositSlot, DepositSlot];
  changeCoin?: WithdrawChangeCoin;
}> {
  const totalNotes = BigInt(parameters.coinA.value) + BigInt(parameters.coinB.value);
  if (parameters.withdrawAmountStroops < MIN_CONFIDENTIAL_TRANSFER_STROOPS) {
    throw new Error("Withdraw amount must be positive");
  }
  if (parameters.withdrawAmountStroops > totalNotes) {
    throw new Error("Withdraw amount exceeds combined note value");
  }
  const changeStroops = totalNotes - parameters.withdrawAmountStroops;
  requireChangeRecipientWhenPartial(
    changeStroops,
    parameters.changePrivateAddressStpl1,
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
    changePrivateAddressStpl1: parameters.changePrivateAddressStpl1,
    buildAlignedDepositSlot: parameters.buildAlignedDepositSlot,
    tokenAddress: parameters.tokenAddress,
  });
  const publicInput = withTokenAddressPublicInputs(
    {
      stateRoot: legA.witness.stateRoot,
      withdrawAddressHi: hi,
      withdrawAddressLo: lo,
      privKeyScalar,
    },
    parameters.tokenAddress,
  );
  const applicationId =
    parameters.coinA.application_id
    ?? parameters.coinB.application_id
    ?? resolvePoolApplicationId();
  const audit = buildPoolTransactionAuditParameters(applicationId);
  return {
    publicInput,
    audit,
    withdrawLegs: [legA.withdrawObject, legB.withdrawObject],
    deposits,
    changeCoin,
  };
}
