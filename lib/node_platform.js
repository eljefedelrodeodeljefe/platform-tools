'use strict';
const http = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
// TODO: get rid of dependency
const tar = require('./tar');

const buildDirs = [
  `${process.cwd()}/build`,
  `${process.cwd()}/build/deps`,
  `${process.cwd()}/build/deps/${process.versions.node}`,
  `${process.cwd()}/build/Release`,
]

const r = process.release
const urls = [ {name: 'headers', url: r.headersUrl} ]
// only present on win32
if (process.platform === 'win32') this.urls.push( {name: 'node.lib', url: r.libUrl} )


class Addon {
  constructor() {
    this.buildDirs = buildDirs
    this.urls = urls
  }

  _setupBuildDir(cb) {
    this.buildDirs.forEach((dir) => {
      try {
        fs.mkdirSync(dir)
      } catch (e) {
        // ignore all errors
      }
    })
    process.nextTick(() => { return cb(null) })
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
        res
          .pipe(zlib.createUnzip())
          .pipe(tar.extract(output, {strip: 1}))
          .on('finish', () => {
            // check output
            fs.readdir(output, (err, files) => {
              if (err || files.length <= 0) {
                process.nextTick(() => { return cb(err ? err : new Error('no files')) })
              }
              process.nextTick(() => { return cb(null) })
            });
          })
        res.on('error', function (err) { return process.nextTick(() => { cb(err) }) });
      } else {
        res.pipe(fs.createWriteStream(output))
      }

    })
    req.end()
  }


  getDeps(cb) {
    let count = this.urls.length

    this._setupBuildDir((err) => {
      if (err) return cb(err)
      // first check whether download is necessary
      fs.readdir(`${process.cwd()}/build/deps/${process.versions.node}/headers/include/node`, (err, files) => {
        // Ignore the error case here, since we'll then override.
        // If the header dir has at least one file we assume it has them all
        if (files && files.length > 1)
          return process.nextTick(() => { cb(null) })

        this.urls.forEach((el) => {
          this._download(el.url, `${process.cwd()}/build/deps/${process.versions.node}/${el.name}`, (err) => {
            --count
            if (err) return cb(err)
            // invoke callback only when all deps have been downloaded or err'd
            if (count <= 0)
              return process.nextTick(() => { return cb(null) })
          })
        })
      })
    })
  }
}

module.exports = new Addon()
