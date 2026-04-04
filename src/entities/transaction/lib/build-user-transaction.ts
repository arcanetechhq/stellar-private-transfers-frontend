import type { Transaction } from "../model/transaction";

export type UserTransactionFlowType = "deposit" | "sent" | "withdrawal";

export interface BuildUserTransactionInput {
  txId: string;
  type: UserTransactionFlowType;
  assetId: string;
  amount: number;
  counterparty: string;
  senderStealthAddress: string;
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
    senderStealthAddress: input.senderStealthAddress,
    status: "completed",
    confirmationStatus: "none",
    disclosureStatus: "none",
  };
}
