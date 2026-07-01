import type { LucideIcon } from "lucide-react";
import { ArrowLeftRight, Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";

export type TransactionsPanelEmptyKind =
  | "disconnected"
  | "loading"
  | "empty"
  | "filtered";

type TransactionsPanelEmptyStateProperties = {
  kind: TransactionsPanelEmptyKind;
  onClearFilters?: () => void;
};

function EmptyStateIconFrame({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="transactions-panel-empty__icon-frame" aria-hidden="true">
      <Icon />
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="transactions-panel-empty__skeleton" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div className="transactions-panel-empty__skeleton-row" key={index}>
          <span className="transactions-panel-empty__skeleton-cell" />
          <span className="transactions-panel-empty__skeleton-cell" />
          <span className="transactions-panel-empty__skeleton-cell" />
        </div>
      ))}
    </div>
  );
}

export function TransactionsPanelEmptyState({
  kind,
  onClearFilters,
}: TransactionsPanelEmptyStateProperties) {
  const { t: translate } = useTranslation("transactions");

  if (kind === "disconnected") {
    return (
      <div className="transactions-panel-empty transactions-panel-empty--plain">
        <p className="transactions-panel-empty__plain-text">
          {translate("emptyState.connectWalletHint")}
        </p>
      </div>
    );
  }

  if (kind === "loading") {
    return (
      <div
        className="transactions-panel-empty"
        data-kind={kind}
        aria-busy="true"
        aria-live="polite"
      >
        <EmptyStateIconFrame icon={ArrowLeftRight} />
        <div className="transactions-panel-empty__copy">
          <p className="transactions-panel-empty__title">
            {translate("emptyState.loadingTitle")}
          </p>
          <p className="transactions-panel-empty__text">
            {translate("emptyState.loadingHint")}
          </p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  const isFiltered = kind === "filtered";

  return (
    <div className="transactions-panel-empty" data-kind={kind}>
      <EmptyStateIconFrame icon={Inbox} />
      <div className="transactions-panel-empty__copy">
        <p className="transactions-panel-empty__title">
          {translate(
            isFiltered ? "noTransactionsFound" : "emptyState.emptyTitle",
          )}
        </p>
        <p className="transactions-panel-empty__text">
          {translate(
            isFiltered ? "noTransactionsHint" : "emptyState.emptyHint",
          )}
        </p>
      </div>
      {isFiltered && onClearFilters ? (
        <button
          type="button"
          className="transactions-panel-empty__action"
          onClick={onClearFilters}
        >
          {translate("clearFilters")}
        </button>
      ) : null}
    </div>
  );
}
