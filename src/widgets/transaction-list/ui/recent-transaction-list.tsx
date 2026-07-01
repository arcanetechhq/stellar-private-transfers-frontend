import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { cn } from "@/shared/lib/cn";
import type { Transaction } from "@/entities/transaction";
import { RecentTransactionRow } from "./recent-transaction-row";

interface RecentTransactionListProperties {
  transactions: Transaction[];
  isHydrated: boolean;
}

export function RecentTransactionList(
  properties: RecentTransactionListProperties,
) {
  const { transactions } = properties;
  const { isHydrated } = properties;
  const { t: translate } = useTranslation("overview");

  return (
    <div
      className={cn(
        "flex h-[260px] w-full shrink-0 flex-col overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--card)]",
      )}
    >
      <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <p className="text-[15px] leading-[22px] font-semibold text-[var(--foreground-primary)]">
          {translate("recentTransactions")}
        </p>
        <Link to="/history">
          <button
            type="button"
            className="text-[13px] leading-[18px] font-semibold text-[var(--foreground-secondary)] transition-colors hover:text-[var(--foreground-primary)]"
          >
            {translate("viewAll")}
          </button>
        </Link>
      </div>
      <div className="flex-1 divide-y divide-[var(--border)]">
        {transactions.length > 0 &&
          transactions.map((transaction) => (
            <RecentTransactionRow key={transaction.id} transaction={transaction} />
          ))}
        {isHydrated && transactions.length === 0 && (
          <div className="flex h-full items-center justify-center px-5 text-center">
            <p className="text-[13px] leading-[18px] text-[var(--foreground-secondary)]">
              {translate("noRecentTransactions")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
