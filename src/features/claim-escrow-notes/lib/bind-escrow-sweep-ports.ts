import type { AppDispatch } from "@/store";
import { addTransaction, buildUserTransaction } from "@/entities/transaction";
import { postOutputRecordDeliveries } from "@/entities/coin-deliveries";
import { createLocalPendingPrivateOperationStore } from "@/entities/pending-private-operation";
import {
  bindProtocolRelayPorts,
  recordsFromDeliveryOutbox,
  type ProtocolRelayPorts,
} from "@/shared/lib/protocol-relay";

export function bindEscrowSweepRelayPorts(input: {
  dispatch: AppDispatch;
  execute: () => Promise<{ operationId: string }>;
}): ProtocolRelayPorts {
  return bindProtocolRelayPorts({
    store: createLocalPendingPrivateOperationStore(),
    submitDirect: async () => {
      const receipt = await input.execute();
      return { txId: receipt.operationId };
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
            type: "received",
            assetId: parameters.operation.display.assetId,
            amount: parameters.operation.display.amountDisplay,
            counterparty: parameters.operation.display.counterparty,
            senderPrivateAddress: parameters.operation.walletPublicKey,
          }),
        ),
      );
    },
  });
}
