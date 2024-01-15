
const NodePath = require('node:path');
const NodeFs = require('node:fs');
const NodeOs = require('node:os');
const NodeUtil = require('node:util');
const NodeFilePromise = require('node:fs/promises');

const Gtil = require('@gsfjohnson/gtil');
const lig = require('./lignum');


class MyConfig
{
  static pd = true; // property debug
  static app_name = 'MyConfig';
  #sd;

  constructor(opts)
  {
    const ld = { cl: 'MyConfig', fx: '.constructor()' };
    lig.debug(ld,'←',opts);

    // initial
    const id = this.id = 'mycfg_'+Gtil.rand_string(2);
    const sd = this.#sd = {
      cfg: {},
      dirty: [],
      constructing: true,
    };

    // sanity: opts
    if ( Buffer.isBuffer(opts) )
      opts = { cfg: MyConfig.deserialize(opts) };
    if ( ! Gtil.isPureObject(opts) ) opts = {};
    if ( Gtil.isPureObject(opts.cfg) ) sd.cfg = opts.cfg;

    // process updated after construction phase
    delete sd.constructing;

    // complete
    lig.debug(ld,'=>',this);
  }

  set(key,value)
  {
    const ld = { cl: this, fx: '.set()' };
    const sd = this.#sd;
    lig.debug(ld,key,'<=',value);
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
    lig.debug(ld,key,'⇒',value);
    return value;
  }

  serialize(cfg)
  {
    // XXX: serialize MyConfig for save()
    let obj = this.raw;
    if ( ! Gtil.isPureObject(obj) ) obj = {};
    let cfgString = JSON.stringify(obj);
    // success
    return cfgString;
  }

  static deserialize(cfgString)
  {
    const ld = { cl: 'MyConfig', fx: '.deserialize()' };
    lig.debug(ld,cfgString);

    // reinstanciate MyConfig from load()
    //const cfg = new MyConfig();

    // XXX: deserialize
    let out = JSON.parse(cfgString);
    //console.log('deserialize:',cfg.raw);

    // success
    lig.debug(ld,'⇒',out);
    return out;
  }

  async saveToFile(fn)
  {
    const ld = { cl: 'MyConfig', fx: '.saveToFile()' };
    lig.debug(ld,'←',fn);
    const sd = this.#sd;
    if ( ! fn ) {
      fn = MyConfig.os_local_path({ mkdir: 1, fn: 'app.json' });
      lig.debug(ld,'fn:',fn);
    }
    await NodeFilePromise.writeFile( fn, this.serialize() );
    // success
    this.dirty = null;
    const out = true;
    lig.debug(ld,out);
    return out;
  }

  static async loadFromFile(fn,ignore_not_found=true)
  {
    const ld = { cl: 'MyConfig', fx: '.loadFromFile()' };
    lig.debug(ld,'←',fn);

    // catch thrown errors
    let buff;
    try {
      if ( ! fn ) {
        fn = MyConfig.os_local_path({ mkdir: 1, fn: 'app.json' });
        lig.debug(ld,'fn:',fn);
      }
      buff = await NodeFilePromise.readFile(fn);
    }
    catch (e) {
      lig.error(ld,'caught:',e);
      if ( ignore_not_found && e.code == 'ENOENT' ) {} // ignore
      else throw e;
    }

    // deserialize
    const cfg = new MyConfig(buff);

    // success
    lig.debug(ld,'=>',cfg);
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
      if ( MyConfig.pd ) lig.debug(ld,'⇐',val);
    }
  }

  get dirty()
  {
    const ld = { cl: this, fx: '.dirty' };
    const sd = this.#sd;
    let out = sd.dirty.length;
    if ( MyConfig.pd ) lig.debug(ld,'⇒',out);
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
    lig.debug(ld,opts);

    // initial
    let out;
    let os_platform = NodeOs.platform();
    let os_homedir = NodeOs.homedir();

    // sanity: opts
    if ( ! Gtil.isPureObject(opts) ) opts = {};

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
      lig.debug(ld,'mkdirSync:',path);
      NodeFs.mkdirSync(path, { recursive: true });
    }

    // build final path
    if ( ! Gtil.isString(opts.fn) ) out = path;
    else out = NodePath.join( path, opts.fn );

    // return
    lig.debug(ld,'⇒',out);
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
