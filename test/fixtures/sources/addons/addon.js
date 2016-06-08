var addon = require('bindings')('../../../../../build/addon.node')

console.log('This should be eight:', addon.add(3, 5))
