import {
  hasPendingRelaySubmission,
  shouldShowRelayWaitingNotice,
} from "./relay-waiting-notice.js";
import enRelay from "@/shared/config/locales/en/relay.json";

describe("relay waiting-for-protocol notice", () => {
  it("shows waiting copy while a private operation is still submitting", () => {
    expect(
      shouldShowRelayWaitingNotice({
        isSubmitting: true,
        fallbackAllowed: false,
      }),
    ).toBe(true);
    expect(enRelay.waitingForProtocol).toBe(
      "Waiting for protocol submission. This is not complete yet.",
    );
  });

  it("does not present wallet fallback as protocol completion wait", () => {
    expect(
      shouldShowRelayWaitingNotice({
        isSubmitting: false,
        fallbackAllowed: false,
      }),
    ).toBe(false);
    expect(
      shouldShowRelayWaitingNotice({
        isSubmitting: true,
        fallbackAllowed: true,
      }),
    ).toBe(false);
  });

  it("keeps waiting visible for unfinalized relay requests after reload", () => {
    expect(
      hasPendingRelaySubmission([
        { relayRequestId: "relay-1", finalized: false },
      ]),
    ).toBe(true);
    expect(
      hasPendingRelaySubmission([
        { relayRequestId: "relay-1", finalized: true },
      ]),
    ).toBe(false);
  });
});
