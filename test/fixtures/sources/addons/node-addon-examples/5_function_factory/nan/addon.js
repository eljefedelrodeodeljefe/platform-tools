var addon = require(`${process.cwd()}/build/addon_5.node`);

var fn = addon();
module.exports = () => {
  return fn
}
