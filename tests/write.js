
const NodeOs = require('node:os');
const NodePath = require('node:path');

const MyConfig = require('../index');
const Util = require('../util');


async function main()
{
  let key, value, fn;
  let cl = Util.parse_argv();

  // argv: key
  if ( cl.argv.length > 0 ) key = cl.argv[0];
  else key = 'whatever';
  console.log('Key:',key);

  // argv: value
  if ( cl.argv.length > 1 ) value = cl.argv[1];
  else value = 23;
  console.log('Value:',value);

  // argv: filename
  if ( cl.argv.length > 2 ) fn = cl.argv[2];
  else fn = NodePath.join( NodeOs.tmpdir(), 'myconfig_rw_test.ini' );
  console.log('*** fn:',fn);

  // load
  console.log('*** cfg = await MyConfig.loadFromFile(fn) ...');
  let cfg = await MyConfig.loadFromFile(fn, { name: 'testapp', ignore_not_found: true });

  // display key=value
  if (key) console.log('*** cfg.get(',key,')', cfg.get(key) );
  else console.log('*** cfg.data:', cfg.data );

  // set key=value
  console.log('*** cfg.set() <--',key,value);
  cfg.set(key,value);

  console.log(`*** await cfg.saveToFile(fn) ...`);
  let result = await cfg.saveToFile(fn);
  console.log('result:',result);

}

main();
