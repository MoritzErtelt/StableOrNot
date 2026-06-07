# StableOrNot

A fully static Vite + React + TypeScript protein stability guessing game.

Run locally:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

The app stores no gameplay data and uses no backend, cookies, analytics, or browser
storage. Static item data are in `public/data/items.json`; static structures are in
`public/structures/`.

Data credit:

- https://www.biorxiv.org/content/10.64898/2026.05.19.726285v1
- https://github.com/yehlincho/absolute-stability-predictor
- https://zenodo.org/records/19411306

Cho, Yehlin; Tsuboyama, Kotaro; Litberg, Theodore J; Jung, Michelle D;
Obisesan, Adunoluwa; Wang, Qian; Phoumyvong, Claire M; Thibeault, Jane;
Ovchinnikov, Sergey; Rocklin, Gabriel Jacob. Accurate protein stability
prediction for small domains using mega-scale experiments. bioRxiv, 2026-05.

The source data release is licensed under Creative Commons Attribution 4.0:
https://creativecommons.org/licenses/by/4.0/
