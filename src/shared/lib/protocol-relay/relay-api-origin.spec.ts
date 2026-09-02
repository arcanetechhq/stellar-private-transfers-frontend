import { isRelayConfigured, resolveRelayOrigin } from "./relay-api-origin.js";

describe("resolveRelayOrigin", () => {
  it("treats a missing or blank value as unconfigured", () => {
    expect(resolveRelayOrigin()).toBeUndefined();
    expect(resolveRelayOrigin("")).toBeUndefined();
  });

  it("keeps an explicit origin without stripping /api", () => {
    expect(resolveRelayOrigin("http://localhost:3010")).toBe(
      "http://localhost:3010",
    );
    expect(resolveRelayOrigin("http://localhost:3010/api")).toBe(
      "http://localhost:3010/api",
    );
  });
});

describe("isRelayConfigured", () => {
  it("is false until an origin is set", () => {
    expect(isRelayConfigured()).toBe(false);
    expect(isRelayConfigured({ origin: "http://relay.test" })).toBe(true);
  });
});
