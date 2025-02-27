
const NodeOs = require('node:os');
const NodePath = require('node:path');
const MyConfig = require('../index');

async function main()
{
  let tmp_fn = NodePath.join( NodeOs.tmpdir(), 'myconfig_rw_test.ini' );
  console.log('*** tmp_fn:',tmp_fn);

  console.log('*** cfg = await MyConfig.loadFromFile(tmp_fn) ...');
  let cfg = await MyConfig.loadFromFile(tmp_fn);
  console.log('*** cfg.raw:', cfg.raw );

  console.log('*** cfg.get(whatever):', cfg.get('whatever') );
}

main();
