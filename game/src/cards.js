// Ember Duel — data kartu dan deck.
// Tiga elemen dalam satu siklus: Ember mengalahkan Leaf, Leaf mengalahkan
// Tide, Tide mengalahkan Ember. Elemen yang menang melipatgandakan attack x2.

export const ELEMENTS = {
  ember: { name: 'Ember', color: '#e8501e', dark: '#8f2a08', beats: 'leaf', glyph: 'flame' },
  leaf: { name: 'Leaf', color: '#3aa655', dark: '#1d5c2e', beats: 'tide', glyph: 'leaf' },
  tide: { name: 'Tide', color: '#2b7fd4', dark: '#144a80', beats: 'ember', glyph: 'drop' },
};

export const ELEMENT_ORDER = ['ember', 'leaf', 'tide'];

// 30 kartu orisinal, 10 per elemen. Attack 1-9.
const CARD_DEFS = [
  ['Coal Sprite', 'ember', 1], ['Cinder Pup', 'ember', 2], ['Spark Fox', 'ember', 3],
  ['Flame Wisp', 'ember', 4], ['Ash Hawk', 'ember', 5], ['Lava Toad', 'ember', 5],
  ['Blaze Hound', 'ember', 6], ['Magma Mole', 'ember', 7], ['Inferno Cat', 'ember', 8],
  ['Phoenix Ember', 'ember', 9],
  ['Sprout', 'leaf', 1], ['Moss Frog', 'leaf', 2], ['Vine Snake', 'leaf', 3],
  ['Thorn Deer', 'leaf', 4], ['Root Turtle', 'leaf', 4], ['Bramble Boar', 'leaf', 5],
  ['Ivy Owl', 'leaf', 6], ['Grove Bear', 'leaf', 7], ['Ancient Oak', 'leaf', 8],
  ['Petal Bee', 'leaf', 9],
  ['Bubble Fish', 'tide', 1], ['Rain Crab', 'tide', 2], ['Tide Snail', 'tide', 3],
  ['Stream Otter', 'tide', 3], ['Wave Seal', 'tide', 4], ['Coral Eel', 'tide', 5],
  ['Frost Gull', 'tide', 6], ['Deep Whale', 'tide', 7], ['Storm Ray', 'tide', 8],
  ['Mist Jelly', 'tide', 9],
];

/** RNG kecil yang bisa di-seed, supaya screenshot selalu sama. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Satu kartu: nama, elemen, attack, dan id unik di dalam deck. */
export function makeCard(def, id) {
  return { id, name: def[0], element: def[1], attack: def[2] };
}

/** Deck 30 kartu yang diacak dengan seed. */
export function buildDeck(seed) {
  const rand = mulberry32(seed);
  const deck = CARD_DEFS.map((def, i) => makeCard(def, i));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

/** Attack efektif: x2 kalau elemen kartu mengalahkan elemen lawan. */
export function effectiveAttack(card, foeCard) {
  if (!card || !foeCard) return card ? card.attack : 0;
  return ELEMENTS[card.element].beats === foeCard.element ? card.attack * 2 : card.attack;
}

/** Elemen yang mengalahkan elemen ini (untuk hint di kartu). */
export function beatsElement(element) {
  for (const key of ELEMENT_ORDER) {
    if (ELEMENTS[key].beats === element) return key;
  }
  return null;
}
