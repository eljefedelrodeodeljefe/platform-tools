const pt = require('../')
const assert = require('assert')
const child_process = require('child_process')

{
  child_process.execSync('clang test/fixtures/sources/return_with_0.c -o test/fixtures/sources/return_with_0')
  const e = child_process.spawn('./test/fixtures/sources/exit_with_1', []);
  e.on('close', (code) => {
    assert(code === 1, 'Compiled binary exit_with_1 must exit with code 1')
  });
}

{
  child_process.execSync('clang test/fixtures/sources/exit_with_1.c -o test/fixtures/sources/exit_with_1')
  const e = child_process.spawn('./test/fixtures/sources/return_with_0', []);
  e.on('close', (code) => {
    assert(code === 0, 'Compiled binary return_with_0 must exit with code 0')
  });
}
