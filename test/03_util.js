const Assert = require('assert');
const { Readable, Writable, PassThrough } = require('node:stream');

const Util = require('../util');

describe('Util', function()
{
  // --- Type-check methods ---

  describe('isObject', function()
  {
    it('should return true for plain objects', function() {
      Assert.strictEqual(Util.isObject({}), true);
      Assert.strictEqual(Util.isObject({ a: 1 }), true);
    });

    it('should return true for class instances', function() {
      Assert.strictEqual(Util.isObject(new Map()), true);
      Assert.strictEqual(Util.isObject(new Date()), true);
    });

    it('should return false for null', function() {
      Assert.strictEqual(Util.isObject(null), false);
    });

    it('should return false for arrays', function() {
      Assert.strictEqual(Util.isObject([]), false);
      Assert.strictEqual(Util.isObject([1, 2]), false);
    });

    it('should return false for primitives', function() {
      Assert.strictEqual(Util.isObject('string'), false);
      Assert.strictEqual(Util.isObject(42), false);
      Assert.strictEqual(Util.isObject(true), false);
      Assert.strictEqual(Util.isObject(undefined), false);
    });
  });

  describe('isPureObject', function()
  {
    it('should return true for plain object literals', function() {
      Assert.strictEqual(Util.isPureObject({}), true);
      Assert.strictEqual(Util.isPureObject({ a: 1 }), true);
    });

    it('should return false for class instances', function() {
      Assert.strictEqual(Util.isPureObject(new Map()), false);
      Assert.strictEqual(Util.isPureObject(new Date()), false);
    });

    it('should return falsy for null-prototype objects', function() {
      Assert(!Util.isPureObject(Object.create(null)));
    });

    it('should return false for arrays and primitives', function() {
      Assert.strictEqual(Util.isPureObject([]), false);
      Assert.strictEqual(Util.isPureObject('str'), false);
      Assert.strictEqual(Util.isPureObject(null), false);
    });
  });

  describe('isNullObject', function()
  {
    it('should return true for null-prototype objects', function() {
      Assert.strictEqual(Util.isNullObject(Object.create(null)), true);
    });

    it('should return false for regular objects', function() {
      Assert.strictEqual(Util.isNullObject({}), false);
    });

    it('should throw for null (Object.getPrototypeOf does not accept null)', function() {
      Assert.throws(() => Util.isNullObject(null), TypeError);
    });

    it('should return false for non-objects', function() {
      Assert.strictEqual(Util.isNullObject('string'), false);
      Assert.strictEqual(Util.isNullObject(42), false);
    });
  });

  describe('isDate', function()
  {
    it('should return true for valid Date objects', function() {
      Assert.strictEqual(Util.isDate(new Date()), true);
      Assert.strictEqual(Util.isDate(new Date('2024-01-01')), true);
    });

    it('should return false for invalid Date objects', function() {
      Assert.strictEqual(Util.isDate(new Date('invalid')), false);
    });

    it('should return false for non-Date values', function() {
      Assert.strictEqual(Util.isDate('2024-01-01'), false);
      Assert.strictEqual(Util.isDate(1234567890), false);
      Assert.strictEqual(Util.isDate(null), false);
      Assert.strictEqual(Util.isDate({}), false);
    });
  });

  describe('isPromise', function()
  {
    it('should return true for native Promises', function() {
      Assert.strictEqual(Util.isPromise(Promise.resolve()), true);
    });

    it('should return true for thenable objects', function() {
      Assert.strictEqual(Util.isPromise({ then: function() {} }), true);
    });

    it('should return false for non-promise objects', function() {
      Assert.strictEqual(Util.isPromise({}), false);
      Assert.strictEqual(Util.isPromise({ then: 'not a function' }), false);
    });

    it('should return false for primitives and arrays', function() {
      Assert.strictEqual(Util.isPromise('string'), false);
      Assert.strictEqual(Util.isPromise(42), false);
      Assert.strictEqual(Util.isPromise(null), false);
      Assert.strictEqual(Util.isPromise([]), false);
    });
  });

  describe('isArray', function()
  {
    it('should return true for arrays', function() {
      Assert.strictEqual(Util.isArray([]), true);
      Assert.strictEqual(Util.isArray([1, 2, 3]), true);
    });

    it('should return false for non-arrays', function() {
      Assert.strictEqual(Util.isArray({}), false);
      Assert.strictEqual(Util.isArray('string'), false);
      Assert.strictEqual(Util.isArray(null), false);
      Assert.strictEqual(Util.isArray(undefined), false);
    });
  });

  describe('isNumber', function()
  {
    it('should return true for numbers', function() {
      Assert.strictEqual(Util.isNumber(0), true);
      Assert.strictEqual(Util.isNumber(42), true);
      Assert.strictEqual(Util.isNumber(-1.5), true);
      Assert.strictEqual(Util.isNumber(NaN), true);
      Assert.strictEqual(Util.isNumber(Infinity), true);
    });

    it('should return false for non-numbers', function() {
      Assert.strictEqual(Util.isNumber('42'), false);
      Assert.strictEqual(Util.isNumber(null), false);
      Assert.strictEqual(Util.isNumber(undefined), false);
      Assert.strictEqual(Util.isNumber(true), false);
    });
  });

  describe('isBoolean', function()
  {
    it('should return true for booleans', function() {
      Assert.strictEqual(Util.isBoolean(true), true);
      Assert.strictEqual(Util.isBoolean(false), true);
    });

    it('should return false for non-booleans', function() {
      Assert.strictEqual(Util.isBoolean(0), false);
      Assert.strictEqual(Util.isBoolean(1), false);
      Assert.strictEqual(Util.isBoolean('true'), false);
      Assert.strictEqual(Util.isBoolean(null), false);
    });
  });

  describe('isString', function()
  {
    it('should return true for strings', function() {
      Assert.strictEqual(Util.isString(''), true);
      Assert.strictEqual(Util.isString('hello'), true);
      Assert.strictEqual(Util.isString(`template`), true);
    });

    it('should return false for non-strings', function() {
      Assert.strictEqual(Util.isString(42), false);
      Assert.strictEqual(Util.isString(null), false);
      Assert.strictEqual(Util.isString(undefined), false);
      Assert.strictEqual(Util.isString(true), false);
      Assert.strictEqual(Util.isString({}), false);
    });
  });

  describe('isMap', function()
  {
    it('should return true for Map instances', function() {
      Assert.strictEqual(Util.isMap(new Map()), true);
      Assert.strictEqual(Util.isMap(new Map([['a', 1]])), true);
    });

    it('should return false for non-Map values', function() {
      Assert.strictEqual(Util.isMap({}), false);
      Assert.strictEqual(Util.isMap([]), false);
      Assert.strictEqual(Util.isMap('string'), false);
      Assert.strictEqual(Util.isMap(null), false);
      Assert.strictEqual(Util.isMap(undefined), false);
    });
  });

  describe('isKey', function()
  {
    it('should return true for any string key with no allowed list', function() {
      Assert.strictEqual(Util.isKey('name'), true);
      Assert.strictEqual(Util.isKey(''), true);
    });

    it('should return true when key is in allowed list', function() {
      Assert.strictEqual(Util.isKey('name', ['name', 'age']), true);
    });

    it('should return false when key is not in allowed list', function() {
      Assert.strictEqual(Util.isKey('email', ['name', 'age']), false);
    });

    it('should return false for non-string keys', function() {
      Assert.strictEqual(Util.isKey(42), false);
      Assert.strictEqual(Util.isKey(null), false);
      Assert.strictEqual(Util.isKey(undefined), false);
    });
  });

  describe('isUuid', function()
  {
    it('should return true for valid UUID strings', function() {
      Assert.strictEqual(Util.isUuid('550e8400-e29b-41d4-a716-446655440000'), true);
      Assert.strictEqual(Util.isUuid('a-b-c-d-e'), true);
    });

    it('should return false for strings without 5 segments', function() {
      Assert.strictEqual(Util.isUuid('not-a-uuid'), false);
      Assert.strictEqual(Util.isUuid('a-b-c-d'), false);
      Assert.strictEqual(Util.isUuid('a-b-c-d-e-f'), false);
    });

    it('should return false for strings with empty segments', function() {
      Assert.strictEqual(Util.isUuid('a-b--d-e'), false);
    });

    it('should return false for non-strings', function() {
      Assert.strictEqual(Util.isUuid(12345), false);
      Assert.strictEqual(Util.isUuid(null), false);
    });
  });

  describe('isHex', function()
  {
    it('should return a Buffer for valid hex strings', function() {
      const result = Util.isHex('48656c6c6f');
      Assert(Buffer.isBuffer(result));
      Assert.strictEqual(result.toString('utf8'), 'Hello');
    });

    it('should return false for non-hex strings', function() {
      Assert.strictEqual(Util.isHex('xyz'), false);
    });

    it('should return false for non-strings', function() {
      Assert.strictEqual(Util.isHex(123), false);
      Assert.strictEqual(Util.isHex(null), false);
    });
  });

  describe('isBase64', function()
  {
    it('should return a Buffer for valid base64 strings', function() {
      const result = Util.isBase64('SGVsbG8=');
      Assert(Buffer.isBuffer(result));
      Assert.strictEqual(result.toString('utf8'), 'Hello');
    });

    it('should return false for non-base64 strings', function() {
      // Strings that don't round-trip through base64
      Assert.strictEqual(Util.isBase64('!!!'), false);
    });

    it('should return false for non-strings', function() {
      Assert.strictEqual(Util.isBase64(123), false);
      Assert.strictEqual(Util.isBase64(null), false);
    });
  });

  describe('isSHA', function()
  {
    it('should return undefined for hex SHA strings (base64 path takes priority)', function() {
      // Hex SHA strings are also valid base64, so isSHA decodes via base64
      // first, producing a buffer whose length doesn't match SHA byte-lengths.
      const sha1hex = 'da39a3ee5e6b4b0d3255bfef95601890afd80709';
      Assert.strictEqual(Util.isSHA(sha1hex), undefined);
    });

    it('should return a Buffer for valid SHA base64 input', function() {
      // 20-byte SHA-1 in base64 (28 chars with padding)
      const sha1buf = Buffer.alloc(20, 0xab);
      const sha1b64 = sha1buf.toString('base64');
      const result = Util.isSHA(sha1b64);
      Assert(Buffer.isBuffer(result));
      Assert.strictEqual(result.length, 20);
    });

    it('should return a Buffer for a valid SHA Buffer', function() {
      const buf = Buffer.alloc(32, 0xff);
      const result = Util.isSHA(buf);
      Assert(Buffer.isBuffer(result));
      Assert.strictEqual(result.length, 32);
    });

    it('should return undefined for non-SHA lengths', function() {
      Assert.strictEqual(Util.isSHA('aabbcc'), undefined);
    });

    it('should return undefined for non-string/non-buffer', function() {
      Assert.strictEqual(Util.isSHA(12345), undefined);
      Assert.strictEqual(Util.isSHA(null), undefined);
    });

    it('should return undefined for empty values', function() {
      Assert.strictEqual(Util.isSHA(''), undefined);
      Assert.strictEqual(Util.isSHA(Buffer.alloc(0)), undefined);
    });
  });

  // --- Conversion methods ---

  describe('objectToMap', function()
  {
    it('should convert a simple object to a Map', function() {
      const map = Util.objectToMap({ a: 1, b: 'two' });
      Assert(map instanceof Map);
      Assert.strictEqual(map.get('a'), 1);
      Assert.strictEqual(map.get('b'), 'two');
    });

    it('should recursively convert nested plain objects to Maps', function() {
      const map = Util.objectToMap({ a: { b: { c: 3 } } });
      Assert(map.get('a') instanceof Map);
      Assert(map.get('a').get('b') instanceof Map);
      Assert.strictEqual(map.get('a').get('b').get('c'), 3);
    });

    it('should preserve arrays as-is', function() {
      const map = Util.objectToMap({ arr: [1, 2, 3] });
      Assert(Array.isArray(map.get('arr')));
      Assert.deepStrictEqual(map.get('arr'), [1, 2, 3]);
    });

    it('should accept an existing Map to merge into', function() {
      const existing = new Map([['x', 10]]);
      const map = Util.objectToMap({ y: 20 }, existing);
      Assert.strictEqual(map, existing);
      Assert.strictEqual(map.get('x'), 10);
      Assert.strictEqual(map.get('y'), 20);
    });

    it('should throw TypeError for non-object input', function() {
      Assert.throws(() => Util.objectToMap('string'), TypeError);
      Assert.throws(() => Util.objectToMap(42), TypeError);
      Assert.throws(() => Util.objectToMap(null), TypeError);
    });
  });

  describe('mapToObject', function()
  {
    it('should convert a simple Map to an object', function() {
      const map = new Map([['a', 'hello'], ['b', 'world']]);
      const obj = Util.mapToObject(map);
      Assert.strictEqual(obj.a, 'hello');
      Assert.strictEqual(obj.b, 'world');
    });

    it('should recursively convert nested Maps', function() {
      const inner = new Map([['c', 'deep']]);
      const outer = new Map([['a', inner]]);
      const obj = Util.mapToObject(outer);
      Assert.deepStrictEqual(obj, { a: { c: 'deep' } });
    });

    it('should throw TypeError for non-Map input', function() {
      Assert.throws(() => Util.mapToObject({}), TypeError);
      Assert.throws(() => Util.mapToObject('string'), TypeError);
      Assert.throws(() => Util.mapToObject(null), TypeError);
    });
  });

  describe('deepCloneMap', function()
  {
    it('should create a deep clone of a simple Map', function() {
      const original = new Map([['a', 1], ['b', 'two']]);
      const clone = Util.deepCloneMap(original);
      Assert(clone instanceof Map);
      Assert.notStrictEqual(clone, original);
      Assert.strictEqual(clone.get('a'), 1);
      Assert.strictEqual(clone.get('b'), 'two');
    });

    it('should deeply clone nested Maps', function() {
      const inner = new Map([['x', 10]]);
      const original = new Map([['nested', inner]]);
      const clone = Util.deepCloneMap(original);

      Assert.notStrictEqual(clone.get('nested'), inner);
      Assert.strictEqual(clone.get('nested').get('x'), 10);

      // Mutating clone should not affect original
      clone.get('nested').set('x', 99);
      Assert.strictEqual(inner.get('x'), 10);
    });

    it('should clone arrays within Maps', function() {
      const original = new Map([['arr', [1, 2, 3]]]);
      const clone = Util.deepCloneMap(original);
      Assert.deepStrictEqual(clone.get('arr'), [1, 2, 3]);
      Assert.notStrictEqual(clone.get('arr'), original.get('arr'));
    });

    it('should handle null and undefined values', function() {
      const original = new Map([['n', null], ['u', undefined]]);
      const clone = Util.deepCloneMap(original);
      Assert.strictEqual(clone.get('n'), null);
      Assert.strictEqual(clone.get('u'), undefined);
    });
  });

  describe('deepCloneObject', function()
  {
    it('should return primitives as-is', function() {
      Assert.strictEqual(Util.deepCloneObject(null), null);
      Assert.strictEqual(Util.deepCloneObject(42), 42);
      Assert.strictEqual(Util.deepCloneObject('str'), 'str');
    });

    it('should deep clone plain objects', function() {
      const original = { a: 1, b: { c: 2 } };
      const clone = Util.deepCloneObject(original);
      Assert.deepStrictEqual(clone, original);
      Assert.notStrictEqual(clone, original);
      Assert.notStrictEqual(clone.b, original.b);
    });

    it('should deep clone arrays', function() {
      const original = [1, [2, 3], { a: 4 }];
      const clone = Util.deepCloneObject(original);
      Assert.deepStrictEqual(clone, original);
      Assert.notStrictEqual(clone, original);
      Assert.notStrictEqual(clone[1], original[1]);
    });

    it('should clone Date objects', function() {
      const original = new Date('2024-01-01');
      const clone = Util.deepCloneObject(original);
      Assert(clone instanceof Date);
      Assert.notStrictEqual(clone, original);
      Assert.strictEqual(clone.getTime(), original.getTime());
    });

    it('should clone RegExp objects', function() {
      const original = /test/gi;
      const clone = Util.deepCloneObject(original);
      Assert(clone instanceof RegExp);
      Assert.notStrictEqual(clone, original);
      Assert.strictEqual(clone.source, original.source);
      Assert.strictEqual(clone.flags, original.flags);
    });

    it('should clone Maps via deepCloneMap', function() {
      const original = new Map([['key', 'val']]);
      const clone = Util.deepCloneObject(original);
      Assert(clone instanceof Map);
      Assert.notStrictEqual(clone, original);
      Assert.strictEqual(clone.get('key'), 'val');
    });

    it('should clone Sets', function() {
      const original = new Set([1, 2, 3]);
      const clone = Util.deepCloneObject(original);
      Assert(clone instanceof Set);
      Assert.notStrictEqual(clone, original);
      Assert.strictEqual(clone.size, 3);
      Assert(clone.has(1));
    });
  });

  describe('typeof', function()
  {
    it('should return "string" for strings', function() {
      Assert.strictEqual(Util.typeof('hello'), 'string');
    });

    it('should return "number" for numbers', function() {
      Assert.strictEqual(Util.typeof(42), 'number');
    });

    it('should return "boolean" for booleans', function() {
      Assert.strictEqual(Util.typeof(true), 'boolean');
    });

    it('should return "undefined" for undefined', function() {
      Assert.strictEqual(Util.typeof(undefined), 'undefined');
    });

    it('should return "null" for null', function() {
      Assert.strictEqual(Util.typeof(null), 'null');
    });

    it('should return "buffer" for Buffers', function() {
      Assert.strictEqual(Util.typeof(Buffer.from('test')), 'buffer');
    });

    it('should return "map" for Maps', function() {
      Assert.strictEqual(Util.typeof(new Map()), 'map');
    });

    it('should return "array" for arrays', function() {
      Assert.strictEqual(Util.typeof([1, 2]), 'array');
    });

    it('should return "object" for plain objects', function() {
      Assert.strictEqual(Util.typeof({}), 'object');
    });

    it('should return "function" for functions', function() {
      Assert.strictEqual(Util.typeof(function() {}), 'function');
    });
  });

  // --- Stream methods ---

  describe('isStream', function()
  {
    it('should return true for a Readable stream', function() {
      Assert.strictEqual(Util.isStream(new Readable({ read() {} })), true);
    });

    it('should return true for a Writable stream', function() {
      Assert.strictEqual(Util.isStream(new Writable({ write(c, e, cb) { cb(); } })), true);
    });

    it('should return false for non-stream objects', function() {
      Assert.strictEqual(Util.isStream({}), false);
      Assert.strictEqual(Util.isStream('string'), false);
      Assert.strictEqual(Util.isStream(null), false);
    });
  });

  describe('isReadable', function()
  {
    it('should return true for Readable streams', function() {
      Assert.strictEqual(Util.isReadable(new Readable({ read() {} })), true);
    });

    it('should return true for PassThrough streams (readable + writable)', function() {
      Assert.strictEqual(Util.isReadable(new PassThrough()), true);
    });

    it('should return false for Writable-only streams', function() {
      const w = new Writable({ write(c, e, cb) { cb(); } });
      Assert.strictEqual(Util.isReadable(w), false);
    });

    it('should return false for non-streams', function() {
      Assert.strictEqual(Util.isReadable({}), false);
      Assert.strictEqual(Util.isReadable(null), false);
    });
  });

  describe('isWritable', function()
  {
    it('should return true for Writable streams', function() {
      Assert.strictEqual(Util.isWritable(new Writable({ write(c, e, cb) { cb(); } })), true);
    });

    it('should return true for PassThrough streams (readable + writable)', function() {
      Assert.strictEqual(Util.isWritable(new PassThrough()), true);
    });

    it('should return false for Readable-only streams', function() {
      const r = new Readable({ read() {} });
      Assert.strictEqual(Util.isWritable(r), false);
    });

    it('should return false for non-streams', function() {
      Assert.strictEqual(Util.isWritable({}), false);
      Assert.strictEqual(Util.isWritable(null), false);
    });
  });

  describe('streamToBuffer', function()
  {
    it('should collect stream data into a Buffer', function(done) {
      const stream = new PassThrough();
      Util.streamToBuffer(stream).then(function(buf) {
        Assert(Buffer.isBuffer(buf));
        Assert.strictEqual(buf.toString(), 'hello world');
        done();
      }).catch(done);

      stream.write(Buffer.from('hello '));
      stream.write(Buffer.from('world'));
      stream.end();
    });

    it('should return an empty Buffer for an empty stream', function(done) {
      const stream = new PassThrough();
      Util.streamToBuffer(stream).then(function(buf) {
        Assert(Buffer.isBuffer(buf));
        Assert.strictEqual(buf.length, 0);
        done();
      }).catch(done);

      stream.end();
    });

    it('should throw for non-readable input', function() {
      Assert.throws(() => Util.streamToBuffer({}), /not a stream/);
      Assert.throws(() => Util.streamToBuffer('string'), /not a stream/);
    });
  });

  // --- Utility methods ---

  describe('rand_string', function()
  {
    it('should return a string of the requested length', function() {
      Assert.strictEqual(Util.rand_string(8).length, 8);
      Assert.strictEqual(Util.rand_string(16).length, 16);
      Assert.strictEqual(Util.rand_string(1).length, 1);
    });

    it('should return an empty string for n <= 0', function() {
      Assert.strictEqual(Util.rand_string(0), '');
      Assert.strictEqual(Util.rand_string(-1), '');
    });

    it('should return a hex string', function() {
      const rs = Util.rand_string(10);
      Assert(/^[0-9a-f]+$/.test(rs));
    });

    it('should return different strings on successive calls', function() {
      const a = Util.rand_string(16);
      const b = Util.rand_string(16);
      Assert.notStrictEqual(a, b);
    });
  });

  describe('osConfigPath', function()
  {
    it('should return a path string for a valid name', function() {
      const result = Util.osConfigPath('testapp');
      Assert(typeof result === 'string');
      Assert(result.length > 0);
      Assert(result.includes('testapp'));
    });

    it('should accept an options object with name', function() {
      const result = Util.osConfigPath({ name: 'testapp' });
      Assert(typeof result === 'string');
      Assert(result.includes('testapp'));
    });

    it('should append filename when fn option is provided', function() {
      const result = Util.osConfigPath({ name: 'testapp', fn: 'config.ini' });
      Assert(result.endsWith('config.ini'));
    });

    it('should throw for names with dots', function() {
      Assert.throws(() => Util.osConfigPath('test.app'), /invalid opts.name/);
    });

    it('should throw for names with slashes', function() {
      Assert.throws(() => Util.osConfigPath('test/app'), /invalid opts.name/);
      Assert.throws(() => Util.osConfigPath('test\\app'), /invalid opts.name/);
    });

    it('should throw when no name is provided', function() {
      Assert.throws(() => Util.osConfigPath(), TypeError);
    });
  });

  describe('parse_system_path', function()
  {
    it('should parse a string path and ensure trailing separator', function() {
      const result = Util.parse_system_path('/foo/bar');
      Assert.strictEqual(result, '/foo/bar/');
    });

    it('should preserve trailing separator if already present', function() {
      const result = Util.parse_system_path('/foo/bar/');
      Assert.strictEqual(result, '/foo/bar/');
    });

    it('should accept an array of path segments', function() {
      const result = Util.parse_system_path(['', 'foo', 'bar']);
      Assert.strictEqual(result, '/foo/bar/');
    });

    it('should return undefined for non-string/non-array input', function() {
      Assert.strictEqual(Util.parse_system_path(42), undefined);
      Assert.strictEqual(Util.parse_system_path(null), undefined);
    });

    it('should throw for relative paths', function() {
      Assert.throws(() => Util.parse_system_path('foo/bar'), /dir must be absolute/);
    });

    it('should throw for arrays with non-string elements', function() {
      Assert.throws(() => Util.parse_system_path(['', 42, 'bar']), /invalid dir/);
    });
  });

  describe('parse_argv', function()
  {
    it('should return an object with script, name, and argv', function() {
      const result = Util.parse_argv();
      Assert(typeof result === 'object');
      Assert(typeof result.script === 'string');
      Assert(typeof result.name === 'string');
      Assert(Array.isArray(result.argv));
    });
  });
});
