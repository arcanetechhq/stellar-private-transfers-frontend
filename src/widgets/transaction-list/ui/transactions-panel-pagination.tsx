import { ChevronLeft, ChevronRight } from "lucide-react";

type TransactionsPanelPaginationProperties = {
  navLabel: string;
  currentPage: number;
  totalPages: number;
  previousLabel: string;
  nextLabel: string;
  onPageChange: (page: number) => void;
};

export function TransactionsPanelPagination({
  navLabel,
  currentPage,
  totalPages,
  previousLabel,
  nextLabel,
  onPageChange,
}: TransactionsPanelPaginationProperties) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      className="transactions-panel__pagination"
      aria-label={navLabel}
    >
      <button
        type="button"
        className="transactions-panel__pagination-button"
        disabled={currentPage <= 1}
        aria-label={previousLabel}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      <div className="transactions-panel__pagination-pages">
        {pages.map((page) => (
          <button
            type="button"
            key={page}
            className="transactions-panel__pagination-page"
            data-active={page === currentPage}
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="transactions-panel__pagination-button"
        disabled={currentPage >= totalPages}
        aria-label={nextLabel}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}
