import type { AppDispatch } from "@/store";
import type { PendingClaimItem } from "@/entities/pending-claims";
import { validatePendingClaimOperation } from "@/shared/lib/privacy-sdk/operation-adapters.js";
import { prepareSdkPendingClaimTransfer } from "@/shared/lib/privacy-sdk/execute-sdk-pending-claim-transfer.js";
import { mapPrivacySdkError } from "@/shared/lib/privacy-sdk/map-privacy-sdk-errors.js";
import { getPrivacySdkClientOrThrow } from "@/shared/lib/privacy-sdk/transact-context.js";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops.js";
import {
  formatProtocolRelayError,
  ProtocolRelayClientError,
  routePreparedTransact,
} from "@/shared/lib/protocol-relay";
import { bindClaimRelayPorts } from "./bind-claim-relay-ports.js";

export type RunPendingClaimMutationResult = {
  txId: string;
  amountDisplay: number;
  coinDeliveryWarning?: string;
};

export async function runPendingClaimMutation(parameters: {
  dispatch: AppDispatch;
  claim: PendingClaimItem;
  assetId: string;
  permanentPrivateAddress: string;
  walletPublicKey: string;
}): Promise<RunPendingClaimMutationResult> {
  const privacyClient = getPrivacySdkClientOrThrow();
  const senderTrim = parameters.permanentPrivateAddress.trim();
  await validatePendingClaimOperation(privacyClient, {
    claim: parameters.claim,
    recipientPrivateAddress: senderTrim,
    assetId: parameters.assetId,
  });
  const prepared = await prepareSdkPendingClaimTransfer({
    client: privacyClient,
    claim: parameters.claim,
    assetId: parameters.assetId,
    permanentPrivateAddress: senderTrim,
  });
  const amountDisplay = stroopsToDisplayAmount(BigInt(parameters.claim.noteValue));
  const routed = await routePreparedTransact({
    ports: bindClaimRelayPorts({
      dispatch: parameters.dispatch,
      execute: prepared.execute,
    }),
    walletPublicKey: parameters.walletPublicKey,
    prepared: prepared.prepared,
    display: {
      kind: "pending_claim",
      assetId: parameters.assetId,
      amountDisplay,
      counterparty: parameters.claim.poolTxId,
      senderPrivateAddress: senderTrim,
    },
  });
  return {
    txId: routed.txId,
    amountDisplay,
    ...(routed.coinDeliveryWarning
      ? { coinDeliveryWarning: routed.coinDeliveryWarning }
      : {}),
  };
}

export function readPendingClaimMutationError(error: unknown): string {
  if (error instanceof ProtocolRelayClientError) {
    return formatProtocolRelayError(error);
  }
  const mapped = mapPrivacySdkError(error);
  return mapped === "Operation failed" ? "Could not claim pending note." : mapped;
}
