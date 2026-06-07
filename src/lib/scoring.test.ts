import { describe, expect, it } from "vitest";
import { pairwiseAccuracy, pearson, rankAverageTies, rmse, spearman } from "./scoring";

describe("scoring", () => {
  it("computes average ranks for ties", () => {
    expect(rankAverageTies([10, 20, 20, 40])).toEqual([1, 2.5, 2.5, 4]);
  });

  it("computes correlations", () => {
    expect(pearson([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
    expect(spearman([1, 2, 2, 4], [1, 3, 2, 4])).toBeCloseTo(0.94868, 4);
  });

  it("scores pairwise accuracy with user ties as half credit", () => {
    expect(pairwiseAccuracy([1, 1, 3], [1, 2, 3])).toBeCloseTo(5 / 6);
  });

  it("computes rmse", () => {
    expect(rmse([1, 2, 4], [1, 2, 1])).toBeCloseTo(Math.sqrt(3));
  });
});
