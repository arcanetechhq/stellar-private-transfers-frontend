import type { AppDispatch } from "@/store";
import { ensureTestnetNativeFunding } from "./ensure-testnet-native-funding";
import { ensureWalletNetworkMatchesApp } from "./ensure-wallet-network-matches-app";

export type WalletOnboardingFlowPhase = "checking" | "funding";

export type WalletOnboardingFlowStep = WalletOnboardingFlowPhase | "ready";

type RunWalletOnboardingFlowParameters = {
  dispatch: AppDispatch;
  publicKey: string;
  onStep: (step: WalletOnboardingFlowStep) => void;
};

export async function runWalletOnboardingFlow(
  parameters: RunWalletOnboardingFlowParameters,
): Promise<void> {
  const trimmedPublicKey = parameters.publicKey.trim();
  if (!trimmedPublicKey) {
    throw new Error("Wallet not connected");
  }

  parameters.onStep("checking");
  await ensureWalletNetworkMatchesApp();

  await ensureTestnetNativeFunding({
    dispatch: parameters.dispatch,
    publicKey: trimmedPublicKey,
    onStep: parameters.onStep,
  });

  parameters.onStep("ready");
}
