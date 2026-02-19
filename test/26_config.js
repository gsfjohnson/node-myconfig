
const NodePath = require('path');
const NodeOs = require('os');
const NodeFs = require('fs');
const Assert = require('assert');

const MyConfig = require('../index');
const Util = require('../util');

const tmpdir = NodeOs.tmpdir();

describe('MyConfig (comprehensive)', function()
{

  // ── constructor ───────────────────────────────────────────────────

  describe('constructor', () =>
  {
    it('new MyConfig("app") --> instanceof MyConfig', function()
    {
      const cfg = new MyConfig('app');
      Assert.strictEqual(cfg instanceof MyConfig, true);
      Assert.strictEqual(cfg.name, 'app');
      Assert.strictEqual(cfg.data instanceof Map, true);
      Assert.strictEqual(cfg.data.size, 0);
    });

    it('constructor with Map data', function()
    {
      const data = new Map([['x', 1], ['y', 2]]);
      const cfg = new MyConfig('app', data);
      Assert.strictEqual(cfg instanceof MyConfig, true);
      Assert.strictEqual(cfg.data.get('x'), 1);
      Assert.strictEqual(cfg.data.get('y'), 2);
    });

    it('constructor with Map -- deep clones the data', function()
    {
      const inner = new Map([['deep', 'val']]);
      const data = new Map([['nested', inner]]);
      const cfg = new MyConfig('app', data);
      // mutate original -- cfg should be unaffected
      inner.set('deep', 'changed');
      Assert.strictEqual(cfg.data.get('nested').get('deep'), 'val');
    });

    it('constructor with empty Map', function()
    {
      const data = new Map();
      const cfg = new MyConfig('app', data);
      Assert.strictEqual(cfg.data.size, 0);
      // empty Map is assigned directly, not cloned
      Assert.strictEqual(cfg.data, data);
    });

    it('constructor with options object { name }', function()
    {
      const cfg = new MyConfig({ name: 'myapp' });
      Assert.strictEqual(cfg.name, 'myapp');
    });

    it('constructor with options object { name, dir }', function()
    {
      const cfg = new MyConfig({ name: 'myapp', dir: '/tmp/custom' });
      Assert.strictEqual(cfg.name, 'myapp');
      Assert.strictEqual(cfg.dir, '/tmp/custom');
    });

    it('constructor with options object { name, data }', function()
    {
      const data = new Map([['k', 'v']]);
      const cfg = new MyConfig({ name: 'myapp', data });
      Assert.strictEqual(cfg.data.get('k'), 'v');
    });

    it('constructor with string name + Map data', function()
    {
      const data = new Map([['a', 'b']]);
      const cfg = new MyConfig('app', data);
      Assert.strictEqual(cfg.name, 'app');
      Assert.strictEqual(cfg.data.get('a'), 'b');
    });

    it('constructor throws on missing name', function()
    {
      Assert.throws(() => new MyConfig(), { message: /invalid name/ });
    });

    it('constructor throws on non-string name', function()
    {
      Assert.throws(() => new MyConfig(123), { name: 'TypeError' });
    });

    it('constructor throws on invalid option type (array)', function()
    {
      Assert.throws(() => new MyConfig([1,2,3]), { name: 'TypeError' });
    });

    it('constructor throws on invalid option type (boolean)', function()
    {
      Assert.throws(() => new MyConfig(true), { name: 'TypeError' });
    });

    it('object is frozen after construction', function()
    {
      const cfg = new MyConfig('app');
      Assert.strictEqual(Object.isFrozen(cfg), true);
    });

    it('has an id property starting with mycfg_', function()
    {
      const cfg = new MyConfig('app');
      Assert.strictEqual(typeof cfg.id, 'string');
      Assert.strictEqual(cfg.id.startsWith('mycfg_'), true);
    });
  });

  // ── set ───────────────────────────────────────────────────────────

  describe('set', () =>
  {
    let cfg;
    beforeEach(() => { cfg = new MyConfig('app'); });

    it('set simple key --> true', function()
    {
      Assert.strictEqual(cfg.set('key', 'val'), true);
    });

    it('set stores the value retrievable by get', function()
    {
      cfg.set('color', 'red');
      Assert.strictEqual(cfg.get('color'), 'red');
    });

    it('set dotted key "a.b" creates nested Maps', function()
    {
      cfg.set('a.b', 'deep');
      const a = cfg.data.get('a');
      Assert.strictEqual(a instanceof Map, true);
      Assert.strictEqual(a.get('b'), 'deep');
    });

    it('set dotted key "a.b.c" creates deeply nested Maps', function()
    {
      cfg.set('a.b.c', 42);
      const a = cfg.data.get('a');
      Assert.strictEqual(a instanceof Map, true);
      const b = a.get('b');
      Assert.strictEqual(b instanceof Map, true);
      Assert.strictEqual(b.get('c'), 42);
    });

    it('set dotted key preserves existing sibling keys', function()
    {
      cfg.set('a.x', 1);
      cfg.set('a.y', 2);
      Assert.strictEqual(cfg.data.get('a').get('x'), 1);
      Assert.strictEqual(cfg.data.get('a').get('y'), 2);
    });

    it('set overwrites non-Map intermediate with new Map', function()
    {
      cfg.set('a', 'scalar');
      cfg.set('a.b', 'deep');
      Assert.strictEqual(cfg.data.get('a') instanceof Map, true);
      Assert.strictEqual(cfg.data.get('a').get('b'), 'deep');
    });

    it('set increments dirty count', function()
    {
      Assert.strictEqual(cfg.dirty, 0);
      cfg.set('k1', 'v1');
      Assert.strictEqual(cfg.dirty, 1);
      cfg.set('k2', 'v2');
      Assert.strictEqual(cfg.dirty, 2);
    });

    it('set throws on non-string key', function()
    {
      Assert.throws(() => cfg.set(123, 'val'), { message: /invalid key/ });
    });

    it('set throws on null key', function()
    {
      Assert.throws(() => cfg.set(null, 'val'), { message: /invalid key/ });
    });

    it('set throws on undefined key', function()
    {
      Assert.throws(() => cfg.set(undefined, 'val'), { message: /invalid key/ });
    });
  });

  // ── get ───────────────────────────────────────────────────────────

  describe('get', () =>
  {
    let cfg;
    beforeEach(() => {
      cfg = new MyConfig('app');
      cfg.set('simple', 'hello');
      cfg.set('a.b.c', 'deep');
    });

    it('get simple key', function()
    {
      Assert.strictEqual(cfg.get('simple'), 'hello');
    });

    it('get dotted key "a.b.c"', function()
    {
      Assert.strictEqual(cfg.get('a.b.c'), 'deep');
    });

    it('get intermediate dotted key "a.b" returns deep-cloned Map', function()
    {
      const result = cfg.get('a.b');
      Assert.strictEqual(result instanceof Map, true);
      Assert.strictEqual(result.get('c'), 'deep');
    });

    it('get returns deep clone -- mutation does not affect config', function()
    {
      const result = cfg.get('a.b');
      result.set('c', 'mutated');
      Assert.strictEqual(cfg.get('a.b.c'), 'deep');
    });

    it('get non-existent key returns undefined', function()
    {
      Assert.strictEqual(cfg.get('nope'), undefined);
    });

    it('get non-existent dotted key returns undefined', function()
    {
      Assert.strictEqual(cfg.get('x.y.z'), undefined);
    });

    it('get past leaf returns undefined', function()
    {
      // get("a.b.c.d") where a.b.c="deep" -- path not fully resolved
      Assert.strictEqual(cfg.get('a.b.c.d'), undefined);
    });

    it('get throws on non-string key', function()
    {
      Assert.throws(() => cfg.get(123), { message: /invalid parameter/ });
    });

    it('get throws on null key', function()
    {
      Assert.throws(() => cfg.get(null), { message: /invalid parameter/ });
    });
  });

  // ── delete ────────────────────────────────────────────────────────

  describe('delete', () =>
  {
    let cfg;
    beforeEach(() => {
      cfg = new MyConfig('app');
      cfg.set('simple', 'hello');
      cfg.set('a.b.c', 'deep');
    });

    it('delete existing simple key --> true', function()
    {
      Assert.strictEqual(cfg.delete('simple'), true);
    });

    it('deleted key returns undefined on get', function()
    {
      cfg.delete('simple');
      Assert.strictEqual(cfg.get('simple'), undefined);
    });

    it('delete non-existent key --> false', function()
    {
      Assert.strictEqual(cfg.delete('nonexistent'), false);
    });

    it('delete dotted key "a.b.c" --> true', function()
    {
      Assert.strictEqual(cfg.delete('a.b.c'), true);
      Assert.strictEqual(cfg.get('a.b.c'), undefined);
    });

    it('delete non-existent dotted key --> false', function()
    {
      Assert.strictEqual(cfg.delete('x.y.z'), false);
    });

    it('delete partially-existent dotted key --> false', function()
    {
      Assert.strictEqual(cfg.delete('a.b.c.d.e'), false);
    });

    it('delete with leading dot ".simple" works', function()
    {
      Assert.strictEqual(cfg.delete('.simple'), true);
      Assert.strictEqual(cfg.get('simple'), undefined);
    });

    it('delete throws on non-string key', function()
    {
      Assert.throws(() => cfg.delete(123), { message: /invalid key/ });
    });

    it('delete throws on null key', function()
    {
      Assert.throws(() => cfg.delete(null), { message: /invalid key/ });
    });
  });

  // ── dirty ─────────────────────────────────────────────────────────

  describe('dirty', () =>
  {
    it('dirty is 0 on new config', function()
    {
      const cfg = new MyConfig('app');
      Assert.strictEqual(cfg.dirty, 0);
    });

    it('dirty increments with set()', function()
    {
      const cfg = new MyConfig('app');
      cfg.set('a', 1);
      Assert.strictEqual(cfg.dirty, 1);
      cfg.set('b', 2);
      Assert.strictEqual(cfg.dirty, 2);
    });

    it('dirty resets to 0 when set to null', function()
    {
      const cfg = new MyConfig('app');
      cfg.set('a', 1);
      cfg.dirty = null;
      Assert.strictEqual(cfg.dirty, 0);
    });

    it('dirty setter accepts array', function()
    {
      const cfg = new MyConfig('app');
      cfg.dirty = ['a', 'b', 'c'];
      Assert.strictEqual(cfg.dirty, 3);
    });

    it('dirty setter throws on invalid parameter (number)', function()
    {
      const cfg = new MyConfig('app');
      Assert.throws(() => { cfg.dirty = 42; }, { message: /invalid parameter/ });
    });

    it('dirty setter throws on invalid parameter (object)', function()
    {
      const cfg = new MyConfig('app');
      Assert.throws(() => { cfg.dirty = {}; }, { message: /invalid parameter/ });
    });
  });

  // ── static setDirty ───────────────────────────────────────────────

  describe('static setDirty', () =>
  {
    it('pushes key into array', function()
    {
      const arr = [];
      MyConfig.setDirty(arr, 'key1');
      Assert.deepStrictEqual(arr, ['key1']);
    });

    it('does not add duplicate key', function()
    {
      const arr = ['key1'];
      MyConfig.setDirty(arr, 'key1');
      Assert.deepStrictEqual(arr, ['key1']);
    });

    it('returns undefined for non-array first argument', function()
    {
      const result = MyConfig.setDirty('not-array', 'key');
      Assert.strictEqual(result, undefined);
    });

    it('returns undefined for null first argument', function()
    {
      const result = MyConfig.setDirty(null, 'key');
      Assert.strictEqual(result, undefined);
    });
  });

  // ── save (async) ──────────────────────────────────────────────────

  describe('save', () =>
  {
    const iniFile = NodePath.join(tmpdir, 'myconfig_test_save.ini');
    const jsonFile = NodePath.join(tmpdir, 'myconfig_test_save.json');
    const badFile = NodePath.join(tmpdir, 'myconfig_test_save.yaml');

    afterEach(() => {
      try { NodeFs.unlinkSync(iniFile); } catch(e) {}
      try { NodeFs.unlinkSync(jsonFile); } catch(e) {}
    });

    it('save to INI file --> true', async function()
    {
      const cfg = new MyConfig('app');
      cfg.set('key', 'value');
      const result = await cfg.save(iniFile);
      Assert.strictEqual(result, true);
    });

    it('save to INI file writes correct content', async function()
    {
      const cfg = new MyConfig('app');
      cfg.set('greeting', 'hello');
      await cfg.save(iniFile);
      const content = NodeFs.readFileSync(iniFile, 'utf8');
      Assert.ok(content.includes('greeting'));
      Assert.ok(content.includes('hello'));
    });

    it('save to JSON file --> true', async function()
    {
      const cfg = new MyConfig('app');
      cfg.set('key', 'value');
      const result = await cfg.save(jsonFile);
      Assert.strictEqual(result, true);
    });

    it('save to JSON file writes valid JSON', async function()
    {
      const cfg = new MyConfig('app');
      cfg.set('answer', '42');
      await cfg.save(jsonFile);
      const content = NodeFs.readFileSync(jsonFile, 'utf8');
      const parsed = JSON.parse(content);
      Assert.strictEqual(parsed.answer, '42');
    });

    it('save with empty data writes empty string', async function()
    {
      const cfg = new MyConfig('app');
      await cfg.save(iniFile);
      const content = NodeFs.readFileSync(iniFile, 'utf8');
      Assert.strictEqual(content, '');
    });

    it('save resets dirty to 0', async function()
    {
      const cfg = new MyConfig('app');
      cfg.set('k', 'v');
      Assert.strictEqual(cfg.dirty, 1);
      await cfg.save(iniFile);
      Assert.strictEqual(cfg.dirty, 0);
    });

    it('save throws on unsupported extension', async function()
    {
      const cfg = new MyConfig('app');
      cfg.set('k', 'v');
      await Assert.rejects(() => cfg.save(badFile), { message: /only ini\/json supported/ });
    });
  });

  // ── saveSync ──────────────────────────────────────────────────────

  describe('saveSync', () =>
  {
    const iniFile = NodePath.join(tmpdir, 'myconfig_test_saveSync.ini');
    const jsonFile = NodePath.join(tmpdir, 'myconfig_test_saveSync.json');
    const badFile = NodePath.join(tmpdir, 'myconfig_test_saveSync.yaml');

    afterEach(() => {
      try { NodeFs.unlinkSync(iniFile); } catch(e) {}
      try { NodeFs.unlinkSync(jsonFile); } catch(e) {}
    });

    it('saveSync to INI file --> true', function()
    {
      const cfg = new MyConfig('app');
      cfg.set('key', 'val');
      Assert.strictEqual(cfg.saveSync(iniFile), true);
    });

    it('saveSync to INI file writes correct content', function()
    {
      const cfg = new MyConfig('app');
      cfg.set('color', 'blue');
      cfg.saveSync(iniFile);
      const content = NodeFs.readFileSync(iniFile, 'utf8');
      Assert.ok(content.includes('color'));
      Assert.ok(content.includes('blue'));
    });

    it('saveSync to JSON file --> true', function()
    {
      const cfg = new MyConfig('app');
      cfg.set('key', 'val');
      Assert.strictEqual(cfg.saveSync(jsonFile), true);
    });

    it('saveSync to JSON file writes valid JSON', function()
    {
      const cfg = new MyConfig('app');
      cfg.set('fruit', 'apple');
      cfg.saveSync(jsonFile);
      const content = NodeFs.readFileSync(jsonFile, 'utf8');
      const parsed = JSON.parse(content);
      Assert.strictEqual(parsed.fruit, 'apple');
    });

    it('saveSync with empty data writes empty string', function()
    {
      const cfg = new MyConfig('app');
      cfg.saveSync(iniFile);
      const content = NodeFs.readFileSync(iniFile, 'utf8');
      Assert.strictEqual(content, '');
    });

    it('saveSync resets dirty to 0', function()
    {
      const cfg = new MyConfig('app');
      cfg.set('k', 'v');
      Assert.strictEqual(cfg.dirty, 1);
      cfg.saveSync(iniFile);
      Assert.strictEqual(cfg.dirty, 0);
    });

    it('saveSync throws on unsupported extension', function()
    {
      const cfg = new MyConfig('app');
      cfg.set('k', 'v');
      Assert.throws(() => cfg.saveSync(badFile), { message: /only ini\/json supported/ });
    });
  });

  // ── static load (async) ───────────────────────────────────────────

  describe('static load', () =>
  {
    const iniFile = NodePath.join(tmpdir, 'myconfig_test_load.ini');
    const jsonFile = NodePath.join(tmpdir, 'myconfig_test_load.json');

    before(() => {
      NodeFs.writeFileSync(iniFile, 'greeting=hello\nanswer=42\n', 'utf8');
      NodeFs.writeFileSync(jsonFile, '{"greeting":"hello","answer":"42"}', 'utf8');
    });

    after(() => {
      try { NodeFs.unlinkSync(iniFile); } catch(e) {}
      try { NodeFs.unlinkSync(jsonFile); } catch(e) {}
    });

    it('load INI file --> instanceof MyConfig', async function()
    {
      const cfg = await MyConfig.load('testapp', iniFile);
      Assert.strictEqual(cfg instanceof MyConfig, true);
    });

    it('load INI file reads correct data', async function()
    {
      const cfg = await MyConfig.load('testapp', iniFile);
      Assert.strictEqual(cfg.get('greeting'), 'hello');
      Assert.strictEqual(cfg.get('answer'), '42');
    });

    it('load JSON file --> instanceof MyConfig', async function()
    {
      const cfg = await MyConfig.load('testapp', jsonFile);
      Assert.strictEqual(cfg instanceof MyConfig, true);
    });

    it('load JSON file reads correct data', async function()
    {
      const cfg = await MyConfig.load('testapp', jsonFile);
      Assert.strictEqual(cfg.get('greeting'), 'hello');
      Assert.strictEqual(cfg.get('answer'), '42');
    });

    it('load sets name on returned config', async function()
    {
      const cfg = await MyConfig.load('testapp', iniFile);
      Assert.strictEqual(cfg.name, 'testapp');
    });

    it('load with ignore_not_found=true on missing file --> empty config', async function()
    {
      const missing = NodePath.join(tmpdir, 'nonexistent_test.ini');
      const cfg = await MyConfig.load('testapp', missing, true);
      Assert.strictEqual(cfg instanceof MyConfig, true);
      Assert.strictEqual(cfg.data.size, 0);
    });

    it('load without ignore_not_found throws on missing file', async function()
    {
      const missing = NodePath.join(tmpdir, 'nonexistent_test.ini');
      await Assert.rejects(() => MyConfig.load('testapp', missing), { code: 'ENOENT' });
    });

    it('load throws on missing name', async function()
    {
      await Assert.rejects(() => MyConfig.load(iniFile), { message: /invalid opts.name/ });
    });

    it('load throws on name with dot', async function()
    {
      await Assert.rejects(() => MyConfig.load('bad.name', iniFile), { message: /punctuation not allowed/ });
    });

    it('load throws on name with forward slash', async function()
    {
      await Assert.rejects(() => MyConfig.load('bad/name', iniFile), { message: /slash not allowed/ });
    });

    it('load throws on name with backslash', async function()
    {
      await Assert.rejects(() => MyConfig.load('bad\\name', iniFile), { message: /slash not allowed/ });
    });

    it('load throws on invalid option type', async function()
    {
      await Assert.rejects(() => MyConfig.load('testapp', 123), { message: /invalid option/ });
    });
  });

  // ── static loadSync ───────────────────────────────────────────────

  describe('static loadSync', () =>
  {
    const iniFile = NodePath.join(tmpdir, 'myconfig_test_loadSync.ini');
    const jsonFile = NodePath.join(tmpdir, 'myconfig_test_loadSync.json');

    before(() => {
      NodeFs.writeFileSync(iniFile, 'color=red\nsize=large\n', 'utf8');
      NodeFs.writeFileSync(jsonFile, '{"color":"red","size":"large"}', 'utf8');
    });

    after(() => {
      try { NodeFs.unlinkSync(iniFile); } catch(e) {}
      try { NodeFs.unlinkSync(jsonFile); } catch(e) {}
    });

    it('loadSync INI file --> instanceof MyConfig', function()
    {
      const cfg = MyConfig.loadSync('testapp', iniFile);
      Assert.strictEqual(cfg instanceof MyConfig, true);
    });

    it('loadSync INI file reads correct data', function()
    {
      const cfg = MyConfig.loadSync('testapp', iniFile);
      Assert.strictEqual(cfg.get('color'), 'red');
      Assert.strictEqual(cfg.get('size'), 'large');
    });

    it('loadSync JSON file --> instanceof MyConfig', function()
    {
      const cfg = MyConfig.loadSync('testapp', jsonFile);
      Assert.strictEqual(cfg instanceof MyConfig, true);
    });

    it('loadSync JSON file reads correct data', function()
    {
      const cfg = MyConfig.loadSync('testapp', jsonFile);
      Assert.strictEqual(cfg.get('color'), 'red');
      Assert.strictEqual(cfg.get('size'), 'large');
    });

    it('loadSync sets name on returned config', function()
    {
      const cfg = MyConfig.loadSync('testapp', iniFile);
      Assert.strictEqual(cfg.name, 'testapp');
    });

    it('loadSync with ignore_not_found=true on missing file --> empty config', function()
    {
      const missing = NodePath.join(tmpdir, 'nonexistent_sync_test.ini');
      const cfg = MyConfig.loadSync('testapp', missing, true);
      Assert.strictEqual(cfg instanceof MyConfig, true);
      Assert.strictEqual(cfg.data.size, 0);
    });

    it('loadSync without ignore_not_found throws on missing file', function()
    {
      const missing = NodePath.join(tmpdir, 'nonexistent_sync_test.ini');
      Assert.throws(() => MyConfig.loadSync('testapp', missing), { code: 'ENOENT' });
    });

    it('loadSync throws on missing name', function()
    {
      Assert.throws(() => MyConfig.loadSync(iniFile), { message: /invalid opts.name/ });
    });

    it('loadSync throws on name with dot', function()
    {
      Assert.throws(() => MyConfig.loadSync('bad.name', iniFile), { message: /punctuation not allowed/ });
    });

    it('loadSync throws on name with forward slash', function()
    {
      Assert.throws(() => MyConfig.loadSync('bad/name', iniFile), { message: /slash not allowed/ });
    });

    it('loadSync throws on name with backslash', function()
    {
      Assert.throws(() => MyConfig.loadSync('bad\\name', iniFile), { message: /slash not allowed/ });
    });

    it('loadSync throws on invalid option type', function()
    {
      Assert.throws(() => MyConfig.loadSync('testapp', 123), { message: /invalid option/ });
    });
  });

  // ── round-trip (save + load) ──────────────────────────────────────

  describe('round-trip', () =>
  {
    const iniFile = NodePath.join(tmpdir, 'myconfig_test_roundtrip.ini');
    const jsonFile = NodePath.join(tmpdir, 'myconfig_test_roundtrip.json');

    afterEach(() => {
      try { NodeFs.unlinkSync(iniFile); } catch(e) {}
      try { NodeFs.unlinkSync(jsonFile); } catch(e) {}
    });

    it('round-trip async INI: save then load preserves data', async function()
    {
      const cfg1 = new MyConfig('app');
      cfg1.set('fruit', 'banana');
      cfg1.set('count', '5');
      await cfg1.save(iniFile);

      const cfg2 = await MyConfig.load('app', iniFile);
      Assert.strictEqual(cfg2.get('fruit'), 'banana');
      Assert.strictEqual(cfg2.get('count'), '5');
    });

    it('round-trip async JSON: save then load preserves data', async function()
    {
      const cfg1 = new MyConfig('app');
      cfg1.set('fruit', 'banana');
      cfg1.set('count', '5');
      await cfg1.save(jsonFile);

      const cfg2 = await MyConfig.load('app', jsonFile);
      Assert.strictEqual(cfg2.get('fruit'), 'banana');
      Assert.strictEqual(cfg2.get('count'), '5');
    });

    it('round-trip sync INI: saveSync then loadSync preserves data', function()
    {
      const cfg1 = new MyConfig('app');
      cfg1.set('animal', 'cat');
      cfg1.saveSync(iniFile);

      const cfg2 = MyConfig.loadSync('app', iniFile);
      Assert.strictEqual(cfg2.get('animal'), 'cat');
    });

    it('round-trip sync JSON: saveSync then loadSync preserves data', function()
    {
      const cfg1 = new MyConfig('app');
      cfg1.set('animal', 'dog');
      cfg1.saveSync(jsonFile);

      const cfg2 = MyConfig.loadSync('app', jsonFile);
      Assert.strictEqual(cfg2.get('animal'), 'dog');
    });

    it('round-trip dotted keys through INI', async function()
    {
      const cfg1 = new MyConfig('app');
      cfg1.set('section.key', 'nested_val');
      await cfg1.save(iniFile);

      const cfg2 = await MyConfig.load('app', iniFile);
      Assert.strictEqual(cfg2.get('section.key'), 'nested_val');
    });

    it('round-trip dotted keys through JSON', async function()
    {
      const cfg1 = new MyConfig('app');
      cfg1.set('section.key', 'nested_val');
      await cfg1.save(jsonFile);

      const cfg2 = await MyConfig.load('app', jsonFile);
      Assert.strictEqual(cfg2.get('section.key'), 'nested_val');
    });
  });

  // ── doesConfigPathExist ───────────────────────────────────────────

  describe('doesConfigPathExist', () =>
  {
    it('is a function', function()
    {
      const cfg = new MyConfig('app');
      Assert.strictEqual(typeof cfg.doesConfigPathExist, 'function');
    });

    it('returns undefined (empty stub)', async function()
    {
      const cfg = new MyConfig('app');
      const result = await cfg.doesConfigPathExist('app');
      Assert.strictEqual(result, undefined);
    });
  });

  // ── static properties ─────────────────────────────────────────────

  describe('static properties', () =>
  {
    it('MyConfig.config_fn defaults to "config.ini"', function()
    {
      Assert.strictEqual(MyConfig.config_fn, 'config.ini');
    });

    it('MyConfig.pd defaults to true', function()
    {
      Assert.strictEqual(MyConfig.pd, true);
    });
  });

});
