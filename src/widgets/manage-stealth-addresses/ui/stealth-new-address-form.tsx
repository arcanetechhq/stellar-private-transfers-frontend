import React from "react";
import type { CreateStealthStatus } from "@/features/create-stealth-address";

type StealthTranslate = (key: string) => string;

type StealthNewAddressFormProperties = {
  translate: StealthTranslate;
  newNonceLabel: string;
  onNewNonceLabelChange: (value: string) => void;
  onCreateNamed: () => void;
  onCreateDefault: () => void;
  formDisabled: boolean;
  createNamedDisabled: boolean;
  status: CreateStealthStatus;
  hasNoAddresses: boolean;
};

export function StealthNewAddressForm({
  translate,
  newNonceLabel,
  onNewNonceLabelChange,
  onCreateNamed,
  onCreateDefault,
  formDisabled,
  createNamedDisabled,
  status,
  hasNoAddresses,
}: StealthNewAddressFormProperties) {
  return (
    <>
      <div className="w-full min-w-0 border-t border-border-soft pt-4">
        <label
          className="mb-2 block text-sm font-medium text-foreground"
          htmlFor="private-new-address-name-input"
        >
          {translate("createNamed")}
        </label>
        <div className="flex w-full min-w-0 flex-wrap gap-2">
          <input
            id="private-new-address-name-input"
            type="text"
            name="private-new-address-name"
            autoComplete="off"
            disabled={formDisabled}
            className="min-h-10 min-w-0 flex-1 rounded-lg border border-border-input bg-input-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
            placeholder={translate("newAddressNamePlaceholder")}
            value={newNonceLabel}
            onChange={(event) => onNewNonceLabelChange(event.target.value)}
          />
          <button
            type="button"
            disabled={createNamedDisabled}
            className="min-h-10 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void onCreateNamed()}
          >
            {status === "pending" ? translate("generating") : translate("create")}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">{translate("newAddressNameHint")}</p>
      </div>

      {hasNoAddresses ? (
        <div className="mt-4">
          <button
            type="button"
            disabled={formDisabled}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void onCreateDefault()}
          >
            {status === "pending"
              ? translate("generating")
              : translate("generateDefaultAddress")}
          </button>
        </div>
      ) : undefined}
    </>
  );
}
