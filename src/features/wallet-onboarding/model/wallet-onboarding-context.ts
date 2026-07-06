import { createContext, useContext } from "react";

export type WalletOnboardingPhase =
  | "idle"
  | "checking"
  | "funding"
  | "registering"
  | "ready"
  | "error";

export type WalletOnboardingContextValue = {
  phase: WalletOnboardingPhase;
  canEnterApp: boolean;
  errorMessage: string | undefined;
  retry: () => void;
};

export const WalletOnboardingContext = createContext<
  WalletOnboardingContextValue | undefined
>(undefined);

export function useWalletOnboarding(): WalletOnboardingContextValue {
  const context = useContext(WalletOnboardingContext);
  if (!context) {
    throw new Error(
      "useWalletOnboarding must be used within WalletOnboardingProvider",
    );
  }
  return context;
}
