
const NodeOs = require('node:os');
const NodePath = require('node:path');

const MyConfig = require('../index');


async function main()
{
  console.log('*** cfg = new MyConfig()');
  let cfg = new MyConfig('testapp');

  console.log('*** cfg.set(whatever,23) ...');
  cfg.set( 'whatever', 23 );

  console.log('*** cfg.set(what.ever,true) ...');
  cfg.set( 'what.ever', true );

  console.log('*** cfg.set(what.ever.ok,null) ...');
  cfg.set( 'what.ever.ok', null );

  let tmp_fn = NodePath.join( NodeOs.tmpdir(), 'myconfig_rw_test.ini' );
  console.log('*** tmp_fn:',tmp_fn);

  console.log(`*** await cfg.saveToFile(tmp_fn) ...`);
  let result = await cfg.saveToFile(tmp_fn);
  console.log('result:',result);

}

main();
