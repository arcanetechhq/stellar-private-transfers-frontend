import type { AppDispatch } from "@/store";
import { addTransaction, buildUserTransaction } from "@/entities/transaction";
import { postOutputRecordDeliveries } from "@/entities/coin-deliveries";
import { createLocalPendingPrivateOperationStore } from "@/entities/pending-private-operation";
import {
  bindProtocolRelayPorts,
  recordsFromDeliveryOutbox,
  readDirectSubmitter,
  type PendingPrivateOperation,
  type ProtocolRelayPorts,
  type SafeDisplayMetadata,
} from "@/shared/lib/protocol-relay";

function transactionTypeFor(
  kind: SafeDisplayMetadata["kind"],
): "sent" | "withdrawal" | "deposit" {
  if (kind === "withdraw") {
    return "withdrawal";
  }
  if (kind === "deposit") {
    return "deposit";
  }
  return "sent";
}

export function createAppRelayPorts(input: {
  dispatch: AppDispatch;
  submitDirect: ProtocolRelayPorts["submitDirect"];
}): ProtocolRelayPorts {
  return bindProtocolRelayPorts({
    store: createLocalPendingPrivateOperationStore(),
    submitDirect: input.submitDirect,
    async drainDeliveries(parameters) {
      return postOutputRecordDeliveries({
        outputRecords: recordsFromDeliveryOutbox(
          parameters.operation.deliveryOutbox,
          {
            owner: parameters.operation.walletPublicKey,
            txId: parameters.txId,
          },
        ),
        txId: parameters.txId,
        dispatch: input.dispatch,
      });
    },
    persistUserTransaction(parameters) {
      input.dispatch(
        addTransaction(
          buildUserTransaction({
            txId: parameters.txId,
            type: transactionTypeFor(parameters.operation.display.kind),
            assetId: parameters.operation.display.assetId,
            amount: parameters.operation.display.amountDisplay,
            counterparty: parameters.operation.display.counterparty,
            senderPrivateAddress: parameters.operation.display.senderPrivateAddress,
          }),
        ),
      );
    },
  });
}

export function createResumeRelayPorts(dispatch: AppDispatch): ProtocolRelayPorts {
  return createAppRelayPorts({
    dispatch,
    async submitDirect(operation: PendingPrivateOperation) {
      const submitter = readDirectSubmitter(operation.id);
      if (!submitter) {
        throw new Error("Direct submission fallback is unavailable after reload.");
      }
      return submitter(operation);
    },
  });
}
