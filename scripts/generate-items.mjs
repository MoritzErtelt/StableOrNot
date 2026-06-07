import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(repoRoot, "..");
const csvPath = path.join(workspaceRoot, "mgnify_training_index.csv");
const predictionPath = path.join(
  workspaceRoot,
  "figures",
  "fig1_2__mgnify_stability_predictions.csv",
);
const structureSourceDir = path.join(workspaceRoot, "structures");
const structurePublicDir = path.join(repoRoot, "public", "structures");
const dataDir = path.join(repoRoot, "public", "data");

const hydrophobic = new Set(["A", "V", "I", "L", "M", "F", "W", "Y"]);
const positive = new Set(["K", "R", "H"]);
const negative = new Set(["D", "E"]);

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hydrophobicFraction(sequence) {
  if (!sequence) return 0;
  let count = 0;
  for (const residue of sequence) {
    if (hydrophobic.has(residue)) count += 1;
  }
  return count / sequence.length;
}

function chargeBalance(sequence) {
  if (!sequence) return 0;
  let charge = 0;
  for (const residue of sequence) {
    if (positive.has(residue)) charge += 1;
    if (negative.has(residue)) charge -= 1;
  }
  return charge / sequence.length;
}

function sequenceComplexity(sequence) {
  if (!sequence) return 0;
  const seen = new Set(sequence.split(""));
  return seen.size / 20;
}

function foldClass(sequence) {
  const h = hydrophobicFraction(sequence);
  const proGly =
    sequence.split("").filter((residue) => residue === "P" || residue === "G").length /
    sequence.length;
  if (proGly > 0.18) return "mixed";
  if (h > 0.43) return "alpha_beta";
  return "unknown";
}

function hydrophobicBaseline(sequence) {
  const h = hydrophobicFraction(sequence);
  const charge = Math.abs(chargeBalance(sequence));
  return clamp(-0.75 + h * 8.2 - charge * 1.6, -1, 5);
}

function dgBin(dg) {
  if (dg < -1) return 0;
  if (dg >= 5) return 6;
  return Math.max(0, Math.min(6, Math.floor(dg + 1)));
}

fs.mkdirSync(structurePublicDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

const sourceStructures = new Set(
  fs.readdirSync(structureSourceDir).filter((file) => file.endsWith(".cif.gz")),
);

const csv = fs.readFileSync(csvPath, "utf8").trimEnd().split(/\r?\n/);
const [headerLine, ...rows] = csv;
const headers = parseCsvLine(headerLine);
const indexByName = Object.fromEntries(headers.map((header, index) => [header, index]));

const predictionRows = fs.readFileSync(predictionPath, "utf8").trimEnd().split(/\r?\n/);
const [predictionHeaderLine, ...predictionDataRows] = predictionRows;
const predictionHeaders = parseCsvLine(predictionHeaderLine);
const predictionIndexByName = Object.fromEntries(
  predictionHeaders.map((header, index) => [header, index]),
);
const predictionsByName = new Map();
for (const row of predictionDataRows) {
  const values = parseCsvLine(row);
  const name = values[predictionIndexByName.name];
  predictionsByName.set(name, values);
}

const items = [];
const usedStructures = new Set();
for (const row of rows) {
  const values = parseCsvLine(row);
  const split = values[indexByName.split];
  if (split !== "test") continue;

  const name = values[indexByName.name];
  const pdbName = values[indexByName.PDB_name];
  const sequence = values[indexByName.seq];
  const predictionValues = predictionsByName.get(name);
  if (!predictionValues) continue;
  const dg = Number(predictionValues[predictionIndexByName.experiment]);
  const esm3c = Number(predictionValues[predictionIndexByName.predicted_ESM3dG]);
  const saprot = Number(predictionValues[predictionIndexByName.predicted_SaProtdG]);
  if (!Number.isFinite(dg) || dg < -1 || dg > 5) continue;
  if (!Number.isFinite(esm3c) || !Number.isFinite(saprot)) continue;
  const preferredFile = `${name}.cif.gz`;
  const fallbackFile = `${pdbName}.cif.gz`;
  const structureFile = sourceStructures.has(preferredFile)
    ? preferredFile
    : sourceStructures.has(fallbackFile)
      ? fallbackFile
      : null;
  if (!structureFile || !sequence) continue;
  usedStructures.add(structureFile);

  const sourcePath = path.join(structureSourceDir, structureFile);
  const destinationPath = path.join(structurePublicDir, structureFile);
  if (!fs.existsSync(destinationPath)) {
    fs.copyFileSync(sourcePath, destinationPath);
  }

  items.push({
    item_id: name,
    structure_url: `/structures/${structureFile}`,
    sequence,
    length_aa: sequence.length,
    fold_class: foldClass(sequence),
    dg_true: Number(dg.toFixed(3)),
    dg_bin: dgBin(dg),
    predictions: {
      sota_name: "ESM3CΔG",
      sota_dg: Number(esm3c.toFixed(3)),
      secondary_name: "SaProtΔG",
      secondary_dg: Number(saprot.toFixed(3)),
      baseline_name: "Hydrophobic baseline",
      baseline_dg: Number(hydrophobicBaseline(sequence).toFixed(3)),
    },
    display: {
      default_view: "cartoon",
      default_camera: null,
    },
  });
}

items.sort((a, b) => a.item_id.localeCompare(b.item_id));

for (const file of fs.readdirSync(structurePublicDir)) {
  if (file.endsWith(".cif.gz") && !usedStructures.has(file)) {
    fs.unlinkSync(path.join(structurePublicDir, file));
  }
}

fs.writeFileSync(
  path.join(dataDir, "items.json"),
  `${JSON.stringify(items, null, 2)}\n`,
  "utf8",
);

fs.writeFileSync(
  path.join(dataDir, "items.example.json"),
  `${JSON.stringify([items[0]], null, 2)}\n`,
  "utf8",
);

console.log(`Generated ${items.length} items`);
