import React from "react";
import type { Item, ViewerPreset } from "../lib/items";

type ProteinViewerProps = {
  item: Item;
  preset: ViewerPreset;
  labelsVisible: boolean;
  resetSignal: number;
};

type ViewerState = {
  mol: ThreeDmolApi;
  viewer: any;
  model: any;
};

type ThreeDmolApi = {
  createViewer: (element: HTMLElement, config: Record<string, unknown>) => any;
  inflateString: (value: ArrayBuffer | string, toString?: boolean) => string | ArrayBuffer;
  SurfaceType: {
    SES: unknown;
  };
};

const RESIDUE3_TO_1: Record<string, string> = {
  ALA: "A",
  ARG: "R",
  ASN: "N",
  ASP: "D",
  CYS: "C",
  GLN: "Q",
  GLU: "E",
  GLY: "G",
  HIS: "H",
  ILE: "I",
  LEU: "L",
  LYS: "K",
  MET: "M",
  PHE: "F",
  PRO: "P",
  SER: "S",
  THR: "T",
  TRP: "W",
  TYR: "Y",
  VAL: "V",
};

const KYTE_DOOLITTLE: Record<string, number> = {
  I: 4.5,
  V: 4.2,
  L: 3.8,
  F: 2.8,
  C: 2.5,
  M: 1.9,
  A: 1.8,
  G: -0.4,
  T: -0.7,
  S: -0.8,
  W: -0.9,
  Y: -1.3,
  P: -1.6,
  H: -3.2,
  E: -3.5,
  Q: -3.5,
  D: -3.5,
  N: -3.5,
  K: -3.9,
  R: -4.5,
};

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function rgbToHex([red, green, blue]: [number, number, number]): string {
  const parts = [red, green, blue].map((value) =>
    Math.round(value).toString(16).padStart(2, "0"),
  );
  return `#${parts.join("")}`;
}

function interpolateColor(start: string, end: string, amount: number): string {
  const clamped = Math.min(1, Math.max(0, amount));
  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);
  return rgbToHex([
    startRgb[0] + (endRgb[0] - startRgb[0]) * clamped,
    startRgb[1] + (endRgb[1] - startRgb[1]) * clamped,
    startRgb[2] + (endRgb[2] - startRgb[2]) * clamped,
  ]);
}

function hydrophobicityColor(residueName: string): string {
  const one = RESIDUE3_TO_1[residueName] ?? residueName[0] ?? "";
  const value = KYTE_DOOLITTLE[one] ?? -0.4;
  return interpolateColor("#2369b3", "#7a4a20", (value + 4.5) / 9);
}

function chargeColor(residueName: string): string {
  const one = RESIDUE3_TO_1[residueName] ?? residueName[0] ?? "";
  if ("KRH".includes(one)) return "#2866c8";
  if ("DE".includes(one)) return "#c83535";
  return "#d9d5ca";
}

