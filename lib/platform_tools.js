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
// internal doc taken from man plg-config:
//
//  The pkg-config program is  used  to  retrieve  information  about  installed
// libraries  in  the system.  It is typically used to compile and link against
// one or more libraries.  Here is a typical usage scenario in a Makefile:
//
// program: program.c
//     cc program.c $(pkg-config --cflags --libs gnomeui)
//
// pkg-config retrieves information about packages from special metadata files.
// These  files  are named after the package, and has a .pc extension.  On most
// systems,  pkg-config  looks  in  /usr/lib/pkgconfig,   /usr/share/pkgconfig,
// /usr/local/lib/pkgconfig and /usr/local/share/pkgconfig for these files.  It
// will additionally look in the colon-separated (on  Windows,  semicolon-sepa-
// rated)  list  of  directories  specified  by the PKG_CONFIG_PATH environment
// variable.
//
// The package name specified on the pkg-config command line is defined  to  be
// the  name  of  the  metadata file, minus the .pc extension. If a library can
// install multiple versions simultaneously, it must give each version its  own
// name  (for example, GTK 1.2 might have the package name "gtk+" while GTK 2.0
// has "gtk+-2.0").
//
// In addition to specifying a package name on the command line, the full  path
// to  a  given  .pc  file may be given instead. This allows a user to directly
// query a particular .pc file.
// 
PlatformTools.prototype.pkgConfig = (lib, cb) => {

}

module.exports = new PlatformTools()
