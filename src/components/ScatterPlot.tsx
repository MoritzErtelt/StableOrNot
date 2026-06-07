import type { Item } from "../lib/items";

type ScatterPlotProps = {
  items: readonly Item[];
  guesses: readonly number[];
};

const WIDTH = 360;
const HEIGHT = 230;
const PAD = 34;
const MIN = -1;
const MAX = 5;
const TICKS = [-1, 0, 1, 2, 3, 4, 5];

function scale(value: number, minPixel: number, maxPixel: number): number {
  return minPixel + ((value - MIN) / (MAX - MIN)) * (maxPixel - minPixel);
}

export default function ScatterPlot({ items, guesses }: ScatterPlotProps) {
  return (
    <svg
      className="scatter"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      style={{ backgroundColor: "#fffaf0" }}
    >
      <title>User guesses versus true ΔG</title>
      <rect x="0" y="0" width={WIDTH} height={HEIGHT} rx="8" fill="#fffaf0" stroke="#22201d" strokeWidth="3" />
      <line x1={PAD} y1={HEIGHT - PAD} x2={WIDTH - PAD} y2={PAD} stroke="#22201d" strokeWidth="2" strokeDasharray="6 6" opacity="0.55" />
      <line x1={PAD} y1={HEIGHT - PAD} x2={WIDTH - PAD} y2={HEIGHT - PAD} stroke="#22201d" strokeWidth="2" />
      <line x1={PAD} y1={PAD} x2={PAD} y2={HEIGHT - PAD} stroke="#22201d" strokeWidth="2" />
      {TICKS.map((tick) => {
        const x = scale(tick, PAD, WIDTH - PAD);
        const y = scale(tick, HEIGHT - PAD, PAD);
        return (
          <g key={tick}>
            <line x1={x} y1={HEIGHT - PAD} x2={x} y2={HEIGHT - PAD + 5} stroke="#22201d" strokeWidth="1.5" />
            <text x={x} y={HEIGHT - PAD + 18} textAnchor="middle" fill="#666057" fontSize="10" fontWeight="800">
              {tick}
            </text>
            <line x1={PAD - 5} y1={y} x2={PAD} y2={y} stroke="#22201d" strokeWidth="1.5" />
            <text x={PAD - 9} y={y + 3} textAnchor="end" fill="#666057" fontSize="10" fontWeight="800">
              {tick}
            </text>
          </g>
        );
      })}
      <text x={WIDTH / 2} y={HEIGHT - 7} textAnchor="middle" fill="#666057" fontSize="12" fontWeight="800">
        true ΔG
      </text>
      <text x="12" y={HEIGHT / 2} transform={`rotate(-90 12 ${HEIGHT / 2})`} textAnchor="middle" fill="#666057" fontSize="12" fontWeight="800">
        your guess
      </text>
      {items.map((item, index) => {
        const x = scale(item.dg_true, PAD, WIDTH - PAD);
        const y = scale(guesses[index], HEIGHT - PAD, PAD);
        return (
          <circle
            key={item.item_id}
            cx={x}
            cy={y}
            r="4.5"
            fill="#1769c2"
            stroke="#22201d"
            strokeWidth="1.5"
            opacity="0.86"
          />
        );
      })}
    </svg>
  );
}
