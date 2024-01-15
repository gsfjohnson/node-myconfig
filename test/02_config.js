
const NodePath = require('path');
const NodeOs = require('os');
const Assert = require('assert');

const MyPath_Local = require('@gsfjohnson/mypath/local');
const MyConfig = require('../index');


describe('MyConfig', function()
{
  let cfg;
  let json_fn; // = '/tmp/chatja_test_config.json';

  describe('initial', () =>
  {

    it('json_fn = new MyPath_Local({ root: $tmpdir/$uuid, key: test_config.json })', function()
    {
      const result = new MyPath_Local({ root: '$tmpdir/$uuid', key: 'test_config.json' });

      // test result
      if ( ! (result instanceof MyPath_Local) )
        throw new TypeError('result is '+result+' (should be MyPath_Local)');

      // success
      json_fn = result;
    });

    it('json_fn.mkdir() --> true', async function()
    {
      const result = await json_fn.mkdir();

      // test result
      if ( result !== true )
        throw new TypeError('result is '+result+' (should be True)');

      // success
      //json_fn = ''+result;
    });

    it.skip('cfg = MyConfig.loadFromFile( json_fn, false ) --> instanceof MyConfig', async function()
    {
      let fn = ''+json_fn;
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

    it('cfg.get(whatever) --> value', async function()
    {
      const result = cfg.get('whatever');

      // test result
      const expected = 'value';
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


    it('cfg.saveToFile( json_fn ) --> true', async function()
    {
      let fn = ''+json_fn;
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

    it('cfg = MyConfig.loadFromFile( json_fn ) --> instanceof MyConfig', async function()
    {
      let fn = ''+json_fn;
      const result = await MyConfig.loadFromFile( fn );

      // test result
      const expected = true;
      const actual = result instanceof MyConfig;
      Assert.equal( actual, expected );

      // success
      cfg = result;
    });

  });

});
