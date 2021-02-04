import glob from 'glob';


import {
  isValueAtIdx,
  join,
  read,
  rename,
  command,
  jsExtsFromOptions,
  objectFromContent
} from './helpers';


export default function ( snowpackConfig, pluginOptions = {} ) {

  const options =
    { ...{
        input: ['.css'],
        config: '',
        js: true,
        jsExt: '.js',
        jsTmpExt: '.rjs',
      },
      ...pluginOptions
    };


  const flags =
    [[ '--config', options.config ]]
    .filter(isValueAtIdx(1))
    .map(join(' '));


  return {
    name: '@ampire/snowpack-plugin-postcss-extra',

    resolve: {
      input: options.input,
      output:
        jsExtsFromOptions(options)
        .toArray()
        .concat(options.input)
    },

    load:
      ({ isDev, filePath }) =>
      read(filePath)
      .chain(command('postcss', flags, snowpackConfig.root))
      .map(objectFromContent(isDev, options))
      .toPromise(),

    optimize:
      ({ buildDirectory }) =>
      options.js &&
      glob
      .sync(`${buildDirectory}/**/*${options.jsTmpExt}`)
      .map(rename(options.jsExt))
  };
};
