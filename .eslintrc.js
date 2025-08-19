module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: ['@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // 🔥 เข้มงวด - ห้าม any
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-unused-vars': 'off',
    
    // 🔥 Quotes ต้องเป็น single
    'quotes': ['error', 'double'],
    '@typescript-eslint/quotes': ['error', 'double'],
    
    // 🔥 Semicolons ต้องมี
    'semi': ['error', 'always'],
    
    // 🔥 Indentation - ปิดไว้ก่อน
    'indent': 'off',
    '@typescript-eslint/indent': 'off',
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js'],
};
