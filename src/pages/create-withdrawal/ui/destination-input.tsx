import React from "react";
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DestinationInputProperties {
  destinationWallet: string;
  onDestinationChange: (value: string) => void;
  onOpenContactPicker: () => void;
}

export function DestinationInput(properties: DestinationInputProperties) {
  const { destinationWallet, onDestinationChange, onOpenContactPicker } = properties;
  const { t: translate } = useTranslation("withdrawal");

  return (
    <div>
      <label
        className="mb-2 block"
        style={{ fontSize: "14px", lineHeight: "20px", color: "#344054", fontWeight: 600 }}
      >
        {translate("destinationWallet")}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={destinationWallet}
          onChange={(event) => onDestinationChange(event.target.value)}
          placeholder={translate("destinationPlaceholder")}
          className="flex-1 rounded-lg px-4 py-3 font-mono focus:ring-2 focus:outline-none"
          style={{ border: "1px solid #E7EAF0", fontSize: "14px", color: "#121826" }}
        />
        <button
          type="button"
          onClick={onOpenContactPicker}
          className="flex items-center gap-2 rounded-lg px-4 py-3 whitespace-nowrap transition-colors"
          style={{ fontSize: "13px", lineHeight: "18px", color: "#667085", border: "1px solid #E7EAF0", backgroundColor: "#FFFFFF" }}
          onMouseEnter={(event) => (event.currentTarget.style.backgroundColor = "#F6F7F9")}
          onMouseLeave={(event) => (event.currentTarget.style.backgroundColor = "#FFFFFF")}
        >
          <Users className="h-4 w-4" />
          {translate("selectFromContacts")}
        </button>
      </div>
      <p className="mt-2" style={{ fontSize: "13px", lineHeight: "18px", color: "#667085" }}>
        {translate("defaultWalletHint")}
      </p>
    </div>
  );
}
