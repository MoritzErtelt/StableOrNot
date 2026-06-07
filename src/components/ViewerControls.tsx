import type { ViewerPreset } from "../lib/items";

type ViewerControlsProps = {
  preset: ViewerPreset;
  sequenceVisible: boolean;
  labelsVisible: boolean;
  onPresetChange: (preset: ViewerPreset) => void;
  onToggleSequence: () => void;
  onToggleLabels: () => void;
  onResetCamera: () => void;
};

const PRESETS: { label: string; value: ViewerPreset }[] = [
  { label: "Cartoon", value: "cartoon" },
  { label: "Backbone", value: "backbone" },
  { label: "Lines", value: "lines" },
  { label: "Sticks", value: "sticks" },
  { label: "Surface", value: "surface" },
  { label: "Hydrophobic", value: "hydrophobic" },
  { label: "Charge", value: "charge" },
];

export default function ViewerControls({
  preset,
  sequenceVisible,
  labelsVisible,
  onPresetChange,
  onToggleSequence,
  onToggleLabels,
  onResetCamera,
}: ViewerControlsProps) {
  return (
    <div className="viewer-controls">
      <label>
        Preset
        <select
          value={preset}
          onChange={(event) => onPresetChange(event.target.value as ViewerPreset)}
        >
          {PRESETS.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={onToggleSequence} aria-pressed={sequenceVisible}>
        Sequence
      </button>
      <button type="button" onClick={onToggleLabels} aria-pressed={labelsVisible}>
        N/C labels
      </button>
      <button type="button" onClick={onResetCamera}>
        Reset camera
      </button>
    </div>
  );
}
