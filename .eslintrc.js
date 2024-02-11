module.exports = {
    env: {
      browser: true,
      es2021: true
    },
    // extends: ['react-app', 'react-app/jest', 'plugin:react/recommended', 'airbnb',],
    extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
    overrides: [
      {
        files: ['*.js', '*.jsx'],
        rules: {
          'prettier/prettier': ['error', { endOfLine: 'auto' }],
          'react/react-in-jsx-scope': 'off',
          'import/no-unused-modules': [1, { unusedExports: true }],
          'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
          'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
          'react/destructuring-assignment': [0, 'always'],
          'import/prefer-default-export': 'off',
          'react/jsx-props-no-spreading': 'off',
          'comma-dangle': 'off',
          'no-shadow': 'off',
          'no-undef': 'off',
          'no-empty-pattern': 'off'
        }
      }
    ],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      }
    },
    plugins: ['react', 'prettier', 'import']
  };
  