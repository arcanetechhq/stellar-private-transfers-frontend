import type { StellarPreparedOperation } from "@arcanetech/privacy-sdk-stellar";
import { deliveryOutboxFromRecords } from "./map-delivery-outbox.js";
import { inspectPreparedRelayPackage } from "./inspect-prepared-relay-package.js";
import { submitAndAwaitPrivateOperation } from "./await-relay-settlement.js";
import { throwIfRelayUnsuccessful } from "./protocol-relay-client-error.js";
import { registerDirectSubmitter } from "./direct-submitter-registry.js";
import type {
  ProtocolRelayPorts,
  SafeDisplayMetadata,
} from "./types.js";

export async function routePreparedTransact(input: {
  ports: ProtocolRelayPorts;
  walletPublicKey: string;
  prepared: StellarPreparedOperation;
  display: SafeDisplayMetadata;
}): Promise<{ txId: string; coinDeliveryWarning?: string }> {
  const inspected = inspectPreparedRelayPackage(input.prepared);
  const outbox = deliveryOutboxFromRecords(input.prepared.outputRecords);
  const operationId = crypto.randomUUID();
  registerDirectSubmitter(operationId, input.ports.submitDirect);
  const result = await submitAndAwaitPrivateOperation({
    ports: input.ports,
    operation: {
      id: operationId,
      walletPublicKey: input.walletPublicKey,
      publicDepositAmount: inspected.publicDepositAmount,
      display: input.display,
      snapshot: {
        consumedRecordIds: input.prepared.consumedRecords.map((record) => record.id),
        outputRecords: outbox,
      },
      deliveryOutbox: outbox,
      relayPackage: inspected.relayPackage,
    },
  });
  return throwIfRelayUnsuccessful(result);
}
