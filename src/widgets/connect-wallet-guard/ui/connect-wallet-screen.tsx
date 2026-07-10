import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectIsWalletConnected } from "@/entities/wallet";
import {
  useWalletOnboarding,
  isStellarTestnet,
  type WalletOnboardingPhase,
} from "@/features/wallet-onboarding";
import {
  TestnetNoticeModal,
  WrongNetworkModal,
  connectFreighterWallet,
  disconnectStellarWallet,
  isWalletPickerUiEnabled,
  useStellarWalletModal,
} from "@/features/stellar-wallet-connect";
import {
  ArcaneConnectScreen,
  type ArcaneConnectScreenPhase,
} from "./arcane-connect-screen";
import {
  acknowledgeTestnetNotice,
  hasAcknowledgedTestnetNotice,
} from "../lib/testnet-notice-ack";

type ConnectWalletScreenProperties = {
  walletKitLoaded: boolean;
};

function resolveConnectScreenPhase(parameters: {
  isWalletConnected: boolean;
  walletKitLoaded: boolean;
  isConnectingFreighter: boolean;
  isPickerOpen: boolean;
  onboardingPhase: WalletOnboardingPhase;
}): ArcaneConnectScreenPhase {
  if (
    !parameters.isWalletConnected ||
    parameters.onboardingPhase === "wrong_network"
  ) {
    if (
      !parameters.isWalletConnected &&
      (!parameters.walletKitLoaded ||
        parameters.isConnectingFreighter ||
        parameters.isPickerOpen)
    ) {
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

  if (parameters.isPickerOpen || parameters.isConnectingFreighter) {
    return "connecting_wallet";
  }

  return "checking";
}

function shouldShowTestnetNotice(): boolean {
  return (
    isWalletPickerUiEnabled &&
    isStellarTestnet() &&
    !hasAcknowledgedTestnetNotice()
  );
}

export function ConnectWalletScreen({
  walletKitLoaded,
}: ConnectWalletScreenProperties) {
  const dispatch = useAppDispatch();
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const { phase, errorMessage, retry } = useWalletOnboarding();
  const { openPicker, isOpen, mode, isWalletConnectInProgress } =
    useStellarWalletModal();
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isConnectingFreighter, setIsConnectingFreighter] = useState(false);
  const isPickerOpen =
    isWalletPickerUiEnabled && isOpen && mode === "picker";
  const isWrongNetwork = phase === "wrong_network";
  const screenPhase = resolveConnectScreenPhase({
    isWalletConnected,
    walletKitLoaded,
    isConnectingFreighter,
    isPickerOpen: isPickerOpen || isWalletConnectInProgress,
    onboardingPhase: phase,
  });

  const connectFreighter = async () => {
    setIsConnectingFreighter(true);
    try {
      await connectFreighterWallet(dispatch);
    } finally {
      setIsConnectingFreighter(false);
    }
  };

  const handleConnectWallet = () => {
    if (shouldShowTestnetNotice()) {
      setIsNoticeOpen(true);
      return;
    }
    if (isWalletPickerUiEnabled) {
      openPicker();
      return;
    }
    void connectFreighter();
  };

  const handleChooseWallet = () => {
    acknowledgeTestnetNotice();
    setIsNoticeOpen(false);
    queueMicrotask(() => {
      if (isWalletPickerUiEnabled) {
        openPicker();
        return;
      }
      void connectFreighter();
    });
  };

  const handleChangeWallet = () => {
    void dispatch(disconnectStellarWallet()).then(() => {
      if (isWalletPickerUiEnabled) {
        openPicker(true);
        return;
      }
      void connectFreighter();
    });
  };

  const handleWrongNetworkOpenChange = (open: boolean) => {
    if (open) {
      return;
    }
    void dispatch(disconnectStellarWallet());
  };

  return (
    <>
      <ArcaneConnectScreen
        phase={screenPhase}
        connectDisabled={!walletKitLoaded}
        isConnectingWallet={
          !walletKitLoaded ||
          isConnectingFreighter ||
          isPickerOpen ||
          isWalletConnectInProgress
        }
        errorMessage={errorMessage}
        onConnectWallet={handleConnectWallet}
        onRetry={retry}
        onChangeWallet={handleChangeWallet}
      />
      {isWalletPickerUiEnabled ? (
        <TestnetNoticeModal
          open={isNoticeOpen}
          onOpenChange={setIsNoticeOpen}
          onChooseWallet={handleChooseWallet}
        />
      ) : null}
      <WrongNetworkModal
        open={isWrongNetwork && !isPickerOpen && !isConnectingFreighter}
        onOpenChange={handleWrongNetworkOpenChange}
        onRetry={retry}
      />
    </>
  );
}
