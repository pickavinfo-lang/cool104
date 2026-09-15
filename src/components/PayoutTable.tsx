import { StyleSheet, Text, View } from 'react-native';
import { PAYOUT_TABLE, PayoutRow } from '../utils/cardGame';

interface PayoutTableProps {
  playedCount: number;
  bet: number;
}

const UPCOMING_ROWS = 4;

const rowLabel = (row: PayoutRow) => (row.min === row.max ? `${row.min}` : `${row.min}-${row.max}`);

export const PayoutTable = ({ playedCount, bet }: PayoutTableProps) => {
  // PAYOUT_TABLE is ordered highest-to-lowest already.
  const milestones = PAYOUT_TABLE.filter(r => r.max === 52 || r.max === 104);
  const upcomingAll = PAYOUT_TABLE.filter(r => r.max !== 52 && r.max !== 104 && r.max >= playedCount);
  const upcoming = upcomingAll.slice(-UPCOMING_ROWS);
  const rows = [...milestones, ...upcoming];

  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerText]}>CARDS</Text>
        <Text style={[styles.cell, styles.headerText, styles.payCell]}>PAYS</Text>
      </View>
      {rows.map(row => {
        const isCurrent = playedCount >= row.min && playedCount <= row.max;
        const isMilestone = row.max === 52 || row.max === 104;
        return (
          <View
            key={`${row.min}-${row.max}`}
            style={[styles.row, isMilestone && styles.milestoneRow, isCurrent && styles.currentRow]}
          >
            <Text style={[styles.cell, isCurrent && styles.currentText]}>{rowLabel(row)}</Text>
            <Text style={[styles.cell, styles.payCell, isCurrent && styles.currentText]}>
              {bet * row.multiplier}
            </Text>
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
    fontSize: 10,
  },
  cell: {
    flex: 1,
    fontSize: 11,
    paddingVertical: 5,
    paddingHorizontal: 6,
    color: '#495057',
  },
  payCell: {
    textAlign: 'right',
    fontWeight: '700',
  },
  milestoneRow: {
    backgroundColor: '#fff3cd',
  },
  currentRow: {
    backgroundColor: '#667eea',
  },
  currentText: {
    color: '#fff',
    fontWeight: '800',
  },
});
