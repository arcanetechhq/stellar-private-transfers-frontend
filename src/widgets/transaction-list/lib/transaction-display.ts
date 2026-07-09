import { isPendingClaimTransactionId } from "@/entities/pending-claims";

export function getTransactionLabel(
  type: string,
  translate: (key: string) => string,
): string {
  const map: Record<string, string> = {
    deposit: translate("transactionLabels.deposit"),
    sent: translate("transactionLabels.sent"),
    received: translate("transactionLabels.received"),
    claim: translate("transactionLabels.claimed"),
    withdrawal: translate("transactionLabels.withdrawal"),
    merge: translate("transactionLabels.merge"),
  };
  return map[type] ?? type;
}

export function resolveTransactionActivityTitle(
  transaction: { id: string; type: string },
  translate: (key: string) => string,
): string {
  if (isPendingClaimTransactionId(transaction.id)) {
    return translate("transactionLabels.pending");
  }
  return getTransactionLabel(transaction.type, translate);
}

export function getStatusLabel(
  status: string,
  translate: (key: string) => string,
): string {
  const map: Record<string, string> = {
    completed: translate("statusLabels.completed"),
    pending: translate("statusLabels.pending"),
    processing: translate("statusLabels.processing"),
    created: translate("statusLabels.created"),
    failed: translate("statusLabels.failed"),
  };
  return map[status] ?? status;
}

export function getStatusVariant(status: string) {
  switch (status) {
    case "completed": {
      return "success";
    }
    case "pending": {
      return "pending";
    }
    case "processing": {
      return "info";
    }
    case "failed": {
      return "error";
    }
    default: {
      return "info";
    }
  }
}

export function getAmountToneClass(type: string): string {
  switch (type) {
    case "sent":
    case "withdrawal": {
      return "text-error";
    }
    case "received":
    case "deposit":
    case "claim": {
      return "text-success";
    }
    default: {
      return "text-[var(--foreground-primary)]";
    }
  }
}

export function getAmountPrefix(type: string) {
  switch (type) {
    case "sent":
    case "withdrawal": {
      return "-";
    }
    case "received":
    case "deposit":
    case "claim": {
      return "+";
    }
    default: {
      return "";
    }
  }
}
