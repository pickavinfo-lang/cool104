import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MAX_BET, MIN_BET } from '../constants/config';
import { useCoins } from '../context/CoinContext';
import { RootStackParamList } from '../types/navigation';
import { getBetThemeColor } from '../utils/betColor';
import { TOTAL_CARDS } from '../utils/cardGame';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

const COUNT_UP_DURATION = 1200;
const COUNT_UP_STEPS = 30;

export const ResultScreen = ({ route, navigation }: Props) => {
  const { playedCount, bet, coinsEarned, stage, doubleUpDone } = route.params;
  const { coins, addCoins, spendCoins } = useCoins();
  const themeColor = getBetThemeColor(bet, MIN_BET, MAX_BET);

  const isWinner = coinsEarned > 0;
  const isPerfect = playedCount === TOTAL_CARDS;
  const cardsTotal = stage === 1 ? 52 : 104;
  const canPlayAgain = (coins?.balance ?? 0) >= bet;
  const [collected, setCollected] = useState(!isWinner || !!doubleUpDone);

  const [displayedPay, setDisplayedPay] = useState(isWinner ? 0 : coinsEarned);

  useEffect(() => {
    if (!isWinner) return;

    let step = 0;
    const stepDuration = COUNT_UP_DURATION / COUNT_UP_STEPS;
    const interval = setInterval(() => {
      step += 1;
      const progress = step / COUNT_UP_STEPS;
      const eased = 1 - Math.pow(1 - progress, 3);
      if (step >= COUNT_UP_STEPS) {
        setDisplayedPay(coinsEarned);
        clearInterval(interval);
      } else {
        setDisplayedPay(Math.round(coinsEarned * eased));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isWinner, coinsEarned]);

  const handleCollect = () => {
    addCoins(coinsEarned);
    setCollected(true);
  };

  const handleDoubleUp = () => {
    navigation.replace('DoubleUp', { pendingAmount: coinsEarned, bet, playedCount, stage });
  };

  const handlePlayAgain = async () => {
    const success = await spendCoins(bet);
    if (success) {
      navigation.replace('Game', { bet });
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        {isPerfect && <Text style={[styles.perfectText, { color: themeColor }]}>PERFECT VICTORY!</Text>}

        <Text style={[styles.winnerText, isWinner ? { color: themeColor } : styles.gameOverText]}>
          {isWinner ? 'YOU WIN!' : 'GAME OVER'}
        </Text>

        {isWinner && (
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>PAY</Text>
            <Text style={[styles.payValue, { color: themeColor }]}>{displayedPay}</Text>
          </View>
        )}

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>CARDS PLAYED</Text>
          <Text style={styles.statValueSmall}>
            {playedCount}/{cardsTotal}
          </Text>
        </View>

        {isWinner && !collected ? (
          <>
            <Pressable style={[styles.primaryButton, { backgroundColor: themeColor }]} onPress={handleDoubleUp}>
              <Text style={styles.primaryButtonText}>DOUBLE UP</Text>
            </Pressable>
            <Pressable style={styles.secondaryButtonOutline} onPress={handleCollect}>
              <Text style={[styles.secondaryButtonOutlineText, { color: themeColor }]}>COLLECT</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: themeColor }, !canPlayAgain && styles.buttonDisabled]}
              disabled={!canPlayAgain}
              onPress={handlePlayAgain}
            >
              <Text style={styles.primaryButtonText}>
                {canPlayAgain ? 'PLAY AGAIN' : 'NOT ENOUGH COINS'}
              </Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.secondaryButtonText}>HOME</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  perfectText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  winnerText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  gameOverText: {
    color: '#adb5bd',
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 32,
  },
  payLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#adb5bd',
    marginRight: 8,
    letterSpacing: 1,
  },
  payValue: {
    fontSize: 56,
    fontWeight: '800',
  },
  statBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statLabel: {
    fontSize: 12,
    color: '#adb5bd',
    letterSpacing: 1,
  },
  statValueSmall: {
    fontSize: 20,
    fontWeight: '700',
    color: '#495057',
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  secondaryButtonOutline: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dee2e6',
  },
  secondaryButtonOutlineText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  secondaryButton: {
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#6c757d',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
