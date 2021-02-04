import { promises as fs } from 'fs';
import path from 'path';
import execa from 'execa';


import List from 'crocks/List';
import Async from 'crocks/Async';


import curry from 'crocks/helpers/curry';
import liftA2 from 'crocks/helpers/liftA2';
import liftA3 from 'crocks/helpers/liftA3';


import safe from 'crocks/Maybe/safe';
import getProp from 'crocks/Maybe/getProp';


import isSame from 'crocks/predicates/isSame';
import isObject from 'crocks/predicates/isObject';
import isString from 'crocks/predicates/isString';
import isTruthy from 'crocks/predicates/isTruthy';


import constant from 'crocks/combinators/constant';



export const isValueAtIdx =
  i =>
  xs =>
  !!xs[i];


export const ifElse =
  (pred, f, g) =>
  x =>
  pred ? f(x) : g(x);


export const join =
  str =>
  xs =>
  xs.join(str);


export const read =
  Async.fromPromise(
    path =>
    fs.readFile(path, 'utf-8')
  );


export const rename =
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


export const entryFromKey =
  val =>
  key =>
  liftA2(
    a => b => [a, b],
    safe(isString, key),
    safe(isString, val)
  )
  .option([])


export const command =
  (cmd, flags, cwd) =>
  Async.fromPromise(
    content =>
    execa.command([cmd, ...flags].join(' '), {
      cwd: cwd || process.cwd(),
      input: content
    })
  );


export const jsExtsFromOptions =
  options =>
  safe(isObject, options)
  .chain(getProp('js'))
  .chain(safe(isTruthy))
  .either(
    constant(List.empty()),
    constant(List.fromArray(
      [ options.jsExt, options.jsTmpExt ]
    ))
  );


const toKeyVal =
  (a, b) =>
  liftA3(
    o => k => v => (o[k] = v, o),
    safe(isObject, a),
    safe(isString, b[0]),
    safe(isString, b[1])
  )
  .option(a);


export const objectFromContent =
  curry(
    (isDev, options, { stdout }) =>
    jsExtsFromOptions(options)
    .filter(
      isDev ?
      isSame(options.jsExt) :
      isSame(options.jsTmpExt)
    )
    .map(entryFromKey(
      `export default ${JSON.stringify(stdout)};`
    ))
    .concat(
      List
      .fromArray(options.input)
      .map(entryFromKey(stdout))
    )
    .reduce(toKeyVal, {})
  );
