import { useAppSelector } from "@/store";
import { selectIsWalletConnected } from "@/entities/wallet";
import {
  useWalletOnboarding,
  type WalletOnboardingPhase,
} from "@/features/wallet-onboarding";
import { useStellarWalletModal } from "@/features/stellar-wallet-connect";
import {
  ArcaneConnectScreen,
  type ArcaneConnectScreenPhase,
} from "./arcane-connect-screen";

type ConnectWalletScreenProperties = {
  walletKitLoaded: boolean;
};

function resolveConnectScreenPhase(parameters: {
  isWalletConnected: boolean;
  walletKitLoaded: boolean;
  isPickerOpen: boolean;
  onboardingPhase: WalletOnboardingPhase;
}): ArcaneConnectScreenPhase {
  if (!parameters.isWalletConnected) {
    if (!parameters.walletKitLoaded || parameters.isPickerOpen) {
      return "connecting_wallet";
    }
    return "prompt";
  }

  if (parameters.onboardingPhase === "error") {
    return "error";
  }

  if (parameters.onboardingPhase === "funding") {
    return "funding";
  }

  if (parameters.onboardingPhase === "registering") {
    return "registering";
  }

  if (
    parameters.onboardingPhase === "checking" ||
    parameters.onboardingPhase === "idle"
  ) {
    return "checking";
  }

  if (parameters.isPickerOpen) {
    return "connecting_wallet";
  }

  return "checking";
}

export function ConnectWalletScreen({
  walletKitLoaded,
}: ConnectWalletScreenProperties) {
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const { phase, errorMessage, retry } = useWalletOnboarding();
  const { openPicker, isOpen, mode, isWalletConnectInProgress } =
    useStellarWalletModal();
  const isPickerOpen = isOpen && mode === "picker";
  const screenPhase = resolveConnectScreenPhase({
    isWalletConnected,
    walletKitLoaded,
    isPickerOpen: isPickerOpen || isWalletConnectInProgress,
    onboardingPhase: phase,
  });

  return (
    <ArcaneConnectScreen
      phase={screenPhase}
      connectDisabled={!walletKitLoaded}
      isConnectingWallet={
        !walletKitLoaded || isPickerOpen || isWalletConnectInProgress
      }
      errorMessage={errorMessage}
      onConnectWallet={() => {
        openPicker();
      }}
      onRetry={retry}
    />
  );
}
