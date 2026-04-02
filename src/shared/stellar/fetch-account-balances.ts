import type { Horizon } from "@stellar/stellar-sdk";

export interface StellarBalance {
  assetType: string;
  assetCode?: string;
  assetIssuer?: string;
  balance: string;
}

export async function fetchAccountBalances(
  server: Horizon.Server,
  publicKey: string,
): Promise<StellarBalance[]> {
  const account = await server.loadAccount(publicKey);
  return account.balances.map((entry) => ({
    assetType: entry.asset_type,
    assetCode: "asset_code" in entry ? entry.asset_code : undefined,
    assetIssuer: "asset_issuer" in entry ? entry.asset_issuer : undefined,
    balance: entry.balance,
  }));
}
