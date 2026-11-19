import { readFireblocksSession } from "./fireblocks-session";
import type { StellarAssetWallet } from "./stellar-asset-wallet";
import {
  messageForWizardError,
  shouldClearPem,
  type WizardTranslate,
} from "./custodian-wizard-message";
import {
  INITIAL_CUSTODIAN_WIZARD,
  type CustodianWizardModel,
  type SetCustodianWizard,
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
    hasStoredSigningKey: remembered?.pemAccepted === true,
  }));
}

export function wizardModelForResumeFailure(
  error: unknown,
  translate: WizardTranslate,
): CustodianWizardModel {
  const remembered = readFireblocksSession();
  return {
    ...INITIAL_CUSTODIAN_WIZARD,
    step: "credentials",
    apiKey: remembered?.apiKey ?? "",
    hasStoredSigningKey: remembered?.pemAccepted === true,
    errorMessage: messageForWizardError(error, translate),
  };
}

export function applyResumeFailure(input: {
  setModel: SetCustodianWizard;
  error: unknown;
  translate: WizardTranslate;
}): void {
  input.setModel(wizardModelForResumeFailure(input.error, input.translate));
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

export function lockWizardWallet(
  setModel: SetCustodianWizard,
  walletKey: string,
): void {
  setModel((current) => ({
    ...current,
    selectedWalletKey: walletKey,
    isSubmitting: true,
    errorMessage: undefined,
  }));
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
  }));
}
