import { ownOutputNoteReceiptIds } from "./own-output-note-receipts.js";

const COMMITMENT =
  "2cb223d0d442abababababababababababababababababababababababab";
const DEPOSIT_ID =
  "d1b3c9856408901952349721282d160ed0643cfa7e9804745bf0e576fbbecc5b";
const RECEIPT_ID = "output-note-2cb223d0d442";

describe("own output note receipts", () => {
  it("drops the synthetic receipt for a coin the deposit already stored", () => {
    expect(
      ownOutputNoteReceiptIds({
        transactions: [{ id: DEPOSIT_ID }, { id: RECEIPT_ID }],
        coins: [{ commitmentHex: `0x${COMMITMENT}`, txId: DEPOSIT_ID }],
      }),
    ).toEqual([RECEIPT_ID]);
  });

  it("keeps a receipt for a note the wallet did not already create", () => {
    expect(
      ownOutputNoteReceiptIds({
        transactions: [{ id: RECEIPT_ID }],
        coins: [{ commitmentHex: COMMITMENT }],
      }),
    ).toEqual([]);
  });
});
