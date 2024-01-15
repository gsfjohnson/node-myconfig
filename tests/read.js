
const MyPath_Local = require('@gsfjohnson/mypath/local');

const MyConfig = require('../index');

async function main()
{
  let json_fn = new MyPath_Local({ root: '$tmpdir', key: 'test_cfg.json' });
  let fn = ''+json_fn;
  console.log('*** fn:',fn);

  console.log('*** cfg = await MyConfig.loadFromFile('+fn+') ...');
  let cfg = await MyConfig.loadFromFile( fn );
  console.log('*** cfg:', cfg );

  console.log('*** cfg.get(whatever):', cfg.get('whatever') );
}

main();
