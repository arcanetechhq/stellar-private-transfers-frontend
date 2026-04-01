import React from "react";
import { Users, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MockToken } from "../model/create-transfer";
import { AssetField } from "./asset-field";
import { AmountField } from "./amount-field";

interface RecipientFieldProperties {
  recipient: string;
  onRecipientChange: (value: string) => void;
  onOpenContactPicker: () => void;
}

function RecipientField(properties: RecipientFieldProperties) {
  const { recipient, onRecipientChange, onOpenContactPicker } = properties;
  const { t: translate } = useTranslation("transfer");
  return (
    <div>
      <label
        className="mb-2 block"
        style={{ fontSize: "14px", lineHeight: "20px", color: "#344054", fontWeight: 600 }}
      >
        {translate("recipientAddress")}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={recipient}
          onChange={(event) => onRecipientChange(event.target.value)}
          placeholder={translate("recipientPlaceholder")}
          className="flex-1 rounded-lg px-4 py-3 font-mono focus:ring-2 focus:outline-none"
          style={{ border: "1px solid #E7EAF0", fontSize: "14px", color: "#121826" }}
        />
        <button
          type="button"
          onClick={onOpenContactPicker}
          className="flex items-center gap-2 rounded-lg px-4 py-3 whitespace-nowrap transition-colors"
          style={{
            fontSize: "13px",
            lineHeight: "18px",
            color: "#667085",
            border: "1px solid #E7EAF0",
            backgroundColor: "#FFFFFF",
          }}
          onMouseEnter={(event) =>
            (event.currentTarget.style.backgroundColor = "#F6F7F9")
          }
          onMouseLeave={(event) =>
            (event.currentTarget.style.backgroundColor = "#FFFFFF")
          }
        >
          <Users className="h-4 w-4" />
          {translate("selectFromContacts")}
        </button>
      </div>
    </div>
  );
}

interface NoteFieldProperties {
  note: string;
  onNoteChange: (value: string) => void;
}

function NoteField(properties: NoteFieldProperties) {
  const { note, onNoteChange } = properties;
  const { t: translate } = useTranslation("transfer");
  return (
    <div>
      <label
        className="mb-2 block"
        style={{ fontSize: "14px", lineHeight: "20px", color: "#344054", fontWeight: 600 }}
      >
        {translate("noteOptional")}
      </label>
      <textarea
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
        placeholder={translate("notePlaceholder")}
        rows={1}
        className="w-full resize-none rounded-lg px-4 py-3 focus:ring-2 focus:outline-none"
        style={{ border: "1px solid #E7EAF0", fontSize: "14px", color: "#121826" }}
      />
    </div>
  );
}

function PrivacyNotice() {
  const { t: translate } = useTranslation("transfer");
  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}
    >
      <div className="flex gap-3">
        <Info
          className="mt-0.5 h-5 w-5 flex-shrink-0"
          style={{ color: "#3B82F6" }}
        />
        <div>
          <p
            className="mb-1 font-semibold"
            style={{ fontSize: "14px", lineHeight: "20px", color: "#1E40AF" }}
          >
            {translate("privateTransferNotice")}
          </p>
          <p style={{ fontSize: "13px", lineHeight: "18px", color: "#1E40AF" }}>
            {translate("privateTransferDescription")}
          </p>
        </div>
      </div>
    </div>
  );
}

export interface TransferFormProperties {
  selectedToken: MockToken;
  amount: string;
  onAmountChange: (value: string) => void;
  recipient: string;
  onRecipientChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  onOpenTokenPicker: () => void;
  onOpenContactPicker: () => void;
  onPercentage: (percentage: number) => void;
  onMaxAmount: () => void;
}

export function TransferForm(properties: TransferFormProperties) {
  const {
    selectedToken, amount, onAmountChange, recipient, onRecipientChange,
    note, onNoteChange, onOpenTokenPicker, onOpenContactPicker, onPercentage, onMaxAmount,
  } = properties;
  return (
    <div className="lg:col-span-2">
      <div
        className="rounded-xl bg-white p-6"
        style={{ border: "1px solid #E7EAF0" }}
      >
        <div className="space-y-6">
          <AssetField
            selectedToken={selectedToken}
            onOpenTokenPicker={onOpenTokenPicker}
          />
          <AmountField
            amount={amount}
            onAmountChange={onAmountChange}
            onPercentage={onPercentage}
            onMaxAmount={onMaxAmount}
          />
          <RecipientField
            recipient={recipient}
            onRecipientChange={onRecipientChange}
            onOpenContactPicker={onOpenContactPicker}
          />
          <NoteField note={note} onNoteChange={onNoteChange} />
          <PrivacyNotice />
        </div>
      </div>
    </div>
  );
}
