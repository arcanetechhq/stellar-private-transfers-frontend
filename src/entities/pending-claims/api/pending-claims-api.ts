import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const DEFAULT_PENDING_CLAIMS_PAGE_SIZE = 20;
const environmentRecord = (
  import.meta as ImportMeta & { env: Record<string, string | undefined> }
).env;

export interface PendingClaimItem {
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

export interface PendingClaimsListResponse {
  data: PendingClaimItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const pendingClaimsApi = createApi({
  reducerPath: "pendingClaimsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: environmentRecord.VITE_API_BASE_URL,
  }),
  tagTypes: ["PendingClaims"],
  endpoints: (builder) => ({
    listPendingClaims: builder.query<
      PendingClaimsListResponse,
      { ownerAddress: string; page?: number; limit?: number }
    >({
      query: ({
        ownerAddress,
        page = 1,
        limit = DEFAULT_PENDING_CLAIMS_PAGE_SIZE,
      }) => ({
        url: "/pending-claims",
        params: { ownerAddress, page, limit },
      }),
      providesTags: ["PendingClaims"],
    }),
    pendingClaimsCount: builder.query<
      { count: number },
      { ownerAddress: string }
    >({
      query: ({ ownerAddress }) => ({
        url: "/pending-claims/count",
        params: { ownerAddress },
      }),
      providesTags: ["PendingClaims"],
    }),
  }),
});

export const { useListPendingClaimsQuery, usePendingClaimsCountQuery } =
  pendingClaimsApi;
