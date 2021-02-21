import {
  readFile,
  findFile,
  renameFile,
  command,
  chooseJsExt,
  outputFromOptions,
  objectFromContent,
  mergeDefaultOptions
} from './helpers';


export default function ( snowpackConfig, pluginOptions = {} ) {

  const options = mergeDefaultOptions(pluginOptions);
  const output = outputFromOptions(options);

  return {
    name: '@ampire/snowpack-plugin-postcss-extra',

    resolve: {
      input: options.input,
      output
    },

    load:
      ({ isDev, filePath }) =>
      readFile(filePath)
      .chain(command('postcss', options.postcss, snowpackConfig.root))
      .map(objectFromContent(isDev, options))
      .toPromise(),

    optimize:
      ({ buildDirectory }) =>
      chooseJsExt(output)
      .map(
        x =>
        findFile(`${buildDirectory}/**/*${options.jsTmpExt}`)
        .map(renameFile(x))
      )
  };
};
