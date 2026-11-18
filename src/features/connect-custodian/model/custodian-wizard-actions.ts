import { readFireblocksSession } from "./fireblocks-session";
import { readSigningKey } from "./fireblocks-signing-key";
import type { StellarAssetWallet } from "../api/fireblocks-asset-wallets";
import type { FireblocksEnvironmentId } from "./fireblocks-environment";
import {
  messageForWizardError,
  shouldClearPem,
  signingKeyWasStored,
  type WizardTranslate,
} from "./custodian-wizard-message";
import type {
  CustodianWizardModel,
  SetCustodianWizard,
} from "./custodian-wizard-model";

function patchWizard(
  setModel: SetCustodianWizard,
  patch: Partial<CustodianWizardModel>,
): void {
  setModel((current) => ({
    ...current,
    ...patch,
    errorMessage: undefined,
  }));
}

export function showFireblocksCredentials(setModel: SetCustodianWizard): void {
  const remembered = readFireblocksSession();
  setModel((current) => ({
    ...current,
    step: "credentials",
    errorMessage: undefined,
    apiKey: remembered?.apiKey ?? current.apiKey,
    environmentId: remembered?.environmentId ?? current.environmentId,
  }));
  void readSigningKey()
    .then((signingKey) => {
      setModel((current) => ({
        ...current,
        hasStoredSigningKey: signingKey !== undefined,
      }));
    })
    .catch(() => {
      setModel((current) => ({
        ...current,
        hasStoredSigningKey: false,
      }));
    });
}

export function showPreviousWizardStep(setModel: SetCustodianWizard): void {
  setModel((current) => ({
    ...current,
    step: current.step === "wallets" ? "credentials" : "choice",
    errorMessage: undefined,
    isSubmitting: false,
  }));
}

export function changeWizardApiKey(
  setModel: SetCustodianWizard,
  apiKey: string,
): void {
  patchWizard(setModel, { apiKey });
}

export function changeWizardPem(
  setModel: SetCustodianWizard,
  pemText: string,
): void {
  patchWizard(setModel, { pemText });
}

export function changeWizardEnvironment(
  setModel: SetCustodianWizard,
  environmentId: FireblocksEnvironmentId,
): void {
  patchWizard(setModel, { environmentId });
}

export function selectWizardWallet(
  setModel: SetCustodianWizard,
  walletKey: string,
): void {
  setModel((current) => ({
    ...current,
    selectedWalletKey: walletKey,
    errorMessage: undefined,
  }));
}

export function beginWizardSubmit(setModel: SetCustodianWizard): void {
  setModel((current) => ({
    ...current,
    isSubmitting: true,
    errorMessage: undefined,
  }));
}

export function failWalletSession(input: {
  setModel: SetCustodianWizard;
  error: unknown;
  translate: WizardTranslate;
}): void {
  input.setModel((current) => ({
    ...current,
    isSubmitting: false,
    errorMessage: messageForWizardError(input.error, input.translate),
  }));
}

export function finishCredentialSubmit(
  setModel: SetCustodianWizard,
  wallets: StellarAssetWallet[],
): void {
  setModel((current) => ({
    ...current,
    isSubmitting: false,
    pemText: "",
    wallets,
    selectedWalletKey: undefined,
    step: "wallets",
    errorMessage: undefined,
    hasStoredSigningKey: true,
  }));
}

export function failCredentialSubmit(input: {
  setModel: SetCustodianWizard;
  error: unknown;
  translate: WizardTranslate;
}): void {
  const { setModel, error, translate } = input;
  setModel((current) => ({
    ...current,
    isSubmitting: false,
    pemText: shouldClearPem(error) ? "" : current.pemText,
    errorMessage: messageForWizardError(error, translate),
    hasStoredSigningKey:
      current.hasStoredSigningKey || signingKeyWasStored(error),
  }));
}
