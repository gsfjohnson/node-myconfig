
const NodeOs = require('node:os');
const NodePath = require('node:path');

const argv = require('@gsfjohnson/argv').parse(
  [Boolean,'help','h'],
  [String,'name','n'], //appname
  [String,'file','f'],
  [String,'key','k'],
);

const MyConfig = require('../index');
const Util = require('../util');


async function main()
{
  let key, name, value, fn;

  // argv
  if (argv.help) { display_help(); process.exit(1) }
  if (argv.key) key = argv.key;
  else key = 'whatever';
  if (argv.name) name = argv.name;
  else name = 'testapp';
  if (argv.file) fn = argv.file;
  else fn = NodePath.join( NodeOs.tmpdir(), 'myconfig_rw_test.ini' );

  // debug
  console.log('Config file:',fn);
  console.log('Key:',key);

  // load
  const ignore_not_found = true;
  console.log('*** cfg = await MyConfig.load() <--',fn,name,ignore_not_found);
  let cfg = await MyConfig.load(fn, 'testapp', ignore_not_found);
  console.log('cfg -->',cfg);

  // display key=value
  console.log('*** cfg.get(',key,') -->', cfg.get(key) );

  // delete
  console.log('*** cfg.delete('+key+') -->',cfg.delete(key));

  // display key=value
  console.log('*** cfg.get(',key,')', cfg.get(key) );

  console.log(`*** await cfg.save(fn) ...`);
  let result = await cfg.save(fn);
  console.log('result -->',result);

}

main();
