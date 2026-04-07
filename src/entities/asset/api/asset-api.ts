import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface AssetDto {
  id: number;
  assetId: string;
  name: string;
  logoUrl: string | null;
  issuerAddress: string | null;
  clientContract: string | null;
  poolContract: string | null;
  mintable: boolean;
  mintAmount: string | null;
  decimals?: number | null;
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
      providesTags: [{ type: "Asset", id: "LIST" }],
    }),
  }),
});

export const { useGetAssetsQuery } = assetApi;
