
const NodePath = require('node:path');
//const NodeUtil = require('node:util');
const NodeFs = require('node:fs');

//const JsonQuery = require('json-query');

const Util = require('./util');
const Ini = require('./ini');
const Json = require('./json');

let debug; try { debug = require('debug')('myconfig'); }
catch (e) { debug = function(){}; } // empty stub

/** MyConfig class. */
class MyConfig
{
  static pd = true; // property debug
  //static app_name = 'myconfig';
  static config_fn = 'config.ini';
  #sd; // private state data

  /**
   * Create a MyConfig object.
   * @param {String} name - Lowercase name of app. Used for config path generation.
   * @param {Map} [data] - Initial map containing config data.
   * @param {Object} [opts] - Options (e.g. name, data).
   * @return {MyConfig} myconfigInstance
  **/
  constructor(...options)
  {
    const fx = '.constructor()';
    debug(fx,'←',...options);

    // initial
    const opts = Object.create(null);
    this.id = 'mycfg_'+Util.rand_string(2);
    this.data = new Map();
    const sd = this.#sd = {
      dirty: [],
      constructing: true,
    };

    // process options
    if (!Array.isArray(options)) options = [];
    while (options.length)
    {
      let opt = options.shift();
      switch (Util.typeof(opt))
      {
        case 'map': opts.data = opt; break;
        case 'string': opts.name = opt; break;
        case 'object': Object.assign(opts,opt); break;
      }
    }

    // sanity
    if (!Util.isString(opts.name)) throw new Error('invalid name: must be string');
    this.name = opts.name;
    if (Util.isString(opts.dir)) this.dir = opts.dir;
    if ( Util.isMap(opts.data) ) {
      //debug(fx,'opts.data:',opts.data);
      //debug(fx,'opts.data.size:',opts.data.size);
      //debug(fx,'opts.data.get(whatever):',opts.data.has('whatever'));
      //let data = Array.from(opts.data);
      //debug(fx,'data:',data);
      //let clone = JSON.parse(JSON.stringify(data));
      let clone = Util.deepCloneMap(opts.data);
      debug(fx,'cloned:',clone);
      this.data = clone; // deep clone
    }

    // process updated after construction phase
    delete sd.constructing;
    Object.freeze(this);

