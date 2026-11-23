// Ember Duel — mesin game: state, giliran, input, loop animasi.
// Satu trick: pemain main 1 kartu, AI main 1 kartu, attack efektif lebih
// tinggi menang; yang kalah kehilangan nyawa sebesar selisihnya.

import { ELEMENTS, buildDeck, effectiveAttack } from './cards.js';
import { chooseCard, describeChoice } from './ai.js';
import { applyShot } from './shots.js';
import {
  W, H, CARD_W, CARD_H,
  drawTable, drawCardFace, drawCardBack, drawLifeBar, drawButton, drawElementGlyph,
} from './render.js';

const MAX_LIFE = 20;
const HAND_SIZE = 5;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

export const state = {
  screen: 'title', // title | play | win | loss
  playerLife: MAX_LIFE,
  aiLife: MAX_LIFE,
  deck: [],
  discard: [],
  playerHand: [],
  aiHand: [],
  history: [],
  played: null, // {player, ai} kartu yang sedang di tengah
  message: '',
  aiNote: '',
  round: 1,
  hoverCard: -1,
  hoverButton: '',
  anim: null, // {kind:'play', card, from:{x,y}, to:{x,y}, t0, dur, side}
  resolveAt: 0,
  seed: 20261123,
};

let buttons = {};

function drawFromDeck() {
  if (state.deck.length === 0) {
    state.deck = [...state.discard];
    state.discard = [];
    // Acak ulang tumpukan buangan (Fisher-Yates dengan Math.random: hanya
    // untuk permainan biasa, bukan untuk screenshot).
    for (let i = state.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = state.deck[i];
      state.deck[i] = state.deck[j];
      state.deck[j] = tmp;
    }
  }
  return state.deck.pop();
}

function refillHands() {
  while (state.playerHand.length < HAND_SIZE && state.deck.length + state.discard.length > 0) {
    state.playerHand.push(drawFromDeck());
  }
  while (state.aiHand.length < HAND_SIZE && state.deck.length + state.discard.length > 0) {
    state.aiHand.push(drawFromDeck());
  }
}

export function newGame(seed) {
  state.seed = seed ?? (Date.now() % 2147483647);
  state.screen = 'play';
  state.playerLife = MAX_LIFE;
  state.aiLife = MAX_LIFE;
  state.deck = buildDeck(state.seed);
  state.discard = [];
  state.playerHand = [];
  state.aiHand = [];
  state.history = [];
  state.played = null;
  state.message = 'Giliranmu — mainkan satu kartu!';
  state.aiNote = 'Lawan menunggu...';
  state.round = 1;
  state.anim = null;
  state.resolveAt = 0;
  refillHands();
}

/** Posisi kartu tangan pemain di layar (untuk klik + hover + animasi). */
function playerCardPos(i, n) {
  const gap = 150;
  const total = (n - 1) * gap + CARD_W;
  const x = (W - total) / 2 + i * gap;
  const y = H - CARD_H - 26 + (state.hoverCard === i ? -26 : 0);
  return { x, y };
}

function aiCardPos(i, n) {
  const gap = 96;
  const total = (n - 1) * gap + 96;
  return { x: (W - total) / 2 + i * gap, y: 84 };
}

/** Pemain memainkan kartu ke-i dari tangannya. */
function playCard(i) {
  if (state.screen !== 'play' || state.anim || state.played) return;
  if (i < 0 || i >= state.playerHand.length) return;
  const card = state.playerHand[i];
  state.playerHand.splice(i, 1);
  const from = playerCardPos(i, state.playerHand.length + 1);
  const aiCard = chooseCard(state.aiHand, state.aiLife, state.playerLife, state.history);
  state.aiHand.splice(state.aiHand.indexOf(aiCard), 1);
  state.played = { player: card, ai: aiCard };
  state.aiNote = describeChoice(aiCard, state.aiLife, state.playerLife);
  state.message = 'Kartu dimainkan...';
  state.anim = {
    kind: 'play', card, side: 'player',
    from: { x: from.x, y: from.y }, to: { x: W / 2 - CARD_W - 40, y: H / 2 - CARD_H / 2 },
    t0: performance.now(), dur: 260,
  };
  state.resolveAt = performance.now() + 900;
}

