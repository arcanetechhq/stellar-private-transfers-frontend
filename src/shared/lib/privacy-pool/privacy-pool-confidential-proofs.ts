import type { CoinData, StateFile } from "@auditable/privacy-pool-zk-sdk";
import { privacyPoolService } from "./privacy-pool-service";
import { buildRecipientAndOptionalChangeDeposits } from "./build-recipient-change-deposits";
import { withTokenAddressPublicInputs } from "./prove-transaction-input";
import { buildZeroPublicLegs } from "./prove-transaction-input";
import {
  MIN_CONFIDENTIAL_TRANSFER_STROOPS,
  requireChangeRecipientWhenPartial,
  senderWithdrawFrAndScalar,
  withdrawWitnessForCoin,
} from "./privacy-pool-confidential-proof-helpers";
import {
  buildPoolTransactionAuditParameters,
  resolvePoolApplicationId,
} from "./build-transaction-audit-parameters";
import type { KytApplicationIdHints } from "./privacy-pool-proof-types";

type GeneratedOutputCoin = {
  commitment_hex: string;
  coin: CoinData;
  depositScalarHex: string;
  precommitementHex: string;
};

type PrepareConfidentialTransferProofParameters = {
  coin: CoinData;
  state: StateFile;
  senderGAddress: string;
  senderPrivKeyScalarHex: string;
  depositorEphemeralXHex: string;
  depositorEphemeralYHex: string;
  transferStroops: bigint;
  recipientPrivateAddressStpl1: string;
  selfPrivateAddressStpl1ForChange: string | undefined;
  tokenAddress: string;
};

type PrepareConfidentialTransferProofResult = {
  proof_hex: string;
  public_hex: string;
  applicationIdsPlaintext: KytApplicationIdHints;
  recipientCoin: GeneratedOutputCoin;
  changeCoin?: GeneratedOutputCoin;
};

export async function prepareConfidentialTransferProof(
  parameters: PrepareConfidentialTransferProofParameters,
): Promise<PrepareConfidentialTransferProofResult> {
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
    parameters.selfPrivateAddressStpl1ForChange,
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
      recipientPrivateAddressStpl1: parameters.recipientPrivateAddressStpl1,
      transferStroops: parameters.transferStroops,
      changeStroops,
      selfPrivateAddressStpl1ForChange: parameters.selfPrivateAddressStpl1ForChange,
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
  const applicationId = parameters.coin.application_id ?? resolvePoolApplicationId();
  const audit = buildPoolTransactionAuditParameters(applicationId);
  const proof = await sdk.proveTransaction(
    publicInput as unknown as Parameters<typeof sdk.proveTransaction>[0],
    buildZeroPublicLegs(),
    [withdrawObject, "dummy"],
    deposits,
    audit,
  );
  const applicationIdsPlaintext: KytApplicationIdHints = [
    applicationId,
    "0",
    applicationId,
    changeCoin ? applicationId : "0",
  ];
  return {
    ...proof,
    applicationIdsPlaintext,
    recipientCoin: {
      commitment_hex: recipientSlot.commitment_hex,
      coin: recipientSlot.coin,
      depositScalarHex: recipientSlot.depositScalarHex,
      precommitementHex: recipientSlot.precommitementHex,
    },
    changeCoin,
  };
}

export { prepareConfidentialTransferProofDual } from "./privacy-pool-confidential-proof-dual";
