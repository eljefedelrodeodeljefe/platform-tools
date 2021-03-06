'use strict';
const pt = require('../../')
const fs = require('fs')
const assert = require('assert')
const child_process = require('child_process')
const test = require('tape')

test('multiple_objects_exectuable test', function (t) {
  t.plan(2);
  try {
    fs.mkdirSync('build')
  } catch (e) {
    // ignore all errors
  }

  let out = `${process.cwd()}/build/node`

  const targetRoot = `${process.cwd()}/test/fixtures/sources/smoke/node`

  const sources = [
    `${targetRoot}/src/debug-agent.cc`,
    `${targetRoot}/src/async-wrap.cc`,
    `${targetRoot}/src/env.cc`,
    `${targetRoot}/src/fs_event_wrap.cc`,
    `${targetRoot}/src/cares_wrap.cc`,
    `${targetRoot}/src/handle_wrap.cc`,
    `${targetRoot}/src/js_stream.cc`,
    `${targetRoot}/src/node.cc`,
    `${targetRoot}/src/node_buffer.cc`,
    `${targetRoot}/src/node_constants.cc`,
    `${targetRoot}/src/node_contextify.cc`,
    `${targetRoot}/src/node_file.cc`,
    `${targetRoot}/src/node_http_parser.cc`,
    `${targetRoot}/src/node_javascript.cc`,
    `${targetRoot}/src/node_main.cc`,
    `${targetRoot}/src/node_os.cc`,
    `${targetRoot}/src/node_revert.cc`,
    `${targetRoot}/src/node_util.cc`,
    `${targetRoot}/src/node_v8.cc`,
    `${targetRoot}/src/node_stat_watcher.cc`,
    `${targetRoot}/src/node_watchdog.cc`,
    `${targetRoot}/src/node_zlib.cc`,
    `${targetRoot}/src/node_i18n.cc`,
    `${targetRoot}/src/pipe_wrap.cc`,
    `${targetRoot}/src/signal_wrap.cc`,
    `${targetRoot}/src/spawn_sync.cc`,
    `${targetRoot}/src/string_bytes.cc`,
    `${targetRoot}/src/stream_base.cc`,
    `${targetRoot}/src/stream_wrap.cc`,
    `${targetRoot}/src/tcp_wrap.cc`,
    `${targetRoot}/src/timer_wrap.cc`,
    `${targetRoot}/src/tty_wrap.cc`,
    `${targetRoot}/src/process_wrap.cc`,
    `${targetRoot}/src/udp_wrap.cc`,
    `${targetRoot}/src/uv.cc`,
    `${targetRoot}/src/util.cc`,
    `${targetRoot}/src/string_search.cc`,
    `${targetRoot}/src/node_crypto.cc`,
    `${targetRoot}/src/node_crypto_bio.cc`,
    `${targetRoot}/src/node_crypto_clienthello.cc`,
    `${targetRoot}/src/tls_wrap.cc`
  ]

  if (process.platform === 'darwin' || process.platform === 'sunos')
    sources.push(`${targetRoot}/src/node_dtrace.cc`)

  const options = {
    output: `${out}.o`,
    include_headers: [
      `${targetRoot}/src`,
      `${targetRoot}/tools/msvs/genfiles`,
      `${targetRoot}/deps/uv/src/ares`,
      `${targetRoot}/out/Release/obj/gen`,
      `${targetRoot}/deps/v8`,
      `${targetRoot}/deps/cares/include`,
      `${targetRoot}/deps/v8/include`,
      `${targetRoot}/deps/openssl/openssl/include`,
      `${targetRoot}/deps/zlib`,
      `${targetRoot}/deps/http_parser`,
      `${targetRoot}/deps/uv/include`
    ]
  }

  if (process.platform === 'win32') {
    options.include_headers.push(`${targetRoot}/debug/obj/global_intermediate`)

    options.compiler_flags = [
      '/ISRC',
      '/W3',
      '/WX-',
      '/Od',
      '/Oy-',
      '/GF',
      '/Gm-',
      '/RTC1',
      '/MTd',
      '/GS',
      '/fp:precise',
      '/Zc:wchar_t',
      '/Zc:forScope',
      '/Zc:inline',
      '/Gd',
      '/TP',
      '/wd4351',
      '/wd4355',
      '/wd4800',
      '/analyze-'
    ]
    options.defines = [
      'WIN32',
      '_CRT_SECURE_NO_DEPRECATE',
      '_CRT_NONSTDC_NO_DEPRECATE',
      '_HAS_EXCEPTIONS=0',
      'BUILDING_V8_SHARED=1',
      'BUILDING_UV_SHARED=1',
      '\"NODE_ARCH=\\\"ia32\\\"\"',
      'NODE_WANT_INTERNALS=1',
      'V8_DEPRECATION_WARNINGS=1',
      'HAVE_OPENSSL=1',
      // 'HAVE_ETW=0',
      // 'HAVE_PERFCTR=0',
      // 'HAVE_DTRACE=0',
      'FD_SETSIZE=1024',
      '\"NODE_PLATFORM=\\\"win32\\\"\"',
      '_UNICODE=1',
      'HTTP_PARSER_STRICT=0',
      'DEBUG',
      '_DEBUG'
    ]
  } else if (process.platform === 'darwin') {
    options.compiler_flags = [
      `-Os`,
      `-gdwarf-2`,
      `-Wall`,
      `-Wendif-labels`,
      `-W`,
      `-Wno-unused-parameter`,
      `-std=gnu++0x`,
      `-fno-rtti`,
      `-fno-exceptions`,
      `-fno-threadsafe-statics`,
      `-fno-strict-aliasing`
    ],
    options.defines = [
      '_DARWIN_USE_64_BIT_INODE=1',
      'NODE_ARCH="x64"',
      'NODE_WANT_INTERNALS=1',
      'V8_DEPRECATION_WARNINGS=1',
      'HAVE_OPENSSL=1',
      'HAVE_DTRACE=1',
      '__POSIX__',
      'NODE_PLATFORM="darwin"',
      'HTTP_PARSER_STRICT=0',
      '_LARGEFILE_SOURCE',
      '_FILE_OFFSET_BITS=64'
    ]

    pt.compilerUtil[process.platform].compiler.arch(process.arch)
      .forEach(el => options.compiler_flags.push(el))
    pt.compilerUtil[process.platform].osx_min_version('10.5')
      .forEach(el => options.compiler_flags.push(el))

  } else if (process.platform === 'linux') {
    options.compiler_flags = [
      '-pthread',
      '-Wall',
      '-Wextra',
      '-Wno-unused-parameter',
      '-O3',
      '-ffunction-sections',
      '-fdata-sections',
      '-fno-omit-frame-pointer',
      '-fno-rtti',
      '-fno-exceptions',
      '-std=gnu++0x',
    ],
    options.defines = [
      'NODE_ARCH="x64"',
      'NODE_PLATFORM="linux"',
      'NODE_WANT_INTERNALS=1',
      'V8_DEPRECATION_WARNINGS=1',
      'HAVE_OPENSSL=1',
      '__POSIX__',
      'HTTP_PARSER_STRICT=0',
      '_LARGEFILE_SOURCE',
      '_FILE_OFFSET_BITS=64',
      '_POSIX_C_SOURCE=200112'
    ]

    pt.compilerUtil[process.platform].compiler.arch(process.arch)
      .forEach(el => options.compiler_flags.push(el))
  }

  pt.compile(sources, options, (err, files) => {
    if (err)
      t.fail(err, 'Error must not be called')

    const options = {
      output: out,
      linker_flags: []
    }

    const archives = [
      `${process.cwd()}/test/fixtures/sources/smoke/node/out/Release/libcares.a`,
      `${process.cwd()}/test/fixtures/sources/smoke/node/out/Release/libv8_libplatform.a`,
      `${process.cwd()}/test/fixtures/sources/smoke/node/out/Release/libopenssl.a`,
      `${process.cwd()}/test/fixtures/sources/smoke/node/out/Release/libzlib.a`,
      `${process.cwd()}/test/fixtures/sources/smoke/node/out/Release/libhttp_parser.a`,
      `${process.cwd()}/test/fixtures/sources/smoke/node/out/Release/libuv.a`,
      `${process.cwd()}/test/fixtures/sources/smoke/node/out/Release/libv8_base.a`,
      `${process.cwd()}/test/fixtures/sources/smoke/node/out/Release/libv8_libbase.a`,
      `${process.cwd()}/test/fixtures/sources/smoke/node/out/Release/libv8_snapshot.a`,
    ]

    if (process.platform === 'win32') {
      [
        '/NXCOMPAT',
        '/DYNAMICBASE',
        '/MAPINFO:EXPORTS',
        'winmm.lib',
        'gdi32.lib',
        'user32.lib',
        'advapi32.lib',
        'iphlpapi.lib',
        'psapi.lib',
        'shell32.lib',
        'userenv.lib',
        'ws2_32.lib',
        '/MACHINE:X64',
        // '/SAFESEH',
        '/INCREMENTAL:NO',
        '/MAP',
        '/ERRORREPORT:queue',
        '/TLBID:1',
        '/debug',
        '/tlbid:1',
        '/MACHINE:X64',
        `/implib:\"${process.cwd()}/build\\node.lib\"`,
        `\"${targetRoot}\\debug\\lib\\cares.lib\"`,
        `\"${targetRoot}\\build\\debug\\lib\\v8_libplatform.lib\"`,
        `\"${targetRoot}\\debug\\lib\\openssl.lib\"`,
        `\"${targetRoot}\\debug\\lib\\zlib.lib\"`,
        `\"${targetRoot}\\debug\\lib\\http_parser.lib\"`,
        `\"${targetRoot}\\debug\\lib\\libuv.lib\"`,
        `\"${targetRoot}\\build\\debug\\lib\\v8_base_0.lib\"`,
        `\"${targetRoot}\\build\\debug\\lib\\v8_base_1.lib\"`,
        `\"${targetRoot}\\build\\debug\\lib\\v8_base_2.lib\"`,
        `\"${targetRoot}\\build\\debug\\lib\\v8_base_3.lib\"`,
        `\"${targetRoot}\\build\\debug\\lib\\v8_libbase.lib\"`,
        `\"${targetRoot}\\build\\debug\\lib\\v8_snapshot.lib\"`
      ].forEach(flag => options.linker_flags.push(flag))
    } else if (process.platform === 'darwin') {
       [
        `-Wl,-force_load,${targetRoot}/out/Release/libopenssl.a`,
        `-Wl,-force_load,${targetRoot}/out/Release/libv8_base.a`,
        '-Wl,-search_paths_first',
        '-mmacosx-version-min=10.5',
        '-arch', 'x86_64',
        '-framework',
        'CoreFoundation',
        '-lm'
      ].forEach(flag => options.linker_flags.push(flag))

      options.tail_flags = archives
    } else if (process.platform === 'linux') {
      [
        '-Wl,--whole-archive',
        `${targetRoot}/out/Release/libopenssl.a`,
        '-Wl,--no-whole-archive',
        '-Wl,--whole-archive',
        `${targetRoot}/out/Release/obj.target/deps/v8/tools/gyp/libv8_base.a`,
        '-Wl,--no-whole-archive',
        '-Wl,-z,noexecstack',
        '-pthread',
        '-rdynamic',
        '-ldl',
        '-lrt',
        '-lm'
      ].forEach(flag => options.linker_flags.push(flag))

      pt.compilerUtil[process.platform].linker.arch(process.arch)
        .forEach(el => options.linker_flags.push(el))

      options.tail_flags = archives
    }

    pt.link(files, options, (err, file) => {
      if (err) return t.fail(err, 'Error must not be called')

      const e = child_process.spawn(`${process.platform === 'win32' ? '': './'}node`, ['-v'], {cwd: 'build', shell: true});
      e.stdout.on('data', (data) => {
        t.ok(data.toString().indexOf('v4.4.5') === 0, 'Match version 4.4.5')
      });
      e.on('error', (err) => {
        if (err) return t.fail(err, 'Error must not be called')
      });
      e.on('close', (code) => {
        t.ok(code === 0, 'Compiled binary node must exit with code 0')
      });
    })
  })
})
