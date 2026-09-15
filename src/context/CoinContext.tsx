import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { COIN_CONFIG } from '../constants/config';
import { UserCoins } from '../types';

const STORAGE_KEY = 'cool104_user_coins';

const getTodayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

const defaultCoins = (isPro: boolean): UserCoins => ({
  balance: COIN_CONFIG.STARTING_COINS,
  lastResetDate: getTodayString(),
  adViewsToday: 0,
  isPro,
});

interface CoinContextValue {
  coins: UserCoins | null;
  loading: boolean;
  spendCoins: (amount: number) => Promise<boolean>;
  watchAdForCoins: () => Promise<boolean>;
  addCoins: (amount: number) => void;
  setPro: (isPro: boolean) => void;
  resetCoins: () => void;
  canWatchAd: boolean;
}

const CoinContext = createContext<CoinContextValue | null>(null);

// A single shared instance of coin state for the whole app — every screen reads and writes
// through this same React state, so there's no race between one screen's AsyncStorage write
// and the next screen's read on navigation (which is what silently dropped bonus payouts before).
export const CoinProvider = ({ children }: { children: ReactNode }) => {
  const [coins, setCoins] = useState<UserCoins | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback(async (next: UserCoins) => {
    setCoins(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const updateCoins = useCallback((updater: (prev: UserCoins) => UserCoins) => {
    setCoins(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const today = getTodayString();

      if (!raw) {
        await persist(defaultCoins(false));
        setLoading(false);
        return;
      }

      const parsed: UserCoins = JSON.parse(raw);

      if (parsed.lastResetDate !== today) {
        // Pro Pass grants a fresh 100 coins every day (on top of whatever is left).
        // Free tier just gets topped up to the daily floor.
        const nextBalance = parsed.isPro
          ? parsed.balance + COIN_CONFIG.PRO_DAILY_COINS
          : Math.max(parsed.balance, COIN_CONFIG.DAILY_MINIMUM_COINS);

        await persist({
          ...parsed,
          balance: nextBalance,
          lastResetDate: today,
          adViewsToday: 0,
        });
      } else {
        setCoins(parsed);
      }

      setLoading(false);
    })();
  }, [persist]);

  const spendCoins = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!coins || coins.balance < amount) return false;
      updateCoins(prev => ({ ...prev, balance: prev.balance - amount }));
      return true;
    },
    [coins, updateCoins]
  );

  const watchAdForCoins = useCallback(async (): Promise<boolean> => {
    if (!coins || coins.adViewsToday >= COIN_CONFIG.MAX_AD_VIEWS_PER_DAY) return false;

    updateCoins(prev => ({
      ...prev,
      balance: prev.balance + COIN_CONFIG.AD_REWARD_COINS,
      adViewsToday: prev.adViewsToday + 1,
    }));
    return true;
  }, [coins, updateCoins]);

  const addCoins = useCallback(
    (amount: number) => {
      updateCoins(prev => ({ ...prev, balance: prev.balance + amount }));
    },
    [updateCoins]
  );

  const setPro = useCallback(
    (isPro: boolean) => {
      updateCoins(prev => ({ ...prev, isPro }));
    },
    [updateCoins]
  );

  // Dev/testing helper — wipes local coin state (balance, Pro status, ad views) back to a fresh install.
  const resetCoins = useCallback(() => {
    persist(defaultCoins(false));
  }, [persist]);

  const value: CoinContextValue = {
    coins,
    loading,
    spendCoins,
    watchAdForCoins,
    addCoins,
    setPro,
    resetCoins,
    canWatchAd: coins ? coins.adViewsToday < COIN_CONFIG.MAX_AD_VIEWS_PER_DAY : false,
  };

  return <CoinContext.Provider value={value}>{children}</CoinContext.Provider>;
};

export const useCoins = (): CoinContextValue => {
  const ctx = useContext(CoinContext);
  if (!ctx) {
    throw new Error('useCoins must be used within a CoinProvider');
  }
  return ctx;
};
