const Assert = require('assert');
//const NodeOs = require('node:os');
//let os_platform = NodeOs.platform();

const Ini = require('../ini');
const Util = require('../util');

const platform = typeof process !== 'undefined' ? process.platform : null;
const eol = platform === 'win32' ? '\r\n' : '\n';

describe('Ini', function()
{

  describe('encode', function()
  {

    it('should encode a simple map to ini format', function()
    {
      const map = new Map([
        ['name', 'value'],
        ['foo', 'bar']
      ]);
      
      let actual = Ini.encode(map);
      let expected = ['name=value','foo=bar'].join(eol) + eol;
      Assert.strictEqual(actual,expected);
    });
    
    it('should handle whitespace option', function()
    {
      const map = new Map([
        ['name', 'value'],
        ['foo', 'bar']
      ]);
      
      let actual = Ini.encode(map, { whitespace: true });
      let expected = ['name = value','foo = bar'].join(eol) + eol;
      Assert.strictEqual(actual,expected);
    });
    
    it('should handle alignment option', function() {
      const map = new Map([
        ['short', 'value'],
        ['longer_key', 'bar']
      ]);
      
      let actual = Ini.encode(map, { align: true });
      let expected = ['short      = value','longer_key = bar'].join(eol) + eol;
      Assert.strictEqual(actual,expected);
    });
    
    it('should handle nested sections', function()
    {
      const nested = new Map();
      const subsection = new Map([
        ['key', 'value']
      ]);
      
      nested.set('section', subsection);
      
      let actual = Ini.encode(nested);
      let expected = ['[section]','key=value'].join(eol) + eol;
      Assert.strictEqual(actual,expected);
    });
    
    it('should handle array values', function()
    {
      const map = new Map([
        ['array', ['value1', 'value2', 'value3']]
      ]);
      
      let actual = Ini.encode(map);
      let expected = ['array[]=value1','array[]=value2','array[]=value3'].join(eol) + eol;
      Assert.strictEqual(actual,expected);
    });
    
    it('should handle array values with bracketedArray=false', function()
    {
      const map = new Map([
        ['array', ['value1', 'value2', 'value3']]
      ]);
      
      const result = Ini.encode(map, { bracketedArray: false });
      let expected = ['array=value1','array=value2','array=value3'].join(eol) + eol;
      Assert.strictEqual(result,expected);
    });
    
    it('should encode special characters properly', function()
    {
      const map = new Map([
        ['key with spaces', 'value with spaces'],
        ['quotes', '"quoted string"'],
        ['semicolon', 'text;with;semicolons'],
        ['hash', 'text#with#hash']
      ]);
      
      const result = Ini.encode(map);
      // Expect all keys and values to be properly escaped
      Assert(result.includes('"key with spaces"'));
      Assert(result.includes('quotes="quoted string"'));
      Assert(result.includes('semicolon=text\\;with\\;semicolons'));
      Assert(result.includes('hash=text\\#with\\#hash'));
    });
    
    it('should sort keys when sort option is true', function() {
      const map = new Map([
        ['c', 'cval'],
        ['a', 'aval'],
        ['b', 'bval']
      ]);
      
      const result = Ini.encode(map, { sort: true });
      let expected = ['a=aval','b=bval','c=cval'].join(eol) + eol;
      Assert.strictEqual(result,expected);
    });
    
    it('should throw an error with invalid input', function() {
      Assert.throws(() => {
        Ini.encode();
      }, Error);
      
      Assert.throws(() => {
        Ini.encode("not a map");
      }, Error);
    });
  });
  
  describe('decode', function()
  {
    it('should decode a simple ini string to a Map', function() {
      const ini = 'name=value\nfoo=bar';
      const result = Ini.decode(ini);
      
      Assert(result instanceof Map);
      Assert.strictEqual(result.get('name'), 'value');
      Assert.strictEqual(result.get('foo'), 'bar');
    });
    
    it('should handle sections', function() {
      const ini = '[section]\nkey=value';
      const result = Ini.decode(ini);
      
      Assert(result.has('section'));
      Assert(result.get('section') instanceof Map);
      Assert.strictEqual(result.get('section').get('key'), 'value');
    });
    
    it('should handle nested sections with spaces', function() {
      const ini = '[section subsection]\nkey=value';
      const result = Ini.decode(ini);
      
      Assert(result.has('section'));
      Assert(result.get('section') instanceof Map);
      Assert(result.get('section').has('subsection'));
      Assert(result.get('section').get('subsection') instanceof Map);
      Assert.strictEqual(result.get('section').get('subsection').get('key'), 'value');
    });
    
    it('should handle deeply nested sections', function() {
      const ini = '[a b c]\nkey=value';
      const result = Ini.decode(ini);
      
      Assert(result.has('a'));
      Assert(result.get('a').has('b'));
      Assert(result.get('a').get('b').has('c'));
      Assert.strictEqual(result.get('a').get('b').get('c').get('key'), 'value');
    });
    
    it('should handle array values with brackets', function() {
      const ini = 'array[]=value1\narray[]=value2';
      const result = Ini.decode(ini);
      
      Assert(Array.isArray(result.get('array')));
      Assert.deepStrictEqual(result.get('array'), ['value1', 'value2']);
    });
    
    it('should handle array values with duplicate keys when bracketedArray=false', function() {
      const ini = 'array=value1\narray=value2';
      const result = Ini.decode(ini, { bracketedArray: false });
      
      Assert(Array.isArray(result.get('array')));
      Assert.deepStrictEqual(result.get('array'), ['value1', 'value2']);
    });
    
    it('should handle comments', function() {
      const ini = 'key=value\n; comment line\n# another comment\nfoo=bar';
      const result = Ini.decode(ini);
      
      Assert.strictEqual(result.size, 2);
      Assert.strictEqual(result.get('key'), 'value');
      Assert.strictEqual(result.get('foo'), 'bar');
    });
    
    it('should handle empty lines', function() {
      const ini = 'key=value\n\n\nfoo=bar';
      const result = Ini.decode(ini);
      
      Assert.strictEqual(result.size, 2);
      Assert.strictEqual(result.get('key'), 'value');
      Assert.strictEqual(result.get('foo'), 'bar');
    });
    
    it('should convert string values to appropriate types', function() {
      const ini = 'null=null\ntrue=true\nfalse=false\nstring=string\nnumber=42';
      const result = Ini.decode(ini);
      
      Assert.strictEqual(result.get('null'), null);
      Assert.strictEqual(result.get('true'), true);
      Assert.strictEqual(result.get('false'), false);
      Assert.strictEqual(result.get('string'), 'string');
      // Note: strToType doesn't convert numbers, it would remain a string
      Assert.strictEqual(result.get('number'), '42');
    });
    
    it('should handle quoted values', function() {
      const ini = 'single=\'quoted value\'\ndouble="double quoted"';
      const result = Ini.decode(ini);
      
      Assert.strictEqual(result.get('single'), 'quoted value');
      Assert.strictEqual(result.get('double'), 'double quoted');
    });
    
    it('should handle escaped characters', function() {
      const ini = 'semi=value\\;with\\;semicolons\nhash=value\\#with\\#hash';
      const result = Ini.decode(ini);
      
      Assert.strictEqual(result.get('semi'), 'value;with;semicolons');
      Assert.strictEqual(result.get('hash'), 'value#with#hash');
    });
    
    it('should handle keys with equals in them', function() {
      const ini = '"key=with=equals"=value';
      const result = Ini.decode(ini);
      
      Assert.strictEqual(result.get('key=with=equals'), 'value');
    });
    
    it('should throw an error with invalid input', function() {
      Assert.throws(() => {
        Ini.decode(123);
      }, Error);
    });
    
    it('should return an empty map for empty input', function() {
      const result = Ini.decode('');
      Assert(result instanceof Map);
      Assert.strictEqual(result.size, 0);
    });
  });
  
  describe('round-trip encoding/decoding', function()
  {
    it('should preserve data through encode/decode cycle', function() {
      // Create a complex nested structure
      const original = new Map([
        ['name', 'value'],
        ['section', new Map([
          ['key1', 'value1'],
          ['key2', 'value2'],
          ['subsection', new Map([
            ['deepkey', 'deepvalue']
          ])]
        ])],
        ['array', ['item1', 'item2', 'item3']]
      ]);
      
      // Encode to ini
      const encoded = Ini.encode(original);
      
      // Decode back to map
      const decoded = Ini.decode(encoded);
      
      // Compare original and decoded
      Assert.strictEqual(decoded.get('name'), original.get('name'));
      Assert.deepStrictEqual(
        Util.mapToObject(decoded.get('section')), 
        Util.mapToObject(original.get('section'))
      );
      Assert.deepStrictEqual(decoded.get('array'), original.get('array'));
    });
  });
});