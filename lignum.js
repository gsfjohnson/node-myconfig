const Lignum = require('@gsfjohnson/lignum');

class MyConfigDebugLog
{
  static log;
}

if ( ! MyConfigDebugLog.log ) {
  MyConfigDebugLog.log = new Lignum({
    env: 'CFG_LIGNUM',
    channel: 'mycfg',
    datefmt: 'MM-DD HH:mm:ss.SSS',
  });
}

module.exports = MyConfigDebugLog.log;
