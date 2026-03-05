# Module Evaluation: node-myconfig

A Map-based configuration library supporting INI/JSON formats with dot-notation access. Well-tested (~290 tests), clean architecture.

## Security Issues

### 1. Path Traversal in `load()`/`loadSync()` — HIGH

`index.js:325-338` — The `name` validation rejects `.`, `/`, `\\` but the `path` argument (line 326) is accepted with no sanitization. An attacker-controlled path can read arbitrary files:

```js
MyConfig.load('app', '/etc/shadow')  // reads any file on disk
```

The path is used directly in `readFile()` at line 353. No check that it stays within an expected config directory.

### 2. Path Traversal in `save()`/`saveSync()` — HIGH

`index.js:242-269` — The `fn` parameter is written to directly with `writeFile()` with no path validation. Arbitrary file overwrite is possible:

```js
cfg.save('/etc/cron.d/malicious.ini')
```

### 3. Weak CSPRNG Fallback in `rand_string()` — MEDIUM

`util.js:356-366` — When `crypto.randomBytes()` fails (entropy exhaustion), it falls back to `Math.random()`, which is not cryptographically secure. If instance IDs are ever used for security purposes, this is exploitable. The fallback also has a bug on line 365: `i` is the loop variable from the `for` above, not a fresh value relative to `r`.

### 4. Prototype Pollution via `Object.assign(opts, opt)` — MEDIUM

`index.js:49`, `index.js:329`, `util.js:419` — Multiple places use `Object.assign(opts, opt)` where `opt` comes from user input. If `opt` contains `__proto__` or `constructor` keys, this could pollute prototypes. The constructor mitigates this partially by using `Object.create(null)` (line 36), but `load()`/`loadSync()`/`osConfigPath()` use `{}` which has a prototype chain.

### 5. INI `unsafe()` uses `JSON.parse()` on Untrusted Input — LOW

`ini.js:64-67` — Quoted values are passed to `JSON.parse()`. While JSON.parse is safe from code execution, it could parse unexpected structures (objects, arrays) from what looks like a simple string value in an INI file.

### 6. File Permissions Not Set — LOW

`index.js:269`, `index.js:306` — `writeFile`/`writeFileSync` uses default umask. Config files may contain sensitive data (API keys, credentials) and should be created with restrictive permissions (e.g., `0o600`).

### 7. Debug Logging May Leak Sensitive Data — LOW

Debug statements throughout (`index.js:33`, `index.js:111`, `util.js:354`) log raw config values including passwords and secrets when `DEBUG=myconfig*` is set.

## Bugs

### 1. `deepCloneMap()` — Missing `Util.` prefix

`util.js:224` — `deepCloneObject(item)` should be `Util.deepCloneObject(item)`. This will throw a `ReferenceError` when cloning a Map that contains a Set with object values.

### 2. `rand_string()` fallback remainder logic

`util.js:365` — `Math.random().toString(16).slice(2,i)` uses the loop variable `i` which equals `q` (the quotient), not a value related to the remainder `r`. Should be `.slice(2, 2+r)`.

### 3. `doesConfigPathExist()` is an empty stub

`index.js:237-240` — Exported as a public method but does nothing.

### 4. `dirty` getter/setter inconsistency

`index.js:467` — The setter allows assigning a raw array (`else if (Array.isArray(val)) sd.dirty = val`), but also resets on any falsy value. `dirty = 0` (a number, falsy) resets the array, which is a surprising side-effect.

## Proposed Improvements

### 1. Add path validation to `save()` and `load()`

```js
// Ensure paths are within the expected config directory
const resolved = NodePath.resolve(fn);
const configDir = Util.osConfigPath(this.name);
if (!resolved.startsWith(configDir))
  throw new Error('path outside config directory');
```

### 2. Set restrictive file permissions on save

```js
await NodeFs.promises.writeFile(fn, str, { encoding: 'utf8', mode: 0o600 });
```

### 3. Remove the `Math.random()` fallback

Just let the error propagate instead of silently degrading to an insecure RNG:

```js
static rand_string(n) {
  if (n <= 0) return '';
  return NodeCrypto.randomBytes(Math.ceil(n/2)).toString('hex').slice(0,n);
}
```

### 4. Guard against prototype pollution

```js
// In load(), loadSync(), osConfigPath():
const opts = Object.create(null);  // instead of {}
```

### 5. Fix the `deepCloneMap` Set branch

```js
// util.js:224 — add Util. prefix
clonedValue = new Set([...value].map(item =>
  item instanceof Object ? Util.deepCloneObject(item) : item
));
```

### 6. Remove or implement `doesConfigPathExist()`

Dead code confuses consumers.

### 7. Freeze `mapToObject()` output arrays

Arrays returned from `mapToObject()` are passed by reference (`util.js:191`), meaning mutations to the encoded output could back-propagate to the internal Map's array values.

### 8. Add input length limits to `Ini.decode()`

A very large INI string could cause excessive memory/CPU usage during the line-by-line parse. Consider a max size check.

### 9. Validate `key` in `set()` for empty strings and leading/trailing dots

`set('')` or `set('..a')` produce unexpected Map structures with empty-string keys.

### 10. Reduce code duplication

`save()`/`saveSync()` and `load()`/`loadSync()` are near-identical. Extract shared logic into private helpers, leaving only the sync/async I/O calls different.

## Summary

| Category | Count |
|----------|-------|
| Security issues | 7 (2 high, 2 medium, 3 low) |
| Bugs | 4 |
| Improvements | 10 |

The two **high-severity** items are the unvalidated file paths in `save()` and `load()`. These should be addressed first — either by restricting paths to the config directory or by clearly documenting that callers must validate paths themselves.
