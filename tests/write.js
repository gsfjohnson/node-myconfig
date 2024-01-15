
const MyPath_Local = require('@gsfjohnson/mypath/local');

const MyConfig = require('../index');


async function main()
{
  console.log('*** cfg = new MyConfig()');
  let cfg = new MyConfig();

  console.log('*** cfg.set(whatever,23) ...');
  cfg.set( 'whatever', 23 );

  let json_fn = new MyPath_Local({ root: '$tmpdir', key: 'test_cfg.json' });
  let fn = ''+json_fn;
  console.log('*** fn:',fn);

  console.log('*** await cfg.saveToFile( $tmpdir/test_cfg.json ) ...');
  await cfg.saveToFile( fn );

}

main();
