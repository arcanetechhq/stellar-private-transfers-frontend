import type { TFunction } from "i18next";
import type { Confirmation } from "@/shared/lib/mock";

type ConfirmationStatus = Confirmation["status"];
type ConfirmationType = Confirmation["type"];

const CONFIRMATION_TYPE_KEYS: Record<ConfirmationType, string> = {
  transaction_proof: "confirmationTypes.fact",
  amount_proof: "confirmationTypes.amount",
  full_disclosure: "confirmationTypes.full",
};

export function getConfirmationTypeName(
  type: ConfirmationType,
  translate: TFunction,
): string {
  return CONFIRMATION_TYPE_KEYS[type]
    ? translate(CONFIRMATION_TYPE_KEYS[type])
    : type;
}

export function getStatusVariant(status: ConfirmationStatus): string {
  switch (status) {
    case "created": {
      return "info";
    }
    case "sent": {
      return "pending";
    }
    case "viewed": {
      return "warning";
    }
    case "used": {
      return "success";
    }
    default: {
      return "neutral";
    }
  }
}

const STATUS_NAME_KEYS: Record<ConfirmationStatus, string> = {
  created: "statusNames.created",
  sent: "statusNames.sent",
  viewed: "statusNames.viewed",
  used: "statusNames.used",
};

export function getStatusName(
  status: ConfirmationStatus,
  translate: TFunction,
): string {
  return STATUS_NAME_KEYS[status]
    ? translate(STATUS_NAME_KEYS[status])
    : status;
}

export function formatConfirmationDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function countSentConfirmations(confirmations: Confirmation[]): number {
  return confirmations.filter(
    (confirmation) =>
      confirmation.status === "sent" ||
      confirmation.status === "viewed" ||
      confirmation.status === "used",
  ).length;
}

export function countViewedConfirmations(
  confirmations: Confirmation[],
): number {
  return confirmations.filter(
    (confirmation) =>
      confirmation.status === "viewed" || confirmation.status === "used",
  ).length;
}

export function countUsedConfirmations(
  confirmations: Confirmation[],
): number {
  return confirmations.filter(
    (confirmation) => confirmation.status === "used",
  ).length;
}
