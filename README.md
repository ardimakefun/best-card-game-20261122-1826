# Ember Duel

Duel kartu elemen orisinal untuk bounty make.fun "Make the best card game".

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
