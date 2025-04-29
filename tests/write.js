
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

function display_help()
{
  console.log(argv.script,'[-h] [-k key] [-f file] [value]');
}

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
  //else fn = NodePath.join( NodeOs.tmpdir(), 'myconfig_rw_test.ini' );
  if (argv._.length) value = argv._[0];
  else value = 23;

  // debug
  console.log('Config file:',fn);
  console.log('Key:',key);
  console.log('Value:',value);

  // load
  const params = { ignore_not_found: true };
  if (name) params.name = name;
  if (fn) params.fn = fn;
  console.log('*** cfg = await MyConfig.load() <--',params);
  let cfg = await MyConfig.load(params);
  console.log('*** cfg -->',cfg);

  // display key=value
  console.log('*** cfg.get(',key,') -->', cfg.get(key) );

  // set key=value
  console.log('*** cfg.set() <--',key,value);
  cfg.set(key,value);

  // save
  console.log('*** await cfg.save(fn) <--',fn);
  let result = await cfg.save(fn);
  console.log('cfg.save(fn) -->',result);

}

main();
