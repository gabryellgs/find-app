module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // NÃO precisa mais do 'nativewind/babel' no v4
  };
};