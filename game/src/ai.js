// Ember Duel — strategi lawan (AI).
// Aturannya terbaca dan bisa dilawan balik:
//   - Tertinggal nyawa  -> mainkan kartu attack tertinggi (nekat).
//   - Unggul jauh (>= 8) -> mainkan kartu attack terendah (irit).
//   - Seimbang          -> mainkan kartu tengah, tapi utamakan elemen yang
//                          mengalahkan elemen terakhir yang dimainkan pemain.

import { ELEMENTS } from './cards.js';

/** Elemen kartu terakhir pemain, atau null kalau belum ada. */
function lastPlayerElement(history) {
  if (!history || history.length === 0) return null;
  return history[history.length - 1].player.element;
}

/**
 * Pilih satu kartu dari tangan AI.
 * @param {Array} hand kartu AI yang tersedia
 * @param {number} aiLife nyawa AI
 * @param {number} playerLife nyawa pemain
 * @param {Array} history trick yang sudah lewat, {player, ai}
 * @returns kartu yang dipilih
 */
export function chooseCard(hand, aiLife, playerLife, history) {
  if (hand.length === 0) return null;
  if (hand.length === 1) return hand[0];
  const sorted = [...hand].sort((a, b) => a.attack - b.attack);

  // Tertinggal: nekat, kartu terkuat.
  if (aiLife < playerLife) return sorted[sorted.length - 1];

  // Unggul jauh: irit, kartu terlemah.
  if (aiLife - playerLife >= 8) return sorted[0];

  // Seimbang: cari kartu yang elemennya mengalahkan kartu terakhir pemain;
  // kalau ada, ambil yang attack-nya paling kecil di antara yang menang itu.
  const foeEl = lastPlayerElement(history);
  if (foeEl) {
    const winners = sorted.filter((c) => ELEMENTS[c.element].beats === foeEl);
    if (winners.length > 0) return winners[0];
  }

  // Kalau tidak ada keunggulan elemen, kartu tengah.
  return sorted[Math.floor(sorted.length / 2)];
}

/** Satu kalimat yang menjelaskan kenapa AI memilih kartu itu (tampil di meja). */
export function describeChoice(card, aiLife, playerLife) {
  if (aiLife < playerLife) return 'Lawan tertinggal — main nekat!';
  if (aiLife - playerLife >= 8) return 'Lawan unggul — main irit.';
  return 'Lawan bermain seimbang.';
}
