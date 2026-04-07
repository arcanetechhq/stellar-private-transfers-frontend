import React from "react";
import type { StealthAddressState } from "@/entities/stealth-address";
import { StealthAddressSelect } from "@/features/pick-stealth-address";

type StealthTranslate = (key: string) => string;

type PrivateAssetStealthSelectProperties = {
  translate: StealthTranslate;
  nonces: string[];
  byNonce: StealthAddressState["byNonce"];
  normalizedNonce: string | undefined;
  onViewingChange: (value: string) => void;
  noLabel?: boolean;
};

export function PrivateAssetStealthSelect({
  translate,
  nonces,
  byNonce,
  normalizedNonce,
  onViewingChange,
  noLabel = false,
}: PrivateAssetStealthSelectProperties) {
  return (
    <StealthAddressSelect
      label={translate("selectPrivateAddress")}
      triggerId="private-assets-stealth-select"
      value={normalizedNonce}
      onValueChange={onViewingChange}
      placeholder={translate("selectPlaceholder")}
      nonces={nonces}
      byNonce={byNonce}
      noLabel={noLabel}
    />
  );
}
