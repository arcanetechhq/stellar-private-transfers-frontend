import type { AppDispatch } from "@/store";

export interface RunPrivateWithdrawalMutationInput {
  dispatch: AppDispatch;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
  senderPrivateAddress: string;
  assetId: string;
  tokenContractRaw: string;
  amountDisplay: number;
  destinationAddress: string;
}

export interface RunPrivateWithdrawalMutationResult {
  txId: string;
  coinDeliveryWarning?: string;
}
