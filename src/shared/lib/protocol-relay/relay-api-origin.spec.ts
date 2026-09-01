import { relayApiOrigin } from "./relay-api-origin.js";

describe("relayApiOrigin", () => {
  it("strips a trailing /api prefix so Relay API stays at /relay-requests", () => {
    expect(relayApiOrigin("/api")).toBe("");
    expect(relayApiOrigin("http://localhost:3010/api")).toBe(
      "http://localhost:3010",
    );
    expect(relayApiOrigin("http://localhost:3010/api/")).toBe(
      "http://localhost:3010",
    );
  });

  it("leaves a host that already serves /relay-requests unchanged", () => {
    expect(relayApiOrigin("http://localhost:3010")).toBe(
      "http://localhost:3010",
    );
    expect(relayApiOrigin("")).toBe("");
  });
});
