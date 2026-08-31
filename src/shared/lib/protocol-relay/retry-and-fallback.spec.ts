import { PENDING_OPERATION_PHASE } from "./types.js";
import { pollPendingOperation } from "./poll-pending-operation.js";
import { retryFailedRelayAttempt } from "./retry-and-resume.js";
import { submitDirectFallback } from "./submit-direct-fallback.js";
import { submitPreparedPrivateOperation } from "./submit-prepared-private-operation.js";
import {
  canOfferDirectSubmission,
  canRetryRelayAttempt,
} from "./fallback-policy.js";
import {
  createTestPorts,
  newOperation,
  TEST_OPERATION_ID,
  TEST_RELAY_REQUEST_ID,
  TEST_WALLET,
  testRelayStatus,
} from "./orchestrate-private-operation.test-harness.js";

describe("protocol relay retry", () => {
  it("shows a stable rejection reason and does not offer direct fallback", async () => {
    const ports = createTestPorts();
    await submitPreparedPrivateOperation({
      ports,
      operation: newOperation("0"),
    });
    ports.probe.statusById.set(
      TEST_RELAY_REQUEST_ID,
      testRelayStatus("rejected", { publicReason: "kyt_rejected" }),
    );
    const result = await pollPendingOperation({
      ports,
      walletPublicKey: TEST_WALLET,
      operationId: TEST_OPERATION_ID,
    });
    expect(result.outcome).toBe(PENDING_OPERATION_PHASE.rejected);
    expect(result.operation.publicReason).toBe("kyt_rejected");
    expect(canOfferDirectSubmission(result.operation)).toBe(false);
    await expect(
      submitDirectFallback({
        ports,
        walletPublicKey: TEST_WALLET,
        operationId: TEST_OPERATION_ID,
        consent: true,
      }),
    ).rejects.toThrow(/not allowed/i);
  });

  it("offers retry only when failed and the API allows it", async () => {
    const ports = createTestPorts();
    await submitPreparedPrivateOperation({
      ports,
      operation: newOperation("0"),
    });
    ports.probe.statusById.set(
      TEST_RELAY_REQUEST_ID,
      testRelayStatus("failed", {
        retryAllowed: true,
        publicReason: "infrastructure_failed",
      }),
    );
    const failed = await pollPendingOperation({
      ports,
      walletPublicKey: TEST_WALLET,
      operationId: TEST_OPERATION_ID,
    });
    expect(canRetryRelayAttempt(failed.operation)).toBe(true);
    expect(canOfferDirectSubmission(failed.operation)).toBe(false);
    ports.probe.statusById.set(TEST_RELAY_REQUEST_ID, testRelayStatus("queued"));
    const retried = await retryFailedRelayAttempt({
      ports,
      walletPublicKey: TEST_WALLET,
      operationId: TEST_OPERATION_ID,
    });
    expect(retried.outcome).toBe(PENDING_OPERATION_PHASE.relayAccepted);
    expect(canOfferDirectSubmission(retried.operation)).toBe(false);
  });
});
