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

// 모듈 번들 함수 (각 모듈을 독립적으로 빌드)
function createModuleConfig(moduleName) {
  return {
    input: `src/modules/${moduleName}/${moduleName}.js`,
    output: {
      file: `dist/modules/${moduleName}/${moduleName}.js`,
      format: 'esm',
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
}

// 각 모듈별 개별 config 생성
const moduleConfigs = [
  'theme', 'overlays', 'dropdown', 'navigation', 'pickers', 'selectors', 'forms', 'feedback', 'tooltips', 'carousel', 'data-viz',
  // Phase 3 Advanced Features
  'stepper', 'scroll', 'live-status', 'advanced-ui', 'text-editors', 'media-viewer', 'social',
  // Text Visualization
  'wordcloud',
  // Image Gallery
  'imagelist',
  // Security & Project Management
  'security-input', 'gantt'
].map(createModuleConfig);

// 코어 + 모듈 빌드
export default [coreConfig, ...moduleConfigs];
