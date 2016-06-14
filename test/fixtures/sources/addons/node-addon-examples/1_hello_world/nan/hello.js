var addon = require('bindings')('../../../../../../../../build/addon_1.node');

module.exports = () => {
  return addon.hello()
}
