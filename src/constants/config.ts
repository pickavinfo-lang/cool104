export const COIN_CONFIG = {
  STARTING_COINS: 100,
  DAILY_MINIMUM_COINS: 100,
  PRO_DAILY_COINS: 100,
  AD_REWARD_COINS: 10,
  MAX_AD_VIEWS_PER_DAY: 10,
};

export const IAP_PRODUCTS = [
  {
    id: 'cool104_pro_pass',
    name: 'Pro Pass',
    price: 500,
    type: 'pro_pass' as const,
  },
  {
    id: 'cool104_coins_100',
    name: '100 Coins',
    price: 120,
    coins: 100,
    type: 'coin_package' as const,
  },
  {
    id: 'cool104_coins_300',
    name: '300 Coins',
    price: 300,
    coins: 300,
    type: 'coin_package' as const,
  },
  {
    id: 'cool104_coins_600',
    name: '600 Coins',
    price: 500,
    coins: 600,
    type: 'coin_package' as const,
  },
];

export const MIN_BET = 1;
export const MAX_BET = 50;

export const ADMOB_CONFIG = {
  // Placeholder - will be configured when setting up AdMob
  // Get your own Ad Unit IDs from Google AdMob console
  BANNER_AD_UNIT_ID: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy',
  REWARDED_AD_UNIT_ID: 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzzzzzz',
  INTERSTITIAL_AD_UNIT_ID: 'ca-app-pub-xxxxxxxxxxxxxxxx/wwwwwwwwwwwwww',
};
