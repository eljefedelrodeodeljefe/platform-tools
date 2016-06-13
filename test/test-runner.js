'use strict'
const fs = require('fs')
const child_process = require('child_process')

fs.readdir('./test/async', (err, data) => {
  if (err) return console.error(err)

  data.forEach((file) => {
    child_process.exec(`node test/async/${file}`, (err, stdout, stderr) => {
      if (err) {
        console.log(stderr)
        throw err
      }
    })
  })
})
