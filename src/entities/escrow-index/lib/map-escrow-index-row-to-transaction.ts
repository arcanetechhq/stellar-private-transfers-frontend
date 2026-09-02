import type { Transaction } from "@/entities/transaction/model/transaction";
import type { EscrowIndexNote } from "../model/escrow-index-types.js";
import { getEscrowIndexTransactionId } from "./escrow-index-transaction-id.js";

export function mapEscrowIndexRowToTransaction(input: {
  note: EscrowIndexNote;
  recipientAddress: string;
}): Transaction {
  return {
    id: getEscrowIndexTransactionId({
      txId: input.note.txId,
      seq: input.note.seq,
    }),
    date: input.note.createdAt,
    type: "received",
    assetId: input.note.poolAddress,
    amount: 0,
    counterparty: input.recipientAddress,
    status: "pending",
    confirmationStatus: "none",
    disclosureStatus: "none",
  };
}
