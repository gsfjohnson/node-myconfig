
const NodeOs = require('node:os');
const NodePath = require('node:path');

const MyConfig = require('../index');
const Util = require('../util');


async function main()
{
  console.log('*** cfg = new MyConfig()');
  let key, value, fn;
  let cl = Util.parse_argv();
  let cfg = new MyConfig('testapp');

  // argv: key
  if ( cl.argv.length > 0 ) key = cl.argv[0];
  else key = 'whatever';
  console.log('Key:',key);

  // argv: value
  if ( cl.argv.length > 1 ) value = cl.argv[1];
  else value = 23;
  console.log('Value:',value);

  // set key=value
  console.log('*** cfg.set() <--',key,value);
  cfg.set(key,value);

  // argv: filename
  if ( cl.argv.length > 2 ) fn = cl.argv[2];
  else fn = NodePath.join( NodeOs.tmpdir(), 'myconfig_rw_test.ini' );
  console.log('*** fn:',fn);

  console.log(`*** await cfg.saveToFile(fn) ...`);
  let result = await cfg.saveToFile(fn);
  console.log('result:',result);

}

main();
