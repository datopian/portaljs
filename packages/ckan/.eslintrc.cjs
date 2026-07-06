module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'warn'
  },
  overrides: [
    {
      // Barrel files re-export types and utilities, not components — the
      // Fast Refresh component-only rule does not apply to them.
      files: ['src/**/index.tsx'],
      rules: {
        'react-refresh/only-export-components': 'off'
      }
    }
  ]
};