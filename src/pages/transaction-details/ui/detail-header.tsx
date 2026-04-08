import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface DetailHeaderProperties {
  transactionId: string | undefined;
}

export function DetailHeader(properties: DetailHeaderProperties) {
  const { transactionId } = properties;
  const { t: translate } = useTranslation("transactionDetails");
  const stellarExpertTransactionUrl = React.useMemo(
    () =>
      transactionId
        ? `https://stellar.expert/explorer/testnet/tx/${encodeURIComponent(transactionId)}`
        : undefined,
    [transactionId],
  );

  return (
    <div className="mb-6">
      <Link
        to="/history"
        className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
        style={{
          fontSize: "14px",
          lineHeight: "20px",
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
        <ArrowLeft className="h-4 w-4" />
        {translate("backToHistory")}
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-semibold text-[var(--foreground-primary)]">
            {translate("title")}
          </h1>
          <p className="flex items-center gap-2 text-[var(--foreground-secondary)]">
            {translate("idPrefix")}
            {transactionId}
            {stellarExpertTransactionUrl ? (
              <a
                href={stellarExpertTransactionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-1 text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
                title={translate("openInStellarExpert")}
                aria-label={translate("openInStellarExpert")}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : undefined}
          </p>
        </div>
      </div>
    </div>
  );
}
