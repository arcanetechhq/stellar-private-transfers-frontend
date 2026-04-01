export interface DisclosureRequest {
  id: string;
  transactionId: string;
  requestor: string;
  requestDate: string;
  requestType: "partial" | "full";
  status: "pending" | "approved" | "rejected";
  expiry?: string;
}

export const mockDisclosureRequests: DisclosureRequest[] = [
  {
    id: "dr_001",
    transactionId: "tx_004",
    requestor: "Regulator ABC",
    requestDate: "2026-03-09T10:00:00",
    requestType: "partial",
    status: "pending",
  },
  {
    id: "dr_002",
    transactionId: "tx_002",
    requestDate: "2026-03-08T15:30:00",
    requestor: "Counterparty XYZ",
    requestType: "full",
    status: "approved",
    expiry: "2026-04-08",
  },
];
