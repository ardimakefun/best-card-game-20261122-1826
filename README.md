# best-card-game-20261122-1826

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/ardimakefun/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/ardimakefun/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

Ember Duel — duel kartu elemen orisinal untuk bounty make.fun "Make the best card game": nyawa 20 vs 20, tangan 5 kartu, Ember > Leaf > Tide > Ember dengan elemen menang melipatgandakan attack ×2, melawan AI dengan strategi terbaca. Title, meja, win dan loss — semua di canvas, tanpa network, tanpa library.

## Run it

```sh
cd game && python3 -m http.server 8080
```

Buka http://localhost:8080 di desktop Chrome.

---

<sub>Entered on [make.fun](https://make.fun/?ref=0vh6bwht&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>

## Cara main

- Nyawa 20 vs 20, tangan 5 kartu, tiap giliran draw 1 kartu.
- Tiap giliran mainkan 1 kartu; lawan memainkan 1 kartu.
- Kartu punya Attack (1–9) dan 1 dari 3 elemen: **Ember > Leaf > Tide > Ember**.
  Elemen yang menang melipatgandakan attack ×2.
- Attack efektif lebih tinggi menang trick; yang kalah kehilangan nyawa
  sebesar selisihnya. Seri = tidak ada damage.
- Nyawa 0 = kalah/menang. Lawan punya strategi terbaca: nekat saat
  tertinggal, irit saat unggul jauh, seimbang di antaranya.

Klik kartu untuk memainkannya (atau tekan 1–5), Enter untuk mulai/main lagi.

## Menjalankan

Serve `game/` dengan server statis apa pun, lalu buka `game/index.html`
di desktop Chrome. Contoh:

```sh
cd game && python3 -m http.server 8080
```

Screenshot tiap layar: buka `?shot=title`, `?shot=play`, `?shot=win`,
`?shot=loss`.

## Menyerahkan

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` menyalin `game/` + `screenshots/` ke output dan menulis
`dossier.json` via `vendor/makefun-game.ts`.
