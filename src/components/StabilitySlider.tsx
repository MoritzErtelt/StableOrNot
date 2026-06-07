type StabilitySliderProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  correctCategory?: string;
};

const ANCHORS = [
  { label: "unfolds", value: -0.5 },
  { label: "barely stable", value: 1.0 },
  { label: "stable", value: 3.0 },
  { label: "very stable", value: 4.5 },
];

export default function StabilitySlider({
  value,
  onChange,
  disabled = false,
  correctCategory,
}: StabilitySliderProps) {
  return (
    <div className="slider-block">
      <label htmlFor="stability-slider">Predicted folding stability ΔG, kcal/mol</label>
      <input
        id="stability-slider"
        type="range"
        min="-1"
        max="5"
        step="0.1"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="scale-row">
        <span>-1</span>
        <strong>{value.toFixed(1)}</strong>
        <span>5</span>
      </div>
      <p className="helper">
        Higher means more stable. The measured range in this game is roughly -1 to 5
        kcal/mol.
      </p>
      <div className="anchor-grid">
        {ANCHORS.map((anchor, index) => {
          const categoryClass = correctCategory
            ? anchor.label === correctCategory
              ? "anchor-correct"
              : "anchor-miss"
            : "";
          return (
            <button
              type="button"
              key={anchor.label}
              className={categoryClass}
              disabled={disabled}
              onClick={() => onChange(anchor.value)}
              aria-label={`${index + 1}: ${anchor.label}`}
            >
              {anchor.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
