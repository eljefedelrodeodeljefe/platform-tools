var addon = require(`${process.cwd()}/build/addon_4.node`);

var obj1 = addon('hello');
var obj2 = addon('world');

module.exports = () => {
  return obj1.msg +' '+ obj2.msg
}
