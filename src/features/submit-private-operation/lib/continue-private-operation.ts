import type { AppDispatch } from "@/store";
import {
  awaitRelaySettlement,
  retryFailedRelayAttempt,
  submitDirectFallback,
  throwIfRelayUnsuccessful,
} from "@/shared/lib/protocol-relay";
import { createAppRelayPorts, createResumeRelayPorts } from "./create-app-relay-ports.js";

export async function continuePrivateOperation(input: {
  dispatch: AppDispatch;
  walletPublicKey: string;
  operationId: string;
  action: "retry" | "fallback";
}): Promise<{ txId: string; coinDeliveryWarning?: string }> {
  const ports =
    input.action === "fallback"
      ? createResumeRelayPorts(input.dispatch)
      : createAppRelayPorts({
          dispatch: input.dispatch,
          submitDirect: async () => {
            throw new Error("Direct submission is not part of retry.");
          },
        });
  if (input.action === "retry") {
    await retryFailedRelayAttempt({
      ports,
      walletPublicKey: input.walletPublicKey,
      operationId: input.operationId,
    });
    return throwIfRelayUnsuccessful(
      await awaitRelaySettlement({
        ports,
        walletPublicKey: input.walletPublicKey,
        operationId: input.operationId,
      }),
    );
  }
  return throwIfRelayUnsuccessful(
    await submitDirectFallback({
      ports,
      walletPublicKey: input.walletPublicKey,
      operationId: input.operationId,
      consent: true,
    }),
  );
}
