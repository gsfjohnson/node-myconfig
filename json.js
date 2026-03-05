
const Util = require('./util');

let debug; try { debug = require('debug')('myconfig:json'); }
catch (e) { debug = function(){}; } // empty stub

class Json
{
  static encode(obj)
  {
    //if (!Util.isPureObject(obj)) throw new Error(`invalid object: ${obj}`);
    obj = Util.mapToObject(obj);
    let out = JSON.stringify(obj);
    return out;
  }

  static decode(str,data)
  {
    if (Buffer.isBuffer(str)) str = str.toString('utf8');
    if (!Util.isString(str)) throw new Error(`invalid string: ${str}`);
    let out = JSON.parse(str);
    out = Util.objectToMap(out,data);
    return out;
  }

}

module.exports = Json
