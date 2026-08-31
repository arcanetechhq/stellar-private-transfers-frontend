import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey, selectIsWalletKitLoaded } from "@/entities/wallet";
import { useWalletPrivateAddress } from "@/features/register-private-address";
import { useStellarWalletModal } from "@/features/stellar-wallet-connect";
import { usePrivacyPoolServiceConfigured } from "@/shared/hooks/use-privacy-pool-service-configured.js";
import { usePrivacySdkBootstrapError } from "@/shared/hooks/use-privacy-sdk-bootstrap-error.js";
import { isWalletNetworkMismatchError } from "../lib/wallet-network-mismatch-error";
import { runWalletOnboardingFlow } from "../lib/run-wallet-onboarding-flow";
import { syncWalletOnboardingPhase } from "../lib/sync-wallet-onboarding-phase";
import {
  WalletOnboardingContext,
  type WalletOnboardingContextValue,
  type WalletOnboardingPhase,
} from "./wallet-onboarding-context";

type WalletOnboardingProviderProperties = {
  children: ReactNode;
};

type OnboardingBlock = {
  publicKey: string;
  kind: "error" | "wrong_network";
  message?: string;
};

function mapFlowStepToPhase(
  step: "checking" | "funding" | "ready",
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
  const publicKey = useAppSelector(selectWalletPublicKey);
  const isWalletKitLoaded = useAppSelector(selectIsWalletKitLoaded);
  const privacyPoolServiceReady = usePrivacyPoolServiceConfigured();
  const bootstrapError = usePrivacySdkBootstrapError();
  const { refreshRegistryStatus } = useWalletPrivateAddress();
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
  const onboardingBlockReference = useRef<OnboardingBlock | undefined>(
    undefined,
  );

  const clearOnboardingBlock = useCallback(() => {
    onboardingBlockReference.current = undefined;
  }, []);

  const blockOnboarding = useCallback((block: OnboardingBlock) => {
    onboardingBlockReference.current = block;
  }, []);

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
      clearOnboardingBlock();
      setErrorMessage(undefined);

      if (parameters.blocking) {
        setPhase("checking");
      }

      try {
        await runWalletOnboardingFlow({
          dispatch,
          publicKey: trimmedPublicKey,
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
        clearOnboardingBlock();
        setReadyPublicKey(trimmedPublicKey);
        setPhase("ready");
        setHasUnlockedApp(true);
      } catch (error: unknown) {
        if (runReference.current !== runId) {
          return;
        }
        if (!parameters.blocking) {
          return;
        }
        if (isWalletNetworkMismatchError(error)) {
          blockOnboarding({
            publicKey: trimmedPublicKey,
            kind: "wrong_network",
          });
          setPhase("wrong_network");
          setErrorMessage(undefined);
          return;
        }
        const message =
          error instanceof Error ? error.message : "Wallet setup failed";
        blockOnboarding({
          publicKey: trimmedPublicKey,
          kind: "error",
          message,
        });
        setPhase("error");
        setErrorMessage(message);
      }
    },
    [
      blockOnboarding,
      clearOnboardingBlock,
      dispatch,
      refreshRegistryStatus,
    ],
  );

  const retry = useCallback(() => {
    if (bootstrapError) {
      globalThis.location.reload();
      return;
    }
    const trimmedPublicKey = publicKey?.trim();
    if (!trimmedPublicKey || !privacyPoolServiceReady) {
      return;
    }
    clearOnboardingBlock();
    void runOnboarding({ blocking: true, targetPublicKey: trimmedPublicKey });
  }, [
    bootstrapError,
    clearOnboardingBlock,
    publicKey,
    privacyPoolServiceReady,
    runOnboarding,
  ]);

  useEffect(() => {
    syncWalletOnboardingPhase({
      publicKey,
      bootstrapError,
      privacyPoolServiceReady,
      isWalletKitLoaded,
      isWalletConnectInProgress,
      isWalletPickerOpen,
      readyPublicKey,
      hasUnlockedApp,
      onboardingBlock: onboardingBlockReference.current,
      runReference,
      clearOnboardingBlock,
      setPhase,
      setErrorMessage,
      setReadyPublicKey,
      setHasUnlockedApp,
      runOnboarding,
    });
  }, [
    publicKey,
    bootstrapError,
    privacyPoolServiceReady,
    isWalletKitLoaded,
    isWalletConnectInProgress,
    isWalletPickerOpen,
    readyPublicKey,
    hasUnlockedApp,
    clearOnboardingBlock,
    runOnboarding,
  ]);

  const value = useMemo((): WalletOnboardingContextValue => {
    const trimmedPublicKey = publicKey?.trim();
    const isOnboardedForWallet =
      Boolean(trimmedPublicKey) &&
      readyPublicKey === trimmedPublicKey &&
      phase === "ready";
    const isBlockedPhase =
      phase === "error" || phase === "wrong_network";
    const canEnterApp = Boolean(
      trimmedPublicKey &&
        (isOnboardedForWallet || (hasUnlockedApp && !isBlockedPhase)),
    );
    const shouldShowMainApp = Boolean(
      canEnterApp ||
        (trimmedPublicKey && hasUnlockedApp && isWalletConnectInProgress),
    );

    return {
      phase,
      canEnterApp,
      shouldShowMainApp,
      errorMessage,
      retry,
    };
  }, [
    phase,
    errorMessage,
    retry,
    publicKey,
    readyPublicKey,
    hasUnlockedApp,
    isWalletConnectInProgress,
  ]);

  return (
    <WalletOnboardingContext.Provider value={value}>
      {children}
    </WalletOnboardingContext.Provider>
  );
}
