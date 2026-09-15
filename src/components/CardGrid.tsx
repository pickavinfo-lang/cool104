import { StyleSheet, Text, View } from 'react-native';
import { RANKS, SUITS } from '../utils/cardGame';
import { CardSuit } from '../types';

interface CardGridProps {
  remainingCounts: Record<string, number>;
}

const isRedSuit = (suit: CardSuit) => suit === '♥' || suit === '♦';

export const CardGrid = ({ remainingCounts }: CardGridProps) => {
  return (
    <View style={styles.grid}>
      {SUITS.map(suit => (
        <View key={suit} style={styles.row}>
          <View style={[styles.cell, styles.suitCell]}>
            <Text style={[styles.suitText, isRedSuit(suit) && styles.redText]}>{suit}</Text>
          </View>
          {RANKS.map(rank => {
            const isGone = (remainingCounts[`${suit}${rank}`] ?? 0) === 0;
            return (
              <View key={rank} style={[styles.cell, isGone && styles.cellGone]}>
                <Text style={[styles.rankText, isRedSuit(suit) && !isGone && styles.redText, isGone && styles.goneText]}>
                  {rank}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  suitCell: {
    flex: 0.85,
    backgroundColor: '#f8f9fa',
  },
  cellGone: {
    backgroundColor: '#f1f3f5',
  },
  suitText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212529',
  },
  rankText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#212529',
  },
  redText: {
    color: '#dc3545',
  },
  goneText: {
    color: '#ced4da',
    textDecorationLine: 'line-through',
  },
});
