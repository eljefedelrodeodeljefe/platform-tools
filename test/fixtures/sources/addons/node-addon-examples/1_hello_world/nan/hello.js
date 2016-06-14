var addon = require(`${process.cwd()}/build/addon_1.node`);

module.exports = () => {
  console.log(addon.hello());
  return addon.hello()
}
