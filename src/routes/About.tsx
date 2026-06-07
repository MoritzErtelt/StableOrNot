export default function About() {
  return (
    <main className="page narrow">
      <h1>About StableOrNot</h1>
      <p>
        StableOrNot asks whether you can visually guess protein folding stability from
        structure. Stability is shown as ΔG in kcal/mol, where higher ΔG means the folded
        state is more stable. These values are approximate and assay-specific.
      </p>
      <p>
        The result screen compares your guesses with ESM3CΔG and SaProtΔG prediction fields
        shipped in the static item bank, plus a simple Hydrophobic baseline. Experimental
        stability values and model predictions come from the released data tables.
      </p>
      <p>
        This is a toy game, not a formal benchmark or scientific study.
      </p>
      <section className="credit-box">
        <h2>Credit</h2>
        <p>
          Data and model predictions come from Yehlin Cho and colleagues:
          {" "}
          <a href="https://github.com/yehlincho/absolute-stability-predictor">
            yehlincho/absolute-stability-predictor
          </a>
          {" "}and{" "}
          <a href="https://zenodo.org/records/19411306">Zenodo record 19411306</a>.
        </p>
        <p>
          Cho, Y., Tsuboyama, K., Litberg, T. J., Jung, M. D., Obisesan, A.,
          Wang, Q., Phoumyvong, C. M., Thibeault, J., Ovchinnikov, S., and
          Rocklin, G. J. Accurate protein stability prediction for small domains using
          mega-scale experiments. bioRxiv, 2026-05.
        </p>
      </section>
      <div className="info-grid">
        <div>
          <h2>Cartoon</h2>
          <p>Topology and secondary-structure shape.</p>
        </div>
        <div>
          <h2>Surface</h2>
          <p>Exposed patches and compactness.</p>
        </div>
        <div>
          <h2>Hydrophobic surface</h2>
          <p>Kyte-Doolittle scale: polar residues blue, hydrophobic residues brown.</p>
        </div>
        <div>
          <h2>Backbone</h2>
          <p>Fold geometry without surface detail.</p>
        </div>
        <div>
          <h2>Charge surface</h2>
          <p>Negative residues red, positive residues blue, neutral residues light.</p>
        </div>
        <div>
          <h2>Lines</h2>
          <p>Cartoon context plus non-hydrogen atom lines, colored by element.</p>
        </div>
        <div>
          <h2>Sticks</h2>
          <p>Cartoon context plus non-hydrogen atom sticks, colored by element.</p>
        </div>
      </div>
    </main>
  );
}
