import type { AppDispatch, RootState } from "@/store";
import type { Store } from "@reduxjs/toolkit";
import { selectDefaultNonce } from "@/entities/private-address";
import { DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE } from "@/shared/lib/privacy-sdk/index.js";
import { ensureTestnetNativeFunding } from "./ensure-testnet-native-funding";
import { ensureWalletRegistryActive } from "./ensure-wallet-registry-active";

export type WalletOnboardingFlowPhase =
  | "checking"
  | "funding"
  | "registering";

export type WalletOnboardingFlowStep = WalletOnboardingFlowPhase | "ready";

type RunWalletOnboardingFlowParameters = {
  dispatch: AppDispatch;
  getState: Store<RootState>["getState"];
  publicKey: string;
  registerPrivateAddress: () => Promise<boolean>;
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

  await ensureTestnetNativeFunding({
    dispatch: parameters.dispatch,
    publicKey: trimmedPublicKey,
    onStep: parameters.onStep,
  });

  const defaultNonce =
    selectDefaultNonce(parameters.getState()) ??
    DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE;
  await ensureWalletRegistryActive({
    dispatch: parameters.dispatch,
    getState: parameters.getState,
    publicKey: trimmedPublicKey,
    defaultNonce,
    registerPrivateAddress: parameters.registerPrivateAddress,
    onStep: parameters.onStep,
  });

  parameters.onStep("ready");
}
