import type { ScoreSummary } from "../lib/scoring";

type MetricTableProps = {
  rows: {
    label: string;
    score: ScoreSummary | null;
  }[];
};

function fmt(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "n/a";
  return value.toFixed(digits);
}

export default function MetricTable({ rows }: MetricTableProps) {
  return (
    <table className="metric-table">
      <thead>
        <tr>
          <th>Comparator</th>
          <th>Spearman</th>
          <th>Pearson</th>
          <th>RMSE</th>
          <th>Pairwise</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th>{row.label}</th>
            <td>{fmt(row.score?.spearman)}</td>
            <td>{fmt(row.score?.pearson)}</td>
            <td>{fmt(row.score?.rmse)}</td>
            <td>{fmt(row.score?.pairwiseAccuracy)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
