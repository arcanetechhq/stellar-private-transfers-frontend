import type { ReactNode } from "react";

type RecordsTableColumn<Row> = {
  key: string;
  title: string;
  align?: "right";
  render?: (row: Row) => ReactNode;
};

type RecordsTableContentProperties<Row extends { id: number | string }> = {
  columns: RecordsTableColumn<Row>[];
  rows: Row[];
  onRowClick?: (row: Row) => void;
};

export function RecordsTableContent<Row extends { id: number | string }>({
  columns,
  rows,
  onRowClick,
}: RecordsTableContentProperties<Row>) {
  return (
    <div className="records-table-wrap">
      <table className="records-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th data-align={column.align} key={column.key}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              data-interactive={onRowClick ? "true" : undefined}
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <td data-align={column.align} key={column.key}>
                  {column.render
                    ? column.render(row)
                    : (row as Record<string, ReactNode>)[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
