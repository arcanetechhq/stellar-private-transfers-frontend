import type { AppDispatch } from "@/store";
import type { AssetWithTrustline } from "@/entities/asset";
import {
  addAssetTrustlineThunk,
  refreshAssetsWithTrustlinesThunk,
} from "@/entities/asset";
import { postOutputRecordDeliveries } from "@/entities/coin-deliveries";
import {
  getPendingClaimTransactionId,
  type PendingClaimItem,
} from "@/entities/pending-claims";
import {
  addTransaction,
  buildUserTransaction,
} from "@/entities/transaction";
import { validatePendingClaimOperation } from "@/shared/lib/privacy-sdk/operation-adapters.js";
import { executeSdkPendingClaimTransfer } from "@/shared/lib/privacy-sdk/execute-sdk-pending-claim-transfer.js";
import { mapPrivacySdkError } from "@/shared/lib/privacy-sdk/map-privacy-sdk-errors.js";
import { getPrivacySdkClientOrThrow } from "@/shared/lib/privacy-sdk/transact-context.js";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops.js";

async function ensureAssetTrustline(parameters: {
  dispatch: AppDispatch;
  asset: AssetWithTrustline;
  publicKey: string;
}): Promise<void> {
  if (
    parameters.asset.trustlineStatus === "native" ||
    parameters.asset.trustlineStatus !== "missing"
  ) {
    return;
  }
  const issuerAddress = parameters.asset.issuerAddress?.trim();
  if (!issuerAddress) {
    throw new Error(`Missing issuer for asset ${parameters.asset.assetId}.`);
  }
  await parameters.dispatch(
    addAssetTrustlineThunk({
      assetId: parameters.asset.assetId,
      assetCode: parameters.asset.assetId.toUpperCase(),
      issuerAddress,
      publicKey: parameters.publicKey,
    }),
  ).unwrap();
  await parameters.dispatch(refreshAssetsWithTrustlinesThunk()).unwrap();
}

export type RunPendingClaimMutationResult = {
  txId: string;
  amountDisplay: number;
  coinDeliveryWarning?: string;
};

export async function runPendingClaimMutation(parameters: {
  dispatch: AppDispatch;
  publicKey: string;
  claim: PendingClaimItem;
  assetId: string;
  asset: AssetWithTrustline | undefined;
  permanentPrivateAddress: string;
}): Promise<RunPendingClaimMutationResult> {
  if (parameters.asset) {
    await ensureAssetTrustline({
      dispatch: parameters.dispatch,
      asset: parameters.asset,
      publicKey: parameters.publicKey,
    });
  }

  const privacyClient = getPrivacySdkClientOrThrow();
  const senderTrim = parameters.permanentPrivateAddress.trim();
  await validatePendingClaimOperation(privacyClient, {
    claim: parameters.claim,
    recipientPrivateAddress: senderTrim,
    assetId: parameters.assetId,
  });

  const executed = await executeSdkPendingClaimTransfer({
    client: privacyClient,
    claim: parameters.claim,
    assetId: parameters.assetId,
    permanentPrivateAddress: senderTrim,
  });

  const amountDisplay = stroopsToDisplayAmount(
    BigInt(parameters.claim.noteValue),
  );
  const outputRecords = executed.outputRecord ? [executed.outputRecord] : [];
  const coinDeliveryWarning = await postOutputRecordDeliveries({
    outputRecords,
    txId: executed.operationId,
    dispatch: parameters.dispatch,
  });

  parameters.dispatch(
    addTransaction({
      id: getPendingClaimTransactionId(parameters.claim.id),
      date: parameters.claim.createdAt,
      type: "received",
      assetId: parameters.assetId,
      amount: amountDisplay,
      counterparty: parameters.claim.poolTxId,
      senderPrivateAddress: senderTrim,
      status: "completed",
      confirmationStatus: "none",
      disclosureStatus: "none",
    }),
  );
  parameters.dispatch(
    addTransaction(
      buildUserTransaction({
        txId: executed.operationId,
        type: "claim",
        assetId: parameters.assetId,
        amount: amountDisplay,
        counterparty: parameters.claim.poolTxId,
        senderPrivateAddress: senderTrim,
      }),
    ),
  );

  return {
    txId: executed.operationId,
    amountDisplay,
    ...(coinDeliveryWarning ? { coinDeliveryWarning } : {}),
  };
}

export function readPendingClaimMutationError(error: unknown): string {
  const mapped = mapPrivacySdkError(error);
  return mapped === "Operation failed" ? "Could not claim pending note." : mapped;
}
