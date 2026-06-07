type Bar = {
  label: string;
  value: number | null | undefined;
};

type SpearmanBarsProps = {
  bars: Bar[];
};

export default function SpearmanBars({ bars }: SpearmanBarsProps) {
  return (
    <div className="bars" aria-label="Spearman comparison">
      {bars.map((bar) => {
        const value = bar.value ?? 0;
        const width = `${Math.max(0, Math.min(100, ((value + 1) / 2) * 100))}%`;
        return (
          <div className="bar-row" key={bar.label}>
            <span>{bar.label}</span>
            <div className="bar-track">
              <div className="bar-midline" />
              <div className="bar-fill" style={{ width }} />
            </div>
            <strong>{bar.value == null ? "n/a" : bar.value.toFixed(2)}</strong>
          </div>
        );
      })}
    </div>
  );
}
