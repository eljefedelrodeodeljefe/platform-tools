'use strict';
const http = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
// TODO: get rid of dependency
const tar = require('tar');


class Addon {
  constructor() {

  }

  _setupBuildDir(cb) {
    const count = 1
    const buildDirs = [
      `${__dirname}/build`,
      `${__dirname}/build/deps`,
      `${__dirname}/build/deps/node`,
      `${__dirname}/build/deps/node/${process.versions.node}`,
      `${__dirname}/build/Release`,
      `${__dirname}/build/Debug`
    ]
    buildDirs.forEach((dir) => {
      fs.mkdir(dir, (err) => {
        // ignore existing folders
        if (err && err.code !== 'EEXIST') return process.nextTick(() => { cb(err) })
        if (count >= buildDirs.length)
          return process.nextTick(() => { cb(null) })
        else
          count++
      })
    })
  }

  _download(url, output, cb) {
    const options = {
      'method': 'GET',
      'hostname': 'nodejs.org',
      'path': url,
      'headers': {}
    };
    const req = http.request(options, function (res) {
      if (path.parse(url).ext === '.gz') {
        res.pipe(zlib.createUnzip())
           .pipe(tar.Extract({path: `${__dirname}/build/deps/node/${process.versions.node}`, strip: 1}))
      } else {
        res.pipe(fs.createWriteStream(output))
      }
      res.on('end', function () { return process.nextTick(() => { cb() }) });
      res.on('error', function (err) { return process.nextTick(() => { cb(err) }) });
    })
    req.end()
  }

  getDeps(cb) {
    let count = 1
    const r = process.release
    const urls = [ {name: 'headers', url: r.headersUrl} ]
    // only present on win32
    if (process.platform === 'win32') urls.push( {name: 'node.lib', url: r.libUrl} )
    // first check whether download is necessary
    this._setupBuildDir((err) => {
      if (err) return cb(err)
      fs.readdir(`${__dirname}/build/deps/node/${process.versions.node}/include/node`, (err, files) => {
        // if the header dir has at least one file we assume it has them all
        if (files.length > 1)
          return process.nextTick(() => {cb(null)})

        urls.forEach((el) => {
          this._download(el.url, `${__dirname}/build/deps/node/${process.versions.node}/${el.name}`, (err) => {
            if (err) return cb(err)
            // invoke callback only when all deps have been downloaded or err'd
            if (count >= urls.length)
              return process.nextTick(() => { cb(null) })
            else
              return process.nextTick(() => { count++ })
          })
        })
      })
    })
  }
}

module.exports = new Addon()
