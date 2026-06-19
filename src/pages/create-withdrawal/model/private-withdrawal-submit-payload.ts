export interface SubmitPrivateWithdrawalPayload {
  senderPrivateAddress: string;
  assetId: string;
  tokenContractRaw: string;
  amountDisplay: number;
  destinationAddress: string;
}
