import { readFileSync } from "node:fs";
import path from "node:path";

const packageJson = JSON.parse(
  readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

describe("privacy SDK dependency range", () => {
  it("depends on privacy-sdk-stellar at >=0.7.0 <1.0.0", () => {
    expect(packageJson.dependencies?.["@arcanetech/privacy-sdk-stellar"]).toBe(
      ">=0.7.0 <1.0.0",
    );
  });

  it("does not declare a direct dependency on the zk SDK", () => {
    expect(
      packageJson.dependencies?.["@arcanetech/stellar-privacy-pool-zk-sdk"],
    ).toBeUndefined();
    expect(
      packageJson.devDependencies?.[
        "@arcanetech/stellar-privacy-pool-zk-sdk"
      ],
    ).toBeUndefined();
  });
});
