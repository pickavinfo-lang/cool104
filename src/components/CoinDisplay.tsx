import { StyleSheet, Text, View } from 'react-native';

interface CoinDisplayProps {
  balance: number;
}

export const CoinDisplay = ({ balance }: CoinDisplayProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.balance}>{balance}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  balance: {
    fontSize: 16,
    fontWeight: '700',
    color: '#856404',
  },
});
