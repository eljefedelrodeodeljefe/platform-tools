'use strict';
const pt = require('../../')
const assert = require('assert')
const child_process = require('child_process')

{
  // the below emualates something very similar to $ on OS X:
  // node-gyp clean && mkdir build && cd build && mkdir -p Release/obj.target/addon/ && c++ -I/Users/jefe/repos/platform-tools/build/deps/node/6.2.0/include/node -I../node_modules/nan  -Os -gdwarf-2 -mmacosx-version-min=10.7 -Wall -Wendif-labels -W -Wno-unused-parameter -std=gnu++0x -fno-rtti -fno-exceptions -fno-threadsafe-statics -fno-strict-aliasing -c -o Release/obj.target/addon/addon.o ../addon.cc
  // c++ -bundle -undefined dynamic_lookup -Wl,-no_pie -Wl,-search_paths_first -mmacosx-version-min=10.7 -L./Release  -o Release/addon.node Release/obj.target/addon/addon.o
  //
  let out = `${process.cwd()}/test/fixtures/sources/addons/addon.cc`
  pt.compileAddon(`${out}`, {output: `addon`}, (err) => {
    if (err) {
      console.log(err);
      assert(!err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/addon')

    assert.equal(addon.add(3, 5), 8)
    assert.equal(addon.add(10, 5), 15)
  })
}

{
  let out = `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/1_hello_world/nan/hello.cc`
  pt.compileAddon(`${out}`, {output: `addon_1`}, (err) => {
    if (err) {
      console.log(err);
      assert(!err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/node-addon-examples/1_hello_world/nan/hello.js')

    assert.equal(addon(), 'world')
  })
}

{
  let out = `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/2_function_arguments/nan/addon_2.cc`
  pt.compileAddon(`${out}`, {output: `addon_2`}, (err) => {
    if (err) {
      console.log(err);
      assert(!err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/node-addon-examples/2_function_arguments/nan/addon.js')

    assert.equal(addon(3,5), 8)
  })
}

{
  let out = `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/3_callbacks/nan/addon_3.cc`
  pt.compileAddon(`${out}`, {output: `addon_3`}, (err) => {
    if (err) {
      console.log(err);
      assert(!err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/node-addon-examples/3_callbacks/nan/addon.js')

    let count = 2
    addon(() => {
      count--
      assert.equal(count, 0)
    })
    count--
  })
}

{
  let out = `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/4_object_factory/nan/addon_4.cc`
  pt.compileAddon(`${out}`, {output: `addon_4`}, (err) => {
    if (err) {
      console.log(err);
      assert(!err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/node-addon-examples/4_object_factory/nan/addon.js')

    assert.equal(addon(), 'hello world')
  })
}

{
  let out = `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/5_function_factory/nan/addon_5.cc`
  pt.compileAddon(`${out}`, {output: `addon_5`}, (err) => {
    if (err) {
      console.log(err);
      assert(!err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/node-addon-examples/5_function_factory/nan/addon.js')
    const fn = addon()

    assert.equal(fn(), 'hello world')
  })
}

{
  let out = [
    `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/6_object_wrap/nan/addon_6.cc`,
    `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/6_object_wrap/nan/myobject.cc`
  ]
  pt.compileAddon(out, {output: `addon_6`}, (err) => {
    if (err) {
      console.log(err);
      assert(!err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/node-addon-examples/6_object_wrap/nan/addon.js')

    let obj = new addon.MyObject(10);
    assert.equal(obj.plusOne(), 11)
    assert.equal(obj.plusOne(), 12)
    assert.equal(obj.plusOne(), 13)

    assert.equal(obj.multiply().value(), 13)
    assert.equal(obj.multiply(10).value(), 130)

    let newobj = obj.multiply(-1);
    assert.equal(newobj.value(), -13)
    assert.equal(obj === newobj, false)
  })
}


{
  let out = [
    `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/7_factory_wrap/nan/addon_7.cc`,
    `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/7_factory_wrap/nan/myobject_7.cc`
  ]
  pt.compileAddon(out, {output: `addon_7`}, (err) => {
    if (err) {
      console.log(err);
      assert(!err, 'must not call error here')
    }

    let createObject = require('../fixtures/sources/addons/node-addon-examples/7_factory_wrap/nan/addon.js')

    var obj = createObject(10);
    assert.equal(obj.plusOne(), 11);
    assert.equal(obj.plusOne(), 12);
    assert.equal(obj.plusOne(), 13);

    var obj2 = createObject(20);
    assert.equal(obj2.plusOne(), 21);
    assert.equal(obj2.plusOne(), 22);
    assert.equal(obj2.plusOne(), 23);
  })
}

{
  let out = [
    `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/8_passing_wrapped/nan/addon_8.cc`,
    `${process.cwd()}/test/fixtures/sources/addons/node-addon-examples/8_passing_wrapped/nan/myobject_8.cc`
  ]
  pt.compileAddon(out, {output: `addon_8`}, (err) => {
    if (err) {
      console.log(err);
      assert(!err, 'must not call error here')
    }

    let addon = require('../fixtures/sources/addons/node-addon-examples/8_passing_wrapped/nan/addon.js')

    var obj1 = addon.createObject(10);
    var obj2 = addon.createObject(20);
    var result = addon.add(obj1, obj2);

    assert.equal(result, 30);

  })
}
