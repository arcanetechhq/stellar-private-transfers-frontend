import { normalizeCommitmentHex } from "@/entities/coin/lib/persist-coin.js";

const OUTPUT_NOTE_RECEIPT_PREFIX = "output-note-";

export function ownOutputNoteReceiptIds(input: {
  transactions: readonly { id: string }[];
  coins: readonly { commitmentHex: string; txId?: string }[];
}): string[] {
  const realIds = new Set(
    input.transactions
      .map((transaction) => transaction.id)
      .filter((id) => !id.startsWith(OUTPUT_NOTE_RECEIPT_PREFIX)),
  );
  return input.transactions
    .map((transaction) => transaction.id)
    .filter((id) =>
      receiptBelongsToHeldCoin({ id, coins: input.coins, realIds }),
    );
}

function receiptBelongsToHeldCoin(input: {
  id: string;
  coins: readonly { commitmentHex: string; txId?: string }[];
  realIds: ReadonlySet<string>;
}): boolean {
  if (!input.id.startsWith(OUTPUT_NOTE_RECEIPT_PREFIX)) {
    return false;
  }
  const tag = input.id.slice(OUTPUT_NOTE_RECEIPT_PREFIX.length);
  return input.coins.some((coin) =>
    heldCoinOwnsReceipt({ coin, tag, realIds: input.realIds }),
  );
}

function heldCoinOwnsReceipt(input: {
  coin: { commitmentHex: string; txId?: string };
  tag: string;
  realIds: ReadonlySet<string>;
}): boolean {
  const hex = normalizeCommitmentHex(input.coin.commitmentHex) ?? "";
  return (
    input.tag.length > 0 &&
    hex.startsWith(input.tag) &&
    input.coin.txId !== undefined &&
    input.realIds.has(input.coin.txId)
  );
}