function resolveTrick() {
  const { player, ai } = state.played;
  const pAtk = effectiveAttack(player, ai);
  const aAtk = effectiveAttack(ai, player);
  state.history.push({ player, ai });
  state.discard.push(player, ai);
  if (pAtk > aAtk) {
    const dmg = pAtk - aAtk;
    state.aiLife = Math.max(0, state.aiLife - dmg);
    state.message = `Kamu menang trick! ${player.name} (${pAtk}) vs ${ai.name} (${aAtk}) — lawan -${dmg} nyawa.`;
  } else if (aAtk > pAtk) {
    const dmg = aAtk - pAtk;
    state.playerLife = Math.max(0, state.playerLife - dmg);
    state.message = `Lawan menang trick! ${ai.name} (${aAtk}) vs ${player.name} (${pAtk}) — kamu -${dmg} nyawa.`;
  } else {
    state.message = `Seri! ${player.name} (${pAtk}) vs ${ai.name} (${aAtk}) — tidak ada damage.`;
  }
  state.played = null;
  state.anim = null;
  state.round++;
  if (state.aiLife <= 0) {
    state.screen = 'win';
  } else if (state.playerLife <= 0) {
    state.screen = 'loss';
  } else {
    refillHands();
    state.message += ' Giliranmu lagi — mainkan satu kartu!';
    state.aiNote = 'Lawan menunggu...';
  }
}

// ------------------------------------------------------------ gambar

function drawPlay() {
  drawTable(ctx);
  // Nyawa kedua pihak, selalu terlihat.
  drawLifeBar(ctx, 36, 36, 260, 'KAMU', state.playerLife, MAX_LIFE, '#e8501e');
  drawLifeBar(ctx, W - 36 - 260, 36, 260, 'LAWAN', state.aiLife, MAX_LIFE, '#2b7fd4', true);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`RONDE ${state.round}`, W / 2, 46);

  // Tangan lawan (tertutup).
  state.aiHand.forEach((_, i) => {
    const p = aiCardPos(i, state.aiHand.length);
    drawCardBack(ctx, p.x, p.y, 84, 120);
  });
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '15px sans-serif';
  ctx.fillText(`${state.aiHand.length} kartu`, W / 2, 224);

  // Kartu yang sedang dimainkan / terakhir dimainkan.
  if (state.played) {
    const cx = W / 2 - CARD_W - 40;
    const cy = H / 2 - CARD_H / 2;
    if (state.anim) {
      const t = Math.min(1, (performance.now() - state.anim.t0) / state.anim.dur);
      const e = 1 - (1 - t) * (1 - t);
      const x = state.anim.from.x + (state.anim.to.x - state.anim.from.x) * e;
      const y = state.anim.from.y + (state.anim.to.y - state.anim.from.y) * e;
      drawCardFace(ctx, state.played.player, x, y, CARD_W, CARD_H);
    } else {
      drawCardFace(ctx, state.played.player, cx, cy, CARD_W, CARD_H);
    }
    drawCardFace(ctx, state.played.ai, W / 2 + 40, cy, CARD_W, CARD_H);
    // Attack efektif di atas tiap kartu.
    const pAtk = effectiveAttack(state.played.player, state.played.ai);
    const aAtk = effectiveAttack(state.played.ai, state.played.player);
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#f2b705';
    ctx.fillText(`${pAtk}`, W / 2 - CARD_W / 2 - 40, cy - 18);
    ctx.fillText(`${aAtk}`, W / 2 + CARD_W / 2 + 40, cy - 18);
  } else if (state.history.length > 0) {
    const last = state.history[state.history.length - 1];
    ctx.globalAlpha = 0.85;
    drawCardFace(ctx, last.player, W / 2 - CARD_W - 40, H / 2 - CARD_H / 2, CARD_W, CARD_H);
    drawCardFace(ctx, last.ai, W / 2 + 40, H / 2 - CARD_H / 2, CARD_W, CARD_H);
    ctx.globalAlpha = 1;
  }

  // Pesan trick + catatan AI.
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 19px sans-serif';
  ctx.fillText(state.message, W / 2, H / 2 + CARD_H / 2 + 18);
  ctx.font = 'italic 15px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText(state.aiNote, W / 2, H / 2 + CARD_H / 2 + 44);

  // Tangan pemain.
  state.playerHand.forEach((card, i) => {
    const p = playerCardPos(i, state.playerHand.length);
    drawCardFace(ctx, card, p.x, p.y, CARD_W, CARD_H);
  });
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '14px sans-serif';
  ctx.fillText('Klik kartu untuk memainkannya — atau tekan 1-5', W / 2, H - 12);
}

