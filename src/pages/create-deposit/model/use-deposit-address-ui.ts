import { useMemo } from "react";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import {
  DEPOSIT_NETWORK_OPTIONS,
  WALLET_DEPOSIT_NETWORK_ID,
} from "../lib/deposit-mock-data";
import { buildDepositTransferLink } from "../lib/build-deposit-transfer-link";

export function useDepositAddressUi() {
  const publicKey = useAppSelector(selectWalletPublicKey)?.trim() ?? "";

  const selectedNetwork =
    DEPOSIT_NETWORK_OPTIONS.find(
      (network) => network.id === WALLET_DEPOSIT_NETWORK_ID,
    ) ?? DEPOSIT_NETWORK_OPTIONS[0];
  const transferLink = publicKey ? buildDepositTransferLink(publicKey) : "";

  return useMemo(
    () => ({
      selectedNetwork,
      publicAddress: publicKey,
      transferLink,
    }),
    [publicKey, selectedNetwork, transferLink],
  );
}
