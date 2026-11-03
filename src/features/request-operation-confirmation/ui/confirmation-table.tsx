import type { ConfirmationPreviewRow } from "../api/operation-confirmation-api";

type ConfirmationTableLabels = {
  date: string;
  type: string;
  amount: string;
  from: string;
  to: string;
};

export function ConfirmationTable(input: {
  rows: ConfirmationPreviewRow[];
  labels: ConfirmationTableLabels;
}) {
  const { rows, labels } = input;
  return (
    <div className="confirmation-table-wrap">
      <table className="confirmation-table">
        <thead>
          <tr>
            <th>{labels.date}</th>
            <th>{labels.type}</th>
            <th>{labels.amount}</th>
            <th>{labels.from}</th>
            <th>{labels.to}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{shortTimestamp(row.date)}</td>
              <td>{row.type}</td>
              <td>{`${row.amount} ${row.asset}`}</td>
              <td className="confirmation-table__party" title={row.sender}>
                {row.sender}
              </td>
              <td className="confirmation-table__party" title={row.recipient}>
                {row.recipient}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function shortTimestamp(value: string): string {
  const [date, time = ""] = value.split("T");
  const clock = time.split(".")[0] ?? "";
  return clock ? `${date ?? ""} ${clock}` : (date ?? value);
}
