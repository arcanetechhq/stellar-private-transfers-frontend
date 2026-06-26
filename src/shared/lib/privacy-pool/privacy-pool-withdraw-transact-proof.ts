import {
  ed25519PubkeyPayloadHexToWithdrawFrDecimals,
  withdrawObjectFromMerkleWitness,
} from "@auditable/privacy-pool-zk-sdk";
import type { CoinData, PrivacyPoolSDK, StateFile } from "@auditable/privacy-pool-zk-sdk";
import { buildPublicWithdrawLegs } from "./prove-transaction-input";
import {
  leafEphemeralCoords,
  MIN_CONFIDENTIAL_TRANSFER_STROOPS,
} from "./privacy-pool-confidential-proof-helpers";
import { ed25519PublicKeyHexFromStellarAccount } from "@/shared/lib/stellar/ed25519-public-key-hex-from-account";
import { privKeyScalarDecimalFromRecipientScalarHex } from "./priv-key-scalar-decimal-from-recipient-scalar-hex";
import { withTokenAddressPublicInputs } from "./prove-transaction-input";
import {
  buildPoolTransactionAuditParameters,
  resolvePoolApplicationId,
} from "./build-transaction-audit-parameters";
import {
  prepareDualWithdrawProofInputs,
  resolveWithdrawChangeDeposits,
  type AlignedDepositSlotBuilder,
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
    changePrivateAddressStpl1: parameters.changePrivateAddressStpl1,
    buildAlignedDepositSlot: parameters.buildAlignedDepositSlot,
    tokenAddress: parameters.tokenAddress,
  });
  const publicInput = withTokenAddressPublicInputs(
    {
      stateRoot: witness.stateRoot,
      withdrawAddressHi: hi,
      withdrawAddressLo: lo,
      privKeyScalar,
    },
    parameters.tokenAddress,
  );
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
  changePrivateAddressStpl1: string | undefined;
  tokenAddress: string;
}): Promise<{
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
