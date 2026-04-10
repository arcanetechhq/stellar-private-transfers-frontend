import React from "react";
import { Loader2 } from "lucide-react";
import {
  DEFAULT_STEALTH_SIGN_NONCE,
  type CreateStealthErrorKind,
  type CreateStealthStatus,
} from "@/features/create-stealth-address";
import { StealthAddressDisplay } from "@/entities/stealth-address";
import type { StealthAddressState } from "@/entities/stealth-address";
import { StealthCompactErrorMessages } from "./stealth-compact-error-messages";

type StealthTranslate = (key: string) => string;

type ManageStealthAddressesCompactProperties = {
  translate: StealthTranslate;
  byNonce: StealthAddressState["byNonce"];
  defaultNonce: string | undefined;
  nonces: string[];
  create: (nonce?: string) => Promise<void>;
  status: CreateStealthStatus;
  errorKind: CreateStealthErrorKind | undefined;
  reset: () => void;
};

export function ManageStealthAddressesCompact({
  translate,
  byNonce,
  defaultNonce,
  nonces,
  create,
  status,
  errorKind,
  reset,
}: ManageStealthAddressesCompactProperties) {
  const compactNonce =
    defaultNonce ?? nonces[0] ?? DEFAULT_STEALTH_SIGN_NONCE;
  const compactEntry = byNonce[compactNonce];
  return (
    <div className="border-b border-gray-200 px-4 py-3">
      <p className="mb-2 text-xs font-medium text-gray-500">
        {translate("title")}
      </p>
      {compactEntry?.stealthAddress ? (
        <StealthAddressDisplay
          stealthAddress={compactEntry.stealthAddress}
          showFullAddress={false}
        />
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">{translate("generateHint")}</p>
          <button
            type="button"
            disabled={status === "pending"}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            onClick={() => void create(DEFAULT_STEALTH_SIGN_NONCE)}
          >
            {status === "pending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : undefined}
            {status === "pending" ? translate("generating") : translate("generate")}
          </button>
        </div>
      )}
      <StealthCompactErrorMessages
        translate={translate}
        status={status}
        errorKind={errorKind}
        reset={reset}
      />
    </div>
  );
}
