import React from "react";
import { Search, X, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TokenIcon } from "@/shared/ui/token-icon";
import type { Token } from "../model/create-deposit";

interface TokenListItemProperties {
  token: Token;
  isSelected: boolean;
  onSelect: (token: Token) => void;
}

function TokenListItem(properties: TokenListItemProperties) {
  const { token, isSelected, onSelect } = properties;
  const formattedValue = (token.balance * token.price).toLocaleString(
    undefined,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  );

  return (
    <button
      onClick={() => onSelect(token)}
      className="flex w-full items-center justify-between rounded-lg px-3 py-3 transition-colors"
      style={{ backgroundColor: isSelected ? "#F6F7F9" : "transparent" }}
      onMouseEnter={(event) => {
        if (!isSelected)
          event.currentTarget.style.backgroundColor = "#F9FAFB";
      }}
      onMouseLeave={(event) => {
        if (!isSelected)
          event.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div className="flex items-center gap-3">
        <TokenIcon ticker={token.ticker} size={40} />
        <div className="text-left">
          <p
            className="font-semibold"
            style={{ fontSize: "14px", lineHeight: "20px", color: "#121826" }}
          >
            {token.ticker}
          </p>
          <p style={{ fontSize: "13px", lineHeight: "18px", color: "#667085" }}>
            {token.name}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-right">
        <div>
          <p
            className="font-semibold"
            style={{ fontSize: "14px", lineHeight: "20px", color: token.balance > 0 ? "#121826" : "#98A2B3" }}
          >
            {token.balance.toLocaleString()}
          </p>
          <p style={{ fontSize: "12px", lineHeight: "16px", color: "#667085" }}>
            ${formattedValue}
          </p>
        </div>
        {isSelected && (
          <Check className="h-5 w-5" style={{ color: "#10B981" }} />
        )}
      </div>
    </button>
  );
}

interface PickerHeaderProperties {
  onClose: () => void;
}

function PickerHeader(properties: PickerHeaderProperties) {
  const { onClose } = properties;
  const { t: translate } = useTranslation("deposit");

  return (
    <div
      className="flex items-center justify-between border-b p-6"
      style={{ borderColor: "#E7EAF0" }}
    >
      <h3
        className="font-semibold"
        style={{ fontSize: "18px", lineHeight: "28px", color: "#121826" }}
      >
        {translate("selectAsset")}
      </h3>
      <button
        onClick={onClose}
        className="rounded-lg p-2 transition-colors"
        style={{ color: "#667085" }}
        onMouseEnter={(event) =>
          (event.currentTarget.style.backgroundColor = "#F6F7F9")
        }
        onMouseLeave={(event) =>
          (event.currentTarget.style.backgroundColor = "transparent")
        }
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

interface TokenPickerModalProperties {
  filteredTokens: Token[];
  selectedTokenId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTokenSelect: (token: Token) => void;
  onClose: () => void;
}

export function TokenPickerModal(properties: TokenPickerModalProperties) {
  const {
    filteredTokens,
    selectedTokenId,
    searchQuery,
    onSearchChange,
    onTokenSelect,
    onClose,
  } = properties;
  const { t: translate } = useTranslation("deposit");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="m-4 w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        style={{ maxHeight: "80vh", display: "flex", flexDirection: "column" }}
      >
        <PickerHeader onClose={onClose} />
        <div className="px-6 pt-4 pb-3">
          <div className="relative">
            <Search
              className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              style={{ color: "#667085" }}
            />
            <input
              type="text"
              placeholder={translate("searchAssetPlaceholder")}
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full rounded-lg py-2.5 pr-4 pl-10 focus:ring-2 focus:outline-none"
              style={{ border: "1px solid #E7EAF0", fontSize: "14px", color: "#121826" }}
              autoFocus
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {filteredTokens.length === 0 ? (
            <div className="py-12 text-center">
              <p style={{ fontSize: "14px", lineHeight: "20px", color: "#667085" }}>
                {translate("noTokensFound")}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTokens.map((token) => (
                <TokenListItem
                  key={token.id}
                  token={token}
                  isSelected={selectedTokenId === token.id}
                  onSelect={onTokenSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
