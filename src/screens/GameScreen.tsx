import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BonusHandTable } from '../components/BonusHandTable';
import { CardGrid } from '../components/CardGrid';
import { PayoutTable } from '../components/PayoutTable';
import { PlayingCard } from '../components/PlayingCard';
import { MAX_BET, MIN_BET } from '../constants/config';
import { useCoins } from '../context/CoinContext';
import { useGameLogic } from '../hooks/useGameLogic';
import { Card } from '../types';
import { RootStackParamList } from '../types/navigation';
import { getBetThemeColor } from '../utils/betColor';
import { CARDS_PER_STAGE, getPayoutMultiplier, getRemainingCounts, HAND_RANK_LABELS } from '../utils/cardGame';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const HAND_SIZE = 5;
const HAND_HORIZONTAL_PADDING = 20;
const HAND_CARD_GAP = 8;
const screenWidth = Dimensions.get('window').width;
const handCardWidth = Math.floor(
  (screenWidth - HAND_HORIZONTAL_PADDING * 2 - HAND_CARD_GAP * (HAND_SIZE - 1)) / HAND_SIZE
);
const handCardHeight = Math.round(handCardWidth * (106 / 76));

interface FlyingCard {
  card: Card;
  startX: number;
  startY: number;
  translate: Animated.ValueXY;
  scale: Animated.Value;
}

