import { readFileSync } from "node:fs";
import path from "node:path";

const packageJson = JSON.parse(
  readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

describe("privacy SDK dependency range", () => {
  it("depends on privacy-sdk-stellar at >=0.8.1 <1.0.0", () => {
    expect(packageJson.dependencies?.["@arcanetech/privacy-sdk-stellar"]).toBe(
      ">=0.8.1 <1.0.0",
    );
  });

  it("depends on the 0.x privacy SDK packages published with stellar 0.8.1", () => {
    expect(packageJson.dependencies?.["@arcanetech/privacy-sdk-core"]).toBe(
      "0.4.0",
    );
    expect(packageJson.dependencies?.["@arcanetech/privacy-sdk-relay"]).toBe(
      "0.2.3",
    );
    expect(
      packageJson.dependencies?.["@arcanetech/privacy-sdk-state-redux"],
    ).toBe("0.2.4");
  });

  it("keeps data-layer on 1.x because that package has no 0.x release", () => {
    expect(
      packageJson.dependencies?.["@arcanetech/privacy-sdk-data-layer"],
    ).toBe("^1.0.0");
  });

  it("does not declare a direct dependency on the zk SDK", () => {
    expect(
      packageJson.dependencies?.["@arcanetech/stellar-privacy-pool-zk-sdk"],
    ).toBeUndefined();
    expect(
      packageJson.devDependencies?.["@arcanetech/stellar-privacy-pool-zk-sdk"],
    ).toBeUndefined();
  });
});
