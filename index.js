
const NodePath = require('node:path');
const NodeFs = require('node:fs');
const NodeOs = require('node:os');
const NodeUtil = require('node:util');
const NodeFilePromise = require('node:fs/promises');

const Util = require('./util');

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
    if ( Buffer.isBuffer(opts) )
      opts = { cfg: MyConfig.deserialize(opts) };
    if ( ! Util.isPureObject(opts) ) opts = {};
    if ( Util.isPureObject(opts.cfg) ) sd.cfg = opts.cfg;

    // process updated after construction phase
    delete sd.constructing;

    // complete
    debug(ld.fx,'=>',this);
  }

  set(key,value)
  {
    const ld = { cl: this, fx: '.set()' };
    const sd = this.#sd;
    debug(ld.fx,key,'<=',value);
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
    debug(ld.fx,key,'⇒',value);
    return value;
  }

  serialize(cfg)
  {
    // XXX: serialize MyConfig for save()
    let obj = this.raw;
    if ( ! Util.isPureObject(obj) ) obj = {};
    let cfgString = JSON.stringify(obj);
    // success
    return cfgString;
  }

  static deserialize(cfgString)
  {
    const ld = { cl: 'MyConfig', fx: '.deserialize()' };
    debug(ld.fx,cfgString);

    // reinstanciate MyConfig from load()
    //const cfg = new MyConfig();

    // XXX: deserialize
    let out = JSON.parse(cfgString);
    //console.log('deserialize:',cfg.raw);

    // success
    debug(ld.fx,'⇒',out);
    return out;
  }

  async saveToFile(fn)
  {
    const ld = { cl: 'MyConfig', fx: '.saveToFile()' };
    debug(ld.fx,'←',fn);
    const sd = this.#sd;
    if ( ! fn ) {
      fn = MyConfig.os_local_path({ mkdir: 1, fn: 'app.json' });
      debug(ld.fx,'fn:',fn);
    }
    await NodeFilePromise.writeFile( fn, this.serialize() );
    // success
    this.dirty = null;
    const out = true;
    debug(ld.fx,out);
    return out;
  }

  static async loadFromFile(fn,ignore_not_found=true)
  {
    const ld = { cl: 'MyConfig', fx: '.loadFromFile()' };
    debug(ld.fx,'←',fn);

    // catch thrown errors
    let buff;
    try {
      if ( ! fn ) {
        fn = MyConfig.os_local_path({ mkdir: 1, fn: 'app.json' });
        debug(ld.fx,'fn:',fn);
      }
      buff = await NodeFilePromise.readFile(fn);
    }
    catch (e) {
      debug(ld.fx,'caught:',e);
      if ( ignore_not_found && e.code == 'ENOENT' ) {} // ignore
      else throw e;
    }

    // deserialize
    const cfg = new MyConfig(buff);

    // success
    debug(ld.fx,'=>',cfg);
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
    if ( ! Array.isArray(arr) ) return;
    if ( arr.includes(key) ) return;
    arr.push(key);
  }

  static os_local_path(opts)
  {
    const ld = { cl: 'Cj', fx: '.os_local_path()' };
    debug(ld.fx,opts);

    // initial
    let out;
    let os_platform = NodeOs.platform();
    let os_homedir = NodeOs.homedir();

    // sanity: opts
    if ( ! Util.isPureObject(opts) ) opts = {};

    // operation
    let path;
    switch (os_platform)
    {
      case 'win32':
        path = NodePath.join(os_homedir,'AppData','Local',Config.app_name);
        break;
      case 'darwin':
      case 'linux':
        path = NodePath.join(os_homedir,'.config',Config.app_name);
        break;
      default:
        throw new Error('unsupported platform: '+ os_platform);
    }

    // mkdir
    if ( opts.mkdir ) {
      debug(ld.fx,'mkdirSync:',path);
      NodeFs.mkdirSync(path, { recursive: true });
    }

    // build final path
    if ( ! Util.isString(opts.fn) ) out = path;
    else out = NodePath.join( path, opts.fn );

    // return
    debug(ld.fx,'⇒',out);
    return out;
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
