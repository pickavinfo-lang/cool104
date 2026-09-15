import { StyleSheet, Text, View } from 'react-native';
import { HandRank } from '../types';
import { HAND_BONUS_MULTIPLIERS, HAND_RANK_LABELS } from '../utils/cardGame';

interface BonusHandTableProps {
  bonusHits: Record<HandRank, number>;
  bet: number;
}

const ORDER: HandRank[] = ['flush', 'full_house', 'four_of_a_kind', 'straight_flush', 'royal_flush'];

export const BonusHandTable = ({ bonusHits, bet }: BonusHandTableProps) => {
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerText, styles.nameCell]}>BONUS</Text>
        <Text style={[styles.cell, styles.headerText]}>PAYS</Text>
        <Text style={[styles.cell, styles.headerText]}>HITS</Text>
      </View>
      {ORDER.map(rank => {
        const hits = bonusHits[rank];
        return (
          <View key={rank} style={[styles.row, hits > 0 && styles.hitRow]}>
            <Text style={[styles.cell, styles.nameCell, hits > 0 && styles.hitText]}>
              {HAND_RANK_LABELS[rank]}
            </Text>
            <Text style={[styles.cell, hits > 0 && styles.hitText]}>
              {bet * HAND_BONUS_MULTIPLIERS[rank]}
            </Text>
            <Text style={[styles.cell, hits > 0 && styles.hitText]}>{hits}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e9ecef',
  },
  headerRow: {
    backgroundColor: '#f1f3f5',
  },
  headerText: {
    fontWeight: '800',
    color: '#495057',
  },
  cell: {
    flex: 1,
    fontSize: 10,
    paddingVertical: 5,
    paddingHorizontal: 6,
    color: '#495057',
    textAlign: 'center',
  },
  nameCell: {
    flex: 1.8,
    textAlign: 'left',
  },
  hitRow: {
    backgroundColor: '#fff3cd',
  },
  hitText: {
    color: '#856404',
    fontWeight: '800',
  },
});
