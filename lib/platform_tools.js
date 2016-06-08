'use strict'
const spawn = require('child_process').spawn
const EventEmitter = require('events')
const readline = require('readline')
const path = require('path')
const fs = require('fs')
const debuglog = require('util').debuglog('platform_tools')
const addon = require('./node_platform')

const DEBUG = process.env.NODE_DEBUG === 'platform_tools' ? true : false

// default, can be extended only in the class
const compilers = {
  win32:   '"%programfiles(x86)%\\Microsoft Visual Studio 14.0\\VC\\bin\\cl.exe"',
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

function parsePcLine(line) {
  // brute force REVIEW
  // Rationale:
  //  * match line if it has ': ' or '=' delimiter via split
  //  * both cases get first result as key for the result
  //  * Libs, Cflags, Requires (all colon-case) are special cases, since they
  //    will have multiple values that are space delimited
  //    * those will be split up into an array and checked against, if the array
  //      has empty elements and hence those exluded if so
  //
  const hasColon = line.split(': ')
  const hasEqual= line.split('=')

  let key
  let values
  if (hasColon.length > 1) {
    key = hasColon[0]
    values = hasColon[1]
  } else if (hasEqual.length > 1) {
    key = hasEqual[0]
    values = hasEqual[1]
  }

  if (key === 'Libs' || key === 'Cflags' || key === 'Requires') {
    values = values.split(' ')
    values = values.filter((val) => {
      if (!(val === '')) return val
    })
  }

  return {
    key: key,
    values: values
  }
}

function resolveVariables(result) {
  // brute force REVIEW
  // Rationale:
  //  * check if current result is in array or string format
  //  * for both take the (element-level) string and check if it has
  //    a variable include (checks only for one REVIEW)
  //  * string replace include with the information as key of the result object,
  //    which assumes that the object has a declartion of that variable already
  //    * not recursive
  //
  const re = /(\$\{([^)]+)\})/ // matches ${} brackets and its inside
  for (var key in result) {
    if (typeof result[key] === 'string') {
      let m
      if ((m = re.exec(result[key])) !== null) {
        if (m.index === re.lastIndex)
            re.lastIndex++
        if (m[0])
          result[key] = result[key].replace(m[0], result[m[2]])
      }
    } else if (result[key] && result[key].constructor === Array) {
      let res = []
      result[key].forEach((el) => {
        let m
        // just regular regex stuff here, REVIEW: verbose
        if ((m = re.exec(el)) !== null) {
          if (m.index === re.lastIndex)
              re.lastIndex++
          if (m[0])
            res.push(el.replace(m[0], result[m[2]])) // insert value with key
          else
           res.push(el) // fall through if regex actually hasn't matched a string
        } else {
          res.push(el) // fall through if regex does not variable include
        }
      })
      result[key] = res
    }
  }
  return result
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
    if (process.platform === 'win32') args.push('/nologo')
    // add seach paths for the compiler
    if (options.include_headers) {
      options.include_headers.forEach((el) => {
        if (process.platform === 'win32')
          args.push(`/I${el}`)
        else
          args.push(`-I${el}`)
      })
    }
    // adds unrestricted compiler flags, such as optimizations
    if (options.compiler_flags) {
      options.compiler_flags.forEach((el) => {
        if (process.platform === 'win32')
          args.push() // not implemented
        else
          args.push(`${el}`)
      })
    }

    args.push(process.platform === 'win32' ? '/c' : '-c') // compile, only
    // specify minimal output
    const filename = `${path.parse(source).dir}${path.sep}${path.parse(source).name}`

    if (options.output) {
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
        args.push(`${filename}`)
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
    const silent = this.options.silent

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
          args.push(`/LIBPATH:${el}`)
        else
          args.push(`-L${el}`)
      })
    }
    // additional linker flags from options object
    if (options && options.linker_flags) {
      options.linker_flags.forEach((el) => {
        if (process.platform === 'win32')
          args.push() // not implemented
        else
          args.push(`${el}`)
      })
    }
    // output name. NOTE: on windows the output is a linker flag and needs to
    // succeed it. The other platforms do not have a dedicated linker flag,
    // though in their cases one could use the `ld` binary. Here we are just
    // aware of the fact and let the compiler binary figure that out
    if (options && options.output) {
      if (process.platform === 'win32') {
        args.push(`/OUT:${options.output}.exe`)
      } else {
        args.push('-o')
        args.push(`${options.output}`)
      }
    } else {
      if (process.platform === 'win32') {
        args.push(`/OUT:${filename}.exe`)
      } else {
        args.push('-o')
        args.push(`${filename}`)
      }
    }

    debuglog(this.compiler, args)
    // actual entry point: shelling out to the compiler
    const runner = spawn(this.compiler, args, {shell:true});
    runner.stdout.on('data', (data) => {
      if (!silent)
        process.stdout.write(data)
    });
    runner.stderr.on('data', (data) => {
      process.stderr.write(data)
      if (sync === true)
        return data
      else
        return process.nextTick(() => { cb(data) })
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
  config(lib, cb) {
    const parseTargets = []
    // template for pkg-config-like output
    let result = {
      prefix:      null,
      exec_prefix: null,
      libdir:      null,
      includedir:  null,
      name:        null,
      description: null,
      version:     null,
      requires:    null, // array
      libs:        null, // array
      cflags:      null  // array
    }

    let searchPaths = pkgConfigSearchPaths
    // if user specifies a path, include into the search paths
    // will be git first in case it is a file. If not, falls back to defaults
    if (lib.indexOf(path.sep) >= 0) {
      const file = path.parse(lib)
      if (file.ext !== '.pc')
        return process.nextTick(() => { cb(new InputError('File must have .pc extension.'))})
      searchPaths.unshift(file.dir)
      lib = file.name
    }

    searchPaths.forEach((pathToLib) => {
      let target = `${pathToLib}${path.sep}${lib}.pc`
      let res
      try {
        res = fs.statSync(target)
      } catch(e) {
        // ignore ENOENTs; check will be done below
      }
      if (res && res.isFile()) parseTargets.push(target)
    })
    // bail when no .pc file was found REVIEW
    if (parseTargets.length === 0)
      return process.nextTick(() => { cb(null, null) })

    if (parseTargets.length > 1)
      debuglog('Found more than one .pc file. Only using first one found')

    const runner = readline.createInterface({ input: fs.createReadStream(parseTargets[0]) })
    runner.on('line', (line) => {
      const res = parsePcLine(line)
      if (res && res.key) {
        result[res.key.toLowerCase()] = res.values
      }
    })
    runner.on('error', (err) => { return process.nextTick(() => { cb(err) }) })
    runner.on('close', () => {
      result = resolveVariables(result)
      return process.nextTick(() => { cb(null, result) })
    })
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
        opt.compiler_flags = [ '-Os', /*'-gdwarf-2' */,'-mmacosx-version-min=10.7',
          '-Wall', '-Wall','-Wendif-labels','-W','-Wno-unused-parameter',
          '-std=gnu++0x','-fno-rtti','-fno-exceptions', '-fno-threadsafe-statics',
          '-fno-strict-aliasing' ]
      } else if (process.platform === 'linux') {
        opt.compiler_flags = [ '-fPIC', '-pthread', '-Wall', '-Wextra',
          '-Wno-unused-parameter','-m64', '-O3','-ffunction-sections','-fdata-sections',
          '-fno-omit-frame-pointer', '-fno-rtti','-fno-exceptions','-std=gnu++0x' ]
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
          opt.linker_flags = [ '-bundle', '-undefined', 'dynamic_lookup',
            '-Wl,-no_pie', '-Wl,-search_paths_first', '-mmacosx-version-min=10.7' ]
        } else if (process.platform === 'linux') {
          opt.linker_flags = [ '-shared', '-pthread', '-rdynamic -m64',
            '-Wl,-soname=addon.node', '-Wl,--start-group',
            `${process.cwd}/build/${options.output}.o`, '-Wl,--end-group' ]
        }

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