export const GameScreen = ({ route, navigation }: Props) => {
  const { bet } = route.params;
  const { state, play, isCardPlayable, score } = useGameLogic(bet);
  const { addCoins } = useCoins();
  const navigated = useRef(false);
  const lastBonusId = useRef<string | null>(null);
  const themeColor = getBetThemeColor(bet, MIN_BET, MAX_BET);

  const fieldRef = useRef<View>(null);
  const handRefs = useRef<Record<number, View | null>>({});
  const [flyingCard, setFlyingCard] = useState<FlyingCard | null>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const fieldScale = useRef(new Animated.Value(1)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const bonusOpacity = useRef(new Animated.Value(0)).current;
  const stageBannerOpacity = useRef(new Animated.Value(0)).current;
  const prevMultiplierRef = useRef(getPayoutMultiplier(0));
  const prevStageRef = useRef(state.stage);
  const [stageBanner, setStageBanner] = useState(false);

  const remainingCounts = getRemainingCounts(state.playedCards);

  useEffect(() => {
    if (state.isGameOver && !navigated.current) {
      navigated.current = true;
      setTimeout(() => {
        navigation.replace('Result', {
          score,
          playedCount: state.playedCount,
          bet,
          coinsEarned: score,
          stage: state.stage,
        });
      }, 600);
    }
  }, [state.isGameOver, score, state.playedCount, state.stage, bet, navigation]);

  useEffect(() => {
    if (state.lastBonus && state.lastBonus.id !== lastBonusId.current) {
      lastBonusId.current = state.lastBonus.id;
      addCoins(state.lastBonus.amount);

      bonusOpacity.setValue(1);
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(bonusOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [state.lastBonus, addCoins, bonusOpacity]);

  useEffect(() => {
    const currentMultiplier = getPayoutMultiplier(state.playedCount);
    if (currentMultiplier > prevMultiplierRef.current) {
      triggerFieldPulse();
    }
    prevMultiplierRef.current = currentMultiplier;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.playedCount]);

  useEffect(() => {
    if (state.stage !== prevStageRef.current) {
      prevStageRef.current = state.stage;
      setStageBanner(true);
      stageBannerOpacity.setValue(1);
      Animated.sequence([
        Animated.delay(1500),
        Animated.timing(stageBannerOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => setStageBanner(false));
    }
  }, [state.stage, stageBannerOpacity]);

  const triggerFieldPulse = () => {
    fieldScale.setValue(0.6);
    Animated.spring(fieldScale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }).start();

    shakeX.setValue(0);
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 10, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 6, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  };

  const handlePlay = (index: number) => {
    if (!isCardPlayable(index) || pendingIndex !== null) return;
    const card = state.hand[index];
    const handView = handRefs.current[index];

    if (!handView || !fieldRef.current) {
      play(index);
      return;
    }

    setPendingIndex(index);
    handView.measureInWindow((hx, hy) => {
      fieldRef.current?.measureInWindow((fx, fy) => {
        const translate = new Animated.ValueXY({ x: 0, y: 0 });
        const scale = new Animated.Value(1);
        setFlyingCard({ card, startX: hx, startY: hy, translate, scale });

        Animated.parallel([
          Animated.timing(translate, {
            toValue: { x: fx - hx, y: fy - hy },
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.2, duration: 130, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 130, useNativeDriver: true }),
          ]),
        ]).start(() => {
          setFlyingCard(null);
          setPendingIndex(null);
          play(index);
        });
      });
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: themeColor }]}>
        <Text style={styles.headerTitle}>COOL 104</Text>
        <Text style={styles.betText}>BET {bet}</Text>
        <Text style={styles.progress}>STAGE {state.stage}</Text>
      </View>

      <View style={styles.gridFixed}>
        <CardGrid remainingCounts={remainingCounts} />
      </View>

      <View style={styles.scrollWrap}>
        <View style={styles.tablesRow}>
          <View style={styles.tableHalf}>
            <PayoutTable playedCount={state.playedCount} bet={bet} />
          </View>
          <View style={styles.tableHalf}>
            <BonusHandTable bonusHits={state.bonusHits} bet={bet} />
          </View>
        </View>
      </View>

      <Animated.View
        style={[styles.fieldArea, { transform: [{ translateX: shakeX }] }]}
      >
        <View style={styles.fieldSideInfo}>
          <Text style={styles.fieldSideNumber}>{state.playedCount}</Text>
          <Text style={styles.fieldSideLabel}>PLAYED</Text>
        </View>

        <View ref={fieldRef} collapsable={false}>
          {state.fieldCard ? (
            <Animated.View style={{ transform: [{ scale: fieldScale }] }}>
              <PlayingCard card={state.fieldCard} size="large" />
            </Animated.View>
          ) : (
            <View style={styles.fieldPlaceholder}>
              <Text style={styles.fieldPlaceholderText}>PICK A CARD</Text>
            </View>
          )}
        </View>

        <View style={styles.fieldSideInfo}>
          <Text style={styles.fieldSideNumber}>{CARDS_PER_STAGE - state.playedCards.length}</Text>
          <Text style={styles.fieldSideLabel}>LEFT</Text>
        </View>
      </Animated.View>

      <View style={styles.handArea}>
        <View style={styles.handRow}>
          {state.hand.map((card, index) => (
            <View
              key={card.id}
              ref={el => {
                handRefs.current[index] = el;
              }}
              collapsable={false}
            >
              {pendingIndex === index ? (
                <View style={[styles.cardSlotEmpty, { width: handCardWidth, height: handCardHeight }]} />
              ) : (
                <PlayingCard
                  card={card}
                  onPress={() => handlePlay(index)}
                  disabled={!isCardPlayable(index)}
                  customSize={{ width: handCardWidth, height: handCardHeight }}
                />
              )}
            </View>
          ))}
        </View>
      </View>

      {stageBanner && (
        <Animated.View
          pointerEvents="none"
          style={[styles.stageBanner, { backgroundColor: themeColor, opacity: stageBannerOpacity }]}
        >
          <Text style={styles.stageBannerTitle}>CONGRATULATIONS!</Text>
          <Text style={styles.stageBannerSubtitle}>MOVE TO STAGE {state.stage}</Text>
        </Animated.View>
      )}

      {state.lastBonus && (
        <Animated.View pointerEvents="none" style={[styles.bonusBanner, { opacity: bonusOpacity }]}>
          <Text style={styles.bonusBannerText}>
            {HAND_RANK_LABELS[state.lastBonus.hand]}! +{state.lastBonus.amount}
          </Text>
        </Animated.View>
      )}

      {flyingCard && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.flyingCard,
            {
              left: flyingCard.startX,
              top: flyingCard.startY,
              transform: [
                { translateX: flyingCard.translate.x },
                { translateY: flyingCard.translate.y },
                { scale: flyingCard.scale },
              ],
            },
          ]}
        >
          <PlayingCard card={flyingCard.card} />
        </Animated.View>
      )}
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
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  betText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  progress: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  gridFixed: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  scrollWrap: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
  },
  tablesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tableHalf: {
    flex: 1,
  },
  fieldArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  fieldSideInfo: {
    alignItems: 'center',
    width: 56,
  },
  fieldSideNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#495057',
  },
  fieldSideLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#adb5bd',
    letterSpacing: 0.5,
  },
  fieldPlaceholder: {
    width: 112,
    height: 156,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldPlaceholderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#adb5bd',
    textAlign: 'center',
  },
  cardSlotEmpty: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  handArea: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  handRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  flyingCard: {
    position: 'absolute',
    zIndex: 100,
  },
  stageBanner: {
    position: 'absolute',
    top: '42%',
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    zIndex: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  stageBannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  stageBannerSubtitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  bonusBanner: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: '#ffa500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bonusBannerText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
