# platform-tools

A toolchain to build and compile native dependencies with and for Node.

[![Build Status](https://travis-ci.org/eljefedelrodeodeljefe/platform-tools.svg?branch=master)](https://travis-ci.org/eljefedelrodeodeljefe/platform-tools) [![Build status](https://ci.appveyor.com/api/projects/status/59q34ua3i457k27x?svg=true)](https://ci.appveyor.com/project/eljefederodeodeljefe/platform-tools) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/) [![Join the chat at https://gitter.im/eljefedelrodeodeljefe/platform-tools](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/eljefedelrodeodeljefe/platform-tools?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![NPM](https://nodei.co/npm-dl/platform-tools.png?months=6&height=2)](https://nodei.co/npm/platform-tools/)

## TL;DR

> Compile C/C++ and native node addons with Node.js. Under the hood this is shelling
out to `gcc`, `clang` and `cl.exe` in a similar way `make` does. To mitigate `gyp` and
`autotools` dependencies node users (eventually) could use this.

Assume a file `exit_with_1.c`

```c
int main(int argc, char const \*argv[]) {
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
const platform_tools = require('platform_tools')
const spawn = require('child_process').spawn

let out = 'exit_with_1'
// first compile without linking
platform_tools.compile('exit_with_1.c', {output: `${out}.o`}, () => {
	// then link the object file (here an easy case)
	platform_tools.link(`${out}.o`, {output: out}, () => {
		// now execute the compiled binary and expect the C-program to end
		// with code 1
		const cp = child_process.spawn(out, [], {shell: true});
		cp.on('close', (code) => {
			assert(code === 1), 'Compiled binary exit_with_1 must exit with code 1')
		})
	})
})
```
## Implementation Status<a name="status"></a>
| Method | implemented |
| --- | --- |
| .compile(source [, cb]) | **yes** |
| .link(object [, cb]) | **yes** |
| .config(library [, cb]) | **yes** |



### Overview

### Technical Overview

**Rquirements:**
* Node 4.5.0+

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
* make native addons built
* make node built
* make v8 v8


## API
