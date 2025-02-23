
const NodePath = require('node:path');
const NodeUtil = require('node:util');
const NodeFsPromise = require('node:fs/promises');

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

  constructor(opts)
  {
    const ld = { cl: 'MyConfig', fx: '.constructor()' };
    debug(ld.fx,'←',opts);

    // initial
    const id = this.id = 'mycfg_'+Util.rand_string(2);
    const sd = this.#sd = {
      cfg: {},
      dirty: [],
      constructing: true,
    };

    // sanity: opts
    if ( ! Util.isPureObject(opts) ) opts = {};
    if ( Util.isPureObject(opts.cfg) ) sd.cfg = opts.cfg;

    // process updated after construction phase
    delete sd.constructing;

    // complete
    debug(ld.fx,'→',this);
  }

  set(key,value)
  {
    const ld = { cl: this, fx: '.set()' };
    const sd = this.#sd;
    debug(ld.fx,key,'←',value);
    if ( value === undefined )
      delete this.raw[key];
    else this.raw[key] = value;
    // set dirty
    if ( ! sd.constructing ) {
      MyConfig.setDirty(sd.dirty,key);
      //this.updated = new Date();
    }
    return true;
  }

  get(key)
  {
    const ld = { cl: this, fx: '.get()' };
    const value = this.raw[key];
    debug(ld.fx,key,'→',value);
    return value;
  }

  async saveToFile(fn)
  {
    const ld = { cl: 'MyConfig', fx: '.saveToFile()' };
    debug(ld.fx,'←',fn);
    const sd = this.#sd;
    let length = Object.keys(sd.cfg).length;
    if ( ! fn ) {
      fn = MyConfig.os_local_path({ mkdir: 1, fn: 'app.json' });
      debug(ld.fx,'fn:',fn);
    }
    let str, ext = NodePath.extname(fn);
    if ( ext != '.ini' && ext != '.json' )
      throw new Error(`only ini/json supported: ${ext}`);
    // encode
    if (length==0) str = '';
    else if (ext=='.ini') str = Ini.encode(sd.cfg);
    else if (ext=='.json') str = Json.encode(sd.cfg);
    // write
    await NodeFsPromise.writeFile( fn, str );
    // success
    this.dirty = null;
    const out = true;
    debug(ld.fx,'→',out);
    return out;
  }

  static async loadFromFile(fn,ignore_not_found=true)
  {
    const ld = { cl: 'MyConfig', fx: '.loadFromFile()' };
    debug(ld.fx,'←',fn);

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
      buff = await NodeFsPromise.readFile(fn);
    }
    catch (e) {
      debug(ld.fx,'caught:',e);
      if ( ignore_not_found && e.code == 'ENOENT' ) {} // ignore
      else throw e;
    }

    // deserialize
    let obj;
    if ( ext == '.ini' ) obj = Ini.decode(buff);
    else if ( ext == '.json' ) obj = Json.decode(buff);
    if (!Util.isPureObject(obj)) throw new Error(`failed to parse ${fn}`);

    // instanciate
    const cfg = new MyConfig({ cfg: obj });

    // success
    debug(ld.fx,'→',cfg);
    return cfg;
  }

  get raw()
  {
    return this.#sd.cfg;
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

  [NodeUtil.inspect.custom](depth, options)
  {
    const classname = this.constructor.name;
    const desc = [classname];
    if ( this.id ) desc.push( this.id.split('_')[1] );
    let out = options.stylize('['+desc.join(' ')+']','special');
    return out;
  }
}

module.exports = MyConfig;
