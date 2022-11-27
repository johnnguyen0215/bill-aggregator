module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
  parser: '@babel/eslint-parser',
  extends: ['airbnb', 'prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      modules: true,
    },
    ecmaVersion: 2018,
    requireConfigFile: false,
    sourceType: 'module',
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  plugins: ['react', 'prettier'],
  rules: {
    'react/react-in-jsx-scope': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/forbid-prop-types': [0, { forbid: ['any'] }],
    'react/prop-types': 0,
    'react/no-danger': 0,
    'import/prefer-default-export': 0,
    'jsx-a11y/control-has-associated-label': 0,
    'react/jsx-props-no-spreading': 0,
    'react-hooks/exhaustive-deps': 0,
    'no-console': 0,
  },
};
