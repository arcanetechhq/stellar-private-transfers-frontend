import { useAppSelector } from "@/store";
import { selectIsWalletConnected } from "@/entities/wallet";
import {
  isWalletRegistryChecking,
  useWalletPrivateAddress,
} from "@/features/register-private-address";
import { useStellarWalletModal } from "@/features/stellar-wallet-connect";
import { ArcaneConnectScreen } from "./arcane-connect-screen";

type ConnectWalletScreenProperties = {
  walletKitLoaded: boolean;
};

export function ConnectWalletScreen({
  walletKitLoaded,
}: ConnectWalletScreenProperties) {
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const { registryStatus, isRegistryLoading } = useWalletPrivateAddress();
  const { openPicker, isOpen, mode } = useStellarWalletModal();
  const isPickerOpen = isOpen && mode === "picker";
  const isAccountConnecting =
    isWalletConnected &&
    isWalletRegistryChecking(registryStatus, isRegistryLoading);

  return (
    <ArcaneConnectScreen
      phase={isAccountConnecting ? "connecting" : "prompt"}
      connectDisabled={!walletKitLoaded}
      isConnectingWallet={!walletKitLoaded || isPickerOpen}
      onConnectWallet={() => {
        openPicker();
      }}
    />
  );
}
