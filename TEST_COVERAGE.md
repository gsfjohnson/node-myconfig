# Test Coverage Report — @gsfjohnson/myconfig v0.3.1

Generated: 2026-02-19

## Summary

| Module | Methods/Functions | Tested | Untested | Coverage |
|--------|------------------:|-------:|---------:|---------:|
| index.js (MyConfig) | 12 | 7 | 5 | ~58% |
| ini.js (Ini) | 7 | 7 | 0 | ~100% |
| json.js (Json) | 2 | 2 | 0 | 100% |
| util.js (Util) | 25 | 25 | 0 | 100% |
| **Overall** | **46** | **41** | **5** | **~89%** |

## Test Infrastructure

- **Framework:** Mocha (via `npm test`)
- **Assertions:** Node.js built-in `assert`
- **Automated tests:** `test/` directory (4 files, run by Mocha)
- **Manual scripts:** `tests/` directory (6 files, CLI scripts — not part of automated suite)

---

## Module: index.js (MyConfig class)

**Test file:** `test/25_config.js` (10 tests, 2 skipped)

### Covered

| Method | What's Tested |
|--------|---------------|
| `constructor(name)` | String name argument, returns `instanceof MyConfig` |
| `set(key, val)` | Simple (non-dotted) key, returns `true` |
| `get(key)` | Simple key retrieval after set and after load |
| `delete(key)` | Simple key deletion, returns `true`; verified `get()` returns `undefined` after |
| `save(fn)` | Async save to explicit INI file path |
| `static load(name, fn)` | Async load with name + explicit INI file path |
| `dirty` (getter/setter) | Verified `dirty === 1` after `set()`, `dirty === 0` after `save()` |

### Not Covered

| Method / Path | Gap |
|---------------|-----|
| `constructor(Map)` | Constructing with initial Map data |
| `constructor(Object)` | Constructing with options object (e.g. `{ name, dir, data }`) |
| `constructor()` (error) | Invalid options / missing name error paths |
| `set()` — dotted keys | Nested key creation via `"a.b.c"` syntax |
| `set()` — invalid key | Non-string key error path |
| `get()` — dotted keys | Nested key traversal via `"a.b.c"` syntax |
| `get()` — deep clone return | Verifying returned Maps are clones, not references |
| `get()` — invalid key | Non-string key error path |
| `delete()` — dotted keys | Nested key deletion |
| `delete()` — non-existent key | Returns `false` when key not found |
| `delete()` — invalid key | Non-string key error path |
| `doesConfigPathExist()` | Empty stub — no implementation or tests |
| `save()` — auto path | Save without explicit filename (uses `osConfigPath`) |
| `save()` — JSON format | Save to `.json` file |
| `save()` — unsupported ext | Error on non-ini/json extension |
| `save()` — empty data | Saving when `data.size === 0` |
| `saveSync()` | Entirely untested (all paths) |
| `static loadSync()` | Entirely untested (all paths) |
| `static load()` — JSON | Loading from `.json` files |
| `static load()` — ignore_not_found | `ENOENT` handling with `ignore_not_found` flag |
| `static load()` — validation | Invalid name (punctuation, slashes) error paths |
| `static setDirty()` | Static utility method entirely untested |
| `dirty` setter — array | Setting dirty to an array value |
| `dirty` setter — invalid | Error on invalid parameter |

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

**Test file:** `test/07_json.js` (12 tests)

### Covered

| Function | What's Tested |
|----------|---------------|
| `Json.encode()` | Object encoding, Map conversion via `mapToObject`, nested structures |
| `Json.decode()` | JSON string, Buffer input, nested object-to-Map, invalid input types (number, null, undefined, object), invalid JSON strings |
| Round-trip | Encode/decode preserves data; empty objects handled |

### Not Covered

| Path | Gap |
|------|-----|
| `Json.decode()` — `data` parameter | Passing a pre-existing Map to merge into |

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

## Highest-Priority Remaining Gaps

1. **`saveSync()` and `loadSync()` are entirely untested** in the Mocha suite despite being public API methods added in v0.3.0.

2. **Dotted/nested key operations** (`set("a.b.c", val)`, `get("a.b.c")`, `delete("a.b.c")`) are core features with no test coverage.

3. **Error/edge-case paths** in MyConfig (`constructor` validation, `save`/`load` with bad extensions, `delete` on missing keys) are not exercised.

4. **`doesConfigPathExist()`** is declared but empty — no implementation and no tests.

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
