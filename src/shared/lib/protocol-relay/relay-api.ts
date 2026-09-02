import {
  createRelayApi as createRelayTransport,
  type RelayApi,
} from "@arcanetech/privacy-sdk-relay";
import { getRequiredApiBaseUrl } from "@/shared/stellar/stellar-network-environment.js";

export function createRelayApi(input?: { baseUrl?: string }): RelayApi {
  return createRelayTransport({
    baseUrl: input?.baseUrl ?? getRequiredApiBaseUrl(),
  });
}
