import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CARD_BACK, PlayingCard } from '../components/PlayingCard';
import { MAX_BET, MIN_BET } from '../constants/config';
import { useCoins } from '../context/CoinContext';
import { Card } from '../types';
import { RootStackParamList } from '../types/navigation';
import { getBetThemeColor } from '../utils/betColor';
import { DoubleUpGuess, drawRandomCard, resolveDoubleUp } from '../utils/cardGame';

type Props = NativeStackScreenProps<RootStackParamList, 'DoubleUp'>;

const MAX_ROUNDS = 4;
const FLIP_DELAY = 700;
const REVEAL_DELAY = 1200;

export const DoubleUpScreen = ({ route, navigation }: Props) => {
  const { pendingAmount, bet, playedCount, stage } = route.params;
  const { addCoins } = useCoins();
  const themeColor = getBetThemeColor(bet, MIN_BET, MAX_BET);

  const [round, setRound] = useState(1);
  const [amount, setAmount] = useState(pendingAmount);
  const [baseCard, setBaseCard] = useState<Card>(() => drawRandomCard());
  const [revealCard, setRevealCard] = useState<Card | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [outcome, setOutcome] = useState<'won' | 'lost' | null>(null);
  const [busy, setBusy] = useState(false);
  const flipScale = useRef(new Animated.Value(1)).current;
  const backPulse = useRef(new Animated.Value(1)).current;

  const finish = (finalAmount: number) => {
    addCoins(finalAmount);
    navigation.replace('Result', {
      score: finalAmount,
      playedCount,
      bet,
      coinsEarned: finalAmount,
      stage,
      doubleUpDone: true,
    });
  };

  const handleGuess = (guess: DoubleUpGuess) => {
    if (busy) return;
    setBusy(true);
    setIsFlipping(true);

    backPulse.setValue(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(backPulse, { toValue: 1.06, duration: 220, useNativeDriver: true }),
        Animated.timing(backPulse, { toValue: 1, duration: 220, useNativeDriver: true }),
      ])
    ).start();

    const nextCard = drawRandomCard();

    setTimeout(() => {
      backPulse.stopAnimation();
      const won = resolveDoubleUp(baseCard, nextCard, guess);
      setRevealCard(nextCard);
      setIsFlipping(false);
      setOutcome(won ? 'won' : 'lost');

      flipScale.setValue(0.4);
      Animated.spring(flipScale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();

      setTimeout(() => {
        if (won) {
          const newAmount = amount * 2;
          if (round >= MAX_ROUNDS) {
            finish(newAmount);
            return;
          }
          setAmount(newAmount);
          setRound(r => r + 1);
          setBaseCard(nextCard);
          setRevealCard(null);
          setOutcome(null);
          setBusy(false);
        } else {
          finish(0);
        }
      }, REVEAL_DELAY);
    }, FLIP_DELAY);
  };

  const handleCollect = () => {
    if (busy) return;
    finish(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: themeColor }]}>
        <Text style={styles.headerTitle}>DOUBLE UP</Text>
        <Text style={styles.headerRound}>
          ROUND {round}/{MAX_ROUNDS}
        </Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.amountLabel}>CURRENT PAY</Text>
        <Text style={[styles.amountValue, { color: themeColor }]}>{amount}</Text>

        <View style={styles.cardsRow}>
          <View style={styles.cardCol}>
            <Text style={styles.cardColLabel}>BASE</Text>
            <PlayingCard card={baseCard} size="large" />
          </View>
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.cardCol}>
            <Text style={styles.cardColLabel}>NEXT</Text>
            {isFlipping ? (
              <Animated.View style={[styles.cardBack, { transform: [{ scale: backPulse }] }]}>
                <Image source={CARD_BACK} style={styles.cardBackImage} resizeMode="contain" />
              </Animated.View>
            ) : revealCard ? (
              <Animated.View style={{ transform: [{ scale: flipScale }] }}>
                <PlayingCard card={revealCard} size="large" />
              </Animated.View>
            ) : (
              <View style={styles.cardPlaceholder} />
            )}
          </View>
        </View>

        <View style={styles.outcomeSlot}>
          {outcome && (
            <Text style={[styles.outcomeText, outcome === 'won' ? { color: themeColor } : styles.lostText]}>
              {outcome === 'won' ? 'CORRECT!' : 'MISS...'}
            </Text>
          )}
        </View>

        <View style={styles.guessRow}>
          <Pressable
            style={[styles.guessButton, { backgroundColor: themeColor }, busy && styles.buttonDisabled]}
            disabled={busy}
            onPress={() => handleGuess('high')}
          >
            <Text style={styles.guessButtonText}>HIGH</Text>
          </Pressable>
          <Pressable
            style={[styles.guessButton, { backgroundColor: themeColor }, busy && styles.buttonDisabled]}
            disabled={busy}
            onPress={() => handleGuess('low')}
          >
            <Text style={styles.guessButtonText}>LOW</Text>
          </Pressable>
        </View>

        <Pressable style={styles.collectButton} disabled={busy} onPress={handleCollect}>
          <Text style={[styles.collectButtonText, { color: themeColor }]}>COLLECT {amount}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  headerRound: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  amountLabel: {
    fontSize: 12,
    color: '#adb5bd',
    letterSpacing: 1,
  },
  amountValue: {
    fontSize: 44,
    fontWeight: '800',
    marginBottom: 24,
  },
  cardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardCol: {
    alignItems: 'center',
  },
  cardColLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#adb5bd',
    marginBottom: 8,
    letterSpacing: 1,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ced4da',
    marginHorizontal: 16,
  },
  cardPlaceholder: {
    width: 112,
    height: 156,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  cardBack: {
    width: 112,
    height: 156,
  },
  cardBackImage: {
    width: '100%',
    height: '100%',
  },
  outcomeSlot: {
    height: 28,
    justifyContent: 'center',
    marginBottom: 8,
  },
  outcomeText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  lostText: {
    color: '#dc3545',
  },
  guessRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  guessButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  guessButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  collectButton: {
    paddingVertical: 12,
  },
  collectButtonText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
