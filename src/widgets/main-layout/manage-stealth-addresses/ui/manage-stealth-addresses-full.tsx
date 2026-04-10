import React from "react";
import { StealthAddressDisplay } from "@/entities/stealth-address";
import type {
  StealthAddressState,
  StealthNonceEntry,
} from "@/entities/stealth-address";
import type { CreateStealthErrorKind, CreateStealthStatus } from "@/features/create-stealth-address";
import { StealthAddressSelectBlock } from "./stealth-address-select-block";
import { StealthNewAddressForm } from "./stealth-new-address-form";

type StealthTranslate = (key: string) => string;

type ManageStealthAddressesFullProperties = {
  translate: StealthTranslate;
  walletConnected: boolean;
  nonces: string[];
  byNonce: StealthAddressState["byNonce"];
  normalizedNonce: string | undefined;
  displayedEntry: StealthNonceEntry | undefined;
  onViewingChange: (value: string) => void;
  newNonceLabel: string;
  onNewNonceLabelChange: (value: string) => void;
  onCreateNamed: () => void;
  onCreateDefault: () => void;
  formDisabled: boolean;
  createNamedDisabled: boolean;
  status: CreateStealthStatus;
  errorKind: CreateStealthErrorKind | undefined;
  reset: () => void;
};

function StealthFullErrorSection({
  translate,
  status,
  errorKind,
  reset,
}: {
  translate: StealthTranslate;
  status: CreateStealthStatus;
  errorKind: CreateStealthErrorKind | undefined;
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

function StealthFullAddressPreview({
  translate,
  walletConnected,
  displayedEntry,
}: {
  translate: StealthTranslate;
  walletConnected: boolean;
  displayedEntry: StealthNonceEntry | undefined;
}) {
  if (walletConnected) {
    return (
      <div className="mb-6 min-h-[2rem]">
        {displayedEntry?.stealthAddress ? (
          <div>
            <p className="mb-2 text-sm text-gray-600">
              {translate("currentAddress")}
            </p>
            <StealthAddressDisplay
              stealthAddress={displayedEntry.stealthAddress}
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

function StealthAddressesFullContent(
  properties: ManageStealthAddressesFullProperties,
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
        <StealthAddressSelectBlock
          translate={translate}
          nonces={nonces}
          byNonce={byNonce}
          normalizedNonce={normalizedNonce}
          onViewingChange={onViewingChange}
        />
      ) : undefined}

      <StealthFullAddressPreview
        translate={translate}
        walletConnected={walletConnected}
        displayedEntry={displayedEntry}
      />

      <StealthNewAddressForm
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

      <StealthFullErrorSection
        translate={translate}
        status={status}
        errorKind={errorKind}
        reset={reset}
      />
    </>
  );
}

export function ManageStealthAddressesFull(
  properties: ManageStealthAddressesFullProperties,
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
      <StealthAddressesFullContent {...properties} />
    </div>
  );
}
