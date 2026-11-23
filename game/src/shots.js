// Ember Duel — preset state untuk screenshot (?shot=title|play|win|loss).
// Semua state dibangun lewat jalur normal game (newGame + kartu dari deck),
// lalu diatur ke tampilan yang diinginkan — tanpa animasi, tanpa acak,
// supaya screenshot selalu sama.

import { buildDeck, effectiveAttack } from './cards.js';

/** Kartu contoh yang enak dilihat di tengah meja (play). */
function pickShowcase(hand) {
  const ember = hand.find((c) => c.element === 'ember' && c.attack >= 6);
  const tide = hand.find((c) => c.element === 'tide' && c.attack >= 5);
  return { ember: ember ?? hand[0], tide: tide ?? hand[1] };
}

/**
 * Atur `state` ke salah satu dari 4 tampilan screenshot.
 * @param {object} state state game (dari main.js)
 * @param {string} kind 'title' | 'play' | 'win' | 'loss'
 * @param {Function} newGame memulai game baru dengan seed
 * @param {Function} refillHands mengisi tangan sampai 5 kartu
 */
export function applyShot(state, kind, newGame, refillHands) {
  if (kind === 'title') {
    state.screen = 'title';
    return;
  }
  // play / win / loss: mulai game dengan seed tetap, lalu atur nyawa + trick.
  newGame(20261123);
  const show = pickShowcase(state.playerHand);
  const aiShow = pickShowcase(state.aiHand);

  if (kind === 'play') {
    state.playerLife = 14;
    state.aiLife = 17;
    state.round = 4;
    // Trick terakhir yang sudah selesai, tampil di tengah.
    state.history.push({ player: show.ember, ai: aiShow.tide });
    state.discard.push(show.ember, aiShow.tide);
    state.playerHand = state.playerHand.filter((c) => c.id !== show.ember.id);
    state.aiHand = state.aiHand.filter((c) => c.id !== aiShow.tide.id);
    refillHands();
    const pAtk = effectiveAttack(show.ember, aiShow.tide);
    const aAtk = effectiveAttack(aiShow.tide, show.ember);
    state.message = `Trick terakhir: ${show.ember.name} (${pAtk}) vs ${aiShow.tide.name} (${aAtk}) — giliranmu!`;
    state.aiNote = 'Lawan unggul — main irit.';
    return;
  }
  if (kind === 'win') {
    state.screen = 'win';
    state.playerLife = 9;
    state.aiLife = 0;
    state.round = 11;
    state.history.push({ player: show.ember, ai: aiShow.tide });
    return;
  }
  // loss
  state.screen = 'loss';
  state.playerLife = 0;
  state.aiLife = 12;
  state.round = 9;
  state.history.push({ player: show.ember, ai: aiShow.tide });
}
