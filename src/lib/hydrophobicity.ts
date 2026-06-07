export type ResidueClass = "hydrophobic" | "polar" | "positive" | "negative" | "unknown";

const HYDROPHOBIC = new Set(["A", "V", "I", "L", "M", "F", "W", "Y"]);
const POLAR = new Set(["S", "T", "N", "Q", "C", "G", "P"]);
const POSITIVE = new Set(["K", "R", "H"]);
const NEGATIVE = new Set(["D", "E"]);

export const RESIDUE_CLASS_COLORS: Record<ResidueClass, string> = {
  hydrophobic: "#e15b2d",
  polar: "#a7b0bd",
  positive: "#4776d0",
  negative: "#c94d74",
  unknown: "#8b949e",
};

export function residueClass(residue: string): ResidueClass {
  const code = residue.toUpperCase();
  if (HYDROPHOBIC.has(code)) return "hydrophobic";
  if (POLAR.has(code)) return "polar";
  if (POSITIVE.has(code)) return "positive";
  if (NEGATIVE.has(code)) return "negative";
  return "unknown";
}

export function residueColor(residue: string): string {
  return RESIDUE_CLASS_COLORS[residueClass(residue)];
}

export function hydrophobicFraction(sequence: string): number {
  if (sequence.length === 0) return 0;
  let count = 0;
  for (const residue of sequence) {
    if (residueClass(residue) === "hydrophobic") count += 1;
  }
  return count / sequence.length;
}
