import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CoinDisplay } from '../components/CoinDisplay';
import { COIN_CONFIG, IAP_PRODUCTS } from '../constants/config';
import { useCoins } from '../context/CoinContext';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Shop'>;

export const ShopScreen = ({ navigation }: Props) => {
  const { coins, loading, watchAdForCoins, canWatchAd, addCoins, setPro, resetCoins } = useCoins();

  if (loading || !coins) return null;

  const handleWatchAd = async () => {
    // TODO: Integrate expo-ads-admob rewarded ad here.
    // For now this simulates a successful ad view.
    const success = await watchAdForCoins();
    if (success) {
      Alert.alert('獲得！', `+${COIN_CONFIG.AD_REWARD_COINS} コイン獲得しました`);
    }
  };

  const handlePurchase = async (productId: string) => {
    // TODO: Integrate RevenueCat purchase flow here.
    const product = IAP_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    if (product.type === 'pro_pass') {
      await setPro(true);
      Alert.alert('購入完了', `Pro Passが有効になりました！広告なし・毎日${COIN_CONFIG.PRO_DAILY_COINS}コイン支給`);
    } else if (product.type === 'coin_package' && product.coins) {
      await addCoins(product.coins);
      Alert.alert('購入完了', `+${product.coins} コイン獲得しました`);
    }
  };

  const handleReset = () => {
    Alert.alert('テストデータをリセット', 'コイン残高・Pro Pass状態をリセットします（開発確認用）', [
      { text: 'キャンセル', style: 'cancel' },
      { text: 'リセット', style: 'destructive', onPress: () => resetCoins() },
    ]);
  };

  const coinPackages = IAP_PRODUCTS.filter(p => p.type === 'coin_package');
  const proPass = IAP_PRODUCTS.find(p => p.type === 'pro_pass');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SHOP</Text>
        <CoinDisplay balance={coins.balance} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>広告を見てコインを獲得</Text>
        <Pressable
          style={[styles.adButton, !canWatchAd && styles.buttonDisabled]}
          disabled={!canWatchAd}
          onPress={handleWatchAd}
        >
          <Text style={styles.adButtonText}>
            {canWatchAd ? `広告を見る (+${COIN_CONFIG.AD_REWARD_COINS})` : '本日の視聴回数上限に達しました'}
          </Text>
        </Pressable>
        <Text style={styles.adCounter}>
          本日 {coins.adViewsToday} / {COIN_CONFIG.MAX_AD_VIEWS_PER_DAY} 回視聴済み
        </Text>
      </View>

      {!coins.isPro && proPass && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pro Pass</Text>
          <Pressable style={styles.proButton} onPress={() => handlePurchase(proPass.id)}>
            <Text style={styles.proButtonTitle}>{proPass.name}</Text>
            <Text style={styles.proButtonSubtitle}>広告なし・毎日{COIN_CONFIG.PRO_DAILY_COINS}コイン支給</Text>
            <Text style={styles.proButtonPrice}>¥{proPass.price}（買い切り）</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>コインを購入</Text>
        <View style={styles.coinGrid}>
          {coinPackages.map(pkg => (
            <Pressable key={pkg.id} style={styles.coinCard} onPress={() => handlePurchase(pkg.id)}>
              <Text style={styles.coinCardAmount}>{pkg.coins}</Text>
              <Text style={styles.coinCardPrice}>¥{pkg.price}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>戻る</Text>
      </Pressable>

      <Pressable style={styles.devResetButton} onPress={handleReset}>
        <Text style={styles.devResetButtonText}>テストデータをリセット（開発用）</Text>
      </Pressable>
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#495057',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6c757d',
    marginBottom: 10,
  },
  adButton: {
    backgroundColor: '#ffa500',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  adButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  adCounter: {
    fontSize: 12,
    color: '#adb5bd',
    marginTop: 6,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  proButton: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  proButtonTitle: {
    color: '#00d9ff',
    fontSize: 17,
    fontWeight: '800',
  },
  proButtonSubtitle: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 4,
  },
  proButtonPrice: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  coinGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  coinCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  coinCardAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#495057',
  },
  coinCardPrice: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '700',
    marginTop: 6,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButtonText: {
    color: '#6c757d',
    fontSize: 14,
  },
  devResetButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  devResetButtonText: {
    color: '#ced4da',
    fontSize: 11,
  },
});
