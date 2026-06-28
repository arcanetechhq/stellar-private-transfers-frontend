import { assetApi } from "./asset-api";

export const mintAssetApi = assetApi.injectEndpoints({
  endpoints: (builder) => ({
    mintAsset: builder.mutation<
      { txHash: string },
      { assetId: string; address: string }
    >({
      query: ({ assetId, address }) => ({
        url: `/assets/${assetId}/mint`,
        method: "POST",
        body: { address },
      }),
      invalidatesTags: [{ type: "Asset", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useMintAssetMutation } = mintAssetApi;
