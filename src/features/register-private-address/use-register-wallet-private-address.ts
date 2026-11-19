import { useCallback, useState } from "react";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { getPrivacySdkClientOrThrow } from "@/shared/lib/privacy-sdk/transact-context.js";
import {
  formatRegisterPrivateAddressError,
  logRegisterPrivateAddressError,
} from "./register-private-address-flow-error";
import { useWalletPrivateAddress } from "./wallet-private-address-context";

export type RegisterPrivateAddressFlowStatus =
  | "idle"
  | "creating"
  | "registering"
  | "success"
  | "error";

export function useRegisterWalletPrivateAddress() {
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { ensureWalletPrivateAddress, ensureWalletScalar, refreshRegistryStatus } =
    useWalletPrivateAddress();
  const [status, setStatus] = useState<RegisterPrivateAddressFlowStatus>("idle");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const reset = useCallback(() => {
    setStatus("idle");
    setHasError(false);
    setErrorMessage("");
  }, []);

  const register = useCallback(async (): Promise<boolean> => {
    const trimmedPublicKey = publicKey?.trim();
    if (!trimmedPublicKey) {
      return false;
    }
    setHasError(false);
    setErrorMessage("");
    setStatus("creating");
    try {
      const privateAddress = await ensureWalletPrivateAddress();
      const spendScalarHex = await ensureWalletScalar();
      setStatus("registering");
      const privacyClient = getPrivacySdkClientOrThrow();
      await privacyClient.registerPrivateAddress({
        owner: trimmedPublicKey,
        walletPublicKey: trimmedPublicKey,
        privateAddressStpl1: privateAddress,
        spendScalarHex,
      });
      await refreshRegistryStatus();
      setStatus("success");
      return true;
    } catch (error: unknown) {
      logRegisterPrivateAddressError(error);
      setStatus("error");
      setHasError(true);
      setErrorMessage(formatRegisterPrivateAddressError(error));
      throw error;
    }
  }, [
    publicKey,
    ensureWalletPrivateAddress,
    ensureWalletScalar,
    refreshRegistryStatus,
  ]);

  return {
    register,
    reset,
    status,
    hasError,
    errorMessage,
  };
}
