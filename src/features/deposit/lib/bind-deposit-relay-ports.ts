import type { AppDispatch } from "@/store";
import { addTransaction, buildUserTransaction } from "@/entities/transaction";
import { createLocalPendingPrivateOperationStore } from "@/entities/pending-private-operation";
import {
  bindProtocolRelayPorts,
  type ProtocolRelayPorts,
} from "@/shared/lib/protocol-relay";

export function bindDepositRelayPorts(input: {
  dispatch: AppDispatch;
  execute: () => Promise<{ operationId: string }>;
}): ProtocolRelayPorts {
  return bindProtocolRelayPorts({
    store: createLocalPendingPrivateOperationStore(),
    submitDirect: async () => {
      const receipt = await input.execute();
      return { txId: receipt.operationId };
    },
    async drainDeliveries() {
      return undefined;
    },
    persistUserTransaction(parameters) {
      input.dispatch(
        addTransaction(
          buildUserTransaction({
            txId: parameters.txId,
            type: "deposit",
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
