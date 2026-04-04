import type { AppDispatch } from "@/app/store";
import type { CoinWithMetadata } from "@/entities/coin";

export interface RunPrivateWithdrawalMutationInput {
  dispatch: AppDispatch;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
  senderStealthAddress: string;
  assetId: string;
  poolContractRaw: string;
  amountDisplay: number;
  destinationAddress: string;
  pickedCoins: CoinWithMetadata[];
}

export interface RunPrivateWithdrawalMutationResult {
  txId: string;
  coinDeliveryWarning?: string;
}
