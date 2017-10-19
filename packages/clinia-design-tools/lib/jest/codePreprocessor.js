const { createTransformer } = require('babel-jest');
const getBabelCommonConfig = require('../getBabelCommonConfig');
const rewriteSource = require('./rewriteSource');
const tsJest = require('ts-jest/preprocessor');

const libDir = process.env.LIB_DIR || 'components';

function processDemo({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(path) {
        rewriteSource(t, path, libDir);
      },
    },
  };
}

module.exports = {
  process(src, path, config, transformOptions) {
    global.__clearBabelAntdPlugin && global.__clearBabelAntdPlugin(); // eslint-disable-line
    const babelConfig = getBabelCommonConfig();
    babelConfig.plugins = [...babelConfig.plugins];

    if (/\/demo\//.test(path)) {
      babelConfig.plugins.push(processDemo);
    }

    babelConfig.plugins.push([
      require.resolve('babel-plugin-import'),
      {
        libraryName: 'antd-mobile',
        libraryDirectory: '../../../../components',
      },
    ]);

    const isTypeScript = path.endsWith('.ts') || path.endsWith('.tsx');
    const isJavaScript = path.endsWith('.js') || path.endsWith('.jsx');

    if (isTypeScript) {
      config.globals['ts-jest'] = config.globals['ts-jest'] || {};
      config.globals['ts-jest'].babelConfig = babelConfig;

      return tsJest.process(src, path, config, transformOptions);
    }

    const babelJest = createTransformer(babelConfig);
    const fileName = isJavaScript ? path : 'file.js';
    return babelJest.process(src, fileName);
  },
};
