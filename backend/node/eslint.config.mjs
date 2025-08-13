// backend/node/eslint.config.mjs
import js from '@eslint/js';
import globals from 'globals';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default [
  // ----- Ignorar rutas (reemplaza .eslintignore) -----
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'public/**',
      'swagger.json',
      '../db/**', // ignora el dump SQL fuera de /node
    ],
  },

  // ----- Reglas generales para JS del backend -----
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script', // CommonJS (require/module.exports)
      globals: {
        ...globals.node, // habilita process, __dirname, require, etc.
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      'prettier/prettier': 'error', // integra Prettier al lint
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    },
  },

  // ----- Override para TESTS (Jest). Ajustá si usás Mocha. -----
  {
    files: ['**/__tests__/**', '**/tests/**', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest, // describe, it, expect, beforeEach, jest, etc.
      },
    },
    rules: {
      'no-console': 'off',
    },
  },

  // ----- Override para scripts/migraciones -----
  {
    files: ['**/scripts/**', '**/migrations/**'],
    rules: {
      'no-console': 'off',
    },
  },
];
