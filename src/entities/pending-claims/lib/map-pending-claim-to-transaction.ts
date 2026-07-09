import type { Transaction } from "@/entities/transaction";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops.js";
import type { PendingClaimItem } from "../model/pending-claim-types.js";
import { getPendingClaimTransactionId } from "./pending-claim-transaction-id.js";

export function mapPendingClaimToTransaction(parameters: {
  claim: PendingClaimItem;
  assetId: string;
}): Transaction {
  const amount = stroopsToDisplayAmount(BigInt(parameters.claim.noteValue));
  return {
    id: getPendingClaimTransactionId(parameters.claim.id),
    date: parameters.claim.createdAt,
    type: "received",
    assetId: parameters.assetId,
    amount,
    counterparty: parameters.claim.poolTxId,
    status: "pending",
    confirmationStatus: "none",
    disclosureStatus: "none",
  };
}
