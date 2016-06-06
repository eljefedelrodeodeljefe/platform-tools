'use strict'
const EventEmitter = require('events')
const spawn = require('child_process').spawn
const path = require('path')

// default, can be extended only in the class
const compilers = {
  win32:   '"%programfiles(x86)%\\Microsoft Visual Studio 14.0\\VC\\bin\cl.exe"',
  freeBSD: 'clang',
  darwin:  'clang',
  linux:   'gcc',
  sunos:   'gcc' // REVIEW
}

const pkgConfigSearchPaths = [
  '/usr/lib/pkgconfig',
  '/usr/share/pkgconfig',
  '/usr/local/lib/pkgconfig',
  '/usr/local/share/pkgconfig'
]

function shouldBeSyncAPI(a, b) {
  if (a && b) return b
  if (!a && !b) return true
  if (!b && (a !== null && typeof a === 'object')) return true
  if (!b && typeof a === 'function') return a
}

/**
 * @class
 */
class PlatformTools extends EventEmitter {
  constructor(options) {
    super()
    this.options = Object.assign({}, options)

    this.pkgConfigSearchPaths = pkgConfigSearchPaths
    this.cc = compilers[process.platform]
    // branch for g++ on linux
    if (process.platform === 'linux') this.cxx = 'g++'
    else if (process.platform === 'darwin' || process.platform === 'freeBSD')
      this.cxx = 'clang++'
    else this.cxx = compilers[process.platform]
    // defaul to cc but keep reference here, for passing state, say, to .link
    this.compiler = this.cc

    this.options.silent = this.options.silent || false
  }

  /**
   * Compiles a given source code file to the platforms object code
   * @param  {String}   source Path to source
   * @param  {Function} cb     Optional callback for completion
   * @return {Callback}
   */
  compile(source, options, cb) {
    // forward declarations and input handling
    const silent = this.options.silent

    const sync = shouldBeSyncAPI(options, cb)
    if (sync !== true) cb = sync

    if (!source)
      throw new InputError('Function expects a source file as first argument')

    // parsing inputs
    const ext = path.extname(source)
    if (!(ext === '.c' || ext === '.cc' || ext === '.cpp'))
      throw new InputError('Source file must have .c, .cc or .cpp extension')

    // sets compiler to cxx for subsequent calls to .link and others
    if (ext === '.cc' || ext === '.cpp') this.compiler = this.cxx

    const args = []
    args.push('-c') // compile, only
    // necessary input file
    args.push(source)
    // specify minimal outpt
    args.push('-o') // push -o and friends for consistency
    if (options.output) args.push(`${options.output}`)
    else args.push(`${path.parse(source).dir}${path.sep}${path.parse(source).name}`)

    // actual entry point
    const runner = spawn(this.compiler, args);
    runner.stdout.on('data', (data) => {
      if (silent) return
      process.stdout.write(data)
    });
    runner.stderr.on('data', (data) => {
      process.stderr.write(data)
      if (sync === true)
        return data
      else
        return process.nextTick(() => { cb(data) })
    });
    runner.on('close', (code) => {
      if (sync === true)
        return code
      else
        return process.nextTick(() => { cb(null, code) })
    });
  }

  /**
   * Links mutiple objects and libraries to a binary
   * @param  {String}   object  Path for name of object code file
   * @param  {Object}   options Options object
   * @param  {Function} cb      Optional callback
   * @return {Callback}
   */
  link(objectFile, options, cb) {
    const sync = shouldBeSyncAPI(options, cb)
    if (sync !== true) cb = sync

    const args = []
    // necessary object file
    args.push(objectFile)
    // specify minimal outpt
    args.push('-o') // push -o in order not to compile into cwd
    if (options.output) args.push(`${options.output}`)
    else args.push(`${path.parse(objectFile).dir}${path.sep}${path.parse(objectFile).name}`)

    // actual entry point
    const runner = spawn(this.compiler, args);
    runner.stdout.on('data', (data) => {
      if (silent) return
      process.stdout.write(data)
    });
    runner.stderr.on('data', (data) => {
      process.stderr.write(data)
      if (sync === true)
        return data
      else
        return process.nextTick(() => { cb(data) })
    });
    runner.on('close', (code) => {
      if (sync === true)
        return code
      else
        return process.nextTick(() => { cb(null, code) })
    });
  }

  /**
   * Returns the necessary libraries to link against, similarly to pkg-config(1).
   * @param  {String}   lib Library to search dependencies against
   * @param  {Function} cb  Optional Callback upon completion
   * @return {Callback}
   */
  // internal doc taken from man plg-config:
  //
  //  The pkg-config program is  used  to  retrieve  information  about  installed
  // libraries  in  the system.  It is typically used to compile and link against
  // one or more libraries.  Here is a typical usage scenario in a Makefile:
  //
  // program: program.c
  //     cc program.c $(pkg-config --cflags --libs gnomeui)
  //
  // pkg-config retrieves information about packages from special metadata files.
  // These  files  are named after the package, and has a .pc extension.  On most
  // systems,  pkg-config  looks  in  /usr/lib/pkgconfig,   /usr/share/pkgconfig,
  // /usr/local/lib/pkgconfig and /usr/local/share/pkgconfig for these files.  It
  // will additionally look in the colon-separated (on  Windows,  semicolon-sepa-
  // rated)  list  of  directories  specified  by the PKG_CONFIG_PATH environment
  // variable.
  //
  // The package name specified on the pkg-config command line is defined  to  be
  // the  name  of  the  metadata file, minus the .pc extension. If a library can
  // install multiple versions simultaneously, it must give each version its  own
  // name  (for example, GTK 1.2 might have the package name "gtk+" while GTK 2.0
  // has "gtk+-2.0").
  //
  // In addition to specifying a package name on the command line, the full  path
  // to  a  given  .pc  file may be given instead. This allows a user to directly
  // query a particular .pc file.
  //
  pkgConfig(lib, cb) {

  }
}

module.exports = new PlatformTools()
module.exports.PlatformTools = PlatformTools
