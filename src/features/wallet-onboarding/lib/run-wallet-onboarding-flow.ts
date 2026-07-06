import type { AppDispatch, RootState } from "@/store";
import type { Store } from "@reduxjs/toolkit";
import { selectDefaultNonce } from "@/entities/private-address";
import { DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE } from "@/shared/lib/private-address/privacy-pool-sdk-private-address";
import { claimNativeFaucetThunk } from "@/features/faucet";
import { fetchWalletRegistryStatus } from "@/features/register-private-address";
import { isStellarTestnet } from "./is-stellar-testnet";
import {
  needsNativeXlmFunding,
  readNativeXlmBalance,
} from "./read-native-xlm-balance";
import { waitForNativeXlmFunding } from "./wait-for-native-xlm-funding";

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

const NATIVE_ASSET_ID = "xlm";

export async function runWalletOnboardingFlow(
  parameters: RunWalletOnboardingFlowParameters,
): Promise<void> {
  const trimmedPublicKey = parameters.publicKey.trim();
  if (!trimmedPublicKey) {
    throw new Error("Wallet not connected");
  }

  parameters.onStep("checking");

  if (isStellarTestnet()) {
    const balance = await readNativeXlmBalance(trimmedPublicKey);
    if (needsNativeXlmFunding(balance)) {
      parameters.onStep("funding");
      await parameters
        .dispatch(
          claimNativeFaucetThunk({
            publicKey: trimmedPublicKey,
            assetId: NATIVE_ASSET_ID,
          }),
        )
        .unwrap();
      await waitForNativeXlmFunding(trimmedPublicKey);
    }
  }

  const defaultNonce =
    selectDefaultNonce(parameters.getState()) ??
    DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE;
  let registryStatus = await fetchWalletRegistryStatus({
    dispatch: parameters.dispatch,
    getState: parameters.getState,
    publicKey: trimmedPublicKey,
    defaultNonce,
  });

  if (registryStatus !== "active") {
    parameters.onStep("registering");
    const registered = await parameters.registerPrivateAddress();
    if (!registered) {
      throw new Error("Private address registration failed");
    }
    registryStatus = await fetchWalletRegistryStatus({
      dispatch: parameters.dispatch,
      getState: parameters.getState,
      publicKey: trimmedPublicKey,
      defaultNonce,
    });
    if (registryStatus !== "active") {
      throw new Error("Private address registration failed");
    }
  }

  parameters.onStep("ready");
}
