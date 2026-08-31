import type { WalletOnboardingPhase } from "../model/wallet-onboarding-context";

type OnboardingBlock = {
  publicKey: string;
  kind: "error" | "wrong_network";
  message?: string;
};

type SyncWalletOnboardingPhaseInput = {
  publicKey: string | undefined;
  bootstrapError: string | undefined;
  privacyPoolServiceReady: boolean;
  isWalletKitLoaded: boolean;
  isWalletConnectInProgress: boolean;
  isWalletPickerOpen: boolean;
  readyPublicKey: string | undefined;
  hasUnlockedApp: boolean;
  onboardingBlock: OnboardingBlock | undefined;
  runReference: { current: number };
  clearOnboardingBlock: () => void;
  setPhase: (phase: WalletOnboardingPhase) => void;
  setErrorMessage: (message: string | undefined) => void;
  setReadyPublicKey: (publicKey: string | undefined) => void;
  setHasUnlockedApp: (unlocked: boolean) => void;
  runOnboarding: (parameters: {
    blocking: boolean;
    targetPublicKey: string;
  }) => void;
};

function applyBootstrapError(input: SyncWalletOnboardingPhaseInput): boolean {
  if (!input.bootstrapError) {
    return false;
  }
  input.setPhase("error");
  input.setErrorMessage(input.bootstrapError);
  return true;
}

function resetDisconnectedWallet(
  input: SyncWalletOnboardingPhaseInput,
  trimmedPublicKey: string | undefined,
): boolean {
  if (trimmedPublicKey) {
    return false;
  }
  input.runReference.current += 1;
  input.clearOnboardingBlock();
  input.setPhase("idle");
  input.setReadyPublicKey(undefined);
  input.setHasUnlockedApp(false);
  input.setErrorMessage(undefined);
  return true;
}

function waitForPrivacyPool(input: SyncWalletOnboardingPhaseInput): boolean {
  if (input.privacyPoolServiceReady) {
    return false;
  }
  if (!input.hasUnlockedApp) {
    input.setPhase("checking");
  }
  return true;
}

function waitForWalletKit(input: SyncWalletOnboardingPhaseInput): boolean {
  if (
    input.isWalletKitLoaded &&
    !input.isWalletConnectInProgress &&
    !input.isWalletPickerOpen
  ) {
    return false;
  }
  if (input.isWalletPickerOpen) {
    input.runReference.current += 1;
  }
  return true;
}

function runOrRestoreOnboarding(
  input: SyncWalletOnboardingPhaseInput,
  trimmedPublicKey: string,
): void {
  const onboardingBlock = input.onboardingBlock;
  if (onboardingBlock && onboardingBlock.publicKey === trimmedPublicKey) {
    input.setPhase(onboardingBlock.kind);
    input.setErrorMessage(onboardingBlock.message);
    return;
  }
  if (input.readyPublicKey === trimmedPublicKey) {
    input.setPhase("ready");
    return;
  }
  input.runOnboarding({
    blocking: !input.hasUnlockedApp,
    targetPublicKey: trimmedPublicKey,
  });
}

export function syncWalletOnboardingPhase(
  input: SyncWalletOnboardingPhaseInput,
): void {
  const trimmedPublicKey = input.publicKey?.trim();
  if (applyBootstrapError(input)) {
    return;
  }
  if (resetDisconnectedWallet(input, trimmedPublicKey)) {
    return;
  }
  if (waitForPrivacyPool(input)) {
    return;
  }
  if (waitForWalletKit(input)) {
    return;
  }
  if (!trimmedPublicKey) {
    return;
  }
  runOrRestoreOnboarding(input, trimmedPublicKey);
}
