const { withXcodeProject } = require('expo/config-plugins');

/**
 * Newer Xcode (26.x) defaults ENABLE_USER_SCRIPT_SANDBOXING to YES, which
 * denies the "Bundle React Native code and images" phase writing ip.txt into
 * the app bundle. Expo's generated project doesn't set the flag, so pin it off.
 */
module.exports = function withUserScriptSandboxingOff(config) {
  return withXcodeProject(config, (cfg) => {
    cfg.modResults.addBuildProperty('ENABLE_USER_SCRIPT_SANDBOXING', 'NO');
    return cfg;
  });
};
