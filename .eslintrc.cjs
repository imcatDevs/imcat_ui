module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // 기본 규칙
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
    
    // 코드 스타일
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',
    'arrow-body-style': ['warn', 'as-needed'],
    'no-var': 'error',
    
    // 들여쓰기 및 공백
    'indent': ['error', 2, { SwitchCase: 1 }],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always'],
    
    // 함수
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'arrow-spacing': ['error', { before: true, after: true }],
    
    // 객체
    'object-curly-spacing': ['error', 'always'],
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    
    // 배열
    'array-bracket-spacing': ['error', 'never'],
    
    // 비교
    'eqeqeq': ['error', 'always'],
    
    // 주석
    'spaced-comment': ['warn', 'always'],
    
    // 보안
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    
    // Promise
    'no-async-promise-executor': 'error',
    'prefer-promise-reject-errors': 'error'
  }
};
