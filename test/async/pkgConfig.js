'use strict'
const pt = require('../../')
const assert = require('assert')
const child_process = require('child_process')

{
  pt.config('test/fixtures/pc/openssl.pc', (err, res) => {
    if (err) {
      assert(!err, 'must not call calback with error')
    }
    try {
      assert.deepEqual(res, {
                                prefix: '/usr',
                                exec_prefix: '/usr',
                                libdir: '/usr/lib',
                                includedir: '/usr/include',
                                name: 'OpenSSL',
                                description: 'Secure Sockets Layer and cryptography libraries and tools',
                                version: '0.9.8zh',
                                requires: null,
                                libs: [ '-L/usr/lib', '-lssl', '-lcrypto', '-lz' ],
                                cflags: [ '-I/usr/include' ]
                              }, 'Parsing .pc yields an object in the correct format')

    } catch (e) {
      if (process.platform !== 'win32') throw e
    }
  })
}

{
  pt.config('openssl', (err, res) => {
    if (err) {
      assert(!err, 'must not call calback with error')
    }
    try {
      delete res.version
      assert.deepEqual(res, {
                                prefix: '/usr',
                                exec_prefix: '/usr',
                                libdir: '/usr/lib',
                                includedir: '/usr/include',
                                name: 'OpenSSL',
                                description: 'Sockets Layer and cryptography libraries and tools',
                                requires: null,
                                libs: [ '-L/usr/lib', '-lssl', '-lcrypto', '-lz' ],
                                cflags: [ '-I/usr/include' ]
                              }, 'Parsing .pc yields an object in the correct format')
    } catch (e) {
      console.warn('This is allowed to fail, since it tests local installatation of OpenSSL')
      console.warn('It failed with:\n')
      console.warn(e)
    }
  })
}
