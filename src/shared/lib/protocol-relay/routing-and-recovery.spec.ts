import { PENDING_OPERATION_PHASE } from "./types.js";
import { chooseSubmissionPath } from "./choose-submission-path.js";
import { SUBMISSION_PATH } from "./types.js";
import { submitPreparedPrivateOperation } from "./submit-prepared-private-operation.js";
import { pollPendingOperation } from "./poll-pending-operation.js";
import { resumePendingOperations } from "./retry-and-resume.js";
import {
  createTestPorts,
  newOperation,
  succeededStatus,
  TEST_OPERATION_ID,
  TEST_RELAY_REQUEST_ID,
  TEST_TX_HASH,
  TEST_WALLET,
} from "./orchestrate-private-operation.test-harness.js";

describe("protocol relay routing and recovery", () => {
  it("routes a positive public deposit to wallet-signed direct submission", async () => {
    expect(chooseSubmissionPath("10000000")).toBe(SUBMISSION_PATH.direct);
    const ports = createTestPorts();
    const result = await submitPreparedPrivateOperation({
      ports,
      operation: newOperation("10000000"),
    });
    expect(ports.probe.directCalls).toEqual(["direct"]);
    expect(ports.probe.order).not.toContain("create");
    expect(result.outcome).toBe(PENDING_OPERATION_PHASE.succeeded);
    expect(result.txId).toBe("wallet-tx");
    expect(ports.probe.finalizeCalls).toEqual(["wallet-tx"]);
    expect(ports.probe.drainCalls).toEqual(["wallet-tx"]);
    expect(ports.probe.txCalls).toEqual(["wallet-tx"]);
  });

  it("persists a pending operation before creating an all-zero-deposit relay request", async () => {
    expect(chooseSubmissionPath("0")).toBe(SUBMISSION_PATH.relay);
    const ports = createTestPorts();
    const originalCreate = ports.relayApi.createRequest.bind(ports.relayApi);
    ports.relayApi.createRequest = async (body) => {
      ports.probe.order.push("create");
      return originalCreate(body);
    };
    const result = await submitPreparedPrivateOperation({
      ports,
      operation: newOperation("0"),
    });
    expect(ports.probe.order.slice(0, 2)).toEqual(["save", "create"]);
    expect(result.outcome).toBe(PENDING_OPERATION_PHASE.relayAccepted);
    expect(result.txId).toBeUndefined();
    expect(result.operation.relayRequestId).toBe(TEST_RELAY_REQUEST_ID);
    expect(result.operation.finalized).toBe(false);
    expect(ports.probe.finalizeCalls).toEqual([]);
    expect(ports.probe.drainCalls).toEqual([]);
  });

  it("resumes polling after reload and finalizes success exactly once", async () => {
    const ports = createTestPorts();
    await submitPreparedPrivateOperation({
      ports,
      operation: newOperation("0"),
    });
    ports.probe.statusById.set(TEST_RELAY_REQUEST_ID, succeededStatus());
    const resumed = await resumePendingOperations({
      ports,
      walletPublicKey: TEST_WALLET,
    });
    expect(resumed).toHaveLength(1);
    expect(resumed[0]?.outcome).toBe(PENDING_OPERATION_PHASE.succeeded);
    expect(resumed[0]?.txId).toBe(TEST_TX_HASH);
    await pollPendingOperation({
      ports,
      walletPublicKey: TEST_WALLET,
      operationId: TEST_OPERATION_ID,
    });
    expect(ports.probe.finalizeCalls).toEqual([TEST_TX_HASH]);
    expect(ports.probe.drainCalls).toEqual([TEST_TX_HASH]);
    expect(ports.probe.txCalls).toEqual([TEST_TX_HASH]);
  });
});

describe("protocol relay concurrent success", () => {
  it("does not re-drain when success polling overlaps", async () => {
    const ports = createTestPorts();
    const originalDrain = ports.drainDeliveries.bind(ports);
    const overlapDrainDelayMs = 20;
    ports.drainDeliveries = async (input) => {
      await new Promise((resolve) => {
        setTimeout(resolve, overlapDrainDelayMs);
      });
      return originalDrain(input);
    };
    await submitPreparedPrivateOperation({
      ports,
      operation: newOperation("0"),
    });
    ports.probe.statusById.set(TEST_RELAY_REQUEST_ID, succeededStatus());
    const [first, second] = await Promise.all([
      pollPendingOperation({
        ports,
        walletPublicKey: TEST_WALLET,
        operationId: TEST_OPERATION_ID,
      }),
      pollPendingOperation({
        ports,
        walletPublicKey: TEST_WALLET,
        operationId: TEST_OPERATION_ID,
      }),
    ]);
    expect(first.outcome).toBe(PENDING_OPERATION_PHASE.succeeded);
    expect(second.outcome).toBe(PENDING_OPERATION_PHASE.succeeded);
    expect(ports.probe.finalizeCalls).toEqual([TEST_TX_HASH]);
    expect(ports.probe.drainCalls).toEqual([TEST_TX_HASH]);
    expect(ports.probe.txCalls).toEqual([TEST_TX_HASH]);
    const stored = await ports.store.read({
      walletPublicKey: TEST_WALLET,
      operationId: TEST_OPERATION_ID,
    });
    expect(stored?.finalized).toBe(true);
    expect(stored?.deliveriesDrained).toBe(true);
    expect(stored?.transactionPersisted).toBe(true);
  });
});
