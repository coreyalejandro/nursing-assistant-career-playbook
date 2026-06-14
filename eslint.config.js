import tseslint from 'typescript-eslint';

/**
 * Pragmatic flat config: lints all TS/TSX with the typescript-eslint parser and
 * a curated, high-signal rule set (real-bug rules, not stylistic churn) so the
 * whole repo passes `--max-warnings=0` cleanly. Tighten over time as desired.
 */
export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      'no-debugger': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-func-assign': 'error',
      'no-unreachable': 'error',
      'no-cond-assign': ['error', 'always'],
      'no-self-assign': 'error',
      '@typescript-eslint/no-misused-new': 'error',
    },
  }
);
