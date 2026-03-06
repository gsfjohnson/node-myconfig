# CLAUDE.md — node-myconfig

## Project Overview

`@gsfjohnson/myconfig` — A Node.js configuration manager supporting INI and JSON formats with Map-based storage, dot-notation access, dirty tracking, and platform-aware config paths.

## Quick Reference

| Item | Value |
|------|-------|
| Entry point | `index.js` (MyConfig class) |
| Module system | CommonJS (`require`/`module.exports`) |
| Min Node | 12.9.0 |
| Test framework | Mocha |
| Test command | `npm test` |
| Registry | GitHub npm (`npm.pkg.github.com/gsfjohnson`) |

## Project Structure

```
index.js        — MyConfig class (main entry)
ini.js          — INI parser/encoder
json.js         — JSON parser/encoder
util.js         — Utility functions (type checks, cloning, paths)
test/           — Mocha test suite (301 tests)
  03_util.js    — Util tests
  05_ini.js     — INI tests
  07_json.js    — JSON tests
  25_config.js  — Basic config tests
  26_config.js  — Comprehensive config tests
tests/          — Standalone sample scripts (not part of test suite)
```

## Code Conventions

- **2-space indentation**, no linter configured
- ES6 classes with **private fields** (`#fieldName`)
- Internal data stored as **Map** (not plain objects)
- Public methods use **camelCase**; documented with **JSDoc**
- Debug via optional `debug` package (falls back to stub)
- Objects **frozen** after construction (`Object.freeze`)
- Deep cloning on get/set to prevent external mutation

## Key Architecture

- `MyConfig` constructor accepts variadic args: strings, objects, or Maps
- Dot-notation keys (e.g., `"server.host"`) create/traverse nested Maps
- `Ini`/`Json` classes handle encode/decode between strings and Maps
- `Util.osConfigPath(name)` resolves platform-specific config dirs (Win/macOS/Linux)
- Path traversal attacks blocked via `_assertPathInConfigDir()`
- Dirty tracking: array of changed keys, exposed via `dirty` getter

## Dependencies

- **optional:** `debug` (^4.4.3)
- **devDependencies:** `@gsfjohnson/argv` (^0.0.2)

## Common Tasks

```bash
# Run tests
npm test

# Publish (GitHub registry)
npm publish
```

## Important Notes

- No build step — raw JS shipped directly
- `.npmignore` excludes `test/`, `tests/`, `EVAL.md`, `CLAUDE.md`, `TEST_COVERAGE.md`
- Commit messages follow pattern: `<version> <short description>` (e.g., `0.3.4 less debug, fix ini headers`)
