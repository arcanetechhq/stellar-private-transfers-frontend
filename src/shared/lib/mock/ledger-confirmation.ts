export interface Confirmation {
  id: string;
  transactionId: string;
  type: "transaction_proof" | "amount_proof" | "full_disclosure";
  createdDate: string;
  sentTo?: string;
  status: "created" | "sent" | "viewed" | "used";
}

export const mockConfirmations: Confirmation[] = [
  {
    id: "conf_001",
    transactionId: "tx_001",
    type: "transaction_proof",
    createdDate: "2026-03-10T10:35:00",
    status: "created",
  },
  {
    id: "conf_002",
    transactionId: "tx_002",
    type: "amount_proof",
    createdDate: "2026-03-09T14:20:00",
    sentTo: "partner@example.com",
    status: "sent",
  },
  {
    id: "conf_003",
    transactionId: "tx_003",
    type: "full_disclosure",
    createdDate: "2026-03-08T09:50:00",
    sentTo: "auditor@example.com",
    status: "viewed",
  },
];
