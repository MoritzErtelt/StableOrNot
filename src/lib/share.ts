import { toPng } from "html-to-image";
import type { ScoreSummary } from "./scoring";

function metric(value: number | null | undefined): string {
  return value == null || !Number.isFinite(value) ? "n/a" : value.toFixed(2);
}

export function resultText(args: {
  user: ScoreSummary;
  sota: ScoreSummary | null;
  secondary: ScoreSummary | null;
  baseline: ScoreSummary | null;
  nItems: number;
}): string {
  return `Protein Stability Game: I scored Spearman ${metric(
    args.user.spearman,
  )} over ${args.nItems} small protein domains. SOTA model: ${metric(
    args.sota?.spearman,
  )}, second model: ${metric(
    args.secondary?.spearman,
  )}, hydrophobic baseline: ${metric(
    args.baseline?.spearman,
  )}. Scored locally, no data stored.`;
}

export async function copyResultText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export async function downloadResultCard(node: HTMLElement): Promise<void> {
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#f7f3e8",
  });
  const link = document.createElement("a");
  link.download = "protein-stability-game-result.png";
  link.href = dataUrl;
  link.click();
}
