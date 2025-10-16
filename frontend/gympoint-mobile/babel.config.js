module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@app': './app',
            '@features': './src/features',
            '@presentation': './src/presentation',
            '@shared': './src/shared',
            '@di': './src/di',
            '@assets': './assets',
          },
        },
      ],
      [
        'styled-components',
        {
          displayName: true,
          ssr: false,
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
