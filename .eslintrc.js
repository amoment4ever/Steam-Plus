module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
  },
  extends: ['plugin:react/recommended', 'airbnb', 'prettier'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'prettier'],
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@features', './src/features'],
          ['@shared', './src/shared'],
          ['@core/*', './src/core'],
          ['@assets/*', './src/assets'],
          ['@pages/*', './src/pages'],
          ['@store/*', './src/store'],
        ],
      },
    },
  },
  rules: {
    'import/prefer-default-export': 0,
    'no-console': 0,
    'no-restricted-syntax': 0,
    'arrow-body-style': 0,
    'react/jsx-filename-extension': 0,
    'react/prop-types': 0,
    'react/jsx-props-no-spreading': 0,
    camelcase: 0,
    'no-continue': 0,
    'no-await-in-loop': 0,
    'prettier/prettier': 'warn',
  },
}
