var addon = require('bindings')('../../../../../../../..build/addon_5.node');

var fn = addon();
console.log(fn()); // 'hello world'
