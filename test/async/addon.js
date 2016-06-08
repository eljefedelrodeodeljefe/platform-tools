const pt = require('../../')
const assert = require('assert')
const child_process = require('child_process')

{
  // the below emualates something very similar to $ on OS X:
  // node-gyp clean && mkdir build && cd build && mkdir -p Release/obj.target/addon/ && c++ -I/Users/jefe/repos/platform-tools/build/deps/node/6.2.0/include/node -I../node_modules/nan  -Os -gdwarf-2 -mmacosx-version-min=10.7 -Wall -Wendif-labels -W -Wno-unused-parameter -std=gnu++0x -fno-rtti -fno-exceptions -fno-threadsafe-statics -fno-strict-aliasing -c -o Release/obj.target/addon/addon.o ../addon.cc
  // c++ -bundle -undefined dynamic_lookup -Wl,-no_pie -Wl,-search_paths_first -mmacosx-version-min=10.7 -L./Release  -o Release/addon.node Release/obj.target/addon/addon.o
  //
  let addon = require('../fixtures/sources/addons/addon')
  let out = '/Users/jefe/repos/platform-tools/test/fixtures/sources/addons/addon.cc'
  pt.compileAddon(`${out}`, {output: `addon`}, (err) => {
    if (err) {
      console.log(err);
      assert(!err, 'must not call error here')
    }
    assert.equal(addon.add(3, 5), 8)
    assert.equal(addon.add(10, 5), 15)
  })
}
