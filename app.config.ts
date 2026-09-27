import type { ConfigContext, ExpoConfig } from 'expo/config';

// baseUrl is only for the GitHub Pages web build (see .github/workflows/deploy-pages.yml).
// Setting it for native builds breaks asset paths inside the iOS app bundle.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  experiments: {
    ...config.experiments,
    ...(process.env.WEB_BASE_URL ? { baseUrl: process.env.WEB_BASE_URL } : {}),
  },
});
