import { assetApi } from "@/entities/asset";

export const faucetApi = assetApi.injectEndpoints({
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
    }),
  }),
  overrideExisting: false,
});

export const { useMintAssetMutation } = faucetApi;
