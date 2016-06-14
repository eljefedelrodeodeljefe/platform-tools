var addon = require('bindings')('../../../../../../../..build/addon_3.node');

addon(function(msg){
  console.log(msg); // 'hello world'
});
