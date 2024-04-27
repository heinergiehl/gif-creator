module.exports = {
  extends: [
    'next',
    'next/core-web-vitals',
  ],
  plugins: ['react', '@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    // Add your custom ESLint rules here
  },
}
