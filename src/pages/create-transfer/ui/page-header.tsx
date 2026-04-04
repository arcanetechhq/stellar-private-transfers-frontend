import { ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

export function PageHeader() {
  const navigate = useNavigate();
  const { t: translate } = useTranslation("transfer");

  const handleBackToHome = () => {
    navigate("/", { flushSync: true });
  };

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={handleBackToHome}
        className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[var(--border-input)] bg-[var(--surface-card)] px-3 py-2 text-sm leading-5 text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {translate("backToHome")}
      </button>
      <h1 className="text-[32px] leading-10 font-semibold text-[var(--foreground-primary)]">
        {translate("pageTitle")}
      </h1>
      <p className="mt-1 text-base leading-6 text-[var(--foreground-secondary)]">
        {translate("pageSubtitle")}
      </p>
    </div>
  );
}
