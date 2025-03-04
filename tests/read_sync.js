
const NodeOs = require('node:os');
const NodePath = require('node:path');

const MyConfig = require('../index');
const Util = require('../util');

let key, fn;
let cl = Util.parse_argv();

// argv: key
if ( cl.argv.length > 0 ) {
key = cl.argv[0];
console.log('Key:',key);
}

// argv: filename
if ( cl.argv.length > 2 ) fn = cl.argv[2];
else fn = NodePath.join( NodeOs.tmpdir(), 'myconfig_rw_test.ini' );
console.log('*** fn:',fn);

console.log('*** cfg = MyConfig.loadsync(fn) ...');
let cfg = MyConfig.loadsync(fn, { name: 'testapp' });

if (key) console.log('*** cfg.get(',key,')', cfg.get(key) );
else console.log('*** cfg.data:', cfg.data );

