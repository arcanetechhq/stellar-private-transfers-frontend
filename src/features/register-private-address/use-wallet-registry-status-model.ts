import { useCallback, useEffect, useState } from "react";
import { useStore } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/store";
import { usePrivacyPoolServiceConfigured } from "@/shared/hooks/use-privacy-pool-service-configured.js";
import { selectDefaultNonce } from "@/entities/private-address";
import { selectWalletPublicKey } from "@/entities/wallet";
import { DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE } from "@/shared/lib/privacy-sdk/index.js";
import { fetchWalletRegistryStatus } from "./fetch-wallet-registry-status";
import type { WalletRegistryStatus } from "./wallet-private-address-context";

export function useWalletRegistryStatusModel() {
  const dispatch = useAppDispatch();
  const store = useStore();
  const privacyPoolServiceReady = usePrivacyPoolServiceConfigured();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const defaultNonce =
    useAppSelector(selectDefaultNonce) ?? DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE;
  const [registryStatus, setRegistryStatus] =
    useState<WalletRegistryStatus>("checking");
  const [isRegistryLoading, setIsRegistryLoading] = useState(false);

  const refreshRegistryStatus = useCallback(async () => {
    const trimmedPublicKey = publicKey?.trim();
    if (!trimmedPublicKey) {
      setRegistryStatus("checking");
      return;
    }
    setIsRegistryLoading(true);
    setRegistryStatus("checking");
    try {
      const status = await fetchWalletRegistryStatus({
        dispatch,
        getState: store.getState,
        publicKey: trimmedPublicKey,
        defaultNonce,
      });
      setRegistryStatus(status);
    } catch {
      setRegistryStatus("lookup_failed");
    } finally {
      setIsRegistryLoading(false);
    }
  }, [publicKey, dispatch, defaultNonce, store]);

  useEffect(() => {
    if (!privacyPoolServiceReady) {
      return;
    }
    void refreshRegistryStatus();
  }, [refreshRegistryStatus, privacyPoolServiceReady]);

  return {
    registryStatus,
    isRegistryLoading,
    refreshRegistryStatus,
    actionsEnabled: registryStatus === "active",
  };
}
