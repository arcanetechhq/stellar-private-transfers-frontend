import { i18n } from "@/shared/config/i18n-instance";

export class KytInspectError extends Error {
  readonly reasonCode: string;
  readonly decisionId?: string;
  readonly detailAddress?: string;

  constructor(parameters: {
    message: string;
    reasonCode: string;
    decisionId?: string;
    detailAddress?: string;
  }) {
    super(parameters.message);
    this.name = "KytInspectError";
    this.reasonCode = parameters.reasonCode;
    this.decisionId = parameters.decisionId;
    this.detailAddress = parameters.detailAddress;
  }
}

export function parseKytReasonCode(reasonCode: string): {
  code: string;
  address?: string;
} {
  const separatorIndex = reasonCode.indexOf(":");
  if (separatorIndex === -1) {
    return { code: reasonCode };
  }
  return {
    code: reasonCode.slice(0, separatorIndex),
    address: reasonCode.slice(separatorIndex + 1),
  };
}

export function formatKytRejectionMessage(reasonCode: string): string {
  const parsed = parseKytReasonCode(reasonCode);
  const key = `reason_${parsed.code}`;
  const translated = i18n.t(key, {
    ns: "kyt",
    address: parsed.address ?? "",
    defaultValue: "",
  });
  if (translated) {
    return translated;
  }
  if (parsed.address) {
    return i18n.t("reasonDefault", { ns: "kyt" }) + ` (${parsed.address})`;
  }
  return i18n.t("reasonDefault", { ns: "kyt" });
}

export function formatKytRejectionTitle(): string {
  return i18n.t("inspectRejectedTitle", { ns: "kyt" });
}
