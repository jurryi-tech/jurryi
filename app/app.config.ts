import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Jurryi',
  slug: 'jurryi',
  owner: 'uddits-organization',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'jurryi',
  userInterfaceStyle: 'light',
  newArchEnabled: false,
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#1a237e',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.jurryi.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1a237e',
    },
    package: 'com.jurryi.app',
    versionCode: 1,
    permissions: ['INTERNET'],
  },
  plugins: ['expo-router', 'expo-secure-store'],
  extra: {
    apiUrl: process.env.API_URL || 'https://jurryi-api-1042325455608.asia-south1.run.app/api',
    eas: {
      projectId: '3240d010-f881-4ee0-be69-11da2e35423f',
    },
  },
});
