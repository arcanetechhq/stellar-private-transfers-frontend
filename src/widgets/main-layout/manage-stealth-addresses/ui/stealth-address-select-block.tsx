import React from "react";
import type { StealthAddressState } from "@/entities/stealth-address";
import { StealthAddressSelect } from "@/features/pick-stealth-address";

type StealthTranslate = (key: string) => string;

type StealthAddressSelectBlockProperties = {
  translate: StealthTranslate;
  nonces: string[];
  byNonce: StealthAddressState["byNonce"];
  normalizedNonce: string | undefined;
  onViewingChange: (value: string) => void;
};

export function StealthAddressSelectBlock({
  translate,
  nonces,
  byNonce,
  normalizedNonce,
  onViewingChange,
}: StealthAddressSelectBlockProperties) {
  return (
    <StealthAddressSelect
      label={translate("selectPrivateAddress")}
      triggerId="private-address-select"
      value={normalizedNonce}
      onValueChange={onViewingChange}
      placeholder={translate("selectPlaceholder")}
      nonces={nonces}
      byNonce={byNonce}
      rootClassName="mb-4"
    />
  );
}
