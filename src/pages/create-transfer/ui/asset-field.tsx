import React from "react";
import { useTranslation } from "react-i18next";
import { AssetSelectButton } from "@/shared/ui/asset-select-button";
import type { AssetWithTrustline } from "@/entities/asset";

interface AssetFieldProperties {
  selectedToken: AssetWithTrustline | undefined;
  onOpenTokenPicker: () => void;
}

export function AssetField({ selectedToken, onOpenTokenPicker }: AssetFieldProperties) {
  const { t: translate } = useTranslation("transfer");

  return (
    <AssetSelectButton
      asset={selectedToken}
      label={translate("asset")}
      placeholder={translate("asset")}
      onOpen={onOpenTokenPicker}
    />
  );
}
