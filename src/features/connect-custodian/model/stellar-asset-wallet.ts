export type StellarAssetWallet = {
  vaultId: string;
  assetId: string;
  address: string;
  available: string;
};

export function stellarWalletKey(wallet: StellarAssetWallet): string {
  return `${wallet.vaultId}:${wallet.assetId}:${wallet.address}`;
}
