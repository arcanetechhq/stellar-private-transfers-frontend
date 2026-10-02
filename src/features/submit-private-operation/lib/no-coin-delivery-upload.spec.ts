jest.mock("./persist-if-current-wallet.js", () => ({
  persistIfCurrentWallet: jest.fn(),
}));

jest.mock("@/entities/transaction", () => ({
  addTransaction: jest.fn(),
  buildUserTransaction: jest.fn(),
}));

jest.mock("@/shared/lib/protocol-relay", () => ({
  bindProtocolRelayPorts: (input: {
    drainDeliveries: () => Promise<undefined>;
  }) => input,
  readDirectSubmitter: () => undefined,
}));

import { createAppRelayPorts } from "./create-app-relay-ports";

describe("transfer and withdraw deliveries", () => {
  it("does not upload an AES coin-delivery blob", async () => {
    const uploads: string[] = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      uploads.push(String(input));
      return new Response(null, { status: 500 });
    }) as typeof fetch;
    try {
      const ports = createAppRelayPorts({
        dispatch: (() => undefined) as never,
        submitDirect: async () => ({ txId: "tx-transfer" }),
      });
      await expect(ports.drainDeliveries({} as never)).resolves.toBeUndefined();
    } finally {
      globalThis.fetch = originalFetch;
    }
    expect(uploads).toEqual([]);
  });
});
