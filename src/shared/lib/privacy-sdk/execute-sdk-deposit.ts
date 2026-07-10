import type { StellarPreparedOperation } from "@arcanetech/privacy-sdk-stellar";
import type { CoinWithMetadata } from "@/entities/coin";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops.js";
import { DEPOSIT_DISCLOSURE } from "./operation-adapters.js";
import {
  mapPrivacySdkError,
  mapPrivacySdkErrors,
} from "./map-privacy-sdk-errors.js";
import { getPrivacySdkClientOrThrow } from "./transact-context.js";

export async function executeSdkDeposit(input: {
  walletPublicKey: string;
  privateAddress: string;
  assetId: string;
  amountStroops: bigint;
}) {
  const client = getPrivacySdkClientOrThrow();
  const prepared = await client.deposit({
    from: input.walletPublicKey,
    to: input.privateAddress,
    asset: input.assetId,
    amount: input.amountStroops,
    disclosure: DEPOSIT_DISCLOSURE,
  });
  if (prepared.status === "rejected") {
    throw new Error(mapPrivacySdkErrors(prepared.errors));
  }
  try {
    const receipt = await prepared.execute();
    return {
      receipt,
      prepared: prepared.prepared,
    };
  } catch (error) {
    throw new Error(mapPrivacySdkError(error));
  }
}

export function buildCoinItemFromSdkDeposit(input: {
  prepared: StellarPreparedOperation;
  privateAddress: string;
  assetId: string;
  poolContract: string;
  txId: string;
}): CoinWithMetadata {
  const artifacts = input.prepared.transactArtifacts;
  const outputRecord = input.prepared.outputRecords[0];
  if (
    !artifacts?.commitmentHex ||
    !artifacts.depositScalarHex ||
    !outputRecord?.coinNote
  ) {
    throw new Error("Deposit execution returned incomplete artifacts");
  }
  return {
    commitmentHex: artifacts.commitmentHex,
    coin: outputRecord.coinNote,
    depositScalarHex: artifacts.depositScalarHex,
    precommitementHex: artifacts.precommitementHex ?? "",
    privateAddress: input.privateAddress,
    assetId: input.assetId,
    poolContract: input.poolContract,
    amountDisplay: stroopsToDisplayAmount(input.prepared.intent.amount),
    status: "pending",
    txId: input.txId,
  };
}
