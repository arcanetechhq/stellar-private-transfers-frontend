import { createOutputNoteDataProvider } from "./create-private-data-providers";

jest.mock("@arcanetech/privacy-sdk-stellar", () =>
  jest.requireActual("../../../../test-shims/privacy-sdk-stellar.ts"),
);

const PRIVATE_DATA_ORIGIN = "http://core.example/api/private-data";

describe("output note provider", () => {
  it("fails challenge methods before any HTTP call", async () => {
    const calls: string[] = [];
    const provider = createOutputNoteDataProvider({
      origin: PRIVATE_DATA_ORIGIN,
      fetchImpl: async (input) => {
        calls.push(String(input));
        return Response.json([]);
      },
    });

    await expect(provider.createChallenge({ account: "acct-1" })).rejects.toThrow();
    await expect(
      provider.completeChallenge({
        protocol: "stellar.escrow-tag",
        message: "sign-this",
        fields: { account: "acct-1" },
      }),
    ).rejects.toThrow();
    expect(calls).toEqual([]);
  });
});
