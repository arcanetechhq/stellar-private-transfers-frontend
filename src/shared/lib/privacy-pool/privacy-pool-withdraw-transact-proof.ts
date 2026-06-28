import { withdrawObjectFromMerkleWitness } from "@auditable/privacy-pool-zk-sdk";
import type { CoinData, PrivacyPoolSDK, StateFile } from "@auditable/privacy-pool-zk-sdk";
import { buildPublicWithdrawLegs } from "./prove-transaction-input";
import {
  leafEphemeralCoords,
  MIN_CONFIDENTIAL_TRANSFER_STROOPS,
} from "./privacy-pool-confidential-proof-helpers";
import {
  buildPoolTransactionAuditParameters,
  resolvePoolApplicationId,
} from "./build-transaction-audit-parameters";
import {
  buildWithdrawPublicInput,
  prepareDualWithdrawProofInputs,
  resolveWithdrawChangeDeposits,
  type AlignedDepositSlotBuilder,
  type DualWithdrawProofParameters,
  type WithdrawChangeCoin,
} from "./privacy-pool-withdraw-proof-helpers";
import type { KytApplicationIdHints } from "./privacy-pool-proof-types";

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
  changePrivateAddressStpl1: string | undefined;
  tokenAddress: string;
}): Promise<{
  proof_hex: string;
  public_hex: string;
  applicationIdsPlaintext: KytApplicationIdHints;
  changeCoin?: WithdrawChangeCoin;
}> {
  const noteStroops = BigInt(parameters.coin.value);
  if (parameters.withdrawAmountStroops < MIN_CONFIDENTIAL_TRANSFER_STROOPS) {
    throw new Error("Withdraw amount must be positive");
  }
  if (parameters.withdrawAmountStroops > noteStroops) {
    throw new Error("Withdraw amount exceeds note value");
  }
  const witness = parameters.sdk.buildWithdrawMerkleWitness(parameters.coin, parameters.state);
  const ephemeralCoords = leafEphemeralCoords(
    parameters.depositorEphemeralXHex,
    parameters.depositorEphemeralYHex,
  );
  const applicationId = parameters.coin.application_id ?? resolvePoolApplicationId();
  const primaryWithdraw = withdrawObjectFromMerkleWitness(
    witness,
    ephemeralCoords,
    applicationId,
  );
  const changeStroops = noteStroops - parameters.withdrawAmountStroops;
  const { deposits, changeCoin } = await resolveWithdrawChangeDeposits({
    changeStroops,
    changePrivateAddressStpl1: parameters.changePrivateAddressStpl1,
    buildAlignedDepositSlot: parameters.buildAlignedDepositSlot,
    tokenAddress: parameters.tokenAddress,
  });
  const publicInput = buildWithdrawPublicInput({
    stateRoot: witness.stateRoot,
    destinationStellarAddress: parameters.destinationStellarAddress,
    privKeyScalarHex: parameters.privKeyScalarHex,
    tokenAddress: parameters.tokenAddress,
  });
  const audit = buildPoolTransactionAuditParameters(applicationId);
  const proof = await parameters.sdk.proveTransaction(
    publicInput as unknown as Parameters<typeof parameters.sdk.proveTransaction>[0],
    buildPublicWithdrawLegs(
      parameters.tokenAddress,
      parameters.withdrawAmountStroops.toString(),
    ),
    [primaryWithdraw, "dummy"],
    deposits,
    audit,
  );
  const applicationIdsPlaintext: KytApplicationIdHints = [
    applicationId,
    "0",
    changeCoin ? applicationId : "0",
    "0",
  ];
  return { ...proof, applicationIdsPlaintext, changeCoin };
}

export async function proveWithdrawTransactDual(
  parameters: DualWithdrawProofParameters,
): Promise<{
  proof_hex: string;
  public_hex: string;
  applicationIdsPlaintext: KytApplicationIdHints;
  changeCoin?: WithdrawChangeCoin;
}> {
  const {
    publicInput,
    audit,
    withdrawLegs,
    deposits,
    changeCoin,
  } = await prepareDualWithdrawProofInputs(parameters);
  const proof = await parameters.sdk.proveTransaction(
    publicInput as unknown as Parameters<typeof parameters.sdk.proveTransaction>[0],
    buildPublicWithdrawLegs(
      parameters.tokenAddress,
      parameters.withdrawAmountStroops.toString(),
    ),
    withdrawLegs,
    deposits,
    audit,
  );
  const applicationIdA = parameters.coinA.application_id ?? audit.applicationId;
  const applicationIdB = parameters.coinB.application_id ?? audit.applicationId;
  const applicationIdsPlaintext: KytApplicationIdHints = [
    applicationIdA,
    applicationIdB,
    changeCoin ? audit.applicationId : "0",
    "0",
  ];
  return { ...proof, applicationIdsPlaintext, changeCoin };
}

export { type AlignedDepositSlotBuilder } from "./privacy-pool-withdraw-proof-helpers";
