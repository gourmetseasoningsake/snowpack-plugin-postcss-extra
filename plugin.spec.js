import test from 'ava';
import sinon from 'sinon';


import { promises as fs } from 'fs';
import execa from 'execa';


import plugin from './plugin';


const setupStubs =
  cssStr =>
  [ sinon
    .stub(fs, 'readFile')
    .returns(
      new Promise(res => res(cssStr))
    ),

    sinon
    .stub(execa, 'command')
    .returns(
      new Promise(res => res({ stdout: cssStr }))
    )
  ];



test.serial( 'load with default options',

  async t => {

    //s
    const cssStr = 'body:before{content:"hello kitty"}';
    const stubs = setupStubs(cssStr);

    //e
    const pluginInstance = plugin({}, {});
    const result =
      await pluginInstance
      .load({
        isDev: true,
        filePath: 'path'
      });

    //v
    t.deepEqual(
      result,
      { '.js': `export default ${JSON.stringify(cssStr)};`,
        '.css': cssStr
      }
    );

    //td
    stubs.map(x => x.restore());
  }
);



test.serial( 'load with option.js set to false',

  async t => {

    //s
    const cssStr = 'body:before{content:"hello kitty"}';
    const stubs = setupStubs(cssStr);

    //e
    const pluginInstance = plugin({}, { js: false });
    const result =
      await pluginInstance
      .load({
        isDev: true,
        filePath: 'path'
      });

    //v
    t.deepEqual(result, { '.css': cssStr });

    //td
    stubs.map(x => x.restore());
  }
);
