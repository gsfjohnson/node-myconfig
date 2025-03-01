
const NodePath = require('node:path');
const NodeUtil = require('node:util');
const NodeFsPromise = require('node:fs/promises');

const JsonQuery = require('json-query');

const Util = require('./util');
const Ini = require('./ini');
const Json = require('./json');

let debug; try { debug = require('debug')('myconfig'); }
catch (e) { debug = function(){}; } // empty stub


class MyConfig
{
  static pd = true; // property debug
  static app_name = 'MyConfig';
  #sd;

  constructor(...options)
  {
    const ld = { cl: 'MyConfig', fx: '.constructor()' };
    debug(ld.fx,'←',...options);

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
    if (!Util.isString(opts.name))
      throw new Error('invalid name: must be string');
    if ( Util.isMap(opts.data) )
      this.data = new Map( JSON.parse(JSON.stringify([...opts.data])) ); // deep clone

    // process updated after construction phase
    delete sd.constructing;
    Object.freeze(this);

    // complete
    debug(ld.fx,'→',this);
  }

  set(key,val)
  {
    const ld = { cl: this, fx: '.set()' };
    debug(ld.fx,'←',key,val);

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
      debug(ld.fx,`selecting: ${k}`);

      // create object if...
      v = data.get(k);
      if ( keys.length > 0 && !Util.isMap(v) )
      {
        debug(ld.fx,'new key:',k);
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
    debug(ld.fx,`selecting: ${k}`);
    debug(ld.fx,`setting: ${key} ← ${val}`);
    data.set(k,val);
    this.dirty = true;
    out = true; // success

    // return
    debug(ld.fx,'→',out);
    return out;
  }

  get(key)
  {
    const ld = { cl: this, fx: '.get()' };
    debug(ld.fx,key);

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
      debug(ld.fx,'selecting:',k);
      data = data.get(k);
      if (!Util.isMap(data)) break;
    }
    //debug(ld.fx,'data:',data);

    // always clone objects
    if (Util.isMap(data))
      data = new Map( JSON.parse(JSON.stringify([...data])) ); // deep clone

    debug(ld.fx,key,'→',out);
    return out;
  }

  delete(key)
  {
    const ld = { cl: this, fx: '.delete()' };
    debug(ld.fx,'←',key);

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
      debug(ld.fx,`selecting: ${k}`);

      data = data.get(k);

      // continue diving
      if (!Util.isMap(data)) break;
    }

    // when keys remain, diving was unsuccessful
    if ( keys.length > 1 )
    {
      debug(ld.fx,'key not found:',keys.join('.'));
      success = false;
    }
    else if ( keys.length === 1 )
    {
      const k = keys.shift();
      debug(ld.fx,`deleting: ${k}`);
      success = data.delete(k);
    }

    // return
    const out = success ? true : false;
    debug(ld.fx,key,'→',out);
    return out;
  }

  /*query(q)
  {
    const ld = { cl: this, fx: '.query()' };
    debug(ld.fx,'←',q);

    // initial
    const data = this.#sd.cfg;
    let out;

    // sanity
    if (!Util.isString(q)) throw new Error(`invalid query: ${q}`);
    if (!Util.isPureObject(data)) throw new Error(`invalid cfg: ${data}`);

    // query
    const op = 'JsonQuery()';
    debug(ld.fx,op,'←',q,data);
    const result = JsonQuery(q, { ...data });
    //debug(ld.fx,op,'result:', result);
    debug(ld.fx,op,'→',result);

    if ( Util.isObject(result) && ('value' in result) && result.value !== null )
      out = result.value;

    // not found or other failure
    debug(ld.fx,'→',out);
    return out;
  }*/

  async doesConfigPathExist(appname)
  {

  }

  async saveToFile(fn)
  {
    const ld = { cl: 'MyConfig', fx: '.saveToFile()' };
    debug(ld.fx,'←',fn);

    // initial
    let data = this.data;

    // sanity
    if ( ! fn ) {
      fn = Util.os_local_path({ mkdir: 1, fn: 'app.json' });
      debug(ld.fx,'fn:',fn);
    }
    let str, ext = NodePath.extname(fn);

    if ( ext != '.ini' && ext != '.json' )
      throw new Error(`only ini/json supported: ${ext}`);
    // encode
    if (data.size==0) str = '';
    else if (ext=='.ini') str = Ini.encode( Util.mapToObject(data) );
    else if (ext=='.json') str = Json.encode( Util.mapToObject(data) );
    // write
    await NodeFsPromise.writeFile( fn, str, { encoding: 'utf8' } );
    // success
    this.dirty = null;
    const out = true;
    debug(ld.fx,'→',out);
    return out;
  }

  static async loadFromFile(fn,opts={})
  {
    const ld = { cl: 'MyConfig', fx: '.loadFromFile()' };
    debug(ld.fx,'←',fn,opts);

    // catch thrown errors
    let ext, buff;
    try {
      if ( ! fn ) {
        fn = Util.os_local_path({ mkdir: 1, fn: 'app.json' });
        debug(ld.fx,'fn:',fn);
      }
      ext = NodePath.extname(fn);
      if ( ext != '.ini' && ext != '.json' )
        throw new Error(`invalid ext, only ini/json supported: ${ext}`)
      buff = await NodeFsPromise.readFile( fn, { encoding: 'utf8' } );
    }
    catch (e) {
      debug(ld.fx,'caught:',e);
      if ( opts.ignore_not_found && e.code == 'ENOENT' ) {} // ignore
      else throw e;
    }

    // deserialize
    let obj;
    if ( ext == '.ini' ) obj = Ini.decode(buff);
    else if ( ext == '.json' ) obj = Json.decode(buff);
    if (!Util.isMap(obj)) throw new Error(`failed to parse ${fn}`);

    // instanciate
    const cfg = new MyConfig({ ...opts, data: obj });

    // success
    debug(ld.fx,'→',cfg);
    return cfg;
  }

  set dirty(val)
  {
    const ld = { cl: this, fx: '.dirty' };
    const sd = this.#sd;
    if ( ! val ) {
      sd.dirty = [];
      if ( MyConfig.pd ) debug(ld.fx,'⇐',val);
    }
  }

  get dirty()
  {
    const ld = { cl: this, fx: '.dirty' };
    const sd = this.#sd;
    let out = sd.dirty.length;
    if ( MyConfig.pd ) debug(ld.fx,'⇒',out);
    return out;
  }

  static setDirty(arr,key)
  {
    const ld = { fx: '.setDirty()' };
    debug(ld.fx,'←',key);
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
