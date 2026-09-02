import {
  createRelayApi as createRelayTransport,
  resolveRelayOrigin,
  type RelayApi,
  type RelayRuntimeConfig,
} from "@arcanetech/privacy-sdk-relay";
import { readClientEnvironment } from "@/shared/lib/privacy-sdk/read-client-environment.js";

export function readRelayRuntimeConfig(): RelayRuntimeConfig | undefined {
  const origin = resolveRelayOrigin(
    readClientEnvironment("VITE_RELAY_API_ORIGIN"),
  );
  if (!origin) {
    return undefined;
  }
  return { origin };
}

export function createRelayApi(input?: { origin?: string }): RelayApi | undefined {
  const origin = resolveRelayOrigin(
    input?.origin ?? readClientEnvironment("VITE_RELAY_API_ORIGIN"),
  );
  if (!origin) {
    return undefined;
  }
  return createRelayTransport({ origin });
}
