import type { AppDispatch } from "@/store";
import type { Store } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { ensurePrivateAddressScalarForNonce } from "@/entities/private-address";
import { lookupWalletRegistryStatus } from "@/shared/lib/registry/registry-lookup";
import {
  getDefaultStellarNetworkConfig,
  getRequiredPrivateAddressRegistryContractId,
} from "@/shared/stellar/stellar-network-environment";
import { DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE } from "@/shared/lib/private-address/privacy-pool-sdk-private-address";
import { syncRegisteredWalletPrivateAddress } from "./ensure-wallet-private-address";
import type { WalletRegistryStatus } from "./wallet-private-address-context";

function resolveDefaultNonce(nonce: string | undefined): string {
  return (nonce ?? DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE).trim();
}

async function hydrateDefaultScalar(parameters: {
  dispatch: AppDispatch;
  getState: Store<RootState>["getState"];
  publicKey: string;
  nonce: string;
}): Promise<void> {
  const trimmedNonce = parameters.nonce.trim();
  if (!trimmedNonce) {
    return;
  }
  const address =
    parameters.getState().privateAddress.byNonce[trimmedNonce]?.privateAddress;
  if (!address?.trim()) {
    return;
  }
  await ensurePrivateAddressScalarForNonce({
    dispatch: parameters.dispatch,
    getState: parameters.getState,
    publicKey: parameters.publicKey,
    nonce: trimmedNonce,
  });
}

export async function fetchWalletRegistryStatus(parameters: {
  dispatch: AppDispatch;
  getState: Store<RootState>["getState"];
  publicKey: string;
  defaultNonce?: string;
}): Promise<WalletRegistryStatus> {
  const trimmedPublicKey = parameters.publicKey.trim();
  const defaultNonce = resolveDefaultNonce(parameters.defaultNonce);
  const { networkPassphrase, sorobanRpcUrl } = getDefaultStellarNetworkConfig();
  const lookup = await lookupWalletRegistryStatus({
    registryContractId: getRequiredPrivateAddressRegistryContractId(),
    walletPublicKey: trimmedPublicKey,
    networkPassphrase,
    sorobanRpcUrl,
  });
  if (lookup.status === "registered") {
    syncRegisteredWalletPrivateAddress({
      dispatch: parameters.dispatch,
      publicKey: trimmedPublicKey,
      lookup,
      nonce: defaultNonce,
    });
    await hydrateDefaultScalar({
      dispatch: parameters.dispatch,
      getState: parameters.getState,
      publicKey: trimmedPublicKey,
      nonce: defaultNonce,
    });
    return "active";
  }
  return "unregistered";
}
