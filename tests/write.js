
const NodeOs = require('node:os');
const NodePath = require('node:path');

const argv = require('@gsfjohnson/argv').parse(
  //[Boolean,'help','h'],
);

const MyConfig = require('../index');
const Util = require('../util');


async function main()
{
  let key, value, fn;

  // argv: key
  if (argv._.length) key = argv._[0];
  else key = 'whatever';
  console.log('Key:',key);

  // argv: value
  if (argv._.length > 1) value = argv._[1];
  else value = 23;
  console.log('Value:',value);

  // argv: filename
  if (argv._.length > 2) fn = argv._[2];
  console.log('*** fn:',fn);

  // load
  let ignore_not_found = true;
  console.log('*** cfg = await MyConfig.load(testapp, true) ...');
  let cfg = await MyConfig.load('testapp', ignore_not_found);

  // display key=value
  if (key) console.log('*** cfg.get(',key,')', cfg.get(key) );
  else console.log('*** cfg.data:', cfg.data );

  // set key=value
  console.log('*** cfg.set() <--',key,value);
  cfg.set(key,value);

  console.log(`*** await cfg.save(fn) ...`);
  let result = await cfg.save(fn);
  console.log('result:',result);

}

main();
