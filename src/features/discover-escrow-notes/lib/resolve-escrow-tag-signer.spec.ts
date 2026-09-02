import { resolveEscrowTagSignerPublicKey } from "./resolve-escrow-tag-signer";

const ACCOUNT = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const CURRENT_SIGNER = "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBH5C";

describe("resolveEscrowTagSignerPublicKey", () => {
  it("uses the wallet-reported signer so a rotated key can issue tags", () => {
    expect(
      resolveEscrowTagSignerPublicKey({
        accountAddress: ACCOUNT,
        signerAddress: CURRENT_SIGNER,
      }),
    ).toBe(CURRENT_SIGNER);
  });

  it("falls back to the connected account when the wallet omits a signer", () => {
    expect(
      resolveEscrowTagSignerPublicKey({
        accountAddress: ACCOUNT,
      }),
    ).toBe(ACCOUNT);
  });
});
