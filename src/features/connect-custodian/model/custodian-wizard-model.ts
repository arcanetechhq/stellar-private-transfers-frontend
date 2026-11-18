import type { Dispatch, SetStateAction } from "react";
import type { StellarAssetWallet } from "../api/fireblocks-asset-wallets";
import {
  SANDBOX_ENVIRONMENT_ID,
  type FireblocksEnvironmentId,
} from "./fireblocks-environment";

export type CustodianWizardStep = "choice" | "credentials" | "wallets";

export type CustodianWizardModel = {
  step: CustodianWizardStep;
  apiKey: string;
  pemText: string;
  environmentId: FireblocksEnvironmentId;
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
  environmentId: SANDBOX_ENVIRONMENT_ID,
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
  changeEnvironment: (environmentId: FireblocksEnvironmentId) => void;
  submitCredentials: () => void;
  selectWallet: (walletKey: string) => void;
};
