export interface SubmitPrivateWithdrawalPayload {
  senderStealthAddress: string;
  assetId: string;
  tokenContractRaw: string;
  amountDisplay: number;
  destinationAddress: string;
}
