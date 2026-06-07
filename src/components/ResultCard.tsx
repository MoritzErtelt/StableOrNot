import React from "react";
import type { Item } from "../lib/items";
import type { ComparatorScores } from "../lib/scoring";
import { copyResultText, downloadResultCard, resultText } from "../lib/share";
import MetricTable from "./MetricTable";
import ScatterPlot from "./ScatterPlot";
import SpearmanBars from "./SpearmanBars";

type ResultCardProps = {
  items: readonly Item[];
  guesses: readonly number[];
  scores: ComparatorScores;
  onPlayAgain: () => void;
};

function verdict(spearman: number | null): string {
  if (spearman === null) return "not enough signal";
  if (spearman < 0.1) return "mostly noise";
  if (spearman < 0.3) return "some signal";
  if (spearman < 0.5) return "real stability intuition";
  if (spearman < 0.7) return "strong visual intuition";
  return "protein wizard territory";
}

const VERDICT_SCALE = [
  "< 0.10: mostly noise",
  "0.10-0.30: some signal",
  "0.30-0.50: real stability intuition",
  "0.50-0.70: strong visual intuition",
  "> 0.70: protein wizard territory",
];

function fmt(value: number | null): string {
  return value === null ? "n/a" : value.toFixed(2);
}

export default function ResultCard({ items, guesses, scores, onPlayAgain }: ResultCardProps) {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const [message, setMessage] = React.useState<string>("");
  const firstItem = items[0];
  const sotaName = firstItem?.predictions.sota_name || "SOTA model";
  const secondaryName = firstItem?.predictions.secondary_name || "Second model";
  const text = resultText({
    user: scores.user,
    sota: scores.sota,
    secondary: scores.secondary,
    baseline: scores.baseline,
    nItems: items.length,
  });

  const copy = async () => {
    try {
      await copyResultText(text);
      setMessage("Result text copied.");
    } catch {
      setMessage("Copy failed. You can select and copy the result text manually.");
    }
  };

  const download = async () => {
    if (!cardRef.current) return;
    try {
      await downloadResultCard(cardRef.current);
      setMessage("Downloaded result card.");
    } catch {
      setMessage("Use your browser screenshot tool to capture the result card.");
    }
  };

  return (
    <main className="result-page">
      <section className="result-card" ref={cardRef}>
        <div className="result-header">
          <div>
            <p className="eyebrow">StableOrNot</p>
            <h1>Protein Stability Game</h1>
          </div>
          <div className="score-lockup">
            <span>Spearman</span>
            <strong>{fmt(scores.user.spearman)}</strong>
          </div>
        </div>
        <div className="verdict">{verdict(scores.user.spearman)}</div>
        <div className="verdict-scale" aria-label="Verdict scale">
          <strong>Score categories</strong>
          {VERDICT_SCALE.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <p className="comparison-note">
          Model and baseline comparisons are scored on the exact same {items.length} proteins
          in this run.
        </p>
        <MetricTable
          rows={[
            { label: "You", score: scores.user },
            { label: sotaName, score: scores.sota },
            { label: secondaryName, score: scores.secondary },
            { label: "Hydrophobic baseline", score: scores.baseline },
          ]}
        />
        <div className="result-visuals">
          <ScatterPlot items={items} guesses={guesses} />
          <SpearmanBars
            bars={[
              { label: "You", value: scores.user.spearman },
              { label: "ESM3C", value: scores.sota?.spearman },
              { label: "SaProt", value: scores.secondary?.spearman },
              { label: "Baseline", value: scores.baseline?.spearman },
            ]}
          />
        </div>
        <footer>
          {items.length} small protein domains, scored locally in browser. Data: Cho et al.
          No data stored.
        </footer>
      </section>
      <div className="result-actions">
        <button type="button" className="primary-action" onClick={onPlayAgain}>
          Play again
        </button>
        <button type="button" onClick={copy}>
          Copy result text
        </button>
        <button type="button" onClick={download}>
          Download result card PNG
        </button>
      </div>
      {message && <p className="status-message">{message}</p>}
    </main>
  );
}
