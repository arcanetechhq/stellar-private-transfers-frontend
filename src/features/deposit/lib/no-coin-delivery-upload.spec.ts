jest.mock("@/entities/transaction", () => ({
  addTransaction: jest.fn(),
  buildUserTransaction: jest.fn(),
}));

jest.mock("@/shared/lib/protocol-relay", () => ({
  bindProtocolRelayPorts: (input: {
    drainDeliveries: () => Promise<undefined>;
  }) => input,
}));

import { bindDepositRelayPorts } from "./bind-deposit-relay-ports";

describe("deposit deliveries", () => {
  it("does not upload an AES coin-delivery blob", async () => {
    const uploads: string[] = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      uploads.push(String(input));
      return new Response(null, { status: 500 });
    }) as typeof fetch;
    try {
      const ports = bindDepositRelayPorts({
        dispatch: (() => undefined) as never,
        execute: async () => ({ operationId: "tx-deposit" }),
      });
      await expect(ports.drainDeliveries({} as never)).resolves.toBeUndefined();
    } finally {
      globalThis.fetch = originalFetch;
    }
    expect(uploads).toEqual([]);
  });
});
