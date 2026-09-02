import { PENDING_OPERATION_PHASE, SUBMISSION_PATH } from "./types.js";
import { pollPendingOperation } from "./poll-pending-operation.js";
import { submitDirectFallback } from "./submit-direct-fallback.js";
import { submitPreparedPrivateOperation } from "./submit-prepared-private-operation.js";
import { canOfferDirectSubmission } from "./fallback-policy.js";
import { RelayApiError } from "./relay-api-error.js";

const RELAYER_UNAVAILABLE_STATUS = 503;
import {
  createTestPorts,
  newOperation,
  TEST_OPERATION_ID,
  TEST_RELAY_REQUEST_ID,
  TEST_WALLET,
  testRelayStatus,
} from "./orchestrate-private-operation.test-harness.js";

describe("protocol relay fallback gating", () => {
  it("offers consented fallback after pre-admission failure", async () => {
    const ports = createTestPorts({
      createRequest: async () => {
        throw new RelayApiError({
          reason: "relayer_unavailable",
          httpStatus: RELAYER_UNAVAILABLE_STATUS,
        });
      },
    });
    const failed = await submitPreparedPrivateOperation({
      ports,
      operation: newOperation(SUBMISSION_PATH.relay),
    });
    expect(failed.outcome).toBe(PENDING_OPERATION_PHASE.admissionFailed);
    expect(canOfferDirectSubmission(failed.operation)).toBe(true);
    const consented = await submitDirectFallback({
      ports,
      walletPublicKey: TEST_WALLET,
      operationId: TEST_OPERATION_ID,
      consent: true,
    });
    expect(consented.txId).toBe("wallet-tx");
  });

  it("never offers direct fallback while submitted or reconciling", async () => {
    const ports = createTestPorts();
    await submitPreparedPrivateOperation({
      ports,
      operation: newOperation(SUBMISSION_PATH.relay),
    });
    ports.probe.statusById.set(
      TEST_RELAY_REQUEST_ID,
      testRelayStatus("submitted"),
    );
    const submitted = await pollPendingOperation({
      ports,
      walletPublicKey: TEST_WALLET,
      operationId: TEST_OPERATION_ID,
    });
    expect(canOfferDirectSubmission(submitted.operation)).toBe(false);
    ports.probe.statusById.set(
      TEST_RELAY_REQUEST_ID,
      testRelayStatus("reconciling"),
    );
    const reconciling = await pollPendingOperation({
      ports,
      walletPublicKey: TEST_WALLET,
      operationId: TEST_OPERATION_ID,
    });
    expect(canOfferDirectSubmission(reconciling.operation)).toBe(false);
  });
});
