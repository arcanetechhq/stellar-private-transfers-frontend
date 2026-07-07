const SELECTED_TRANSACTION_SEARCH_KEY = "selected";

export function buildTransactionsPathWithSelection(
  transactionId: string,
): string {
  const trimmed = transactionId.trim();
  if (!trimmed) {
    return "/transactions";
  }
  const parameters = new URLSearchParams();
  parameters.set(SELECTED_TRANSACTION_SEARCH_KEY, trimmed);
  return `/transactions?${parameters.toString()}`;
}

export function readSelectedTransactionIdFromSearch(
  searchParameters: URLSearchParams,
): string | undefined {
  const value = searchParameters.get(SELECTED_TRANSACTION_SEARCH_KEY)?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function writeSelectedTransactionIdToSearch(
  searchParameters: URLSearchParams,
  transactionId?: string,
): URLSearchParams {
  const next = new URLSearchParams(searchParameters);
  if (transactionId) {
    next.set(SELECTED_TRANSACTION_SEARCH_KEY, transactionId);
  } else {
    next.delete(SELECTED_TRANSACTION_SEARCH_KEY);
  }
  return next;
}
