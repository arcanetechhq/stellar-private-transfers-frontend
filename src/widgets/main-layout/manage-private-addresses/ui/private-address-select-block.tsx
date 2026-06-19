import React from "react";
import type { PrivateAddressState } from "@/entities/private-address";
import { PrivateAddressSelect } from "@/features/pick-private-address";

type PrivateAddressTranslate = (key: string) => string;

type PrivateAddressSelectBlockProperties = {
  translate: PrivateAddressTranslate;
  nonces: string[];
  byNonce: PrivateAddressState["byNonce"];
  normalizedNonce: string | undefined;
  onViewingChange: (value: string) => void;
};

export function PrivateAddressSelectBlock({
  translate,
  nonces,
  byNonce,
  normalizedNonce,
  onViewingChange,
}: PrivateAddressSelectBlockProperties) {
  return (
    <PrivateAddressSelect
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
