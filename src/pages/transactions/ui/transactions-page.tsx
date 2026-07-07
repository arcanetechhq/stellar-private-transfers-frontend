import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useAppSelector } from "@/store";
import {
  selectAreTransactionsLoaded,
  selectTransactionById,
  selectTransactions,
  sortTransactionsByDateDesc,
} from "@/entities/transaction";
import {
  readSelectedTransactionIdFromSearch,
  TransactionDetailsPanel,
  TransactionsPanel,
  writeSelectedTransactionIdToSearch,
} from "@/widgets/transaction-list";

export function TransactionsPage() {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const selectedFromSearch = readSelectedTransactionIdFromSearch(searchParameters);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(selectedFromSearch);
  const transactions = useAppSelector(selectTransactions);
  const transactionsLoaded = useAppSelector(selectAreTransactionsLoaded);
  const sortedTransactions = useMemo(
    () => sortTransactionsByDateDesc(transactions),
    [transactions],
  );
  const selectedTransaction = useAppSelector((state) =>
    selectedTransactionId
      ? selectTransactionById(selectedTransactionId)(state)
      : undefined,
  );

  useEffect(() => {
    setSelectedTransactionId(selectedFromSearch);
  }, [selectedFromSearch]);

  function handleTransactionSelect(transactionId: string) {
    setSelectedTransactionId((current) => {
      const nextSelectedId = current === transactionId ? null : transactionId;
      setSearchParameters(
        (currentParameters) =>
          writeSelectedTransactionIdToSearch(
            currentParameters,
            nextSelectedId,
          ),
        { replace: true },
      );
      return nextSelectedId;
    });
  }

  function handleCloseDetails() {
    setSelectedTransactionId(null);
    setSearchParameters(
      (currentParameters) =>
        writeSelectedTransactionIdToSearch(currentParameters, null),
      { replace: true },
    );
  }

  return (
    <div className="transactions-page bg-background">
      <div
        className="transactions-route"
        data-details-open={Boolean(selectedTransaction)}
      >
        <section className="transactions-route__main">
          <TransactionsPanel
            transactions={sortedTransactions}
            isHydrated={transactionsLoaded}
            variant="page"
            selectedTransactionId={selectedTransactionId ?? undefined}
            onTransactionSelect={handleTransactionSelect}
          />
        </section>
        <aside
          className="transactions-route__panel"
          aria-hidden={!selectedTransaction}
        >
          {selectedTransaction ? (
            <TransactionDetailsPanel
              transaction={selectedTransaction}
              onClose={handleCloseDetails}
            />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
