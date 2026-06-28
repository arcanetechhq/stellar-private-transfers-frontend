import { useCallback, useState } from "react";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { registerPrivateAddressOnChain } from "@/shared/lib/registry/register-private-address-on-chain";
import {
  getDefaultStellarNetworkConfig,
  getRequiredPrivateAddressRegistryContractId,
} from "@/shared/stellar/stellar-network-environment";
import { useWalletPrivateAddress } from "./wallet-private-address-context";

export type RegisterPrivateAddressFlowStatus =
  | "idle"
  | "creating"
  | "registering"
  | "success"
  | "error";

export function useRegisterWalletPrivateAddress() {
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { ensureWalletPrivateAddress, refreshRegistryStatus } =
    useWalletPrivateAddress();
  const [status, setStatus] = useState<RegisterPrivateAddressFlowStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const register = useCallback(async (): Promise<boolean> => {
    const trimmedPublicKey = publicKey?.trim();
    if (!trimmedPublicKey) {
      return false;
    }
    setErrorMessage(undefined);
    setStatus("creating");
    try {
      const privateAddress = await ensureWalletPrivateAddress();
      setStatus("registering");
      const { networkPassphrase, sorobanRpcUrl } =
        getDefaultStellarNetworkConfig();
      await registerPrivateAddressOnChain({
        registryContractId: getRequiredPrivateAddressRegistryContractId(),
        walletPublicKey: trimmedPublicKey,
        privateAddressStpl1: privateAddress,
        networkPassphrase,
        sorobanRpcUrl,
      });
      await refreshRegistryStatus();
      setStatus("success");
      return true;
    } catch (error: unknown) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Registration failed",
      );
      return false;
    }
  }, [publicKey, ensureWalletPrivateAddress, refreshRegistryStatus]);

  return {
    register,
    status,
    errorMessage,
  };
}
