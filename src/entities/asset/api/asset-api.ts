import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";

interface AssetApiDto {
  id: number;
  assetId: string;
  name: string;
  logoUrl: string | null;
  issuerAddress: string | null;
  clientContract: string | null;
  poolContracts?: string[] | null;
  poolContract?: string | null;
  mintable: boolean;
  mintAmount: string | null;
  decimals?: number | null;
}

export interface AssetDto {
  id: number;
  assetId: string;
  name: string;
  logoUrl: string | null;
  issuerAddress: string | null;
  clientContract: string | null;
  poolContracts: string[];
  poolContract: string;
  mintable: boolean;
  mintAmount: string | null;
  decimals?: number | null;
}

function resolvePoolContracts(
  asset: AssetApiDto,
  singlePool: string,
): string[] {
  if (asset.poolContracts && asset.poolContracts.length > 0) {
    return asset.poolContracts;
  }
  if (asset.poolContract) {
    return [asset.poolContract];
  }
  return [singlePool];
}

export const assetApi = createApi({
  reducerPath: "assetApi",
  tagTypes: ["Asset"],
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL as string,
  }),
  endpoints: (builder) => ({
    getAssets: builder.query<AssetDto[], void>({
      query: () => "/assets",
      transformResponse: (response: AssetApiDto[]): AssetDto[] => {
        const singlePool = getRequiredPrivacyPoolContractId();
        return response.map((asset) => ({
          id: asset.id,
          assetId: asset.assetId,
          name: asset.name,
          logoUrl: asset.logoUrl,
          issuerAddress: asset.issuerAddress,
          clientContract: asset.clientContract,
          poolContracts: resolvePoolContracts(asset, singlePool),
          poolContract: singlePool,
          mintable: asset.mintable,
          mintAmount: asset.mintAmount,
          decimals: asset.decimals,
        }));
      },
      providesTags: [{ type: "Asset", id: "LIST" }],
    }),
  }),
});

export const { useGetAssetsQuery } = assetApi;
