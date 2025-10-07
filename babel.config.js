module.exports = function (api) {
  // Detect web by the caller name used by webpack's babel-loader
  const isWeb = api.caller((caller) => !!caller && caller.name === 'babel-loader');
  return {
    presets: ['babel-preset-expo'],
    // Web: add export-namespace-from for Reanimated v4 web support
    // All platforms: ensure react-native-worklets/plugin is last
    plugins: [
      isWeb && '@babel/plugin-proposal-export-namespace-from',
      'react-native-worklets/plugin',
    ].filter(Boolean),
  };
};