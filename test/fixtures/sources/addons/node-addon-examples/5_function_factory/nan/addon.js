var addon = require('bindings')('../../../../../../../../build/addon_5.node');

var fn = addon();
module.exports = () => {
  return fn
}
