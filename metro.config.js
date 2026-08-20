const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, 'anim'],
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'cjs', 'mjs', 'json'],
    resolveRequest: (context, moduleName, platform) => {
      // @tanstack/react-query v4 hardcodes .mjs extension which bypasses native resolution.
      // Redirect to the .native.mjs variant so it uses react-native instead of react-dom.
      if (moduleName.endsWith('/reactBatchedUpdates.mjs')) {
        return context.resolveRequest(
          context,
          moduleName.replace('/reactBatchedUpdates.mjs', '/reactBatchedUpdates.native.mjs'),
          platform
        );
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
