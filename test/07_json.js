const { expect } = require('chai');
const Json = require('../json');
const Util = require('../util');
//const sinon = require('sinon');

describe('Json', function()
{
  describe('encode', function()
  {
    it('should encode an object to a JSON string', function() {
      const obj = { name: 'test', value: 123 };
      const result = Json.encode(obj);
      expect(result).to.equal('{"name":"test","value":123}');
    });

    it('should handle Map objects by converting them to plain objects', function() {
      const map = new Map();
      map.set('key1', 'value1');
      map.set('key2', 42);
      
      // Set up a spy to verify mapToObject is called
      const mapToObjectSpy = sinon.spy(Util, 'mapToObject');
      
      const result = Json.encode(map);
      
      expect(mapToObjectSpy.calledOnce).to.be.true;
      expect(mapToObjectSpy.calledWith(map)).to.be.true;
      expect(result).to.equal('{"key1":"value1","key2":42}');
      
      mapToObjectSpy.restore();
    });

    it('should handle nested structures', function() {
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
      
      const result = Json.encode(obj);
      expect(JSON.parse(result)).to.deep.equal(obj);
    });
  });

  describe('decode', function()
  {
    it('should decode a JSON string to an object', function() {
      const jsonStr = '{"name":"test","value":123}';
      const result = Json.decode(jsonStr);
      
      // Since objectToMap is used internally, we expect a Map return type
      expect(result).to.be.an.instanceOf(Map);
      expect(result.get('name')).to.equal('test');
      expect(result.get('value')).to.equal(123);
    });

    it('should handle Buffer input', function() {
      const buffer = Buffer.from('{"key":"value"}', 'utf8');
      const result = Json.decode(buffer);
      
      expect(result).to.be.an.instanceOf(Map);
      expect(result.get('key')).to.equal('value');
    });

    it('should convert objects to Maps', function() {
      const jsonStr = '{"a":1,"b":{"c":2}}';
      
      // Set up a spy to verify objectToMap is called
      const objectToMapSpy = sinon.spy(Util, 'objectToMap');
      
      const result = Json.decode(jsonStr);
      
      expect(objectToMapSpy.calledOnce).to.be.true;
      expect(result).to.be.an.instanceOf(Map);
      expect(result.get('a')).to.equal(1);
      expect(result.get('b')).to.be.an.instanceOf(Map);
      expect(result.get('b').get('c')).to.equal(2);
      
      objectToMapSpy.restore();
    });

    it('should throw an error for non-string/non-buffer input', function() {
      expect(() => Json.decode(123)).to.throw('invalid string: 123');
      expect(() => Json.decode(null)).to.throw('invalid string: null');
      expect(() => Json.decode(undefined)).to.throw('invalid string: undefined');
      expect(() => Json.decode({})).to.throw('invalid string: [object Object]');
    });

    it('should throw an error for invalid JSON strings', function() {
      expect(() => Json.decode('{name:"invalid"}')).to.throw();
      expect(() => Json.decode('{')).to.throw();
    });
  });

  describe('encode and decode integration', function()
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
      
      const encoded = Json.encode(original);
      const decoded = Json.decode(encoded);
      
      // Convert the Map back to an object for comparison
      const backToObj = Object.fromEntries(decoded);
      backToObj.nested = Object.fromEntries(backToObj.nested);
      
      expect(backToObj).to.deep.equal(original);
    });

    it('should handle empty objects', function() {
      const original = {};
      const encoded = Json.encode(original);
      const decoded = Json.decode(encoded);
      
      expect(decoded.size).to.equal(0);
      expect(Object.fromEntries(decoded)).to.deep.equal(original);
    });
  });

  // Test the whatever method if it has any functionality to test
  describe('whatever', function()
  {
    it('should exist as a method', function() {
      const json = new Json();
      expect(json.whatever).to.be.a('function');
    });
    
    // Add more tests if the method does something specific
  });
});
