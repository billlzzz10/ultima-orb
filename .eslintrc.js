module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
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
    'quotes': ['error', 'single'],
    '@typescript-eslint/quotes': ['error', 'single'],
    
    // 🔥 Semicolons ต้องมี
    'semi': ['error', 'always'],
    
    // 🔥 Indentation - ปิดไว้ก่อน
    'indent': 'off',
    '@typescript-eslint/indent': 'off',
  },
  ignorePatterns: ['dist/', 'node_modules/'],
  overrides: [
    {
      files: [
        'scripts/*.js',
        'src/automation-demo.js',
        'src/fetch-all-notion-data.js',
        'src/fetch-all-notion-data-simple.js',
        'src/test-notion-analysis.js',
        'src/analyze-notion-data.js',
        'mcp_notion.js',
      ],
      parser: 'espree',
      plugins: [],
      extends: [],
      rules: {},
    },
  ],
};
