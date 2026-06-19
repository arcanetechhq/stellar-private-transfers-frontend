import type { Transaction } from "@/entities/transaction";
import { formatSenderCounterpartyForDisplay } from "@/shared/lib/format-sender-counterparty-for-display";

export function resolveDetailRecipientDisplay(input: {
  hasPrivateRecord: boolean;
  storedTransaction: Transaction | undefined;
  privateLabel: string;
}): string {
  const { hasPrivateRecord, storedTransaction, privateLabel } = input;
  if (!hasPrivateRecord) {
    return privateLabel;
  }
  const counterpartyTrimmed = storedTransaction?.counterparty?.trim() ?? "";
  if (counterpartyTrimmed === "") {
    return "—";
  }
  return formatSenderCounterpartyForDisplay(counterpartyTrimmed);
}

export function resolveDetailSenderDisplay(input: {
  hasPrivateRecord: boolean;
  storedTransaction: Transaction | undefined;
  privateLabel: string;
}): { text: string; title: string | undefined } {
  const { hasPrivateRecord, storedTransaction, privateLabel } = input;
  if (!hasPrivateRecord) {
    return { text: privateLabel, title: undefined };
  }
  const trimmed = storedTransaction?.senderPrivateAddress?.trim() ?? "";
  if (trimmed === "") {
    return { text: privateLabel, title: undefined };
  }
  return {
    text: formatSenderCounterpartyForDisplay(trimmed),
    title: storedTransaction?.senderPrivateAddress,
  };
}
