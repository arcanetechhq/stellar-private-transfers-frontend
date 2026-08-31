import { ProtocolRelayClientError } from "./protocol-relay-client-error.js";

export type RelayActionState = {
  retryAllowed: boolean;
  fallbackAllowed: boolean;
  operationId: string;
};

export function readRelayAction(error: unknown): RelayActionState | undefined {
  if (!(error instanceof ProtocolRelayClientError)) {
    return undefined;
  }
  return {
    retryAllowed: error.retryAllowed,
    fallbackAllowed: error.fallbackAllowed,
    operationId: error.operationId,
  };
}
