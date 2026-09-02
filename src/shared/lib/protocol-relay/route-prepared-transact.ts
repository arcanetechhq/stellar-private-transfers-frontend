import type { StellarPreparedOperation } from "@arcanetech/privacy-sdk-stellar";
import {
  isEscrowPreparedOperation,
  requiredSubmissionMethod,
} from "@arcanetech/privacy-sdk-stellar/transact";
import { deliveryOutboxFromRecords } from "./map-delivery-outbox.js";
import { inspectPreparedRelayPackage } from "./inspect-prepared-relay-package.js";
import { submitAndAwaitPrivateOperation } from "./await-relay-settlement.js";
import { throwIfRelayUnsuccessful } from "./protocol-relay-client-error.js";
import { registerDirectSubmitter } from "./direct-submitter-registry.js";
import type {
  ProtocolRelayPorts,
  SafeDisplayMetadata,
} from "./types.js";

function preparedForSubmission(
  prepared: StellarPreparedOperation,
  escrowSend?: boolean,
): StellarPreparedOperation {
  if (!escrowSend) {
    return prepared;
  }
  return {
    ...prepared,
    transactArtifacts: {
      ...prepared.transactArtifacts,
      escrowSend: true,
      spendSource: "escrow",
    },
  };
}

export async function routePreparedTransact(input: {
  ports: ProtocolRelayPorts;
  walletPublicKey: string;
  prepared: StellarPreparedOperation;
  display: SafeDisplayMetadata;
  escrowSend?: boolean;
}): Promise<{ txId: string; coinDeliveryWarning?: string }> {
  const prepared = preparedForSubmission(input.prepared, input.escrowSend);
  const relayPackage = inspectPreparedRelayPackage(prepared);
  const outbox = deliveryOutboxFromRecords(prepared.outputRecords);
  const operationId = crypto.randomUUID();
  registerDirectSubmitter(operationId, input.ports.submitDirect);
  const result = await submitAndAwaitPrivateOperation({
    ports: input.ports,
    operation: {
      id: operationId,
      walletPublicKey: input.walletPublicKey,
      submissionPath: requiredSubmissionMethod(prepared),
      display: input.display,
      snapshot: {
        consumedRecordIds: prepared.consumedRecords.map((record) => record.id),
        outputRecords: outbox,
      },
      deliveryOutbox: outbox,
      relayPackage,
      ...(isEscrowPreparedOperation(prepared) ? { escrowSend: true } : {}),
    },
  });
  return throwIfRelayUnsuccessful(result);
}
