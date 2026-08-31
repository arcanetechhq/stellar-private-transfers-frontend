import type { AppDispatch } from "@/store";
import { addTransaction, buildUserTransaction } from "@/entities/transaction";
import { postOutputRecordDeliveries } from "@/entities/coin-deliveries";
import { createLocalPendingPrivateOperationStore } from "@/entities/pending-private-operation";
import {
  bindProtocolRelayPorts,
  recordsFromDeliveryOutbox,
  readDirectSubmitter,
  type ProtocolRelayPorts,
} from "@/shared/lib/protocol-relay";

export function bindClaimRelayPorts(input: {
  dispatch: AppDispatch;
  execute?: () => Promise<{ operationId: string }>;
}): ProtocolRelayPorts {
  return bindProtocolRelayPorts({
    store: createLocalPendingPrivateOperationStore(),
    submitDirect: async (operation) => {
      if (input.execute) {
        const receipt = await input.execute();
        if (!receipt.operationId) {
          throw new Error("SDK pending claim transfer did not return operation id");
        }
        return { txId: receipt.operationId };
      }
      const submitter = readDirectSubmitter(operation.id);
      if (!submitter) {
        throw new Error("Direct submission fallback is unavailable after reload.");
      }
      return submitter(operation);
    },
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
            type: "claim",
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
