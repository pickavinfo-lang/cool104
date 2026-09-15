export type CardSuit = '♠' | '♥' | '♦' | '♣';
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: CardSuit;
  rank: CardRank;
  isPlayed: boolean;
}

export type HandRank = 'flush' | 'full_house' | 'four_of_a_kind' | 'straight_flush' | 'royal_flush';

export interface HandBonusEvent {
  id: string;
  hand: HandRank;
  amount: number;
}

export interface GameState {
  deck: Card[];
  nextDeck: Card[];
  hand: Card[];
  fieldCard: Card | null;
  stage: 1 | 2;
  playedCards: Card[]; // cards played in the current 52-card stage (grid display)
  playedCount: number; // total cards played across both stages (0-104)
  score: number;
  isGameOver: boolean;
  bet: number;
  bonusTotal: number;
  lastBonus: HandBonusEvent | null;
  bonusHits: Record<HandRank, number>;
}

export interface UserCoins {
  balance: number;
  lastResetDate: string;
  adViewsToday: number;
  isPro: boolean;
}

export interface IAP {
  productId: string;
  name: string;
  price: number;
  coins?: number; // for coin purchases
  type: 'pro_pass' | 'coin_package';
}
