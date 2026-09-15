import { Card, CardRank, CardSuit, GameState, HandRank } from '../types';

export const SUITS: CardSuit[] = ['♠', '♥', '♣', '♦'];
export const RANKS: CardRank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const CARDS_PER_STAGE = 52;
export const TOTAL_CARDS = 104;
const HAND_SIZE = 5;

// A single 52-card deck (one of each suit+rank), shuffled.
const createSingleDeck = (stageTag: string): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}${rank}-${stageTag}`,
        suit,
        rank,
        isPlayed: false,
      });
    }
  }
  return shuffleDeck(deck);
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const initializeGame = (bet: number): GameState => {
  const firstDeck = createSingleDeck('s1');
  const nextDeck = createSingleDeck('s2');
  const hand = firstDeck.splice(0, HAND_SIZE);

  return {
    deck: firstDeck,
    nextDeck,
    hand,
    fieldCard: null,
    stage: 1,
    playedCards: [],
    playedCount: 0,
    score: 0,
    isGameOver: false,
    bet,
    bonusTotal: 0,
    lastBonus: null,
    bonusHits: { flush: 0, full_house: 0, four_of_a_kind: 0, straight_flush: 0, royal_flush: 0 },
  };
};

export const canPlayCard = (card: Card, fieldCard: Card | null): boolean => {
  if (!fieldCard) return true;
  return card.suit === fieldCard.suit || card.rank === fieldCard.rank;
};

export const playCard = (state: GameState, cardIndex: number): GameState => {
  if (state.isGameOver || cardIndex < 0 || cardIndex >= state.hand.length) {
    return state;
  }

  const card = state.hand[cardIndex];
  if (!canPlayCard(card, state.fieldCard)) {
    return state;
  }

  const newState = { ...state, hand: [...state.hand] };
  newState.fieldCard = card;
  newState.playedCards = [...state.playedCards, card];
  newState.playedCount += 1;

  if (newState.deck.length > 0) {
    // Refill the same slot the card was played from, instead of shifting the rest down.
    newState.hand[cardIndex] = newState.deck[0];
    newState.deck = newState.deck.slice(1);
  } else if (newState.stage === 1 && newState.nextDeck.length > 0) {
    // First 52-card stage cleared: move on to the second deck.
    newState.stage = 2;
    newState.playedCards = [];
    newState.hand[cardIndex] = newState.nextDeck[0];
    newState.deck = newState.nextDeck.slice(1);
    newState.nextDeck = [];
  } else {
    newState.hand.splice(cardIndex, 1);
  }

  const handRank = evaluateHand(newState.hand);
  if (handRank) {
    const amount = state.bet * HAND_BONUS_MULTIPLIERS[handRank];
    newState.bonusTotal += amount;
    newState.lastBonus = { id: `${Date.now()}-${cardIndex}`, hand: handRank, amount };
    newState.bonusHits = { ...newState.bonusHits, [handRank]: newState.bonusHits[handRank] + 1 };
  } else {
    newState.lastBonus = null;
  }

  const canPlayAny = newState.hand.some(c => canPlayCard(c, newState.fieldCard));
  if (!canPlayAny) {
    newState.isGameOver = true;
    // Base payout only — hand bonuses are already credited to the player's coins as they occur.
    newState.score = calculatePayout(newState.playedCount, newState.bet);
  }

  return newState;
};

export const RANK_VALUES: Record<CardRank, number> = {
  A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13,
};

export const drawRandomCard = (): Card => {
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  return { id: `draw-${Date.now()}-${Math.random()}`, suit, rank, isPlayed: false };
};

export type DoubleUpGuess = 'high' | 'low';

// Double Up uses its own ranking (2 is weakest, A is strongest) — separate from RANK_VALUES,
// which keeps A low so the poker-hand evaluator can still recognize the A-2-3-4-5 straight.
const DOUBLE_UP_RANK_VALUES: Record<CardRank, number> = {
  '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '10': 9, J: 10, Q: 11, K: 12, A: 13,
};

// Ties count as a loss — the guess must be strictly correct.
export const resolveDoubleUp = (baseCard: Card, nextCard: Card, guess: DoubleUpGuess): boolean => {
  const baseValue = DOUBLE_UP_RANK_VALUES[baseCard.rank];
  const nextValue = DOUBLE_UP_RANK_VALUES[nextCard.rank];
  if (nextValue === baseValue) return false;
  return guess === 'high' ? nextValue > baseValue : nextValue < baseValue;
};

export const HAND_BONUS_MULTIPLIERS: Record<HandRank, number> = {
  flush: 4,
  full_house: 6,
  four_of_a_kind: 10,
  straight_flush: 20,
  royal_flush: 100,
};

export const HAND_RANK_LABELS: Record<HandRank, string> = {
  flush: 'FLUSH',
  full_house: 'FULL HOUSE',
  four_of_a_kind: 'FOUR OF A KIND',
  straight_flush: 'STRAIGHT FLUSH',
  royal_flush: 'ROYAL FLUSH',
};

// Evaluate the current 5-card hand for a bonus poker hand. Returns null if no bonus hand applies.
export const evaluateHand = (hand: Card[]): HandRank | null => {
  if (hand.length !== 5) return null;

  const isFlush = hand.every(c => c.suit === hand[0].suit);
  const values = hand.map(c => RANK_VALUES[c.rank]).sort((a, b) => a - b);
  const uniqueValues = new Set(values);

  const isRoyal = isFlush && uniqueValues.size === 5 && [1, 10, 11, 12, 13].every(v => uniqueValues.has(v));
  const isSequentialStraight = uniqueValues.size === 5 && values[4] - values[0] === 4;

  if (isRoyal) return 'royal_flush';
  if (isFlush && isSequentialStraight) return 'straight_flush';

  const rankCounts: Record<number, number> = {};
  for (const v of values) {
    rankCounts[v] = (rankCounts[v] ?? 0) + 1;
  }
  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  if (counts[0] === 4) return 'four_of_a_kind';
  if (counts[0] === 3 && counts[1] === 2) return 'full_house';
  if (isFlush) return 'flush';
  return null;
};

export interface PayoutRow {
  min: number;
  max: number;
  multiplier: number;
}

// Payout multiplier table, based on total number of cards successfully played (BET multiplier).
// Ordered highest-to-lowest so getPayoutMultiplier can scan top-down.
export const PAYOUT_TABLE: PayoutRow[] = [
  { min: 104, max: 104, multiplier: 2000 },
  { min: 103, max: 103, multiplier: 1990 },
  { min: 102, max: 102, multiplier: 1970 },
  { min: 101, max: 101, multiplier: 1950 },
  { min: 100, max: 100, multiplier: 1920 },
  { min: 99, max: 99, multiplier: 1890 },
  { min: 98, max: 98, multiplier: 1860 },
  { min: 97, max: 97, multiplier: 1830 },
  { min: 96, max: 96, multiplier: 1800 },
  { min: 95, max: 95, multiplier: 1750 },
  { min: 94, max: 94, multiplier: 1700 },
  { min: 93, max: 93, multiplier: 1650 },
  { min: 92, max: 92, multiplier: 1600 },
  { min: 91, max: 91, multiplier: 1500 },
  { min: 90, max: 90, multiplier: 1400 },
  { min: 89, max: 89, multiplier: 1300 },
  { min: 88, max: 88, multiplier: 1200 },
  { min: 87, max: 87, multiplier: 1100 },
  { min: 86, max: 86, multiplier: 1000 },
  { min: 85, max: 85, multiplier: 900 },
  { min: 83, max: 84, multiplier: 800 },
  { min: 81, max: 82, multiplier: 700 },
  { min: 79, max: 80, multiplier: 600 },
  { min: 77, max: 78, multiplier: 520 },
  { min: 75, max: 76, multiplier: 460 },
  { min: 73, max: 74, multiplier: 400 },
  { min: 71, max: 72, multiplier: 350 },
  { min: 68, max: 70, multiplier: 300 },
  { min: 65, max: 67, multiplier: 260 },
  { min: 62, max: 64, multiplier: 220 },
  { min: 59, max: 61, multiplier: 180 },
  { min: 56, max: 58, multiplier: 150 },
  { min: 53, max: 55, multiplier: 120 },
  { min: 52, max: 52, multiplier: 100 },
  { min: 51, max: 51, multiplier: 80 },
  { min: 50, max: 50, multiplier: 60 },
  { min: 49, max: 49, multiplier: 55 },
  { min: 48, max: 48, multiplier: 50 },
  { min: 47, max: 47, multiplier: 45 },
  { min: 46, max: 46, multiplier: 40 },
  { min: 45, max: 45, multiplier: 35 },
  { min: 44, max: 44, multiplier: 30 },
  { min: 43, max: 43, multiplier: 28 },
  { min: 41, max: 42, multiplier: 22 },
  { min: 39, max: 40, multiplier: 20 },
  { min: 37, max: 38, multiplier: 18 },
  { min: 35, max: 36, multiplier: 16 },
  { min: 33, max: 34, multiplier: 14 },
  { min: 31, max: 32, multiplier: 12 },
  { min: 29, max: 30, multiplier: 10 },
  { min: 26, max: 28, multiplier: 8 },
  { min: 23, max: 25, multiplier: 6 },
  { min: 20, max: 22, multiplier: 4 },
  { min: 17, max: 19, multiplier: 3 },
  { min: 14, max: 16, multiplier: 2 },
  { min: 10, max: 13, multiplier: 1 },
  { min: 0, max: 9, multiplier: 0 },
];

export const getPayoutMultiplier = (playedCount: number): number => {
  const row = PAYOUT_TABLE.find(r => playedCount >= r.min && playedCount <= r.max);
  return row?.multiplier ?? 0;
};

export const calculatePayout = (playedCount: number, bet: number): number => {
  return bet * getPayoutMultiplier(playedCount);
};

// Remaining copies (0 or 1) of each suit+rank within the current 52-card stage, for the grid display.
export const getRemainingCounts = (playedCards: Card[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      counts[`${suit}${rank}`] = 1;
    }
  }
  for (const card of playedCards) {
    const key = `${card.suit}${card.rank}`;
    counts[key] = 0;
  }
  return counts;
};
