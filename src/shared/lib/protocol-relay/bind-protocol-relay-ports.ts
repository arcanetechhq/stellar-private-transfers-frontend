import { createRelayApi } from "./relay-api.js";
import { finalizeSdkStateForRelay } from "./finalize-sdk-state.js";
import type {
  PendingPrivateOperationStore,
  ProtocolRelayPorts,
} from "./types.js";

export function bindProtocolRelayPorts(input: {
  store: PendingPrivateOperationStore;
  submitDirect: ProtocolRelayPorts["submitDirect"];
  drainDeliveries: ProtocolRelayPorts["drainDeliveries"];
  persistUserTransaction: ProtocolRelayPorts["persistUserTransaction"];
  relayApi?: ProtocolRelayPorts["relayApi"];
}): ProtocolRelayPorts {
  return {
    relayApi: input.relayApi ?? createRelayApi(),
    store: input.store,
    submitDirect: input.submitDirect,
    finalizeLocalState: finalizeSdkStateForRelay,
    drainDeliveries: input.drainDeliveries,
    persistUserTransaction: input.persistUserTransaction,
  };
}
