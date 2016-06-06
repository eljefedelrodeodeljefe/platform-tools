'use strict'
const pt = require('../../')
const assert = require('assert')
const child_process = require('child_process')

{
  let out = 'test/fixtures/sources/cpp/out/simple.o'
  console.log('came here');
  pt.compile('test/fixtures/sources/cpp/simple.cc', {output: out}, () => {
    // const e = child_process.spawn('./' + out, []);
    // e.on('close', (code) => {
    //   assert(code === 1, 'Compiled binary simple.cc must exit with code 0')
    // });
  })
}

{
  // let out = 'test/fixtures/sources/c/out/return_with_0'
  // pt.compile('test/fixtures/sources/c/return_with_0.c', {output: out}, () => {
  //   const e = child_process.spawn('./' + out, []);
  //   e.on('close', (code) => {
  //     assert(code === 0, 'Compiled binary return_with_0 must exit with code 0')
  //   });
  // })
}
