import { resumePendingOperations } from "@/shared/lib/protocol-relay/retry-and-resume.js";
import type { ProtocolRelayPorts } from "@/shared/lib/protocol-relay/types.js";
import { hasPendingRelaySubmission } from "./relay-waiting-notice.js";

export async function refreshPendingRelayWait(input: {
  ports: ProtocolRelayPorts;
  walletPublicKey: string;
  setIsWaiting: (value: boolean) => void;
}): Promise<void> {
  const pending = await input.ports.store.list(input.walletPublicKey);
  input.setIsWaiting(hasPendingRelaySubmission(pending));
  await resumePendingOperations({
    ports: input.ports,
    walletPublicKey: input.walletPublicKey,
  });
  const remaining = await input.ports.store.list(input.walletPublicKey);
  input.setIsWaiting(hasPendingRelaySubmission(remaining));
}
