import React from "react";
import type { PrivateAddressState } from "@/entities/private-address";
import { PrivateAddressSelect } from "@/features/pick-private-address";

type PrivateAddressTranslate = (key: string) => string;

type PrivateAssetPrivateAddressSelectProperties = {
  translate: PrivateAddressTranslate;
  nonces: string[];
  byNonce: PrivateAddressState["byNonce"];
  normalizedNonce: string | undefined;
  onViewingChange: (value: string) => void;
  noLabel?: boolean;
};

export function PrivateAssetPrivateAddressSelect({
  translate,
  nonces,
  byNonce,
  normalizedNonce,
  onViewingChange,
  noLabel = false,
}: PrivateAssetPrivateAddressSelectProperties) {
  return (
    <PrivateAddressSelect
      label={translate("selectPrivateAddress")}
      triggerId="private-assets-private-address-select"
      value={normalizedNonce}
      onValueChange={onViewingChange}
      placeholder={translate("selectPlaceholder")}
      nonces={nonces}
      byNonce={byNonce}
      noLabel={noLabel}
    />
  );
}
