const Assert = require('assert');

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
      Assert(result.includes('"key with spaces"'));
      Assert(result.includes('quotes="\\"quoted string\\""'));
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
      Assert.throws(() => Ini.encode(), Error);
      Assert.throws(() => Ini.encode("not a map"), Error);
      Assert.throws(() => Ini.encode(123), Error);
    });

    it('should handle newline option with sections', function() {
      const map = new Map([['key', 'value']]);
      const result = Ini.encode(map, { section: 'top', newline: true });
      // newline option adds double eol after section header
      Assert(result.includes('[top]' + eol + eol));
    });

    it('should handle section option directly', function() {
      const map = new Map([['key', 'value']]);
      const result = Ini.encode(map, { section: 'mysection' });
      let expected = ['[mysection]','key=value'].join(eol) + eol;
      Assert.strictEqual(result, expected);
    });

    it('should handle platform option for line endings', function() {
      const map = new Map([['a', '1'], ['b', '2']]);
      const win = Ini.encode(map, { platform: 'win32' });
      Assert(win.includes('\r\n'), 'win32 should use CRLF');

      const unix = Ini.encode(map, { platform: 'linux' });
      Assert(!unix.includes('\r\n'), 'linux should use LF');
      Assert(unix.includes('\n'));
    });

    it('should skip null values (mapToObject excludes them)', function() {
      const map = new Map([['key', null], ['ok', 'val']]);
      const result = Ini.encode(map);
      Assert(!result.includes('key='), 'null values should not appear in output');
      Assert(result.includes('ok=val'));
    });

    it('should encode boolean values', function() {
      const map = new Map([['t', true], ['f', false]]);
      const result = Ini.encode(map);
      Assert(result.includes('t=true'));
      Assert(result.includes('f=false'));
    });

    it('should return empty string for empty map', function() {
      const map = new Map();
      const result = Ini.encode(map);
      Assert.strictEqual(result, '');
    });

    it('should sort sections after non-section keys', function() {
      const map = new Map([
        ['section', new Map([['sk', 'sv']])],
        ['top', 'val']
      ]);
      const result = Ini.encode(map);
      // Top-level keys come before sections
      const topIdx = result.indexOf('top=val');
      const secIdx = result.indexOf('[section]');
      Assert(topIdx < secIdx, 'top-level keys should precede sections');
    });

    it('should handle alignment with arrays and sections mixed', function() {
      const map = new Map([
        ['x', '1'],
        ['longname', ['a', 'b']],
        ['sub', new Map([['nested', 'val']])]
      ]);
      const result = Ini.encode(map, { align: true });
      // alignment should pad keys; sections excluded from alignment
      Assert(result.includes('[sub]'));
      Assert(result.includes('nested'));
    });

    it('should encode values starting with [ as quoted', function() {
      const map = new Map([['key', '[bracket]']]);
      const result = Ini.encode(map);
      // safe() quotes values starting with [
      Assert(result.includes('"[bracket]"'));
    });

    it('should encode values with leading/trailing whitespace as quoted', function() {
      const map = new Map([['key', '  padded  ']]);
      const result = Ini.encode(map);
      Assert(result.includes('"  padded  "'));
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
      Assert.throws(() => Ini.decode(123), Error);
      Assert.throws(() => Ini.decode(null), Error);
      Assert.throws(() => Ini.decode(undefined), Error);
    });

    it('should return an empty map for empty input', function() {
      const result = Ini.decode('');
      Assert(result instanceof Map);
      Assert.strictEqual(result.size, 0);
    });

    it('should treat key without value as true', function() {
      const ini = 'flag_only';
      const result = Ini.decode(ini);
      Assert.strictEqual(result.get('flag_only'), true);
    });

    it('should merge into a pre-existing Map', function() {
      const existing = new Map([['existing', 'data']]);
      const ini = 'newkey=newval';
      const result = Ini.decode(ini, existing);
      Assert.strictEqual(result.get('existing'), 'data');
      Assert.strictEqual(result.get('newkey'), 'newval');
      Assert(result === existing, 'should return the same Map instance');
    });

    it('should handle CRLF line endings', function() {
      const ini = 'a=1\r\nb=2\r\n';
      const result = Ini.decode(ini);
      Assert.strictEqual(result.get('a'), '1');
      Assert.strictEqual(result.get('b'), '2');
    });

    it('should handle inline comments in values', function() {
      const ini = 'key=value ;inline comment\nkey2=value #hash comment';
      const result = Ini.decode(ini);
      Assert.strictEqual(result.get('key'), 'value');
      Assert.strictEqual(result.get('key2'), 'value');
    });

    it('should handle whitespace around keys and values', function() {
      const ini = '  key  =  value  ';
      const result = Ini.decode(ini);
      // unsafe() trims values; key matching trims via unsafe
      Assert.strictEqual(result.get('key'), 'value');
    });

    it('should handle multiple sections', function() {
      const ini = '[sec1]\na=1\n[sec2]\nb=2';
      const result = Ini.decode(ini);
      Assert.strictEqual(result.get('sec1').get('a'), '1');
      Assert.strictEqual(result.get('sec2').get('b'), '2');
    });

    it('should handle keys and sections together', function() {
      const ini = 'top=level\n[sec]\ninner=val';
      const result = Ini.decode(ini);
      Assert.strictEqual(result.get('top'), 'level');
      Assert.strictEqual(result.get('sec').get('inner'), 'val');
    });

    it('should handle duplicate bracketed array into section', function() {
      const ini = '[sec]\narr[]=one\narr[]=two';
      const result = Ini.decode(ini);
      Assert.deepStrictEqual(result.get('sec').get('arr'), ['one', 'two']);
    });

    it('should handle escaped backslash in values', function() {
      const ini = 'key=value\\\\end';
      const result = Ini.decode(ini);
      // \\ in ini is an escaped backslash, decoded to single backslash
      Assert.strictEqual(result.get('key'), 'value\\end');
    });

    it('should handle trailing backslash in values', function() {
      const ini = 'key=value\\';
      const result = Ini.decode(ini);
      // trailing escape with no following char appends backslash
      Assert.strictEqual(result.get('key'), 'value\\');
    });
  });

  describe('splitSections', function()
  {
    it('should handle multi-word section keys via encode', function() {
      // splitSections is used during encode to rejoin section key parts
      const map = new Map([
        ['parent', new Map([
          ['child', new Map([['key', 'val']])]
        ])]
      ]);
      const result = Ini.encode(map);
      // nested sections get space-separated headers; safe() quotes names with spaces
      Assert(result.includes('["parent child"]'));
      Assert(result.includes('key=val'));
    });

    it('should round-trip nested sections through encode/decode', function() {
      const map = new Map([
        ['top', new Map([
          ['mid', new Map([['deep', 'value']])]
        ])]
      ]);
      const decoded = Ini.decode(Ini.encode(map));
      Assert.strictEqual(decoded.get('top').get('mid').get('deep'), 'value');
    });
  });

  describe('round-trip encoding/decoding', function()
  {
    it('should preserve data through encode/decode cycle', function() {
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

      const encoded = Ini.encode(original);
      const decoded = Ini.decode(encoded);

      Assert.strictEqual(decoded.get('name'), original.get('name'));
      Assert.deepStrictEqual(
        Util.mapToObject(decoded.get('section')),
        Util.mapToObject(original.get('section'))
      );
      Assert.deepStrictEqual(decoded.get('array'), original.get('array'));
    });

    it('should preserve boolean values through round-trip', function() {
      const original = new Map([
        ['t', true],
        ['f', false]
      ]);
      const decoded = Ini.decode(Ini.encode(original));
      Assert.strictEqual(decoded.get('t'), true);
      Assert.strictEqual(decoded.get('f'), false);
    });

    it('should preserve special characters through round-trip', function() {
      const original = new Map([
        ['semi', 'a;b;c'],
        ['hash', 'x#y#z']
      ]);
      const decoded = Ini.decode(Ini.encode(original));
      Assert.strictEqual(decoded.get('semi'), 'a;b;c');
      Assert.strictEqual(decoded.get('hash'), 'x#y#z');
    });

    it('should preserve platform-specific line endings through round-trip', function() {
      const original = new Map([['a', '1'], ['b', '2']]);
      const encoded = Ini.encode(original, { platform: 'win32' });
      const decoded = Ini.decode(encoded);
      Assert.strictEqual(decoded.get('a'), '1');
      Assert.strictEqual(decoded.get('b'), '2');
    });
  });
});
