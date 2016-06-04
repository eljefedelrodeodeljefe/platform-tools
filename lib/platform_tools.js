'use strict'
const EventEmitter = require('events')

/**
 * @class
 */
class PlatformTools extends EventEmitter {
  constructor() {
    super()
  }
}

/**
 * Compiles a given source code file to the platforms object code
 * @param  {String}   source Path to source
 * @param  {Function} cb     Optional callback for completion
 * @return {Callback}
 */
PlatformTools.prototype.compile = (source, cb) => {

}

/**
 * Links mutiple objects and libraries to a binary
 * @param  {String}   object  Path for name of object code file
 * @param  {Object}   options Options object
 * @param  {Function} cb      Optional callback
 * @return {Callback}
 */
PlatformTools.prototype.link = (object, cb) => {

}

/**
 * Returns the necessary libraries to link against, similarly to pkg-config(1).
 * @param  {String}   lib Library to search dependencies against
 * @param  {Function} cb  Optional Callback upon completion
 * @return {Callback}
 */
PlatformTools.prototype.pkgConfig = (lib, cb) => {

}

module.exports = new PlatformTools()
