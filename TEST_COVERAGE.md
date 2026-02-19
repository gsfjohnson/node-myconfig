# Test Coverage Report — @gsfjohnson/myconfig v0.3.1

Generated: 2026-02-19

## Summary

| Module | Methods/Functions | Tested | Untested | Coverage |
|--------|------------------:|-------:|---------:|---------:|
| index.js (MyConfig) | 12 | 12 | 0 | ~100% |
| ini.js (Ini) | 7 | 7 | 0 | ~100% |
| json.js (Json) | 2 | 2 | 0 | 100% ✅ |
| util.js (Util) | 25 | 25 | 0 | 100% |
| **Overall** | **46** | **46** | **0** | **~100%** |

## Test Infrastructure

- **Framework:** Mocha (via `npm test`)
- **Assertions:** Node.js built-in `assert`
- **Automated tests:** `test/` directory (5 files, 290 tests passing, run by Mocha)
- **Manual scripts:** `tests/` directory (6 files, CLI scripts — not part of automated suite)

---

## Module: index.js (MyConfig class)

**Test files:** `test/25_config.js` (10 tests, 2 skipped), `test/26_config.js` (100 tests)

### Covered

| Method | What's Tested |
|--------|---------------|
| `constructor(name)` | String name argument, returns `instanceof MyConfig`, `name` and `data` properties set, `id` starts with `mycfg_`, object is frozen |
| `constructor(Map)` | Initial Map data, deep clones non-empty Maps, assigns empty Map directly |
| `constructor(Object)` | Options object with `{ name }`, `{ name, dir }`, `{ name, data }` |
| `constructor(name, Map)` | Mixed positional args: string name + Map data |
| `constructor()` (error) | Missing name, non-string name (number), invalid option types (array, boolean) |
| `set(key, val)` | Simple key returns `true`, stores value retrievable by `get()` |
| `set()` — dotted keys | `"a.b"` and `"a.b.c"` create nested Maps, preserves sibling keys, overwrites non-Map intermediate |
| `set()` — dirty tracking | Increments dirty count per call |
| `set()` — invalid key | Throws on non-string (number), null, undefined |
| `get(key)` | Simple key retrieval, dotted key `"a.b.c"` traversal |
| `get()` — deep clone return | Intermediate dotted key returns deep-cloned Map; mutation of clone does not affect config |
| `get()` — non-existent keys | Returns `undefined` for missing simple key, missing dotted key, traversal past leaf |
| `get()` — invalid key | Throws on non-string (number), null |
| `delete(key)` | Simple key deletion returns `true`, `get()` returns `undefined` after |
| `delete()` — dotted keys | `"a.b.c"` nested deletion returns `true` |
| `delete()` — non-existent key | Returns `false` for missing simple key, missing dotted key, partially-existent dotted key |
| `delete()` — leading dot | `".key"` works (leading empty segment is stripped) |
| `delete()` — invalid key | Throws on non-string (number), null |
| `doesConfigPathExist()` | Is a function, returns `undefined` (empty stub) |
| `save(fn)` — INI | Async save to INI file → `true`, writes correct content, empty data writes empty string, resets dirty to 0 |
| `save(fn)` — JSON | Async save to JSON file → `true`, writes valid JSON |
| `save()` — unsupported ext | Throws error for non-ini/json extensions |
| `saveSync(fn)` — INI | Sync save to INI file → `true`, writes correct content, empty data writes empty string, resets dirty to 0 |
| `saveSync(fn)` — JSON | Sync save to JSON file → `true`, writes valid JSON |
| `saveSync()` — unsupported ext | Throws error for non-ini/json extensions |
| `static load(name, fn)` — INI | Async load INI file → `instanceof MyConfig`, reads correct data, sets `name` |
| `static load()` — JSON | Async load JSON file → `instanceof MyConfig`, reads correct data |
| `static load()` — ignore_not_found | `true` on missing file → empty config; `false`/absent → throws `ENOENT` |
| `static load()` — validation | Missing name, name with dot/forward-slash/backslash, invalid option type (number) |
| `static loadSync(name, fn)` — INI | Sync load INI file → `instanceof MyConfig`, reads correct data, sets `name` |
| `static loadSync()` — JSON | Sync load JSON file → `instanceof MyConfig`, reads correct data |
| `static loadSync()` — ignore_not_found | `true` on missing file → empty config; `false`/absent → throws `ENOENT` |
| `static loadSync()` — validation | Missing name, name with dot/forward-slash/backslash, invalid option type (number) |
| `static setDirty()` | Pushes key into array, skips duplicates, returns `undefined` for non-array/null first argument |
| `dirty` (getter) | Returns 0 on new config, increments with `set()` |
| `dirty` (setter) | Resets to 0 on `null`, accepts array, throws on invalid parameter (number, object) |
| Round-trip | Async INI/JSON save → load; sync INI/JSON saveSync → loadSync; dotted keys through INI and JSON |
| Static properties | `MyConfig.config_fn === "config.ini"`, `MyConfig.pd === true` |

