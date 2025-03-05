
const NodePath = require('path');
const NodeOs = require('os');
const Assert = require('assert');

const MyConfig = require('../index');


describe('MyConfig', function()
{
  let cfg;
  let cfg_fn = NodePath.join( NodeOs.tmpdir(), 'myconfig_rw_test.ini' );

  describe('initial', () =>
  {

    it('cfg_fn = '+ cfg_fn, function(){});

    it.skip('cfg = await MyConfig.load( cfg_fn ) --> instanceof MyConfig', async function()
    {
      let fn = ''+cfg_fn;
      const result = await MyConfig.load( fn );

      const expected = true;
      const actual = result instanceof MyConfig;
      Assert.equal( actual, expected );

      // success
      cfg = result;
    });

  });

  describe('tests', () =>
  {
    it('cfg = new MyConfig("testapp") --> instanceof MyConfig', function()
    {
      const result = new MyConfig('testapp');

      // test result
      const expected = true;
      const actual = result instanceof MyConfig;
      Assert.equal( actual, expected );

      // success
      cfg = result;
    });

    it('cfg.set(whatever,value) --> true', async function()
    {
      const result = cfg.set('whatever','value');

      // test result
      const expected = true;
      const actual = result;
      Assert.equal( actual, expected );

      // success
    });

    it('cfg.dirty --> 1', async function()
    {
      // test result
      const expected = 1;
      const actual = cfg.dirty;
      Assert.equal( actual, expected );

      // success
    });


    it('await cfg.save( cfg_fn ) --> true', async function()
    {
      let fn = ''+cfg_fn;
      const result = await cfg.save( fn );

      // test result
      const expected = true;
      const actual = result;
      Assert.equal( actual, expected );

      // success
    });

    it('cfg.dirty --> 0', async function()
    {
      // test result
      const expected = 0;
      const actual = cfg.dirty;
      Assert.equal( actual, expected );

      // success
    });

    it('cfg = MyConfig.load( cfg_fn, { name: "testapp" } ) --> instanceof MyConfig', async function()
    {
      let fn = ''+cfg_fn;
      const result = await MyConfig.load( fn, { name: 'testapp' } );

      // test result
      const expected = true;
      const actual = result instanceof MyConfig;
      Assert.equal( actual, expected );

      // success
      cfg = result;
    });

    it('cfg.get(whatever) --> value', async function()
    {
      const result = cfg.get('whatever');

      // test result
      const expected = 'value';
      const actual = result;
      Assert.equal( actual, expected );

      // success
    });

    it.skip('cfg.query( .whatever ) --> value', function()
    {
      const result = cfg.query('.whatever');

      const expected = 'value';
      const actual = result;
      Assert.equal(actual, expected);
    });

    it('cfg.delete("whatever") --> true', function()
    {
      const result = cfg.delete('whatever');

      const expected = true;
      const actual = result;
      Assert.equal(actual, expected);
    });

    it('cfg.get("whatever") after delete --> undefined', function()
    {
      const result = cfg.get('whatever');

      const expected = undefined;
      const actual = result;
      Assert.equal(actual, expected);
    });

  });

});
