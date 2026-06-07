type ProgressBarProps = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.min(100, (current / total) * 100);
  return (
    <div className="progress-wrap" aria-label={`Protein ${current} of ${total}`}>
      <div className="progress-meta">
        <span>Protein {current}</span>
        <span>{total} total</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
