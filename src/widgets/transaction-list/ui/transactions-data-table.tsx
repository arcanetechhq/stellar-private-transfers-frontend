import type { CSSProperties, ReactNode } from "react";
import type { Transaction } from "@/entities/transaction";
import {
  TransactionActivityCell,
  TransactionAmountCell,
  TransactionDateCell,
} from "./transaction-table-cells";

export type TransactionsDataTableColumn<T> = {
  key: string;
  title: ReactNode;
  width?: string;
  flex?: number;
  minWidth?: number;
  maxWidth?: number;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
};

type TransactionsDataTableProperties<T> = {
  columns: TransactionsDataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedKey?: string;
};

function toSize(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

function getColumnStyle(
  column: TransactionsDataTableColumn<unknown>,
): CSSProperties {
  const width = column.width ? toSize(column.width) : undefined;
  const style: CSSProperties = width
    ? {
        width,
        flex: `0 0 ${width}`,
      }
    : {
        flex: `${column.flex ?? 1} 1 0px`,
      };

  if (column.minWidth !== undefined) {
    style.minWidth = toSize(column.minWidth);
  }
  if (column.maxWidth !== undefined) {
    style.maxWidth = toSize(column.maxWidth);
  }

  return style;
}

export function TransactionsDataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  selectedKey,
}: TransactionsDataTableProperties<T>) {
  return (
    <div className="transactions-data-table" role="table">
      <div className="transactions-data-table__header-row" role="row">
        {columns.map((column) => (
          <div
            className="transactions-data-table__header-cell"
            data-align={column.align}
            data-col-key={column.key}
            key={column.key}
            role="columnheader"
            style={getColumnStyle(column)}
          >
            {column.title}
          </div>
        ))}
      </div>
      <div className="transactions-data-table__body" role="rowgroup">
        {rows.map((row) => {
          const key = rowKey(row);
          const interactive = Boolean(onRowClick);

          return (
            <div
              className="transactions-data-table__row"
              key={key}
              data-interactive={interactive}
              data-selected={selectedKey === key}
              role="row"
              tabIndex={interactive ? 0 : undefined}
              onClick={interactive ? () => onRowClick?.(row) : undefined}
              onKeyDown={
                interactive
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick?.(row);
                      }
                    }
                  : undefined
              }
            >
              {columns.map((column) => (
                <div
                  className="transactions-data-table__cell"
                  data-align={column.align}
                  data-col-key={column.key}
                  key={column.key}
                  role="cell"
                  style={getColumnStyle(column)}
                >
                  {column.render(row)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function buildTransactionTableColumns(options: {
  dateTitle: ReactNode;
  activityTitle: ReactNode;
  amountTitle: ReactNode;
  getTransactionLabel: (transaction: Transaction) => string;
}): TransactionsDataTableColumn<Transaction>[] {
  const {
    dateTitle,
    activityTitle,
    amountTitle,
    getTransactionLabel,
  } = options;

  const columns: TransactionsDataTableColumn<Transaction>[] = [
    {
      key: "date",
      title: dateTitle,
      flex: 0.5,
      minWidth: 20,
      maxWidth: 96,
      render: (transaction) => (
        <TransactionDateCell date={transaction.date} />
      ),
    },
    {
      key: "activity",
      title: activityTitle,
      flex: 1,
      minWidth: 48,
      render: (transaction) => (
        <TransactionActivityCell
          transaction={transaction}
          title={getTransactionLabel(transaction)}
        />
      ),
    },
  ];

  columns.push({
    key: "amount",
    title: amountTitle,
    flex: 0.8,
    minWidth: 20,
    maxWidth: 180,
    align: "right",
    render: (transaction) => (
      <TransactionAmountCell transaction={transaction} />
    ),
  });

  return columns;
}
