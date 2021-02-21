import { nodeResolve } from '@rollup/plugin-node-resolve';
import pkg from './package.json';



export default [
  // CommonJS (for Node) and ES module (for bundlers) build.
  { input: 'plugin.js',
    output: [
        { file: pkg.main,
          format: 'cjs',
          exports: 'default'
        },
        { file: pkg.module,
          format: 'es',
          exports: 'default'
        }
    ],

    //specifies the extensions of files that the plugin will operate on
    plugins: [ nodeResolve({ extensions: ['.js' ] }) ],
    external: [
      'path',
      'glob',
      'execa',
      'crocks/List',
      'crocks/Async',
      'crocks/First',
      'crocks/helpers/curry',
      'crocks/helpers/liftA2',
      'crocks/helpers/liftA3',
      'crocks/helpers/mreduceMap',
      'crocks/helpers/defaultProps',
      'crocks/Maybe/safe',
      'crocks/Maybe/getProp',
      'crocks/logic/not',
      'crocks/predicates/isSame',
      'crocks/predicates/isObject',
      'crocks/predicates/isString',
      'crocks/predicates/isEmpty',
      'crocks/combinators/constant'
    ],
  }
];
