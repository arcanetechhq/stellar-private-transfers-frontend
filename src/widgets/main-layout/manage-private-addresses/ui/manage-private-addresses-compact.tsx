import React from "react";
import { Loader2 } from "lucide-react";
import {
  DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE,
  type CreatePrivateAddressErrorKind,
  type CreatePrivateAddressStatus,
} from "@/features/create-private-address";
import { PrivateAddressDisplay } from "@/entities/private-address";
import type { PrivateAddressState } from "@/entities/private-address";
import { PrivateAddressCompactErrorMessages } from "./private-address-compact-error-messages";

type PrivateAddressTranslate = (key: string) => string;

type ManagePrivateAddressesCompactProperties = {
  translate: PrivateAddressTranslate;
  byNonce: PrivateAddressState["byNonce"];
  defaultNonce: string | undefined;
  nonces: string[];
  create: (nonce?: string) => Promise<void>;
  status: CreatePrivateAddressStatus;
  errorKind: CreatePrivateAddressErrorKind | undefined;
  reset: () => void;
};

export function ManagePrivateAddressesCompact({
  translate,
  byNonce,
  defaultNonce,
  nonces,
  create,
  status,
  errorKind,
  reset,
}: ManagePrivateAddressesCompactProperties) {
  const compactNonce =
    defaultNonce ?? nonces[0] ?? DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE;
  const compactEntry = byNonce[compactNonce];
  return (
    <div className="border-b border-gray-200 px-4 py-3">
      <p className="mb-2 text-xs font-medium text-gray-500">
        {translate("title")}
      </p>
      {compactEntry?.privateAddress ? (
        <PrivateAddressDisplay
          privateAddress={compactEntry.privateAddress}
          showFullAddress={false}
        />
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">{translate("generateHint")}</p>
          <button
            type="button"
            disabled={status === "pending"}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            onClick={() => void create(DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE)}
          >
            {status === "pending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : undefined}
            {status === "pending" ? translate("generating") : translate("generate")}
          </button>
        </div>
      )}
      <PrivateAddressCompactErrorMessages
        translate={translate}
        status={status}
        errorKind={errorKind}
        reset={reset}
      />
    </div>
  );
}
