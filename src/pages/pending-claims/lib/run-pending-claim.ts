import type { AssetDto } from "@/entities/asset";
import { addCoin, type CoinData } from "@/entities/coin";
import { addTransaction, buildUserTransaction } from "@/entities/transaction";
import type { PendingClaimItem } from "@/entities/pending-claims/model/pending-claim-types.js";
import type { AppDispatch } from "@/store";
import {
  buildCoinDeliveryPostBody,
  coinDeliveryApi,
} from "@/entities/coin-deliveries";
import { validatePendingClaimOperation } from "@/shared/lib/privacy-sdk/operation-adapters.js";
import { executeSdkPendingClaimTransfer } from "@/shared/lib/privacy-sdk/execute-sdk-pending-claim-transfer.js";
import { getPrivacySdkClientOrThrow, tryGetPrivacySdkClient } from "@/shared/lib/privacy-sdk/transact-context.js";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import {
  baseUnitsToDisplayNumber,
  waitForClaimTransactionSuccess,
} from "./pending-claim-confirmation";

type PendingClaimRunParameters = {
  dispatch: AppDispatch;
  claim: PendingClaimItem;
  asset: AssetDto;
  walletPublicKey: string;
  permanentPrivateAddress: string;
};

function readOutputCoin(outputRecord: {
  coinNote?: CoinData;
  commitmentHex?: string;
  depositScalarHex?: string;
  precommitementHex?: string;
}): {
  coin: CoinData;
  commitmentHex: string;
  depositScalarHex: string;
  precommitementHex: string;
} {
  if (
    !outputRecord.coinNote ||
    !outputRecord.commitmentHex ||
    !outputRecord.depositScalarHex ||
    !outputRecord.precommitementHex
  ) {
    throw new Error("Pending claim transfer output is missing coin metadata");
  }
  return {
    coin: outputRecord.coinNote,
    commitmentHex: outputRecord.commitmentHex,
    depositScalarHex: outputRecord.depositScalarHex,
    precommitementHex: outputRecord.precommitementHex,
  };
}

function storeClaimedCoin(parameters: {
  run: PendingClaimRunParameters;
  poolContract: string;
  txId: string;
  output: ReturnType<typeof readOutputCoin>;
}): void {
  parameters.run.dispatch(
    addCoin({
      commitmentHex: parameters.output.commitmentHex,
      coin: parameters.output.coin,
      depositScalarHex: parameters.output.depositScalarHex,
      precommitementHex: parameters.output.precommitementHex,
      privateAddress: parameters.run.permanentPrivateAddress.trim(),
      assetId: parameters.run.asset.assetId,
      poolContract: parameters.poolContract,
      amountDisplay: baseUnitsToDisplayNumber(
        parameters.output.coin.value,
        parameters.run.asset.decimals,
      ),
      status: "pending",
      txId: parameters.txId,
    }),
  );
}

async function postClaimCoinDelivery(parameters: {
  run: PendingClaimRunParameters;
  txId: string;
  output: ReturnType<typeof readOutputCoin>;
}): Promise<void> {
  const body = await buildCoinDeliveryPostBody({
    recipientPrivateAddressStpl1: parameters.run.permanentPrivateAddress,
    commitmentHex: parameters.output.commitmentHex,
    coin: parameters.output.coin,
    depositScalarHex: parameters.output.depositScalarHex,
    precommitementHex: parameters.output.precommitementHex,
    assetId: parameters.run.asset.assetId,
    amountDisplay: baseUnitsToDisplayNumber(
      parameters.output.coin.value,
      parameters.run.asset.decimals,
    ),
    txId: parameters.txId,
  });
  await parameters.run.dispatch(
    coinDeliveryApi.endpoints.postCoinDelivery.initiate(body),
  ).unwrap();
}

function recordClaimTransaction(parameters: {
  run: PendingClaimRunParameters;
  txId: string;
  amountDisplay: number;
}): void {
  parameters.run.dispatch(
    addTransaction(
      buildUserTransaction({
        txId: parameters.txId,
        type: "received",
        assetId: parameters.run.asset.assetId,
        amount: parameters.amountDisplay,
        counterparty: parameters.run.claim.ownerAddress,
        senderPrivateAddress: parameters.run.permanentPrivateAddress.trim(),
      }),
    ),
  );
}

export async function runPendingClaim(
  parameters: PendingClaimRunParameters,
): Promise<string> {
  const privacyClient = getPrivacySdkClientOrThrow();
  const permanentPrivateAddress = parameters.permanentPrivateAddress.trim();
  const optionalClient = tryGetPrivacySdkClient();
  if (optionalClient) {
    await validatePendingClaimOperation(optionalClient, {
      claim: parameters.claim,
      recipientPrivateAddress: permanentPrivateAddress,
      assetId: parameters.asset.assetId,
    });
  }
  const poolContract = getRequiredPrivacyPoolContractId();
  await privacyClient.syncPoolMerkleState({
    poolContractId: poolContract,
    walletPublicKey: parameters.walletPublicKey,
  });
  const executed = await executeSdkPendingClaimTransfer({
    client: privacyClient,
    claim: parameters.claim,
    assetId: parameters.asset.assetId,
    permanentPrivateAddress,
  });
  await waitForClaimTransactionSuccess({
    txId: executed.operationId,
  });
  const output = readOutputCoin(executed.outputRecord ?? {});
  const amountDisplay = baseUnitsToDisplayNumber(
    output.coin.value,
    parameters.asset.decimals,
  );
  storeClaimedCoin({
    run: parameters,
    poolContract,
    txId: executed.operationId,
    output,
  });
  recordClaimTransaction({
    run: parameters,
    txId: executed.operationId,
    amountDisplay,
  });
  try {
    await postClaimCoinDelivery({
      run: parameters,
      txId: executed.operationId,
      output,
    });
  } catch {
    await Promise.resolve();
  }
  return executed.operationId;
}
