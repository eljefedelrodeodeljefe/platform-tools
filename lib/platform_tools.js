'use strict'
const spawn = require('child_process').spawn
const EventEmitter = require('events')
const path = require('path')
const fs = require('fs')
const debuglog = require('util').debuglog('platform_tools')

const addon = require('./node_platform')
const pkgConfig = require('./pkg_config')
const pkgConfigSearchPaths = pkgConfig.pkgConfigSearchPaths
const flags = require('./flags')

const DEBUG = process.env.NODE_DEBUG === 'platform_tools' ? true : false

// default, can be extended only in the class
const compilers = {
  win32:   '"%programfiles(x86)%\\Microsoft Visual Studio 14.0\\VC\\bin\\amd64\\cl.exe"',
  freeBSD: 'clang',
  darwin:  'clang',
  linux:   'gcc',
  sunos:   'gcc' // REVIEW
}

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
   * Compiles a given source code file or array of files to the platforms object
   * code.
   * @param  {String|String[]}   source Path to source
   * @param  {Function} cb     Optional callback for completion
   * @return {Callback}
   */
  compile(sources, opts, cb) {
    const options = Object.assign({}, opts)
    const sync = shouldBeSyncAPI(options, cb)

    if (typeof sources === 'string' || sources instanceof String) {
      return this._compile(sources, opts, cb)

    } else if (Array.isArray(sources) && sources.length > 0) {
      let opts = options
      let count = sources.length
      const files = []
      options.output = undefined

      sources.forEach((source) => {
        this._compile(source, opts, (err, file) => {
          --count
          if (err) return process.nextTick(() => { cb(err) })
          files.push(file)

          if (count === 0)
            process.nextTick(() => { return cb(null, files) })
        })
      })

    } else {
      const err = new Error('First argument must be a string or array of strings\
                            \r to source files.')
      if (sync) throw err
      else return cb(err)
    }
  }

  _compile(source, opts, cb) {
    // forward declarations and input handling
    const silent = this.options.silent
    const options = Object.assign({}, opts)

    const sync = shouldBeSyncAPI(options, cb)
    if (sync !== true) cb = sync

    if (!source)
      throw new Error('Function expects a source file as first argument')

    // parsing inputs
    const ext = path.extname(source)
    if (!(ext === '.c' || ext === '.cc' || ext === '.cpp'))
      throw new Error('Source file must have .c, .cc or .cpp extension')

    // sets compiler to cxx for subsequent calls to .link and others
    if (ext === '.cc' || ext === '.cpp') this.compiler = this.cxx

    const args = []
    if (process.platform === 'win32') args.push('/nologo')
    // add seach paths for the compiler
    if (opts.include_headers) {
      options.include_headers.forEach((el) => {
        if (process.platform === 'win32')
          args.push(`/I"${el}"`)
        else
          args.push(`-I${el}`)
      })
    }
    // windows quirk: VS hides away standard include paths. For that reason we
    // need to push those manually
    if (process.platform === 'win32')
      flags.windows.vsStdIncludePaths.forEach((el) => { args.push(`/I"${el}"`) })

    // adds unrestricted compiler flags, such as optimizations
    if (opts.compiler_flags) {
      options.compiler_flags.forEach((el) => {
        if (process.platform === 'win32')
          args.push(el) // not implemented
        else
          args.push(`${el}`)
      })
    }

    args.push(process.platform === 'win32' ? '/c' : '-c') // compile, only
    // specify minimal output
    const filename = `${process.cwd()}/build/${path.parse(source).name}`

    if (opts.output) {
      if (process.platform === 'win32') {
        args.push(`/Fo${options.output}`)
      } else {
        args.push('-o')
        args.push(`${options.output}`)
      }
    } else {
      if (process.platform === 'win32') {
        args.push(`/Fo${filename}`)
      } else {
        args.push('-o')
        args.push(`${filename}.o`)
      }
    }
    // necessary input file
    args.push(source)

    debuglog(this.compiler, args)
    // actual entry point
    const runner = spawn(this.compiler, args, {shell:true});
    runner.stdout.on('data', (data) => {
      if (!silent)
        process.stdout.write(data)
    });
    runner.on('error', (err) => { return process.nextTick(() => { cb(err) }) })
    runner.on('close', (code) => {
      if (sync === true)
        return `${filename}.o`
      else
        return process.nextTick(() => { cb(null, `${filename}.o`) })
    });
  }

  /**
   * Links mutiple objects and libraries to a binary
   * @param  {String}   object  Path for name of object code file
   * @param  {Object}   options Options object
   * @param  {Function} cb      Optional callback
   * @return {Callback}
   */
  link(objectFile, opts, cb) {
    const silent = this.options.silent
    const options = Object.assign({}, opts)

    const sync = shouldBeSyncAPI(options, cb)
    if (sync !== true) cb = sync

    const args = []
    // necessary object file
    args.push(objectFile)
    // specify minimal output
    const filename = `${path.parse(objectFile).dir}${path.sep}${path.parse(objectFile).name}`
    // on win32 everything herafter is a linker flag
    if (process.platform === 'win32')
      args.push('/link')
    // library lookup paths from options object
    if (options && options.include_libraries) {
      options.include_libraries.forEach((el) => {
        if (process.platform === 'win32')
          args.push("/LIBPATH:" + '\"' + el + '\"')
        else
          args.push(`-L${el}`)
      })
    }
    // additional linker flags from options object
    if (options && options.linker_flags) {
      options.linker_flags.forEach((el) => {
        if (process.platform === 'win32')
          args.push(el)
        else
          args.push(`${el}`)
      })
    }

    if (process.platform === 'win32')
      flags.windows.vsStdLibPaths.forEach((el) => { args.push("/LIBPATH:" + '\"' + el + '\"') })
    // output name. NOTE: on windows the output is a linker flag and needs to
    // succeed it. The other platforms do not have a dedicated linker flag,
    // though in their cases one could use the `ld` binary. Here we are just
    // aware of the fact and let the compiler binary figure that out
    if (options && options.output) {
      if (process.platform === 'win32') {
        args.push(`/OUT:${filename}${opts.isWinAddon ? '.node' : '.exe'}`)
      } else {
        args.push('-o')
        args.push(`${options.output}`)
      }
    } else {
      if (process.platform === 'win32') {
        args.push(`/OUT:${filename}${opts.isWinAddon ? '.node' : '.exe'}`)
      } else {
        args.push('-o')
        args.push(`${filename}`)
      }
    }
    //
    let cwd = undefined
    if (opts.isWinAddon) cwd = `${process.cwd()}/build/`

    debuglog(this.compiler, args)
    // actual entry point: shelling out to the compiler
    const runner = spawn(this.compiler, args, {shell:true, cwd: cwd});
    runner.stdout.on('data', (data) => {
      if (!silent)
        process.stdout.write(data)
    });
    runner.on('error', (err) => { return process.nextTick(() => { cb(err) }) })
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
  config(lib, cb) {
    return pkgConfig.config(lib, cb)
  }
  /**
   * This method compiles node native addons end-to-end. Motivation behind this
   * high level approach is past struggles with this technique, and especially
   * different behaviors across platforms. Eventually this method should take
   * care of all of the above. If the user has special cases, it is still
   * possible to pass instructions via the options object and (item for roadmap)
   * override certain common variables forcefully.
   *
   * @param  {String}   addonSrcFile Path to source file
   * @param  {Object}   options      Options object
   * @param  {Function} cb
   * @return {Callback}                returns optional callback
   */
  compileAddon(addonSrcFile, options, cb) {
    // checks for existing deps. If nothign downlaoded, this will be slow
    addon.getDeps((err) => {
      if (err) return cb(err)

      let opt = {
        output: `${process.cwd()}/build/${options.output}.o`,
        include_headers: [
          `${process.cwd()}/build/deps/node/${process.versions.node}/include/node`,
          `${process.cwd()}/node_modules/nan`
        ],
        compiler_flags: []
      }
      // the following bumps flags and deps on a per platform basis. No magic.
      if (process.platform === 'darwin') {
        opt.compiler_flags = flags.addon.darwin.compiler_flags
      } else if (process.platform === 'linux') {
        opt.compiler_flags = flags.addon.linux.compiler_flags
        opt.compiler_flags.push(`-Wl,-soname=${options.output}.node`)
      } else if (process.platform === 'win32') {
        opt.compiler_flags = flags.addon.windows.compiler_flags
      }

      this.compile(addonSrcFile, opt, (err) => {
        if (err) return cb(err.toString())
        // then link the object file (here an easy case)
        let opt = {
          output: `${process.cwd()}/build/${options.output}.node`,
          include_libraries: [
            `${process.cwd()}/build/Release`
          ],
          linker_flags: []
        }

        if (process.platform === 'darwin') {
          opt.linker_flags = flags.addon.darwin.linker_flags
        } else if (process.platform === 'linux') {
          opt.linker_flags = flags.addon.linux.linker_flags
            // REVIEW: the above won't compile. Have considered trailing
            // flag mechanism, but works without. Review this asap
        } else if (process.platform === 'win32') {
          opt.linker_flags = flags.addon.windows.linker_flags
        }

        // NOTE: quirk b/c unix executables don't have ending, win have, exlude
        // it manually when building addons
        if (process.platform === 'win32') opt.isWinAddon = true

        this.link(`${process.cwd()}/build/${options.output}.o`, opt, (err) => {
          if (err) return cb(err)

          return process.nextTick(() => { cb(null) })
        })
      })
    })
  }
}


module.exports = new PlatformTools()
module.exports.PlatformTools = PlatformTools
