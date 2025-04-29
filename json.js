
const Util = require('./util');

let debug; try { debug = require('debug')('myconfig:json'); }
catch (e) { debug = function(){}; } // empty stub

class Json
{
  static encode(obj)
  {
    const ld = { fx: '.encode()' };
    //debug(ld.fx,'←',obj);
    //if (!Util.isPureObject(obj)) throw new Error(`invalid object: ${obj}`);
    obj = Util.mapToObject(obj);
    let out = JSON.stringify(obj);
    debug(ld.fx,'→',out);
    return out;
  }

  static decode(str,data)
  {
    const ld = { fx: '.decode()' };
    if (Buffer.isBuffer(str)) str = str.toString('utf8');
    if (!Util.isString(str)) throw new Error(`invalid string: ${str}`);
    //debug(ld.fx,'←',str);
    let out = JSON.parse(str);
    out = Util.objectToMap(out,data);
    debug(ld.fx,'→',out);
    return out;
  }

}

module.exports = Json
