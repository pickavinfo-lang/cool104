import { useCallback, useState } from 'react';
import { calculatePayout, canPlayCard, initializeGame, playCard } from '../utils/cardGame';
import { GameState } from '../types';

export const useGameLogic = (bet: number) => {
  const [state, setState] = useState<GameState>(() => initializeGame(bet));
  const [lastPlayedIndex, setLastPlayedIndex] = useState<number | null>(null);

  const play = useCallback((cardIndex: number) => {
    setLastPlayedIndex(cardIndex);
    setState(prev => playCard(prev, cardIndex));
  }, []);

  const reset = useCallback(() => {
    setState(initializeGame(bet));
  }, [bet]);

  const isCardPlayable = useCallback(
    (cardIndex: number) => canPlayCard(state.hand[cardIndex], state.fieldCard),
    [state.hand, state.fieldCard]
  );

  return {
    state,
    play,
    reset,
    isCardPlayable,
    lastPlayedIndex,
    score: state.isGameOver ? calculatePayout(state.playedCount, bet) : 0,
  };
};
