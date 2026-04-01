import React from "react";
import type { CreateStealthErrorKind, CreateStealthStatus } from "@/features/create-stealth-address";

type StealthTranslate = (key: string) => string;

type StealthCompactErrorMessagesProperties = {
  translate: StealthTranslate;
  status: CreateStealthStatus;
  errorKind: CreateStealthErrorKind | undefined;
  reset: () => void;
};

export function StealthCompactErrorMessages({
  translate,
  status,
  errorKind,
  reset,
}: StealthCompactErrorMessagesProperties) {
  if (status !== "error") {
    return;
  }
  if (errorKind === "unsupported_sign_message") {
    return (
      <p className="mt-2 text-xs text-amber-700">
        {translate("unsupportedWallet")}
      </p>
    );
  }
  if (errorKind === "unknown") {
    return (
      <div className="mt-2 flex items-center gap-2">
        <p className="text-xs text-red-600">{translate("errorGeneric")}</p>
        <button
          type="button"
          className="text-xs text-gray-700 underline"
          onClick={reset}
        >
          {translate("retry")}
        </button>
      </div>
    );
  }
}
