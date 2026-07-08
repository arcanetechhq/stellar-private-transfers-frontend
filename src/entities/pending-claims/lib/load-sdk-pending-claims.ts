import type {
  StellarPendingClaim,
  StellarPrivacyClient,
} from "@arcanetech/privacy-sdk-stellar";
import { getRequiredApiBaseUrl } from "@/shared/stellar/stellar-network-environment.js";
import { assetLegToTokenAddress } from "@/shared/lib/privacy-sdk/index.js";
import type { PendingClaimItem } from "../model/pending-claim-types.js";
import { mapSdkPendingClaimToItem } from "./map-sdk-pending-claim.js";

const DEFAULT_PAGE_SIZE = 50;

interface PendingClaimsBackendListItem {
  id: number;
  ownerAddress: string;
  poolTxId: string;
  commitmentHex: string;
  nullifierHex: string;
  futureNullifierHashHex: string;
  noteValue: string;
  assetHiHex: string;
  assetLoHex: string;
  nullifierFieldHex: string;
  secretHex: string;
  tempPublicKeyXHex: string;
  tempPublicKeyYHex: string;
  encryptedRecoveryBase64: string;
  createdAtLedger: number;
  createdAt: string;
}

interface PendingClaimsBackendListResponse {
  data: PendingClaimsBackendListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function mapPendingClaims(claims: StellarPendingClaim[]): PendingClaimItem[] {
  return claims.map((claim) => mapSdkPendingClaimToItem(claim));
}

function hexToDecimal(hex: string): string {
  const clean = hex.trim().replace(/^0x/u, "");
  return BigInt(`0x${clean || "0"}`).toString();
}

async function fetchPendingClaimsBackendPage(owner: string) {
  const parameters = new URLSearchParams({
    ownerAddress: owner,
    page: "1",
    limit: String(DEFAULT_PAGE_SIZE),
  });
  const baseUrl = getRequiredApiBaseUrl().replace(/\/$/u, "");
  const response = await fetch(
    `${baseUrl}/pending-claims?${parameters.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Pending claims request failed: ${response.status}`);
  }
  return response.json() as Promise<PendingClaimsBackendListResponse>;
}

function mapBackendClaimToSdkClaim(parameters: {
  item: PendingClaimsBackendListItem;
  resolveAsset: (tokenAddress: string) => string | undefined;
}): StellarPendingClaim {
  const assetHi = hexToDecimal(parameters.item.assetHiHex);
  const assetLo = hexToDecimal(parameters.item.assetLoHex);
  const tokenAddress = assetLegToTokenAddress(assetHi, assetLo);
  return {
    id: String(parameters.item.id),
    owner: parameters.item.ownerAddress,
    asset: parameters.resolveAsset(tokenAddress) ?? tokenAddress,
    amount: BigInt(parameters.item.noteValue),
    createdAt: parameters.item.createdAt,
    poolTxId: parameters.item.poolTxId,
    commitmentHex: parameters.item.commitmentHex,
    nullifierHex: parameters.item.nullifierHex,
    futureNullifierHashHex: parameters.item.futureNullifierHashHex,
    assetHiHex: parameters.item.assetHiHex,
    assetLoHex: parameters.item.assetLoHex,
    nullifierFieldHex: parameters.item.nullifierFieldHex,
    secretHex: parameters.item.secretHex,
    tempPublicKeyXHex: parameters.item.tempPublicKeyXHex,
    tempPublicKeyYHex: parameters.item.tempPublicKeyYHex,
    encryptedRecoveryBase64: parameters.item.encryptedRecoveryBase64,
    createdAtLedger: parameters.item.createdAtLedger,
  };
}

async function syncPendingClaimsPage(parameters: {
  client: StellarPrivacyClient;
  owner: string;
  resolveAsset: (tokenAddress: string) => string | undefined;
}): Promise<StellarPendingClaim[]> {
  const page = await fetchPendingClaimsBackendPage(parameters.owner);
  const claims = page.data.map((item) =>
    mapBackendClaimToSdkClaim({
      item,
      resolveAsset: parameters.resolveAsset,
    }),
  );
  await parameters.client.replacePendingClaimsPage({
    owner: parameters.owner,
    claims,
    paginationInfo: {
      total: page.meta.total,
      page: page.meta.page,
      pageSize: page.meta.limit,
      hasMore: page.meta.page < page.meta.totalPages,
    },
    count: page.meta.total,
  });
  return claims;
}

export async function loadSdkPendingClaims(parameters: {
  client: StellarPrivacyClient;
  owner: string;
  ready: boolean;
  resolveAsset: (tokenAddress: string) => string | undefined;
}): Promise<PendingClaimItem[]> {
  await syncPendingClaimsPage({
    client: parameters.client,
    owner: parameters.owner,
    resolveAsset: parameters.resolveAsset,
  });
  const pendingClaims = await parameters.client.getPendingClaims({
    owner: parameters.owner,
  });
  return mapPendingClaims(pendingClaims.items);
}
