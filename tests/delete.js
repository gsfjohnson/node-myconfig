
const NodeOs = require('node:os');
const NodePath = require('node:path');

const argv = require('@gsfjohnson/argv').parse(
  //[Boolean,'help','h'],
);

const MyConfig = require('../index');
const Util = require('../util');


async function main()
{
  let key, fn;

  // argv: key
  if (argv._.length) key = argv._[0];
  else key = 'whatever';
  console.log('Key:',key);

  // argv: filename
  if (argv.length > 1) fn = argv._[1];
  else fn = NodePath.join( NodeOs.tmpdir(), 'myconfig_rw_test.ini' );
  console.log('*** fn:',fn);

  // load
  console.log('*** cfg = await MyConfig.loadFromFile(fn) ...');
  let cfg = await MyConfig.loadFromFile(fn, { name: 'testapp', ignore_not_found: true });

  // display key=value
  if (key) console.log('*** cfg.get(',key,')', cfg.get(key) );
  else console.log('*** cfg.data:', cfg.data );

  // delete
  console.log('*** cfg.delete( .fs.local.type ) -->',cfg.delete('.fs.local.type'));

  // display key=value
  if (key) console.log('*** cfg.get(',key,')', cfg.get(key) );
  else console.log('*** cfg.data:', cfg.data );

  console.log(`*** await cfg.saveToFile(fn) ...`);
  let result = await cfg.saveToFile(fn);
  console.log('result:',result);

}

main();
