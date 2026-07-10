import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectIsWalletConnected } from "@/entities/wallet";
import {
  useWalletOnboarding,
  isStellarTestnet,
  type WalletOnboardingPhase,
} from "@/features/wallet-onboarding";
import {
  FREIGHTER_PRODUCT_URL,
  TestnetNoticeModal,
  WrongNetworkModal,
  connectFreighterWallet,
  disconnectStellarWallet,
  isWalletPickerUiEnabled,
  openFreighterProductUrl,
  resolveFreighterAvailability,
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
  const [isFreighterAvailable, setIsFreighterAvailable] = useState<
    boolean | undefined
  >();
  const [freighterProductUrl, setFreighterProductUrl] = useState(
    FREIGHTER_PRODUCT_URL,
  );
  const isPickerOpen =
    isWalletPickerUiEnabled && isOpen && mode === "picker";
  const isWrongNetwork = phase === "wrong_network";
  const isCheckingFreighter = isFreighterAvailable === undefined;
  const screenPhase = resolveConnectScreenPhase({
    isWalletConnected,
    walletKitLoaded,
    isConnectingFreighter,
    isPickerOpen: isPickerOpen || isWalletConnectInProgress,
    onboardingPhase: phase,
  });

  useEffect(() => {
    if (!walletKitLoaded) {
      return;
    }

    let cancelled = false;

    const refreshFreighterAvailability = () => {
      void resolveFreighterAvailability().then((result) => {
        if (cancelled) {
          return;
        }
        setIsFreighterAvailable(result.isAvailable);
        setFreighterProductUrl(result.productUrl);
      });
    };

    refreshFreighterAvailability();

    const handleWindowFocus = () => {
      refreshFreighterAvailability();
    };

    globalThis.addEventListener("focus", handleWindowFocus);

    return () => {
      cancelled = true;
      globalThis.removeEventListener("focus", handleWindowFocus);
    };
  }, [walletKitLoaded]);

  const connectFreighter = async () => {
    setIsConnectingFreighter(true);
    try {
      await connectFreighterWallet(dispatch);
    } finally {
      setIsConnectingFreighter(false);
    }
  };

  const handleConnectOrInstallFreighter = () => {
    if (isFreighterAvailable === false) {
      openFreighterProductUrl(freighterProductUrl);
      return;
    }
    void connectFreighter();
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
    handleConnectOrInstallFreighter();
  };

  const handleChooseWallet = () => {
    acknowledgeTestnetNotice();
    setIsNoticeOpen(false);
    queueMicrotask(() => {
      if (isWalletPickerUiEnabled) {
        openPicker();
        return;
      }
      handleConnectOrInstallFreighter();
    });
  };

  const handleChangeWallet = () => {
    void dispatch(disconnectStellarWallet()).then(() => {
      if (isWalletPickerUiEnabled) {
        openPicker(true);
        return;
      }
      handleConnectOrInstallFreighter();
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
        connectDisabled={!walletKitLoaded || isCheckingFreighter}
        isConnectingWallet={
          !walletKitLoaded ||
          isConnectingFreighter ||
          isPickerOpen ||
          isWalletConnectInProgress
        }
        isFreighterAvailable={isFreighterAvailable !== false}
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
