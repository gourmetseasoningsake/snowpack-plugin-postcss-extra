import { promises as fs } from 'fs';
import path from 'path';
import execa from 'execa';
import glob from 'glob';

import List from 'crocks/List';
import Async from 'crocks/Async';
import First from 'crocks/First';

import curry from 'crocks/helpers/curry';
import liftA2 from 'crocks/helpers/liftA2';
import liftA3 from 'crocks/helpers/liftA3';
import mreduceMap from 'crocks/helpers/mreduceMap';
import defaultProps from 'crocks/helpers/defaultProps';

import safe from 'crocks/Maybe/safe';
import getProp from 'crocks/Maybe/getProp';

import not from 'crocks/logic/not';

import isSame from 'crocks/predicates/isSame';
import isObject from 'crocks/predicates/isObject';
import isString from 'crocks/predicates/isString';
import isEmpty from 'crocks/predicates/isEmpty';

import constant from 'crocks/combinators/constant';






const safeObject = safe(isObject);
const safeString = safe(isString);
const safeNotEmpty = safe(not(isEmpty));
const safeJsExt = safe(x => x === '.js');
const safeCssExt = safe(x => x === '.css');
const safeJsTmpExt =
  safe(
    x =>
    typeof x === 'string' &&
    !!x.match(/^\.[^\s]{1,}$/)
  );


const chooseCssExt = mreduceMap(First, safeCssExt);
export const chooseJsExt = mreduceMap(First, safeJsExt);






const defaultOptions =
  { input: ['.css'],
    output: ['.css', '.js'],
    jsTmpExt: '.jstmpext',
    postcss: '',
  };



export const mergeDefaultOptions =
  options =>
  safeObject(options)
  .map(defaultProps(defaultOptions))
  .option(defaultOptions);






export const readFile =
  Async.fromPromise(
    path =>
    fs.readFile(path, 'utf-8')
  );



export const renameFile =
  ext =>
  filePath =>
  fs.rename(
    filePath,
    path.format({
      ...path.parse(filePath),
      base: undefined,
      ext
    })
  );



export const findFile =
  path =>
  safeString(path)
  .map(glob.sync)
  .map(List.fromArray)
  .option(List.empty());



export const command =
  (cmd, flags, cwd) =>
  Async.fromPromise(
    content =>
    execa.command([cmd, flags].join(' '), {
      cwd: cwd || process.cwd(),
      input: content
    })
  );






export const outputFromOptions =
  options =>
  liftA2(
    x =>
    y =>
    List.fromArray([...x, y]),
    getProp('output', options),
    safeJsTmpExt(options.jsTmpExt)
  )
  .option(List.empty());






const outputJsFromOptions =
  options =>
  liftA2(
    x =>
    y =>
    List.fromArray([x, y]),
    getProp('output', options)
    .chain(chooseJsExt),
    safeJsTmpExt(options.jsTmpExt)
  )
  .option(List.empty());



const outputCssFromOptions =
  options =>
  getProp('output', options)
  .chain(chooseCssExt)
  .either(
    constant(List.empty()),
    List.of
  );



const objectFromEntries =
  (a, b) =>
  liftA3(
    o =>
    k =>
    v =>
    (o[k] = v, o),
    safeObject(a),
    safeString(b[0]),
    safeString(b[1])
  )
  .option(a);



const entryFromVK =
  val =>
  key =>
  liftA2(
    a => b => [a, b],
    safeString(key),
    safeString(val)
  )
  .option([]);



export const objectFromContent =
  curry(
    (isDev, options, { stdout }) =>
    outputJsFromOptions(options)
    .filter(
      isDev ?
      isSame('.js') :
      isSame(options.jsTmpExt)
    )
    .map(entryFromVK(`export default ${JSON.stringify(stdout)};`))
    .concat(
      outputCssFromOptions(options)
      .map(entryFromVK(stdout))
    )
    .reduce(objectFromEntries, {})
  );
