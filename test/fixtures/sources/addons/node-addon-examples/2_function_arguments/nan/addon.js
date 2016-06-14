var addon = require('bindings')('../../../../../../../../build/addon_2.node');

module.exports = (a, b) => {
  return addon.add(a, b)
}
