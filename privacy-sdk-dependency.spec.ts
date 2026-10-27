import { readFileSync } from "node:fs";
import path from "node:path";

const packageJson = JSON.parse(
  readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

describe("privacy SDK dependency range", () => {
  it("depends on privacy-sdk-stellar at 1.0.1", () => {
    expect(packageJson.dependencies?.["@arcanetech/privacy-sdk-stellar"]).toBe(
      "1.0.1",
    );
  });

  it("depends on the 1.x privacy SDK packages that share core 1.0.2", () => {
    expect(packageJson.dependencies?.["@arcanetech/privacy-sdk-core"]).toBe(
      "1.0.2",
    );
    expect(
      packageJson.dependencies?.["@arcanetech/privacy-sdk-data-layer"],
    ).toBe("1.0.1");
    expect(packageJson.dependencies?.["@arcanetech/privacy-sdk-relay"]).toBe(
      "1.0.1",
    );
    expect(
      packageJson.dependencies?.["@arcanetech/privacy-sdk-state-redux"],
    ).toBe("1.0.1");
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
