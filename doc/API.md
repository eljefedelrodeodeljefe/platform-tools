<a name="PlatformTools"></a>

## PlatformTools
**Kind**: global class  

* [PlatformTools](#PlatformTools)
    * [.compile(source, cb)](#PlatformTools+compile) ⇒ <code>Callback</code>
    * [.link(object, options, cb)](#PlatformTools+link) ⇒ <code>Callback</code>
    * [.config(lib, cb)](#PlatformTools+config) ⇒ <code>Callback</code>
    * [.compileAddon(addonSrcFile, options, cb)](#PlatformTools+compileAddon) ⇒ <code>Callback</code>

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

<a name="PlatformTools+config"></a>

### platformTools.config(lib, cb) ⇒ <code>Callback</code>
Returns the necessary libraries to link against, similarly to pkg-config(1).

**Kind**: instance method of <code>[PlatformTools](#PlatformTools)</code>  

| Param | Type | Description |
| --- | --- | --- |
| lib | <code>String</code> | Library to search dependencies against |
| cb | <code>function</code> | Optional Callback upon completion |

<a name="PlatformTools+compileAddon"></a>

### platformTools.compileAddon(addonSrcFile, options, cb) ⇒ <code>Callback</code>
This method compiles node native addons end-to-end. Motivation behind this
high level approach is past struggles with this technique, and especially
different behaviors across platforms. Eventually this method should take
care of all of the above. If the user has special cases, it is still
possible to pass instructions via the options object and (item for roadmap)
override certain common variables forcefully.

**Kind**: instance method of <code>[PlatformTools](#PlatformTools)</code>  
**Returns**: <code>Callback</code> - returns optional callback  

| Param | Type | Description |
| --- | --- | --- |
| addonSrcFile | <code>String</code> | Path to source file |
| options | <code>Object</code> | Options object |
| cb | <code>function</code> |  |

