const http = require('https');
const fs = require('fs');
const EventEmitter = require('events');

class Addon extends EventEmitter {
  constructor() {
    super()
    fs.mkdirSync('build')
    fs.mkdirSync('build/deps')
    fs.mkdirSync('build/deps/node')
    fs.mkdirSync('build/deps/node/sources')
  }

  _download(url, output, cb) {
    const options = {
      'method': 'GET',
      'hostname': 'nodejs.org',
      'path': url,
      'headers': {}
    };

    var req = http.request(options, function (res) {
      var chunks = [];

      res.pipe(fs.createWriteStream(output))

      res.on('end', function () { return process.nextTick(() => { cb() }) });
      res.on('error', function (err) { return process.nextTick(() => { cb(err) }) });
    });

    req.end();
  }

  downloadDeps(cb) {
    let count = 1
    const r = process.release
    const urls = [ {name: 'sources/source', url: r.sourceUrl},
                   {name: 'headers', url: r.headersUrl},
                   {name: 'node.lib', url: r.libUrl} ]
    urls.forEach((el) => {
      this._download(el.url, `build/deps/node/${el.name}`, (err) => {
        if (err) return cb(err)
        // invoke callback only when all deps have been downloaded or err'd
        if (count >= urls.length)
          return cb(null)
        else
          count++
      })
    })
  }
}


const a = new Addon()
a.downloadDeps((err) => {
  if (err) throw err
  console.log('downloads ended')
})
