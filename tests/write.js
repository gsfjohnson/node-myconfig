
const NodeOs = require('node:os');
const NodePath = require('node:path');

const MyConfig = require('../index');


async function main()
{
  console.log('*** cfg = new MyConfig()');
  let cfg = new MyConfig();

  console.log('*** cfg.set(whatever,23) ...');
  cfg.set( 'whatever', 23 );

  let fn = NodePath.join( NodeOs.tmpdir(), 'myconfig_rw_test.json' );
  console.log('*** fn:',fn);

  console.log(`*** await cfg.saveToFile(${fn}) ...`);
  let result = await cfg.saveToFile( fn );
  console.log('result:',result);

}

main();
