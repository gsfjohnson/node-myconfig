
const NodeOs = require('node:os');
const NodePath = require('node:path');

const argv = require('@gsfjohnson/argv').parse(
  //[Boolean,'help','h'],
);
  
const MyConfig = require('../index');
const Util = require('../util');

let key, fn;

// argv: key
if ( cl.argv.length > 0 ) {
  key = cl.argv[0];
  console.log('Key:',key);
}

// argv: filename
if ( cl.argv.length > 2 ) fn = cl.argv[2];
console.log('*** fn:',fn);

console.log('*** cfg = MyConfig.loadsync({ name: testapp, ignore_not_found: true }) ...');
let cfg = MyConfig.loadsync({ name: 'testapp', ignore_not_found: true });

if (key) console.log('*** cfg.get(',key,')', cfg.get(key) );
else console.log('*** cfg.data:', cfg.data );

