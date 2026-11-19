import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, type AppDispatch } from "@/store";
import {
  stellarWalletKey,
  type StellarAssetWallet,
} from "../api/fireblocks-asset-wallets";
import {
  applyResumeFailure,
  beginWizardSubmit,
  changeWizardApiKey,
  changeWizardEnvironment,
  changeWizardPem,
  failCredentialSubmit,
  failWalletSession,
  finishCredentialSubmit,
  selectWizardWallet,
  showFireblocksCredentials,
  showPreviousWizardStep,
  wizardModelForResumeFailure,
} from "./custodian-wizard-actions";
import type { WizardTranslate } from "./custodian-wizard-message";
import { FireblocksWizardError } from "./fireblocks-wizard-error";
import {
  isFireblocksTestXlm,
  openCustodianXlmSession,
} from "./open-custodian-xlm-session";
import { readReownProjectId } from "./silent-stellar-session";
import {
  INITIAL_CUSTODIAN_WIZARD,
  type CustodianWizardActions,
  type CustodianWizardModel,
  type SetCustodianWizard,
} from "./custodian-wizard-model";
import { submitCustodianCredentials } from "./submit-custodian-credentials";

function startXlmSession(input: {
  wallet: StellarAssetWallet;
  dispatch: AppDispatch;
  setModel: SetCustodianWizard;
  translate: WizardTranslate;
  onConnected: () => void;
  mounted: { current: boolean };
  running: { current: boolean };
}): void {
  if (input.running.current) {
    return;
  }
  if (!readReownProjectId()) {
    failWalletSession({
      setModel: input.setModel,
      error: new FireblocksWizardError("walletconnect-unconfigured"),
      translate: input.translate,
    });
    return;
  }
  input.running.current = true;
  beginWizardSubmit(input.setModel);
  void openCustodianXlmSession({
    wallet: input.wallet,
    dispatch: input.dispatch,
  })
    .then(() => {
      if (input.mounted.current) {
        input.onConnected();
      }
    })
    .catch((error: unknown) => {
      if (!input.mounted.current) {
        return;
      }
      failWalletSession({
        setModel: input.setModel,
        error,
        translate: input.translate,
      });
    })
    .finally(() => {
      input.running.current = false;
    });
}

function useApplyResumeFailure(input: {
  resumeError: unknown;
  setModel: SetCustodianWizard;
  translate: WizardTranslate;
}): void {
  const { resumeError, setModel, translate } = input;
  useEffect(() => {
    if (resumeError === undefined) {
      return;
    }
    applyResumeFailure({ setModel, error: resumeError, translate });
  }, [resumeError, setModel, translate]);
}

function wizardActions(input: {
  model: CustodianWizardModel;
  setModel: SetCustodianWizard;
  dispatch: AppDispatch;
  translate: WizardTranslate;
  onConnected: () => void;
  mounted: { current: boolean };
  running: { current: boolean };
}): CustodianWizardActions {
  const { model, setModel, dispatch, translate, onConnected, mounted, running } =
    input;
  return {
    chooseFireblocks: () => {
      showFireblocksCredentials(setModel);
    },
    goBack: () => {
      showPreviousWizardStep(setModel);
    },
    changeApiKey: (value) => {
      changeWizardApiKey(setModel, value);
    },
    changePem: (value) => {
      changeWizardPem(setModel, value);
    },
    changeEnvironment: (environmentId) => {
      changeWizardEnvironment(setModel, environmentId);
    },
    submitCredentials: () => {
      beginWizardSubmit(setModel);
      void submitCustodianCredentials({
        apiKey: model.apiKey,
        pemText: model.pemText,
        environmentId: model.environmentId,
      })
        .then((wallets) => {
          finishCredentialSubmit(setModel, wallets);
        })
        .catch((error: unknown) => {
          failCredentialSubmit({ setModel, error, translate });
        });
    },
    selectWallet: (walletKey) => {
      const wallet = model.wallets.find(
        (item) => stellarWalletKey(item) === walletKey,
      );
      selectWizardWallet(setModel, walletKey);
      if (!wallet || !isFireblocksTestXlm(wallet)) {
        return;
      }
      startXlmSession({
        wallet,
        dispatch,
        setModel,
        translate,
        onConnected,
        mounted,
        running,
      });
    },
  };
}

export function useCustodianWizard(
  onConnected: () => void,
  resumeError?: unknown,
): {
  model: CustodianWizardModel;
  actions: CustodianWizardActions;
} {
  const { t: translate } = useTranslation("custodian");
  const wizardTranslate = useMemo<WizardTranslate>(
    () => (key, options) =>
      options === undefined ? translate(key) : translate(key, options),
    [translate],
  );
  const dispatch = useAppDispatch();
  const mounted = useRef(true);
  const running = useRef(false);
  const [model, setModel] = useState(() =>
    resumeError === undefined
      ? INITIAL_CUSTODIAN_WIZARD
      : wizardModelForResumeFailure(resumeError, wizardTranslate),
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useApplyResumeFailure({
    resumeError,
    setModel,
    translate: wizardTranslate,
  });
  return {
    model,
    actions: wizardActions({
      model,
      setModel,
      dispatch,
      translate: wizardTranslate,
      onConnected,
      mounted,
      running,
    }),
  };
}
