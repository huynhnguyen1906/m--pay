import eslintPluginPrettier from 'eslint-plugin-prettier';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import eslintPluginTs from '@typescript-eslint/eslint-plugin';

export default [
    {
        files: ['**/*.{js,mjs,cjs,ts}'],
        ignores: ['**/node_modules/**', '**/dist/**'],
        languageOptions: {
            globals: globals.node,
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: './tsconfig.json',
            },
        },
        plugins: {
            prettier: eslintPluginPrettier,
            '@typescript-eslint': eslintPluginTs,
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            'prettier/prettier': 'warn',
        },
    },
];
