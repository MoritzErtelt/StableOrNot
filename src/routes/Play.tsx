import React from "react";
import ProgressBar from "../components/ProgressBar";
import ProteinViewer from "../components/ProteinViewer";
import ResultCard from "../components/ResultCard";
import SequencePanel from "../components/SequencePanel";
import StabilitySlider from "../components/StabilitySlider";
import ViewerControls from "../components/ViewerControls";
import type { Item, ViewerPreset } from "../lib/items";
import { loadItems, runSeedFromItems, selectRunItems } from "../lib/items";
import { mulberry32 } from "../lib/random";
import { buildComparatorScores, type ComparatorScores } from "../lib/scoring";

const RUN_SIZE = 20;
const PRESET_ORDER: ViewerPreset[] = [
  "cartoon",
  "backbone",
  "lines",
  "sticks",
  "surface",
  "hydrophobic",
  "charge",
];

type RunState = {
  allItems: Item[];
  runItems: Item[];
};

type Feedback = {
  label: "good" | "ok" | "bad";
  title: string;
  detail: string;
  category: string;
};

function clampGuess(value: number): number {
  return Math.min(5, Math.max(-1, Number(value.toFixed(1))));
}

function stabilityCategory(value: number): string {
  if (value < 0.25) return "unfolds";
  if (value < 2) return "barely stable";
  if (value < 3.75) return "stable";
  return "very stable";
}

