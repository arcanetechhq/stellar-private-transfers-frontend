import { useCallback, useEffect, useMemo, useState } from "react";
import type { DepositAddressMode } from "../lib/deposit-mode";
import {
  DEPOSIT_ADDRESS_GENERATION_DELAY_MS,
  DEPOSIT_NETWORK_OPTIONS,
  PRIVATE_DEPOSIT_ADDRESSES,
  PRIVATE_DEPOSIT_ADDRESS_GENERATION_DELAY_MS,
} from "../lib/deposit-mock-data";

export function useDepositAddressUi(mode: DepositAddressMode) {
  const [networkId, setNetworkId] = useState("base");
  const [addressIndex, setAddressIndex] = useState(0);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [privateAddressByKey, setPrivateAddressByKey] = useState<
    Record<string, string>
  >({});
  const [isPrivateAddressLoading, setIsPrivateAddressLoading] = useState(false);

  const isPrivateAddressMode = mode === "privateAddress";
  const selectedNetwork =
    DEPOSIT_NETWORK_OPTIONS.find((network) => network.id === networkId) ??
    DEPOSIT_NETWORK_OPTIONS[0];
  const activeAddresses = selectedNetwork.addresses.usdc;
  const activeAddress = activeAddresses[addressIndex % activeAddresses.length];
  const canRotateAddress = mode === "address";
  const privateAddressKey = selectedNetwork.id;
  const privateAddressTemplate =
    PRIVATE_DEPOSIT_ADDRESSES[selectedNetwork.id] ??
    PRIVATE_DEPOSIT_ADDRESSES.base;
  const generatedPrivateAddress = privateAddressByKey[privateAddressKey] ?? "";
  const currentDepositAddress = isPrivateAddressMode
    ? generatedPrivateAddress
    : activeAddress;
  const showAddressLoading =
    (canRotateAddress && isAddressLoading) ||
    (isPrivateAddressMode && isPrivateAddressLoading);
  const showPrivateAddressEmpty =
    isPrivateAddressMode &&
    !currentDepositAddress &&
    !showAddressLoading;

  useEffect(() => {
    if (!isAddressLoading) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setAddressIndex((current) => current + 1);
      setIsAddressLoading(false);
    }, DEPOSIT_ADDRESS_GENERATION_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isAddressLoading]);

  useEffect(() => {
    if (!isPrivateAddressLoading) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPrivateAddressByKey((current) => ({
        ...current,
        [privateAddressKey]: privateAddressTemplate,
      }));
      setIsPrivateAddressLoading(false);
    }, PRIVATE_DEPOSIT_ADDRESS_GENERATION_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isPrivateAddressLoading, privateAddressKey, privateAddressTemplate]);

  const selectNetwork = useCallback((nextNetworkId: string) => {
    setIsAddressLoading(false);
    setIsPrivateAddressLoading(false);
    setNetworkId(nextNetworkId);
    setAddressIndex(0);
  }, []);

  const generateNewAddress = useCallback(() => {
    if (isAddressLoading) {
      return;
    }
    setIsAddressLoading(true);
  }, [isAddressLoading]);

  const generatePrivateAddress = useCallback(() => {
    if (isPrivateAddressLoading || currentDepositAddress) {
      return;
    }
    setIsPrivateAddressLoading(true);
  }, [currentDepositAddress, isPrivateAddressLoading]);

  const resetAddressState = useCallback(() => {
    setIsAddressLoading(false);
    setIsPrivateAddressLoading(false);
  }, []);

  return useMemo(
    () => ({
      selectedNetwork,
      currentDepositAddress,
      showAddressLoading,
      showPrivateAddressEmpty,
      canRotateAddress,
      isPrivateAddressMode,
      selectNetwork,
      generateNewAddress,
      generatePrivateAddress,
      resetAddressState,
    }),
    [
      canRotateAddress,
      currentDepositAddress,
      generateNewAddress,
      generatePrivateAddress,
      isPrivateAddressMode,
      resetAddressState,
      selectNetwork,
      selectedNetwork,
      showAddressLoading,
      showPrivateAddressEmpty,
    ],
  );
}
