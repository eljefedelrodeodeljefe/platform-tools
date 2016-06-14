var addon = require(`${process.cwd()}/build/addon_3.node`);


module.exports = (cb) => {
  process.nextTick( () => addon(cb)); // make sure this async. Probably is not a valid test then
}