export default function Play() {
  const [loadState, setLoadState] = React.useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = React.useState<string>("");
  const [run, setRun] = React.useState<RunState | null>(null);
  const [index, setIndex] = React.useState(0);
  const [guesses, setGuesses] = React.useState<number[]>([]);
  const [currentGuess, setCurrentGuess] = React.useState(2);
  const [preset, setPreset] = React.useState<ViewerPreset>("cartoon");
  const [sequenceVisible, setSequenceVisible] = React.useState(false);
  const [labelsVisible, setLabelsVisible] = React.useState(false);
  const [resetSignal, setResetSignal] = React.useState(0);
  const [scores, setScores] = React.useState<ComparatorScores | null>(null);
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);

  const startRun = React.useCallback((items: Item[]) => {
    const seed = runSeedFromItems(items);
    const runItems = selectRunItems(items, RUN_SIZE, mulberry32(seed));
    setRun({ allItems: items, runItems });
    setIndex(0);
    setGuesses([]);
    setCurrentGuess(2);
    setScores(null);
    setPreset("cartoon");
    setSequenceVisible(false);
    setFeedback(null);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const items = await loadItems();
        if (cancelled) return;
        if (items.length === 0) throw new Error("No valid items found in items.json");
        setLoadState("ready");
        startRun(items);
      } catch (caught) {
        if (cancelled) return;
        setLoadState("error");
        setLoadError(caught instanceof Error ? caught.message : "Could not load items");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [startRun]);

  const currentItem = run?.runItems[index] ?? null;

  const makeFeedback = React.useCallback((item: Item, guess: number): Feedback => {
    const error = Math.abs(guess - item.dg_true);
    if (error <= 0.5) {
      return {
        label: "good",
        title: "Good eye",
        detail: `Measured ΔG ${item.dg_true.toFixed(1)} kcal/mol. You were off by ${error.toFixed(1)}.`,
        category: stabilityCategory(item.dg_true),
      };
    }
    if (error <= 1.25) {
      return {
        label: "ok",
        title: "Close enough",
        detail: `Measured ΔG ${item.dg_true.toFixed(1)} kcal/mol. Error: ${error.toFixed(1)}.`,
        category: stabilityCategory(item.dg_true),
      };
    }
    return {
      label: "bad",
      title: "Not even close",
      detail: `Measured ΔG ${item.dg_true.toFixed(1)} kcal/mol. Error: ${error.toFixed(1)}.`,
      category: stabilityCategory(item.dg_true),
    };
  }, []);

  const submit = React.useCallback(() => {
    if (!run || !currentItem) return;
    const nextGuesses = [...guesses];
    nextGuesses[index] = currentGuess;

    if (!feedback) {
      setGuesses(nextGuesses);
      setFeedback(makeFeedback(currentItem, currentGuess));
      return;
    }

    if (index >= run.runItems.length - 1) {
      setGuesses(nextGuesses);
      setScores(buildComparatorScores(run.runItems, nextGuesses));
      return;
    }

    setGuesses(nextGuesses);
    setIndex((value) => value + 1);
    setCurrentGuess(nextGuesses[index + 1] ?? 2);
    setFeedback(null);
  }, [currentGuess, currentItem, feedback, guesses, index, makeFeedback, run]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!currentItem || scores) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        if (feedback) return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const step = event.shiftKey ? 0.5 : 0.1;
        setCurrentGuess((value) => clampGuess(value + direction * step));
      }
      if (event.key >= "1" && event.key <= "4") {
        if (feedback) return;
        const anchors = [-0.5, 1, 3, 4.5];
        setCurrentGuess(anchors[Number(event.key) - 1]);
      }
      if (event.key === "Enter") {
        event.preventDefault();
        submit();
      }
      if (event.key.toLowerCase() === "v") {
        setPreset((value) => {
          const current = PRESET_ORDER.indexOf(value);
          return PRESET_ORDER[(current + 1) % PRESET_ORDER.length];
        });
      }
      if (event.key.toLowerCase() === "s") {
        setSequenceVisible((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentItem, feedback, scores, submit]);

  if (loadState === "loading" || !run) {
    return (
      <main className="page">
        <div className="loading-panel">Loading static item bank...</div>
      </main>
    );
  }

  if (loadState === "error") {
    return (
      <main className="page">
        <div className="loading-panel error">{loadError}</div>
      </main>
    );
  }

  if (scores) {
    return (
      <ResultCard
        items={run.runItems}
        guesses={guesses}
        scores={scores}
        onPlayAgain={() => startRun(run.allItems)}
      />
    );
  }

  if (!currentItem) {
    return (
      <main className="page">
        <div className="loading-panel error">No current item available.</div>
      </main>
    );
  }

  return (
    <main className="play">
      <ProgressBar current={index + 1} total={run.runItems.length} />
      <section className="game-layout">
        <div className="viewer-column">
          <ProteinViewer
            item={currentItem}
            preset={preset}
            labelsVisible={labelsVisible}
            resetSignal={resetSignal}
          />
          <ViewerControls
            preset={preset}
            sequenceVisible={sequenceVisible}
            labelsVisible={labelsVisible}
            onPresetChange={setPreset}
            onToggleSequence={() => setSequenceVisible((value) => !value)}
            onToggleLabels={() => setLabelsVisible((value) => !value)}
            onResetCamera={() => setResetSignal((value) => value + 1)}
          />
          <SequencePanel item={currentItem} visible={sequenceVisible} />
        </div>
        <aside className="answer-panel">
          <div className="mini-pattern" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <h1>Judge the fold</h1>
          <p>
            Look for compact cores, exposed hydrophobics, charged patches, loops, and overall
            topology.
          </p>
          <StabilitySlider
            value={currentGuess}
            onChange={setCurrentGuess}
            disabled={feedback !== null}
            correctCategory={feedback?.category}
          />
          {feedback && (
            <div className={`feedback ${feedback.label}`}>
              <strong>{feedback.title}</strong>
              <span className="feedback-design">Design: {currentItem.item_id}</span>
              <span>{feedback.detail}</span>
            </div>
          )}
          <button
            type="button"
            className={`${feedback ? "next-action" : "primary-action"} full`}
            onClick={submit}
          >
            {!feedback
              ? "Check answer"
              : index === run.runItems.length - 1
                ? "Show results"
                : "Next protein"}
          </button>
          <p className="keyboard-hint">
            Keyboard: arrows adjust, 1-4 anchors, V preset, S sequence, Enter next.
          </p>
        </aside>
      </section>
    </main>
  );
}
