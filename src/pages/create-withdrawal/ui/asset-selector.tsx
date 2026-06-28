import React from "react";
import { useTranslation } from "react-i18next";
import { AssetSelectButton } from "@/shared/ui/asset-select-button";
import type { AssetWithTrustline } from "@/entities/asset";

interface AssetSelectorProperties {
  selectedToken: AssetWithTrustline | undefined;
  onOpenPicker: () => void;
}

export function AssetSelector({
  selectedToken,
  onOpenPicker,
}: AssetSelectorProperties) {
  const { t: translate } = useTranslation("withdrawal");

  return (
    <AssetSelectButton
      asset={selectedToken}
      label={translate("asset")}
      placeholder={translate("asset")}
      onOpen={onOpenPicker}
    />
  );
}
