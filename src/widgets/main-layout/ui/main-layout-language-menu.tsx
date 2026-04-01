import React from "react";
type LanguageOption = { code: string; name: string; flag: string };
const ACTIVE_FONT_WEIGHT = 600;
const DEFAULT_FONT_WEIGHT = 400;

type MainLayoutLanguageMenuProperties = {
  isOpen: boolean;
  onClose: () => void;
  languages: LanguageOption[];
  currentLanguage: string;
  onSelectLanguage: (code: string) => void;
};

export function MainLayoutLanguageMenu({
  isOpen,
  onClose,
  languages,
  currentLanguage,
  onSelectLanguage,
}: MainLayoutLanguageMenuProperties) {
  if (!isOpen) {
    return;
  }

  return (
    <React.Fragment>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div
        className="absolute right-0 z-20 mt-2 w-56 rounded-xl bg-white shadow-lg"
        style={{
          border: "1px solid #E7EAF0",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="py-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
              style={{
                fontSize: "14px",
                lineHeight: "20px",
                color: currentLanguage === lang.code ? "#111827" : "#667085",
                backgroundColor:
                  currentLanguage === lang.code ? "#F9FAFB" : "transparent",
                fontWeight:
                  currentLanguage === lang.code
                    ? ACTIVE_FONT_WEIGHT
                    : DEFAULT_FONT_WEIGHT,
              }}
              onClick={() => onSelectLanguage(lang.code)}
              onMouseEnter={(event) => {
                if (currentLanguage !== lang.code) {
                  event.currentTarget.style.backgroundColor = "#F9FAFB";
                }
              }}
              onMouseLeave={(event) => {
                if (currentLanguage !== lang.code) {
                  event.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span style={{ fontSize: "20px" }}>{lang.flag}</span>
              <span>{lang.name}</span>
              {currentLanguage === lang.code && (
                <div
                  className="ml-auto h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "#10B981" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}
