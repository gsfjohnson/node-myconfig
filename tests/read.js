
const NodeOs = require('node:os');
const NodePath = require('node:path');
const MyConfig = require('../index');

async function main()
{
  let fn = NodePath.join( NodeOs.tmpdir(), 'myconfig_rw_test.json' );
  console.log('*** fn:',fn);

  console.log('*** cfg = await MyConfig.loadFromFile('+fn+') ...');
  let cfg = await MyConfig.loadFromFile( fn );
  console.log('*** cfg:', cfg );

  console.log('*** cfg.get(whatever):', cfg.get('whatever') );
}

main();
