import type { Dispatch, SetStateAction } from "react";
import type { StellarAssetWallet } from "./stellar-asset-wallet";

export type CustodianWizardStep = "choice" | "credentials" | "wallets";

export type CustodianWizardModel = {
  step: CustodianWizardStep;
  apiKey: string;
  pemText: string;
  wallets: StellarAssetWallet[];
  selectedWalletKey: string | undefined;
  errorMessage: string | undefined;
  isSubmitting: boolean;
  hasStoredSigningKey: boolean;
};

export const INITIAL_CUSTODIAN_WIZARD: CustodianWizardModel = {
  step: "choice",
  apiKey: "",
  pemText: "",
  wallets: [],
  selectedWalletKey: undefined,
  errorMessage: undefined,
  isSubmitting: false,
  hasStoredSigningKey: false,
};

export type SetCustodianWizard = Dispatch<SetStateAction<CustodianWizardModel>>;

export type CustodianWizardActions = {
  chooseFireblocks: () => void;
  goBack: () => void;
  changeApiKey: (value: string) => void;
  changePem: (value: string) => void;
  submitCredentials: () => void;
  selectWallet: (walletKey: string) => void;
};
