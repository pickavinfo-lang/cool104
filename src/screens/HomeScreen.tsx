import Slider from '@react-native-community/slider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CoinDisplay } from '../components/CoinDisplay';
import { MAX_BET, MIN_BET } from '../constants/config';
import { useCoins } from '../context/CoinContext';
import { RootStackParamList } from '../types/navigation';
import { getBetThemeColor } from '../utils/betColor';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const { coins, loading, spendCoins } = useCoins();
  const [bet, setBet] = useState(MIN_BET);
  const themeColor = getBetThemeColor(bet, MIN_BET, MAX_BET);

  if (loading || !coins) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const canPlay = coins.balance >= bet;

  const handlePlay = async () => {
    const success = await spendCoins(bet);
    if (success) {
      navigation.navigate('Game', { bet });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <CoinDisplay balance={coins.balance} />
      </View>

      <View style={styles.center}>
        <Text style={[styles.title, { color: themeColor }]}>COOL 104</Text>
        <Text style={styles.subtitle}>CONNECT CARDS. PLAY ALL 104.</Text>

        <View style={styles.betSection}>
          <Text style={styles.betLabel}>BET</Text>
          <Text style={[styles.betValue, { color: themeColor }]}>{bet}</Text>
          <Slider
            style={styles.slider}
            minimumValue={MIN_BET}
            maximumValue={MAX_BET}
            step={1}
            value={bet}
            onValueChange={setBet}
            minimumTrackTintColor={themeColor}
            maximumTrackTintColor="#dee2e6"
            thumbTintColor={themeColor}
          />
          <View style={styles.sliderRange}>
            <Text style={styles.sliderRangeText}>{MIN_BET}</Text>
            <Text style={styles.sliderRangeText}>{MAX_BET}</Text>
          </View>
        </View>

        <Pressable
          style={[styles.playButton, { backgroundColor: themeColor }, !canPlay && styles.buttonDisabled]}
          disabled={!canPlay}
          onPress={handlePlay}
        >
          <Text style={styles.playButtonText}>PLAY</Text>
        </Pressable>

        <Pressable style={styles.shopButton} onPress={() => navigation.navigate('Shop')}>
          <Text style={styles.shopButtonText}>SHOP</Text>
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
  loading: {
    flex: 1,
    textAlign: 'center',
    marginTop: 100,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 8,
    marginBottom: 40,
    letterSpacing: 1,
  },
  betSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  betLabel: {
    fontSize: 13,
    color: '#adb5bd',
    marginBottom: 4,
    letterSpacing: 1,
  },
  betValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginTop: -4,
  },
  sliderRangeText: {
    fontSize: 12,
    color: '#adb5bd',
  },
  playButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  shopButton: {
    paddingVertical: 10,
  },
  shopButtonText: {
    color: '#ffa500',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
