import { existsSync } from "node:fs";
import path from "node:path";

const SRC_ROOT = path.resolve(process.cwd(), "src");
const ENTITY_ROOT = path.join(SRC_ROOT, "entities/coin-deliveries");

describe("retired transfer-backend coin deliveries", () => {
  it("does not keep an HTTP client for uploads or incoming reads", () => {
    expect(existsSync(path.join(ENTITY_ROOT, "api", "coin-delivery-api.ts"))).toBe(
      false,
    );
    expect(
      existsSync(
        path.join(SRC_ROOT, "features/deposit/model/post-deposit-delivery.ts"),
      ),
    ).toBe(false);
    expect(
      existsSync(path.join(SRC_ROOT, "shared/lib/coin-delivery/index.ts")),
    ).toBe(false);
  });
});
