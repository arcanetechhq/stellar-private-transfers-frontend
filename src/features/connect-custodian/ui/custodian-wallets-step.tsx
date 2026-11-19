import React from "react";
import { useTranslation } from "react-i18next";
import { useGetAssetsQuery, type AssetDto } from "@/entities/asset";
import { AssetRowIcon } from "@/shared/ui/asset-row-icon";
import type {
  CustodianWizardActions,
  CustodianWizardModel,
} from "../model/custodian-wizard-model";
import {
  recognizedCustodianWallets,
  type RecognizedCustodianWallet,
} from "../model/recognized-custodian-asset";
import { stellarWalletKey } from "../model/stellar-asset-wallet";

type CustodianWalletsStepProperties = {
  model: CustodianWizardModel;
  actions: CustodianWizardActions;
};

function walletClassName(selected: boolean): string {
  return selected
    ? "custodian-wallet custodian-wallet--selected"
    : "custodian-wallet";
}

function CustodianWalletButton(properties: {
  wallet: RecognizedCustodianWallet["wallet"];
  asset: AssetDto;
  selected: boolean;
  disabled: boolean;
  availableLabel: string;
  onSelect: (walletKey: string) => void;
}) {
  const walletKey = stellarWalletKey(properties.wallet);
  return (
    <li>
      <button
        type="button"
        className={walletClassName(properties.selected)}
        data-testid="custodian-wallet"
        data-asset-id={properties.wallet.assetId}
        aria-pressed={properties.selected}
        disabled={properties.disabled}
        onClick={() => {
          properties.onSelect(walletKey);
        }}
      >
        <span className="custodian-wallet__icon">
          <AssetRowIcon
            ticker={properties.asset.assetId}
            logoUrl={properties.asset.logoUrl}
          />
        </span>
        <span className="custodian-wallet__asset">
          {properties.asset.assetId}
        </span>
        <span className="custodian-wallet__address">
          {properties.wallet.address}
        </span>
        <span className="custodian-wallet__available">
          {properties.availableLabel} {properties.wallet.available}
        </span>
      </button>
    </li>
  );
}

function CustodianWalletList(properties: {
  pending: boolean;
  wallets: readonly RecognizedCustodianWallet[];
  selectedKey: string | undefined;
  disabled: boolean;
  availableLabel: string;
  emptyLabel: string;
  onSelect: (walletKey: string) => void;
}) {
  if (properties.pending) {
    return <></>;
  }
  if (properties.wallets.length === 0) {
    return (
      <p
        className="custodian-wizard__empty"
        data-testid="custodian-wallets-empty"
      >
        {properties.emptyLabel}
      </p>
    );
  }
  return (
    <ul className="custodian-wallets" data-testid="custodian-wallet-list">
      {properties.wallets.map((entry) => (
        <CustodianWalletButton
          key={stellarWalletKey(entry.wallet)}
          wallet={entry.wallet}
          asset={entry.asset}
          selected={stellarWalletKey(entry.wallet) === properties.selectedKey}
          disabled={properties.disabled}
          availableLabel={properties.availableLabel}
          onSelect={properties.onSelect}
        />
      ))}
    </ul>
  );
}

export function CustodianWalletsStep(
  properties: CustodianWalletsStepProperties,
) {
  const { t: translate } = useTranslation("custodian");
  const { model, actions } = properties;
  const assets = useGetAssetsQuery();
  const recognized =
    assets.data === undefined
      ? []
      : recognizedCustodianWallets(model.wallets, assets.data);
  const stepClassName = model.isSubmitting
    ? "custodian-wizard__step custodian-wizard__step--locked"
    : "custodian-wizard__step";

  return (
    <>
      <div className={stepClassName} aria-busy={model.isSubmitting}>
        <h2 id="custodian-wizard-title">{translate("walletsTitle")}</h2>
        <p className="custodian-wizard__hint">{translate("walletsHint")}</p>
        <CustodianWalletList
          pending={assets.data === undefined && assets.isError !== true}
          wallets={recognized}
          selectedKey={model.selectedWalletKey}
          disabled={model.isSubmitting}
          availableLabel={translate("availableLabel")}
          emptyLabel={translate("walletsEmpty")}
          onSelect={actions.selectWallet}
        />
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
      {model.isSubmitting ? (
        <p data-testid="custodian-session-opening">
          {translate("sessionOpening")}
        </p>
      ) : undefined}
      {model.errorMessage ? (
        <p
          className="custodian-wizard__error"
          role="alert"
          data-testid="custodian-error"
        >
          {model.errorMessage}
        </p>
      ) : undefined}
    </>
  );
}
