
const NodeOs = require('node:os');
const NodePath = require('node:path');

const argv = require('@gsfjohnson/argv').parse(
//[Boolean,'help','h'],
);
  
const MyConfig = require('../index');
const Util = require('../util');


let key, value, fn;

// argv: key
if (argv._.length) key = argv._[0];
else key = 'whatever';
console.log('Key:',key);

// argv: value
if (argv._.length > 1) value = argv._[1];
else value = 23;
console.log('Value:',value);

// argv: filename
if (argv._.length > 2) fn = argv._[2];
else fn = NodePath.join( NodeOs.tmpdir(), 'myconfig_rw_test.ini' );
console.log('*** fn:',fn);

// load
console.log('*** cfg = await MyConfig.loadsync(fn) ...');
let cfg = MyConfig.loadsync({ name: 'testapp', ignore_not_found: true });

// display key=value
if (key) console.log('*** cfg.get(',key,')', cfg.get(key) );
else console.log('*** cfg.data:', cfg.data );

// set key=value
console.log('*** cfg.set() <--',key,value);
cfg.set(key,value);

console.log(`*** cfg.savesync(fn) ...`);
let result = cfg.savesync();
console.log('result:',result);
