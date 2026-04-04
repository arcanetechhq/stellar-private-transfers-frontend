import React from "react";
import { useTranslation } from "react-i18next";

interface DestinationInputProperties {
  destinationWallet: string;
  onDestinationChange: (value: string) => void;
}

export function DestinationInput(properties: DestinationInputProperties) {
  const { destinationWallet, onDestinationChange } = properties;
  const { t: translate } = useTranslation("withdrawal");

  return (
    <div>
      <label className="mb-2 block text-[14px] leading-5 font-semibold text-[var(--foreground-primary)]">
        {translate("destinationWallet")}
      </label>
      <input
        type="text"
        value={destinationWallet}
        onChange={(event) => onDestinationChange(event.target.value)}
        placeholder={translate("destinationPlaceholder")}
        className="w-full rounded-lg border border-[var(--border-input)] bg-[var(--input-background)] px-4 py-3 font-mono text-[14px] text-[var(--foreground-primary)] placeholder:text-[var(--foreground-tertiary)] hover:bg-[var(--input-background-hover)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
      />
    </div>
  );
}
