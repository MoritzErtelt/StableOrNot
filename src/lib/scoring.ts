import type { Item } from "./items";

export type ScoreSummary = {
  spearman: number | null;
  pearson: number | null;
  rmse: number | null;
  mae: number | null;
  pairwiseAccuracy: number | null;
};

export type ComparatorScores = {
  user: ScoreSummary;
  sota: ScoreSummary | null;
  secondary: ScoreSummary | null;
  baseline: ScoreSummary | null;
};

export function mean(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function variance(values: readonly number[]): number {
  const avg = mean(values);
  if (avg === null) return 0;
  return values.reduce((sum, value) => sum + (value - avg) ** 2, 0);
}

export function pearson(x: readonly number[], y: readonly number[]): number | null {
  if (x.length !== y.length || x.length < 2) return null;
  const meanX = mean(x);
  const meanY = mean(y);
  if (meanX === null || meanY === null) return null;

  let numerator = 0;
  for (let index = 0; index < x.length; index += 1) {
    numerator += (x[index] - meanX) * (y[index] - meanY);
  }

  const denominator = Math.sqrt(variance(x) * variance(y));
  if (denominator === 0) return null;
  return numerator / denominator;
}

export function rankAverageTies(values: readonly number[]): number[] {
  const indexed = values.map((value, index) => ({ value, index }));
  indexed.sort((a, b) => a.value - b.value);

  const ranks = new Array<number>(values.length);
  let cursor = 0;
  while (cursor < indexed.length) {
    let end = cursor + 1;
    while (end < indexed.length && indexed[end].value === indexed[cursor].value) {
      end += 1;
    }
    const averageRank = (cursor + 1 + end) / 2;
    for (let rankIndex = cursor; rankIndex < end; rankIndex += 1) {
      ranks[indexed[rankIndex].index] = averageRank;
    }
    cursor = end;
  }

  return ranks;
}

export function spearman(x: readonly number[], y: readonly number[]): number | null {
  if (x.length !== y.length || x.length < 2) return null;
  return pearson(rankAverageTies(x), rankAverageTies(y));
}

export function rmse(guess: readonly number[], truth: readonly number[]): number | null {
  if (guess.length !== truth.length || guess.length === 0) return null;
  const mse =
    guess.reduce((sum, value, index) => sum + (value - truth[index]) ** 2, 0) /
    guess.length;
  return Math.sqrt(mse);
}

export function mae(guess: readonly number[], truth: readonly number[]): number | null {
  if (guess.length !== truth.length || guess.length === 0) return null;
  return (
    guess.reduce((sum, value, index) => sum + Math.abs(value - truth[index]), 0) /
    guess.length
  );
}

export function pairwiseAccuracy(
  guess: readonly number[],
  truth: readonly number[],
): number | null {
  if (guess.length !== truth.length || guess.length < 2) return null;

  let total = 0;
  let correct = 0;
  for (let left = 0; left < truth.length; left += 1) {
    for (let right = left + 1; right < truth.length; right += 1) {
      const truthDelta = truth[left] - truth[right];
      if (truthDelta === 0) continue;
      total += 1;
      const guessDelta = guess[left] - guess[right];
      if (guessDelta === 0) {
        correct += 0.5;
      } else if (Math.sign(guessDelta) === Math.sign(truthDelta)) {
        correct += 1;
      }
    }
  }

  return total === 0 ? null : correct / total;
}

export function scoreVector(
  guess: readonly number[],
  truth: readonly number[],
): ScoreSummary {
  return {
    spearman: spearman(guess, truth),
    pearson: pearson(guess, truth),
    rmse: rmse(guess, truth),
    mae: mae(guess, truth),
    pairwiseAccuracy: pairwiseAccuracy(guess, truth),
  };
}

export function buildComparatorScores(
  items: readonly Item[],
  userGuesses: readonly number[],
): ComparatorScores {
  const truth = items.map((item) => item.dg_true);
  const sota = items.map((item) => item.predictions.sota_dg);
  const secondary = items.map((item) => item.predictions.secondary_dg);
  const baseline = items.map((item) => item.predictions.baseline_dg);

  return {
    user: scoreVector(userGuesses, truth),
    sota: scoreVector(sota, truth),
    secondary: secondary.every((value) => typeof value === "number" && Number.isFinite(value))
      ? scoreVector(secondary as number[], truth)
      : null,
    baseline: scoreVector(baseline, truth),
  };
}
