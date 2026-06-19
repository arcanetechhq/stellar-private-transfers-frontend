import type { OnboardingPayload } from "contract";
import type { AppDispatch } from "@/store";
import type { CoinWithMetadata } from "@/entities/coin";

export interface RunConfidentialTransferInput {
  dispatch: AppDispatch;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
  senderPrivKeyScalarHex: string;
  senderPrivateAddress: string;
  recipientStellarAddress: string;
  recipientPrivateAddressStpl1: string;
  onboarding?: OnboardingPayload;
  assetId: string;
  tokenContractRaw: string;
  amountDisplay: number;
  finalizedCoinsForSenderAndAsset: CoinWithMetadata[];
}

export interface RunConfidentialTransferResult {
  txId: string;
  coinDeliveryWarning?: string;
}
