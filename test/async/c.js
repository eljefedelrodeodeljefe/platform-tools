'use strict'
const pt = require('../../')
const assert = require('assert')
const child_process = require('child_process')

{
  let out = 'test/fixtures/sources/c/out/exit_with_1.o'
  pt.compile('test/fixtures/sources/c/exit_with_1.c', {output: out}, () => {
    const e = child_process.spawn('./' + out, []);
    e.on('close', (code) => {
      assert(code === 1, 'Compiled binary exit_with_1 must exit with code 1')
    });
  })
}

{
  let out = 'test/fixtures/sources/c/out/return_with_0.o'
  pt.compile('test/fixtures/sources/c/return_with_0.c', {output: out}, () => {
    const e = child_process.spawn('./' + out, []);
    e.on('close', (code) => {
      assert(code === 0, 'Compiled binary return_with_0 must exit with code 0')
    });
  })
}
