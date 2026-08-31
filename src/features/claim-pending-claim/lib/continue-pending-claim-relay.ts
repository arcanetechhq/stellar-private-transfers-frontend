import type { AppDispatch } from "@/store";
import {
  awaitRelaySettlement,
  retryFailedRelayAttempt,
  submitDirectFallback,
  throwIfRelayUnsuccessful,
  type RelayActionState,
} from "@/shared/lib/protocol-relay";
import { bindClaimRelayPorts } from "./bind-claim-relay-ports.js";
import { readPendingClaimMutationError } from "./run-pending-claim-mutation.js";
import { readRelayAction } from "@/shared/lib/protocol-relay";

export async function continuePendingClaimRelay(input: {
  dispatch: AppDispatch;
  walletPublicKey: string;
  relayAction: RelayActionState;
  action: "retry" | "fallback";
  onClaimed?: (claimId: number) => void;
  claimId: number;
}): Promise<{ error?: string; relayAction?: RelayActionState }> {
  const ports = bindClaimRelayPorts({ dispatch: input.dispatch });
  try {
    if (input.action === "retry") {
      await retryFailedRelayAttempt({
        ports,
        walletPublicKey: input.walletPublicKey,
        operationId: input.relayAction.operationId,
      });
      throwIfRelayUnsuccessful(
        await awaitRelaySettlement({
          ports,
          walletPublicKey: input.walletPublicKey,
          operationId: input.relayAction.operationId,
        }),
      );
    } else {
      throwIfRelayUnsuccessful(
        await submitDirectFallback({
          ports,
          walletPublicKey: input.walletPublicKey,
          operationId: input.relayAction.operationId,
          consent: true,
        }),
      );
    }
    input.onClaimed?.(input.claimId);
    return {};
  } catch (error: unknown) {
    return {
      error: readPendingClaimMutationError(error),
      relayAction: readRelayAction(error) ?? input.relayAction,
    };
  }
}