function withBase(url: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${url}`;
}

async function fetchStructure(url: string, mol: ThreeDmolApi): Promise<string> {
  const response = await fetch(withBase(url));
  if (!response.ok) throw new Error(`Structure fetch failed (${response.status})`);
  const contentEncoding = response.headers.get("content-encoding") ?? "";
  if (!url.endsWith(".gz") || contentEncoding.includes("gzip")) return response.text();
  const inflated = mol.inflateString(await response.arrayBuffer(), true);
  if (typeof inflated !== "string") {
    throw new Error("Could not decompress gzipped structure.");
  }
  return inflated;
}

async function load3Dmol(): Promise<ThreeDmolApi> {
  const mod = (await import("3dmol/build/3Dmol.es6.js")) as Record<string, unknown>;
  const fromModule = mod.default ?? mod["3Dmol"] ?? mod;
  const fromWindow = (window as unknown as Record<string, unknown>)["3Dmol"] as
    | ThreeDmolApi
    | undefined;
  const mol = isThreeDmolApi(fromModule) ? fromModule : fromWindow;
  if (!isThreeDmolApi(mol)) {
    throw new Error("3Dmol viewer library did not initialize.");
  }
  return mol;
}

function isThreeDmolApi(value: unknown): value is ThreeDmolApi {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { createViewer?: unknown }).createViewer === "function" &&
    typeof (value as { inflateString?: unknown }).inflateString === "function"
  );
}

function applyPreset(state: ViewerState, preset: ViewerPreset) {
  const { viewer } = state;
  viewer.removeAllSurfaces();
  viewer.removeAllLabels();
  viewer.setStyle({}, {});

  if (preset === "cartoon") {
    viewer.setStyle({}, { cartoon: { color: "spectrum" } });
  }
  if (preset === "backbone") {
    viewer.setStyle({}, { line: { color: "#222222", linewidth: 2 } });
  }
  if (preset === "lines") {
    viewer.setStyle({}, { cartoon: { color: "spectrum", opacity: 0.64 } });
    viewer.addStyle({ not: { elem: "H" } }, { line: { colorscheme: "Jmol", linewidth: 1.4 } });
  }
  if (preset === "sticks") {
    viewer.setStyle({}, { cartoon: { color: "spectrum", opacity: 0.58 } });
    viewer.addStyle(
      { not: { elem: "H" } },
      { stick: { colorscheme: "Jmol", radius: 0.16, opacity: 0.95 } },
    );
  }
  if (preset === "surface" || preset === "hydrophobic" || preset === "charge") {
    const style =
      preset === "hydrophobic"
        ? { opacity: 0.88, colorfunc: (atom: { resn: string }) => hydrophobicityColor(atom.resn) }
        : preset === "charge"
          ? { opacity: 0.86, colorfunc: (atom: { resn: string }) => chargeColor(atom.resn) }
          : { opacity: 0.86, color: "#ddd7ca" };
    viewer.addSurface(state.mol.SurfaceType.SES, style, {});
  }

  viewer.render();
}

function addTerminiLabels(state: ViewerState) {
  const atoms = state.model.selectedAtoms({ atom: "CA" });
  if (!Array.isArray(atoms) || atoms.length === 0) return;
  const first = atoms[0];
  const last = atoms[atoms.length - 1];
  state.viewer.addLabel("N", {
    position: first,
    backgroundColor: "#111111",
    fontColor: "#ffffff",
    borderRadius: 4,
    padding: 4,
  });
  state.viewer.addLabel("C", {
    position: last,
    backgroundColor: "#111111",
    fontColor: "#ffffff",
    borderRadius: 4,
    padding: 4,
  });
}

export default function ProteinViewer({
  item,
  preset,
  labelsVisible,
  resetSignal,
}: ProteinViewerProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const stateRef = React.useRef<ViewerState | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError("");

    async function load() {
      if (!containerRef.current) return;
      try {
        containerRef.current.innerHTML = "";
        const mol = await load3Dmol();
        const viewer = mol.createViewer(containerRef.current, {
          backgroundColor: "#f7f3e8",
        });
        const data = await fetchStructure(item.structure_url, mol);
        if (cancelled) return;
        const format = item.structure_url.includes(".cif") ? "mmcif" : "pdb";
        const model = viewer.addModel(data, format);
        stateRef.current = { mol, viewer, model };
        applyPreset({ mol, viewer, model }, preset);
        if (labelsVisible) addTerminiLabels({ mol, viewer, model });
        viewer.zoomTo();
        viewer.render();
        setStatus("ready");
      } catch (caught) {
        if (cancelled) return;
        setStatus("error");
        setError(caught instanceof Error ? caught.message : "Could not load structure");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [item.item_id]);

  React.useEffect(() => {
    const state = stateRef.current;
    if (!state || status !== "ready") return;
    applyPreset(state, preset);
    if (labelsVisible) addTerminiLabels(state);
    state.viewer.render();
  }, [preset, labelsVisible, status]);

  React.useEffect(() => {
    const state = stateRef.current;
    if (!state || status !== "ready") return;
    state.viewer.zoomTo();
    state.viewer.render();
  }, [resetSignal, status]);

  return (
    <div className="protein-viewer-shell">
      <div ref={containerRef} className="protein-viewer" />
      {status === "loading" && <div className="viewer-state">Loading structure...</div>}
      {status === "error" && (
        <div className="viewer-state error">Could not load structure: {error}</div>
      )}
    </div>
  );
}
