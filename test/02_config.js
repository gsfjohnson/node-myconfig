
const NodePath = require('path');
const NodeOs = require('os');
const Assert = require('assert');

const MyConfig = require('../index');


describe('MyConfig', function()
{
  let cfg;
  let cfg_fn = NodePath.join( NodeOs.tmpdir(), 'myconfig_rw_test.json' );

  describe('initial', () =>
  {

    it('cfg_fn = '+ cfg_fn, function(){});

    it.skip('cfg = MyConfig.loadFromFile( cfg_fn, false ) --> instanceof MyConfig', async function()
    {
      let fn = ''+cfg_fn;
      const result = await MyConfig.loadFromFile( fn, false );

      const expected = true;
      const actual = result instanceof MyConfig;
      Assert.equal( actual, expected );

      // success
      cfg = result;
    });

  });

  describe('tests', () =>
  {
    it('cfg = new MyConfig() --> instanceof MyConfig', function()
    {
      const result = new MyConfig();

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


    it('cfg.saveToFile( cfg_fn ) --> true', async function()
    {
      let fn = ''+cfg_fn;
      const result = await cfg.saveToFile( fn );

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

    it('cfg = MyConfig.loadFromFile( cfg_fn ) --> instanceof MyConfig', async function()
    {
      let fn = ''+cfg_fn;
      const result = await MyConfig.loadFromFile( fn );

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

  });

});
