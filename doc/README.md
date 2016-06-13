# platform-tools

A toolchain to build and compile native dependencies with and for Node.

[![Build Status](https://travis-ci.org/eljefedelrodeodeljefe/platform-tools.svg?branch=master)](https://travis-ci.org/eljefedelrodeodeljefe/platform-tools) [![Build status](https://ci.appveyor.com/api/projects/status/59q34ua3i457k27x?svg=true)](https://ci.appveyor.com/project/eljefederodeodeljefe/platform-tools) [![Join the chat at https://gitter.im/eljefedelrodeodeljefe/platform-tools](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/eljefedelrodeodeljefe/platform-tools?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![NPM](https://nodei.co/npm-dl/platform-tools.png?months=6&height=2)](https://nodei.co/npm/platform-tools/)

## TL;DR

> Compile C/C++ and native node addons with Node.js. Under the hood this is shelling
out to `gcc`, `clang` and `cl.exe` in a similar way `make` does. To mitigate `gyp` and
`autotools` dependencies node users (eventually) could use this.

Assume a file `exit_with_1.c`

```c
int main(int argc, char const* argv[]) {
  return 1;
}
```

The below would be an example of emulating with Node.js

```console
gcc -c exit_with_1
gcc -o exit_with_1.o
./exit_with_1
```

```js
const platform_tools = require('platform-tools')
const spawn = require('child_process').spawn

let out = 'exit_with_1'
// first compile without linking
platform_tools.compile('exit_with_1.c', {output: `${out}.o`}, () => {
	// then link the object file (here an easy case)
	platform_tools.link(`${out}.o`, {output: out}, () => {
		// now execute the compiled binary and expect the C-program to end
		// with code 1
		const cp = spawn(out, [], {shell: true});
		cp.on('close', (code) => {
			assert(code === 1), 'Compiled binary exit_with_1 must exit with code 1')
		})
	})
})
```

## Implementation Status<a name="status"></a>
| Method | implemented |
| --- | --- |
| .compile(source [,options, cb]) | **yes** |
| .compileAddon(source [,options, cb]) | **yes** |
| .link(object [,options, cb]) | **yes** |
| .config(library [,options, cb]) | **yes** |



### Overview

### Technical Overview

**Rquirements:**
* Node 4.5.0+
* the default compiler for your system

## Windows Users

> Mote: since this repo wants to purposely increase Windows native addon usabilty
please share if you have a hard time. However ue to the Microsoft inherent SDK
and compiler strategy we need to assume prerequisites of you.

* Windows SDK 10 standalone should be installed and in your %ProgramFiles(x86)%
* Visual Studio 2015 should be installed and in your %ProgramFiles(x86)%

**For background:** To accomplish unix-like command-line behavior, e.g.
`gcc source_file.c -o source.exe && ./source.exe` we need to assume the location
of the most basic C/C++ headers in various locations on your Windows installation.
The `cl.exe` binary does not assume any search paths on it's own, if it is not
run through Visual Studio. Although that being quite a quirk for embedders and
library authors, Windows compiler support is as good as Unix'.

## Platform

This module is currently tested on:

| Platform | 0.10 | 0.12 | 4.0 | 5.0 | 6.0 |
| --- | --- | --- | --- | ---| ---|---|
| Mac OS X | - | - | **yes** | **yes**| **yes** |
| BSDs| - | - | **yes** | **yes**| **yes** |
| Linux | - | - | **yes** | **yes**  | **yes** |
| Windows | - | - | **yes** | **yes**  | **yes** |

## Roadmap

* have more complex C/C++ files compile and link
* ~~make native addons built~~
* make node built
* make v8 v8
* override values that the lib takes as assumption


## API
