import { useCallback, useState } from "react";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { getPrivacySdkClientOrThrow } from "@/shared/lib/privacy-sdk/transact-context.js";
import { logRegisterPrivateAddressError } from "./register-private-address-flow-error";
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
  const [hasError, setHasError] = useState(false);

  const reset = useCallback(() => {
    setStatus("idle");
    setHasError(false);
  }, []);

  const register = useCallback(async (): Promise<boolean> => {
    const trimmedPublicKey = publicKey?.trim();
    if (!trimmedPublicKey) {
      return false;
    }
    setHasError(false);
    setStatus("creating");
    try {
      const privateAddress = await ensureWalletPrivateAddress();
      setStatus("registering");
      const privacyClient = getPrivacySdkClientOrThrow();
      await privacyClient.registerPrivateAddress({
        owner: trimmedPublicKey,
        walletPublicKey: trimmedPublicKey,
        privateAddressStpl1: privateAddress,
      });
      await refreshRegistryStatus();
      setStatus("success");
      return true;
    } catch (error: unknown) {
      logRegisterPrivateAddressError(error);
      setStatus("error");
      setHasError(true);
      return false;
    }
  }, [publicKey, ensureWalletPrivateAddress, refreshRegistryStatus]);

  return {
    register,
    reset,
    status,
    hasError,
  };
}
