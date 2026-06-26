import type { CoinData, StateFile } from "@auditable/privacy-pool-zk-sdk";
import { privacyPoolService } from "./privacy-pool-service";
import { buildRecipientAndOptionalChangeDeposits } from "./build-recipient-change-deposits";
import { withTokenAddressPublicInputs } from "./prove-transaction-input";
import { buildZeroPublicLegs } from "./prove-transaction-input";
import {
  changeStroopsAfterDualTransfer,
  dualWithdrawLegsWithSharedRoot,
  requireChangeRecipientWhenPartial,
  senderWithdrawFrAndScalar,
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

type PrepareConfidentialTransferProofDualParameters = {
  coinA: CoinData;
  coinB: CoinData;
  state: StateFile;
  senderGAddress: string;
  senderPrivKeyScalarHex: string;
  ephemeralA: { xHex: string; yHex: string };
  ephemeralB: { xHex: string; yHex: string };
  transferStroops: bigint;
  recipientPrivateAddressStpl1: string;
  selfPrivateAddressStpl1ForChange: string | undefined;
  tokenAddress: string;
};

type PrepareConfidentialTransferProofDualResult = {
  proof_hex: string;
  public_hex: string;
  applicationIdsPlaintext: KytApplicationIdHints;
  recipientCoin: GeneratedOutputCoin;
  changeCoin?: GeneratedOutputCoin;
};

export async function prepareConfidentialTransferProofDual(
  parameters: PrepareConfidentialTransferProofDualParameters,
): Promise<PrepareConfidentialTransferProofDualResult> {
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
    parameters.selfPrivateAddressStpl1ForChange,
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
      recipientPrivateAddressStpl1: parameters.recipientPrivateAddressStpl1,
      transferStroops: parameters.transferStroops,
      changeStroops,
      selfPrivateAddressStpl1ForChange: parameters.selfPrivateAddressStpl1ForChange,
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
  const proof = await sdk.proveTransaction(
    publicInput as unknown as Parameters<typeof sdk.proveTransaction>[0],
    buildZeroPublicLegs(),
    [legA.withdrawObject, legB.withdrawObject],
    deposits,
    audit,
  );
  const applicationIdsPlaintext: KytApplicationIdHints = [
    parameters.coinA.application_id ?? applicationId,
    parameters.coinB.application_id ?? applicationId,
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