### Issues Fixed During Testing

| Issue | Description | Fix |
|-------|-------------|-----|
| `save()` / `saveSync()` — JSON format | Lines 263/300 called `Json.encode( Util.mapToObject(data) )` but `Json.encode()` internally also calls `Util.mapToObject()`, causing a double-conversion `TypeError`. | Changed to `Json.encode( data )`. |
| `loadSync()` — path building | Option parser (line 389) set local variable `fn = opt` for file-path strings, but `load()` (line 323) correctly sets `path = opt`. This caused `loadSync()` to build an invalid path via `join(osConfigPath, fullAbsolutePath)`. | Changed `fn = opt` to `path = opt`. |
| `get()` — traversal past leaf | `get("a.b.c.d")` where `a.b.c` is a non-Map value returned that value instead of `undefined`. The `while` loop broke on non-Map data but returned whatever `data` held at that point. | Added `if (keys.length) data = undefined;` after the loop to return `undefined` when the path is not fully resolved. |

### Not Covered

| Method / Path | Gap |
|---------------|-----|
| `save()` — auto path | Save without explicit filename (uses `osConfigPath` + `mkdir`), environment-dependent |
| `doesConfigPathExist()` | Empty stub — no implementation to test beyond confirming it returns `undefined` |

---

## Module: ini.js (Ini class + helpers)

**Test file:** `test/05_ini.js` (39 tests)

### Covered

