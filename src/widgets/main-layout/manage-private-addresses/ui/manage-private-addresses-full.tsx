import React from "react";
import { PrivateAddressDisplay } from "@/entities/private-address";
import type {
  PrivateAddressState,
  PrivateAddressNonceEntry,
} from "@/entities/private-address";
import type { CreatePrivateAddressErrorKind, CreatePrivateAddressStatus } from "@/features/create-private-address";
import { PrivateAddressSelectBlock } from "./private-address-select-block";
import { PrivateAddressNewAddressForm } from "./private-address-new-address-form";

type PrivateAddressTranslate = (key: string) => string;

type ManagePrivateAddressesFullProperties = {
  translate: PrivateAddressTranslate;
  walletConnected: boolean;
  nonces: string[];
  byNonce: PrivateAddressState["byNonce"];
  normalizedNonce: string | undefined;
  displayedEntry: PrivateAddressNonceEntry | undefined;
  onViewingChange: (value: string) => void;
  newNonceLabel: string;
  onNewNonceLabelChange: (value: string) => void;
  onCreateNamed: () => void;
  onCreateDefault: () => void;
  formDisabled: boolean;
  createNamedDisabled: boolean;
  status: CreatePrivateAddressStatus;
  errorKind: CreatePrivateAddressErrorKind | undefined;
  reset: () => void;
};

function PrivateAddressFullErrorSection({
  translate,
  status,
  errorKind,
  reset,
}: {
  translate: PrivateAddressTranslate;
  status: CreatePrivateAddressStatus;
  errorKind: CreatePrivateAddressErrorKind | undefined;
  reset: () => void;
}) {
  if (status !== "error") {
    return;
  }
  if (errorKind === "unsupported_sign_message") {
    return (
      <p className="mt-4 text-sm text-amber-800">
        {translate("unsupportedWallet")}
      </p>
    );
  }
  if (errorKind === "unknown") {
    return (
      <div className="mt-4 flex items-center gap-2">
        <p className="text-sm text-red-600">{translate("errorGeneric")}</p>
        <button type="button" className="text-sm underline" onClick={reset}>
          {translate("retry")}
        </button>
      </div>
    );
  }
}

function PrivateAddressFullAddressPreview({
  translate,
  walletConnected,
  displayedEntry,
}: {
  translate: PrivateAddressTranslate;
  walletConnected: boolean;
  displayedEntry: PrivateAddressNonceEntry | undefined;
}) {
  if (walletConnected) {
    return (
      <div className="mb-6 min-h-[2rem]">
        {displayedEntry?.privateAddress ? (
          <div>
            <p className="mb-2 text-sm text-gray-600">
              {translate("currentAddress")}
            </p>
            <PrivateAddressDisplay
              privateAddress={displayedEntry.privateAddress}
              showFullAddress
            />
          </div>
        ) : (
          <p className="text-sm text-gray-600">{translate("noAddressesYet")}</p>
        )}
      </div>
    );
  }
  return (
    <div className="mb-6 min-h-[2rem] rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-3 py-3 text-sm text-gray-500">
      {translate("fullAddressPlaceholder")}
    </div>
  );
}

function PrivateAddressesFullContent(
  properties: ManagePrivateAddressesFullProperties,
) {
  const {
    translate,
    walletConnected,
    nonces,
    byNonce,
    normalizedNonce,
    displayedEntry,
    onViewingChange,
    newNonceLabel,
    onNewNonceLabelChange,
    onCreateNamed,
    onCreateDefault,
    formDisabled,
    createNamedDisabled,
    status,
    errorKind,
    reset,
  } = properties;

  return (
    <>
      {walletConnected ? undefined : (
        <p className="mb-6 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {translate("connectWalletPrompt")}
        </p>
      )}

      {walletConnected && nonces.length > 0 ? (
        <PrivateAddressSelectBlock
          translate={translate}
          nonces={nonces}
          byNonce={byNonce}
          normalizedNonce={normalizedNonce}
          onViewingChange={onViewingChange}
        />
      ) : undefined}

      <PrivateAddressFullAddressPreview
        translate={translate}
        walletConnected={walletConnected}
        displayedEntry={displayedEntry}
      />

      <PrivateAddressNewAddressForm
        translate={translate}
        newNonceLabel={newNonceLabel}
        onNewNonceLabelChange={onNewNonceLabelChange}
        onCreateNamed={onCreateNamed}
        onCreateDefault={onCreateDefault}
        formDisabled={formDisabled}
        createNamedDisabled={createNamedDisabled}
        status={status}
        hasNoAddresses={nonces.length === 0}
      />

      <PrivateAddressFullErrorSection
        translate={translate}
        status={status}
        errorKind={errorKind}
        reset={reset}
      />
    </>
  );
}

export function ManagePrivateAddressesFull(
  properties: ManagePrivateAddressesFullProperties,
) {
  const { translate } = properties;
  return (
    <div
      className="mb-8 rounded-xl border border-gray-200 bg-white p-6"
      style={{ borderColor: "#E7EAF0" }}
    >
      <h2
        className="mb-1 font-semibold"
        style={{ fontSize: "18px", lineHeight: "24px", color: "#121826" }}
      >
        {translate("myPrivateAddresses")}
      </h2>
      <p className="mb-4 text-sm text-gray-600">{translate("myPrivateSubtitle")}</p>
      <PrivateAddressesFullContent {...properties} />
    </div>
  );
}
