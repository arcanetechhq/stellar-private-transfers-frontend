import { existsSync } from "node:fs";
import path from "node:path";

const SRC_ROOT = path.join(process.cwd(), "src");

describe("retired pending-claims history helpers", () => {
  it("does not keep pending-claims entity, claim feature, or history merge helpers", () => {
    expect(existsSync(path.join(SRC_ROOT, "entities/pending-claims"))).toBe(
      false,
    );
    expect(
      existsSync(path.join(SRC_ROOT, "features/claim-pending-claim")),
    ).toBe(false);
    expect(
      existsSync(
        path.join(
          SRC_ROOT,
          "widgets/transaction-list/model/use-transactions-with-pending-claims.ts",
        ),
      ),
    ).toBe(false);
    expect(
      existsSync(
        path.join(
          SRC_ROOT,
          "widgets/transaction-list/model/merge-transactions-with-pending-claims.ts",
        ),
      ),
    ).toBe(false);
    expect(
      existsSync(
        path.join(
          SRC_ROOT,
          "widgets/transaction-list/model/use-transaction-panel-pending-claims.ts",
        ),
      ),
    ).toBe(false);
    expect(
      existsSync(
        path.join(
          SRC_ROOT,
          "widgets/transaction-list/model/use-merged-wallet-transactions.ts",
        ),
      ),
    ).toBe(false);
  });
});
