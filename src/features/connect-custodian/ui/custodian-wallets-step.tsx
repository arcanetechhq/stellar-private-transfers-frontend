import React from "react";
import { useTranslation } from "react-i18next";
import { stellarWalletKey } from "../api/fireblocks-asset-wallets";
import type {
  CustodianWizardActions,
  CustodianWizardModel,
} from "../model/custodian-wizard-model";

type CustodianWalletsStepProperties = {
  model: CustodianWizardModel;
  actions: CustodianWizardActions;
};

export function CustodianWalletsStep(properties: CustodianWalletsStepProperties) {
  const { t: translate } = useTranslation("custodian");
  const { model, actions } = properties;
  const selectedKey = model.selectedWalletKey;

  return (
    <div className="custodian-wizard__step">
      <h2 id="custodian-wizard-title">{translate("walletsTitle")}</h2>
      <p className="custodian-wizard__hint">{translate("walletsHint")}</p>
      {model.wallets.length === 0 ? (
        <p className="custodian-wizard__empty" data-testid="custodian-wallets-empty">
          {translate("walletsEmpty")}
        </p>
      ) : (
        <ul className="custodian-wallets" data-testid="custodian-wallet-list">
          {model.wallets.map((wallet) => {
            const walletKey = stellarWalletKey(wallet);
            const selected = walletKey === selectedKey;
            return (
              <li key={walletKey}>
                <button
                  type="button"
                  className={
                    selected
                      ? "custodian-wallet custodian-wallet--selected"
                      : "custodian-wallet"
                  }
                  data-testid="custodian-wallet"
                  aria-pressed={selected}
                  disabled={model.isSubmitting}
                  onClick={() => {
                    actions.selectWallet(walletKey);
                  }}
                >
                  <span className="custodian-wallet__asset">{wallet.assetId}</span>
                  <span className="custodian-wallet__address">{wallet.address}</span>
                  <span className="custodian-wallet__available">
                    {translate("availableLabel")} {wallet.available}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {model.isSubmitting ? (
        <p data-testid="custodian-session-opening">{translate("sessionOpening")}</p>
      ) : undefined}
      {model.errorMessage ? (
        <p className="custodian-wizard__error" role="alert" data-testid="custodian-error">
          {model.errorMessage}
        </p>
      ) : undefined}
      {selectedKey && !model.isSubmitting && !model.errorMessage ? (
        <p className="custodian-wizard__selected" data-testid="custodian-wallet-selected">
          {translate("walletSelected")}
        </p>
      ) : undefined}
      <div className="custodian-wizard__actions">
        <button
          type="button"
          className="custodian-wizard__secondary"
          onClick={actions.goBack}
          disabled={model.isSubmitting}
        >
          {translate("back")}
        </button>
      </div>
    </div>
  );
}
