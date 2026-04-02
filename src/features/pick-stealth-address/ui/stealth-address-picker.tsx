import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/app/hooks";
import {
  selectAllStealthNonces,
  selectDefaultNonce,
  selectStealthState,
} from "@/entities/stealth-address";
import { StealthAddressSelect } from "./stealth-address-select";

export interface StealthAddressPickerProperties {
  selectedNonce: string | undefined;
  onSelectNonce: (nonce: string, stealthAddress: string) => void;
}

export function StealthAddressPicker({
  selectedNonce,
  onSelectNonce,
}: StealthAddressPickerProperties) {
  const { t: translate } = useTranslation("deposit");
  const stealthState = useAppSelector(selectStealthState);
  const nonces = useAppSelector(selectAllStealthNonces);
  const defaultNonce = useAppSelector(selectDefaultNonce);
  const { byNonce } = stealthState;

  useEffect(() => {
    if (selectedNonce !== undefined) {
      return;
    }
    if (!defaultNonce || !byNonce[defaultNonce]?.stealthAddress) {
      return;
    }
    onSelectNonce(defaultNonce, byNonce[defaultNonce].stealthAddress);
  }, [byNonce, defaultNonce, onSelectNonce, selectedNonce]);

  if (nonces.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm text-[var(--foreground-secondary)]">
        {translate("noStealthAddresses")}
      </div>
    );
  }

  return (
    <StealthAddressSelect
      label={translate("stealthDestination")}
      triggerId="deposit-stealth-select"
      value={selectedNonce}
      onValueChange={(value) => {
        const address = byNonce[value]?.stealthAddress;
        if (address) {
          onSelectNonce(value, address);
        }
      }}
      placeholder={translate("stealthPlaceholder")}
      nonces={nonces}
      byNonce={byNonce}
    />
  );
}
