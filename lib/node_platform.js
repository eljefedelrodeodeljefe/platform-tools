const http = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const EventEmitter = require('events');
// TODO: get rid of dependency
const tar = require('tar');


class Addon extends EventEmitter {
  constructor() {
    super()
    this._setupBuildDir()
  }

  _setupBuildDir() {
    fs.mkdirSync('build')
    fs.mkdirSync('build/deps')
    fs.mkdirSync(`build/deps/node`)
    fs.mkdirSync(`build/deps/node/${process.versions.node}`)
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
           .pipe(tar.Extract({path: `build/deps/node/${process.versions.node}`, strip: 1}))
      } else {
        res.pipe(fs.createWriteStream(output))
      }
      res.on('end', function () { return process.nextTick(() => { cb() }) });
      res.on('error', function (err) { return process.nextTick(() => { cb(err) }) });
    })
    req.end()
  }

  downloadDeps(cb) {
    let count = 1
    const r = process.release
    const urls = [ {name: 'headers', url: r.headersUrl} ]
    // only present on win32
    if (process.platform === 'win32') urls.push( {name: 'node.lib', url: r.libUrl} )

    urls.forEach((el) => {
      this._download(el.url, `build/deps/node/${process.versions.node}/${el.name}`, (err) => {
        if (err) return cb(err)
        // invoke callback only when all deps have been downloaded or err'd
        if (count >= urls.length)
          return cb(null)
        else
          return process.nextTick(() => {count++})
      })
    })
  }
}


const a = new Addon()
a.downloadDeps((err) => {
  if (err) throw err
  console.log('downloads ended')
})
