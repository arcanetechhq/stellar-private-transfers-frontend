jest.mock("@/entities/transaction", () => ({
  addTransaction: jest.fn(),
  buildUserTransaction: jest.fn(),
}));

jest.mock("@/shared/lib/protocol-relay", () => ({
  bindProtocolRelayPorts: (input: {
    drainDeliveries: () => Promise<undefined>;
  }) => input,
}));

import { bindEscrowSweepRelayPorts } from "./bind-escrow-sweep-ports";

describe("escrow sweep deliveries", () => {
  it("does not upload an AES coin-delivery blob", async () => {
    const uploads: string[] = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      uploads.push(String(input));
      return new Response(null, { status: 500 });
    }) as typeof fetch;
    try {
      const ports = bindEscrowSweepRelayPorts({
        dispatch: (() => undefined) as never,
        execute: async () => ({ operationId: "tx-sweep" }),
      });
      await expect(ports.drainDeliveries({} as never)).resolves.toBeUndefined();
    } finally {
      globalThis.fetch = originalFetch;
    }
    expect(uploads).toEqual([]);
  });
});