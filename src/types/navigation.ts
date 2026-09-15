export type RootStackParamList = {
  Home: undefined;
  Game: { bet: number };
  Result: {
    score: number;
    playedCount: number;
    bet: number;
    coinsEarned: number;
    stage: 1 | 2;
    doubleUpDone?: boolean;
  };
  DoubleUp: { pendingAmount: number; bet: number; playedCount: number; stage: 1 | 2 };
  Shop: undefined;
};
