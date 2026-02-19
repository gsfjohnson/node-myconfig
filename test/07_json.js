const Assert = require('assert');

const Json = require('../json');
const Util = require('../util');

describe('Json', function()
{
  describe('encode', function()
  {
    it('should encode a simple Map to JSON', function() {
      const map = new Map([['name','test'],['value',123]]);
      const result = Json.encode(map);
      Assert.strictEqual(result, '{"name":"test","value":123}');
    });

    it('should encode nested Maps', function() {
      const inner = new Map([['c',2]]);
      const outer = new Map([['a',1],['b',inner]]);
      const result = Json.encode(outer);
      Assert.deepStrictEqual(JSON.parse(result), { a: 1, b: { c: 2 } });
    });

    it('should encode Maps with arrays', function() {
      const map = new Map([['items',[1,2,3]]]);
      const result = Json.encode(map);
      Assert.deepStrictEqual(JSON.parse(result), { items: [1,2,3] });
    });

    it('should encode Maps with various value types', function() {
      const map = new Map([
        ['str','hello'],
        ['num',42],
        ['bool',true],
        ['arr',[1,'two']]
      ]);
      const result = Json.encode(map);
      Assert.deepStrictEqual(JSON.parse(result), {
        str: 'hello', num: 42, bool: true, arr: [1,'two']
      });
    });

    it('should silently drop null values (mapToObject excludes them)', function() {
      const map = new Map([['a',1],['b',null],['c','ok']]);
      const result = JSON.parse(Json.encode(map));
      Assert.strictEqual(result.a, 1);
      Assert.strictEqual(result.c, 'ok');
      Assert.strictEqual(result.b, undefined);
    });

    it('should encode an empty Map', function() {
      const result = Json.encode(new Map());
      Assert.strictEqual(result, '{}');
    });

    it('should return a string', function() {
      const result = Json.encode(new Map([['k','v']]));
      Assert.strictEqual(typeof result, 'string');
    });
  });

  describe('decode', function()
  {
    it('should decode a JSON string to a Map', function() {
      const result = Json.decode('{"name":"test","value":123}');
      Assert(result instanceof Map);
      Assert.strictEqual(result.get('name'), 'test');
      Assert.strictEqual(result.get('value'), 123);
    });

    it('should decode Buffer input', function() {
      const buf = Buffer.from('{"key":"value"}', 'utf8');
      const result = Json.decode(buf);
      Assert(result instanceof Map);
      Assert.strictEqual(result.get('key'), 'value');
    });

    it('should convert nested objects to nested Maps', function() {
      const result = Json.decode('{"a":1,"b":{"c":2,"d":{"e":3}}}');
      Assert(result instanceof Map);
      Assert.strictEqual(result.get('a'), 1);

      const b = result.get('b');
      Assert(b instanceof Map);
      Assert.strictEqual(b.get('c'), 2);

      const d = b.get('d');
      Assert(d instanceof Map);
      Assert.strictEqual(d.get('e'), 3);
    });

    it('should preserve arrays in decoded output', function() {
      const result = Json.decode('{"items":[1,2,3]}');
      Assert(Array.isArray(result.get('items')));
      Assert.deepStrictEqual(result.get('items'), [1,2,3]);
    });

    it('should preserve various JSON value types', function() {
      const result = Json.decode('{"s":"hi","n":0,"b":false,"nil":null}');
      Assert.strictEqual(result.get('s'), 'hi');
      Assert.strictEqual(result.get('n'), 0);
      Assert.strictEqual(result.get('b'), false);
      Assert.strictEqual(result.get('nil'), null);
    });

    it('should decode an empty object', function() {
      const result = Json.decode('{}');
      Assert(result instanceof Map);
      Assert.strictEqual(result.size, 0);
    });

    it('should merge into a pre-existing Map via data parameter', function() {
      const existing = new Map([['x', 99], ['y', 'keep']]);
      const result = Json.decode('{"a":1,"x":"overwritten"}', existing);
      Assert.strictEqual(result, existing, 'should return the same Map instance');
      Assert.strictEqual(result.get('a'), 1);
      Assert.strictEqual(result.get('x'), 'overwritten');
      Assert.strictEqual(result.get('y'), 'keep');
    });

    it('should create a new Map when data parameter is not provided', function() {
      const result = Json.decode('{"a":1}');
      Assert(result instanceof Map);
      Assert.strictEqual(result.get('a'), 1);
    });

    it('should throw for non-string/non-buffer input', function() {
      Assert.throws(() => Json.decode(123), /invalid string/);
      Assert.throws(() => Json.decode(null), /invalid string/);
      Assert.throws(() => Json.decode(undefined), /invalid string/);
      Assert.throws(() => Json.decode({}), /invalid string/);
      Assert.throws(() => Json.decode([]), /invalid string/);
      Assert.throws(() => Json.decode(true), /invalid string/);
    });

    it('should throw for invalid JSON strings', function() {
      Assert.throws(() => Json.decode('{name:"invalid"}'));
      Assert.throws(() => Json.decode('{'));
      Assert.throws(() => Json.decode(''));
      Assert.throws(() => Json.decode('undefined'));
    });
  });

  describe('round-trip', function()
  {
    it('should round-trip a complex structure', function() {
      const original = {
        string: 'test',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        nested: { value: 'nested value' }
      };
      const map = Util.objectToMap(original);
      const decoded = Json.decode(Json.encode(map));
      const result = Util.mapToObject(decoded);
      Assert.deepStrictEqual(result, original);
    });

    it('should round-trip an empty Map', function() {
      const map = new Map();
      const decoded = Json.decode(Json.encode(map));
      Assert.strictEqual(decoded.size, 0);
    });

    it('should round-trip deeply nested Maps', function() {
      const deep = new Map([['level', new Map([['inner', new Map([['val', 42]])]])]]);
      const decoded = Json.decode(Json.encode(deep));
      Assert.strictEqual(decoded.get('level').get('inner').get('val'), 42);
    });

    it('should round-trip Maps with arrays containing objects', function() {
      const original = { items: [{ id: 1 }, { id: 2 }] };
      const map = Util.objectToMap(original);
      const decoded = Json.decode(Json.encode(map));
      const items = decoded.get('items');
      Assert(Array.isArray(items));
      Assert.strictEqual(items[0].id, 1);
      Assert.strictEqual(items[1].id, 2);
    });
  });
});
