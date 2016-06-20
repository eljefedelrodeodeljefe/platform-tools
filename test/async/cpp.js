'use strict'
const pt = require('../../')
const assert = require('assert')
const test = require('tape')
const child_process = require('child_process')

test('cpp test', (t) => {
  t.plan(1)
  let out = 'test/fixtures/sources/cpp/out/simple'
  pt.compile('test/fixtures/sources/cpp/simple.cc', {output: `${out}.o`}, () => {
    pt.link(`${out}.o`, {output: out}, () => {
      const e = child_process.spawn(`${process.platform === 'win32' ? '': './'}${out}`, [], {shell: true});
      e.on('error', (err) => {
        t.fail(err, 'Error must not be called')
      });
      e.on('close', (code) => {
        t.ok(code === 0, 'Compiled binary simple must exit with code 0')
      });
    })
  })
})
