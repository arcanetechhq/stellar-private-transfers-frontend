import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import {
  selectAllPrivateAddressNonces,
  selectDefaultNonce,
  selectPrivateAddressState,
} from "@/entities/private-address";
import { PrivateAddressSelect } from "@/features/pick-private-address";

export interface PrivateAddressPickerProperties {
  selectedNonce: string | undefined;
  onSelectNonce: (nonce: string, privateAddress: string) => void;
  noLabel?: boolean;
}

export function PrivateAddressPicker({
  selectedNonce,
  onSelectNonce,
  noLabel = false,
}: PrivateAddressPickerProperties) {
  const { t: translate } = useTranslation("deposit");
  const privateAddressState = useAppSelector(selectPrivateAddressState);
  const nonces = useAppSelector(selectAllPrivateAddressNonces);
  const defaultNonce = useAppSelector(selectDefaultNonce);
  const { byNonce } = privateAddressState;

  useEffect(() => {
    if (selectedNonce !== undefined) {
      return;
    }
    if (!defaultNonce || !byNonce[defaultNonce]?.privateAddress) {
      return;
    }
    onSelectNonce(defaultNonce, byNonce[defaultNonce].privateAddress);
  }, [byNonce, defaultNonce, onSelectNonce, selectedNonce]);

  if (nonces.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm text-[var(--foreground-secondary)]">
        {translate("noPrivateAddresses")}
      </div>
    );
  }

  return (
    <PrivateAddressSelect
      label={translate("privateDestination")}
      triggerId="deposit-private-address-select"
      value={selectedNonce}
      onValueChange={(value) => {
        const address = byNonce[value]?.privateAddress;
        if (address) {
          onSelectNonce(value, address);
        }
      }}
      placeholder={translate("privatePlaceholder")}
      nonces={nonces}
      byNonce={byNonce}
      noLabel={noLabel}
    />
  );
}
