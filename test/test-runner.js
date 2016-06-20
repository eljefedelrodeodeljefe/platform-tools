'use strict'
const fs = require('fs')
const child_process = require('child_process')

fs.readdir('./test/async', (err, data) => {
  if (err) return console.error(err)

  if (process.platform === 'win32') {
    data.forEach((file) => {
      child_process.exec(`node test/async/${file}`, (err, stdout, stderr) => {
        if (err) {
          console.log(stdout);
          console.log(stderr)
          throw err
        }
      })
    })
  }
  else {
    const cp = child_process.spawn('./node_modules/.bin/tape', [`${process.cwd()}/test/async/*.js`], {stdio: ['inherit', 'inherit', 'inherit']})
    cp.on('error', () => {
      console.log('Test runner failed');
    })
    cp.on('exit', (code) => {
      if (code != 0)
        throw new Error('Tests failed')
    })
    cp
  }

})
