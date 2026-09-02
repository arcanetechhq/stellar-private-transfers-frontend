import { createRelayApi, readRelayRuntimeConfig } from "./relay-api.js";
import { finalizeSdkStateForRelay } from "./finalize-sdk-state.js";
import type {
  PendingPrivateOperationStore,
  ProtocolRelayPorts,
  RelayRuntimeConfig,
} from "./types.js";

export function bindProtocolRelayPorts(input: {
  store: PendingPrivateOperationStore;
  submitDirect: ProtocolRelayPorts["submitDirect"];
  drainDeliveries: ProtocolRelayPorts["drainDeliveries"];
  persistUserTransaction: ProtocolRelayPorts["persistUserTransaction"];
  relayApi?: ProtocolRelayPorts["relayApi"];
  relayConfig?: RelayRuntimeConfig;
}): ProtocolRelayPorts {
  const relayConfig = input.relayConfig ?? readRelayRuntimeConfig();
  const relayApi = input.relayApi ?? (relayConfig ? createRelayApi(relayConfig) : undefined);
  return {
    ...(relayApi ? { relayApi } : {}),
    ...(relayConfig ? { relayConfig } : {}),
    store: input.store,
    submitDirect: input.submitDirect,
    finalizeLocalState: finalizeSdkStateForRelay,
    drainDeliveries: input.drainDeliveries,
    persistUserTransaction: input.persistUserTransaction,
  };
}
