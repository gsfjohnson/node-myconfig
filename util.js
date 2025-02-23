
const NodeCrypto = require('node:crypto');
const NodeStream = require('node:stream');

let debug; try { debug = require('debug')('myconfig:util'); }
catch (e) { debug = function(){}; } // empty stub

const S3_Sep = '/';

class Util
{
  // from npm:isobject
  static isObject(val)
  {
    return val !== null && typeof val === 'object' && Array.isArray(val) === false;
  }

  static isPureObject(val)
  {
    return Util.isObject(val) && val.constructor.name === 'Object';
  }

  static isDate(val)
  {
    if ( val instanceof Date && ! isNaN( val.valueOf() ) ) return true;
    return false;
  }

  static isPromise(val)
  {
    if ( ! Util.isObject(val) ) return false;
    if ( typeof val.then === 'function' ) return true;
    return false;
  }

  static isArray(val)
  {
    if ( Array.isArray(val) ) return true;
    return false;
  }

  static isNumber(val)
  {
    if ( typeof val == 'number' ) return true;
    return false;
  }

  static isBoolean(val)
  {
    if ( typeof val == 'boolean' ) return true;
    return false;
  }

  static isString(str)
  {
    if ( typeof str != 'string' ) return false;
    return true;
  }

  static isKey(key,allowed)
  {
    // sanity: key
    if ( typeof key != 'string' ) return false;

    // sanity: allowed
    if ( Array.isArray(allowed) && ! allowed.includes(key) ) return false;

    // it must be a key
    // XXX: improve this!!
    return true;
  }

  static isUuid(uuid)
  {
    if ( typeof uuid != 'string' )  return false;
    let arr = uuid.split('-');
    if ( arr.length != 5 ) return false;
    for( let i = 0; i < 5; i++ )
      if ( typeof arr[i] != 'string' || arr[i].length == 0 ) return false;
    // XXX: improve this!!
    return true;
  }

  static isHex(val)
  {
    const type = 'hex';
    if ( ! Util.isString(val) ) return false;
    let buff = Buffer.from(val,type);
    if ( val !== buff.toString(type) ) return false;
    return buff;
  }

  static isBase64(val)
  {
    const type = 'base64';
    if ( ! Util.isString(val) ) return false;
    let buff = Buffer.from(val,type);
    if ( val !== buff.toString(type) ) return false;
    return buff;
  }

  static isSHA(val)
  {
    let buff;
    // convert value into buffer
    if ( Buffer.isBuffer(val) && val.length ) buff = val;
    else if ( typeof val == 'string' && val.length ) {
      buff = Buffer.from(val,'base64');
      if ( buff.toString('base64') != val ) {
        let lc_val = val.toLowerCase();
        buff = Buffer.from(lc_val,'hex');
        if ( buff.toString('hex') != lc_val ) buff = undefined;
      }
    }
    // measure buffer length
    if ( buff ) {
      if ( buff.length == 20 ) return buff; // sha1
      if ( buff.length == 32 ) return buff; // sha256
      if ( buff.length == 48 ) return buff; // sha384
      if ( buff.length == 64 ) return buff; // sha512
    }
    // return undefined
  }

  static typeof(val)
  {
    //if ( val === undefined ) return 'undefined';
    if ( val === null ) return 'null';
    else if ( typeof val == 'object' ) {
      if ( Array.isArray(val) ) return 'array';
      return 'object';
    }
    // otherwise trust typeof
    return typeof val;
  }

  // inspired by npm:isstream
  static isStream(obj)
  {
    return Util.isObject(obj) && ( obj instanceof NodeStream.Stream );
  }

  // inspired by npm:isstream
  static isReadable(obj)
  {
    return Util.isStream(obj) && typeof obj.read == 'function' && typeof obj._readableState == 'object';
  }

  // inspired by npm:isstream
  static isWritable(obj)
  {
    return Util.isStream(obj) && typeof obj.write == 'function' && typeof obj._writableState == 'object';
  }

  // not appropriate for big streams
  static streamToBuffer(stream)
  {
    const ld = { fx: '.streamToBuffer()' };

    if (!Util.isReadable(stream)) throw new Error(`not a stream: ${stream}`);
    debug(ld.fx,stream.constructor.name);

    return new Promise( function(resolve, reject)
    {
      let arrayOfBuffers = [];
      let _on_data = (chunk) =>
      {
        if ( ! Buffer.isBuffer(chunk) ) {
          let err = new Error('invalid data type: '+ typeof chunk);
          return stream.destroy(err);
        }
        debug(ld.fx,'saving',chunk);
        arrayOfBuffers.push(chunk);
      }
      let _on_close = () => {
        let buffers = Buffer.concat(arrayOfBuffers);
        debug(ld.fx,'resolve =>',buffers);
        resolve(buffers);
      };
      stream.on('close',_on_close);
      stream.on('error',reject);
      stream.on('data',_on_data);
    });
  }

  // copied from https://gist.github.com/devm33/9443419
  static rand_string(n)
  {
    if (n <= 0) return '';
    let rs = '';
    try {
        rs = NodeCrypto.randomBytes(Math.ceil(n/2)).toString('hex').slice(0,n);
        /* note: could do this non-blocking, but still might fail */
    }
    catch(ex) {
        /* known exception cause: depletion of entropy info for randomBytes */
        console.error('Exception generating random string: ' + ex);
        /* weaker random fallback */
        rs = '';
        let r = n % 8, q = (n-r)/8, i;
        for (i = 0; i < q; i++)
          rs += Math.random().toString(16).slice(2);
        if (r > 0) rs += Math.random().toString(16).slice(2,i);
    }
    return rs;
  }

  static parse_system_path(dir)
  {
    const ld = { cl: 'Util', fx: '._parse_system_path()' };

    // convert strings to array
    if ( typeof dir == 'string' ) dir = dir.split(S3_Sep);
    if ( ! Array.isArray(dir) ) return; // refuse to parse

    // ensure string elements
    for ( let val of dir ) {
      if ( typeof val != 'string' ) {
        let err = new Error('invalid dir (array elements must be strings)');
        err.dir = dir;
        throw err;
      }
    }

    // ensure first element is empty
    if ( dir[0].length != 0 ) {
      let err = new Error('dir must be absolute');
      err.dir = dir;
      throw err;
    }

    // ensure last element is empty
    if ( dir[ dir.length-1 ].length != 0 ) dir.push('');

    // convert to posix style
    dir = dir.join(S3_Sep);

    // success
    debug(ld,'=>',dir);
    return dir;
  }

}

module.exports = Util;
