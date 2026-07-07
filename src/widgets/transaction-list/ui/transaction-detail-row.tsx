import type { MouseEvent } from "react";
import { ArrowUpRightFromSquareIcon, Copy } from "lucide-react";

type TransactionDetailRowProperties = {
  label: string;
  value: string;
  link?: string;
  copyable?: boolean;
  showLink?: boolean;
};

export function TransactionDetailRow({
  label,
  value,
  link,
  copyable = false,
  showLink = false,
}: TransactionDetailRowProperties) {
  function handleCopy(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (value === "") {
      return;
    }
    void navigator.clipboard?.writeText(value);
  }

  return (
    <div className="transaction-detail-row">
      <span className="transaction-detail-row__label">{label}</span>
      <span className="transaction-detail-row__value">
        <span className="transaction-detail-row__text">{value}</span>
        {copyable && value !== "" ? (
          <button
            type="button"
            className="transaction-detail-row__copy"
            aria-label={`Copy ${label}`}
            onClick={handleCopy}
          >
            <Copy aria-hidden="true" />
          </button>
        ) : null}
        {(showLink && link) && (
          <button
          type="button"
          className="transaction-detail-row__copy"
          aria-label={`Copy ${label}`}
          onClick={() => window.open(link, "_blank")}
        >
          <ArrowUpRightFromSquareIcon aria-hidden="true" />
        </button>
        )}
      </span>
    </div>
  );
}
