const Assert = require('assert');

const Json = require('../json');
const Util = require('../util');

describe('Json', function()
{
  describe('encode', function()
  {
    let called, calledOptions;
    let origMapToObject;

    beforeEach( () => {
      called = 0;
      origMapToObject = Util.mapToObject;
      Util.mapToObject = function(...opts) {
        called++;
        calledOptions = opts;
        return origMapToObject(...opts);
      };
    });

    afterEach( () => {
      Util.mapToObject = origMapToObject;
    });

    it('should encode an object to a JSON string', function() {
      const map = new Map([['name','test'],['value',123]]);
      const result = Json.encode(map);
      Assert.equal(result,'{"name":"test","value":123}');
    });

    it('should handle Map objects by converting them to plain objects', function()
    {
      const map = new Map([['key1','value1'],['key2',42]]);
      const result = Json.encode(map);

      Assert(calledOptions[0] instanceof Map);
      Assert.equal(called,1);
      Assert.equal(result,'{"key1":"value1","key2":42}');
    });

    it('should handle nested structures', function()
    {
      const obj = {
        name: 'parent',
        children: [
          { name: 'child1' },
          { name: 'child2' }
        ],
        metadata: {
          created: '2023-01-01'
        }
      };
      const map = Util.objectToMap(obj);
      const result = Json.encode(map);

      Assert.deepEqual( JSON.parse(result), obj);
    });
  });

  describe('decode', function()
  {
    let called;
    let origObjectToMap;

    beforeEach( () => {
      called = 0;
      origObjectToMap = Util.objectToMap;
      Util.objectToMap = function(...opts) {
        called++;
        return origObjectToMap(...opts);
      };
    });

    afterEach( () => {
      Util.objectToMap = origObjectToMap;
    });

    it('should decode a JSON string to an object', function() {
      const jsonStr = '{"name":"test","value":123}';
      const result = Json.decode(jsonStr);
      
      // Since objectToMap is used internally, we expect a Map return type
      Assert(result instanceof Map);
      Assert.equal(result.get('name'),'test');
      Assert.equal(result.get('value'),123);
    });

    it('should handle Buffer input', function() {
      const buffer = Buffer.from('{"key":"value"}', 'utf8');
      const result = Json.decode(buffer);
      
      Assert(result instanceof Map);
      Assert.equal(result.get('key'),'value');
    });

    it('should convert objects to Maps', function()
    {
      const jsonStr = '{"a":1,"b":{"c":2}}';
      const result = Json.decode(jsonStr);

      Assert.equal(called,2);

      Assert(result instanceof Map);
      Assert.equal(result.get('a'),1);

      Assert(result.get('b') instanceof Map);
      Assert.equal(result.get('b').get('c'),2);
    });

    it('should throw an error for non-string/non-buffer input', function() {
      Assert.throws(() => Json.decode(123), /invalid string: 123/);
      Assert.throws(() => Json.decode(null), /invalid string: null/);
      Assert.throws(() => Json.decode(undefined), /invalid string: undefined/);
      Assert.throws(() => Json.decode({}), /invalid string: \[object Object\]/);
    });

    it('should throw an error for invalid JSON strings', function() {
      Assert.throws(() => Json.decode('{name:"invalid"}'));
      Assert.throws(() => Json.decode('{'));
    });
  });

  describe('round-trip encoding/decoding', function()
  {
    it('should correctly round-trip objects through encode and decode', function() {
      const original = {
        string: 'test',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        nested: {
          value: 'nested value'
        }
      };
      const origMap = Util.objectToMap(original);
      
      const encoded = Json.encode(origMap);
      const decoded = Json.decode(encoded);
      
      // Convert the Map back to an object for comparison
      const backToObj = Object.fromEntries(decoded);
      backToObj.nested = Object.fromEntries(backToObj.nested);
      
      Assert.deepEqual(backToObj, original);
    });

    it('should handle empty objects', function() {
      const original = {};
      const origMap = Util.objectToMap(original)
      const encoded = Json.encode(origMap);
      const decoded = Json.decode(encoded);
      
      Assert.equal(decoded.size,0);
      Assert.deepEqual( Object.fromEntries(decoded), original);
    });
  });
});
