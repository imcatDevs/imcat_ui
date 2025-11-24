import terser from '@rollup/plugin-terser';
import scss from 'rollup-plugin-scss';
import babel from '@rollup/plugin-babel';

const production = !process.env.ROLLUP_WATCH;

// 코어 번들
const coreConfig = {
  input: 'src/core/index.js',
  output: [
    {
      file: 'dist/imcat-ui.js',
      format: 'iife',
      name: 'IMCAT',
      sourcemap: !production
    },
    {
      file: 'dist/imcat-ui.min.js',
      format: 'iife',
      name: 'IMCAT',
      plugins: [terser()],
      sourcemap: production
    }
  ],
  plugins: [
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          targets: {
            chrome: '90',
            firefox: '88',
            safari: '14',
            edge: '90'
          },
          modules: false
        }]
      ]
    }),
    scss({
      output: production ? 'dist/imcat-ui.min.css' : 'dist/imcat-ui.css',
      outputStyle: production ? 'compressed' : 'expanded',
      sourceMap: !production
    })
  ]
};

// 모듈 번들 (개별)
const moduleConfig = {
  input: {
    theme: 'src/modules/theme/theme.js'
    // 필요한 모듈 추가
  },
  output: {
    dir: 'dist/modules',
    format: 'esm',
    entryFileNames: '[name]/[name].js',
    sourcemap: !production
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    }),
    production && terser()
  ].filter(Boolean)
};

// 코어 + 모듈 빌드
export default [coreConfig, moduleConfig];
