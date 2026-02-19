
const NodePath = require('node:path');
const NodeOs = require('node:os');
const NodeCrypto = require('node:crypto');
const NodeStream = require('node:stream');
const NodeFs = require('node:fs');
//const NodeFsPromise = require('node:fs/promises');

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
    return Util.isObject(val) && val.constructor && val.constructor.name === 'Object';
  }

  static isNullObject(val)
  {
    return typeof val === 'object' && Object.getPrototypeOf(val) === null;
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

  static isMap(value) {
    if (typeof value != 'object') return false;
    return value instanceof Map;
    //typeof value.clear === 'function' &&
    //typeof value.delete === 'function' &&
    //typeof value.get === 'function' &&
    //typeof value.has === 'function' &&
    //typeof value.set === 'function';
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

  /**
   * Converts a JavaScript object into a Map
   * @param {Object} obj - The object to convert
   * @returns {Map} - The resulting Map containing all key-value pairs from the object
   */
  static objectToMap(obj,map)
  {
    const fx = '.objectToMap()';

    if (!Util.isObject(obj) || obj === null) throw new TypeError('Input must be an object');
    
    if (!map) map = new Map();
    
    Object.entries(obj).forEach(([key, value]) =>
    {
      if (Util.isPureObject(value))
        value = Util.objectToMap(value);
      map.set(key, value);
    });
    
    debug(fx,'→',map);
    return map;
  }

  /**
   * Converts a Map into a JavaScript object
   * @param {Map} map - The Map to convert
   * @returns {Object} - The resulting object containing all key-value pairs from the Map
   */
  static mapToObject(map)
  {
    const fx = '.mapToObject()';
    debug(fx,'←',map);

    if (!Util.isMap(map)) throw new TypeError('invalid parameter: must be a Map');
    
    const obj = {};
    
    map.forEach( (value, key) => {
      switch ( Util.typeof(value) ) {
        case 'boolean':
          obj[key] = value ? 'true' : 'false';
          break;
        case 'number':
          obj[key] = ''+value;
        case 'string':
        case 'symbol':
          obj[key] = value;
          break;
        case 'map':
          obj[key] = Util.mapToObject(value); break;
        default:
          // Skip non-string/non-symbol keys as they can't be used as object properties
          break;
    }
      //if (typeof key === 'string' || typeof key === 'symbol') {
      //  obj[key] = value;
      //}
    });
    
    debug(fx,'→',obj);
    return obj;
  }

  static deepCloneMap(originalMap)
  {
    const fx = '.deepCloneMap()';
    debug(fx,'←',originalMap);

    // Create a new Map to hold the cloned key-value pairs
    const clonedMap = new Map();
    
    // Iterate through each key-value pair in the original Map
    for (const [key, value] of originalMap.entries()) {
      let clonedValue;
      
      if (value === null || value === undefined) clonedValue = value;
      else if (value instanceof Map) clonedValue = Util.deepCloneMap(value);
      else if (value instanceof Set) {
        clonedValue = new Set([...value].map(item => 
          item instanceof Object ? deepCloneObject(item) : item
        ));
      }
      else if (Array.isArray(value)) {
        clonedValue = value.map(item => 
          item instanceof Object ? Util.deepCloneObject(item) : item
        );
      }
      // Handle nested Objects
      else if (typeof value === 'object') clonedValue = Util.deepCloneObject(value);
      // Handle primitive values (they are copied by value)
      else clonedValue = value;
      
      // Clone the key if it's an object (to ensure full deep cloning)
      //const clonedKey = key instanceof Object ? deepCloneObject(key) : key;
      
      // Add the cloned key-value pair to the new Map
      clonedMap.set(key, clonedValue);
    }
    
    debug(fx,'→',clonedMap);
    return clonedMap;
  }

  /**
   * Helper function to deep clone regular objects
   * 
   * @param {Object} obj - The object to clone
   * @returns {Object} A deep clone of the original object
  **/
  static deepCloneObject(obj)
  {
    const fx = '.deepCloneObject()';
    debug(fx,'←',obj);

    if (obj === null || typeof obj !== 'object') return obj;
    
    // Handle special object types
    if (obj instanceof Map) return Util.deepCloneMap(obj);
    if (obj instanceof Set) return new Set([...obj].map(item => Util.deepCloneObject(item)));
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof RegExp) return new RegExp(obj);
    
    // Create a new object or array
    const clone = Array.isArray(obj) ? [] : {};
    
    // Recursively copy all properties
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clone[key] = Util.deepCloneObject(obj[key]);
      }
    }
    
    debug(fx,'→',clone);
    return clone;
  }

  static typeof(val)
  {
    const fx = '.typeof()';
    debug(fx,'←',val);

    let out = typeof val;
    //if ( val === undefined ) return 'undefined';
    if ( val === null ) out = 'null';
    else if ( typeof val == 'object' ) {
      if ( Buffer.isBuffer(val) ) out = 'buffer';
      else if ( val instanceof Map ) out = 'map';
      else if ( Array.isArray(val) ) out = 'array';
      else out = 'object';
    }
    debug(fx,'→',out);
    return out;
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
    const fx = '.streamToBuffer()';

    if (!Util.isReadable(stream)) throw new Error(`not a stream: ${stream}`);
    debug(fx,stream.constructor.name);

    return new Promise( function(resolve, reject)
    {
      let arrayOfBuffers = [];
      let _on_data = (chunk) =>
      {
        if ( ! Buffer.isBuffer(chunk) ) {
          let err = new Error('invalid data type: '+ Util.typeof(chunk));
          return stream.destroy(err);
        }
        debug(fx,'saving',chunk);
        arrayOfBuffers.push(chunk);
      }
      let _on_close = () => {
        let buffers = Buffer.concat(arrayOfBuffers);
        debug(fx,'resolve →',buffers);
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
    const fx = '._parse_system_path()';

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
    debug(fx,'→',dir);
    return dir;
  }

  static osConfigPath(...options)
  {
    const fx = '.osConfigPath()';
    debug(fx,'←',...options);

    // initial
    let out, opts = {};
    let os_platform = NodeOs.platform();
    let os_homedir = NodeOs.homedir();

    // process options
    options.forEach( (opt) => {
      if (Util.isBoolean(opt)) opts.mkdir = opt;
      if (Util.isString(opt)) opts.name = opt;
      if (Util.isObject(opt)) Object.assign(opts,opt);
    });

    // sanity
    if (!Util.isString(opts.name)) throw new TypeError(`invalid opts.name: ${opts.name}`);
    if (opts.name.indexOf('.')>-1) throw new Error('invalid opts.name: '+ opts.name);
    if (opts.name.indexOf('/')>-1) throw new Error('invalid opts.name: '+ opts.name);
    if (opts.name.indexOf('\\')>-1) throw new Error('invalid opts.name: '+ opts.name);

    // operation
    let path;
    switch (os_platform)
    {
      case 'win32':
        path = NodePath.join(os_homedir,'AppData','Local',opts.name);
        break;
      case 'darwin':
        path = NodePath.join(os_homedir,'Library','Application Support',opts.name)
        break;
      case 'linux':
        path = NodePath.join(os_homedir,'.config',opts.name);
        break;
      default:
        throw new Error('unsupported platform: '+ os_platform);
    }

    // mkdir
    if ( opts.mkdir ) {
      debug(fx,'mkdirSync:',path);
      NodeFs.mkdirSync(path, { recursive: true });
    }

    // build final path
    if ( ! Util.isString(opts.fn) ) out = path;
    else out = NodePath.join( path, opts.fn );

    // return
    debug(fx,'→',out);
    return out;
  }
  
  static parse_argv()
  {
    const fx = '.parse_argv()';

    const av = process.argv.slice();
    let out = {};

    if ( ['node','node.exe'].includes( NodePath.basename(av[0]) ) )
      av.shift();

    out.script = av.shift();
    out.name = NodePath.basename(out.script);
    out.argv = av;

    debug(fx,'→',out);
    return out;
  }
}

module.exports = Util;
