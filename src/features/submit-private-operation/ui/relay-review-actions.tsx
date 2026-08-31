import React from "react";
import { useTranslation } from "react-i18next";

export function RelayReviewActions(properties: {
  retryAllowed: boolean;
  fallbackAllowed: boolean;
  disabled: boolean;
  onRetry: () => void;
  onFallback: () => void;
}): React.JSX.Element | undefined {
  const { t: translate } = useTranslation("relay");
  if (!properties.retryAllowed && !properties.fallbackAllowed) {
    return undefined;
  }
  return (
    <div className="send-review-actions">
      {properties.fallbackAllowed ? (
        <p className="send-money-error" role="note">
          {translate("privacyFallbackWarning")}
        </p>
      ) : undefined}
      {properties.retryAllowed ? (
        <button
          type="button"
          className="send-review-action send-review-action--send"
          disabled={properties.disabled}
          onClick={properties.onRetry}
        >
          {translate("retryRelay")}
        </button>
      ) : undefined}
      {properties.fallbackAllowed ? (
        <button
          type="button"
          className="send-review-action send-review-action--send"
          disabled={properties.disabled}
          onClick={properties.onFallback}
        >
          {translate("submitWithWallet")}
        </button>
      ) : undefined}
    </div>
  );
}
