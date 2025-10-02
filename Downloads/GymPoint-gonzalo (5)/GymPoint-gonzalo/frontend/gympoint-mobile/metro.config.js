// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Habilitar el transformer para .svg
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Quitar 'svg' de assetExts y agregar a sourceExts
const { assetExts, sourceExts } = config.resolver;
config.resolver.assetExts = assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg'];

module.exports = config;
