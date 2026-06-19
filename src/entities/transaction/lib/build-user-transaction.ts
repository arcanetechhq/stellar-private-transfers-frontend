import type { Transaction } from "../model/transaction";

export type UserTransactionFlowType =
  | "deposit"
  | "received"
  | "sent"
  | "withdrawal";

export interface BuildUserTransactionInput {
  txId: string;
  type: UserTransactionFlowType;
  assetId: string;
  amount: number;
  counterparty: string;
  senderPrivateAddress: string;
}

export function buildUserTransaction(
  input: BuildUserTransactionInput,
): Transaction {
  return {
    id: input.txId,
    date: new Date().toISOString(),
    type: input.type,
    assetId: input.assetId,
    amount: input.amount,
    counterparty: input.counterparty,
    senderPrivateAddress: input.senderPrivateAddress,
    status: "completed",
    confirmationStatus: "none",
    disclosureStatus: "none",
  };
}
