import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useStore } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey, selectIsWalletKitLoaded } from "@/entities/wallet";
import {
  useRegisterWalletPrivateAddress,
  useWalletPrivateAddress,
} from "@/features/register-private-address";
import { useStellarWalletModal } from "@/features/stellar-wallet-connect";
import { usePrivacyPoolServiceConfigured } from "@/shared/hooks/use-privacy-pool-service-configured.js";
import { runWalletOnboardingFlow } from "../lib/run-wallet-onboarding-flow";
import {
  WalletOnboardingContext,
  type WalletOnboardingContextValue,
  type WalletOnboardingPhase,
} from "./wallet-onboarding-context";

type WalletOnboardingProviderProperties = {
  children: ReactNode;
};

function mapFlowStepToPhase(
  step: "checking" | "funding" | "registering" | "ready",
): WalletOnboardingPhase {
  if (step === "ready") {
    return "ready";
  }
  return step;
}

export function WalletOnboardingProvider({
  children,
}: WalletOnboardingProviderProperties) {
  const dispatch = useAppDispatch();
  const store = useStore();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const isWalletKitLoaded = useAppSelector(selectIsWalletKitLoaded);
  const privacyPoolServiceReady = usePrivacyPoolServiceConfigured();
  const { refreshRegistryStatus } = useWalletPrivateAddress();
  const { register } = useRegisterWalletPrivateAddress();
  const {
    isWalletConnectInProgress,
    isOpen: isWalletModalOpen,
    mode: walletModalMode,
  } = useStellarWalletModal();
  const isWalletPickerOpen = isWalletModalOpen && walletModalMode === "picker";
  const [phase, setPhase] = useState<WalletOnboardingPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [hasUnlockedApp, setHasUnlockedApp] = useState(false);
  const [readyPublicKey, setReadyPublicKey] = useState<string | undefined>();
  const runReference = useRef(0);

  const runOnboarding = useCallback(
    async (parameters: {
      blocking: boolean;
      targetPublicKey: string;
    }) => {
      const trimmedPublicKey = parameters.targetPublicKey.trim();
      if (!trimmedPublicKey) {
        return;
      }

      const runId = runReference.current + 1;
      runReference.current = runId;
      setErrorMessage(undefined);

      if (parameters.blocking) {
        setPhase("checking");
      }

      try {
        await runWalletOnboardingFlow({
          dispatch,
          getState: store.getState,
          publicKey: trimmedPublicKey,
          registerPrivateAddress: register,
          onStep: (step) => {
            if (runReference.current !== runId) {
              return;
            }
            if (parameters.blocking) {
              setPhase(mapFlowStepToPhase(step));
            }
          },
        });

        if (runReference.current !== runId) {
          return;
        }

        await refreshRegistryStatus();
        setReadyPublicKey(trimmedPublicKey);
        setPhase("ready");
        setHasUnlockedApp(true);
      } catch (error: unknown) {
        if (runReference.current !== runId) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Wallet setup failed";
        if (parameters.blocking) {
          setPhase("error");
          setErrorMessage(message);
        }
      }
    },
    [dispatch, refreshRegistryStatus, register, store],
  );

  const retry = useCallback(() => {
    const trimmedPublicKey = publicKey?.trim();
    if (!trimmedPublicKey || !privacyPoolServiceReady) {
      return;
    }
    void runOnboarding({ blocking: true, targetPublicKey: trimmedPublicKey });
  }, [publicKey, privacyPoolServiceReady, runOnboarding]);

  useEffect(() => {
    const trimmedPublicKey = publicKey?.trim();
    if (!trimmedPublicKey) {
      runReference.current += 1;
      setPhase("idle");
      setReadyPublicKey(undefined);
      setHasUnlockedApp(false);
      setErrorMessage(undefined);
      return;
    }

    if (!privacyPoolServiceReady) {
      if (!hasUnlockedApp) {
        setPhase("checking");
      }
      return;
    }

    if (!isWalletKitLoaded || isWalletConnectInProgress || isWalletPickerOpen) {
      if (isWalletPickerOpen) {
        runReference.current += 1;
        if (!hasUnlockedApp) {
          setPhase("idle");
          setErrorMessage(undefined);
        }
      }
      return;
    }

    if (readyPublicKey === trimmedPublicKey) {
      setPhase("ready");
      return;
    }

    void runOnboarding({
      blocking: !hasUnlockedApp,
      targetPublicKey: trimmedPublicKey,
    });
  }, [
    publicKey,
    privacyPoolServiceReady,
    isWalletKitLoaded,
    isWalletConnectInProgress,
    isWalletPickerOpen,
    readyPublicKey,
    hasUnlockedApp,
    runOnboarding,
  ]);

  const value = useMemo((): WalletOnboardingContextValue => {
    const trimmedPublicKey = publicKey?.trim();
    const isOnboardedForWallet =
      Boolean(trimmedPublicKey) &&
      readyPublicKey === trimmedPublicKey &&
      phase === "ready";
    const canEnterApp = Boolean(
      trimmedPublicKey &&
        (isOnboardedForWallet || (hasUnlockedApp && phase !== "error")),
    );

    return {
      phase,
      canEnterApp,
      errorMessage,
      retry,
    };
  }, [phase, errorMessage, retry, publicKey, readyPublicKey, hasUnlockedApp]);

  return (
    <WalletOnboardingContext.Provider value={value}>
      {children}
    </WalletOnboardingContext.Provider>
  );
}
