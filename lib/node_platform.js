'use strict';
const http = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
// TODO: get rid of dependency
const tar = require('./tar');


class Addon {
  constructor() {

  }

  _setupBuildDir(cb) {
    const buildDirs = [
      `${process.cwd()}/build`,
      `${process.cwd()}/build/deps`,
      `${process.cwd()}/build/deps/node-v${process.versions.node}`,
      `${process.cwd()}/build/Release`,
      `${process.cwd()}/build/Debug`
    ]
    let count = buildDirs.length
    buildDirs.forEach((dir) => {
      fs.mkdir(dir, (err) => {
        --count
        // ignore error cases: existing folders; TODO: handle other cases
        if (count <= 0)
          return process.nextTick(() => { return cb(null) })
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
        res
          .pipe(zlib.createUnzip())
          .pipe(tar.extract(`${process.cwd()}/build/deps`))

      } else {
        res.pipe(fs.createWriteStream(output))
      }
      res.on('end', function () { return process.nextTick(() => { cb() }) });
      res.on('error', function (err) { return process.nextTick(() => { cb(err) }) });
    })
    req.end()
  }

  // unsed
  _copyRCExe() {
    fs.stat(`${process.cwd()}/build/rc.exe`, function(err, stat) {
      if (err == null) {
        // just ignore the "file exists case"
      } else {
        let arch = ''
        switch (process.arch) {
          case 'x64': arch = 'x64'; break;
          case 'ia32': arch = 'x84'; break;
          case 'arm': arch = 'arm'; break;
        }

        // look for files in various locations; if then write to local build dir; else break
        fs.readFile(`${process.env['ProgramFiles']}\\Windows Kits\\10\\bin\\${arch}\\rc.exe`, (err_1, file) => {
          if (err_1) {
            fs.readFile(`${process.env['ProgramFiles(x86)']}\\Windows Kits\\10\\bin\\${arch}\\rc.exe`, (err_2, file) => {
              if (err_2) throw err_2
              fs.writeFile(`${process.cwd()}/build/rc.exe`, file, (err) => { if (err) throw err; });
            })
          } else {
            fs.writeFile(`${process.cwd()}/build/rc.exe`, file, (err) => { if (err) throw err; });
          }
        });

        fs.readFile(`${process.env['ProgramFiles']}\\Windows Kits\\10\\bin\\${arch}\\rc.exe`, (err_1, file) => {
          if (err_1) {
            fs.readFile(`${process.env['ProgramFiles(x86)']}\\Windows Kits\\10\\bin\\${arch}\\rc.exe`, (err_2, file) => {
              if (err_2) throw err_2
              fs.writeFile(`${process.cwd()}/build/rcdll.dll`, file, (err) => { if (err) throw err; });
            })
          } else {
            fs.writeFile(`${process.cwd()}/build/rcdll.dll`, file, (err) => { if (err) throw err; });
          }
        });
      }
    });
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
      // fire and forget racy rc.exe copy
      // if (process.platform === 'win32') this._copyRCExe()

      fs.readdir(`${process.cwd()}/build/deps/node-v${process.versions.node}/include/node`, (err, files) => {
        // Ignore the error case here, since we'll then override.
        // If the header dir has at least one file we assume it has them all
        if (files && files.length > 1)
          return process.nextTick(() => {cb(null)})

        urls.forEach((el) => {
          this._download(el.url, `${process.cwd()}/build/deps/node-v${process.versions.node}/${el.name}`, (err) => {
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
