import type { Item } from "../lib/items";
import { residueClass } from "../lib/hydrophobicity";

type SequencePanelProps = {
  item: Item;
  visible: boolean;
};

export default function SequencePanel({ item, visible }: SequencePanelProps) {
  if (!visible) return null;

  return (
    <aside className="sequence-panel">
      <div className="sequence-meta">
        <span>{item.length_aa} aa</span>
        {item.fold_class !== "unknown" && <span>{item.fold_class.replace("_", " ")}</span>}
      </div>
      <div className="sequence-string" aria-label="Protein sequence">
        {item.sequence.split("").map((residue, residueIndex) => (
          <span
            key={`${residue}-${residueIndex}`}
            className={`residue ${residueClass(residue)}`}
          >
            {residue}
          </span>
        ))}
      </div>
      <div className="legend">
        <span className="dot hydrophobic" /> hydrophobic
        <span className="dot polar" /> polar
        <span className="dot positive" /> positive
        <span className="dot negative" /> negative
      </div>
    </aside>
  );
}