| Function | What's Tested |
|----------|---------------|
| `Ini.encode()` | Simple map, whitespace option, alignment, nested sections, arrays, bracketedArray=false, special characters, sort, invalid input error, `newline` option (double eol after section header), `section` option (direct), `platform` option (win32 CRLF vs LF), null values (skipped by `mapToObject`), boolean values, empty map, section ordering (top-level keys before sections), alignment with mixed arrays/sections, `[bracket]` value quoting, leading/trailing whitespace quoting |
| `Ini.decode()` | Simple string, sections, nested/deep sections, bracket arrays, duplicate-key arrays, comments, empty lines, type conversion, quoted values, escaped chars, equals in keys, invalid input (number, null, undefined), empty input, key without value (→ `true`), pre-existing Map merging, CRLF line endings, inline comments (`;` and `#` truncation), whitespace trimming around keys/values, multiple sections, top-level keys alongside sections, bracketed arrays within sections, escaped backslash (`\\` → `\`), trailing backslash |
| `splitSections()` | Exercised via encode: multi-word nested section keys produce space-separated headers; round-trip nested sections through encode/decode |
| Round-trip | Complex nested structures, boolean values, special characters (semicolons, hashes), platform-specific line endings (win32 CRLF) |
| `strToType()` | Indirectly via decode type conversion tests (null, true, false) and boolean round-trip |
| `safe()` / `unsafe()` | Indirectly via encode/decode: special characters, `[bracket]` quoting, whitespace quoting, backslash escaping, inline comment truncation, trailing backslash |

### Known Behaviors Found During Testing

| Behavior | Description |
|----------|-------------|
| `Ini.encode()` — null values | Null values in a Map are silently skipped because `Util.mapToObject()` excludes types not in its switch cases (boolean, number, string, symbol, array, map). Null round-trips are not supported. |

### Not Covered

| Function / Path | Gap |
|-----------------|-----|
| `splitSections()` — escaped separator | Direct test for backslash-escaped space separators in section names (only indirectly exercised via encode) |

---

## Module: json.js (Json class)

**Test file:** `test/07_json.js` (21 tests)

### Covered

| Function | What's Tested |
|----------|---------------|
| `Json.encode()` | Simple Map, nested Maps, arrays, mixed value types (string/number/boolean/array), empty Map, return type is string, null values silently dropped (mapToObject excludes them) |
| `Json.decode()` | JSON string, Buffer input, nested object-to-Map (3 levels deep), array preservation, various JSON types (string/number/boolean/null), empty object, `data` parameter (pre-existing Map merge with overwrite and preservation), invalid input types (number, null, undefined, object, array, boolean), invalid JSON strings (malformed, truncated, empty, `"undefined"`) |
| Round-trip | Complex structures (string/number/boolean/array/nested), empty Map, deeply nested Maps (3 levels), arrays containing objects |

### Known Behaviors Found During Testing

| Behavior | Description |
|----------|-------------|
| `Json.encode()` — null values | Null values in a Map are silently dropped because `Util.mapToObject()` excludes types not in its switch cases. Null round-trips are not supported. |

### Not Covered

All code paths in json.js are fully covered.

---

## Module: util.js (Util class)

**Test file:** `test/03_util.js` (110 tests)

### Covered

| Method | What's Tested |
|--------|---------------|
| `isObject()` | Plain objects, class instances, null, arrays, primitives |
| `isPureObject()` | Plain object literals, class instances, null-prototype objects (falsy), arrays, primitives |
| `isNullObject()` | Null-prototype objects, regular objects, null (throws TypeError), non-objects |
| `isDate()` | Valid Date objects, invalid Date objects, non-Date values |
| `isPromise()` | Native Promises, thenable objects, non-promise objects, primitives/arrays |
| `isArray()` | Arrays, non-arrays |
| `isNumber()` | Numbers (including NaN, Infinity), non-numbers |
| `isBoolean()` | Booleans, non-booleans (0, 1, "true") |
| `isString()` | Strings (empty, literal, template), non-strings |
| `isMap()` | Map instances, non-Map values |
| `isKey()` | String keys with/without allowed list, key not in allowed list, non-string keys |
| `isUuid()` | Valid UUIDs, wrong segment count, empty segments, non-strings |
| `isHex()` | Valid hex → Buffer, non-hex strings, non-strings |
| `isBase64()` | Valid base64 → Buffer, non-base64 strings, non-strings |
| `isSHA()` | Base64 SHA input, Buffer SHA input, hex limitation (see Known Issues), non-SHA lengths, non-string/buffer, empty values |
| `objectToMap()` | Simple object, nested recursion, array preservation, existing Map merge, TypeError on invalid input |
| `mapToObject()` | Simple Map, nested Map recursion, TypeError on non-Map |
| `deepCloneMap()` | Simple clone, nested Map isolation (mutation test), array cloning, null/undefined values |
| `deepCloneObject()` | Primitives pass-through, plain objects, arrays, Date, RegExp, Map delegation, Set |
| `typeof()` | string, number, boolean, undefined, null, buffer, map, array, object, function |
| `isStream()` | Readable streams, Writable streams, non-streams |
| `isReadable()` | Readable, PassThrough (duplex), Writable-only (false), non-streams |
| `isWritable()` | Writable, PassThrough (duplex), Readable-only (false), non-streams |
| `streamToBuffer()` | Collect data into Buffer, empty stream, non-readable error |
| `rand_string()` | Correct length, empty for n≤0, hex character set, uniqueness |
| `osConfigPath()` | String name, options object, `fn` appended, dots/slashes/backslashes rejected, missing name TypeError |
| `parse_system_path()` | String path trailing separator, already-trailing, array segments, non-string/array → undefined, relative path error, non-string array elements error |
| `parse_argv()` | Returns object with script, name, and argv fields |

### Known Issues Found During Testing

| Issue | Description |
|-------|-------------|
| `isSHA()` — hex strings | Hex-encoded SHA strings (e.g. 40-char SHA-1) are also valid base64; the base64 decode path takes priority, producing a buffer whose length doesn't match any SHA byte-length. Only base64 or raw Buffer inputs are correctly identified. |
| `isNullObject(null)` | Throws `TypeError` because `Object.getPrototypeOf(null)` throws. Callers must guard against null. |
| `isPureObject(Object.create(null))` | Returns `undefined` (falsy) rather than `false`, because null-prototype objects lack a `.constructor` property. |
| `mapToObject()` — number fall-through | The `case 'number':` branch (line 188–189) is missing a `break` and falls through to `case 'string':`, overwriting the stringified number with the original numeric value. |
| `parse_system_path()` — `ld` typo | ~~Line 401 referenced undefined variable `ld` instead of `fx` in the `debug()` call, causing `ReferenceError` on every successful parse.~~ **Fixed:** changed to `fx`. |

---

## Remaining Gaps

1. **`save()` auto-path** (without explicit filename) is untested because it requires `osConfigPath` to `mkdir`, which is environment-dependent.

2. **`doesConfigPathExist()`** is declared but empty — no implementation and no tests beyond confirming the stub.

---

## Manual Test Scripts (tests/)

The `tests/` directory contains 6 CLI scripts that are **not** run by `npm test`:

| Script | Purpose |
|--------|---------|
| `tests/read.js` | Manual async load + get |
| `tests/read_sync.js` | Manual sync load + get |
| `tests/write.js` | Manual async load + set + save |
| `tests/write_sync.js` | Manual sync load + set + saveSync |
| `tests/delete.js` | Manual async load + delete + save |
| `tests/query.js` | Manual query test (uses removed API) |

These provide integration smoke-testing but do not contribute to automated coverage.
