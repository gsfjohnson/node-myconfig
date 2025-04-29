const Util = require('./util');

let debug; try { debug = require('debug')('myconfig:ini'); }
catch (e) { debug = function(){}; } // empty stub

// methods from https://github.com/npm/ini/blob/main/lib/ini.js

const { hasOwnProperty } = Object.prototype

function splitSections (str, separator) {
  var lastMatchIndex = 0
  var lastSeparatorIndex = 0
  var nextIndex = 0
  var sections = []

  do {
    nextIndex = str.indexOf(separator, lastMatchIndex)

    if (nextIndex !== -1) {
      lastMatchIndex = nextIndex + separator.length

      if (nextIndex > 0 && str[nextIndex - 1] === '\\') {
        continue
      }

      sections.push(str.slice(lastSeparatorIndex, nextIndex))
      lastSeparatorIndex = nextIndex + separator.length
    }
  } while (nextIndex !== -1)

  sections.push(str.slice(lastSeparatorIndex))

  return sections
}

function isQuoted(val)
{
  return (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
}

function safe(val)
{
  if (
    typeof val !== 'string' ||
    val.match(/[=\r\n]/) ||
    val.match(/^\[/) ||
    (val.length > 1 && isQuoted(val)) ||
    val !== val.trim()
  ) {
    return JSON.stringify(val)
  }
  return val.split(';').join('\\;').split('#').join('\\#')
}

function unsafe(val)
{
  val = (val || '').trim()
  if (isQuoted(val)) {
    // remove the single quotes before calling JSON.parse
    if (val.charAt(0) === "'") {
      val = val.slice(1, -1)
    }
    try {
      val = JSON.parse(val)
    } catch {
      // ignore errors
    }
  } else {
    // walk the val to find the first not-escaped ; character
    let esc = false
    let unesc = ''
    for (let i = 0, l = val.length; i < l; i++) {
      const c = val.charAt(i)
      if (esc) {
        if ('\\;#'.indexOf(c) !== -1) {
          unesc += c
        } else {
          unesc += '\\' + c
        }

        esc = false
      } else if (';#'.indexOf(c) !== -1) {
        break
      } else if (c === '\\') {
        esc = true
      } else {
        unesc += c
      }
    }
    if (esc) {
      unesc += '\\'
    }

    return unesc.trim()
  }
  return val
}

function strToType(val)
{
  const ld = { fx: 'strToType()' };
  let out = val;
  if ( val === 'null' ) out = null;
  if ( val === 'true' ) out = true;
  if ( val === 'false' ) out = false;
  debug(ld.fx,val,'→',out);
  return out;
}

class Ini
{

  static encode(...options)
  {
    const ld = { fx: '.encode()' };
    debug(ld.fx,'←',...options);

    // parse options
    let map, obj, opts = {};
    while (options.length) {
      let opt = options.shift();
      if (Util.isMap(opt)) { map = opt; continue }
      else if (Util.isPureObject(opt)) Object.assign(opts,opt);
      else throw new Error(`invalid option: ${opt}`);
    }

    // sanity
    if (!map) throw new Error(`invalid map: ${map}`);
    obj = Util.mapToObject(map);

    // initial
    opts.align = opts.align === true;
    opts.newline = opts.newline === true;
    opts.sort = opts.sort === true;
    opts.whitespace = opts.whitespace === true || opts.align === true;
    // The `typeof` check is required because accessing the `process` directly fails on browsers.
    /* istanbul ignore next */
    opts.platform = opts.platform || (typeof process !== 'undefined' && process.platform)
    opts.bracketedArray = opts.bracketedArray !== false
  
    /* istanbul ignore next */
    const eol = opts.platform === 'win32' ? '\r\n' : '\n'
    const separator = opts.whitespace ? ' = ' : '='
    const children = []
  
    //const keys = Array.from(obj, ([key, value]) => (key));
    const keys = opts.sort ? Object.keys(obj).sort() : Object.keys(obj)
  
    let padToChars = 0
    // If aligning on the separator, then padToChars is determined as follows:
    // 1. Get the keys
    // 2. Exclude keys pointing to objects unless the value is null or an array
    // 3. Add `[]` to array keys
    // 4. Ensure non empty set of keys
    // 5. Reduce the set to the longest `safe` key
    // 6. Get the `safe` length
    if (opts.align) {
      padToChars = safe(
        (
          keys
            .filter(k => obj[k] === null || Array.isArray(obj[k]) || typeof obj[k] !== 'object')
            .map(k => Array.isArray(obj[k]) ? `${k}[]` : k)
        )
          .concat([''])
          .reduce((a, b) => safe(a).length >= safe(b).length ? a : b)
      ).length
    }
  
    let out = ''
    const arraySuffix = opts.bracketedArray ? '[]' : ''
  
    for (const k of keys) {
      const val = obj[k]
      if (val && Array.isArray(val)) {
        for (const item of val) {
          out += safe(`${k}${arraySuffix}`).padEnd(padToChars, ' ') + separator + safe(item) + eol
        }
      } else if (val && typeof val === 'object') {
        children.push(k)
      } else {
        out += safe(k).padEnd(padToChars, ' ') + separator + safe(val) + eol
      }
    }
  
    if (opts.section && out.length) {
      out = '[' + safe(opts.section) + ']' + (opts.newline ? eol + eol : eol) + out
    }
  
    for (const k of children) {
      const nk = splitSections(k, ' ').join(' ')
      const section = (opts.section ? opts.section + ' ' : '') + nk
      const child = Ini.encode( Util.objectToMap(obj[k]), {
        ...opts,
        section,
      })
      if (out.length && child.length) {
        out += eol
      }
  
      out += child
    }
  
    debug(ld.fx,'→',out);
    return out
  }
  
  static decode(...options)
  {
    const ld = { fx: '.decode()' };
    debug(ld.fx,'←',...options);

    let str, out, opts = {}

    // parse options
    while (options.length) {
      let opt = options.shift();
      if (Util.isString(opt)) { str = opt; continue }
      else if (Util.isMap(opt)) out = opt;
      else if (Util.isPureObject(opt)) Object.assign(opts,opt);
      else throw new Error(`invalid option: ${opt}`);
    }
    
    // initial
    if (!out) out = new Map();
    opts.bracketedArray = opts.bracketedArray !== false
    let p = out;
    let section = null
    //          section          |key      = value
    const re = /^\[([^\]]*)\]\s*$|^([^=]+)(=(.*))?$/i
    const duplicates = {}

    // initial parse input
    if ( typeof str != 'string' ) throw new Error('invalid parameter: must be string');
    if ( !str.length ) return out;
    const lines = str.split(/[\r\n]+/g)

    for (const line of lines)
    {
      if (!line || line.match(/^\s*[;#]/) || line.match(/^\s*$/)) continue;
      const match = line.match(re)
      if (!match) continue;

      // [section]
      if (match[1] !== undefined) {
        section = unsafe(match[1]);
        debug(ld.fx,'found section:',section);

        let sectionParts = section.split(' ');
        let currentSection = out;

        for (let i = 0; i < sectionParts.length; i++) {
          const part = sectionParts[i];
          if (!part) continue; // Skip empty parts

          if (i === sectionParts.length - 1) {
            // Last part - set up the final section
            p = currentSection.get(part);
            if (!p) {
              p = new Map();
              currentSection.set(part, p);
            }
          } else {
            // Navigate through nested sections
            if (!currentSection.has(part)) {
              currentSection.set(part, new Map());
            }
            currentSection = currentSection.get(part);
          }
        }
        continue;
      }

      // key = value
      const keyRaw = unsafe(match[2]);
      let isArray;
      if (opts.bracketedArray) {
        isArray = keyRaw.length > 2 && keyRaw.slice(-2) === '[]'
      } else {
        duplicates[keyRaw] = (duplicates?.[keyRaw] || 0) + 1
        isArray = duplicates[keyRaw] > 1
      }
      const key = isArray && keyRaw.endsWith('[]')
        ? keyRaw.slice(0, -2) : keyRaw

      const valueRaw = match[3] ? unsafe(match[4]) : true;
      const value = typeof valueRaw === 'string' ? strToType(valueRaw) : valueRaw;

      // Convert keys with '[]' suffix to an array
      if (isArray) {
        if (!p.has(key)) p.set(key, []);
        else if (!Array.isArray(p.get(key))) {
          const oldValue = p.get(key);
          p.set(key, [oldValue]);
        }
      }

      // safeguard against resetting a previously defined
      // array by accidentally forgetting the brackets
      if ( Array.isArray(p.get(key)) ) p.get(key).push(value);
      else p.set(key,value);
    }

    debug(ld.fx,'→',out);
    return out;
  }

}

module.exports = Ini;
