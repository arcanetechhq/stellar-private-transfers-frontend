export type NotificationRecord = {
  id: string;
  type: "deposit" | "withdrawal" | "transfer" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  transactionId?: string;
};

export const MOCK_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: "1",
    type: "deposit",
    title: "Deposit Confirmed",
    message:
      "Your deposit of 5,000 USDC has been confirmed and added to your balance.",
    timestamp: "2 hours ago",
    read: false,
    transactionId: "TXN001",
  },
  {
    id: "2",
    type: "transfer",
    title: "Transfer Completed",
    message: "Successfully sent 0.5 ETH to wallet 0x742d...c8a3",
    timestamp: "5 hours ago",
    read: false,
    transactionId: "TXN002",
  },
  {
    id: "3",
    type: "withdrawal",
    title: "Withdrawal Processing",
    message: "Your withdrawal of 2,500 USDT is being processed.",
    timestamp: "1 day ago",
    read: true,
    transactionId: "TXN003",
  },
  {
    id: "4",
    type: "system",
    title: "Security Alert",
    message: "New login detected from Chrome on macOS.",
    timestamp: "2 days ago",
    read: true,
  },
  {
    id: "5",
    type: "deposit",
    title: "Deposit Received",
    message: "Received 1,000 USDC from wallet 0x893a...f2b1",
    timestamp: "3 days ago",
    read: true,
    transactionId: "TXN004",
  },
];
