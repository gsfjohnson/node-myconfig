
const NodePath = require('path');
const NodeOs = require('os');
const Assert = require('assert');

const Config = require('../index');

//const errorRequire = name => require(`../lib/error/${name}`);
//const TestError = errorRequire('TestError');

describe('Config', function()
{
  let cfg;
  let fn = '/tmp/chatja_test_config.json';

  describe('load from does-not-exist', () =>
  {

    it('cfg = Config.loadFromFile(fn,false) --> instanceof Config', async function()
    {
      const result = await Config.loadFromFile(fn,false);

      const expected = true;
      const actual = result instanceof Config;
      Assert.equal( actual, expected );

      cfg = result;
    });
  });

  describe('tests', () =>
  {
    it('cfg = new Config() --> instanceof Config', function()
    {
      const result = new Config();

      const expected = true;
      const actual = result instanceof Config;
      Assert.equal( actual, expected );

      cfg = result;
    });

    it('cfg.set(whatever,value) --> true', async function()
    {
      const result = cfg.set('whatever','value');

      const expected = true;
      const actual = result;
      Assert.equal( actual, expected );
    });

    it('cfg.get(whatever) --> value', async function()
    {
      const result = cfg.get('whatever');

      const expected = 'value';
      const actual = result;
      Assert.equal( actual, expected );
    });

    it('cfg.dirty --> 1', async function()
    {
      const expected = 1;
      const actual = cfg.dirty;
      Assert.equal( actual, expected );
    });


    it('cfg.saveToFile(fn) --> true', async function()
    {
      const result = await cfg.saveToFile(fn);

      const expected = true;
      const actual = result;
      Assert.equal( actual, expected );
    });

    it('cfg.dirty --> 0', async function()
    {
      const expected = 0;
      const actual = cfg.dirty;
      Assert.equal( actual, expected );
    });

    it('cfg = Config.loadFromFile(fn) --> instanceof Config', async function()
    {
      const result = await Config.loadFromFile(fn);

      const expected = true;
      const actual = result instanceof Config;
      Assert.equal( actual, expected );

      cfg = result;
    });

  });

});
