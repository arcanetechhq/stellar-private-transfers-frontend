const NATIVE_XLM_CODE = "XLM";

export type PaymentCatalogAsset = {
  assetId: string;
  issuerAddress?: string | null;
};

export function isNativeCatalogXlm(asset: PaymentCatalogAsset): boolean {
  if (asset.assetId.trim().toUpperCase() !== NATIVE_XLM_CODE) {
    return false;
  }
  const issuer = asset.issuerAddress;
  return issuer === undefined || issuer === null || issuer.trim().length === 0;
}

export function filterPaymentCatalog<Asset extends PaymentCatalogAsset>(
  assets: readonly Asset[] | undefined,
  nativeXlmOnly: boolean,
): readonly Asset[] | undefined {
  if (assets === undefined || !nativeXlmOnly) {
    return assets;
  }
  return assets.filter((asset) => isNativeCatalogXlm(asset));
}
