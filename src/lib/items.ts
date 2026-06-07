import { hashSeed, sampleWithoutReplacement, shuffle, type Rng } from "./random";

export type FoldClass = "alpha" | "beta" | "alpha_beta" | "mixed" | "unknown";
export type ViewerPreset =
  | "cartoon"
  | "backbone"
  | "lines"
  | "sticks"
  | "surface"
  | "hydrophobic"
  | "charge";

export type PredictionFields = {
  sota_name: string;
  sota_dg: number;
  secondary_name?: string;
  secondary_dg?: number;
  baseline_name: string;
  baseline_dg: number;
};

export type Item = {
  item_id: string;
  structure_url: string;
  sequence: string;
  length_aa: number;
  fold_class: FoldClass;
  dg_true: number;
  dg_bin: number;
  predictions: PredictionFields;
  display?: {
    default_view?: ViewerPreset;
    default_camera?: unknown;
  };
};

export type GameAnswer = {
  itemId: string;
  guess: number;
};

const FOLD_CLASSES = new Set<FoldClass>([
  "alpha",
  "beta",
  "alpha_beta",
  "mixed",
  "unknown",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function hasRequiredPredictionFields(value: unknown): value is PredictionFields {
  if (!isRecord(value)) return false;
  return (
    typeof value.sota_name === "string" &&
    isFiniteNumber(value.sota_dg) &&
    typeof value.baseline_name === "string" &&
    isFiniteNumber(value.baseline_dg)
  );
}

export function isValidItem(value: unknown): value is Item {
  if (!isRecord(value)) return false;
  return (
    typeof value.item_id === "string" &&
    typeof value.structure_url === "string" &&
    value.structure_url.length > 0 &&
    typeof value.sequence === "string" &&
    isFiniteNumber(value.length_aa) &&
    FOLD_CLASSES.has(value.fold_class as FoldClass) &&
    isFiniteNumber(value.dg_true) &&
    isFiniteNumber(value.dg_bin) &&
    hasRequiredPredictionFields(value.predictions)
  );
}

export async function loadItems(): Promise<Item[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/items.json`);
  if (!response.ok) {
    throw new Error(`Could not load item bank (${response.status})`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("items.json must be an array");
  }

  const invalidIndex = data.findIndex((item) => !isValidItem(item));
  if (invalidIndex !== -1) {
    throw new Error(`items.json has a malformed item at index ${invalidIndex}`);
  }

  const seen = new Set<string>();
  const unique: Item[] = [];
  for (const item of data) {
    if (!seen.has(item.item_id)) {
      unique.push(item);
      seen.add(item.item_id);
    }
  }
  return unique;
}

export function selectRunItems(items: readonly Item[], n = 20, rng: Rng): Item[] {
  const validItems = items.filter(isValidItem);
  const target = Math.min(n, validItems.length);
  const bins = new Map<number, Item[]>();

  for (const item of validItems) {
    const bucket = bins.get(item.dg_bin) ?? [];
    bucket.push(item);
    bins.set(item.dg_bin, bucket);
  }

  if (bins.size >= 4) {
    const selected: Item[] = [];
    const shuffledBins = shuffle([...bins.entries()], rng);
    let cursor = 0;

    while (selected.length < target && shuffledBins.length > 0) {
      const [bin, bucket] = shuffledBins[cursor % shuffledBins.length];
      const remaining = bucket.filter(
        (item) => !selected.some((selectedItem) => selectedItem.item_id === item.item_id),
      );
      if (remaining.length > 0) {
        selected.push(sampleWithoutReplacement(remaining, 1, rng)[0]);
      }
      if (remaining.length <= 1) {
        bins.delete(bin);
      }
      cursor += 1;
      if (cursor > validItems.length * 2) break;
    }

    if (selected.length < target) {
      const remainder = validItems.filter(
        (item) => !selected.some((selectedItem) => selectedItem.item_id === item.item_id),
      );
      selected.push(...sampleWithoutReplacement(remainder, target - selected.length, rng));
    }

    return shuffle(selected, rng);
  }

  return sampleWithoutReplacement(validItems, target, rng);
}

export function runSeedFromItems(items: readonly Item[]): number {
  const source = `${Date.now()}-${Math.random()}-${items.length}-${items[0]?.item_id ?? "none"}`;
  return hashSeed(source);
}
