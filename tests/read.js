
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
  console.log(argv.script,'[-h] [-k key] [-f file]');
}

async function main()
{
  let key, fn, name;

  // argv
  if (argv.help) { display_help(); process.exit(1) }
  if (argv.key) key = argv.key;
  if (argv.name) name = argv.name;
  else name = 'testapp';
  if (argv.file) {
    fn = argv.file;
    console.log('*** fn:',fn);
  }

  const params = { ignore_not_found: true };
  if (name) params.name = name;
  if (fn) params.fn = fn;
  console.log('*** cfg = await MyConfig.load() <--',params);
  let cfg = await MyConfig.load(params);
  console.log('cfg -->',cfg);

  if (key) console.log('*** cfg.get(',key,') -->', cfg.get(key) );
  else console.log('*** cfg.data:', cfg.data );

}

main();
