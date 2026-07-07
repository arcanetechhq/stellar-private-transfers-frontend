const STELLAR_NATIVE_ASSET_LOGO = "/assets/tokens/xlm.svg";

export function resolveAssetLogoUrl(
  assetId: string,
  logoUrl?: string | null,
): string | null {
  if (assetId.toLowerCase() === "xlm") {
    return STELLAR_NATIVE_ASSET_LOGO;
  }

  return logoUrl ?? null;
}
