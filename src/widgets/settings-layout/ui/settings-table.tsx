import type { CSSProperties, ReactNode } from "react";

type SettingsTableColumn<T> = {
  key: string;
  title: string;
  width?: string;
  align?: "left" | "right";
  render?: (row: T) => ReactNode;
};

type SettingsTableProperties<T extends Record<string, unknown>> = {
  columns: SettingsTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
};

export function SettingsTable<T extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
}: SettingsTableProperties<T>) {
  const template = columns
    .map((column) => column.width ?? "minmax(0, 1fr)")
    .join(" ");

  return (
    <div
      className="settings-table-card"
      style={{ "--settings-table-columns": template } as CSSProperties}
    >
      <div className="settings-data-table">
        <div className="settings-data-table__row settings-data-table__row--head">
          {columns.map((column) => (
            <span className="settings-data-table__head" key={column.key}>
              {column.title}
            </span>
          ))}
        </div>
        {rows.map((row) => (
          <div className="settings-data-table__row" key={rowKey(row)}>
            {columns.map((column) => (
              <span
                className="settings-data-table__cell"
                data-align={column.align}
                key={column.key}
              >
                {column.render
                  ? column.render(row)
                  : String(row[column.key] ?? "")}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
