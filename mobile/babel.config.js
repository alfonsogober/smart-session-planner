module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated plugin disabled - React Navigation v7 works without it for basic tabs
    // If you need animations later, re-enable this
    // plugins: ['react-native-reanimated/plugin'],
  };
};

