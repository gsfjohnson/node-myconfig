
const NodeOs = require('node:os');
const NodePath = require('node:path');

const MyConfig = require('../index');


async function main()
{
  console.log('*** cfg = new MyConfig()');
  let cfg = new MyConfig({ cfg: { fs: { local: { type: 'local' }}}});

  console.log('*** cfg.raw:',cfg.raw);

  console.log('*** cfg.delete( .fs.local.type ) -->',cfg.delete('.fs.local.type'));

  console.log('*** cfg.raw:',cfg.raw);

  let val = cfg.query('.');
  console.log('*** cfg.query( . ) -->',val);

}

main();
