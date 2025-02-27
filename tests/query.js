
const NodeOs = require('node:os');
const NodePath = require('node:path');

const MyConfig = require('../index');


async function main()
{
  console.log('*** cfg = new MyConfig()');
  let cfg = new MyConfig();

  console.log('*** cfg.raw = { fs: { local: { type: local } } }');
  cfg.set('fs',{ local: { type: 'local' } });
  console.log('*** cfg.raw:',cfg.raw);

  console.log('*** cfg.query( .fs.local ) -->',cfg.query('.fs.local'));

}

main();
