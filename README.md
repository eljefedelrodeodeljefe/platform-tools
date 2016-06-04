# platform-tools

Native bindings to observation APIs like `sysctl` (BSDs), `proc/{pid}/` (Linux) and Windows equivalents in the context of process observation.

[![Build Status](https://travis-ci.org/eljefedelrodeodeljefe/platform-tools.svg?branch=master)](https://travis-ci.org/eljefedelrodeodeljefe/platform-tools) [![Build status](https://ci.appveyor.com/api/projects/status/59q34ua3i457k27x?svg=true)](https://ci.appveyor.com/project/eljefederodeodeljefe/platform-tools) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/) [![Join the chat at https://gitter.im/eljefedelrodeodeljefe/platform-tools](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/eljefedelrodeodeljefe/platform-tools?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![NPM](https://nodei.co/npm-dl/platform-tools.png?months=6&height=2)](https://nodei.co/npm/platform-tools/)

## TL;DR

> In some cases you have orphaned process or just want to watch certain processes. To work with them from node you need either handles to them or need to observe them first. This module aids those purposes.

```js
// inspect your current process (here assuming that you have just spawned
// a new process), here with async API
observe.children(process.pid, (err, result) => {
	if (err)
		console.log(err)

	console.log(result)
	// -> {pids: [5841], count: 1}
})
```
## Implementation Status<a name="status"></a>
| Method | implemented |
| --- | --- |
| .info(pid [, cb]) | **yes** |
| .children(pid [, cb]) | **yes** |



### Overview

### Technical Overview

**Rquirements:**
* Node 4.0.0+

## Platform

This module is currently tested on:

| Platform | 0.12 | 3.0 | 4.0 | 5.0 | 6.0 |
| --- | --- | --- | --- | ---| ---|---|
| Mac OS X | - | - | **yes** | **yes**| **yes** |
| BSDs | - | - | - | - | - |
| Linux | - | - | **yes** | **yes**  | **yes** |
| Windows | - | - | - | - | - |

## Roadmap

Please see [list of the implemented methods](#status) for now.


## API
<a name="PlatformTools"></a>

## PlatformTools
**Kind**: global class  

* [PlatformTools](#PlatformTools)
    * [.compile(source, cb)](#PlatformTools+compile) ⇒ <code>Callback</code>
    * [.link(object, options, cb)](#PlatformTools+link) ⇒ <code>Callback</code>
    * [.pkgInfo(lib, cb)](#PlatformTools+pkgInfo) ⇒ <code>Callback</code>

<a name="PlatformTools+compile"></a>

### platformTools.compile(source, cb) ⇒ <code>Callback</code>
Compiles a given source code file to the platforms object code

**Kind**: instance method of <code>[PlatformTools](#PlatformTools)</code>  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>String</code> | Path to source |
| cb | <code>function</code> | Optional callback for completion |

<a name="PlatformTools+link"></a>

### platformTools.link(object, options, cb) ⇒ <code>Callback</code>
Links mutiple objects and libraries to a binary

**Kind**: instance method of <code>[PlatformTools](#PlatformTools)</code>  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>String</code> | Path for name of object code file |
| options | <code>Object</code> | Options object |
| cb | <code>function</code> | Optional callback |

<a name="PlatformTools+pkgInfo"></a>

### platformTools.pkgInfo(lib, cb) ⇒ <code>Callback</code>
Returns the necessary libraries to link against.

**Kind**: instance method of <code>[PlatformTools](#PlatformTools)</code>  

| Param | Type | Description |
| --- | --- | --- |
| lib | <code>String</code> | Library to search dependencies against |
| cb | <code>function</code> | Optional Callback upon completion |

## License

MIT