function drawTitle() {
  drawTable(ctx);
  // Api besar di tengah atas.
  drawElementGlyph(ctx, 'flame', W / 2 - 150, 150, 90, '#e8501e');
  drawElementGlyph(ctx, 'leaf', W / 2 + 150, 150, 90, '#3aa655');
  drawElementGlyph(ctx, 'drop', W / 2, 96, 70, '#2b7fd4');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 92px sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  ctx.fillText('EMBER DUEL', W / 2, 260);
  ctx.shadowColor = 'transparent';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillStyle = '#f2b705';
  ctx.fillText('Duel kartu elemen — 20 nyawa, 5 kartu, 1 pemenang', W / 2, 322);
  ctx.fillStyle = '#ffffff';
  ctx.font = '19px sans-serif';
  ctx.fillText('Ember > Leaf > Tide > Ember — elemen menang melipatgandakan attack x2.', W / 2, 372);
  ctx.fillText('Attack efektif lebih tinggi menang trick; yang kalah kehilangan nyawa sebesar selisihnya.', W / 2, 400);
  ctx.fillText('Lawan membaca strategimu: nekat saat tertinggal, irit saat unggul.', W / 2, 428);
  buttons.start = drawButton(ctx, W / 2 - 140, 480, 280, 72, 'MULAI', 'klik atau tekan Enter', state.hoverButton === 'start');
  ctx.font = '15px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('Game kartu orisinal — tanpa network, tanpa library', W / 2, 596);
}

function drawEnd(won) {
  drawTable(ctx);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = won ? '#f2b705' : '#ff6b5e';
  ctx.font = 'bold 84px sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  ctx.fillText(won ? 'KAMU MENANG!' : 'KAMU KALAH', W / 2, 250);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(
    won ? `Lawan tumbang di ronde ${state.round}. Api padam, tahta milikmu.` : `Nyawamu habis di ronde ${state.round}. Api masih menyala — coba lagi.`,
    W / 2, 330,
  );
  ctx.font = '20px sans-serif';
  ctx.fillText(`Nyawa akhir — Kamu: ${state.playerLife}  •  Lawan: ${state.aiLife}`, W / 2, 380);
  ctx.fillText(`${state.history.length} trick dimainkan`, W / 2, 410);
  buttons.again = drawButton(ctx, W / 2 - 140, 470, 280, 72, 'MAIN LAGI', 'klik atau tekan Enter', state.hoverButton === 'again');
}

function render() {
  ctx.clearRect(0, 0, W, H);
  buttons = {};
  if (state.screen === 'title') drawTitle();
  else if (state.screen === 'play') drawPlay();
  else drawEnd(state.screen === 'win');
}

function loop(now) {
  if (state.resolveAt && now >= state.resolveAt) {
    state.resolveAt = 0;
    resolveTrick();
  }
  if (state.anim && now - state.anim.t0 > state.anim.dur) state.anim = null;
  render();
  requestAnimationFrame(loop);
}

// ------------------------------------------------------------ input

function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
}

function hitButton(name, p) {
  const b = buttons[name];
  return b && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
}

canvas.addEventListener('mousemove', (e) => {
  const p = canvasPos(e);
  state.hoverButton = '';
  if (state.screen === 'title' && hitButton('start', p)) state.hoverButton = 'start';
  if ((state.screen === 'win' || state.screen === 'loss') && hitButton('again', p)) state.hoverButton = 'again';
  state.hoverCard = -1;
  if (state.screen === 'play' && !state.played) {
    state.playerHand.forEach((_, i) => {
      const pos = playerCardPos(i, state.playerHand.length);
      if (p.x >= pos.x && p.x <= pos.x + CARD_W && p.y >= pos.y && p.y <= pos.y + CARD_H) {
        state.hoverCard = i;
      }
    });
  }
});

canvas.addEventListener('click', (e) => {
  const p = canvasPos(e);
  if (state.screen === 'title' && hitButton('start', p)) {
    newGame();
    return;
  }
  if ((state.screen === 'win' || state.screen === 'loss') && hitButton('again', p)) {
    newGame();
    return;
  }
  if (state.screen === 'play' && !state.played) {
    for (let i = 0; i < state.playerHand.length; i++) {
      const pos = playerCardPos(i, state.playerHand.length);
      if (p.x >= pos.x && p.x <= pos.x + CARD_W && p.y >= pos.y && p.y <= pos.y + CARD_H) {
        playCard(i);
        return;
      }
    }
  }
});

window.addEventListener('keydown', (e) => {
  if (state.screen === 'title' && (e.key === 'Enter' || e.key === ' ')) newGame();
  else if ((state.screen === 'win' || state.screen === 'loss') && (e.key === 'Enter' || e.key === ' ')) newGame();
  else if (state.screen === 'play' && e.key >= '1' && e.key <= '5') playCard(Number(e.key) - 1);
});

// Diekspos untuk smoke test di browser (tidak memengaruhi tampilan).
window.EmberDuel = { state, newGame };

// ------------------------------------------------------------ mulai

// Mode screenshot (?shot=title|play|win|loss) membangun state dari kode
// game sendiri, tanpa animasi dan tanpa acak — lihat shots.js.
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  applyShot(state, shot, newGame, refillHands);
  state.anim = null;
  state.resolveAt = 0;
}
requestAnimationFrame(loop);
