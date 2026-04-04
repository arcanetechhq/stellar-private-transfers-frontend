export interface SubmitPrivateWithdrawalPayload {
  senderStealthAddress: string;
  assetId: string;
  poolContractRaw: string;
  amountDisplay: number;
  destinationAddress: string;
}
