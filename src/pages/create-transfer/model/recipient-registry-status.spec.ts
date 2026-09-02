import { isRecipientRegistryReadyToSend } from "./recipient-registry-status";

describe("isRecipientRegistryReadyToSend", () => {
  it("blocks send until the recipient registry lookup has a result", () => {
    expect(isRecipientRegistryReadyToSend("idle")).toBe(false);
    expect(isRecipientRegistryReadyToSend("checking")).toBe(false);
    expect(isRecipientRegistryReadyToSend("lookup_failed")).toBe(false);
    expect(isRecipientRegistryReadyToSend("registered")).toBe(true);
    expect(isRecipientRegistryReadyToSend("unregistered")).toBe(false);
  });
});
