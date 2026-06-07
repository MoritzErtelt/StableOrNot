import { navigate } from "../App";

export default function Home() {
  return (
    <main className="home">
      <div className="home-layout">
        <section className="hero">
          <div className="bauhaus-grid" aria-hidden="true">
            <span className="shape circle red" />
            <span className="shape square blue" />
            <span className="shape bar yellow" />
            <span className="shape ring" />
            <span className="shape half" />
          </div>
          <div className="hero-copy">
            <p className="eyebrow">Visual protein stability guessing</p>
            <h1>StableOrNot</h1>
            <p>
              Inspect small protein domains, predict folding stability ΔG, and compare your
              intuition with model predictions on the same 20 random proteins.
            </p>
            <button type="button" className="primary-action" onClick={() => navigate("/play")}>
              Start 20-protein run
            </button>
          </div>
        </section>
        <section className="home-details">
          <div className="home-info-grid">
            <div>
              <strong>Static toy</strong>
              <span>No backend, accounts, analytics, cookies, or browser storage.</span>
            </div>
            <div>
              <strong>Approximate ΔG</strong>
              <span>Higher means more stable folded state; values are assay-specific.</span>
            </div>
          </div>
          <div className="home-credit">
            <h2>Data Credit</h2>
            <p>
              Cho, Yehlin; Tsuboyama, Kotaro; Litberg, Theodore J; Jung, Michelle D;
              Obisesan, Adunoluwa; Wang, Qian; Phoumyvong, Claire M; Thibeault, Jane;
              Ovchinnikov, Sergey; Rocklin, Gabriel Jacob. Accurate protein stability
              prediction for small domains using mega-scale experiments. bioRxiv, 2026-05.
            </p>
            <p>
              Source:{" "}
              <a href="https://www.biorxiv.org/content/10.64898/2026.05.19.726285v1">
                bioRxiv preprint
              </a>
              {" · "}
              <a href="https://github.com/yehlincho/absolute-stability-predictor">
                GitHub
              </a>
              {" · "}
              <a href="https://zenodo.org/records/19411306">Zenodo</a>
              {" · "}
              <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
