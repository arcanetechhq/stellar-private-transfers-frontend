import type { AppDispatch, RootState } from "@/store";
import type { Store } from "@reduxjs/toolkit";
import { fetchWalletRegistryStatus } from "@/features/register-private-address";

type EnsureWalletRegistryActiveParameters = {
  dispatch: AppDispatch;
  getState: Store<RootState>["getState"];
  publicKey: string;
  defaultNonce: string;
  registerPrivateAddress: () => Promise<boolean>;
  onStep: (step: "registering") => void;
};

export async function ensureWalletRegistryActive(
  parameters: EnsureWalletRegistryActiveParameters,
): Promise<void> {
  let registryStatus = await fetchWalletRegistryStatus({
    dispatch: parameters.dispatch,
    getState: parameters.getState,
    publicKey: parameters.publicKey,
    defaultNonce: parameters.defaultNonce,
  });

  if (registryStatus === "active") {
    return;
  }

  parameters.onStep("registering");
  const registered = await parameters.registerPrivateAddress();
  if (!registered) {
    throw new Error("Private address registration failed");
  }
  registryStatus = await fetchWalletRegistryStatus({
    dispatch: parameters.dispatch,
    getState: parameters.getState,
    publicKey: parameters.publicKey,
    defaultNonce: parameters.defaultNonce,
  });
  if (registryStatus !== "active") {
    throw new Error("Private address registration failed");
  }
}
