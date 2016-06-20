'use strict'
const pt = require('../../')
const assert = require('assert')
const path = require('path')
const test = require('tape')
const child_process = require('child_process')


test('exit_with_1 test', function (t) {
  t.plan(1);

  let out = 'test/fixtures/sources/c/out/exit_with_1'
  pt.compile('test/fixtures/sources/c/exit_with_1.c', {output: `${out}.o`}, () => {
    pt.link(`${out}.o`, {output: out}, () => {
      const e = child_process.spawn(out, [], {shell: true});
      e.on('error', (err) => {
        t.fail(err, 'Error must not be called')
      });
      e.on('close', (code) => {
        // FIXME
        t.ok(code === (process.platform === 'win32' ? 0 : 1), 'Compiled binary exit_with_1 must exit with code 1')
      });
    })
  })
})

test('return_with_0 test', function (t) {
  t.plan(1);
  let out = 'test/fixtures/sources/c/out/return_with_0'
  pt.compile('test/fixtures/sources/c/return_with_0.c', {output: `${out}.o`}, () => {
    pt.link(`${out}.o`, {output: out}, () => {
      const e = child_process.spawn(`${process.platform === 'win32' ? '': './'}${out}`, [], {shell: true});
      e.on('error', (err) => {
        assert(!err, 'Error must not be called')
      });
      e.on('close', (code) => {
        t.ok(code === 0, 'Compiled binary return_with_0 must exit with code 0')
      });
    })
  })
})

test('multiple_objects_exectuable test', function (t) {
  t.plan(1);
  let out = `${process.cwd()}/build/multiple_objects_exectuable`
  const sources = [
    'test/fixtures/sources/c/file_1.c',
    'test/fixtures/sources/c/file_2.c'
  ]

  // the output option will be forcefully ignored
  pt.compile(sources, {output: `${out}.o`}, (err, files) => {
    if (err)
      t.fail(err, 'Error must not be called')

    pt.link(files, {output: out}, (err, file) => {
      if (err) {
        t.fail(err, 'Error must not be called')
      }
      const e = child_process.spawn(`${process.cwd()}/build/${path.parse(file).name}`, [], {shell: true});
      e.on('error', (err) => {
        t.fail(err, 'Error must not be called')
      });
      e.on('close', (code) => {
        t.equal(code, 123, 'Compiled binary multiple_objects_exectuable must exit with code 123')
      });
    })
  })
})