    // complete
    debug(fx,'→',this);
  }

  set(key,val)
  {
    const fx = '.set()';
    debug(fx,'←',key,val);

    // initial
    let data = this.data;
    let v, out;

    // sanity
    if ( typeof key != 'string' ) throw new Error('invalid key: must be string');
    if (!Util.isMap(data)) data = this.data = new Map();

    // split key
    const keys = [];
    if ( key.indexOf('.') == -1 ) keys[0] = key;
    else keys.splice( 0, 0, ...key.split('.') );

    while ( keys.length > 1 )
    {
      const k = keys.shift();
      debug(fx,`selecting: ${k}`);

      // create object if...
      v = data.get(k);
      if ( keys.length > 0 && !Util.isMap(v) )
      {
        debug(fx,'new key:',k);
        v = new Map();
        data.set(k,v);
        data = v;
        continue;
      }

      // continue diving...
      if ( v instanceof Map ) data = v;
    }

    // update
    const k = keys.shift();
    debug(fx,`selecting: ${k}`);
    debug(fx,`setting: ${key} ← ${val}`);
    data.set(k,val);
    this.dirty = key;
    out = true; // success

    // return
    debug(fx,'→',out);
    return out;
  }

  get(key)
  {
    const fx = '.get()';
    debug(fx,key);

    // initial
    let out;
    let data = this.data;

    // sanity
    if (!Util.isString(key)) throw new Error(`invalid parameter: key must be string`);
    if (!Util.isMap(data)) throw new Error(`internal error: data must be Map`);

    // split keys
    let keys = [];
    if ( key.indexOf('.') == -1 ) keys.push(key);
    else keys = key.split('.');

    // operation
    while ( keys.length )
    {
      let k = keys.shift();
      debug(fx,'selecting:',k);
      data = data.get(k);
      if (!Util.isMap(data)) break;
    }
    //debug(fx,'data:',data);

    // always deep clone
    if (Util.isMap(data)) data = Util.deepCloneMap(data);
    out = data;

    debug(fx,key,'→',out);
    return out;
  }

  delete(key)
  {
    const fx = '.delete()';
    debug(fx,'←',key);

    // initial
    let success;
    let data = this.data;

    // sanity
    if (!Util.isString(key)) throw new Error(`invalid key: must be string`);
    //if ( k.indexOf('.') == -1 )
    //  throw new Error('refusing to delete root key:',k);

    // split keys
    let keys = key.split('.');
    if ( keys[0] === '' ) keys.shift();

    // dive
    while ( keys.length > 1 )
    {
      const k = keys.shift();
      debug(fx,`selecting: ${k}`);

      data = data.get(k);

      // continue diving
      if (!Util.isMap(data)) break;
    }

    // when keys remain, diving was unsuccessful
    if ( keys.length > 1 )
    {
      debug(fx,'key not found:',keys.join('.'));
      success = false;
    }
    else if ( keys.length === 1 )
    {
      const k = keys.shift();
      debug(fx,`deleting: ${k}`);
      success = data.delete(k);
    }

    // return
    const out = success ? true : false;
    debug(fx,key,'→',out);
    return out;
  }

  /*query(q)
  {
    const fx = '.query()';
    debug(fx,'←',q);

    // initial
    const data = this.#sd.cfg;
    let out;

    // sanity
    if (!Util.isString(q)) throw new Error(`invalid query: ${q}`);
    if (!Util.isPureObject(data)) throw new Error(`invalid cfg: ${data}`);

    // query
    const op = 'JsonQuery()';
    debug(fx,op,'←',q,data);
    const result = JsonQuery(q, { ...data });
    //debug(fx,op,'result:', result);
    debug(fx,op,'→',result);

    if ( Util.isObject(result) && ('value' in result) && result.value !== null )
      out = result.value;

    // not found or other failure
    debug(fx,'→',out);
    return out;
  }*/

  async doesConfigPathExist(appname)
  {

  }

  async save(fn)
  {
    const fx = '.save()';
    debug(fx,'←',fn);

    // initial
    let data = this.data;

    // sanity: fn
    if ( ! fn ) {
      const mkdir = true;
      const path = Util.osConfigPath(this.name,mkdir);
      fn = NodePath.join(path,MyConfig.config_fn);
      debug(fx,'fn:',fn);
    }

    // sanity: ext
    let str, ext = NodePath.extname(fn);
    if ( ext != '.ini' && ext != '.json' )
      throw new Error(`only ini/json supported: ${ext}`);

    // encode
    if (data.size==0) str = '';
    else if (ext=='.ini') str = Ini.encode( data );
    else if (ext=='.json') str = Json.encode( Util.mapToObject(data) );

    // write
    await NodeFs.promises.writeFile( fn, str, { encoding: 'utf8' } );

    // success
    this.dirty = null;
    const out = true;
    debug(fx,'→',out);
    return out;
  }

  saveSync(fn)
  {
    const fx = '.saveSync()';
    debug(fx,'←',fn);

    // initial
    let data = this.data;

    // sanity: fn
    if ( ! fn ) {
      const mkdir = true;
      const path = Util.osConfigPath(this.name,mkdir);
      fn = NodePath.join(path,MyConfig.config_fn);
      debug(fx,'fn:',fn);
    }

    // sanity: ext
    let ext = NodePath.extname(fn);
    if ( ext != '.ini' && ext != '.json' )
      throw new Error(`only ini/json supported: ${ext}`);

    // encode
    let str;
    if (data.size==0) str = '';
    else if (ext=='.ini') str = Ini.encode( data );
    else if (ext=='.json') str = Json.encode( Util.mapToObject(data) );

    // write
    NodeFs.writeFileSync(fn, str, { encoding: 'utf8' });

    // success
    this.dirty = null;
    const out = true;
    debug(fx,'→',out);
    return out;
  }

  static async load(...options)
  {
    const fx = '.load()';
    debug(fx,'←',...options);

    let path, dir, fn, ext, opts = {};

    // parse options
    options.forEach( (opt) => {
      if (Util.isString(opt)) {
        if (['.ini','.json'].includes(NodePath.extname(opt)))
          path = opt;
        else opts.name = opt;
      }
      else if (Util.isObject(opt)) Object.assign(opts,opt);
      else if (Util.isBoolean(opt)) opts.ignore_not_found = opt;
      else throw new Error(`invalid option: ${opt}`);
    });

    // sanity
    if (!Util.isString(opts.name)) throw new Error(`invalid opts.name, must be string: ${opts.name}`);
    if (opts.name.indexOf('.')>-1) throw new Error('invalid opts.name, punctuation not allowed: '+ opts.name);
    if (opts.name.indexOf('/')>-1) throw new Error('invalid opts.name, slash not allowed: '+ opts.name);
    if (opts.name.indexOf('\\')>-1) throw new Error('invalid opts.name, slash not allowed: '+ opts.name);
    if (path && !fn) fn = NodePath.basename(path);
    if (path && !dir) dir = NodePath.dirname(path);
    if (!dir) dir = Util.osConfigPath(this.name); // do not mkdir
    if (!fn) fn = MyConfig.config_fn;
    if (fn && !ext) ext = NodePath.extname(fn);
    if (!['.ini','.json'].includes(ext)) throw new Error(`only ini/json supported: ${fn}`);
    if (!path && dir && fn) path = NodePath.join(dir,fn);
    if (!path) throw new Error('failed to build path');

    // catch thrown errors
    let str;
    try {
      const params = { encoding: 'utf8' };
      debug(fx,'readFile() <--',path,params);
      str = await NodeFs.promises.readFile(path,params);
      debug(fx,'readFile() -->',str);
    }
    catch (e) {
      debug(fx,'caught:',e);
      if ( opts.ignore_not_found && e.code == 'ENOENT' ) {} // ignore
      else throw e;
    }

    // deserialize
    let map = new Map();
    if (str) switch (ext) {
      case '.ini': map = Ini.decode(str,map); break;
      case '.json': map = Json.decode(str,map); break;
    }
    if (!Util.isMap(map)) throw new Error('failed to parse: '+path);

    // instanciate
    let params = { ...opts };
    if (map) params.data = map;
    if (dir) params.dir = dir;
    const cfg = new MyConfig(params);

    // success
    debug(fx,'→',cfg);
    return cfg;
  }

  static loadSync(...options)
  {
    const fx = '.loadSync()';
    debug(fx,'←',...options);

    let path, dir, fn, ext, opts = {};

    // parse options
    options.forEach( (opt) => {
      if (Util.isString(opt)) {
        if (['.ini','.json'].includes(NodePath.extname(opt)))
          fn = opt;
        else opts.name = opt;
      }
      else if (Util.isObject(opt)) Object.assign(opts,opt);
      else if (Util.isBoolean(opt)) opts.ignore_not_found = opt;
      else throw new Error(`invalid option: ${opt}`);
    });

    // sanity
    if (!Util.isString(opts.name)) throw new Error(`invalid opts.name, must be string: ${opts.name}`);
    if (opts.name.indexOf('.')>-1) throw new Error('invalid opts.name, punctuation not allowed: '+ opts.name);
    if (opts.name.indexOf('/')>-1) throw new Error('invalid opts.name, slash not allowed: '+ opts.name);
    if (opts.name.indexOf('\\')>-1) throw new Error('invalid opts.name, slash not allowed: '+ opts.name);
    if (path && !fn) fn = NodePath.basename(path);
    if (path && !dir) dir = NodePath.dirname(path);
    if (!dir) dir = Util.osConfigPath(this.name); // do not mkdir
    if (!fn) fn = MyConfig.config_fn;
    if (fn && !ext) ext = NodePath.extname(fn);
    if (!['.ini','.json'].includes(ext)) throw new Error(`only ini/json supported: ${fn}`);
    if (!path && dir && fn) path = NodePath.join(dir,fn);
    if (!path) throw new Error('failed to build path');

    // catch thrown errors
    let str;
    try {
      const params = { encoding: 'utf8' };
      debug(fx,'readFileSync() <--',path,params)
      str = NodeFs.readFileSync(path,params);
      debug(fx,'readFileSync() -->',str);
    }
    catch (e) {
      debug(fx,'caught:',e);
      if ( opts.ignore_not_found && e.code == 'ENOENT' ) {} // ignore
      else throw e;
    }

    // deserialize
    let map = new Map();
    if (str) switch (ext) {
      case '.ini': map = Ini.decode(str,map); break;
      case '.json': map = Json.decode(str,map); break;
    }
    if (!Util.isMap(map)) throw new Error('failed to parse: '+path);

    // instanciate
    let params = { ...opts };
    if (map) params.data = map;
    if (dir) params.dir = dir;
    const cfg = new MyConfig(params);

    // success
    debug(fx,'→',cfg);
    return cfg;
  }

  set dirty(val)
  {
    const fx = '.dirty';
    const sd = this.#sd;
    if ( ! val ) {
      sd.dirty = [];
      if ( MyConfig.pd ) debug(fx,'←',val);
    }
    else if ( typeof val == 'string' ) {
      if ( !Array.isArray(sd.dirty) ) sd.dirty = [];
      sd.dirty.push(val);
    }
    else if ( Array.isArray(val) ) sd.dirty = val;
    else throw new Error('invalid parameter: '+val);
  }

  get dirty()
  {
    const fx = '.dirty';
    const sd = this.#sd;
    let out = sd.dirty.length;
    if ( MyConfig.pd ) debug(fx,'→',out);
    return out;
  }

  static setDirty(arr,key)
  {
    const fx = '.setDirty()';
    debug(fx,'←',key);
    if ( ! Array.isArray(arr) ) return;
    if ( arr.includes(key) ) return;
    arr.push(key);
  }

  /*[NodeUtil.inspect.custom](depth, options)
  {
    const classname = this.constructor.name;
    const desc = [classname];
    if ( this.id ) desc.push( this.id.split('_')[1] );
    let out = options.stylize('['+desc.join(' ')+']','special');
    return out;
  }*/
}

module.exports = MyConfig;
