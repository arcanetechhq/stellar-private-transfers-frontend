import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface PostCoinDeliveryBody {
  recipientStealthAddress: string;
  assetId: string;
  ciphertextBase64: string;
  ephemeralKey: string;
  tagBase64: string;
}

export interface PostCoinDeliveryResponse {
  duplicate: boolean;
  id: number | null;
}

export interface IncomingCoinDeliveryDto {
  id: number;
  asset_id: string;
  ciphertext_base64: string;
  ephemeral_key: string;
  tag_base64: string;
  created_at: string;
}

export interface IncomingListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IncomingListResponse {
  data: IncomingCoinDeliveryDto[];
  meta: IncomingListMeta;
}

export interface FetchIncomingParameters {
  stealthAddress: string;
  assetId: string;
  bloomM: number;
  bloomK: number;
  bloomBitsBase64?: string;
  page?: number;
  limit?: number;
}

export const coinDeliveryApi = createApi({
  reducerPath: "coinDeliveryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL as string,
  }),
  endpoints: (builder) => ({
    getIncomingDeliveries: builder.query<IncomingListResponse, FetchIncomingParameters>({
      query: ({ stealthAddress, assetId, bloomM, bloomK, bloomBitsBase64, page, limit }) => ({
        url: "/coin-deliveries/incoming",
        params: {
          stealthAddress,
          assetId,
          bloomM,
          bloomK,
          ...(bloomBitsBase64 !== undefined && { bloomBitsBase64 }),
          ...(page !== undefined && { page }),
          ...(limit !== undefined && { limit }),
        },
      }),
    }),
    postCoinDelivery: builder.mutation<PostCoinDeliveryResponse, PostCoinDeliveryBody>({
      query: (body) => ({
        url: "/coin-deliveries",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetIncomingDeliveriesQuery, usePostCoinDeliveryMutation } =
  coinDeliveryApi;

export { existingSpentCoinMatchesIncomingDelivery } from "@/entities/coin";
