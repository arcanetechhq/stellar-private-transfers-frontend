import React from "react";
import { Download, Send, FileCheck, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "@/shared/ui/status-badge";
import type { Confirmation } from "@/shared/lib/mock";
import {
  getConfirmationTypeName,
  getStatusName,
  formatConfirmationDate,
} from "../model/confirmations";

interface ActionButtonProperties {
  icon: React.ReactNode;
  title: string;
}

function ActionButton(properties: ActionButtonProperties) {
  const { icon, title } = properties;

  return (
    <button
      className="rounded-lg p-2 transition-colors"
      style={{
        border: "1px solid #E6E8EC",
        backgroundColor: "#FFFFFF",
      }}
      onMouseEnter={(event) =>
        (event.currentTarget.style.backgroundColor = "#F9FAFB")
      }
      onMouseLeave={(event) =>
        (event.currentTarget.style.backgroundColor = "#FFFFFF")
      }
      title={title}
    >
      {icon}
    </button>
  );
}

interface DetailFieldProperties {
  label: string;
  value: string;
  monospace?: boolean;
}

function DetailField(properties: DetailFieldProperties) {
  const { label, value, monospace } = properties;

  return (
    <div>
      <p
        style={{
          fontSize: "12px",
          lineHeight: "16px",
          color: "#9CA3AF",
        }}
      >
        {label}
      </p>
      <p
        className={`mt-1${monospace ? " font-mono" : ""}`}
        style={{
          fontSize: "13px",
          lineHeight: "18px",
          color: "#1B1D22",
        }}
      >
        {value}
      </p>
    </div>
  );
}

interface ConfirmationCardInfoProperties {
  confirmation: Confirmation;
}

function ConfirmationCardInfo(properties: ConfirmationCardInfoProperties) {
  const { confirmation } = properties;
  const { t: translate } = useTranslation("confirmations");

  return (
    <div className="flex-1">
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: "#F9FAFB" }}
        >
          <FileCheck className="h-5 w-5" style={{ color: "#1B1D22" }} />
        </div>
        <div>
          <p
            className="font-medium"
            style={{
              fontSize: "15px",
              lineHeight: "22px",
              color: "#1B1D22",
            }}
          >
            {getConfirmationTypeName(confirmation.type, translate)}
          </p>
          <p
            className="font-mono"
            style={{
              fontSize: "12px",
              lineHeight: "16px",
              color: "#6B7280",
            }}
          >
            {confirmation.id}
          </p>
        </div>
      </div>
      <div className="ml-13 grid grid-cols-3 gap-4">
        <DetailField
          label={translate("transaction")}
          value={confirmation.transactionId}
          monospace
        />
        <DetailField
          label={translate("created")}
          value={formatConfirmationDate(confirmation.createdDate)}
        />
        <DetailField
          label={translate("sentTo")}
          value={confirmation.sentTo || "—"}
        />
      </div>
    </div>
  );
}

interface ConfirmationCardActionsProperties {
  confirmation: Confirmation;
}

function ConfirmationCardActions(
  properties: ConfirmationCardActionsProperties,
) {
  const { confirmation } = properties;
  const { t: translate } = useTranslation("confirmations");

  return (
    <div className="flex items-center gap-4">
      <StatusBadge>{getStatusName(confirmation.status, translate)}</StatusBadge>
      <div className="flex items-center gap-2">
        <ActionButton
          icon={<Eye className="h-4 w-4" style={{ color: "#6B7280" }} />}
          title={translate("viewDetails")}
        />
        <ActionButton
          icon={<Download className="h-4 w-4" style={{ color: "#6B7280" }} />}
          title={translate("download")}
        />
        <ActionButton
          icon={<Send className="h-4 w-4" style={{ color: "#6B7280" }} />}
          title={translate("send")}
        />
      </div>
    </div>
  );
}

interface ConfirmationCardProperties {
  confirmation: Confirmation;
}

export function ConfirmationCard(properties: ConfirmationCardProperties) {
  const { confirmation } = properties;

  return (
    <div
      className="rounded-xl bg-white p-5 transition-all"
      style={{ border: "1px solid #E6E8EC" }}
      onMouseEnter={(event) =>
        (event.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)")
      }
      onMouseLeave={(event) => (event.currentTarget.style.boxShadow = "none")}
    >
      <div className="flex items-center justify-between">
        <ConfirmationCardInfo confirmation={confirmation} />
        <ConfirmationCardActions confirmation={confirmation} />
      </div>
    </div>
  );
}
