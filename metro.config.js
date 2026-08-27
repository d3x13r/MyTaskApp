// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase JS SDK за React Native разчита на CommonJS файлове (.cjs) за да намери
// правилния "react-native" build (с AsyncStorage persistence и др.).
// Metro от Expo SDK 53+ включва по подразбиране "package exports" резолюция,
// която обърква тази структура и кара Firebase Auth да не пази сесията (или дори
// да гърми при production build). Изключваме тази резолюция, за да работи коректно.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;