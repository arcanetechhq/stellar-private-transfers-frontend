export type PrivateWithdrawalSuccess = {
  txId: string;
  amount: number;
  assetId: string;
  destination: string;
  poolContract: string;
  coinDeliveryWarning?: string;
};
