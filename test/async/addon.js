'use strict';
const pt = require('../../')
const assert = require('assert')
const child_process = require('child_process')
const test = require('tape')

test('addon test', function (t) {
  t.plan(2);
  // the below emualates something very similar to $ on OS X:
  // node-gyp clean && mkdir build && cd build && mkdir -p Release/obj.target/addon/ && c++ -I/Users/jefe/repos/platform-tools/build/deps/node/6.2.0/include/node -I../node_modules/nan  -Os -gdwarf-2 -mmacosx-version-min=10.7 -Wall -Wendif-labels -W -Wno-unused-parameter -std=gnu++0x -fno-rtti -fno-exceptions -fno-threadsafe-statics -fno-strict-aliasing -c -o Release/obj.target/addon/addon.o ../addon.cc
  // c++ -bundle -undefined dynamic_lookup -Wl,-no_pie -Wl,-search_paths_first -mmacosx-version-min=10.7 -L./Release  -o Release/addon.node Release/obj.target/addon/addon.o
  //
  let out = `${process.cwd()}/test/fixtures/sources/addons/addon.cc`
  pt.compileAddon(`${out}`, {output: `addon`}, (err) => {
    if (err) {
      return t.fail(err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/addon')

    t.equal(addon.add(3, 5), 8)
    t.equal(addon.add(10, 5), 15)
  })
})

test('addon_1 test', function (t) {
  t.plan(1)

  let out = `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/1_hello_world/nan/hello.cc`
  pt.compileAddon(`${out}`, {output: `addon_1`}, (err) => {
    if (err) {
      return t.fail(err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/node-addon-examples/1_hello_world/nan/hello.js')

    t.equal(addon(), 'world')
  })
})

test('addon_2 test', function (t) {
  t.plan(1)
  let out = `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/2_function_arguments/nan/addon_2.cc`
  pt.compileAddon(`${out}`, {output: `addon_2`}, (err) => {
    if (err) {
      return t.fail(err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/node-addon-examples/2_function_arguments/nan/addon.js')

    t.equal(addon(3,5), 8)
  })
})

test('addon_3 test', function (t) {
  t.plan(1)
  let out = `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/3_callbacks/nan/addon_3.cc`
  pt.compileAddon(`${out}`, {output: `addon_3`}, (err) => {
    if (err) {
      return t.fail(err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/node-addon-examples/3_callbacks/nan/addon.js')

    let count = 2
    addon(() => {
      count--
      t.equal(count, 0)
    })
    count--
  })
})

test('addon_4 test', function (t) {
  t.plan(1)
  let out = `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/4_object_factory/nan/addon_4.cc`
  pt.compileAddon(`${out}`, {output: `addon_4`}, (err) => {
    if (err) {
      return t.fail(err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/node-addon-examples/4_object_factory/nan/addon.js')

    t.equal(addon(), 'hello world')
  })
})

test('addon_5 test', function (t) {
  t.plan(1)
  let out = `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/5_function_factory/nan/addon_5.cc`
  pt.compileAddon(`${out}`, {output: `addon_5`}, (err) => {
    if (err) {
      return t.fail(err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/node-addon-examples/5_function_factory/nan/addon.js')
    const fn = addon()

    t.equal(fn(), 'hello world')
  })
})

test('addon_6 test', function (t) {
  t.plan(7)
  let out = [
    `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/6_object_wrap/nan/addon_6.cc`,
    `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/6_object_wrap/nan/myobject_6.cc`
  ]
  pt.compileAddon(out, {output: `addon_6`}, (err) => {
    if (err) {
      return t.fail(err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/node-addon-examples/6_object_wrap/nan/addon.js')

    let obj = new addon.MyObject(10);
    t.equal(obj.plusOne(), 11)
    t.equal(obj.plusOne(), 12)
    t.equal(obj.plusOne(), 13)

    t.equal(obj.multiply().value(), 13)
    t.equal(obj.multiply(10).value(), 130)

    let newobj = obj.multiply(-1);
    t.equal(newobj.value(), -13)
    t.equal(obj === newobj, false)
  })
})

test('addon_7 test', function (t) {
  t.plan(6)
  let out = [
    `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/7_factory_wrap/nan/addon_7.cc`,
    `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/7_factory_wrap/nan/myobject_7.cc`
  ]
  pt.compileAddon(out, {output: `addon_7`}, (err) => {
    if (err) {
      return t.fail(err, 'must not call error here')
    }

    let createObject = require('../fixtures/sources/addons/node-addon-examples/7_factory_wrap/nan/addon.js')

    var obj = createObject(10);
    t.equal(obj.plusOne(), 11);
    t.equal(obj.plusOne(), 12);
    t.equal(obj.plusOne(), 13);

    var obj2 = createObject(20);
    t.equal(obj2.plusOne(), 21);
    t.equal(obj2.plusOne(), 22);
    t.equal(obj2.plusOne(), 23);
  })
})

test('addon_8 test', function (t) {
  t.plan(1)
  let out = [
    `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/8_passing_wrapped/nan/addon_8.cc`,
    `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/8_passing_wrapped/nan/myobject_8.cc`
  ]
  pt.compileAddon(out, {output: `addon_8`}, (err) => {
    if (err) {
      return t.fail(err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/node-addon-examples/8_passing_wrapped/nan/addon.js')

    var obj1 = addon.createObject(10);
    var obj2 = addon.createObject(20);
    var result = addon.add(obj1, obj2);

    t.equal(result, 30);

  })
})
