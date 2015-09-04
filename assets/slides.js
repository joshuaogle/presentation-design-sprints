(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

require("core-js/shim");

require("regenerator/runtime");

if (global._babelPolyfill) {
  throw new Error("only one instance of babel/polyfill is allowed");
}
global._babelPolyfill = true;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"core-js/shim":164,"regenerator/runtime":165}],2:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],3:[function(require,module,exports){
var isObject = require('./$.is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./$.is-object":32}],4:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toObject = require('./$.to-object')
  , toLength = require('./$.to-length')
  , toIndex  = require('./$.to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index;
    } return !IS_INCLUDES && -1;
  };
};
},{"./$.to-index":65,"./$.to-length":67,"./$.to-object":68}],5:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var toObject  = require('./$.to-object')
  , ES5Object = require('./$.es5-object')
  , ctx       = require('./$.ctx')
  , toLength  = require('./$.to-length');
module.exports = function(TYPE){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX;
  return function($this, callbackfn, that){
    var O      = toObject($this, true)
      , self   = ES5Object(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = IS_MAP ? Array(length) : IS_FILTER ? [] : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./$.ctx":14,"./$.es5-object":19,"./$.to-length":67,"./$.to-object":68}],6:[function(require,module,exports){
var toObject  = require('./$.to-object')
  , ES5Object = require('./$.es5-object')
  , enumKeys  = require('./$.enum-keys');
// 19.1.2.1 Object.assign(target, source, ...)
/* eslint-disable no-unused-vars */
module.exports = Object.assign || function assign(target, source){
/* eslint-enable no-unused-vars */
  var T = toObject(target, true)
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = ES5Object(arguments[i++])
      , keys   = enumKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
};
},{"./$.enum-keys":18,"./$.es5-object":19,"./$.to-object":68}],7:[function(require,module,exports){
var cof = require('./$.cof')
  , TAG = require('./$.wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./$.cof":8,"./$.wks":71}],8:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],9:[function(require,module,exports){
'use strict';
var $            = require('./$')
  , hide         = require('./$.hide')
  , ctx          = require('./$.ctx')
  , species      = require('./$.species')
  , strictNew    = require('./$.strict-new')
  , defined      = require('./$.defined')
  , forOf        = require('./$.for-of')
  , step         = require('./$.iter-step')
  , ID           = require('./$.uid')('id')
  , $has         = require('./$.has')
  , isObject     = require('./$.is-object')
  , isExtensible = Object.isExtensible || isObject
  , SUPPORT_DESC = require('./$.support-desc')
  , SIZE         = SUPPORT_DESC ? '_s' : 'size'
  , id           = 0;

function fastKey(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!$has(it, ID)){
    // can't set id to frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add id
    if(!create)return 'E';
    // add missing object id
    hide(it, ID, ++id);
  // return object id with prefix
  } return 'O' + it[ID];
}

function getEntry(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
}

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      strictNew(that, C, NAME);
      that._i = $.create(null); // index
      that._f = undefined;      // first entry
      that._l = undefined;      // last entry
      that[SIZE] = 0;           // size
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    require('./$.mix')(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        var f = ctx(callbackfn, arguments[1], 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(SUPPORT_DESC)$.setDesc(C.prototype, 'size', {
      get: function(){
        return defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    require('./$.iter-define')(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    species(C);
    species(require('./$.core')[NAME]); // for wrapper
  }
};
},{"./$":40,"./$.core":13,"./$.ctx":14,"./$.defined":16,"./$.for-of":23,"./$.has":26,"./$.hide":27,"./$.is-object":32,"./$.iter-define":36,"./$.iter-step":38,"./$.mix":43,"./$.species":55,"./$.strict-new":56,"./$.support-desc":61,"./$.uid":69}],10:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var forOf   = require('./$.for-of')
  , classof = require('./$.classof');
module.exports = function(NAME){
  return function toJSON(){
    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
    var arr = [];
    forOf(this, false, arr.push, arr);
    return arr;
  };
};
},{"./$.classof":7,"./$.for-of":23}],11:[function(require,module,exports){
'use strict';
var hide         = require('./$.hide')
  , anObject     = require('./$.an-object')
  , strictNew    = require('./$.strict-new')
  , forOf        = require('./$.for-of')
  , method       = require('./$.array-methods')
  , WEAK         = require('./$.uid')('weak')
  , isObject     = require('./$.is-object')
  , $has         = require('./$.has')
  , isExtensible = Object.isExtensible || isObject
  , find         = method(5)
  , findIndex    = method(6)
  , id           = 0;

// fallback for frozen keys
function frozenStore(that){
  return that._l || (that._l = new FrozenStore);
}
function FrozenStore(){
  this.a = [];
}
FrozenStore.prototype = {
  get: function(key){
    var entry = findFrozen(this, key);
    if(entry)return entry[1];
  },
  has: function(key){
    return !!findFrozen(this, key);
  },
  set: function(key, value){
    var entry = findFrozen(this, key);
    if(entry)entry[1] = value;
    else this.a.push([key, value]);
  },
  'delete': function(key){
    var index = findIndex(this.a, function(it){
      return it[0] === key;
    });
    if(~index)this.a.splice(index, 1);
    return !!~index;
  }
};
function findFrozen(store, key){
  return find(store.a, function(it){
    return it[0] === key;
  });
}

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      strictNew(that, C, NAME);
      that._i = id++;      // collection id
      that._l = undefined; // leak store for frozen objects
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    require('./$.mix')(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        if(!isExtensible(key))return frozenStore(this)['delete'](key);
        return $has(key, WEAK) && $has(key[WEAK], this._i) && delete key[WEAK][this._i];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key){
        if(!isObject(key))return false;
        if(!isExtensible(key))return frozenStore(this).has(key);
        return $has(key, WEAK) && $has(key[WEAK], this._i);
      }
    });
    return C;
  },
  def: function(that, key, value){
    if(!isExtensible(anObject(key))){
      frozenStore(that).set(key, value);
    } else {
      $has(key, WEAK) || hide(key, WEAK, {});
      key[WEAK][that._i] = value;
    } return that;
  },
  frozenStore: frozenStore,
  WEAK: WEAK
};
},{"./$.an-object":3,"./$.array-methods":5,"./$.for-of":23,"./$.has":26,"./$.hide":27,"./$.is-object":32,"./$.mix":43,"./$.strict-new":56,"./$.uid":69}],12:[function(require,module,exports){
'use strict';
var global     = require('./$.global')
  , $def       = require('./$.def')
  , BUGGY      = require('./$.iter-buggy')
  , forOf      = require('./$.for-of')
  , strictNew  = require('./$.strict-new');

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = global[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  function fixMethod(KEY){
    var fn = proto[KEY];
    require('./$.redef')(proto, KEY,
      KEY == 'delete' ? function(a){ return fn.call(this, a === 0 ? 0 : a); }
      : KEY == 'has' ? function has(a){ return fn.call(this, a === 0 ? 0 : a); }
      : KEY == 'get' ? function get(a){ return fn.call(this, a === 0 ? 0 : a); }
      : KEY == 'add' ? function add(a){ fn.call(this, a === 0 ? 0 : a); return this; }
      : function set(a, b){ fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  }
  if(typeof C != 'function' || !(IS_WEAK || !BUGGY && proto.forEach && proto.entries)){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    require('./$.mix')(C.prototype, methods);
  } else {
    var inst  = new C
      , chain = inst[ADDER](IS_WEAK ? {} : -0, 1)
      , buggyZero;
    // wrap for init collections from iterable
    if(!require('./$.iter-detect')(function(iter){ new C(iter); })){ // eslint-disable-line no-new
      C = wrapper(function(target, iterable){
        strictNew(target, C, NAME);
        var that = new Base;
        if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    IS_WEAK || inst.forEach(function(val, key){
      buggyZero = 1 / key === -Infinity;
    });
    // fix converting -0 key to +0
    if(buggyZero){
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    // + fix .add & .set for chaining
    if(buggyZero || chain !== inst)fixMethod(ADDER);
    // weak collections should not contains .clear method
    if(IS_WEAK && proto.clear)delete proto.clear;
  }

  require('./$.tag')(C, NAME);

  O[NAME] = C;
  $def($def.G + $def.W + $def.F * (C != Base), O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};
},{"./$.def":15,"./$.for-of":23,"./$.global":25,"./$.iter-buggy":33,"./$.iter-detect":37,"./$.mix":43,"./$.redef":49,"./$.strict-new":56,"./$.tag":62}],13:[function(require,module,exports){
var core = module.exports = {};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],14:[function(require,module,exports){
// Optional / simple context binding
var aFunction = require('./$.a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  } return function(/* ...args */){
      return fn.apply(that, arguments);
    };
};
},{"./$.a-function":2}],15:[function(require,module,exports){
var global     = require('./$.global')
  , core       = require('./$.core')
  , hide       = require('./$.hide')
  , $redef     = require('./$.redef')
  , PROTOTYPE  = 'prototype';
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
}
global.core = core;
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , isProto  = type & $def.P
    , target   = isGlobal ? global : type & $def.S
        ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE]
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    if(type & $def.B && own)exp = ctx(out, global);
    else exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if(target && !own)$redef(target, key, out);
    // export
    if(exports[key] != out)hide(exports, key, exp);
    if(isProto)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
  }
}
module.exports = $def;
},{"./$.core":13,"./$.global":25,"./$.hide":27,"./$.redef":49}],16:[function(require,module,exports){
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],17:[function(require,module,exports){
var isObject = require('./$.is-object')
  , document = require('./$.global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./$.global":25,"./$.is-object":32}],18:[function(require,module,exports){
var $ = require('./$');
module.exports = function(it){
  var keys       = $.getKeys(it)
    , isEnum     = $.isEnum
    , getSymbols = $.getSymbols;
  if(getSymbols)for(var symbols = getSymbols(it), i = 0, key; symbols.length > i; ){
    if(isEnum.call(it, key = symbols[i++]))keys.push(key);
  }
  return keys;
};
},{"./$":40}],19:[function(require,module,exports){
// fallback for not array-like ES3 strings
var cof     = require('./$.cof')
  , $Object = Object;
module.exports = 0 in $Object('z') ? $Object : function(it){
  return cof(it) == 'String' ? it.split('') : $Object(it);
};
},{"./$.cof":8}],20:[function(require,module,exports){
// 20.2.2.14 Math.expm1(x)
module.exports = Math.expm1 || function expm1(x){
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
};
},{}],21:[function(require,module,exports){
'use strict';
module.exports = function(KEY, length, exec){
  var SYMBOL   = require('./$.wks')(KEY)
    , original = ''[KEY];
  if(function(){
    try {
      var O = {};
      O[SYMBOL] = function(){ return 7; };
      return ''[KEY](O) != 7;
    } catch(e){
      return true;
    }
  }()){
    require('./$.redef')(String.prototype, KEY, exec(SYMBOL, original));
    require('./$.hide')(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function(string, arg){ return original.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function(string){ return original.call(string, this); }
    );
  }
};
},{"./$.hide":27,"./$.redef":49,"./$.wks":71}],22:[function(require,module,exports){
var anObject = require('./$.an-object');
module.exports = function flags(){
  var that   = anObject(this)
    , result = '';
  if(that.global)result += 'g';
  if(that.ignoreCase)result += 'i';
  if(that.multiline)result += 'm';
  if(that.unicode)result += 'u';
  if(that.sticky)result += 'y';
  return result;
};
},{"./$.an-object":3}],23:[function(require,module,exports){
var ctx         = require('./$.ctx')
  , call        = require('./$.iter-call')
  , isArrayIter = require('./$.is-array-iter')
  , anObject    = require('./$.an-object')
  , toLength    = require('./$.to-length')
  , getIterFn   = require('./core.get-iterator-method');
module.exports = function(iterable, entries, fn, that){
  var iterFn = getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    call(iterator, f, step.value, entries);
  }
};
},{"./$.an-object":3,"./$.ctx":14,"./$.is-array-iter":30,"./$.iter-call":34,"./$.to-length":67,"./core.get-iterator-method":72}],24:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toString = {}.toString
  , toObject = require('./$.to-object')
  , getNames = require('./$').getNames;

var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

function getWindowNames(it){
  try {
    return getNames(it);
  } catch(e){
    return windowNames.slice();
  }
}

module.exports.get = function getOwnPropertyNames(it){
  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
  return getNames(toObject(it));
};
},{"./$":40,"./$.to-object":68}],25:[function(require,module,exports){
var global = typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
module.exports = global;
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],26:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],27:[function(require,module,exports){
var $          = require('./$')
  , createDesc = require('./$.property-desc');
module.exports = require('./$.support-desc') ? function(object, key, value){
  return $.setDesc(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./$":40,"./$.property-desc":48,"./$.support-desc":61}],28:[function(require,module,exports){
module.exports = require('./$.global').document && document.documentElement;
},{"./$.global":25}],29:[function(require,module,exports){
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
};
},{}],30:[function(require,module,exports){
var Iterators = require('./$.iterators')
  , ITERATOR  = require('./$.wks')('iterator');
module.exports = function(it){
  return ('Array' in Iterators ? Iterators.Array : Array.prototype[ITERATOR]) === it;
};
},{"./$.iterators":39,"./$.wks":71}],31:[function(require,module,exports){
// 20.1.2.3 Number.isInteger(number)
var isObject = require('./$.is-object')
  , floor    = Math.floor;
module.exports = function isInteger(it){
  return !isObject(it) && isFinite(it) && floor(it) === it;
};
},{"./$.is-object":32}],32:[function(require,module,exports){
// http://jsperf.com/core-js-isobject
module.exports = function(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
};
},{}],33:[function(require,module,exports){
// Safari has buggy iterators w/o `next`
module.exports = 'keys' in [] && !('next' in [].keys());
},{}],34:[function(require,module,exports){
var anObject = require('./$.an-object');
function close(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)anObject(ret.call(iterator));
}
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  } catch(e){
    close(iterator);
    throw e;
  }
};
},{"./$.an-object":3}],35:[function(require,module,exports){
'use strict';
var $ = require('./$')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./$.hide')(IteratorPrototype, require('./$.wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = $.create(IteratorPrototype, {next: require('./$.property-desc')(1,next)});
  require('./$.tag')(Constructor, NAME + ' Iterator');
};
},{"./$":40,"./$.hide":27,"./$.property-desc":48,"./$.tag":62,"./$.wks":71}],36:[function(require,module,exports){
'use strict';
var LIBRARY         = require('./$.library')
  , $def            = require('./$.def')
  , $redef          = require('./$.redef')
  , hide            = require('./$.hide')
  , has             = require('./$.has')
  , SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , Iterators       = require('./$.iterators')
  , FF_ITERATOR     = '@@iterator'
  , KEYS            = 'keys'
  , VALUES          = 'values';
function returnThis(){ return this; }
module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
  require('./$.iter-create')(Constructor, NAME, next);
  function createMethod(kind){
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  }
  var TAG      = NAME + ' Iterator'
    , proto    = Base.prototype
    , _native  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , _default = _native || createMethod(DEFAULT)
    , methods, key;
  // Fix native
  if(_native){
    var IteratorPrototype = require('./$').getProto(_default.call(new Base));
    // Set @@toStringTag to native iterators
    require('./$.tag')(IteratorPrototype, TAG, true);
    // FF fix
    if(!LIBRARY && has(proto, FF_ITERATOR))hide(IteratorPrototype, SYMBOL_ITERATOR, returnThis);
  }
  // Define iterator
  if(!LIBRARY || FORCE)hide(proto, SYMBOL_ITERATOR, _default);
  // Plug for library
  Iterators[NAME] = _default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      keys:    IS_SET            ? _default : createMethod(KEYS),
      values:  DEFAULT == VALUES ? _default : createMethod(VALUES),
      entries: DEFAULT != VALUES ? _default : createMethod('entries')
    };
    if(FORCE)for(key in methods){
      if(!(key in proto))$redef(proto, key, methods[key]);
    } else $def($def.P + $def.F * require('./$.iter-buggy'), NAME, methods);
  }
};
},{"./$":40,"./$.def":15,"./$.has":26,"./$.hide":27,"./$.iter-buggy":33,"./$.iter-create":35,"./$.iterators":39,"./$.library":42,"./$.redef":49,"./$.tag":62,"./$.wks":71}],37:[function(require,module,exports){
var SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , SAFE_CLOSING    = false;
try {
  var riter = [7][SYMBOL_ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }
module.exports = function(exec){
  if(!SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[SYMBOL_ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[SYMBOL_ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./$.wks":71}],38:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],39:[function(require,module,exports){
module.exports = {};
},{}],40:[function(require,module,exports){
var $Object = Object;
module.exports = {
  create:     $Object.create,
  getProto:   $Object.getPrototypeOf,
  isEnum:     {}.propertyIsEnumerable,
  getDesc:    $Object.getOwnPropertyDescriptor,
  setDesc:    $Object.defineProperty,
  setDescs:   $Object.defineProperties,
  getKeys:    $Object.keys,
  getNames:   $Object.getOwnPropertyNames,
  getSymbols: $Object.getOwnPropertySymbols,
  each:       [].forEach
};
},{}],41:[function(require,module,exports){
var $        = require('./$')
  , toObject = require('./$.to-object');
module.exports = function(object, el){
  var O      = toObject(object)
    , keys   = $.getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./$":40,"./$.to-object":68}],42:[function(require,module,exports){
module.exports = false;
},{}],43:[function(require,module,exports){
var $redef = require('./$.redef');
module.exports = function(target, src){
  for(var key in src)$redef(target, key, src[key]);
  return target;
};
},{"./$.redef":49}],44:[function(require,module,exports){
var $        = require('./$')
  , toObject = require('./$.to-object');
module.exports = function(isEntries){
  return function(it){
    var O      = toObject(it)
      , keys   = $.getKeys(O)
      , length = keys.length
      , i      = 0
      , result = Array(length)
      , key;
    if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
    else while(length > i)result[i] = O[keys[i++]];
    return result;
  };
};
},{"./$":40,"./$.to-object":68}],45:[function(require,module,exports){
var $        = require('./$')
  , anObject = require('./$.an-object');
module.exports = function ownKeys(it){
  var keys       = $.getNames(anObject(it))
    , getSymbols = $.getSymbols;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};
},{"./$":40,"./$.an-object":3}],46:[function(require,module,exports){
'use strict';
var path      = require('./$.path')
  , invoke    = require('./$.invoke')
  , aFunction = require('./$.a-function');
module.exports = function(/* ...pargs */){
  var fn     = aFunction(this)
    , length = arguments.length
    , pargs  = Array(length)
    , i      = 0
    , _      = path._
    , holder = false;
  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that    = this
      , _length = arguments.length
      , j = 0, k = 0, args;
    if(!holder && !_length)return invoke(fn, pargs, that);
    args = pargs.slice();
    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
    while(_length > k)args.push(arguments[k++]);
    return invoke(fn, args, that);
  };
};
},{"./$.a-function":2,"./$.invoke":29,"./$.path":47}],47:[function(require,module,exports){
module.exports = require('./$.global');
},{"./$.global":25}],48:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],49:[function(require,module,exports){
var global     = require('./$.global')
  , has        = require('./$.has')
  , hide       = require('./$.hide')
  , tpl        = String({}.hasOwnProperty)
  , SRC        = require('./$.uid')('src')
  , _toString  = Function.toString;

function $redef(O, key, val, safe){
  if(typeof val == 'function'){
    var base = O[key];
    hide(val, SRC, base ? String(base) : tpl.replace(/hasOwnProperty/, String(key)));
    if(!('name' in val))val.name = key;
  }
  if(O === global){
    O[key] = val;
  } else {
    if(!safe)delete O[key];
    hide(O, key, val);
  }
}

// add fake Function#toString for correct work wrapped methods / constructors
// with methods similar to LoDash isNative
$redef(Function.prototype, 'toString', function toString(){
  return has(this, SRC) ? this[SRC] : _toString.call(this);
});

require('./$.core').inspectSource = function(it){
  return _toString.call(it);
};

module.exports = $redef;
},{"./$.core":13,"./$.global":25,"./$.has":26,"./$.hide":27,"./$.uid":69}],50:[function(require,module,exports){
module.exports = function(regExp, replace){
  var replacer = replace === Object(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(it).replace(regExp, replacer);
  };
};
},{}],51:[function(require,module,exports){
module.exports = Object.is || function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};
},{}],52:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var getDesc  = require('./$').getDesc
  , isObject = require('./$.is-object')
  , anObject = require('./$.an-object');
function check(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
}
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
    ? function(buggy, set){
        try {
          set = require('./$.ctx')(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
          set({}, []);
        } catch(e){ buggy = true; }
        return function setPrototypeOf(O, proto){
          check(O, proto);
          if(buggy)O.__proto__ = proto;
          else set(O, proto);
          return O;
        };
      }()
    : undefined),
  check: check
};
},{"./$":40,"./$.an-object":3,"./$.ctx":14,"./$.is-object":32}],53:[function(require,module,exports){
var global = require('./$.global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./$.global":25}],54:[function(require,module,exports){
// 20.2.2.28 Math.sign(x)
module.exports = Math.sign || function sign(x){
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
};
},{}],55:[function(require,module,exports){
var $       = require('./$')
  , SPECIES = require('./$.wks')('species');
module.exports = function(C){
  if(require('./$.support-desc') && !(SPECIES in C))$.setDesc(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./$":40,"./$.support-desc":61,"./$.wks":71}],56:[function(require,module,exports){
module.exports = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
},{}],57:[function(require,module,exports){
// true  -> String#at
// false -> String#codePointAt
var toInteger = require('./$.to-integer')
  , defined   = require('./$.defined');
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l
      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$.defined":16,"./$.to-integer":66}],58:[function(require,module,exports){
// helper for String#{startsWith, endsWith, includes}
var defined = require('./$.defined')
  , cof     = require('./$.cof');

module.exports = function(that, searchString, NAME){
  if(cof(searchString) == 'RegExp')throw TypeError('String#' + NAME + " doesn't accept regex!");
  return String(defined(that));
};
},{"./$.cof":8,"./$.defined":16}],59:[function(require,module,exports){
// http://wiki.ecmascript.org/doku.php?id=strawman:string_padding
var toInteger = require('./$.to-integer')
  , repeat    = require('./$.string-repeat')
  , defined   = require('./$.defined');

module.exports = function(that, minLength, fillChar, left){
  // 1. Let O be CheckObjectCoercible(this value).
  // 2. Let S be ToString(O).
  var S = String(defined(that));
  // 4. If intMinLength is undefined, return S.
  if(minLength === undefined)return S;
  // 4. Let intMinLength be ToInteger(minLength).
  var intMinLength = toInteger(minLength);
  // 5. Let fillLen be the number of characters in S minus intMinLength.
  var fillLen = intMinLength - S.length;
  // 6. If fillLen < 0, then throw a RangeError exception.
  // 7. If fillLen is +∞, then throw a RangeError exception.
  if(fillLen < 0 || fillLen === Infinity){
    throw new RangeError('Cannot satisfy string length ' + minLength + ' for string: ' + S);
  }
  // 8. Let sFillStr be the string represented by fillStr.
  // 9. If sFillStr is undefined, let sFillStr be a space character.
  var sFillStr = fillChar === undefined ? ' ' : String(fillChar);
  // 10. Let sFillVal be a String made of sFillStr, repeated until fillLen is met.
  var sFillVal = repeat.call(sFillStr, Math.ceil(fillLen / sFillStr.length));
  // truncate if we overflowed
  if(sFillVal.length > fillLen)sFillVal = left
    ? sFillVal.slice(sFillVal.length - fillLen)
    : sFillVal.slice(0, fillLen);
  // 11. Return a string made from sFillVal, followed by S.
  // 11. Return a String made from S, followed by sFillVal.
  return left ? sFillVal.concat(S) : S.concat(sFillVal);
};
},{"./$.defined":16,"./$.string-repeat":60,"./$.to-integer":66}],60:[function(require,module,exports){
'use strict';
var toInteger = require('./$.to-integer')
  , defined   = require('./$.defined');

module.exports = function repeat(count){
  var str = String(defined(this))
    , res = ''
    , n   = toInteger(count);
  if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
  for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
  return res;
};
},{"./$.defined":16,"./$.to-integer":66}],61:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !!function(){
  try {
    return Object.defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
  } catch(e){ /* empty */ }
}();
},{}],62:[function(require,module,exports){
var has  = require('./$.has')
  , hide = require('./$.hide')
  , TAG  = require('./$.wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))hide(it, TAG, tag);
};
},{"./$.has":26,"./$.hide":27,"./$.wks":71}],63:[function(require,module,exports){
'use strict';
var ctx                = require('./$.ctx')
  , invoke             = require('./$.invoke')
  , html               = require('./$.html')
  , cel                = require('./$.dom-create')
  , global             = require('./$.global')
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
function run(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
}
function listner(event){
  run.call(event.data);
}
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(require('./$.cof')(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id, '*');
    };
    global.addEventListener('message', listner, false);
  // WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$.cof":8,"./$.ctx":14,"./$.dom-create":17,"./$.global":25,"./$.html":28,"./$.invoke":29}],64:[function(require,module,exports){
module.exports = function(exec){
  try {
    exec();
    return false;
  } catch(e){
    return true;
  }
};
},{}],65:[function(require,module,exports){
var toInteger = require('./$.to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./$.to-integer":66}],66:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],67:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./$.to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./$.to-integer":66}],68:[function(require,module,exports){
var ES5Object = require('./$.es5-object')
  , defined   = require('./$.defined');
module.exports = function(it, realString){
  return (realString ? Object : ES5Object)(defined(it));
};
},{"./$.defined":16,"./$.es5-object":19}],69:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],70:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./$.wks')('unscopables');
if(!(UNSCOPABLES in []))require('./$.hide')(Array.prototype, UNSCOPABLES, {});
module.exports = function(key){
  [][UNSCOPABLES][key] = true;
};
},{"./$.hide":27,"./$.wks":71}],71:[function(require,module,exports){
var store  = require('./$.shared')('wks')
  , Symbol = require('./$.global').Symbol;
module.exports = function(name){
  return store[name] || (store[name] =
    Symbol && Symbol[name] || (Symbol || require('./$.uid'))('Symbol.' + name));
};
},{"./$.global":25,"./$.shared":53,"./$.uid":69}],72:[function(require,module,exports){
var global    = require('./$.global')
  , classof   = require('./$.classof')
  , ITERATOR  = require('./$.wks')('iterator')
  , Iterators = require('./$.iterators');
module.exports = require('./$.core').getIteratorMethod = function(it){
  var Symbol = global.Symbol;
  if(it != undefined){
    return it[Symbol && Symbol.iterator || '@@iterator']
      || it[ITERATOR]
      || Iterators[classof(it)];
  }
};
},{"./$.classof":7,"./$.core":13,"./$.global":25,"./$.iterators":39,"./$.wks":71}],73:[function(require,module,exports){
var $                = require('./$')
  , SUPPORT_DESC     = require('./$.support-desc')
  , createDesc       = require('./$.property-desc')
  , html             = require('./$.html')
  , cel              = require('./$.dom-create')
  , has              = require('./$.has')
  , cof              = require('./$.cof')
  , $def             = require('./$.def')
  , invoke           = require('./$.invoke')
  , arrayMethod      = require('./$.array-methods')
  , IE_PROTO         = require('./$.uid')('__proto__')
  , isObject         = require('./$.is-object')
  , anObject         = require('./$.an-object')
  , aFunction        = require('./$.a-function')
  , toObject         = require('./$.to-object')
  , toInteger        = require('./$.to-integer')
  , toIndex          = require('./$.to-index')
  , toLength         = require('./$.to-length')
  , ES5Object        = require('./$.es5-object')
  , ObjectProto      = Object.prototype
  , A                = []
  , _slice           = A.slice
  , _join            = A.join
  , defineProperty   = $.setDesc
  , getOwnDescriptor = $.getDesc
  , defineProperties = $.setDescs
  , IE8_DOM_DEFINE   = false
  , $indexOf         = require('./$.array-includes')(false)
  , $forEach         = arrayMethod(0)
  , $map             = arrayMethod(1)
  , $filter          = arrayMethod(2)
  , $some            = arrayMethod(3)
  , $every           = arrayMethod(4)
  , factories        = {}
  , $trim            = require('./$.replacer')(/^\s*([\s\S]*\S)?\s*$/, '$1');

if(!SUPPORT_DESC){
  try {
    IE8_DOM_DEFINE = defineProperty(cel('div'), 'x',
      {get: function(){ return 8; }}
    ).x == 8;
  } catch(e){ /* empty */ }
  $.setDesc = function(O, P, Attributes){
    if(IE8_DOM_DEFINE)try {
      return defineProperty(O, P, Attributes);
    } catch(e){ /* empty */ }
    if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
    if('value' in Attributes)anObject(O)[P] = Attributes.value;
    return O;
  };
  $.getDesc = function(O, P){
    if(IE8_DOM_DEFINE)try {
      return getOwnDescriptor(O, P);
    } catch(e){ /* empty */ }
    if(has(O, P))return createDesc(!ObjectProto.propertyIsEnumerable.call(O, P), O[P]);
  };
  $.setDescs = defineProperties = function(O, Properties){
    anObject(O);
    var keys   = $.getKeys(Properties)
      , length = keys.length
      , i = 0
      , P;
    while(length > i)$.setDesc(O, P = keys[i++], Properties[P]);
    return O;
  };
}
$def($def.S + $def.F * !SUPPORT_DESC, 'Object', {
  // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $.getDesc,
  // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
  defineProperty: $.setDesc,
  // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
  defineProperties: defineProperties
});

  // IE 8- don't enum bug keys
var keys1 = ('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,' +
            'toLocaleString,toString,valueOf').split(',')
  // Additional keys for getOwnPropertyNames
  , keys2 = keys1.concat('length', 'prototype')
  , keysLen1 = keys1.length;

// Create object with `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = cel('iframe')
    , i      = keysLen1
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict.prototype[keys1[i]];
  return createDict();
};
function createGetKeys(names, length){
  return function(object){
    var O      = toObject(object)
      , i      = 0
      , result = []
      , key;
    for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while(length > i)if(has(O, key = names[i++])){
      ~$indexOf(result, key) || result.push(key);
    }
    return result;
  };
}
function Empty(){}
$def($def.S, 'Object', {
  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
  getPrototypeOf: $.getProto = $.getProto || function(O){
    O = toObject(O, true);
    if(has(O, IE_PROTO))return O[IE_PROTO];
    if(typeof O.constructor == 'function' && O instanceof O.constructor){
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  },
  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $.getNames = $.getNames || createGetKeys(keys2, keys2.length, true),
  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  create: $.create = $.create || function(O, /*?*/Properties){
    var result;
    if(O !== null){
      Empty.prototype = anObject(O);
      result = new Empty();
      Empty.prototype = null;
      // add "__proto__" for Object.getPrototypeOf shim
      result[IE_PROTO] = O;
    } else result = createDict();
    return Properties === undefined ? result : defineProperties(result, Properties);
  },
  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
  keys: $.getKeys = $.getKeys || createGetKeys(keys1, keysLen1, false),
  // 19.1.2.17 / 15.2.3.8 Object.seal(O)
  seal: function seal(it){
    return it; // <- cap
  },
  // 19.1.2.5 / 15.2.3.9 Object.freeze(O)
  freeze: function freeze(it){
    return it; // <- cap
  },
  // 19.1.2.15 / 15.2.3.10 Object.preventExtensions(O)
  preventExtensions: function preventExtensions(it){
    return it; // <- cap
  },
  // 19.1.2.13 / 15.2.3.11 Object.isSealed(O)
  isSealed: function isSealed(it){
    return !isObject(it); // <- cap
  },
  // 19.1.2.12 / 15.2.3.12 Object.isFrozen(O)
  isFrozen: function isFrozen(it){
    return !isObject(it); // <- cap
  },
  // 19.1.2.11 / 15.2.3.13 Object.isExtensible(O)
  isExtensible: function isExtensible(it){
    return isObject(it); // <- cap
  }
});

function construct(F, len, args){
  if(!(len in factories)){
    for(var n = [], i = 0; i < len; i++)n[i] = 'a[' + i + ']';
    factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
  }
  return factories[len](F, args);
}

// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
$def($def.P, 'Function', {
  bind: function(that /*, args... */){
    var fn       = aFunction(this)
      , partArgs = _slice.call(arguments, 1);
    function bound(/* args... */){
      var args = partArgs.concat(_slice.call(arguments));
      return this instanceof bound ? construct(fn, args.length, args) : invoke(fn, args, that);
    }
    if(isObject(fn.prototype))bound.prototype = fn.prototype;
    return bound;
  }
});

// fallback for not array-like ES3 strings and DOM objects
var buggySlice = true;
try {
  if(html)_slice.call(html);
  buggySlice = false;
} catch(e){ /* empty */ }

$def($def.P + $def.F * buggySlice, 'Array', {
  slice: function slice(begin, end){
    var len   = toLength(this.length)
      , klass = cof(this);
    end = end === undefined ? len : end;
    if(klass == 'Array')return _slice.call(this, begin, end);
    var start  = toIndex(begin, len)
      , upTo   = toIndex(end, len)
      , size   = toLength(upTo - start)
      , cloned = Array(size)
      , i      = 0;
    for(; i < size; i++)cloned[i] = klass == 'String'
      ? this.charAt(start + i)
      : this[start + i];
    return cloned;
  }
});
$def($def.P + $def.F * (ES5Object != Object), 'Array', {
  join: function join(){
    return _join.apply(ES5Object(this), arguments);
  }
});

// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
$def($def.S, 'Array', {isArray: function(arg){ return cof(arg) == 'Array'; }});

function createArrayReduce(isRight){
  return function(callbackfn, memo){
    aFunction(callbackfn);
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = isRight ? length - 1 : 0
      , i      = isRight ? -1 : 1;
    if(arguments.length < 2)for(;;){
      if(index in O){
        memo = O[index];
        index += i;
        break;
      }
      index += i;
      if(isRight ? index < 0 : length <= index){
        throw TypeError('Reduce of empty array with no initial value');
      }
    }
    for(;isRight ? index >= 0 : length > index; index += i)if(index in O){
      memo = callbackfn(memo, O[index], index, this);
    }
    return memo;
  };
}
$def($def.P, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: $.each = $.each || function forEach(callbackfn/*, that = undefined */){
    return $forEach(this, callbackfn, arguments[1]);
  },
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn/*, that = undefined */){
    return $map(this, callbackfn, arguments[1]);
  },
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn/*, that = undefined */){
    return $filter(this, callbackfn, arguments[1]);
  },
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn/*, that = undefined */){
    return $some(this, callbackfn, arguments[1]);
  },
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: function every(callbackfn/*, that = undefined */){
    return $every(this, callbackfn, arguments[1]);
  },
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: createArrayReduce(false),
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: createArrayReduce(true),
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: function indexOf(el /*, fromIndex = 0 */){
    return $indexOf(this, el, arguments[1]);
  },
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function lastIndexOf(el, fromIndex /* = @[*-1] */){
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = length - 1;
    if(arguments.length > 1)index = Math.min(index, toInteger(fromIndex));
    if(index < 0)index = toLength(length + index);
    for(;index >= 0; index--)if(index in O)if(O[index] === el)return index;
    return -1;
  }
});

// 21.1.3.25 / 15.5.4.20 String.prototype.trim()
$def($def.P, 'String', {trim: function trim(){ return $trim(this); }});

// 20.3.3.1 / 15.9.4.4 Date.now()
$def($def.S, 'Date', {now: function now(){ return +new Date; }});

function lz(num){
  return num > 9 ? num : '0' + num;
}

// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
// PhantomJS and old webkit had a broken Date implementation.
var date       = new Date(-5e13 - 1)
  , brokenDate = !(date.toISOString && date.toISOString() == '0385-07-25T07:06:39.999Z'
      && require('./$.throws')(function(){ new Date(NaN).toISOString(); }));
$def($def.P + $def.F * brokenDate, 'Date', {
  toISOString: function toISOString(){
    if(!isFinite(this))throw RangeError('Invalid time value');
    var d = this
      , y = d.getUTCFullYear()
      , m = d.getUTCMilliseconds()
      , s = y < 0 ? '-' : y > 9999 ? '+' : '';
    return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
      '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
      'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
      ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
  }
});
},{"./$":40,"./$.a-function":2,"./$.an-object":3,"./$.array-includes":4,"./$.array-methods":5,"./$.cof":8,"./$.def":15,"./$.dom-create":17,"./$.es5-object":19,"./$.has":26,"./$.html":28,"./$.invoke":29,"./$.is-object":32,"./$.property-desc":48,"./$.replacer":50,"./$.support-desc":61,"./$.throws":64,"./$.to-index":65,"./$.to-integer":66,"./$.to-length":67,"./$.to-object":68,"./$.uid":69}],74:[function(require,module,exports){
'use strict';
var $def     = require('./$.def')
  , toObject = require('./$.to-object')
  , toIndex  = require('./$.to-index')
  , toLength = require('./$.to-length');
$def($def.P, 'Array', {
  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
  copyWithin: function copyWithin(target/* = 0 */, start /* = 0, end = @length */){
    var O     = toObject(this, true)
      , len   = toLength(O.length)
      , to    = toIndex(target, len)
      , from  = toIndex(start, len)
      , end   = arguments[2]
      , fin   = end === undefined ? len : toIndex(end, len)
      , count = Math.min(fin - from, len - to)
      , inc   = 1;
    if(from < to && to < from + count){
      inc  = -1;
      from = from + count - 1;
      to   = to   + count - 1;
    }
    while(count-- > 0){
      if(from in O)O[to] = O[from];
      else delete O[to];
      to   += inc;
      from += inc;
    } return O;
  }
});
require('./$.unscope')('copyWithin');
},{"./$.def":15,"./$.to-index":65,"./$.to-length":67,"./$.to-object":68,"./$.unscope":70}],75:[function(require,module,exports){
'use strict';
var $def     = require('./$.def')
  , toObject = require('./$.to-object')
  , toIndex  = require('./$.to-index')
  , toLength = require('./$.to-length');
$def($def.P, 'Array', {
  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
  fill: function fill(value /*, start = 0, end = @length */){
    var O      = toObject(this, true)
      , length = toLength(O.length)
      , index  = toIndex(arguments[1], length)
      , end    = arguments[2]
      , endPos = end === undefined ? length : toIndex(end, length);
    while(endPos > index)O[index++] = value;
    return O;
  }
});
require('./$.unscope')('fill');
},{"./$.def":15,"./$.to-index":65,"./$.to-length":67,"./$.to-object":68,"./$.unscope":70}],76:[function(require,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var KEY    = 'findIndex'
  , $def   = require('./$.def')
  , forced = true
  , $find  = require('./$.array-methods')(6);
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$def($def.P + $def.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments[1]);
  }
});
require('./$.unscope')(KEY);
},{"./$.array-methods":5,"./$.def":15,"./$.unscope":70}],77:[function(require,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var KEY    = 'find'
  , $def   = require('./$.def')
  , forced = true
  , $find  = require('./$.array-methods')(5);
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$def($def.P + $def.F * forced, 'Array', {
  find: function find(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments[1]);
  }
});
require('./$.unscope')(KEY);
},{"./$.array-methods":5,"./$.def":15,"./$.unscope":70}],78:[function(require,module,exports){
var ctx         = require('./$.ctx')
  , $def        = require('./$.def')
  , toObject    = require('./$.to-object')
  , call        = require('./$.iter-call')
  , isArrayIter = require('./$.is-array-iter')
  , toLength    = require('./$.to-length')
  , getIterFn   = require('./core.get-iterator-method');
$def($def.S + $def.F * !require('./$.iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike, true)
      , C       = typeof this == 'function' ? this : Array
      , mapfn   = arguments[1]
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, arguments[2], 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        result[index] = mapping ? call(iterator, mapfn, [step.value, index], true) : step.value;
      }
    } else {
      for(result = new C(length = toLength(O.length)); length > index; index++){
        result[index] = mapping ? mapfn(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});
},{"./$.ctx":14,"./$.def":15,"./$.is-array-iter":30,"./$.iter-call":34,"./$.iter-detect":37,"./$.to-length":67,"./$.to-object":68,"./core.get-iterator-method":72}],79:[function(require,module,exports){
var setUnscope = require('./$.unscope')
  , step       = require('./$.iter-step')
  , Iterators  = require('./$.iterators')
  , toObject   = require('./$.to-object');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
require('./$.iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toObject(iterated); // target
  this._i = 0;                  // next index
  this._k = kind;               // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

setUnscope('keys');
setUnscope('values');
setUnscope('entries');
},{"./$.iter-define":36,"./$.iter-step":38,"./$.iterators":39,"./$.to-object":68,"./$.unscope":70}],80:[function(require,module,exports){
var $def = require('./$.def');
$def($def.S, 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function of(/* ...args */){
    var index  = 0
      , length = arguments.length
      , result = new (typeof this == 'function' ? this : Array)(length);
    while(length > index)result[index] = arguments[index++];
    result.length = length;
    return result;
  }
});
},{"./$.def":15}],81:[function(require,module,exports){
require('./$.species')(Array);
},{"./$.species":55}],82:[function(require,module,exports){
var $             = require('./$')
  , isObject      = require('./$.is-object')
  , HAS_INSTANCE  = require('./$.wks')('hasInstance')
  , FunctionProto = Function.prototype;
// 19.2.3.6 Function.prototype[@@hasInstance](V)
if(!(HAS_INSTANCE in FunctionProto))$.setDesc(FunctionProto, HAS_INSTANCE, {value: function(O){
  if(typeof this != 'function' || !isObject(O))return false;
  if(!isObject(this.prototype))return O instanceof this;
  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
  while(O = $.getProto(O))if(this.prototype === O)return true;
  return false;
}});
},{"./$":40,"./$.is-object":32,"./$.wks":71}],83:[function(require,module,exports){
'use strict';
var $             = require('./$')
  , has           = require('./$.has')
  , createDesc    = require('./$.property-desc')
  , setDesc       = $.setDesc
  , FunctionProto = Function.prototype
  , NAME          = 'name';
// 19.2.4.2 name
NAME in FunctionProto || require('./$.support-desc') && setDesc(FunctionProto, NAME, {
  configurable: true,
  get: function(){
    var match = String(this).match(/^\s*function ([^ (]*)/)
      , name  = match ? match[1] : '';
    has(this, NAME) || setDesc(this, NAME, createDesc(5, name));
    return name;
  },
  set: function(value){
    has(this, NAME) || setDesc(this, NAME, createDesc(0, value));
  }
});
},{"./$":40,"./$.has":26,"./$.property-desc":48,"./$.support-desc":61}],84:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.1 Map Objects
require('./$.collection')('Map', function(get){
  return function Map(){ return get(this, arguments[0]); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"./$.collection":12,"./$.collection-strong":9}],85:[function(require,module,exports){
// 20.2.2.3 Math.acosh(x)
var $def  = require('./$.def')
  , E     = Math.E
  , sqrt  = Math.sqrt;

$def($def.S, 'Math', {
  acosh: function acosh(x){
    return (x = +x) < 1 ? NaN : isFinite(x)
      ? Math.log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
  }
});
},{"./$.def":15}],86:[function(require,module,exports){
// 20.2.2.5 Math.asinh(x)
var $def = require('./$.def');

function asinh(x){
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
}

$def($def.S, 'Math', {asinh: asinh});
},{"./$.def":15}],87:[function(require,module,exports){
// 20.2.2.7 Math.atanh(x)
var $def = require('./$.def');

$def($def.S, 'Math', {
  atanh: function atanh(x){
    return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
  }
});
},{"./$.def":15}],88:[function(require,module,exports){
// 20.2.2.9 Math.cbrt(x)
var $def = require('./$.def')
  , sign = require('./$.sign');

$def($def.S, 'Math', {
  cbrt: function cbrt(x){
    return sign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
  }
});
},{"./$.def":15,"./$.sign":54}],89:[function(require,module,exports){
// 20.2.2.11 Math.clz32(x)
var $def = require('./$.def');

$def($def.S, 'Math', {
  clz32: function clz32(x){
    return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
  }
});
},{"./$.def":15}],90:[function(require,module,exports){
// 20.2.2.12 Math.cosh(x)
var $def = require('./$.def')
  , exp  = Math.exp;

$def($def.S, 'Math', {
  cosh: function cosh(x){
    return (exp(x = +x) + exp(-x)) / 2;
  }
});
},{"./$.def":15}],91:[function(require,module,exports){
// 20.2.2.14 Math.expm1(x)
var $def = require('./$.def');

$def($def.S, 'Math', {expm1: require('./$.expm1')});
},{"./$.def":15,"./$.expm1":20}],92:[function(require,module,exports){
// 20.2.2.16 Math.fround(x)
var $def  = require('./$.def')
  , sign  = require('./$.sign')
  , pow   = Math.pow
  , EPSILON   = pow(2, -52)
  , EPSILON32 = pow(2, -23)
  , MAX32     = pow(2, 127) * (2 - EPSILON32)
  , MIN32     = pow(2, -126);

function roundTiesToEven(n){
  return n + 1 / EPSILON - 1 / EPSILON;
}


$def($def.S, 'Math', {
  fround: function fround(x){
    var $abs  = Math.abs(x)
      , $sign = sign(x)
      , a, result;
    if($abs < MIN32)return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
    a = (1 + EPSILON32 / EPSILON) * $abs;
    result = a - (a - $abs);
    if(result > MAX32 || result != result)return $sign * Infinity;
    return $sign * result;
  }
});
},{"./$.def":15,"./$.sign":54}],93:[function(require,module,exports){
// 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
var $def = require('./$.def')
  , abs  = Math.abs;

$def($def.S, 'Math', {
  hypot: function hypot(value1, value2){ // eslint-disable-line no-unused-vars
    var sum  = 0
      , i    = 0
      , len  = arguments.length
      , larg = 0
      , arg, div;
    while(i < len){
      arg = abs(arguments[i++]);
      if(larg < arg){
        div  = larg / arg;
        sum  = sum * div * div + 1;
        larg = arg;
      } else if(arg > 0){
        div  = arg / larg;
        sum += div * div;
      } else sum += arg;
    }
    return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
  }
});
},{"./$.def":15}],94:[function(require,module,exports){
// 20.2.2.18 Math.imul(x, y)
var $def = require('./$.def');

$def($def.S, 'Math', {
  imul: function imul(x, y){
    var UINT16 = 0xffff
      , xn = +x
      , yn = +y
      , xl = UINT16 & xn
      , yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});
},{"./$.def":15}],95:[function(require,module,exports){
// 20.2.2.21 Math.log10(x)
var $def = require('./$.def');

$def($def.S, 'Math', {
  log10: function log10(x){
    return Math.log(x) / Math.LN10;
  }
});
},{"./$.def":15}],96:[function(require,module,exports){
// 20.2.2.20 Math.log1p(x)
var $def = require('./$.def');

$def($def.S, 'Math', {
  log1p: function log1p(x){
    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
  }
});
},{"./$.def":15}],97:[function(require,module,exports){
// 20.2.2.22 Math.log2(x)
var $def = require('./$.def');

$def($def.S, 'Math', {
  log2: function log2(x){
    return Math.log(x) / Math.LN2;
  }
});
},{"./$.def":15}],98:[function(require,module,exports){
// 20.2.2.28 Math.sign(x)
var $def = require('./$.def');

$def($def.S, 'Math', {sign: require('./$.sign')});
},{"./$.def":15,"./$.sign":54}],99:[function(require,module,exports){
// 20.2.2.30 Math.sinh(x)
var $def  = require('./$.def')
  , expm1 = require('./$.expm1')
  , exp   = Math.exp;

$def($def.S, 'Math', {
  sinh: function sinh(x){
    return Math.abs(x = +x) < 1
      ? (expm1(x) - expm1(-x)) / 2
      : (exp(x - 1) - exp(-x - 1)) * (Math.E / 2);
  }
});
},{"./$.def":15,"./$.expm1":20}],100:[function(require,module,exports){
// 20.2.2.33 Math.tanh(x)
var $def  = require('./$.def')
  , expm1 = require('./$.expm1')
  , exp   = Math.exp;

$def($def.S, 'Math', {
  tanh: function tanh(x){
    var a = expm1(x = +x)
      , b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  }
});
},{"./$.def":15,"./$.expm1":20}],101:[function(require,module,exports){
// 20.2.2.34 Math.trunc(x)
var $def = require('./$.def');

$def($def.S, 'Math', {
  trunc: function trunc(it){
    return (it > 0 ? Math.floor : Math.ceil)(it);
  }
});
},{"./$.def":15}],102:[function(require,module,exports){
'use strict';
var $          = require('./$')
  , global     = require('./$.global')
  , has        = require('./$.has')
  , cof        = require('./$.cof')
  , isObject   = require('./$.is-object')
  , NUMBER     = 'Number'
  , $Number    = global[NUMBER]
  , Base       = $Number
  , proto      = $Number.prototype
  // Opera ~12 has broken Object#toString
  , fakeNumber = cof($.create(proto)) == NUMBER
    ? function(it){ try { proto.valueOf.call(it); return false; } catch(e){ return true; } }
    : function(it){ return cof(it) != NUMBER; };
function toPrimitive(it){
  var fn, val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to number");
}
function toNumber(it){
  if(isObject(it))it = toPrimitive(it);
  if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
    var binary = false;
    switch(it.charCodeAt(1)){
      case 66 : case 98  : binary = true;
      case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
    }
  } return +it;
}
if(!($Number('0o1') && $Number('0b1'))){
  $Number = function Number(it){
    return this instanceof $Number && fakeNumber(this) ? new Base(toNumber(it)) : toNumber(it);
  };
  $.each.call(require('./$.support-desc') ? $.getNames(Base) : (
      // ES3:
      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
      // ES6 (in case, if modules with ES6 Number statics required before):
      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
      'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
    ).split(','), function(key){
      if(has(Base, key) && !has($Number, key)){
        $.setDesc($Number, key, $.getDesc(Base, key));
      }
    }
  );
  $Number.prototype = proto;
  proto.constructor = $Number;
  require('./$.redef')(global, NUMBER, $Number);
}
},{"./$":40,"./$.cof":8,"./$.global":25,"./$.has":26,"./$.is-object":32,"./$.redef":49,"./$.support-desc":61}],103:[function(require,module,exports){
// 20.1.2.1 Number.EPSILON
var $def = require('./$.def');

$def($def.S, 'Number', {EPSILON: Math.pow(2, -52)});
},{"./$.def":15}],104:[function(require,module,exports){
// 20.1.2.2 Number.isFinite(number)
var $def      = require('./$.def')
  , _isFinite = require('./$.global').isFinite;

$def($def.S, 'Number', {
  isFinite: function isFinite(it){
    return typeof it == 'number' && _isFinite(it);
  }
});
},{"./$.def":15,"./$.global":25}],105:[function(require,module,exports){
// 20.1.2.3 Number.isInteger(number)
var $def = require('./$.def');

$def($def.S, 'Number', {isInteger: require('./$.is-integer')});
},{"./$.def":15,"./$.is-integer":31}],106:[function(require,module,exports){
// 20.1.2.4 Number.isNaN(number)
var $def = require('./$.def');

$def($def.S, 'Number', {
  isNaN: function isNaN(number){
    return number != number;
  }
});
},{"./$.def":15}],107:[function(require,module,exports){
// 20.1.2.5 Number.isSafeInteger(number)
var $def      = require('./$.def')
  , isInteger = require('./$.is-integer')
  , abs       = Math.abs;

$def($def.S, 'Number', {
  isSafeInteger: function isSafeInteger(number){
    return isInteger(number) && abs(number) <= 0x1fffffffffffff;
  }
});
},{"./$.def":15,"./$.is-integer":31}],108:[function(require,module,exports){
// 20.1.2.6 Number.MAX_SAFE_INTEGER
var $def = require('./$.def');

$def($def.S, 'Number', {MAX_SAFE_INTEGER: 0x1fffffffffffff});
},{"./$.def":15}],109:[function(require,module,exports){
// 20.1.2.10 Number.MIN_SAFE_INTEGER
var $def = require('./$.def');

$def($def.S, 'Number', {MIN_SAFE_INTEGER: -0x1fffffffffffff});
},{"./$.def":15}],110:[function(require,module,exports){
// 20.1.2.12 Number.parseFloat(string)
var $def = require('./$.def');

$def($def.S, 'Number', {parseFloat: parseFloat});
},{"./$.def":15}],111:[function(require,module,exports){
// 20.1.2.13 Number.parseInt(string, radix)
var $def = require('./$.def');

$def($def.S, 'Number', {parseInt: parseInt});
},{"./$.def":15}],112:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $def = require('./$.def');
$def($def.S, 'Object', {assign: require('./$.assign')});
},{"./$.assign":6,"./$.def":15}],113:[function(require,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $def = require('./$.def');
$def($def.S, 'Object', {
  is: require('./$.same')
});
},{"./$.def":15,"./$.same":51}],114:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $def = require('./$.def');
$def($def.S, 'Object', {setPrototypeOf: require('./$.set-proto').set});
},{"./$.def":15,"./$.set-proto":52}],115:[function(require,module,exports){
var $        = require('./$')
  , core     = require('./$.core')
  , $def     = require('./$.def')
  , toObject = require('./$.to-object')
  , isObject = require('./$.is-object');
$.each.call(('freeze,seal,preventExtensions,isFrozen,isSealed,isExtensible,' +
  'getOwnPropertyDescriptor,getPrototypeOf,keys,getOwnPropertyNames').split(',')
, function(KEY, ID){
  var fn     = (core.Object || {})[KEY] || Object[KEY]
    , forced = 0
    , method = {};
  method[KEY] = ID == 0 ? function freeze(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 1 ? function seal(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 2 ? function preventExtensions(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 3 ? function isFrozen(it){
    return isObject(it) ? fn(it) : true;
  } : ID == 4 ? function isSealed(it){
    return isObject(it) ? fn(it) : true;
  } : ID == 5 ? function isExtensible(it){
    return isObject(it) ? fn(it) : false;
  } : ID == 6 ? function getOwnPropertyDescriptor(it, key){
    return fn(toObject(it), key);
  } : ID == 7 ? function getPrototypeOf(it){
    return fn(toObject(it, true));
  } : ID == 8 ? function keys(it){
    return fn(toObject(it));
  } : require('./$.get-names').get;
  try {
    fn('z');
  } catch(e){
    forced = 1;
  }
  $def($def.S + $def.F * forced, 'Object', method);
});
},{"./$":40,"./$.core":13,"./$.def":15,"./$.get-names":24,"./$.is-object":32,"./$.to-object":68}],116:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var classof = require('./$.classof')
  , test    = {};
test[require('./$.wks')('toStringTag')] = 'z';
if(test + '' != '[object z]'){
  require('./$.redef')(Object.prototype, 'toString', function toString(){
    return '[object ' + classof(this) + ']';
  }, true);
}
},{"./$.classof":7,"./$.redef":49,"./$.wks":71}],117:[function(require,module,exports){
'use strict';
var $          = require('./$')
  , LIBRARY    = require('./$.library')
  , global     = require('./$.global')
  , ctx        = require('./$.ctx')
  , classof    = require('./$.classof')
  , $def       = require('./$.def')
  , isObject   = require('./$.is-object')
  , anObject   = require('./$.an-object')
  , aFunction  = require('./$.a-function')
  , strictNew  = require('./$.strict-new')
  , forOf      = require('./$.for-of')
  , setProto   = require('./$.set-proto').set
  , same       = require('./$.same')
  , species    = require('./$.species')
  , SPECIES    = require('./$.wks')('species')
  , RECORD     = require('./$.uid')('record')
  , PROMISE    = 'Promise'
  , process    = global.process
  , isNode     = classof(process) == 'process'
  , asap       = process && process.nextTick || require('./$.task').set
  , P          = global[PROMISE]
  , Wrapper;

function testResolve(sub){
  var test = new P(function(){});
  if(sub)test.constructor = Object;
  return P.resolve(test) === test;
}

var useNative = function(){
  var works = false;
  function P2(x){
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = P && P.resolve && testResolve();
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
    // actual Firefox has broken subclass support, test that
    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
      works = false;
    }
    // actual V8 bug, https://code.google.com/p/v8/issues/detail?id=4162
    if(works && require('./$.support-desc')){
      var thenableThenGotten = false;
      P.resolve($.setDesc({}, 'then', {
        get: function(){ thenableThenGotten = true; }
      }));
      works = thenableThenGotten;
    }
  } catch(e){ works = false; }
  return works;
}();

// helpers
function isPromise(it){
  return isObject(it) && (useNative ? classof(it) == 'Promise' : RECORD in it);
}
function sameConstructor(a, b){
  // library wrapper special case
  if(LIBRARY && a === P && b === Wrapper)return true;
  return same(a, b);
}
function getConstructor(C){
  var S = anObject(C)[SPECIES];
  return S != undefined ? S : C;
}
function isThenable(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
}
function notify(record, isReject){
  if(record.n)return;
  record.n = true;
  var chain = record.c;
  // strange IE + webpack dev server bug - use .call(global)
  asap.call(global, function(){
    var value = record.v
      , ok    = record.s == 1
      , i     = 0;
    function run(react){
      var cb = ok ? react.ok : react.fail
        , ret, then;
      try {
        if(cb){
          if(!ok)record.h = true;
          ret = cb === true ? value : cb(value);
          if(ret === react.P){
            react.rej(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(ret)){
            then.call(ret, react.res, react.rej);
          } else react.res(ret);
        } else react.rej(value);
      } catch(err){
        react.rej(err);
      }
    }
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    chain.length = 0;
    record.n = false;
    if(isReject)setTimeout(function(){
      // strange IE + webpack dev server bug - use .call(global)
      asap.call(global, function(){
        if(isUnhandled(record.p)){
          if(isNode){
            process.emit('unhandledRejection', value, record.p);
          } else if(global.console && console.error){
            console.error('Unhandled promise rejection', value);
          }
        }
        record.a = undefined;
      });
    }, 1);
  });
}
function isUnhandled(promise){
  var record = promise[RECORD]
    , chain  = record.a || record.c
    , i      = 0
    , react;
  if(record.h)return false;
  while(chain.length > i){
    react = chain[i++];
    if(react.fail || !isUnhandled(react.P))return false;
  } return true;
}
function $reject(value){
  var record = this;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  record.a = record.c.slice();
  notify(record, true);
}
function $resolve(value){
  var record = this
    , then;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if(then = isThenable(value)){
      // strange IE + webpack dev server bug - use .call(global)
      asap.call(global, function(){
        var wrapper = {r: record, d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      record.v = value;
      record.s = 1;
      notify(record, false);
    }
  } catch(e){
    $reject.call({r: record, d: false}, e); // wrap
  }
}

// constructor polyfill
if(!useNative){
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor){
    aFunction(executor);
    var record = {
      p: strictNew(this, P, PROMISE),         // <- promise
      c: [],                                  // <- awaiting reactions
      a: undefined,                           // <- checked in isUnhandled reactions
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false,                               // <- handled rejection
      n: false                                // <- notify
    };
    this[RECORD] = record;
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch(err){
      $reject.call(record, err);
    }
  };
  require('./$.mix')(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var S = anObject(anObject(this).constructor)[SPECIES];
      var react = {
        ok:   typeof onFulfilled == 'function' ? onFulfilled : true,
        fail: typeof onRejected == 'function'  ? onRejected  : false
      };
      var promise = react.P = new (S != undefined ? S : P)(function(res, rej){
        react.res = aFunction(res);
        react.rej = aFunction(rej);
      });
      var record = this[RECORD];
      record.c.push(react);
      if(record.a)record.a.push(react);
      if(record.s)notify(record, false);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}

// export
$def($def.G + $def.W + $def.F * !useNative, {Promise: P});
require('./$.tag')(P, PROMISE);
species(P);
species(Wrapper = require('./$.core')[PROMISE]);

// statics
$def($def.S + $def.F * !useNative, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    return new this(function(res, rej){ rej(r); });
  }
});
$def($def.S + $def.F * (!useNative || testResolve(true)), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    return isPromise(x) && sameConstructor(x.constructor, this)
      ? x : new this(function(res){ res(x); });
  }
});
$def($def.S + $def.F * !(useNative && require('./$.iter-detect')(function(iter){
  P.all(iter)['catch'](function(){});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C      = getConstructor(this)
      , values = [];
    return new C(function(res, rej){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        C.resolve(promise).then(function(value){
          results[index] = value;
          --remaining || res(results);
        }, rej);
      });
      else res(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C = getConstructor(this);
    return new C(function(res, rej){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(res, rej);
      });
    });
  }
});
},{"./$":40,"./$.a-function":2,"./$.an-object":3,"./$.classof":7,"./$.core":13,"./$.ctx":14,"./$.def":15,"./$.for-of":23,"./$.global":25,"./$.is-object":32,"./$.iter-detect":37,"./$.library":42,"./$.mix":43,"./$.same":51,"./$.set-proto":52,"./$.species":55,"./$.strict-new":56,"./$.support-desc":61,"./$.tag":62,"./$.task":63,"./$.uid":69,"./$.wks":71}],118:[function(require,module,exports){
// 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
var $def   = require('./$.def')
  , _apply = Function.apply;

$def($def.S, 'Reflect', {
  apply: function apply(target, thisArgument, argumentsList){
    return _apply.call(target, thisArgument, argumentsList);
  }
});
},{"./$.def":15}],119:[function(require,module,exports){
// 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
var $         = require('./$')
  , $def      = require('./$.def')
  , aFunction = require('./$.a-function')
  , isObject  = require('./$.is-object')
  , apply     = Function.apply
  , bind      = Function.bind || require('./$.core').Function.prototype.bind;

$def($def.S, 'Reflect', {
  construct: function construct(target, argumentsList /*, newTarget*/){
    if(arguments.length < 3)return new (bind.apply(target, [null].concat(argumentsList)))();
    var proto    = aFunction(arguments[2]).prototype
      , instance = $.create(isObject(proto) ? proto : Object.prototype)
      , result   = apply.call(target, instance, argumentsList);
    return isObject(result) ? result : instance;
  }
});
},{"./$":40,"./$.a-function":2,"./$.core":13,"./$.def":15,"./$.is-object":32}],120:[function(require,module,exports){
// 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
var $        = require('./$')
  , $def     = require('./$.def')
  , anObject = require('./$.an-object');

// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
$def($def.S + $def.F * require('./$.throws')(function(){
  Reflect.defineProperty($.setDesc({}, 1, {value: 1}), 1, {value: 2});
}), 'Reflect', {
  defineProperty: function defineProperty(target, propertyKey, attributes){
    anObject(target);
    try {
      $.setDesc(target, propertyKey, attributes);
      return true;
    } catch(e){
      return false;
    }
  }
});
},{"./$":40,"./$.an-object":3,"./$.def":15,"./$.throws":64}],121:[function(require,module,exports){
// 26.1.4 Reflect.deleteProperty(target, propertyKey)
var $def     = require('./$.def')
  , getDesc  = require('./$').getDesc
  , anObject = require('./$.an-object');

$def($def.S, 'Reflect', {
  deleteProperty: function deleteProperty(target, propertyKey){
    var desc = getDesc(anObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  }
});
},{"./$":40,"./$.an-object":3,"./$.def":15}],122:[function(require,module,exports){
// 26.1.5 Reflect.enumerate(target)
var $def     = require('./$.def')
  , anObject = require('./$.an-object');

function Enumerate(iterated){
  this._t = anObject(iterated); // target
  this._k = undefined;          // keys
  this._i = 0;                  // next index
}
require('./$.iter-create')(Enumerate, 'Object', function(){
  var that = this
    , keys = that._k
    , key;
  if(keys == undefined){
    that._k = keys = [];
    for(key in that._t)keys.push(key);
  }
  do {
    if(that._i >= keys.length)return {value: undefined, done: true};
  } while(!((key = keys[that._i++]) in that._t));
  return {value: key, done: false};
});

$def($def.S, 'Reflect', {
  enumerate: function enumerate(target){
    return new Enumerate(target);
  }
});
},{"./$.an-object":3,"./$.def":15,"./$.iter-create":35}],123:[function(require,module,exports){
// 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
var $        = require('./$')
  , $def     = require('./$.def')
  , anObject = require('./$.an-object');

$def($def.S, 'Reflect', {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey){
    return $.getDesc(anObject(target), propertyKey);
  }
});
},{"./$":40,"./$.an-object":3,"./$.def":15}],124:[function(require,module,exports){
// 26.1.8 Reflect.getPrototypeOf(target)
var $def     = require('./$.def')
  , getProto = require('./$').getProto
  , anObject = require('./$.an-object');

$def($def.S, 'Reflect', {
  getPrototypeOf: function getPrototypeOf(target){
    return getProto(anObject(target));
  }
});
},{"./$":40,"./$.an-object":3,"./$.def":15}],125:[function(require,module,exports){
// 26.1.6 Reflect.get(target, propertyKey [, receiver])
var $        = require('./$')
  , has      = require('./$.has')
  , $def     = require('./$.def')
  , isObject = require('./$.is-object')
  , anObject = require('./$.an-object');

function get(target, propertyKey/*, receiver*/){
  var receiver = arguments.length < 3 ? target : arguments[2]
    , desc, proto;
  if(anObject(target) === receiver)return target[propertyKey];
  if(desc = $.getDesc(target, propertyKey))return has(desc, 'value')
    ? desc.value
    : desc.get !== undefined
      ? desc.get.call(receiver)
      : undefined;
  if(isObject(proto = $.getProto(target)))return get(proto, propertyKey, receiver);
}

$def($def.S, 'Reflect', {get: get});
},{"./$":40,"./$.an-object":3,"./$.def":15,"./$.has":26,"./$.is-object":32}],126:[function(require,module,exports){
// 26.1.9 Reflect.has(target, propertyKey)
var $def = require('./$.def');

$def($def.S, 'Reflect', {
  has: function has(target, propertyKey){
    return propertyKey in target;
  }
});
},{"./$.def":15}],127:[function(require,module,exports){
// 26.1.10 Reflect.isExtensible(target)
var $def          = require('./$.def')
  , anObject      = require('./$.an-object')
  , _isExtensible = Object.isExtensible || require('./$.is-object');

$def($def.S, 'Reflect', {
  isExtensible: function isExtensible(target){
    return _isExtensible(anObject(target));
  }
});
},{"./$.an-object":3,"./$.def":15,"./$.is-object":32}],128:[function(require,module,exports){
// 26.1.11 Reflect.ownKeys(target)
var $def = require('./$.def');

$def($def.S, 'Reflect', {ownKeys: require('./$.own-keys')});
},{"./$.def":15,"./$.own-keys":45}],129:[function(require,module,exports){
// 26.1.12 Reflect.preventExtensions(target)
var $def               = require('./$.def')
  , anObject           = require('./$.an-object')
  , _preventExtensions = Object.preventExtensions;

$def($def.S, 'Reflect', {
  preventExtensions: function preventExtensions(target){
    anObject(target);
    try {
      if(_preventExtensions)_preventExtensions(target);
      return true;
    } catch(e){
      return false;
    }
  }
});
},{"./$.an-object":3,"./$.def":15}],130:[function(require,module,exports){
// 26.1.14 Reflect.setPrototypeOf(target, proto)
var $def     = require('./$.def')
  , setProto = require('./$.set-proto');

if(setProto)$def($def.S, 'Reflect', {
  setPrototypeOf: function setPrototypeOf(target, proto){
    setProto.check(target, proto);
    try {
      setProto.set(target, proto);
      return true;
    } catch(e){
      return false;
    }
  }
});
},{"./$.def":15,"./$.set-proto":52}],131:[function(require,module,exports){
// 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
var $          = require('./$')
  , has        = require('./$.has')
  , $def       = require('./$.def')
  , createDesc = require('./$.property-desc')
  , anObject   = require('./$.an-object')
  , isObject   = require('./$.is-object');

function set(target, propertyKey, V/*, receiver*/){
  var receiver = arguments.length < 4 ? target : arguments[3]
    , ownDesc  = $.getDesc(anObject(target), propertyKey)
    , existingDescriptor, proto;
  if(!ownDesc){
    if(isObject(proto = $.getProto(target))){
      return set(proto, propertyKey, V, receiver);
    }
    ownDesc = createDesc(0);
  }
  if(has(ownDesc, 'value')){
    if(ownDesc.writable === false || !isObject(receiver))return false;
    existingDescriptor = $.getDesc(receiver, propertyKey) || createDesc(0);
    existingDescriptor.value = V;
    $.setDesc(receiver, propertyKey, existingDescriptor);
    return true;
  }
  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
}

$def($def.S, 'Reflect', {set: set});
},{"./$":40,"./$.an-object":3,"./$.def":15,"./$.has":26,"./$.is-object":32,"./$.property-desc":48}],132:[function(require,module,exports){
var $       = require('./$')
  , global  = require('./$.global')
  , cof     = require('./$.cof')
  , $flags  = require('./$.flags')
  , $RegExp = global.RegExp
  , Base    = $RegExp
  , proto   = $RegExp.prototype
  , re      = /a/g
  // "new" creates a new object
  , CORRECT_NEW = new $RegExp(re) !== re
  // RegExp allows a regex with flags as the pattern
  , ALLOWS_RE_WITH_FLAGS = function(){
    try {
      return $RegExp(re, 'i') == '/a/i';
    } catch(e){ /* empty */ }
  }();

if(require('./$.support-desc')){
  if(!CORRECT_NEW || !ALLOWS_RE_WITH_FLAGS){
    $RegExp = function RegExp(pattern, flags){
      var patternIsRegExp  = cof(pattern) == 'RegExp'
        , flagsIsUndefined = flags === undefined;
      if(!(this instanceof $RegExp) && patternIsRegExp && flagsIsUndefined)return pattern;
      return CORRECT_NEW
        ? new Base(patternIsRegExp && !flagsIsUndefined ? pattern.source : pattern, flags)
        : new Base(patternIsRegExp ? pattern.source : pattern
          , patternIsRegExp && flagsIsUndefined ? $flags.call(pattern) : flags);
    };
    $.each.call($.getNames(Base), function(key){
      key in $RegExp || $.setDesc($RegExp, key, {
        configurable: true,
        get: function(){ return Base[key]; },
        set: function(it){ Base[key] = it; }
      });
    });
    proto.constructor = $RegExp;
    $RegExp.prototype = proto;
    require('./$.redef')(global, 'RegExp', $RegExp);
  }
}

require('./$.species')($RegExp);
},{"./$":40,"./$.cof":8,"./$.flags":22,"./$.global":25,"./$.redef":49,"./$.species":55,"./$.support-desc":61}],133:[function(require,module,exports){
// 21.2.5.3 get RegExp.prototype.flags()
var $ = require('./$');
if(require('./$.support-desc') && /./g.flags != 'g')$.setDesc(RegExp.prototype, 'flags', {
  configurable: true,
  get: require('./$.flags')
});
},{"./$":40,"./$.flags":22,"./$.support-desc":61}],134:[function(require,module,exports){
// @@match logic
require('./$.fix-re-wks')('match', 1, function(MATCH){
  // 21.1.3.11 String.prototype.match(regexp)
  return function match(regexp){
    'use strict';
    var str = String(this)
      , fn  = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, str) : new RegExp(regexp)[MATCH](str);
  };
});
},{"./$.fix-re-wks":21}],135:[function(require,module,exports){
// @@replace logic
require('./$.fix-re-wks')('replace', 2, function(REPLACE, $replace){
  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
  return function replace(searchValue, replaceValue){
    'use strict';
    var str = String(this)
      , fn  = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined
      ? fn.call(searchValue, str, replaceValue)
      : $replace.call(str, searchValue, replaceValue);
  };
});
},{"./$.fix-re-wks":21}],136:[function(require,module,exports){
// @@search logic
require('./$.fix-re-wks')('search', 1, function(SEARCH){
  // 21.1.3.15 String.prototype.search(regexp)
  return function search(regexp){
    'use strict';
    var str = String(this)
      , fn  = regexp == undefined ? undefined : regexp[SEARCH];
    return fn !== undefined ? fn.call(regexp, str) : new RegExp(regexp)[SEARCH](str);
  };
});
},{"./$.fix-re-wks":21}],137:[function(require,module,exports){
// @@split logic
require('./$.fix-re-wks')('split', 2, function(SPLIT, $split){
  // 21.1.3.17 String.prototype.split(separator, limit)
  return function split(separator, limit){
    'use strict';
    var str = String(this)
      , fn  = separator == undefined ? undefined : separator[SPLIT];
    return fn !== undefined ? fn.call(separator, str, limit) : $split.call(str, separator, limit);
  };
});
},{"./$.fix-re-wks":21}],138:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.2 Set Objects
require('./$.collection')('Set', function(get){
  return function Set(){ return get(this, arguments[0]); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./$.collection":12,"./$.collection-strong":9}],139:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $at  = require('./$.string-at')(false);
$def($def.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos){
    return $at(this, pos);
  }
});
},{"./$.def":15,"./$.string-at":57}],140:[function(require,module,exports){
'use strict';
var $def     = require('./$.def')
  , toLength = require('./$.to-length')
  , context  = require('./$.string-context');

// should throw error on regex
$def($def.P + $def.F * !require('./$.throws')(function(){ 'q'.endsWith(/./); }), 'String', {
  // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
  endsWith: function endsWith(searchString /*, endPosition = @length */){
    var that = context(this, searchString, 'endsWith')
      , endPosition = arguments[1]
      , len    = toLength(that.length)
      , end    = endPosition === undefined ? len : Math.min(toLength(endPosition), len)
      , search = String(searchString);
    return that.slice(end - search.length, end) === search;
  }
});
},{"./$.def":15,"./$.string-context":58,"./$.throws":64,"./$.to-length":67}],141:[function(require,module,exports){
var $def    = require('./$.def')
  , toIndex = require('./$.to-index')
  , fromCharCode = String.fromCharCode
  , $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
$def($def.S + $def.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x){ // eslint-disable-line no-unused-vars
    var res = []
      , len = arguments.length
      , i   = 0
      , code;
    while(len > i){
      code = +arguments[i++];
      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});
},{"./$.def":15,"./$.to-index":65}],142:[function(require,module,exports){
'use strict';
var $def    = require('./$.def')
  , context = require('./$.string-context');

$def($def.P, 'String', {
  // 21.1.3.7 String.prototype.includes(searchString, position = 0)
  includes: function includes(searchString /*, position = 0 */){
    return !!~context(this, searchString, 'includes').indexOf(searchString, arguments[1]);
  }
});
},{"./$.def":15,"./$.string-context":58}],143:[function(require,module,exports){
var $at  = require('./$.string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./$.iter-define":36,"./$.string-at":57}],144:[function(require,module,exports){
var $def     = require('./$.def')
  , toObject = require('./$.to-object')
  , toLength = require('./$.to-length');

$def($def.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite){
    var tpl = toObject(callSite.raw)
      , len = toLength(tpl.length)
      , sln = arguments.length
      , res = []
      , i   = 0;
    while(len > i){
      res.push(String(tpl[i++]));
      if(i < sln)res.push(String(arguments[i]));
    } return res.join('');
  }
});
},{"./$.def":15,"./$.to-length":67,"./$.to-object":68}],145:[function(require,module,exports){
var $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: require('./$.string-repeat')
});
},{"./$.def":15,"./$.string-repeat":60}],146:[function(require,module,exports){
'use strict';
var $def     = require('./$.def')
  , toLength = require('./$.to-length')
  , context  = require('./$.string-context');

// should throw error on regex
$def($def.P + $def.F * !require('./$.throws')(function(){ 'q'.startsWith(/./); }), 'String', {
  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
  startsWith: function startsWith(searchString /*, position = 0 */){
    var that   = context(this, searchString, 'startsWith')
      , index  = toLength(Math.min(arguments[1], that.length))
      , search = String(searchString);
    return that.slice(index, index + search.length) === search;
  }
});
},{"./$.def":15,"./$.string-context":58,"./$.throws":64,"./$.to-length":67}],147:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var $              = require('./$')
  , global         = require('./$.global')
  , has            = require('./$.has')
  , SUPPORT_DESC   = require('./$.support-desc')
  , $def           = require('./$.def')
  , $redef         = require('./$.redef')
  , shared         = require('./$.shared')
  , setTag         = require('./$.tag')
  , uid            = require('./$.uid')
  , wks            = require('./$.wks')
  , keyOf          = require('./$.keyof')
  , $names         = require('./$.get-names')
  , enumKeys       = require('./$.enum-keys')
  , anObject       = require('./$.an-object')
  , toObject       = require('./$.to-object')
  , createDesc     = require('./$.property-desc')
  , getDesc        = $.getDesc
  , setDesc        = $.setDesc
  , $create        = $.create
  , getNames       = $names.get
  , $Symbol        = global.Symbol
  , setter         = false
  , HIDDEN         = wks('_hidden')
  , isEnum         = $.isEnum
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , useNative      = typeof $Symbol == 'function'
  , ObjectProto    = Object.prototype;

var setSymbolDesc = SUPPORT_DESC ? function(){ // fallback for old Android
  try {
    return $create(setDesc({}, HIDDEN, {
      get: function(){
        return setDesc(this, HIDDEN, {value: false})[HIDDEN];
      }
    }))[HIDDEN] || setDesc;
  } catch(e){
    return function(it, key, D){
      var protoDesc = getDesc(ObjectProto, key);
      if(protoDesc)delete ObjectProto[key];
      setDesc(it, key, D);
      if(protoDesc && it !== ObjectProto)setDesc(ObjectProto, key, protoDesc);
    };
  }
}() : setDesc;

function wrap(tag){
  var sym = AllSymbols[tag] = $create($Symbol.prototype);
  sym._k = tag;
  SUPPORT_DESC && setter && setSymbolDesc(ObjectProto, tag, {
    configurable: true,
    set: function(value){
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    }
  });
  return sym;
}

function defineProperty(it, key, D){
  if(D && has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))setDesc(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = $create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return setDesc(it, key, D);
}
function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)defineProperty(it, key = keys[i++], P[key]);
  return it;
}
function create(it, P){
  return P === undefined ? $create(it) : defineProperties($create(it), P);
}
function propertyIsEnumerable(key){
  var E = isEnum.call(this, key);
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key]
    ? E : true;
}
function getOwnPropertyDescriptor(it, key){
  var D = getDesc(it = toObject(it), key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
}
function getOwnPropertyNames(it){
  var names  = getNames(toObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
  return result;
}
function getOwnPropertySymbols(it){
  var names  = getNames(toObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
  return result;
}

// 19.4.1.1 Symbol([description])
if(!useNative){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor');
    return wrap(uid(arguments[0]));
  };
  $redef($Symbol.prototype, 'toString', function(){
    return this._k;
  });

  $.create     = create;
  $.isEnum     = propertyIsEnumerable;
  $.getDesc    = getOwnPropertyDescriptor;
  $.setDesc    = defineProperty;
  $.setDescs   = defineProperties;
  $.getNames   = $names.get = getOwnPropertyNames;
  $.getSymbols = getOwnPropertySymbols;

  if(SUPPORT_DESC && !require('./$.library')){
    $redef(ObjectProto, 'propertyIsEnumerable', propertyIsEnumerable, true);
  }
}

var symbolStatics = {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    return keyOf(SymbolRegistry, key);
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
};
// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
$.each.call((
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
    'species,split,toPrimitive,toStringTag,unscopables'
  ).split(','), function(it){
    var sym = wks(it);
    symbolStatics[it] = useNative ? sym : wrap(sym);
  }
);

setter = true;

$def($def.G + $def.W, {Symbol: $Symbol});

$def($def.S, 'Symbol', symbolStatics);

$def($def.S + $def.F * !useNative, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: getOwnPropertySymbols
});

// 19.4.3.5 Symbol.prototype[@@toStringTag]
setTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setTag(global.JSON, 'JSON', true);
},{"./$":40,"./$.an-object":3,"./$.def":15,"./$.enum-keys":18,"./$.get-names":24,"./$.global":25,"./$.has":26,"./$.keyof":41,"./$.library":42,"./$.property-desc":48,"./$.redef":49,"./$.shared":53,"./$.support-desc":61,"./$.tag":62,"./$.to-object":68,"./$.uid":69,"./$.wks":71}],148:[function(require,module,exports){
'use strict';
var $            = require('./$')
  , weak         = require('./$.collection-weak')
  , isObject     = require('./$.is-object')
  , has          = require('./$.has')
  , frozenStore  = weak.frozenStore
  , WEAK         = weak.WEAK
  , isExtensible = Object.isExtensible || isObject
  , tmp          = {};

// 23.3 WeakMap Objects
var $WeakMap = require('./$.collection')('WeakMap', function(get){
  return function WeakMap(){ return get(this, arguments[0]); };
}, {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key){
    if(isObject(key)){
      if(!isExtensible(key))return frozenStore(this).get(key);
      if(has(key, WEAK))return key[WEAK][this._i];
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value){
    return weak.def(this, key, value);
  }
}, weak, true, true);

// IE11 WeakMap frozen keys fix
if(new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  $.each.call(['delete', 'has', 'get', 'set'], function(key){
    var proto  = $WeakMap.prototype
      , method = proto[key];
    require('./$.redef')(proto, key, function(a, b){
      // store frozen objects on leaky map
      if(isObject(a) && !isExtensible(a)){
        var result = frozenStore(this)[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}
},{"./$":40,"./$.collection":12,"./$.collection-weak":11,"./$.has":26,"./$.is-object":32,"./$.redef":49}],149:[function(require,module,exports){
'use strict';
var weak = require('./$.collection-weak');

// 23.4 WeakSet Objects
require('./$.collection')('WeakSet', function(get){
  return function WeakSet(){ return get(this, arguments[0]); };
}, {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value){
    return weak.def(this, value, true);
  }
}, weak, false, true);
},{"./$.collection":12,"./$.collection-weak":11}],150:[function(require,module,exports){
'use strict';
var $def      = require('./$.def')
  , $includes = require('./$.array-includes')(true);
$def($def.P, 'Array', {
  // https://github.com/domenic/Array.prototype.includes
  includes: function includes(el /*, fromIndex = 0 */){
    return $includes(this, el, arguments[1]);
  }
});
require('./$.unscope')('includes');
},{"./$.array-includes":4,"./$.def":15,"./$.unscope":70}],151:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $def  = require('./$.def');

$def($def.P, 'Map', {toJSON: require('./$.collection-to-json')('Map')});
},{"./$.collection-to-json":10,"./$.def":15}],152:[function(require,module,exports){
// http://goo.gl/XkBrjD
var $def     = require('./$.def')
  , $entries = require('./$.object-to-array')(true);

$def($def.S, 'Object', {
  entries: function entries(it){
    return $entries(it);
  }
});
},{"./$.def":15,"./$.object-to-array":44}],153:[function(require,module,exports){
// https://gist.github.com/WebReflection/9353781
var $          = require('./$')
  , $def       = require('./$.def')
  , ownKeys    = require('./$.own-keys')
  , toObject   = require('./$.to-object')
  , createDesc = require('./$.property-desc');

$def($def.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object){
    var O       = toObject(object)
      , setDesc = $.setDesc
      , getDesc = $.getDesc
      , keys    = ownKeys(O)
      , result  = {}
      , i       = 0
      , key, D;
    while(keys.length > i){
      D = getDesc(O, key = keys[i++]);
      if(key in result)setDesc(result, key, createDesc(0, D));
      else result[key] = D;
    } return result;
  }
});
},{"./$":40,"./$.def":15,"./$.own-keys":45,"./$.property-desc":48,"./$.to-object":68}],154:[function(require,module,exports){
// http://goo.gl/XkBrjD
var $def    = require('./$.def')
  , $values = require('./$.object-to-array')(false);

$def($def.S, 'Object', {
  values: function values(it){
    return $values(it);
  }
});
},{"./$.def":15,"./$.object-to-array":44}],155:[function(require,module,exports){
// https://github.com/benjamingr/RexExp.escape
var $def = require('./$.def')
  , $re  = require('./$.replacer')(/[\\^$*+?.()|[\]{}]/g, '\\$&');
$def($def.S, 'RegExp', {escape: function escape(it){ return $re(it); }});

},{"./$.def":15,"./$.replacer":50}],156:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $def  = require('./$.def');

$def($def.P, 'Set', {toJSON: require('./$.collection-to-json')('Set')});
},{"./$.collection-to-json":10,"./$.def":15}],157:[function(require,module,exports){
// https://github.com/mathiasbynens/String.prototype.at
'use strict';
var $def = require('./$.def')
  , $at  = require('./$.string-at')(true);
$def($def.P, 'String', {
  at: function at(pos){
    return $at(this, pos);
  }
});
},{"./$.def":15,"./$.string-at":57}],158:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $pad = require('./$.string-pad');
$def($def.P, 'String', {
  lpad: function lpad(n){
    return $pad(this, n, arguments[1], true);
  }
});
},{"./$.def":15,"./$.string-pad":59}],159:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $pad = require('./$.string-pad');
$def($def.P, 'String', {
  rpad: function rpad(n){
    return $pad(this, n, arguments[1], false);
  }
});
},{"./$.def":15,"./$.string-pad":59}],160:[function(require,module,exports){
// JavaScript 1.6 / Strawman array statics shim
var $       = require('./$')
  , $def    = require('./$.def')
  , $Array  = require('./$.core').Array || Array
  , statics = {};
function setStatics(keys, length){
  $.each.call(keys.split(','), function(key){
    if(length == undefined && key in $Array)statics[key] = $Array[key];
    else if(key in [])statics[key] = require('./$.ctx')(Function.call, [][key], length);
  });
}
setStatics('pop,reverse,shift,keys,values,entries', 1);
setStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
setStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
           'reduce,reduceRight,copyWithin,fill');
$def($def.S, 'Array', statics);
},{"./$":40,"./$.core":13,"./$.ctx":14,"./$.def":15}],161:[function(require,module,exports){
require('./es6.array.iterator');
var global      = require('./$.global')
  , hide        = require('./$.hide')
  , Iterators   = require('./$.iterators')
  , ITERATOR    = require('./$.wks')('iterator')
  , NL          = global.NodeList
  , HTC         = global.HTMLCollection
  , NLProto     = NL && NL.prototype
  , HTCProto    = HTC && HTC.prototype
  , ArrayValues = Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
if(NL && !(ITERATOR in NLProto))hide(NLProto, ITERATOR, ArrayValues);
if(HTC && !(ITERATOR in HTCProto))hide(HTCProto, ITERATOR, ArrayValues);
},{"./$.global":25,"./$.hide":27,"./$.iterators":39,"./$.wks":71,"./es6.array.iterator":79}],162:[function(require,module,exports){
var $def  = require('./$.def')
  , $task = require('./$.task');
$def($def.G + $def.B, {
  setImmediate:   $task.set,
  clearImmediate: $task.clear
});
},{"./$.def":15,"./$.task":63}],163:[function(require,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
var global     = require('./$.global')
  , $def       = require('./$.def')
  , invoke     = require('./$.invoke')
  , partial    = require('./$.partial')
  , navigator  = global.navigator
  , MSIE       = !!navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
function wrap(set){
  return MSIE ? function(fn, time /*, ...args */){
    return set(invoke(
      partial,
      [].slice.call(arguments, 2),
      typeof fn == 'function' ? fn : Function(fn)
    ), time);
  } : set;
}
$def($def.G + $def.B + $def.F * MSIE, {
  setTimeout:  wrap(global.setTimeout),
  setInterval: wrap(global.setInterval)
});
},{"./$.def":15,"./$.global":25,"./$.invoke":29,"./$.partial":46}],164:[function(require,module,exports){
require('./modules/es5');
require('./modules/es6.symbol');
require('./modules/es6.object.assign');
require('./modules/es6.object.is');
require('./modules/es6.object.set-prototype-of');
require('./modules/es6.object.to-string');
require('./modules/es6.object.statics-accept-primitives');
require('./modules/es6.function.name');
require('./modules/es6.function.has-instance');
require('./modules/es6.number.constructor');
require('./modules/es6.number.epsilon');
require('./modules/es6.number.is-finite');
require('./modules/es6.number.is-integer');
require('./modules/es6.number.is-nan');
require('./modules/es6.number.is-safe-integer');
require('./modules/es6.number.max-safe-integer');
require('./modules/es6.number.min-safe-integer');
require('./modules/es6.number.parse-float');
require('./modules/es6.number.parse-int');
require('./modules/es6.math.acosh');
require('./modules/es6.math.asinh');
require('./modules/es6.math.atanh');
require('./modules/es6.math.cbrt');
require('./modules/es6.math.clz32');
require('./modules/es6.math.cosh');
require('./modules/es6.math.expm1');
require('./modules/es6.math.fround');
require('./modules/es6.math.hypot');
require('./modules/es6.math.imul');
require('./modules/es6.math.log10');
require('./modules/es6.math.log1p');
require('./modules/es6.math.log2');
require('./modules/es6.math.sign');
require('./modules/es6.math.sinh');
require('./modules/es6.math.tanh');
require('./modules/es6.math.trunc');
require('./modules/es6.string.from-code-point');
require('./modules/es6.string.raw');
require('./modules/es6.string.iterator');
require('./modules/es6.string.code-point-at');
require('./modules/es6.string.ends-with');
require('./modules/es6.string.includes');
require('./modules/es6.string.repeat');
require('./modules/es6.string.starts-with');
require('./modules/es6.array.from');
require('./modules/es6.array.of');
require('./modules/es6.array.iterator');
require('./modules/es6.array.species');
require('./modules/es6.array.copy-within');
require('./modules/es6.array.fill');
require('./modules/es6.array.find');
require('./modules/es6.array.find-index');
require('./modules/es6.regexp.constructor');
require('./modules/es6.regexp.flags');
require('./modules/es6.regexp.match');
require('./modules/es6.regexp.replace');
require('./modules/es6.regexp.search');
require('./modules/es6.regexp.split');
require('./modules/es6.promise');
require('./modules/es6.map');
require('./modules/es6.set');
require('./modules/es6.weak-map');
require('./modules/es6.weak-set');
require('./modules/es6.reflect.apply');
require('./modules/es6.reflect.construct');
require('./modules/es6.reflect.define-property');
require('./modules/es6.reflect.delete-property');
require('./modules/es6.reflect.enumerate');
require('./modules/es6.reflect.get');
require('./modules/es6.reflect.get-own-property-descriptor');
require('./modules/es6.reflect.get-prototype-of');
require('./modules/es6.reflect.has');
require('./modules/es6.reflect.is-extensible');
require('./modules/es6.reflect.own-keys');
require('./modules/es6.reflect.prevent-extensions');
require('./modules/es6.reflect.set');
require('./modules/es6.reflect.set-prototype-of');
require('./modules/es7.array.includes');
require('./modules/es7.string.at');
require('./modules/es7.string.lpad');
require('./modules/es7.string.rpad');
require('./modules/es7.regexp.escape');
require('./modules/es7.object.get-own-property-descriptors');
require('./modules/es7.object.values');
require('./modules/es7.object.entries');
require('./modules/es7.map.to-json');
require('./modules/es7.set.to-json');
require('./modules/js.array.statics');
require('./modules/web.timers');
require('./modules/web.immediate');
require('./modules/web.dom.iterable');
module.exports = require('./modules/$.core');
},{"./modules/$.core":13,"./modules/es5":73,"./modules/es6.array.copy-within":74,"./modules/es6.array.fill":75,"./modules/es6.array.find":77,"./modules/es6.array.find-index":76,"./modules/es6.array.from":78,"./modules/es6.array.iterator":79,"./modules/es6.array.of":80,"./modules/es6.array.species":81,"./modules/es6.function.has-instance":82,"./modules/es6.function.name":83,"./modules/es6.map":84,"./modules/es6.math.acosh":85,"./modules/es6.math.asinh":86,"./modules/es6.math.atanh":87,"./modules/es6.math.cbrt":88,"./modules/es6.math.clz32":89,"./modules/es6.math.cosh":90,"./modules/es6.math.expm1":91,"./modules/es6.math.fround":92,"./modules/es6.math.hypot":93,"./modules/es6.math.imul":94,"./modules/es6.math.log10":95,"./modules/es6.math.log1p":96,"./modules/es6.math.log2":97,"./modules/es6.math.sign":98,"./modules/es6.math.sinh":99,"./modules/es6.math.tanh":100,"./modules/es6.math.trunc":101,"./modules/es6.number.constructor":102,"./modules/es6.number.epsilon":103,"./modules/es6.number.is-finite":104,"./modules/es6.number.is-integer":105,"./modules/es6.number.is-nan":106,"./modules/es6.number.is-safe-integer":107,"./modules/es6.number.max-safe-integer":108,"./modules/es6.number.min-safe-integer":109,"./modules/es6.number.parse-float":110,"./modules/es6.number.parse-int":111,"./modules/es6.object.assign":112,"./modules/es6.object.is":113,"./modules/es6.object.set-prototype-of":114,"./modules/es6.object.statics-accept-primitives":115,"./modules/es6.object.to-string":116,"./modules/es6.promise":117,"./modules/es6.reflect.apply":118,"./modules/es6.reflect.construct":119,"./modules/es6.reflect.define-property":120,"./modules/es6.reflect.delete-property":121,"./modules/es6.reflect.enumerate":122,"./modules/es6.reflect.get":125,"./modules/es6.reflect.get-own-property-descriptor":123,"./modules/es6.reflect.get-prototype-of":124,"./modules/es6.reflect.has":126,"./modules/es6.reflect.is-extensible":127,"./modules/es6.reflect.own-keys":128,"./modules/es6.reflect.prevent-extensions":129,"./modules/es6.reflect.set":131,"./modules/es6.reflect.set-prototype-of":130,"./modules/es6.regexp.constructor":132,"./modules/es6.regexp.flags":133,"./modules/es6.regexp.match":134,"./modules/es6.regexp.replace":135,"./modules/es6.regexp.search":136,"./modules/es6.regexp.split":137,"./modules/es6.set":138,"./modules/es6.string.code-point-at":139,"./modules/es6.string.ends-with":140,"./modules/es6.string.from-code-point":141,"./modules/es6.string.includes":142,"./modules/es6.string.iterator":143,"./modules/es6.string.raw":144,"./modules/es6.string.repeat":145,"./modules/es6.string.starts-with":146,"./modules/es6.symbol":147,"./modules/es6.weak-map":148,"./modules/es6.weak-set":149,"./modules/es7.array.includes":150,"./modules/es7.map.to-json":151,"./modules/es7.object.entries":152,"./modules/es7.object.get-own-property-descriptors":153,"./modules/es7.object.values":154,"./modules/es7.regexp.escape":155,"./modules/es7.set.to-json":156,"./modules/es7.string.at":157,"./modules/es7.string.lpad":158,"./modules/es7.string.rpad":159,"./modules/js.array.statics":160,"./modules/web.dom.iterable":161,"./modules/web.immediate":162,"./modules/web.timers":163}],165:[function(require,module,exports){
(function (process,global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol =
    typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = Object.create((outerFn || Generator).prototype);

    generator._invoke = makeInvokeMethod(
      innerFn, self || null,
      new Context(tryLocsList || [])
    );

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `value instanceof AwaitArgument` to determine if the yielded value is
  // meant to be awaited. Some may consider the name of this method too
  // cutesy, but they are curmudgeons.
  runtime.awrap = function(arg) {
    return new AwaitArgument(arg);
  };

  function AwaitArgument(arg) {
    this.arg = arg;
  }

  function AsyncIterator(generator) {
    // This invoke function is written in a style that assumes some
    // calling function (or Promise) will handle exceptions.
    function invoke(method, arg) {
      var result = generator[method](arg);
      var value = result.value;
      return value instanceof AwaitArgument
        ? Promise.resolve(value.arg).then(invokeNext, invokeThrow)
        : Promise.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration. If the Promise is rejected, however, the
            // result for this iteration will be rejected with the same
            // reason. Note that rejections of yielded Promises are not
            // thrown back into the generator function, as is the case
            // when an awaited Promise is rejected. This difference in
            // behavior between yield and await is important, because it
            // allows the consumer to decide what to do with the yielded
            // rejection (swallow it and continue, manually .throw it back
            // into the generator, abandon iteration, whatever). With
            // await, by contrast, there is no opportunity to examine the
            // rejection reason outside the generator function, so the
            // only option is to throw it from the await expression, and
            // let the generator function handle the exception.
            result.value = unwrapped;
            return result;
          });
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var invokeNext = invoke.bind(generator, "next");
    var invokeThrow = invoke.bind(generator, "throw");
    var invokeReturn = invoke.bind(generator, "return");
    var previousPromise;

    function enqueue(method, arg) {
      var enqueueResult =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(function() {
          return invoke(method, arg);
        }) : new Promise(function(resolve) {
          resolve(invoke(method, arg));
        });

      // Avoid propagating enqueueResult failures to Promises returned by
      // later invocations of the iterator.
      previousPromise = enqueueResult["catch"](function(ignored){});

      return enqueueResult;
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            context.sent = undefined;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"oMfpAn":167}],166:[function(require,module,exports){
module.exports = require("./lib/polyfill");

},{"./lib/polyfill":1}],167:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],168:[function(require,module,exports){
/*!
 * reveal.js
 * http://lab.hakim.se/reveal-js
 * MIT licensed
 *
 * Copyright (C) 2015 Hakim El Hattab, http://hakim.se
 */
(function( root, factory ) {
	if( typeof define === 'function' && define.amd ) {
		// AMD. Register as an anonymous module.
		define( function() {
			root.Reveal = factory();
			return root.Reveal;
		} );
	} else if( typeof exports === 'object' ) {
		// Node. Does not work with strict CommonJS.
		module.exports = factory();
	} else {
		// Browser globals.
		root.Reveal = factory();
	}
}( this, function() {

	'use strict';

	var Reveal;

	var SLIDES_SELECTOR = '.slides section',
		HORIZONTAL_SLIDES_SELECTOR = '.slides>section',
		VERTICAL_SLIDES_SELECTOR = '.slides>section.present>section',
		HOME_SLIDE_SELECTOR = '.slides>section:first-of-type',

		// Configuration defaults, can be overridden at initialization time
		config = {

			// The "normal" size of the presentation, aspect ratio will be preserved
			// when the presentation is scaled to fit different resolutions
			width: 960,
			height: 700,

			// Factor of the display size that should remain empty around the content
			margin: 0.1,

			// Bounds for smallest/largest possible scale to apply to content
			minScale: 0.2,
			maxScale: 1.5,

			// Display controls in the bottom right corner
			controls: true,

			// Display a presentation progress bar
			progress: true,

			// Display the page number of the current slide
			slideNumber: false,

			// Push each slide change to the browser history
			history: false,

			// Enable keyboard shortcuts for navigation
			keyboard: true,

			// Optional function that blocks keyboard events when retuning false
			keyboardCondition: null,

			// Enable the slide overview mode
			overview: true,

			// Vertical centering of slides
			center: true,

			// Enables touch navigation on devices with touch input
			touch: true,

			// Loop the presentation
			loop: false,

			// Change the presentation direction to be RTL
			rtl: false,

			// Turns fragments on and off globally
			fragments: true,

			// Flags if the presentation is running in an embedded mode,
			// i.e. contained within a limited portion of the screen
			embedded: false,

			// Flags if we should show a help overlay when the questionmark
			// key is pressed
			help: true,

			// Flags if it should be possible to pause the presentation (blackout)
			pause: true,

			// Number of milliseconds between automatically proceeding to the
			// next slide, disabled when set to 0, this value can be overwritten
			// by using a data-autoslide attribute on your slides
			autoSlide: 0,

			// Stop auto-sliding after user input
			autoSlideStoppable: true,

			// Enable slide navigation via mouse wheel
			mouseWheel: false,

			// Apply a 3D roll to links on hover
			rollingLinks: false,

			// Hides the address bar on mobile devices
			hideAddressBar: true,

			// Opens links in an iframe preview overlay
			previewLinks: false,

			// Exposes the reveal.js API through window.postMessage
			postMessage: true,

			// Dispatches all reveal.js events to the parent window through postMessage
			postMessageEvents: false,

			// Focuses body when page changes visiblity to ensure keyboard shortcuts work
			focusBodyOnPageVisibilityChange: true,

			// Transition style
			transition: 'slide', // none/fade/slide/convex/concave/zoom

			// Transition speed
			transitionSpeed: 'default', // default/fast/slow

			// Transition style for full page slide backgrounds
			backgroundTransition: 'fade', // none/fade/slide/convex/concave/zoom

			// Parallax background image
			parallaxBackgroundImage: '', // CSS syntax, e.g. "a.jpg"

			// Parallax background size
			parallaxBackgroundSize: '', // CSS syntax, e.g. "3000px 2000px"

			// Amount of pixels to move the parallax background per slide step
			parallaxBackgroundHorizontal: null,
			parallaxBackgroundVertical: null,

			// Number of slides away from the current that are visible
			viewDistance: 3,

			// Script dependencies to load
			dependencies: []

		},

		// Flags if reveal.js is loaded (has dispatched the 'ready' event)
		loaded = false,

		// Flags if the overview mode is currently active
		overview = false,

		// The horizontal and vertical index of the currently active slide
		indexh,
		indexv,

		// The previous and current slide HTML elements
		previousSlide,
		currentSlide,

		previousBackground,

		// Slides may hold a data-state attribute which we pick up and apply
		// as a class to the body. This list contains the combined state of
		// all current slides.
		state = [],

		// The current scale of the presentation (see width/height config)
		scale = 1,

		// CSS transform that is currently applied to the slides container,
		// split into two groups
		slidesTransform = { layout: '', overview: '' },

		// Cached references to DOM elements
		dom = {},

		// Features supported by the browser, see #checkCapabilities()
		features = {},

		// Client is a mobile device, see #checkCapabilities()
		isMobileDevice,

		// Throttles mouse wheel navigation
		lastMouseWheelStep = 0,

		// Delays updates to the URL due to a Chrome thumbnailer bug
		writeURLTimeout = 0,

		// Flags if the interaction event listeners are bound
		eventsAreBound = false,

		// The current auto-slide duration
		autoSlide = 0,

		// Auto slide properties
		autoSlidePlayer,
		autoSlideTimeout = 0,
		autoSlideStartTime = -1,
		autoSlidePaused = false,

		// Holds information about the currently ongoing touch input
		touch = {
			startX: 0,
			startY: 0,
			startSpan: 0,
			startCount: 0,
			captured: false,
			threshold: 40
		},

		// Holds information about the keyboard shortcuts
		keyboardShortcuts = {
			'N  ,  SPACE':			'Next slide',
			'P':					'Previous slide',
			'&#8592;  ,  H':		'Navigate left',
			'&#8594;  ,  L':		'Navigate right',
			'&#8593;  ,  K':		'Navigate up',
			'&#8595;  ,  J':		'Navigate down',
			'Home':					'First slide',
			'End':					'Last slide',
			'B  ,  .':				'Pause',
			'F':					'Fullscreen',
			'ESC, O':				'Slide overview'
		};

	/**
	 * Starts up the presentation if the client is capable.
	 */
	function initialize( options ) {

		checkCapabilities();

		if( !features.transforms2d && !features.transforms3d ) {
			document.body.setAttribute( 'class', 'no-transforms' );

			// Since JS won't be running any further, we load all lazy
			// loading elements upfront
			var images = toArray( document.getElementsByTagName( 'img' ) ),
				iframes = toArray( document.getElementsByTagName( 'iframe' ) );

			var lazyLoadable = images.concat( iframes );

			for( var i = 0, len = lazyLoadable.length; i < len; i++ ) {
				var element = lazyLoadable[i];
				if( element.getAttribute( 'data-src' ) ) {
					element.setAttribute( 'src', element.getAttribute( 'data-src' ) );
					element.removeAttribute( 'data-src' );
				}
			}

			// If the browser doesn't support core features we won't be
			// using JavaScript to control the presentation
			return;
		}

		// Cache references to key DOM elements
		dom.wrapper = document.querySelector( '.reveal' );
		dom.slides = document.querySelector( '.reveal .slides' );

		// Force a layout when the whole page, incl fonts, has loaded
		window.addEventListener( 'load', layout, false );

		var query = Reveal.getQueryHash();

		// Do not accept new dependencies via query config to avoid
		// the potential of malicious script injection
		if( typeof query['dependencies'] !== 'undefined' ) delete query['dependencies'];

		// Copy options over to our config object
		extend( config, options );
		extend( config, query );

		// Hide the address bar in mobile browsers
		hideAddressBar();

		// Loads the dependencies and continues to #start() once done
		load();

	}

	/**
	 * Inspect the client to see what it's capable of, this
	 * should only happens once per runtime.
	 */
	function checkCapabilities() {

		features.transforms3d = 'WebkitPerspective' in document.body.style ||
								'MozPerspective' in document.body.style ||
								'msPerspective' in document.body.style ||
								'OPerspective' in document.body.style ||
								'perspective' in document.body.style;

		features.transforms2d = 'WebkitTransform' in document.body.style ||
								'MozTransform' in document.body.style ||
								'msTransform' in document.body.style ||
								'OTransform' in document.body.style ||
								'transform' in document.body.style;

		features.requestAnimationFrameMethod = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
		features.requestAnimationFrame = typeof features.requestAnimationFrameMethod === 'function';

		features.canvas = !!document.createElement( 'canvas' ).getContext;

		features.touch = !!( 'ontouchstart' in window );

		// Transitions in the overview are disabled in desktop and
		// mobile Safari due to lag
		features.overviewTransitions = !/Version\/[\d\.]+.*Safari/.test( navigator.userAgent );

		isMobileDevice = /(iphone|ipod|ipad|android)/gi.test( navigator.userAgent );

	}

    /**
     * Loads the dependencies of reveal.js. Dependencies are
     * defined via the configuration option 'dependencies'
     * and will be loaded prior to starting/binding reveal.js.
     * Some dependencies may have an 'async' flag, if so they
     * will load after reveal.js has been started up.
     */
	function load() {

		var scripts = [],
			scriptsAsync = [],
			scriptsToPreload = 0;

		// Called once synchronous scripts finish loading
		function proceed() {
			if( scriptsAsync.length ) {
				// Load asynchronous scripts
				head.js.apply( null, scriptsAsync );
			}

			start();
		}

		function loadScript( s ) {
			head.ready( s.src.match( /([\w\d_\-]*)\.?js$|[^\\\/]*$/i )[0], function() {
				// Extension may contain callback functions
				if( typeof s.callback === 'function' ) {
					s.callback.apply( this );
				}

				if( --scriptsToPreload === 0 ) {
					proceed();
				}
			});
		}

		for( var i = 0, len = config.dependencies.length; i < len; i++ ) {
			var s = config.dependencies[i];

			// Load if there's no condition or the condition is truthy
			if( !s.condition || s.condition() ) {
				if( s.async ) {
					scriptsAsync.push( s.src );
				}
				else {
					scripts.push( s.src );
				}

				loadScript( s );
			}
		}

		if( scripts.length ) {
			scriptsToPreload = scripts.length;

			// Load synchronous scripts
			head.js.apply( null, scripts );
		}
		else {
			proceed();
		}

	}

	/**
	 * Starts up reveal.js by binding input events and navigating
	 * to the current URL deeplink if there is one.
	 */
	function start() {

		// Make sure we've got all the DOM elements we need
		setupDOM();

		// Listen to messages posted to this window
		setupPostMessage();

		// Prevent iframes from scrolling the slides out of view
		setupIframeScrollPrevention();

		// Resets all vertical slides so that only the first is visible
		resetVerticalSlides();

		// Updates the presentation to match the current configuration values
		configure();

		// Read the initial hash
		readURL();

		// Update all backgrounds
		updateBackground( true );

		// Notify listeners that the presentation is ready but use a 1ms
		// timeout to ensure it's not fired synchronously after #initialize()
		setTimeout( function() {
			// Enable transitions now that we're loaded
			dom.slides.classList.remove( 'no-transition' );

			loaded = true;

			dispatchEvent( 'ready', {
				'indexh': indexh,
				'indexv': indexv,
				'currentSlide': currentSlide
			} );
		}, 1 );

		// Special setup and config is required when printing to PDF
		if( isPrintingPDF() ) {
			removeEventListeners();

			// The document needs to have loaded for the PDF layout
			// measurements to be accurate
			if( document.readyState === 'complete' ) {
				setupPDF();
			}
			else {
				window.addEventListener( 'load', setupPDF );
			}
		}

	}

	/**
	 * Finds and stores references to DOM elements which are
	 * required by the presentation. If a required element is
	 * not found, it is created.
	 */
	function setupDOM() {

		// Prevent transitions while we're loading
		dom.slides.classList.add( 'no-transition' );

		// Background element
		dom.background = createSingletonNode( dom.wrapper, 'div', 'backgrounds', null );

		// Progress bar
		dom.progress = createSingletonNode( dom.wrapper, 'div', 'progress', '<span></span>' );
		dom.progressbar = dom.progress.querySelector( 'span' );

		// Arrow controls
		createSingletonNode( dom.wrapper, 'aside', 'controls',
			'<div class="navigate-left"></div>' +
			'<div class="navigate-right"></div>' +
			'<div class="navigate-up"></div>' +
			'<div class="navigate-down"></div>' );

		// Slide number
		dom.slideNumber = createSingletonNode( dom.wrapper, 'div', 'slide-number', '' );

		// Overlay graphic which is displayed during the paused mode
		createSingletonNode( dom.wrapper, 'div', 'pause-overlay', null );

		// Cache references to elements
		dom.controls = document.querySelector( '.reveal .controls' );
		dom.theme = document.querySelector( '#theme' );

		dom.wrapper.setAttribute( 'role', 'application' );

		// There can be multiple instances of controls throughout the page
		dom.controlsLeft = toArray( document.querySelectorAll( '.navigate-left' ) );
		dom.controlsRight = toArray( document.querySelectorAll( '.navigate-right' ) );
		dom.controlsUp = toArray( document.querySelectorAll( '.navigate-up' ) );
		dom.controlsDown = toArray( document.querySelectorAll( '.navigate-down' ) );
		dom.controlsPrev = toArray( document.querySelectorAll( '.navigate-prev' ) );
		dom.controlsNext = toArray( document.querySelectorAll( '.navigate-next' ) );

		dom.statusDiv = createStatusDiv();
	}

	/**
	 * Creates a hidden div with role aria-live to announce the
	 * current slide content. Hide the div off-screen to make it
	 * available only to Assistive Technologies.
	 */
	function createStatusDiv() {

		var statusDiv = document.getElementById( 'aria-status-div' );
		if( !statusDiv ) {
			statusDiv = document.createElement( 'div' );
			statusDiv.style.position = 'absolute';
			statusDiv.style.height = '1px';
			statusDiv.style.width = '1px';
			statusDiv.style.overflow ='hidden';
			statusDiv.style.clip = 'rect( 1px, 1px, 1px, 1px )';
			statusDiv.setAttribute( 'id', 'aria-status-div' );
			statusDiv.setAttribute( 'aria-live', 'polite' );
			statusDiv.setAttribute( 'aria-atomic','true' );
			dom.wrapper.appendChild( statusDiv );
		}
		return statusDiv;

	}

	/**
	 * Configures the presentation for printing to a static
	 * PDF.
	 */
	function setupPDF() {

		var slideSize = getComputedSlideSize( window.innerWidth, window.innerHeight );

		// Dimensions of the PDF pages
		var pageWidth = Math.floor( slideSize.width * ( 1 + config.margin ) ),
			pageHeight = Math.floor( slideSize.height * ( 1 + config.margin  ) );

		// Dimensions of slides within the pages
		var slideWidth = slideSize.width,
			slideHeight = slideSize.height;

		// Let the browser know what page size we want to print
		injectStyleSheet( '@page{size:'+ pageWidth +'px '+ pageHeight +'px; margin: 0;}' );

		// Limit the size of certain elements to the dimensions of the slide
		injectStyleSheet( '.reveal section>img, .reveal section>video, .reveal section>iframe{max-width: '+ slideWidth +'px; max-height:'+ slideHeight +'px}' );

		document.body.classList.add( 'print-pdf' );
		document.body.style.width = pageWidth + 'px';
		document.body.style.height = pageHeight + 'px';

		// Slide and slide background layout
		toArray( dom.wrapper.querySelectorAll( SLIDES_SELECTOR ) ).forEach( function( slide ) {

			// Vertical stacks are not centred since their section
			// children will be
			if( slide.classList.contains( 'stack' ) === false ) {
				// Center the slide inside of the page, giving the slide some margin
				var left = ( pageWidth - slideWidth ) / 2,
					top = ( pageHeight - slideHeight ) / 2;

				var contentHeight = getAbsoluteHeight( slide );
				var numberOfPages = Math.max( Math.ceil( contentHeight / pageHeight ), 1 );

				// Center slides vertically
				if( numberOfPages === 1 && config.center || slide.classList.contains( 'center' ) ) {
					top = Math.max( ( pageHeight - contentHeight ) / 2, 0 );
				}

				// Position the slide inside of the page
				slide.style.left = left + 'px';
				slide.style.top = top + 'px';
				slide.style.width = slideWidth + 'px';

				// TODO Backgrounds need to be multiplied when the slide
				// stretches over multiple pages
				var background = slide.querySelector( '.slide-background' );
				if( background ) {
					background.style.width = pageWidth + 'px';
					background.style.height = ( pageHeight * numberOfPages ) + 'px';
					background.style.top = -top + 'px';
					background.style.left = -left + 'px';
				}
			}

		} );

		// Show all fragments
		toArray( dom.wrapper.querySelectorAll( SLIDES_SELECTOR + ' .fragment' ) ).forEach( function( fragment ) {
			fragment.classList.add( 'visible' );
		} );

	}

	/**
	 * This is an unfortunate necessity. Iframes can trigger the
	 * parent window to scroll, for example by focusing an input.
	 * This scrolling can not be prevented by hiding overflow in
	 * CSS so we have to resort to repeatedly checking if the
	 * browser has decided to offset our slides :(
	 */
	function setupIframeScrollPrevention() {

		if( dom.slides.querySelector( 'iframe' ) ) {
			setInterval( function() {
				if( dom.wrapper.scrollTop !== 0 || dom.wrapper.scrollLeft !== 0 ) {
					dom.wrapper.scrollTop = 0;
					dom.wrapper.scrollLeft = 0;
				}
			}, 500 );
		}

	}

	/**
	 * Creates an HTML element and returns a reference to it.
	 * If the element already exists the existing instance will
	 * be returned.
	 */
	function createSingletonNode( container, tagname, classname, innerHTML ) {

		// Find all nodes matching the description
		var nodes = container.querySelectorAll( '.' + classname );

		// Check all matches to find one which is a direct child of
		// the specified container
		for( var i = 0; i < nodes.length; i++ ) {
			var testNode = nodes[i];
			if( testNode.parentNode === container ) {
				return testNode;
			}
		}

		// If no node was found, create it now
		var node = document.createElement( tagname );
		node.classList.add( classname );
		if( typeof innerHTML === 'string' ) {
			node.innerHTML = innerHTML;
		}
		container.appendChild( node );

		return node;

	}

	/**
	 * Creates the slide background elements and appends them
	 * to the background container. One element is created per
	 * slide no matter if the given slide has visible background.
	 */
	function createBackgrounds() {

		var printMode = isPrintingPDF();

		// Clear prior backgrounds
		dom.background.innerHTML = '';
		dom.background.classList.add( 'no-transition' );

		// Iterate over all horizontal slides
		toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) ).forEach( function( slideh ) {

			var backgroundStack;

			if( printMode ) {
				backgroundStack = createBackground( slideh, slideh );
			}
			else {
				backgroundStack = createBackground( slideh, dom.background );
			}

			// Iterate over all vertical slides
			toArray( slideh.querySelectorAll( 'section' ) ).forEach( function( slidev ) {

				if( printMode ) {
					createBackground( slidev, slidev );
				}
				else {
					createBackground( slidev, backgroundStack );
				}

				backgroundStack.classList.add( 'stack' );

			} );

		} );

		// Add parallax background if specified
		if( config.parallaxBackgroundImage ) {

			dom.background.style.backgroundImage = 'url("' + config.parallaxBackgroundImage + '")';
			dom.background.style.backgroundSize = config.parallaxBackgroundSize;

			// Make sure the below properties are set on the element - these properties are
			// needed for proper transitions to be set on the element via CSS. To remove
			// annoying background slide-in effect when the presentation starts, apply
			// these properties after short time delay
			setTimeout( function() {
				dom.wrapper.classList.add( 'has-parallax-background' );
			}, 1 );

		}
		else {

			dom.background.style.backgroundImage = '';
			dom.wrapper.classList.remove( 'has-parallax-background' );

		}

	}

	/**
	 * Creates a background for the given slide.
	 *
	 * @param {HTMLElement} slide
	 * @param {HTMLElement} container The element that the background
	 * should be appended to
	 */
	function createBackground( slide, container ) {

		var data = {
			background: slide.getAttribute( 'data-background' ),
			backgroundSize: slide.getAttribute( 'data-background-size' ),
			backgroundImage: slide.getAttribute( 'data-background-image' ),
			backgroundVideo: slide.getAttribute( 'data-background-video' ),
			backgroundIframe: slide.getAttribute( 'data-background-iframe' ),
			backgroundColor: slide.getAttribute( 'data-background-color' ),
			backgroundRepeat: slide.getAttribute( 'data-background-repeat' ),
			backgroundPosition: slide.getAttribute( 'data-background-position' ),
			backgroundTransition: slide.getAttribute( 'data-background-transition' )
		};

		var element = document.createElement( 'div' );

		// Carry over custom classes from the slide to the background
		element.className = 'slide-background ' + slide.className.replace( /present|past|future/, '' );

		if( data.background ) {
			// Auto-wrap image urls in url(...)
			if( /^(http|file|\/\/)/gi.test( data.background ) || /\.(svg|png|jpg|jpeg|gif|bmp)$/gi.test( data.background ) ) {
				slide.setAttribute( 'data-background-image', data.background );
			}
			else {
				element.style.background = data.background;
			}
		}

		// Create a hash for this combination of background settings.
		// This is used to determine when two slide backgrounds are
		// the same.
		if( data.background || data.backgroundColor || data.backgroundImage || data.backgroundVideo || data.backgroundIframe ) {
			element.setAttribute( 'data-background-hash', data.background +
															data.backgroundSize +
															data.backgroundImage +
															data.backgroundVideo +
															data.backgroundIframe +
															data.backgroundColor +
															data.backgroundRepeat +
															data.backgroundPosition +
															data.backgroundTransition );
		}

		// Additional and optional background properties
		if( data.backgroundSize ) element.style.backgroundSize = data.backgroundSize;
		if( data.backgroundColor ) element.style.backgroundColor = data.backgroundColor;
		if( data.backgroundRepeat ) element.style.backgroundRepeat = data.backgroundRepeat;
		if( data.backgroundPosition ) element.style.backgroundPosition = data.backgroundPosition;
		if( data.backgroundTransition ) element.setAttribute( 'data-background-transition', data.backgroundTransition );

		container.appendChild( element );

		// If backgrounds are being recreated, clear old classes
		slide.classList.remove( 'has-dark-background' );
		slide.classList.remove( 'has-light-background' );

		// If this slide has a background color, add a class that
		// signals if it is light or dark. If the slide has no background
		// color, no class will be set
		var computedBackgroundColor = window.getComputedStyle( element ).backgroundColor;
		if( computedBackgroundColor ) {
			var rgb = colorToRgb( computedBackgroundColor );

			// Ignore fully transparent backgrounds. Some browsers return
			// rgba(0,0,0,0) when reading the computed background color of
			// an element with no background
			if( rgb && rgb.a !== 0 ) {
				if( colorBrightness( computedBackgroundColor ) < 128 ) {
					slide.classList.add( 'has-dark-background' );
				}
				else {
					slide.classList.add( 'has-light-background' );
				}
			}
		}

		return element;

	}

	/**
	 * Registers a listener to postMessage events, this makes it
	 * possible to call all reveal.js API methods from another
	 * window. For example:
	 *
	 * revealWindow.postMessage( JSON.stringify({
	 *   method: 'slide',
	 *   args: [ 2 ]
	 * }), '*' );
	 */
	function setupPostMessage() {

		if( config.postMessage ) {
			window.addEventListener( 'message', function ( event ) {
				var data = event.data;

				// Make sure we're dealing with JSON
				if( typeof data === 'string' && data.charAt( 0 ) === '{' && data.charAt( data.length - 1 ) === '}' ) {
					data = JSON.parse( data );

					// Check if the requested method can be found
					if( data.method && typeof Reveal[data.method] === 'function' ) {
						Reveal[data.method].apply( Reveal, data.args );
					}
				}
			}, false );
		}

	}

	/**
	 * Applies the configuration settings from the config
	 * object. May be called multiple times.
	 */
	function configure( options ) {

		var numberOfSlides = dom.wrapper.querySelectorAll( SLIDES_SELECTOR ).length;

		dom.wrapper.classList.remove( config.transition );

		// New config options may be passed when this method
		// is invoked through the API after initialization
		if( typeof options === 'object' ) extend( config, options );

		// Force linear transition based on browser capabilities
		if( features.transforms3d === false ) config.transition = 'linear';

		dom.wrapper.classList.add( config.transition );

		dom.wrapper.setAttribute( 'data-transition-speed', config.transitionSpeed );
		dom.wrapper.setAttribute( 'data-background-transition', config.backgroundTransition );

		dom.controls.style.display = config.controls ? 'block' : 'none';
		dom.progress.style.display = config.progress ? 'block' : 'none';

		if( config.rtl ) {
			dom.wrapper.classList.add( 'rtl' );
		}
		else {
			dom.wrapper.classList.remove( 'rtl' );
		}

		if( config.center ) {
			dom.wrapper.classList.add( 'center' );
		}
		else {
			dom.wrapper.classList.remove( 'center' );
		}

		// Exit the paused mode if it was configured off
		if( config.pause === false ) {
			resume();
		}

		if( config.mouseWheel ) {
			document.addEventListener( 'DOMMouseScroll', onDocumentMouseScroll, false ); // FF
			document.addEventListener( 'mousewheel', onDocumentMouseScroll, false );
		}
		else {
			document.removeEventListener( 'DOMMouseScroll', onDocumentMouseScroll, false ); // FF
			document.removeEventListener( 'mousewheel', onDocumentMouseScroll, false );
		}

		// Rolling 3D links
		if( config.rollingLinks ) {
			enableRollingLinks();
		}
		else {
			disableRollingLinks();
		}

		// Iframe link previews
		if( config.previewLinks ) {
			enablePreviewLinks();
		}
		else {
			disablePreviewLinks();
			enablePreviewLinks( '[data-preview-link]' );
		}

		// Remove existing auto-slide controls
		if( autoSlidePlayer ) {
			autoSlidePlayer.destroy();
			autoSlidePlayer = null;
		}

		// Generate auto-slide controls if needed
		if( numberOfSlides > 1 && config.autoSlide && config.autoSlideStoppable && features.canvas && features.requestAnimationFrame ) {
			autoSlidePlayer = new Playback( dom.wrapper, function() {
				return Math.min( Math.max( ( Date.now() - autoSlideStartTime ) / autoSlide, 0 ), 1 );
			} );

			autoSlidePlayer.on( 'click', onAutoSlidePlayerClick );
			autoSlidePaused = false;
		}

		// When fragments are turned off they should be visible
		if( config.fragments === false ) {
			toArray( dom.slides.querySelectorAll( '.fragment' ) ).forEach( function( element ) {
				element.classList.add( 'visible' );
				element.classList.remove( 'current-fragment' );
			} );
		}

		sync();

	}

	/**
	 * Binds all event listeners.
	 */
	function addEventListeners() {

		eventsAreBound = true;

		window.addEventListener( 'hashchange', onWindowHashChange, false );
		window.addEventListener( 'resize', onWindowResize, false );

		if( config.touch ) {
			dom.wrapper.addEventListener( 'touchstart', onTouchStart, false );
			dom.wrapper.addEventListener( 'touchmove', onTouchMove, false );
			dom.wrapper.addEventListener( 'touchend', onTouchEnd, false );

			// Support pointer-style touch interaction as well
			if( window.navigator.pointerEnabled ) {
				// IE 11 uses un-prefixed version of pointer events
				dom.wrapper.addEventListener( 'pointerdown', onPointerDown, false );
				dom.wrapper.addEventListener( 'pointermove', onPointerMove, false );
				dom.wrapper.addEventListener( 'pointerup', onPointerUp, false );
			}
			else if( window.navigator.msPointerEnabled ) {
				// IE 10 uses prefixed version of pointer events
				dom.wrapper.addEventListener( 'MSPointerDown', onPointerDown, false );
				dom.wrapper.addEventListener( 'MSPointerMove', onPointerMove, false );
				dom.wrapper.addEventListener( 'MSPointerUp', onPointerUp, false );
			}
		}

		if( config.keyboard ) {
			document.addEventListener( 'keydown', onDocumentKeyDown, false );
			document.addEventListener( 'keypress', onDocumentKeyPress, false );
		}

		if( config.progress && dom.progress ) {
			dom.progress.addEventListener( 'click', onProgressClicked, false );
		}

		if( config.focusBodyOnPageVisibilityChange ) {
			var visibilityChange;

			if( 'hidden' in document ) {
				visibilityChange = 'visibilitychange';
			}
			else if( 'msHidden' in document ) {
				visibilityChange = 'msvisibilitychange';
			}
			else if( 'webkitHidden' in document ) {
				visibilityChange = 'webkitvisibilitychange';
			}

			if( visibilityChange ) {
				document.addEventListener( visibilityChange, onPageVisibilityChange, false );
			}
		}

		// Listen to both touch and click events, in case the device
		// supports both
		var pointerEvents = [ 'touchstart', 'click' ];

		// Only support touch for Android, fixes double navigations in
		// stock browser
		if( navigator.userAgent.match( /android/gi ) ) {
			pointerEvents = [ 'touchstart' ];
		}

		pointerEvents.forEach( function( eventName ) {
			dom.controlsLeft.forEach( function( el ) { el.addEventListener( eventName, onNavigateLeftClicked, false ); } );
			dom.controlsRight.forEach( function( el ) { el.addEventListener( eventName, onNavigateRightClicked, false ); } );
			dom.controlsUp.forEach( function( el ) { el.addEventListener( eventName, onNavigateUpClicked, false ); } );
			dom.controlsDown.forEach( function( el ) { el.addEventListener( eventName, onNavigateDownClicked, false ); } );
			dom.controlsPrev.forEach( function( el ) { el.addEventListener( eventName, onNavigatePrevClicked, false ); } );
			dom.controlsNext.forEach( function( el ) { el.addEventListener( eventName, onNavigateNextClicked, false ); } );
		} );

	}

	/**
	 * Unbinds all event listeners.
	 */
	function removeEventListeners() {

		eventsAreBound = false;

		document.removeEventListener( 'keydown', onDocumentKeyDown, false );
		document.removeEventListener( 'keypress', onDocumentKeyPress, false );
		window.removeEventListener( 'hashchange', onWindowHashChange, false );
		window.removeEventListener( 'resize', onWindowResize, false );

		dom.wrapper.removeEventListener( 'touchstart', onTouchStart, false );
		dom.wrapper.removeEventListener( 'touchmove', onTouchMove, false );
		dom.wrapper.removeEventListener( 'touchend', onTouchEnd, false );

		// IE11
		if( window.navigator.pointerEnabled ) {
			dom.wrapper.removeEventListener( 'pointerdown', onPointerDown, false );
			dom.wrapper.removeEventListener( 'pointermove', onPointerMove, false );
			dom.wrapper.removeEventListener( 'pointerup', onPointerUp, false );
		}
		// IE10
		else if( window.navigator.msPointerEnabled ) {
			dom.wrapper.removeEventListener( 'MSPointerDown', onPointerDown, false );
			dom.wrapper.removeEventListener( 'MSPointerMove', onPointerMove, false );
			dom.wrapper.removeEventListener( 'MSPointerUp', onPointerUp, false );
		}

		if ( config.progress && dom.progress ) {
			dom.progress.removeEventListener( 'click', onProgressClicked, false );
		}

		[ 'touchstart', 'click' ].forEach( function( eventName ) {
			dom.controlsLeft.forEach( function( el ) { el.removeEventListener( eventName, onNavigateLeftClicked, false ); } );
			dom.controlsRight.forEach( function( el ) { el.removeEventListener( eventName, onNavigateRightClicked, false ); } );
			dom.controlsUp.forEach( function( el ) { el.removeEventListener( eventName, onNavigateUpClicked, false ); } );
			dom.controlsDown.forEach( function( el ) { el.removeEventListener( eventName, onNavigateDownClicked, false ); } );
			dom.controlsPrev.forEach( function( el ) { el.removeEventListener( eventName, onNavigatePrevClicked, false ); } );
			dom.controlsNext.forEach( function( el ) { el.removeEventListener( eventName, onNavigateNextClicked, false ); } );
		} );

	}

	/**
	 * Extend object a with the properties of object b.
	 * If there's a conflict, object b takes precedence.
	 */
	function extend( a, b ) {

		for( var i in b ) {
			a[ i ] = b[ i ];
		}

	}

	/**
	 * Converts the target object to an array.
	 */
	function toArray( o ) {

		return Array.prototype.slice.call( o );

	}

	/**
	 * Utility for deserializing a value.
	 */
	function deserialize( value ) {

		if( typeof value === 'string' ) {
			if( value === 'null' ) return null;
			else if( value === 'true' ) return true;
			else if( value === 'false' ) return false;
			else if( value.match( /^\d+$/ ) ) return parseFloat( value );
		}

		return value;

	}

	/**
	 * Measures the distance in pixels between point a
	 * and point b.
	 *
	 * @param {Object} a point with x/y properties
	 * @param {Object} b point with x/y properties
	 */
	function distanceBetween( a, b ) {

		var dx = a.x - b.x,
			dy = a.y - b.y;

		return Math.sqrt( dx*dx + dy*dy );

	}

	/**
	 * Applies a CSS transform to the target element.
	 */
	function transformElement( element, transform ) {

		element.style.WebkitTransform = transform;
		element.style.MozTransform = transform;
		element.style.msTransform = transform;
		element.style.transform = transform;

	}

	/**
	 * Applies CSS transforms to the slides container. The container
	 * is transformed from two separate sources: layout and the overview
	 * mode.
	 */
	function transformSlides( transforms ) {

		// Pick up new transforms from arguments
		if( typeof transforms.layout === 'string' ) slidesTransform.layout = transforms.layout;
		if( typeof transforms.overview === 'string' ) slidesTransform.overview = transforms.overview;

		// Apply the transforms to the slides container
		if( slidesTransform.layout ) {
			transformElement( dom.slides, slidesTransform.layout + ' ' + slidesTransform.overview );
		}
		else {
			transformElement( dom.slides, slidesTransform.overview );
		}

	}

	/**
	 * Injects the given CSS styles into the DOM.
	 */
	function injectStyleSheet( value ) {

		var tag = document.createElement( 'style' );
		tag.type = 'text/css';
		if( tag.styleSheet ) {
			tag.styleSheet.cssText = value;
		}
		else {
			tag.appendChild( document.createTextNode( value ) );
		}
		document.getElementsByTagName( 'head' )[0].appendChild( tag );

	}

	/**
	 * Converts various color input formats to an {r:0,g:0,b:0} object.
	 *
	 * @param {String} color The string representation of a color,
	 * the following formats are supported:
	 * - #000
	 * - #000000
	 * - rgb(0,0,0)
	 */
	function colorToRgb( color ) {

		var hex3 = color.match( /^#([0-9a-f]{3})$/i );
		if( hex3 && hex3[1] ) {
			hex3 = hex3[1];
			return {
				r: parseInt( hex3.charAt( 0 ), 16 ) * 0x11,
				g: parseInt( hex3.charAt( 1 ), 16 ) * 0x11,
				b: parseInt( hex3.charAt( 2 ), 16 ) * 0x11
			};
		}

		var hex6 = color.match( /^#([0-9a-f]{6})$/i );
		if( hex6 && hex6[1] ) {
			hex6 = hex6[1];
			return {
				r: parseInt( hex6.substr( 0, 2 ), 16 ),
				g: parseInt( hex6.substr( 2, 2 ), 16 ),
				b: parseInt( hex6.substr( 4, 2 ), 16 )
			};
		}

		var rgb = color.match( /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i );
		if( rgb ) {
			return {
				r: parseInt( rgb[1], 10 ),
				g: parseInt( rgb[2], 10 ),
				b: parseInt( rgb[3], 10 )
			};
		}

		var rgba = color.match( /^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\,\s*([\d]+|[\d]*.[\d]+)\s*\)$/i );
		if( rgba ) {
			return {
				r: parseInt( rgba[1], 10 ),
				g: parseInt( rgba[2], 10 ),
				b: parseInt( rgba[3], 10 ),
				a: parseFloat( rgba[4] )
			};
		}

		return null;

	}

	/**
	 * Calculates brightness on a scale of 0-255.
	 *
	 * @param color See colorStringToRgb for supported formats.
	 */
	function colorBrightness( color ) {

		if( typeof color === 'string' ) color = colorToRgb( color );

		if( color ) {
			return ( color.r * 299 + color.g * 587 + color.b * 114 ) / 1000;
		}

		return null;

	}

	/**
	 * Retrieves the height of the given element by looking
	 * at the position and height of its immediate children.
	 */
	function getAbsoluteHeight( element ) {

		var height = 0;

		if( element ) {
			var absoluteChildren = 0;

			toArray( element.childNodes ).forEach( function( child ) {

				if( typeof child.offsetTop === 'number' && child.style ) {
					// Count # of abs children
					if( window.getComputedStyle( child ).position === 'absolute' ) {
						absoluteChildren += 1;
					}

					height = Math.max( height, child.offsetTop + child.offsetHeight );
				}

			} );

			// If there are no absolute children, use offsetHeight
			if( absoluteChildren === 0 ) {
				height = element.offsetHeight;
			}

		}

		return height;

	}

	/**
	 * Returns the remaining height within the parent of the
	 * target element.
	 *
	 * remaining height = [ configured parent height ] - [ current parent height ]
	 */
	function getRemainingHeight( element, height ) {

		height = height || 0;

		if( element ) {
			var newHeight, oldHeight = element.style.height;

			// Change the .stretch element height to 0 in order find the height of all
			// the other elements
			element.style.height = '0px';
			newHeight = height - element.parentNode.offsetHeight;

			// Restore the old height, just in case
			element.style.height = oldHeight + 'px';

			return newHeight;
		}

		return height;

	}

	/**
	 * Checks if this instance is being used to print a PDF.
	 */
	function isPrintingPDF() {

		return ( /print-pdf/gi ).test( window.location.search );

	}

	/**
	 * Hides the address bar if we're on a mobile device.
	 */
	function hideAddressBar() {

		if( config.hideAddressBar && isMobileDevice ) {
			// Events that should trigger the address bar to hide
			window.addEventListener( 'load', removeAddressBar, false );
			window.addEventListener( 'orientationchange', removeAddressBar, false );
		}

	}

	/**
	 * Causes the address bar to hide on mobile devices,
	 * more vertical space ftw.
	 */
	function removeAddressBar() {

		setTimeout( function() {
			window.scrollTo( 0, 1 );
		}, 10 );

	}

	/**
	 * Dispatches an event of the specified type from the
	 * reveal DOM element.
	 */
	function dispatchEvent( type, args ) {

		var event = document.createEvent( 'HTMLEvents', 1, 2 );
		event.initEvent( type, true, true );
		extend( event, args );
		dom.wrapper.dispatchEvent( event );

		// If we're in an iframe, post each reveal.js event to the
		// parent window. Used by the notes plugin
		if( config.postMessageEvents && window.parent !== window.self ) {
			window.parent.postMessage( JSON.stringify({ namespace: 'reveal', eventName: type, state: getState() }), '*' );
		}

	}

	/**
	 * Wrap all links in 3D goodness.
	 */
	function enableRollingLinks() {

		if( features.transforms3d && !( 'msPerspective' in document.body.style ) ) {
			var anchors = dom.wrapper.querySelectorAll( SLIDES_SELECTOR + ' a' );

			for( var i = 0, len = anchors.length; i < len; i++ ) {
				var anchor = anchors[i];

				if( anchor.textContent && !anchor.querySelector( '*' ) && ( !anchor.className || !anchor.classList.contains( anchor, 'roll' ) ) ) {
					var span = document.createElement('span');
					span.setAttribute('data-title', anchor.text);
					span.innerHTML = anchor.innerHTML;

					anchor.classList.add( 'roll' );
					anchor.innerHTML = '';
					anchor.appendChild(span);
				}
			}
		}

	}

	/**
	 * Unwrap all 3D links.
	 */
	function disableRollingLinks() {

		var anchors = dom.wrapper.querySelectorAll( SLIDES_SELECTOR + ' a.roll' );

		for( var i = 0, len = anchors.length; i < len; i++ ) {
			var anchor = anchors[i];
			var span = anchor.querySelector( 'span' );

			if( span ) {
				anchor.classList.remove( 'roll' );
				anchor.innerHTML = span.innerHTML;
			}
		}

	}

	/**
	 * Bind preview frame links.
	 */
	function enablePreviewLinks( selector ) {

		var anchors = toArray( document.querySelectorAll( selector ? selector : 'a' ) );

		anchors.forEach( function( element ) {
			if( /^(http|www)/gi.test( element.getAttribute( 'href' ) ) ) {
				element.addEventListener( 'click', onPreviewLinkClicked, false );
			}
		} );

	}

	/**
	 * Unbind preview frame links.
	 */
	function disablePreviewLinks() {

		var anchors = toArray( document.querySelectorAll( 'a' ) );

		anchors.forEach( function( element ) {
			if( /^(http|www)/gi.test( element.getAttribute( 'href' ) ) ) {
				element.removeEventListener( 'click', onPreviewLinkClicked, false );
			}
		} );

	}

	/**
	 * Opens a preview window for the target URL.
	 */
	function showPreview( url ) {

		closeOverlay();

		dom.overlay = document.createElement( 'div' );
		dom.overlay.classList.add( 'overlay' );
		dom.overlay.classList.add( 'overlay-preview' );
		dom.wrapper.appendChild( dom.overlay );

		dom.overlay.innerHTML = [
			'<header>',
				'<a class="close" href="#"><span class="icon"></span></a>',
				'<a class="external" href="'+ url +'" target="_blank"><span class="icon"></span></a>',
			'</header>',
			'<div class="spinner"></div>',
			'<div class="viewport">',
				'<iframe src="'+ url +'"></iframe>',
			'</div>'
		].join('');

		dom.overlay.querySelector( 'iframe' ).addEventListener( 'load', function( event ) {
			dom.overlay.classList.add( 'loaded' );
		}, false );

		dom.overlay.querySelector( '.close' ).addEventListener( 'click', function( event ) {
			closeOverlay();
			event.preventDefault();
		}, false );

		dom.overlay.querySelector( '.external' ).addEventListener( 'click', function( event ) {
			closeOverlay();
		}, false );

		setTimeout( function() {
			dom.overlay.classList.add( 'visible' );
		}, 1 );

	}

	/**
	 * Opens a overlay window with help material.
	 */
	function showHelp() {

		if( config.help ) {

			closeOverlay();

			dom.overlay = document.createElement( 'div' );
			dom.overlay.classList.add( 'overlay' );
			dom.overlay.classList.add( 'overlay-help' );
			dom.wrapper.appendChild( dom.overlay );

			var html = '<p class="title">Keyboard Shortcuts</p><br/>';

			html += '<table><th>KEY</th><th>ACTION</th>';
			for( var key in keyboardShortcuts ) {
				html += '<tr><td>' + key + '</td><td>' + keyboardShortcuts[ key ] + '</td></tr>';
			}

			html += '</table>';

			dom.overlay.innerHTML = [
				'<header>',
					'<a class="close" href="#"><span class="icon"></span></a>',
				'</header>',
				'<div class="viewport">',
					'<div class="viewport-inner">'+ html +'</div>',
				'</div>'
			].join('');

			dom.overlay.querySelector( '.close' ).addEventListener( 'click', function( event ) {
				closeOverlay();
				event.preventDefault();
			}, false );

			setTimeout( function() {
				dom.overlay.classList.add( 'visible' );
			}, 1 );

		}

	}

	/**
	 * Closes any currently open overlay.
	 */
	function closeOverlay() {

		if( dom.overlay ) {
			dom.overlay.parentNode.removeChild( dom.overlay );
			dom.overlay = null;
		}

	}

	/**
	 * Applies JavaScript-controlled layout rules to the
	 * presentation.
	 */
	function layout() {

		if( dom.wrapper && !isPrintingPDF() ) {

			var size = getComputedSlideSize();

			var slidePadding = 20; // TODO Dig this out of DOM

			// Layout the contents of the slides
			layoutSlideContents( config.width, config.height, slidePadding );

			dom.slides.style.width = size.width + 'px';
			dom.slides.style.height = size.height + 'px';

			// Determine scale of content to fit within available space
			scale = Math.min( size.presentationWidth / size.width, size.presentationHeight / size.height );

			// Respect max/min scale settings
			scale = Math.max( scale, config.minScale );
			scale = Math.min( scale, config.maxScale );

			// Don't apply any scaling styles if scale is 1
			if( scale === 1 ) {
				dom.slides.style.zoom = '';
				dom.slides.style.left = '';
				dom.slides.style.top = '';
				dom.slides.style.bottom = '';
				dom.slides.style.right = '';
				transformSlides( { layout: '' } );
			}
			else {
				// Prefer zooming in desktop Chrome so that content remains crisp
				if( !isMobileDevice && /chrome/i.test( navigator.userAgent ) && typeof dom.slides.style.zoom !== 'undefined' ) {
					dom.slides.style.zoom = scale;
					transformSlides( { layout: '' } );
				}
				// Apply scale transform as a fallback
				else {
					dom.slides.style.left = '50%';
					dom.slides.style.top = '50%';
					dom.slides.style.bottom = 'auto';
					dom.slides.style.right = 'auto';
					transformSlides( { layout: 'translate(-50%, -50%) scale('+ scale +')' } );
				}
			}

			// Select all slides, vertical and horizontal
			var slides = toArray( dom.wrapper.querySelectorAll( SLIDES_SELECTOR ) );

			for( var i = 0, len = slides.length; i < len; i++ ) {
				var slide = slides[ i ];

				// Don't bother updating invisible slides
				if( slide.style.display === 'none' ) {
					continue;
				}

				if( config.center || slide.classList.contains( 'center' ) ) {
					// Vertical stacks are not centred since their section
					// children will be
					if( slide.classList.contains( 'stack' ) ) {
						slide.style.top = 0;
					}
					else {
						slide.style.top = Math.max( ( ( size.height - getAbsoluteHeight( slide ) ) / 2 ) - slidePadding, 0 ) + 'px';
					}
				}
				else {
					slide.style.top = '';
				}

			}

			updateProgress();
			updateParallax();

		}

	}

	/**
	 * Applies layout logic to the contents of all slides in
	 * the presentation.
	 */
	function layoutSlideContents( width, height, padding ) {

		// Handle sizing of elements with the 'stretch' class
		toArray( dom.slides.querySelectorAll( 'section > .stretch' ) ).forEach( function( element ) {

			// Determine how much vertical space we can use
			var remainingHeight = getRemainingHeight( element, height );

			// Consider the aspect ratio of media elements
			if( /(img|video)/gi.test( element.nodeName ) ) {
				var nw = element.naturalWidth || element.videoWidth,
					nh = element.naturalHeight || element.videoHeight;

				var es = Math.min( width / nw, remainingHeight / nh );

				element.style.width = ( nw * es ) + 'px';
				element.style.height = ( nh * es ) + 'px';

			}
			else {
				element.style.width = width + 'px';
				element.style.height = remainingHeight + 'px';
			}

		} );

	}

	/**
	 * Calculates the computed pixel size of our slides. These
	 * values are based on the width and height configuration
	 * options.
	 */
	function getComputedSlideSize( presentationWidth, presentationHeight ) {

		var size = {
			// Slide size
			width: config.width,
			height: config.height,

			// Presentation size
			presentationWidth: presentationWidth || dom.wrapper.offsetWidth,
			presentationHeight: presentationHeight || dom.wrapper.offsetHeight
		};

		// Reduce available space by margin
		size.presentationWidth -= ( size.presentationWidth * config.margin );
		size.presentationHeight -= ( size.presentationHeight * config.margin );

		// Slide width may be a percentage of available width
		if( typeof size.width === 'string' && /%$/.test( size.width ) ) {
			size.width = parseInt( size.width, 10 ) / 100 * size.presentationWidth;
		}

		// Slide height may be a percentage of available height
		if( typeof size.height === 'string' && /%$/.test( size.height ) ) {
			size.height = parseInt( size.height, 10 ) / 100 * size.presentationHeight;
		}

		return size;

	}

	/**
	 * Stores the vertical index of a stack so that the same
	 * vertical slide can be selected when navigating to and
	 * from the stack.
	 *
	 * @param {HTMLElement} stack The vertical stack element
	 * @param {int} v Index to memorize
	 */
	function setPreviousVerticalIndex( stack, v ) {

		if( typeof stack === 'object' && typeof stack.setAttribute === 'function' ) {
			stack.setAttribute( 'data-previous-indexv', v || 0 );
		}

	}

	/**
	 * Retrieves the vertical index which was stored using
	 * #setPreviousVerticalIndex() or 0 if no previous index
	 * exists.
	 *
	 * @param {HTMLElement} stack The vertical stack element
	 */
	function getPreviousVerticalIndex( stack ) {

		if( typeof stack === 'object' && typeof stack.setAttribute === 'function' && stack.classList.contains( 'stack' ) ) {
			// Prefer manually defined start-indexv
			var attributeName = stack.hasAttribute( 'data-start-indexv' ) ? 'data-start-indexv' : 'data-previous-indexv';

			return parseInt( stack.getAttribute( attributeName ) || 0, 10 );
		}

		return 0;

	}

	/**
	 * Displays the overview of slides (quick nav) by scaling
	 * down and arranging all slide elements.
	 */
	function activateOverview() {

		// Only proceed if enabled in config
		if( config.overview && !isOverview() ) {

			overview = true;

			dom.wrapper.classList.add( 'overview' );
			dom.wrapper.classList.remove( 'overview-deactivating' );

			if( features.overviewTransitions ) {
				setTimeout( function() {
					dom.wrapper.classList.add( 'overview-animated' );
				}, 1 );
			}

			// Don't auto-slide while in overview mode
			cancelAutoSlide();

			// Move the backgrounds element into the slide container to
			// that the same scaling is applied
			dom.slides.appendChild( dom.background );

			// Clicking on an overview slide navigates to it
			toArray( dom.wrapper.querySelectorAll( SLIDES_SELECTOR ) ).forEach( function( slide ) {
				if( !slide.classList.contains( 'stack' ) ) {
					slide.addEventListener( 'click', onOverviewSlideClicked, true );
				}
			} );

			updateSlidesVisibility();
			layoutOverview();
			updateOverview();

			layout();

			// Notify observers of the overview showing
			dispatchEvent( 'overviewshown', {
				'indexh': indexh,
				'indexv': indexv,
				'currentSlide': currentSlide
			} );

		}

	}

	/**
	 * Uses CSS transforms to position all slides in a grid for
	 * display inside of the overview mode.
	 */
	function layoutOverview() {

		var margin = 70;
		var slideWidth = config.width + margin,
			slideHeight = config.height + margin;

		// Reverse in RTL mode
		if( config.rtl ) {
			slideWidth = -slideWidth;
		}

		// Layout slides
		toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) ).forEach( function( hslide, h ) {
			hslide.setAttribute( 'data-index-h', h );
			transformElement( hslide, 'translate3d(' + ( h * slideWidth ) + 'px, 0, 0)' );

			if( hslide.classList.contains( 'stack' ) ) {

				toArray( hslide.querySelectorAll( 'section' ) ).forEach( function( vslide, v ) {
					vslide.setAttribute( 'data-index-h', h );
					vslide.setAttribute( 'data-index-v', v );

					transformElement( vslide, 'translate3d(0, ' + ( v * slideHeight ) + 'px, 0)' );
				} );

			}
		} );

		// Layout slide backgrounds
		toArray( dom.background.childNodes ).forEach( function( hbackground, h ) {
			transformElement( hbackground, 'translate3d(' + ( h * slideWidth ) + 'px, 0, 0)' );

			toArray( hbackground.querySelectorAll( '.slide-background' ) ).forEach( function( vbackground, v ) {
				transformElement( vbackground, 'translate3d(0, ' + ( v * slideHeight ) + 'px, 0)' );
			} );
		} );

	}

	/**
	 * Moves the overview viewport to the current slides.
	 * Called each time the current slide changes.
	 */
	function updateOverview() {

		var margin = 70;
		var slideWidth = config.width + margin,
			slideHeight = config.height + margin;

		// Reverse in RTL mode
		if( config.rtl ) {
			slideWidth = -slideWidth;
		}

		transformSlides( {
			overview: [
				'translateX('+ ( -indexh * slideWidth ) +'px)',
				'translateY('+ ( -indexv * slideHeight ) +'px)',
				'translateZ('+ ( window.innerWidth < 400 ? -1000 : -2500 ) +'px)'
			].join( ' ' )
		} );

	}

	/**
	 * Exits the slide overview and enters the currently
	 * active slide.
	 */
	function deactivateOverview() {

		// Only proceed if enabled in config
		if( config.overview ) {

			overview = false;

			dom.wrapper.classList.remove( 'overview' );
			dom.wrapper.classList.remove( 'overview-animated' );

			// Temporarily add a class so that transitions can do different things
			// depending on whether they are exiting/entering overview, or just
			// moving from slide to slide
			dom.wrapper.classList.add( 'overview-deactivating' );

			setTimeout( function () {
				dom.wrapper.classList.remove( 'overview-deactivating' );
			}, 1 );

			// Move the background element back out
			dom.wrapper.appendChild( dom.background );

			// Clean up changes made to slides
			toArray( dom.wrapper.querySelectorAll( SLIDES_SELECTOR ) ).forEach( function( slide ) {
				transformElement( slide, '' );

				slide.removeEventListener( 'click', onOverviewSlideClicked, true );
			} );

			// Clean up changes made to backgrounds
			toArray( dom.background.querySelectorAll( '.slide-background' ) ).forEach( function( background ) {
				transformElement( background, '' );
			} );

			transformSlides( { overview: '' } );

			slide( indexh, indexv );

			layout();

			cueAutoSlide();

			// Notify observers of the overview hiding
			dispatchEvent( 'overviewhidden', {
				'indexh': indexh,
				'indexv': indexv,
				'currentSlide': currentSlide
			} );

		}
	}

	/**
	 * Toggles the slide overview mode on and off.
	 *
	 * @param {Boolean} override Optional flag which overrides the
	 * toggle logic and forcibly sets the desired state. True means
	 * overview is open, false means it's closed.
	 */
	function toggleOverview( override ) {

		if( typeof override === 'boolean' ) {
			override ? activateOverview() : deactivateOverview();
		}
		else {
			isOverview() ? deactivateOverview() : activateOverview();
		}

	}

	/**
	 * Checks if the overview is currently active.
	 *
	 * @return {Boolean} true if the overview is active,
	 * false otherwise
	 */
	function isOverview() {

		return overview;

	}

	/**
	 * Checks if the current or specified slide is vertical
	 * (nested within another slide).
	 *
	 * @param {HTMLElement} slide [optional] The slide to check
	 * orientation of
	 */
	function isVerticalSlide( slide ) {

		// Prefer slide argument, otherwise use current slide
		slide = slide ? slide : currentSlide;

		return slide && slide.parentNode && !!slide.parentNode.nodeName.match( /section/i );

	}

	/**
	 * Handling the fullscreen functionality via the fullscreen API
	 *
	 * @see http://fullscreen.spec.whatwg.org/
	 * @see https://developer.mozilla.org/en-US/docs/DOM/Using_fullscreen_mode
	 */
	function enterFullscreen() {

		var element = document.body;

		// Check which implementation is available
		var requestMethod = element.requestFullScreen ||
							element.webkitRequestFullscreen ||
							element.webkitRequestFullScreen ||
							element.mozRequestFullScreen ||
							element.msRequestFullscreen;

		if( requestMethod ) {
			requestMethod.apply( element );
		}

	}

	/**
	 * Enters the paused mode which fades everything on screen to
	 * black.
	 */
	function pause() {

		if( config.pause ) {
			var wasPaused = dom.wrapper.classList.contains( 'paused' );

			cancelAutoSlide();
			dom.wrapper.classList.add( 'paused' );

			if( wasPaused === false ) {
				dispatchEvent( 'paused' );
			}
		}

	}

	/**
	 * Exits from the paused mode.
	 */
	function resume() {

		var wasPaused = dom.wrapper.classList.contains( 'paused' );
		dom.wrapper.classList.remove( 'paused' );

		cueAutoSlide();

		if( wasPaused ) {
			dispatchEvent( 'resumed' );
		}

	}

	/**
	 * Toggles the paused mode on and off.
	 */
	function togglePause( override ) {

		if( typeof override === 'boolean' ) {
			override ? pause() : resume();
		}
		else {
			isPaused() ? resume() : pause();
		}

	}

	/**
	 * Checks if we are currently in the paused mode.
	 */
	function isPaused() {

		return dom.wrapper.classList.contains( 'paused' );

	}

	/**
	 * Toggles the auto slide mode on and off.
	 *
	 * @param {Boolean} override Optional flag which sets the desired state.
	 * True means autoplay starts, false means it stops.
	 */

	function toggleAutoSlide( override ) {

		if( typeof override === 'boolean' ) {
			override ? resumeAutoSlide() : pauseAutoSlide();
		}

		else {
			autoSlidePaused ? resumeAutoSlide() : pauseAutoSlide();
		}

	}

	/**
	 * Checks if the auto slide mode is currently on.
	 */
	function isAutoSliding() {

		return !!( autoSlide && !autoSlidePaused );

	}

	/**
	 * Steps from the current point in the presentation to the
	 * slide which matches the specified horizontal and vertical
	 * indices.
	 *
	 * @param {int} h Horizontal index of the target slide
	 * @param {int} v Vertical index of the target slide
	 * @param {int} f Optional index of a fragment within the
	 * target slide to activate
	 * @param {int} o Optional origin for use in multimaster environments
	 */
	function slide( h, v, f, o ) {

		// Remember where we were at before
		previousSlide = currentSlide;

		// Query all horizontal slides in the deck
		var horizontalSlides = dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR );

		// If no vertical index is specified and the upcoming slide is a
		// stack, resume at its previous vertical index
		if( v === undefined && !isOverview() ) {
			v = getPreviousVerticalIndex( horizontalSlides[ h ] );
		}

		// If we were on a vertical stack, remember what vertical index
		// it was on so we can resume at the same position when returning
		if( previousSlide && previousSlide.parentNode && previousSlide.parentNode.classList.contains( 'stack' ) ) {
			setPreviousVerticalIndex( previousSlide.parentNode, indexv );
		}

		// Remember the state before this slide
		var stateBefore = state.concat();

		// Reset the state array
		state.length = 0;

		var indexhBefore = indexh || 0,
			indexvBefore = indexv || 0;

		// Activate and transition to the new slide
		indexh = updateSlides( HORIZONTAL_SLIDES_SELECTOR, h === undefined ? indexh : h );
		indexv = updateSlides( VERTICAL_SLIDES_SELECTOR, v === undefined ? indexv : v );

		// Update the visibility of slides now that the indices have changed
		updateSlidesVisibility();

		layout();

		// Apply the new state
		stateLoop: for( var i = 0, len = state.length; i < len; i++ ) {
			// Check if this state existed on the previous slide. If it
			// did, we will avoid adding it repeatedly
			for( var j = 0; j < stateBefore.length; j++ ) {
				if( stateBefore[j] === state[i] ) {
					stateBefore.splice( j, 1 );
					continue stateLoop;
				}
			}

			document.documentElement.classList.add( state[i] );

			// Dispatch custom event matching the state's name
			dispatchEvent( state[i] );
		}

		// Clean up the remains of the previous state
		while( stateBefore.length ) {
			document.documentElement.classList.remove( stateBefore.pop() );
		}

		// Update the overview if it's currently active
		if( isOverview() ) {
			updateOverview();
		}

		// Find the current horizontal slide and any possible vertical slides
		// within it
		var currentHorizontalSlide = horizontalSlides[ indexh ],
			currentVerticalSlides = currentHorizontalSlide.querySelectorAll( 'section' );

		// Store references to the previous and current slides
		currentSlide = currentVerticalSlides[ indexv ] || currentHorizontalSlide;

		// Show fragment, if specified
		if( typeof f !== 'undefined' ) {
			navigateFragment( f );
		}

		// Dispatch an event if the slide changed
		var slideChanged = ( indexh !== indexhBefore || indexv !== indexvBefore );
		if( slideChanged ) {
			dispatchEvent( 'slidechanged', {
				'indexh': indexh,
				'indexv': indexv,
				'previousSlide': previousSlide,
				'currentSlide': currentSlide,
				'origin': o
			} );
		}
		else {
			// Ensure that the previous slide is never the same as the current
			previousSlide = null;
		}

		// Solves an edge case where the previous slide maintains the
		// 'present' class when navigating between adjacent vertical
		// stacks
		if( previousSlide ) {
			previousSlide.classList.remove( 'present' );
			previousSlide.setAttribute( 'aria-hidden', 'true' );

			// Reset all slides upon navigate to home
			// Issue: #285
			if ( dom.wrapper.querySelector( HOME_SLIDE_SELECTOR ).classList.contains( 'present' ) ) {
				// Launch async task
				setTimeout( function () {
					var slides = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR + '.stack') ), i;
					for( i in slides ) {
						if( slides[i] ) {
							// Reset stack
							setPreviousVerticalIndex( slides[i], 0 );
						}
					}
				}, 0 );
			}
		}

		// Handle embedded content
		if( slideChanged || !previousSlide ) {
			stopEmbeddedContent( previousSlide );
			startEmbeddedContent( currentSlide );
		}

		// Announce the current slide contents, for screen readers
		dom.statusDiv.textContent = currentSlide.textContent;

		updateControls();
		updateProgress();
		updateBackground();
		updateParallax();
		updateSlideNumber();

		// Update the URL hash
		writeURL();

		cueAutoSlide();

	}

	/**
	 * Syncs the presentation with the current DOM. Useful
	 * when new slides or control elements are added or when
	 * the configuration has changed.
	 */
	function sync() {

		// Subscribe to input
		removeEventListeners();
		addEventListeners();

		// Force a layout to make sure the current config is accounted for
		layout();

		// Reflect the current autoSlide value
		autoSlide = config.autoSlide;

		// Start auto-sliding if it's enabled
		cueAutoSlide();

		// Re-create the slide backgrounds
		createBackgrounds();

		// Write the current hash to the URL
		writeURL();

		sortAllFragments();

		updateControls();
		updateProgress();
		updateBackground( true );
		updateSlideNumber();
		updateSlidesVisibility();

		formatEmbeddedContent();
		startEmbeddedContent( currentSlide );

		if( isOverview() ) {
			layoutOverview();
		}

	}

	/**
	 * Resets all vertical slides so that only the first
	 * is visible.
	 */
	function resetVerticalSlides() {

		var horizontalSlides = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) );
		horizontalSlides.forEach( function( horizontalSlide ) {

			var verticalSlides = toArray( horizontalSlide.querySelectorAll( 'section' ) );
			verticalSlides.forEach( function( verticalSlide, y ) {

				if( y > 0 ) {
					verticalSlide.classList.remove( 'present' );
					verticalSlide.classList.remove( 'past' );
					verticalSlide.classList.add( 'future' );
					verticalSlide.setAttribute( 'aria-hidden', 'true' );
				}

			} );

		} );

	}

	/**
	 * Sorts and formats all of fragments in the
	 * presentation.
	 */
	function sortAllFragments() {

		var horizontalSlides = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) );
		horizontalSlides.forEach( function( horizontalSlide ) {

			var verticalSlides = toArray( horizontalSlide.querySelectorAll( 'section' ) );
			verticalSlides.forEach( function( verticalSlide, y ) {

				sortFragments( verticalSlide.querySelectorAll( '.fragment' ) );

			} );

			if( verticalSlides.length === 0 ) sortFragments( horizontalSlide.querySelectorAll( '.fragment' ) );

		} );

	}

	/**
	 * Updates one dimension of slides by showing the slide
	 * with the specified index.
	 *
	 * @param {String} selector A CSS selector that will fetch
	 * the group of slides we are working with
	 * @param {Number} index The index of the slide that should be
	 * shown
	 *
	 * @return {Number} The index of the slide that is now shown,
	 * might differ from the passed in index if it was out of
	 * bounds.
	 */
	function updateSlides( selector, index ) {

		// Select all slides and convert the NodeList result to
		// an array
		var slides = toArray( dom.wrapper.querySelectorAll( selector ) ),
			slidesLength = slides.length;

		var printMode = isPrintingPDF();

		if( slidesLength ) {

			// Should the index loop?
			if( config.loop ) {
				index %= slidesLength;

				if( index < 0 ) {
					index = slidesLength + index;
				}
			}

			// Enforce max and minimum index bounds
			index = Math.max( Math.min( index, slidesLength - 1 ), 0 );

			for( var i = 0; i < slidesLength; i++ ) {
				var element = slides[i];

				var reverse = config.rtl && !isVerticalSlide( element );

				element.classList.remove( 'past' );
				element.classList.remove( 'present' );
				element.classList.remove( 'future' );

				// http://www.w3.org/html/wg/drafts/html/master/editing.html#the-hidden-attribute
				element.setAttribute( 'hidden', '' );
				element.setAttribute( 'aria-hidden', 'true' );

				// If this element contains vertical slides
				if( element.querySelector( 'section' ) ) {
					element.classList.add( 'stack' );
				}

				// If we're printing static slides, all slides are "present"
				if( printMode ) {
					element.classList.add( 'present' );
					continue;
				}

				if( i < index ) {
					// Any element previous to index is given the 'past' class
					element.classList.add( reverse ? 'future' : 'past' );

					if( config.fragments ) {
						var pastFragments = toArray( element.querySelectorAll( '.fragment' ) );

						// Show all fragments on prior slides
						while( pastFragments.length ) {
							var pastFragment = pastFragments.pop();
							pastFragment.classList.add( 'visible' );
							pastFragment.classList.remove( 'current-fragment' );
						}
					}
				}
				else if( i > index ) {
					// Any element subsequent to index is given the 'future' class
					element.classList.add( reverse ? 'past' : 'future' );

					if( config.fragments ) {
						var futureFragments = toArray( element.querySelectorAll( '.fragment.visible' ) );

						// No fragments in future slides should be visible ahead of time
						while( futureFragments.length ) {
							var futureFragment = futureFragments.pop();
							futureFragment.classList.remove( 'visible' );
							futureFragment.classList.remove( 'current-fragment' );
						}
					}
				}
			}

			// Mark the current slide as present
			slides[index].classList.add( 'present' );
			slides[index].removeAttribute( 'hidden' );
			slides[index].removeAttribute( 'aria-hidden' );

			// If this slide has a state associated with it, add it
			// onto the current state of the deck
			var slideState = slides[index].getAttribute( 'data-state' );
			if( slideState ) {
				state = state.concat( slideState.split( ' ' ) );
			}

		}
		else {
			// Since there are no slides we can't be anywhere beyond the
			// zeroth index
			index = 0;
		}

		return index;

	}

	/**
	 * Optimization method; hide all slides that are far away
	 * from the present slide.
	 */
	function updateSlidesVisibility() {

		// Select all slides and convert the NodeList result to
		// an array
		var horizontalSlides = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) ),
			horizontalSlidesLength = horizontalSlides.length,
			distanceX,
			distanceY;

		if( horizontalSlidesLength && typeof indexh !== 'undefined' ) {

			// The number of steps away from the present slide that will
			// be visible
			var viewDistance = isOverview() ? 10 : config.viewDistance;

			// Limit view distance on weaker devices
			if( isMobileDevice ) {
				viewDistance = isOverview() ? 6 : 2;
			}

			// All slides need to be visible when exporting to PDF
			if( isPrintingPDF() ) {
				viewDistance = Number.MAX_VALUE;
			}

			for( var x = 0; x < horizontalSlidesLength; x++ ) {
				var horizontalSlide = horizontalSlides[x];

				var verticalSlides = toArray( horizontalSlide.querySelectorAll( 'section' ) ),
					verticalSlidesLength = verticalSlides.length;

				// Determine how far away this slide is from the present
				distanceX = Math.abs( ( indexh || 0 ) - x ) || 0;

				// If the presentation is looped, distance should measure
				// 1 between the first and last slides
				if( config.loop ) {
					distanceX = Math.abs( ( ( indexh || 0 ) - x ) % ( horizontalSlidesLength - viewDistance ) ) || 0;
				}

				// Show the horizontal slide if it's within the view distance
				if( distanceX < viewDistance ) {
					showSlide( horizontalSlide );
				}
				else {
					hideSlide( horizontalSlide );
				}

				if( verticalSlidesLength ) {

					var oy = getPreviousVerticalIndex( horizontalSlide );

					for( var y = 0; y < verticalSlidesLength; y++ ) {
						var verticalSlide = verticalSlides[y];

						distanceY = x === ( indexh || 0 ) ? Math.abs( ( indexv || 0 ) - y ) : Math.abs( y - oy );

						if( distanceX + distanceY < viewDistance ) {
							showSlide( verticalSlide );
						}
						else {
							hideSlide( verticalSlide );
						}
					}

				}
			}

		}

	}

	/**
	 * Updates the progress bar to reflect the current slide.
	 */
	function updateProgress() {

		// Update progress if enabled
		if( config.progress && dom.progressbar ) {

			dom.progressbar.style.width = getProgress() * dom.wrapper.offsetWidth + 'px';

		}

	}

	/**
	 * Updates the slide number div to reflect the current slide.
	 *
	 * Slide number format can be defined as a string using the
	 * following variables:
	 *  h: current slide's horizontal index
	 *  v: current slide's vertical index
	 *  c: current slide index (flattened)
	 *  t: total number of slides (flattened)
	 */
	function updateSlideNumber() {

		// Update slide number if enabled
		if( config.slideNumber && dom.slideNumber) {

			// Default to only showing the current slide number
			var format = 'c';

			// Check if a custom slide number format is available
			if( typeof config.slideNumber === 'string' ) {
				format = config.slideNumber;
			}

			dom.slideNumber.innerHTML = format.replace( /h/g, indexh )
												.replace( /v/g, indexv )
												.replace( /c/g, getSlidePastCount() + 1 )
												.replace( /t/g, getTotalSlides() );
		}

	}

	/**
	 * Updates the state of all control/navigation arrows.
	 */
	function updateControls() {

		var routes = availableRoutes();
		var fragments = availableFragments();

		// Remove the 'enabled' class from all directions
		dom.controlsLeft.concat( dom.controlsRight )
						.concat( dom.controlsUp )
						.concat( dom.controlsDown )
						.concat( dom.controlsPrev )
						.concat( dom.controlsNext ).forEach( function( node ) {
			node.classList.remove( 'enabled' );
			node.classList.remove( 'fragmented' );
		} );

		// Add the 'enabled' class to the available routes
		if( routes.left ) dom.controlsLeft.forEach( function( el ) { el.classList.add( 'enabled' );	} );
		if( routes.right ) dom.controlsRight.forEach( function( el ) { el.classList.add( 'enabled' ); } );
		if( routes.up ) dom.controlsUp.forEach( function( el ) { el.classList.add( 'enabled' );	} );
		if( routes.down ) dom.controlsDown.forEach( function( el ) { el.classList.add( 'enabled' ); } );

		// Prev/next buttons
		if( routes.left || routes.up ) dom.controlsPrev.forEach( function( el ) { el.classList.add( 'enabled' ); } );
		if( routes.right || routes.down ) dom.controlsNext.forEach( function( el ) { el.classList.add( 'enabled' ); } );

		// Highlight fragment directions
		if( currentSlide ) {

			// Always apply fragment decorator to prev/next buttons
			if( fragments.prev ) dom.controlsPrev.forEach( function( el ) { el.classList.add( 'fragmented', 'enabled' ); } );
			if( fragments.next ) dom.controlsNext.forEach( function( el ) { el.classList.add( 'fragmented', 'enabled' ); } );

			// Apply fragment decorators to directional buttons based on
			// what slide axis they are in
			if( isVerticalSlide( currentSlide ) ) {
				if( fragments.prev ) dom.controlsUp.forEach( function( el ) { el.classList.add( 'fragmented', 'enabled' ); } );
				if( fragments.next ) dom.controlsDown.forEach( function( el ) { el.classList.add( 'fragmented', 'enabled' ); } );
			}
			else {
				if( fragments.prev ) dom.controlsLeft.forEach( function( el ) { el.classList.add( 'fragmented', 'enabled' ); } );
				if( fragments.next ) dom.controlsRight.forEach( function( el ) { el.classList.add( 'fragmented', 'enabled' ); } );
			}

		}

	}

	/**
	 * Updates the background elements to reflect the current
	 * slide.
	 *
	 * @param {Boolean} includeAll If true, the backgrounds of
	 * all vertical slides (not just the present) will be updated.
	 */
	function updateBackground( includeAll ) {

		var currentBackground = null;

		// Reverse past/future classes when in RTL mode
		var horizontalPast = config.rtl ? 'future' : 'past',
			horizontalFuture = config.rtl ? 'past' : 'future';

		// Update the classes of all backgrounds to match the
		// states of their slides (past/present/future)
		toArray( dom.background.childNodes ).forEach( function( backgroundh, h ) {

			backgroundh.classList.remove( 'past' );
			backgroundh.classList.remove( 'present' );
			backgroundh.classList.remove( 'future' );

			if( h < indexh ) {
				backgroundh.classList.add( horizontalPast );
			}
			else if ( h > indexh ) {
				backgroundh.classList.add( horizontalFuture );
			}
			else {
				backgroundh.classList.add( 'present' );

				// Store a reference to the current background element
				currentBackground = backgroundh;
			}

			if( includeAll || h === indexh ) {
				toArray( backgroundh.querySelectorAll( '.slide-background' ) ).forEach( function( backgroundv, v ) {

					backgroundv.classList.remove( 'past' );
					backgroundv.classList.remove( 'present' );
					backgroundv.classList.remove( 'future' );

					if( v < indexv ) {
						backgroundv.classList.add( 'past' );
					}
					else if ( v > indexv ) {
						backgroundv.classList.add( 'future' );
					}
					else {
						backgroundv.classList.add( 'present' );

						// Only if this is the present horizontal and vertical slide
						if( h === indexh ) currentBackground = backgroundv;
					}

				} );
			}

		} );

		// Stop any currently playing video background
		if( previousBackground ) {

			var previousVideo = previousBackground.querySelector( 'video' );
			if( previousVideo ) previousVideo.pause();

		}

		if( currentBackground ) {

			// Start video playback
			var currentVideo = currentBackground.querySelector( 'video' );
			if( currentVideo ) {
				currentVideo.currentTime = 0;
				currentVideo.play();
			}

			var backgroundImageURL = currentBackground.style.backgroundImage || '';

			// Restart GIFs (doesn't work in Firefox)
			if( /\.gif/i.test( backgroundImageURL ) ) {
				currentBackground.style.backgroundImage = '';
				window.getComputedStyle( currentBackground ).opacity;
				currentBackground.style.backgroundImage = backgroundImageURL;
			}

			// Don't transition between identical backgrounds. This
			// prevents unwanted flicker.
			var previousBackgroundHash = previousBackground ? previousBackground.getAttribute( 'data-background-hash' ) : null;
			var currentBackgroundHash = currentBackground.getAttribute( 'data-background-hash' );
			if( currentBackgroundHash && currentBackgroundHash === previousBackgroundHash && currentBackground !== previousBackground ) {
				dom.background.classList.add( 'no-transition' );
			}

			previousBackground = currentBackground;

		}

		// If there's a background brightness flag for this slide,
		// bubble it to the .reveal container
		if( currentSlide ) {
			[ 'has-light-background', 'has-dark-background' ].forEach( function( classToBubble ) {
				if( currentSlide.classList.contains( classToBubble ) ) {
					dom.wrapper.classList.add( classToBubble );
				}
				else {
					dom.wrapper.classList.remove( classToBubble );
				}
			} );
		}

		// Allow the first background to apply without transition
		setTimeout( function() {
			dom.background.classList.remove( 'no-transition' );
		}, 1 );

	}

	/**
	 * Updates the position of the parallax background based
	 * on the current slide index.
	 */
	function updateParallax() {

		if( config.parallaxBackgroundImage ) {

			var horizontalSlides = dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ),
				verticalSlides = dom.wrapper.querySelectorAll( VERTICAL_SLIDES_SELECTOR );

			var backgroundSize = dom.background.style.backgroundSize.split( ' ' ),
				backgroundWidth, backgroundHeight;

			if( backgroundSize.length === 1 ) {
				backgroundWidth = backgroundHeight = parseInt( backgroundSize[0], 10 );
			}
			else {
				backgroundWidth = parseInt( backgroundSize[0], 10 );
				backgroundHeight = parseInt( backgroundSize[1], 10 );
			}

			var slideWidth = dom.background.offsetWidth,
				horizontalSlideCount = horizontalSlides.length,
				horizontalOffsetMultiplier,
				horizontalOffset;

			if( typeof config.parallaxBackgroundHorizontal === 'number' ) {
				horizontalOffsetMultiplier = config.parallaxBackgroundHorizontal;
			}
			else {
				horizontalOffsetMultiplier = ( backgroundWidth - slideWidth ) / ( horizontalSlideCount-1 );
			}

			horizontalOffset = horizontalOffsetMultiplier * indexh * -1;

			var slideHeight = dom.background.offsetHeight,
				verticalSlideCount = verticalSlides.length,
				verticalOffsetMultiplier,
				verticalOffset;

			if( typeof config.parallaxBackgroundVertical === 'number' ) {
				verticalOffsetMultiplier = config.parallaxBackgroundVertical;
			}
			else {
				verticalOffsetMultiplier = ( backgroundHeight - slideHeight ) / ( verticalSlideCount-1 );
			}

			verticalOffset = verticalSlideCount > 0 ?  verticalOffsetMultiplier * indexv * 1 : 0;

			dom.background.style.backgroundPosition = horizontalOffset + 'px ' + -verticalOffset + 'px';

		}

	}

	/**
	 * Called when the given slide is within the configured view
	 * distance. Shows the slide element and loads any content
	 * that is set to load lazily (data-src).
	 */
	function showSlide( slide ) {

		// Show the slide element
		slide.style.display = 'block';

		// Media elements with data-src attributes
		toArray( slide.querySelectorAll( 'img[data-src], video[data-src], audio[data-src]' ) ).forEach( function( element ) {
			element.setAttribute( 'src', element.getAttribute( 'data-src' ) );
			element.removeAttribute( 'data-src' );
		} );

		// Media elements with <source> children
		toArray( slide.querySelectorAll( 'video, audio' ) ).forEach( function( media ) {
			var sources = 0;

			toArray( media.querySelectorAll( 'source[data-src]' ) ).forEach( function( source ) {
				source.setAttribute( 'src', source.getAttribute( 'data-src' ) );
				source.removeAttribute( 'data-src' );
				sources += 1;
			} );

			// If we rewrote sources for this video/audio element, we need
			// to manually tell it to load from its new origin
			if( sources > 0 ) {
				media.load();
			}
		} );


		// Show the corresponding background element
		var indices = getIndices( slide );
		var background = getSlideBackground( indices.h, indices.v );
		if( background ) {
			background.style.display = 'block';

			// If the background contains media, load it
			if( background.hasAttribute( 'data-loaded' ) === false ) {
				background.setAttribute( 'data-loaded', 'true' );

				var backgroundImage = slide.getAttribute( 'data-background-image' ),
					backgroundVideo = slide.getAttribute( 'data-background-video' ),
					backgroundVideoLoop = slide.hasAttribute( 'data-background-video-loop' ),
					backgroundIframe = slide.getAttribute( 'data-background-iframe' );

				// Images
				if( backgroundImage ) {
					background.style.backgroundImage = 'url('+ backgroundImage +')';
				}
				// Videos
				else if ( backgroundVideo && !isSpeakerNotes() ) {
					var video = document.createElement( 'video' );

					if( backgroundVideoLoop ) {
						video.setAttribute( 'loop', '' );
					}

					// Support comma separated lists of video sources
					backgroundVideo.split( ',' ).forEach( function( source ) {
						video.innerHTML += '<source src="'+ source +'">';
					} );

					background.appendChild( video );
				}
				// Iframes
				else if( backgroundIframe ) {
					var iframe = document.createElement( 'iframe' );
						iframe.setAttribute( 'src', backgroundIframe );
						iframe.style.width  = '100%';
						iframe.style.height = '100%';
						iframe.style.maxHeight = '100%';
						iframe.style.maxWidth = '100%';

					background.appendChild( iframe );
				}
			}
		}

	}

	/**
	 * Called when the given slide is moved outside of the
	 * configured view distance.
	 */
	function hideSlide( slide ) {

		// Hide the slide element
		slide.style.display = 'none';

		// Hide the corresponding background element
		var indices = getIndices( slide );
		var background = getSlideBackground( indices.h, indices.v );
		if( background ) {
			background.style.display = 'none';
		}

	}

	/**
	 * Determine what available routes there are for navigation.
	 *
	 * @return {Object} containing four booleans: left/right/up/down
	 */
	function availableRoutes() {

		var horizontalSlides = dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ),
			verticalSlides = dom.wrapper.querySelectorAll( VERTICAL_SLIDES_SELECTOR );

		var routes = {
			left: indexh > 0 || config.loop,
			right: indexh < horizontalSlides.length - 1 || config.loop,
			up: indexv > 0,
			down: indexv < verticalSlides.length - 1
		};

		// reverse horizontal controls for rtl
		if( config.rtl ) {
			var left = routes.left;
			routes.left = routes.right;
			routes.right = left;
		}

		return routes;

	}

	/**
	 * Returns an object describing the available fragment
	 * directions.
	 *
	 * @return {Object} two boolean properties: prev/next
	 */
	function availableFragments() {

		if( currentSlide && config.fragments ) {
			var fragments = currentSlide.querySelectorAll( '.fragment' );
			var hiddenFragments = currentSlide.querySelectorAll( '.fragment:not(.visible)' );

			return {
				prev: fragments.length - hiddenFragments.length > 0,
				next: !!hiddenFragments.length
			};
		}
		else {
			return { prev: false, next: false };
		}

	}

	/**
	 * Enforces origin-specific format rules for embedded media.
	 */
	function formatEmbeddedContent() {

		var _appendParamToIframeSource = function( sourceAttribute, sourceURL, param ) {
			toArray( dom.slides.querySelectorAll( 'iframe['+ sourceAttribute +'*="'+ sourceURL +'"]' ) ).forEach( function( el ) {
				var src = el.getAttribute( sourceAttribute );
				if( src && src.indexOf( param ) === -1 ) {
					el.setAttribute( sourceAttribute, src + ( !/\?/.test( src ) ? '?' : '&' ) + param );
				}
			});
		};

		// YouTube frames must include "?enablejsapi=1"
		_appendParamToIframeSource( 'src', 'youtube.com/embed/', 'enablejsapi=1' );
		_appendParamToIframeSource( 'data-src', 'youtube.com/embed/', 'enablejsapi=1' );

		// Vimeo frames must include "?api=1"
		_appendParamToIframeSource( 'src', 'player.vimeo.com/', 'api=1' );
		_appendParamToIframeSource( 'data-src', 'player.vimeo.com/', 'api=1' );

	}

	/**
	 * Start playback of any embedded content inside of
	 * the targeted slide.
	 */
	function startEmbeddedContent( slide ) {

		if( slide && !isSpeakerNotes() ) {
			// Restart GIFs
			toArray( slide.querySelectorAll( 'img[src$=".gif"]' ) ).forEach( function( el ) {
				// Setting the same unchanged source like this was confirmed
				// to work in Chrome, FF & Safari
				el.setAttribute( 'src', el.getAttribute( 'src' ) );
			} );

			// HTML5 media elements
			toArray( slide.querySelectorAll( 'video, audio' ) ).forEach( function( el ) {
				if( el.hasAttribute( 'data-autoplay' ) && typeof el.play === 'function' ) {
					el.play();
				}
			} );

			// Normal iframes
			toArray( slide.querySelectorAll( 'iframe[src]' ) ).forEach( function( el ) {
				startEmbeddedIframe( { target: el } );
			} );

			// Lazy loading iframes
			toArray( slide.querySelectorAll( 'iframe[data-src]' ) ).forEach( function( el ) {
				if( el.getAttribute( 'src' ) !== el.getAttribute( 'data-src' ) ) {
					el.removeEventListener( 'load', startEmbeddedIframe ); // remove first to avoid dupes
					el.addEventListener( 'load', startEmbeddedIframe );
					el.setAttribute( 'src', el.getAttribute( 'data-src' ) );
				}
			} );
		}

	}

	/**
	 * "Starts" the content of an embedded iframe using the
	 * postmessage API.
	 */
	function startEmbeddedIframe( event ) {

		var iframe = event.target;

		// YouTube postMessage API
		if( /youtube\.com\/embed\//.test( iframe.getAttribute( 'src' ) ) && iframe.hasAttribute( 'data-autoplay' ) ) {
			iframe.contentWindow.postMessage( '{"event":"command","func":"playVideo","args":""}', '*' );
		}
		// Vimeo postMessage API
		else if( /player\.vimeo\.com\//.test( iframe.getAttribute( 'src' ) ) && iframe.hasAttribute( 'data-autoplay' ) ) {
			iframe.contentWindow.postMessage( '{"method":"play"}', '*' );
		}
		// Generic postMessage API
		else {
			iframe.contentWindow.postMessage( 'slide:start', '*' );
		}

	}

	/**
	 * Stop playback of any embedded content inside of
	 * the targeted slide.
	 */
	function stopEmbeddedContent( slide ) {

		if( slide && slide.parentNode ) {
			// HTML5 media elements
			toArray( slide.querySelectorAll( 'video, audio' ) ).forEach( function( el ) {
				if( !el.hasAttribute( 'data-ignore' ) && typeof el.pause === 'function' ) {
					el.pause();
				}
			} );

			// Generic postMessage API for non-lazy loaded iframes
			toArray( slide.querySelectorAll( 'iframe' ) ).forEach( function( el ) {
				el.contentWindow.postMessage( 'slide:stop', '*' );
				el.removeEventListener( 'load', startEmbeddedIframe );
			});

			// YouTube postMessage API
			toArray( slide.querySelectorAll( 'iframe[src*="youtube.com/embed/"]' ) ).forEach( function( el ) {
				if( !el.hasAttribute( 'data-ignore' ) && typeof el.contentWindow.postMessage === 'function' ) {
					el.contentWindow.postMessage( '{"event":"command","func":"pauseVideo","args":""}', '*' );
				}
			});

			// Vimeo postMessage API
			toArray( slide.querySelectorAll( 'iframe[src*="player.vimeo.com/"]' ) ).forEach( function( el ) {
				if( !el.hasAttribute( 'data-ignore' ) && typeof el.contentWindow.postMessage === 'function' ) {
					el.contentWindow.postMessage( '{"method":"pause"}', '*' );
				}
			});

			// Lazy loading iframes
			toArray( slide.querySelectorAll( 'iframe[data-src]' ) ).forEach( function( el ) {
				// Only removing the src doesn't actually unload the frame
				// in all browsers (Firefox) so we set it to blank first
				el.setAttribute( 'src', 'about:blank' );
				el.removeAttribute( 'src' );
			} );
		}

	}

	/**
	 * Returns the number of past slides. This can be used as a global
	 * flattened index for slides.
	 */
	function getSlidePastCount() {

		var horizontalSlides = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) );

		// The number of past slides
		var pastCount = 0;

		// Step through all slides and count the past ones
		mainLoop: for( var i = 0; i < horizontalSlides.length; i++ ) {

			var horizontalSlide = horizontalSlides[i];
			var verticalSlides = toArray( horizontalSlide.querySelectorAll( 'section' ) );

			for( var j = 0; j < verticalSlides.length; j++ ) {

				// Stop as soon as we arrive at the present
				if( verticalSlides[j].classList.contains( 'present' ) ) {
					break mainLoop;
				}

				pastCount++;

			}

			// Stop as soon as we arrive at the present
			if( horizontalSlide.classList.contains( 'present' ) ) {
				break;
			}

			// Don't count the wrapping section for vertical slides
			if( horizontalSlide.classList.contains( 'stack' ) === false ) {
				pastCount++;
			}

		}

		return pastCount;

	}

	/**
	 * Returns a value ranging from 0-1 that represents
	 * how far into the presentation we have navigated.
	 */
	function getProgress() {

		// The number of past and total slides
		var totalCount = getTotalSlides();
		var pastCount = getSlidePastCount();

		if( currentSlide ) {

			var allFragments = currentSlide.querySelectorAll( '.fragment' );

			// If there are fragments in the current slide those should be
			// accounted for in the progress.
			if( allFragments.length > 0 ) {
				var visibleFragments = currentSlide.querySelectorAll( '.fragment.visible' );

				// This value represents how big a portion of the slide progress
				// that is made up by its fragments (0-1)
				var fragmentWeight = 0.9;

				// Add fragment progress to the past slide count
				pastCount += ( visibleFragments.length / allFragments.length ) * fragmentWeight;
			}

		}

		return pastCount / ( totalCount - 1 );

	}

	/**
	 * Checks if this presentation is running inside of the
	 * speaker notes window.
	 */
	function isSpeakerNotes() {

		return !!window.location.search.match( /receiver/gi );

	}

	/**
	 * Reads the current URL (hash) and navigates accordingly.
	 */
	function readURL() {

		var hash = window.location.hash;

		// Attempt to parse the hash as either an index or name
		var bits = hash.slice( 2 ).split( '/' ),
			name = hash.replace( /#|\//gi, '' );

		// If the first bit is invalid and there is a name we can
		// assume that this is a named link
		if( isNaN( parseInt( bits[0], 10 ) ) && name.length ) {
			var element;

			// Ensure the named link is a valid HTML ID attribute
			if( /^[a-zA-Z][\w:.-]*$/.test( name ) ) {
				// Find the slide with the specified ID
				element = document.getElementById( name );
			}

			if( element ) {
				// Find the position of the named slide and navigate to it
				var indices = Reveal.getIndices( element );
				slide( indices.h, indices.v );
			}
			// If the slide doesn't exist, navigate to the current slide
			else {
				slide( indexh || 0, indexv || 0 );
			}
		}
		else {
			// Read the index components of the hash
			var h = parseInt( bits[0], 10 ) || 0,
				v = parseInt( bits[1], 10 ) || 0;

			if( h !== indexh || v !== indexv ) {
				slide( h, v );
			}
		}

	}

	/**
	 * Updates the page URL (hash) to reflect the current
	 * state.
	 *
	 * @param {Number} delay The time in ms to wait before
	 * writing the hash
	 */
	function writeURL( delay ) {

		if( config.history ) {

			// Make sure there's never more than one timeout running
			clearTimeout( writeURLTimeout );

			// If a delay is specified, timeout this call
			if( typeof delay === 'number' ) {
				writeURLTimeout = setTimeout( writeURL, delay );
			}
			else if( currentSlide ) {
				var url = '/';

				// Attempt to create a named link based on the slide's ID
				var id = currentSlide.getAttribute( 'id' );
				if( id ) {
					id = id.toLowerCase();
					id = id.replace( /[^a-zA-Z0-9\-\_\:\.]/g, '' );
				}

				// If the current slide has an ID, use that as a named link
				if( typeof id === 'string' && id.length ) {
					url = '/' + id;
				}
				// Otherwise use the /h/v index
				else {
					if( indexh > 0 || indexv > 0 ) url += indexh;
					if( indexv > 0 ) url += '/' + indexv;
				}

				window.location.hash = url;
			}
		}

	}

	/**
	 * Retrieves the h/v location of the current, or specified,
	 * slide.
	 *
	 * @param {HTMLElement} slide If specified, the returned
	 * index will be for this slide rather than the currently
	 * active one
	 *
	 * @return {Object} { h: <int>, v: <int>, f: <int> }
	 */
	function getIndices( slide ) {

		// By default, return the current indices
		var h = indexh,
			v = indexv,
			f;

		// If a slide is specified, return the indices of that slide
		if( slide ) {
			var isVertical = isVerticalSlide( slide );
			var slideh = isVertical ? slide.parentNode : slide;

			// Select all horizontal slides
			var horizontalSlides = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) );

			// Now that we know which the horizontal slide is, get its index
			h = Math.max( horizontalSlides.indexOf( slideh ), 0 );

			// Assume we're not vertical
			v = undefined;

			// If this is a vertical slide, grab the vertical index
			if( isVertical ) {
				v = Math.max( toArray( slide.parentNode.querySelectorAll( 'section' ) ).indexOf( slide ), 0 );
			}
		}

		if( !slide && currentSlide ) {
			var hasFragments = currentSlide.querySelectorAll( '.fragment' ).length > 0;
			if( hasFragments ) {
				var currentFragment = currentSlide.querySelector( '.current-fragment' );
				if( currentFragment && currentFragment.hasAttribute( 'data-fragment-index' ) ) {
					f = parseInt( currentFragment.getAttribute( 'data-fragment-index' ), 10 );
				}
				else {
					f = currentSlide.querySelectorAll( '.fragment.visible' ).length - 1;
				}
			}
		}

		return { h: h, v: v, f: f };

	}

	/**
	 * Retrieves the total number of slides in this presentation.
	 */
	function getTotalSlides() {

		return dom.wrapper.querySelectorAll( SLIDES_SELECTOR + ':not(.stack)' ).length;

	}

	/**
	 * Returns the slide element matching the specified index.
	 */
	function getSlide( x, y ) {

		var horizontalSlide = dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR )[ x ];
		var verticalSlides = horizontalSlide && horizontalSlide.querySelectorAll( 'section' );

		if( verticalSlides && verticalSlides.length && typeof y === 'number' ) {
			return verticalSlides ? verticalSlides[ y ] : undefined;
		}

		return horizontalSlide;

	}

	/**
	 * Returns the background element for the given slide.
	 * All slides, even the ones with no background properties
	 * defined, have a background element so as long as the
	 * index is valid an element will be returned.
	 */
	function getSlideBackground( x, y ) {

		// When printing to PDF the slide backgrounds are nested
		// inside of the slides
		if( isPrintingPDF() ) {
			var slide = getSlide( x, y );
			if( slide ) {
				var background = slide.querySelector( '.slide-background' );
				if( background && background.parentNode === slide ) {
					return background;
				}
			}

			return undefined;
		}

		var horizontalBackground = dom.wrapper.querySelectorAll( '.backgrounds>.slide-background' )[ x ];
		var verticalBackgrounds = horizontalBackground && horizontalBackground.querySelectorAll( '.slide-background' );

		if( verticalBackgrounds && verticalBackgrounds.length && typeof y === 'number' ) {
			return verticalBackgrounds ? verticalBackgrounds[ y ] : undefined;
		}

		return horizontalBackground;

	}

	/**
	 * Retrieves the current state of the presentation as
	 * an object. This state can then be restored at any
	 * time.
	 */
	function getState() {

		var indices = getIndices();

		return {
			indexh: indices.h,
			indexv: indices.v,
			indexf: indices.f,
			paused: isPaused(),
			overview: isOverview()
		};

	}

	/**
	 * Restores the presentation to the given state.
	 *
	 * @param {Object} state As generated by getState()
	 */
	function setState( state ) {

		if( typeof state === 'object' ) {
			slide( deserialize( state.indexh ), deserialize( state.indexv ), deserialize( state.indexf ) );

			var pausedFlag = deserialize( state.paused ),
				overviewFlag = deserialize( state.overview );

			if( typeof pausedFlag === 'boolean' && pausedFlag !== isPaused() ) {
				togglePause( pausedFlag );
			}

			if( typeof overviewFlag === 'boolean' && overviewFlag !== isOverview() ) {
				toggleOverview( overviewFlag );
			}
		}

	}

	/**
	 * Return a sorted fragments list, ordered by an increasing
	 * "data-fragment-index" attribute.
	 *
	 * Fragments will be revealed in the order that they are returned by
	 * this function, so you can use the index attributes to control the
	 * order of fragment appearance.
	 *
	 * To maintain a sensible default fragment order, fragments are presumed
	 * to be passed in document order. This function adds a "fragment-index"
	 * attribute to each node if such an attribute is not already present,
	 * and sets that attribute to an integer value which is the position of
	 * the fragment within the fragments list.
	 */
	function sortFragments( fragments ) {

		fragments = toArray( fragments );

		var ordered = [],
			unordered = [],
			sorted = [];

		// Group ordered and unordered elements
		fragments.forEach( function( fragment, i ) {
			if( fragment.hasAttribute( 'data-fragment-index' ) ) {
				var index = parseInt( fragment.getAttribute( 'data-fragment-index' ), 10 );

				if( !ordered[index] ) {
					ordered[index] = [];
				}

				ordered[index].push( fragment );
			}
			else {
				unordered.push( [ fragment ] );
			}
		} );

		// Append fragments without explicit indices in their
		// DOM order
		ordered = ordered.concat( unordered );

		// Manually count the index up per group to ensure there
		// are no gaps
		var index = 0;

		// Push all fragments in their sorted order to an array,
		// this flattens the groups
		ordered.forEach( function( group ) {
			group.forEach( function( fragment ) {
				sorted.push( fragment );
				fragment.setAttribute( 'data-fragment-index', index );
			} );

			index ++;
		} );

		return sorted;

	}

	/**
	 * Navigate to the specified slide fragment.
	 *
	 * @param {Number} index The index of the fragment that
	 * should be shown, -1 means all are invisible
	 * @param {Number} offset Integer offset to apply to the
	 * fragment index
	 *
	 * @return {Boolean} true if a change was made in any
	 * fragments visibility as part of this call
	 */
	function navigateFragment( index, offset ) {

		if( currentSlide && config.fragments ) {

			var fragments = sortFragments( currentSlide.querySelectorAll( '.fragment' ) );
			if( fragments.length ) {

				// If no index is specified, find the current
				if( typeof index !== 'number' ) {
					var lastVisibleFragment = sortFragments( currentSlide.querySelectorAll( '.fragment.visible' ) ).pop();

					if( lastVisibleFragment ) {
						index = parseInt( lastVisibleFragment.getAttribute( 'data-fragment-index' ) || 0, 10 );
					}
					else {
						index = -1;
					}
				}

				// If an offset is specified, apply it to the index
				if( typeof offset === 'number' ) {
					index += offset;
				}

				var fragmentsShown = [],
					fragmentsHidden = [];

				toArray( fragments ).forEach( function( element, i ) {

					if( element.hasAttribute( 'data-fragment-index' ) ) {
						i = parseInt( element.getAttribute( 'data-fragment-index' ), 10 );
					}

					// Visible fragments
					if( i <= index ) {
						if( !element.classList.contains( 'visible' ) ) fragmentsShown.push( element );
						element.classList.add( 'visible' );
						element.classList.remove( 'current-fragment' );

						// Announce the fragments one by one to the Screen Reader
						dom.statusDiv.textContent = element.textContent;

						if( i === index ) {
							element.classList.add( 'current-fragment' );
						}
					}
					// Hidden fragments
					else {
						if( element.classList.contains( 'visible' ) ) fragmentsHidden.push( element );
						element.classList.remove( 'visible' );
						element.classList.remove( 'current-fragment' );
					}


				} );

				if( fragmentsHidden.length ) {
					dispatchEvent( 'fragmenthidden', { fragment: fragmentsHidden[0], fragments: fragmentsHidden } );
				}

				if( fragmentsShown.length ) {
					dispatchEvent( 'fragmentshown', { fragment: fragmentsShown[0], fragments: fragmentsShown } );
				}

				updateControls();
				updateProgress();

				return !!( fragmentsShown.length || fragmentsHidden.length );

			}

		}

		return false;

	}

	/**
	 * Navigate to the next slide fragment.
	 *
	 * @return {Boolean} true if there was a next fragment,
	 * false otherwise
	 */
	function nextFragment() {

		return navigateFragment( null, 1 );

	}

	/**
	 * Navigate to the previous slide fragment.
	 *
	 * @return {Boolean} true if there was a previous fragment,
	 * false otherwise
	 */
	function previousFragment() {

		return navigateFragment( null, -1 );

	}

	/**
	 * Cues a new automated slide if enabled in the config.
	 */
	function cueAutoSlide() {

		cancelAutoSlide();

		if( currentSlide ) {

			var currentFragment = currentSlide.querySelector( '.current-fragment' );

			var fragmentAutoSlide = currentFragment ? currentFragment.getAttribute( 'data-autoslide' ) : null;
			var parentAutoSlide = currentSlide.parentNode ? currentSlide.parentNode.getAttribute( 'data-autoslide' ) : null;
			var slideAutoSlide = currentSlide.getAttribute( 'data-autoslide' );

			// Pick value in the following priority order:
			// 1. Current fragment's data-autoslide
			// 2. Current slide's data-autoslide
			// 3. Parent slide's data-autoslide
			// 4. Global autoSlide setting
			if( fragmentAutoSlide ) {
				autoSlide = parseInt( fragmentAutoSlide, 10 );
			}
			else if( slideAutoSlide ) {
				autoSlide = parseInt( slideAutoSlide, 10 );
			}
			else if( parentAutoSlide ) {
				autoSlide = parseInt( parentAutoSlide, 10 );
			}
			else {
				autoSlide = config.autoSlide;
			}

			// If there are media elements with data-autoplay,
			// automatically set the autoSlide duration to the
			// length of that media. Not applicable if the slide
			// is divided up into fragments.
			if( currentSlide.querySelectorAll( '.fragment' ).length === 0 ) {
				toArray( currentSlide.querySelectorAll( 'video, audio' ) ).forEach( function( el ) {
					if( el.hasAttribute( 'data-autoplay' ) ) {
						if( autoSlide && el.duration * 1000 > autoSlide ) {
							autoSlide = ( el.duration * 1000 ) + 1000;
						}
					}
				} );
			}

			// Cue the next auto-slide if:
			// - There is an autoSlide value
			// - Auto-sliding isn't paused by the user
			// - The presentation isn't paused
			// - The overview isn't active
			// - The presentation isn't over
			if( autoSlide && !autoSlidePaused && !isPaused() && !isOverview() && ( !Reveal.isLastSlide() || availableFragments().next || config.loop === true ) ) {
				autoSlideTimeout = setTimeout( navigateNext, autoSlide );
				autoSlideStartTime = Date.now();
			}

			if( autoSlidePlayer ) {
				autoSlidePlayer.setPlaying( autoSlideTimeout !== -1 );
			}

		}

	}

	/**
	 * Cancels any ongoing request to auto-slide.
	 */
	function cancelAutoSlide() {

		clearTimeout( autoSlideTimeout );
		autoSlideTimeout = -1;

	}

	function pauseAutoSlide() {

		if( autoSlide && !autoSlidePaused ) {
			autoSlidePaused = true;
			dispatchEvent( 'autoslidepaused' );
			clearTimeout( autoSlideTimeout );

			if( autoSlidePlayer ) {
				autoSlidePlayer.setPlaying( false );
			}
		}

	}

	function resumeAutoSlide() {

		if( autoSlide && autoSlidePaused ) {
			autoSlidePaused = false;
			dispatchEvent( 'autoslideresumed' );
			cueAutoSlide();
		}

	}

	function navigateLeft() {

		// Reverse for RTL
		if( config.rtl ) {
			if( ( isOverview() || nextFragment() === false ) && availableRoutes().left ) {
				slide( indexh + 1 );
			}
		}
		// Normal navigation
		else if( ( isOverview() || previousFragment() === false ) && availableRoutes().left ) {
			slide( indexh - 1 );
		}

	}

	function navigateRight() {

		// Reverse for RTL
		if( config.rtl ) {
			if( ( isOverview() || previousFragment() === false ) && availableRoutes().right ) {
				slide( indexh - 1 );
			}
		}
		// Normal navigation
		else if( ( isOverview() || nextFragment() === false ) && availableRoutes().right ) {
			slide( indexh + 1 );
		}

	}

	function navigateUp() {

		// Prioritize hiding fragments
		if( ( isOverview() || previousFragment() === false ) && availableRoutes().up ) {
			slide( indexh, indexv - 1 );
		}

	}

	function navigateDown() {

		// Prioritize revealing fragments
		if( ( isOverview() || nextFragment() === false ) && availableRoutes().down ) {
			slide( indexh, indexv + 1 );
		}

	}

	/**
	 * Navigates backwards, prioritized in the following order:
	 * 1) Previous fragment
	 * 2) Previous vertical slide
	 * 3) Previous horizontal slide
	 */
	function navigatePrev() {

		// Prioritize revealing fragments
		if( previousFragment() === false ) {
			if( availableRoutes().up ) {
				navigateUp();
			}
			else {
				// Fetch the previous horizontal slide, if there is one
				var previousSlide;

				if( config.rtl ) {
					previousSlide = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR + '.future' ) ).pop();
				}
				else {
					previousSlide = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR + '.past' ) ).pop();
				}

				if( previousSlide ) {
					var v = ( previousSlide.querySelectorAll( 'section' ).length - 1 ) || undefined;
					var h = indexh - 1;
					slide( h, v );
				}
			}
		}

	}

	/**
	 * The reverse of #navigatePrev().
	 */
	function navigateNext() {

		// Prioritize revealing fragments
		if( nextFragment() === false ) {
			if( availableRoutes().down ) {
				navigateDown();
			}
			else if( config.rtl ) {
				navigateLeft();
			}
			else {
				navigateRight();
			}
		}

		// If auto-sliding is enabled we need to cue up
		// another timeout
		cueAutoSlide();

	}


	// --------------------------------------------------------------------//
	// ----------------------------- EVENTS -------------------------------//
	// --------------------------------------------------------------------//

	/**
	 * Called by all event handlers that are based on user
	 * input.
	 */
	function onUserInput( event ) {

		if( config.autoSlideStoppable ) {
			pauseAutoSlide();
		}

	}

	/**
	 * Handler for the document level 'keypress' event.
	 */
	function onDocumentKeyPress( event ) {

		// Check if the pressed key is question mark
		if( event.shiftKey && event.charCode === 63 ) {
			if( dom.overlay ) {
				closeOverlay();
			}
			else {
				showHelp( true );
			}
		}

	}

	/**
	 * Handler for the document level 'keydown' event.
	 */
	function onDocumentKeyDown( event ) {

		// If there's a condition specified and it returns false,
		// ignore this event
		if( typeof config.keyboardCondition === 'function' && config.keyboardCondition() === false ) {
			return true;
		}

		// Remember if auto-sliding was paused so we can toggle it
		var autoSlideWasPaused = autoSlidePaused;

		onUserInput( event );

		// Check if there's a focused element that could be using
		// the keyboard
		var activeElementIsCE = document.activeElement && document.activeElement.contentEditable !== 'inherit';
		var activeElementIsInput = document.activeElement && document.activeElement.tagName && /input|textarea/i.test( document.activeElement.tagName );

		// Disregard the event if there's a focused element or a
		// keyboard modifier key is present
		if( activeElementIsCE || activeElementIsInput || (event.shiftKey && event.keyCode !== 32) || event.altKey || event.ctrlKey || event.metaKey ) return;

		// While paused only allow "unpausing" keyboard events (b and .)
		if( isPaused() && [66,190,191].indexOf( event.keyCode ) === -1 ) {
			return false;
		}

		var triggered = false;

		// 1. User defined key bindings
		if( typeof config.keyboard === 'object' ) {

			for( var key in config.keyboard ) {

				// Check if this binding matches the pressed key
				if( parseInt( key, 10 ) === event.keyCode ) {

					var value = config.keyboard[ key ];

					// Callback function
					if( typeof value === 'function' ) {
						value.apply( null, [ event ] );
					}
					// String shortcuts to reveal.js API
					else if( typeof value === 'string' && typeof Reveal[ value ] === 'function' ) {
						Reveal[ value ].call();
					}

					triggered = true;

				}

			}

		}

		// 2. System defined key bindings
		if( triggered === false ) {

			// Assume true and try to prove false
			triggered = true;

			switch( event.keyCode ) {
				// p, page up
				case 80: case 33: navigatePrev(); break;
				// n, page down
				case 78: case 34: navigateNext(); break;
				// h, left
				case 72: case 37: navigateLeft(); break;
				// l, right
				case 76: case 39: navigateRight(); break;
				// k, up
				case 75: case 38: navigateUp(); break;
				// j, down
				case 74: case 40: navigateDown(); break;
				// home
				case 36: slide( 0 ); break;
				// end
				case 35: slide( Number.MAX_VALUE ); break;
				// space
				case 32: isOverview() ? deactivateOverview() : event.shiftKey ? navigatePrev() : navigateNext(); break;
				// return
				case 13: isOverview() ? deactivateOverview() : triggered = false; break;
				// two-spot, semicolon, b, period, Logitech presenter tools "black screen" button
				case 58: case 59: case 66: case 190: case 191: togglePause(); break;
				// f
				case 70: enterFullscreen(); break;
				// a
				case 65: if ( config.autoSlideStoppable ) toggleAutoSlide( autoSlideWasPaused ); break;
				default:
					triggered = false;
			}

		}

		// If the input resulted in a triggered action we should prevent
		// the browsers default behavior
		if( triggered ) {
			event.preventDefault && event.preventDefault();
		}
		// ESC or O key
		else if ( ( event.keyCode === 27 || event.keyCode === 79 ) && features.transforms3d ) {
			if( dom.overlay ) {
				closeOverlay();
			}
			else {
				toggleOverview();
			}

			event.preventDefault && event.preventDefault();
		}

		// If auto-sliding is enabled we need to cue up
		// another timeout
		cueAutoSlide();

	}

	/**
	 * Handler for the 'touchstart' event, enables support for
	 * swipe and pinch gestures.
	 */
	function onTouchStart( event ) {

		touch.startX = event.touches[0].clientX;
		touch.startY = event.touches[0].clientY;
		touch.startCount = event.touches.length;

		// If there's two touches we need to memorize the distance
		// between those two points to detect pinching
		if( event.touches.length === 2 && config.overview ) {
			touch.startSpan = distanceBetween( {
				x: event.touches[1].clientX,
				y: event.touches[1].clientY
			}, {
				x: touch.startX,
				y: touch.startY
			} );
		}

	}

	/**
	 * Handler for the 'touchmove' event.
	 */
	function onTouchMove( event ) {

		// Each touch should only trigger one action
		if( !touch.captured ) {
			onUserInput( event );

			var currentX = event.touches[0].clientX;
			var currentY = event.touches[0].clientY;

			// If the touch started with two points and still has
			// two active touches; test for the pinch gesture
			if( event.touches.length === 2 && touch.startCount === 2 && config.overview ) {

				// The current distance in pixels between the two touch points
				var currentSpan = distanceBetween( {
					x: event.touches[1].clientX,
					y: event.touches[1].clientY
				}, {
					x: touch.startX,
					y: touch.startY
				} );

				// If the span is larger than the desire amount we've got
				// ourselves a pinch
				if( Math.abs( touch.startSpan - currentSpan ) > touch.threshold ) {
					touch.captured = true;

					if( currentSpan < touch.startSpan ) {
						activateOverview();
					}
					else {
						deactivateOverview();
					}
				}

				event.preventDefault();

			}
			// There was only one touch point, look for a swipe
			else if( event.touches.length === 1 && touch.startCount !== 2 ) {

				var deltaX = currentX - touch.startX,
					deltaY = currentY - touch.startY;

				if( deltaX > touch.threshold && Math.abs( deltaX ) > Math.abs( deltaY ) ) {
					touch.captured = true;
					navigateLeft();
				}
				else if( deltaX < -touch.threshold && Math.abs( deltaX ) > Math.abs( deltaY ) ) {
					touch.captured = true;
					navigateRight();
				}
				else if( deltaY > touch.threshold ) {
					touch.captured = true;
					navigateUp();
				}
				else if( deltaY < -touch.threshold ) {
					touch.captured = true;
					navigateDown();
				}

				// If we're embedded, only block touch events if they have
				// triggered an action
				if( config.embedded ) {
					if( touch.captured || isVerticalSlide( currentSlide ) ) {
						event.preventDefault();
					}
				}
				// Not embedded? Block them all to avoid needless tossing
				// around of the viewport in iOS
				else {
					event.preventDefault();
				}

			}
		}
		// There's a bug with swiping on some Android devices unless
		// the default action is always prevented
		else if( navigator.userAgent.match( /android/gi ) ) {
			event.preventDefault();
		}

	}

	/**
	 * Handler for the 'touchend' event.
	 */
	function onTouchEnd( event ) {

		touch.captured = false;

	}

	/**
	 * Convert pointer down to touch start.
	 */
	function onPointerDown( event ) {

		if( event.pointerType === event.MSPOINTER_TYPE_TOUCH || event.pointerType === "touch" ) {
			event.touches = [{ clientX: event.clientX, clientY: event.clientY }];
			onTouchStart( event );
		}

	}

	/**
	 * Convert pointer move to touch move.
	 */
	function onPointerMove( event ) {

		if( event.pointerType === event.MSPOINTER_TYPE_TOUCH || event.pointerType === "touch" )  {
			event.touches = [{ clientX: event.clientX, clientY: event.clientY }];
			onTouchMove( event );
		}

	}

	/**
	 * Convert pointer up to touch end.
	 */
	function onPointerUp( event ) {

		if( event.pointerType === event.MSPOINTER_TYPE_TOUCH || event.pointerType === "touch" )  {
			event.touches = [{ clientX: event.clientX, clientY: event.clientY }];
			onTouchEnd( event );
		}

	}

	/**
	 * Handles mouse wheel scrolling, throttled to avoid skipping
	 * multiple slides.
	 */
	function onDocumentMouseScroll( event ) {

		if( Date.now() - lastMouseWheelStep > 600 ) {

			lastMouseWheelStep = Date.now();

			var delta = event.detail || -event.wheelDelta;
			if( delta > 0 ) {
				navigateNext();
			}
			else {
				navigatePrev();
			}

		}

	}

	/**
	 * Clicking on the progress bar results in a navigation to the
	 * closest approximate horizontal slide using this equation:
	 *
	 * ( clickX / presentationWidth ) * numberOfSlides
	 */
	function onProgressClicked( event ) {

		onUserInput( event );

		event.preventDefault();

		var slidesTotal = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) ).length;
		var slideIndex = Math.floor( ( event.clientX / dom.wrapper.offsetWidth ) * slidesTotal );

		if( config.rtl ) {
			slideIndex = slidesTotal - slideIndex;
		}

		slide( slideIndex );

	}

	/**
	 * Event handler for navigation control buttons.
	 */
	function onNavigateLeftClicked( event ) { event.preventDefault(); onUserInput(); navigateLeft(); }
	function onNavigateRightClicked( event ) { event.preventDefault(); onUserInput(); navigateRight(); }
	function onNavigateUpClicked( event ) { event.preventDefault(); onUserInput(); navigateUp(); }
	function onNavigateDownClicked( event ) { event.preventDefault(); onUserInput(); navigateDown(); }
	function onNavigatePrevClicked( event ) { event.preventDefault(); onUserInput(); navigatePrev(); }
	function onNavigateNextClicked( event ) { event.preventDefault(); onUserInput(); navigateNext(); }

	/**
	 * Handler for the window level 'hashchange' event.
	 */
	function onWindowHashChange( event ) {

		readURL();

	}

	/**
	 * Handler for the window level 'resize' event.
	 */
	function onWindowResize( event ) {

		layout();

	}

	/**
	 * Handle for the window level 'visibilitychange' event.
	 */
	function onPageVisibilityChange( event ) {

		var isHidden =  document.webkitHidden ||
						document.msHidden ||
						document.hidden;

		// If, after clicking a link or similar and we're coming back,
		// focus the document.body to ensure we can use keyboard shortcuts
		if( isHidden === false && document.activeElement !== document.body ) {
			// Not all elements support .blur() - SVGs among them.
			if( typeof document.activeElement.blur === 'function' ) {
				document.activeElement.blur();
			}
			document.body.focus();
		}

	}

	/**
	 * Invoked when a slide is and we're in the overview.
	 */
	function onOverviewSlideClicked( event ) {

		// TODO There's a bug here where the event listeners are not
		// removed after deactivating the overview.
		if( eventsAreBound && isOverview() ) {
			event.preventDefault();

			var element = event.target;

			while( element && !element.nodeName.match( /section/gi ) ) {
				element = element.parentNode;
			}

			if( element && !element.classList.contains( 'disabled' ) ) {

				deactivateOverview();

				if( element.nodeName.match( /section/gi ) ) {
					var h = parseInt( element.getAttribute( 'data-index-h' ), 10 ),
						v = parseInt( element.getAttribute( 'data-index-v' ), 10 );

					slide( h, v );
				}

			}
		}

	}

	/**
	 * Handles clicks on links that are set to preview in the
	 * iframe overlay.
	 */
	function onPreviewLinkClicked( event ) {

		if( event.currentTarget && event.currentTarget.hasAttribute( 'href' ) ) {
			var url = event.currentTarget.getAttribute( 'href' );
			if( url ) {
				showPreview( url );
				event.preventDefault();
			}
		}

	}

	/**
	 * Handles click on the auto-sliding controls element.
	 */
	function onAutoSlidePlayerClick( event ) {

		// Replay
		if( Reveal.isLastSlide() && config.loop === false ) {
			slide( 0, 0 );
			resumeAutoSlide();
		}
		// Resume
		else if( autoSlidePaused ) {
			resumeAutoSlide();
		}
		// Pause
		else {
			pauseAutoSlide();
		}

	}


	// --------------------------------------------------------------------//
	// ------------------------ PLAYBACK COMPONENT ------------------------//
	// --------------------------------------------------------------------//


	/**
	 * Constructor for the playback component, which displays
	 * play/pause/progress controls.
	 *
	 * @param {HTMLElement} container The component will append
	 * itself to this
	 * @param {Function} progressCheck A method which will be
	 * called frequently to get the current progress on a range
	 * of 0-1
	 */
	function Playback( container, progressCheck ) {

		// Cosmetics
		this.diameter = 50;
		this.thickness = 3;

		// Flags if we are currently playing
		this.playing = false;

		// Current progress on a 0-1 range
		this.progress = 0;

		// Used to loop the animation smoothly
		this.progressOffset = 1;

		this.container = container;
		this.progressCheck = progressCheck;

		this.canvas = document.createElement( 'canvas' );
		this.canvas.className = 'playback';
		this.canvas.width = this.diameter;
		this.canvas.height = this.diameter;
		this.context = this.canvas.getContext( '2d' );

		this.container.appendChild( this.canvas );

		this.render();

	}

	Playback.prototype.setPlaying = function( value ) {

		var wasPlaying = this.playing;

		this.playing = value;

		// Start repainting if we weren't already
		if( !wasPlaying && this.playing ) {
			this.animate();
		}
		else {
			this.render();
		}

	};

	Playback.prototype.animate = function() {

		var progressBefore = this.progress;

		this.progress = this.progressCheck();

		// When we loop, offset the progress so that it eases
		// smoothly rather than immediately resetting
		if( progressBefore > 0.8 && this.progress < 0.2 ) {
			this.progressOffset = this.progress;
		}

		this.render();

		if( this.playing ) {
			features.requestAnimationFrameMethod.call( window, this.animate.bind( this ) );
		}

	};

	/**
	 * Renders the current progress and playback state.
	 */
	Playback.prototype.render = function() {

		var progress = this.playing ? this.progress : 0,
			radius = ( this.diameter / 2 ) - this.thickness,
			x = this.diameter / 2,
			y = this.diameter / 2,
			iconSize = 14;

		// Ease towards 1
		this.progressOffset += ( 1 - this.progressOffset ) * 0.1;

		var endAngle = ( - Math.PI / 2 ) + ( progress * ( Math.PI * 2 ) );
		var startAngle = ( - Math.PI / 2 ) + ( this.progressOffset * ( Math.PI * 2 ) );

		this.context.save();
		this.context.clearRect( 0, 0, this.diameter, this.diameter );

		// Solid background color
		this.context.beginPath();
		this.context.arc( x, y, radius + 2, 0, Math.PI * 2, false );
		this.context.fillStyle = 'rgba( 0, 0, 0, 0.4 )';
		this.context.fill();

		// Draw progress track
		this.context.beginPath();
		this.context.arc( x, y, radius, 0, Math.PI * 2, false );
		this.context.lineWidth = this.thickness;
		this.context.strokeStyle = '#666';
		this.context.stroke();

		if( this.playing ) {
			// Draw progress on top of track
			this.context.beginPath();
			this.context.arc( x, y, radius, startAngle, endAngle, false );
			this.context.lineWidth = this.thickness;
			this.context.strokeStyle = '#fff';
			this.context.stroke();
		}

		this.context.translate( x - ( iconSize / 2 ), y - ( iconSize / 2 ) );

		// Draw play/pause icons
		if( this.playing ) {
			this.context.fillStyle = '#fff';
			this.context.fillRect( 0, 0, iconSize / 2 - 2, iconSize );
			this.context.fillRect( iconSize / 2 + 2, 0, iconSize / 2 - 2, iconSize );
		}
		else {
			this.context.beginPath();
			this.context.translate( 2, 0 );
			this.context.moveTo( 0, 0 );
			this.context.lineTo( iconSize - 2, iconSize / 2 );
			this.context.lineTo( 0, iconSize );
			this.context.fillStyle = '#fff';
			this.context.fill();
		}

		this.context.restore();

	};

	Playback.prototype.on = function( type, listener ) {
		this.canvas.addEventListener( type, listener, false );
	};

	Playback.prototype.off = function( type, listener ) {
		this.canvas.removeEventListener( type, listener, false );
	};

	Playback.prototype.destroy = function() {

		this.playing = false;

		if( this.canvas.parentNode ) {
			this.container.removeChild( this.canvas );
		}

	};


	// --------------------------------------------------------------------//
	// ------------------------------- API --------------------------------//
	// --------------------------------------------------------------------//


	Reveal = {
		initialize: initialize,
		configure: configure,
		sync: sync,

		// Navigation methods
		slide: slide,
		left: navigateLeft,
		right: navigateRight,
		up: navigateUp,
		down: navigateDown,
		prev: navigatePrev,
		next: navigateNext,

		// Fragment methods
		navigateFragment: navigateFragment,
		prevFragment: previousFragment,
		nextFragment: nextFragment,

		// Deprecated aliases
		navigateTo: slide,
		navigateLeft: navigateLeft,
		navigateRight: navigateRight,
		navigateUp: navigateUp,
		navigateDown: navigateDown,
		navigatePrev: navigatePrev,
		navigateNext: navigateNext,

		// Forces an update in slide layout
		layout: layout,

		// Returns an object with the available routes as booleans (left/right/top/bottom)
		availableRoutes: availableRoutes,

		// Returns an object with the available fragments as booleans (prev/next)
		availableFragments: availableFragments,

		// Toggles the overview mode on/off
		toggleOverview: toggleOverview,

		// Toggles the "black screen" mode on/off
		togglePause: togglePause,

		// Toggles the auto slide mode on/off
		toggleAutoSlide: toggleAutoSlide,

		// State checks
		isOverview: isOverview,
		isPaused: isPaused,
		isAutoSliding: isAutoSliding,

		// Adds or removes all internal event listeners (such as keyboard)
		addEventListeners: addEventListeners,
		removeEventListeners: removeEventListeners,

		// Facility for persisting and restoring the presentation state
		getState: getState,
		setState: setState,

		// Presentation progress on range of 0-1
		getProgress: getProgress,

		// Returns the indices of the current, or specified, slide
		getIndices: getIndices,

		getTotalSlides: getTotalSlides,

		// Returns the slide element at the specified index
		getSlide: getSlide,

		// Returns the slide background element at the specified index
		getSlideBackground: getSlideBackground,

		// Returns the previous slide element, may be null
		getPreviousSlide: function() {
			return previousSlide;
		},

		// Returns the current slide element
		getCurrentSlide: function() {
			return currentSlide;
		},

		// Returns the current scale of the presentation content
		getScale: function() {
			return scale;
		},

		// Returns the current configuration object
		getConfig: function() {
			return config;
		},

		// Helper method, retrieves query string as a key/value hash
		getQueryHash: function() {
			var query = {};

			location.search.replace( /[A-Z0-9]+?=([\w\.%-]*)/gi, function(a) {
				query[ a.split( '=' ).shift() ] = a.split( '=' ).pop();
			} );

			// Basic deserialization
			for( var i in query ) {
				var value = query[ i ];

				query[ i ] = deserialize( unescape( value ) );
			}

			return query;
		},

		// Returns true if we're currently on the first slide
		isFirstSlide: function() {
			return ( indexh === 0 && indexv === 0 );
		},

		// Returns true if we're currently on the last slide
		isLastSlide: function() {
			if( currentSlide ) {
				// Does this slide has next a sibling?
				if( currentSlide.nextElementSibling ) return false;

				// If it's vertical, does its parent have a next sibling?
				if( isVerticalSlide( currentSlide ) && currentSlide.parentNode.nextElementSibling ) return false;

				return true;
			}

			return false;
		},

		// Checks if reveal.js has been loaded and is ready for use
		isReady: function() {
			return loaded;
		},

		// Forward event binding to the reveal DOM element
		addEventListener: function( type, listener, useCapture ) {
			if( 'addEventListener' in window ) {
				( dom.wrapper || document.querySelector( '.reveal' ) ).addEventListener( type, listener, useCapture );
			}
		},
		removeEventListener: function( type, listener, useCapture ) {
			if( 'addEventListener' in window ) {
				( dom.wrapper || document.querySelector( '.reveal' ) ).removeEventListener( type, listener, useCapture );
			}
		},

		// Programatically triggers a keyboard event
		triggerKey: function( keyCode ) {
			onDocumentKeyDown( { keyCode: keyCode } );
		}
	};

	return Reveal;

}));

},{}],169:[function(require,module,exports){
/**
    Head JS     The only script in your <HEAD>
    Copyright   Tero Piirainen (tipiirai)
    License     MIT / http://bit.ly/mit-license
    Version     0.96

    http://headjs.com
*/(function(a){function z(){d||(d=!0,s(e,function(a){p(a)}))}function y(c,d){var e=a.createElement("script");e.type="text/"+(c.type||"javascript"),e.src=c.src||c,e.async=!1,e.onreadystatechange=e.onload=function(){var a=e.readyState;!d.done&&(!a||/loaded|complete/.test(a))&&(d.done=!0,d())},(a.body||b).appendChild(e)}function x(a,b){if(a.state==o)return b&&b();if(a.state==n)return k.ready(a.name,b);if(a.state==m)return a.onpreload.push(function(){x(a,b)});a.state=n,y(a.url,function(){a.state=o,b&&b(),s(g[a.name],function(a){p(a)}),u()&&d&&s(g.ALL,function(a){p(a)})})}function w(a,b){a.state===undefined&&(a.state=m,a.onpreload=[],y({src:a.url,type:"cache"},function(){v(a)}))}function v(a){a.state=l,s(a.onpreload,function(a){a.call()})}function u(a){a=a||h;var b;for(var c in a){if(a.hasOwnProperty(c)&&a[c].state!=o)return!1;b=!0}return b}function t(a){return Object.prototype.toString.call(a)=="[object Function]"}function s(a,b){if(!!a){typeof a=="object"&&(a=[].slice.call(a));for(var c=0;c<a.length;c++)b.call(a,a[c],c)}}function r(a){var b;if(typeof a=="object")for(var c in a)a[c]&&(b={name:c,url:a[c]});else b={name:q(a),url:a};var d=h[b.name];if(d&&d.url===b.url)return d;h[b.name]=b;return b}function q(a){var b=a.split("/"),c=b[b.length-1],d=c.indexOf("?");return d!=-1?c.substring(0,d):c}function p(a){a._done||(a(),a._done=1)}var b=a.documentElement,c,d,e=[],f=[],g={},h={},i=a.createElement("script").async===!0||"MozAppearance"in a.documentElement.style||window.opera,j=window.head_conf&&head_conf.head||"head",k=window[j]=window[j]||function(){k.ready.apply(null,arguments)},l=1,m=2,n=3,o=4;i?k.js=function(){var a=arguments,b=a[a.length-1],c={};t(b)||(b=null),s(a,function(d,e){d!=b&&(d=r(d),c[d.name]=d,x(d,b&&e==a.length-2?function(){u(c)&&p(b)}:null))});return k}:k.js=function(){var a=arguments,b=[].slice.call(a,1),d=b[0];if(!c){f.push(function(){k.js.apply(null,a)});return k}d?(s(b,function(a){t(a)||w(r(a))}),x(r(a[0]),t(d)?d:function(){k.js.apply(null,b)})):x(r(a[0]));return k},k.ready=function(b,c){if(b==a){d?p(c):e.push(c);return k}t(b)&&(c=b,b="ALL");if(typeof b!="string"||!t(c))return k;var f=h[b];if(f&&f.state==o||b=="ALL"&&u()&&d){p(c);return k}var i=g[b];i?i.push(c):i=g[b]=[c];return k},k.ready(a,function(){u()&&s(g.ALL,function(a){p(a)}),k.feature&&k.feature("domloaded",!0)});if(window.addEventListener)a.addEventListener("DOMContentLoaded",z,!1),window.addEventListener("load",z,!1);else if(window.attachEvent){a.attachEvent("onreadystatechange",function(){a.readyState==="complete"&&z()});var A=1;try{A=window.frameElement}catch(B){}!A&&b.doScroll&&function(){try{b.doScroll("left"),z()}catch(a){setTimeout(arguments.callee,1);return}}(),window.attachEvent("onload",z)}!a.readyState&&a.addEventListener&&(a.readyState="loading",a.addEventListener("DOMContentLoaded",handler=function(){a.removeEventListener("DOMContentLoaded",handler,!1),a.readyState="complete"},!1)),setTimeout(function(){c=!0,s(f,function(a){a()})},300)})(document)
},{}],170:[function(require,module,exports){
(function() {
  'use strict';

  if (self.fetch) {
    return
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = name.toString();
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = value.toString();
    }
    return value
  }

  function Headers(headers) {
    this.map = {}

    var self = this
    if (headers instanceof Headers) {
      headers.forEach(function(name, values) {
        values.forEach(function(value) {
          self.append(name, value)
        })
      })

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        self.append(name, headers[name])
      })
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  // Instead of iterable for now.
  Headers.prototype.forEach = function(callback) {
    var self = this
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      callback(name, self.map[name])
    })
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self
  }

  function Body() {
    this.bodyUsed = false


    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (!body) {
        this._bodyText = ''
      } else {
        throw new Error('unsupported BodyInit type')
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(url, options) {
    options = options || {}
    this.url = url

    this.credentials = options.credentials || 'omit'
    this.headers = new Headers(options.headers)
    this.method = normalizeMethod(options.method || 'GET')
    this.mode = options.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && options.body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(options.body)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this._initBody(bodyInit)
    this.type = 'default'
    this.url = null
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
  }

  Body.call(Response.prototype)

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    // TODO: Request constructor should accept input, init
    var request
    if (Request.prototype.isPrototypeOf(input) && !init) {
      request = input
    } else {
      request = new Request(input, init)
    }

    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      xhr.onload = function() {
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(name, values) {
        values.forEach(function(value) {
          xhr.setRequestHeader(name, value)
        })
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})();

},{}],171:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('babel-core/polyfill');

require('whatwg-fetch');

var _revealJsLibJsHeadMin = require('reveal.js/lib/js/head.min');

var _revealJsLibJsHeadMin2 = _interopRequireDefault(_revealJsLibJsHeadMin);

var _revealJsJsReveal = require('reveal.js/js/reveal');

var _revealJsJsReveal2 = _interopRequireDefault(_revealJsJsReveal);

var _svg = require('./svg');

var _svg2 = _interopRequireDefault(_svg);

var _print = require('./print');

var _print2 = _interopRequireDefault(_print);

var prefix = 'node_modules/reveal.js/plugin';

document.addEventListener('DOMContentLoaded', function (event) {
	window.Reveal = _revealJsJsReveal2['default'];
	_revealJsJsReveal2['default'].initialize({
		controls: false,
		progress: true,
		history: true,
		center: true,
		transition: 'slide',
		dependencies: [{ src: prefix + '/markdown/marked.js', condition: function condition() {
				return !!document.querySelector('[data-markdown]');
			} }, { src: prefix + '/markdown/markdown.js', condition: function condition() {
				return !!document.querySelector('[data-markdown]');
			} }, { src: prefix + '/highlight/highlight.js', async: true, condition: function condition() {
				return !!document.querySelector('pre code');
			}, callback: function callback() {
				return hljs.initHighlightingOnLoad();
			} }, { src: prefix + '/zoom-js/zoom.js', async: true }, { src: prefix + '/notes/notes.js', async: true }, { src: prefix + '/math/math.js', async: true }]
	});

	(0, _svg2['default'])();
	(0, _print2['default'])();
});

},{"./print":172,"./svg":173,"babel-core/polyfill":166,"reveal.js/js/reveal":168,"reveal.js/lib/js/head.min":169,"whatwg-fetch":170}],172:[function(require,module,exports){
/** loads the PDF print stylesheet if ?print-pdf is appended to the URL */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = loadPrintCSS;

function loadPrintCSS() {
	var cssPrefix = 'node_modules/reveal.js/css/print';

	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = cssPrefix + '/' + (window.location.search.match(/print-pdf/gi) ? 'pdf' : 'paper') + '.css';
	document.getElementsByTagName('head')[0].appendChild(link);
}

module.exports = exports['default'];

},{}],173:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = loadDataSrcSVG;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function replaceAttributes(new_, old) {
	for (var i = 0; i < old.attributes.length; i++) {
		var attr = old.attributes[i];
		new_.setAttribute(attr.name, attr.value);
	}
}

/** embed SVGs via data-src
 * e.g. <svg data-src="images/test.svg"></svg>.
 * Useful for styling and using class="fragment" in SVG code
 */

function loadDataSrcSVG() {
	var svgsToLoad = [].concat(_toConsumableArray(document.querySelectorAll('svg[data-src]')));

	var loadSVGs = svgsToLoad.map(function (svg) {
		return fetch(svg.getAttribute('data-src')).then(function (response) {
			return response.text();
		}).then(function (svgCode) {
			var svgDoc = new DOMParser().parseFromString(svgCode, 'image/svg+xml');
			var newSVG = svgDoc.documentElement;
			replaceAttributes(newSVG, svg);
			svg.parentNode.replaceChild(newSVG, svg);
		})['catch'](function (error) {
			if (!(error instanceof TypeError)) throw error;
			var img = document.createElement('img');
			img.setAttribute('src', svg.getAttribute('data-src'));
			replaceAttributes(img, svg);
			svg.parentNode.replaceChild(img, svg);
		});
	});

	Promise.all(loadSVGs).then(function (val) {
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = document.querySelectorAll('svg.stretch:not([preserveAspectRatio])')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var svg = _step.value;

				if (!svg.hasAttribute('viewBox')) {
					var w = svg.getAttribute('width');
					var h = svg.getAttribute('height');
					svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
				}
				svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator['return']) {
					_iterator['return']();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	});
}

module.exports = exports['default'];

},{}]},{},[171])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbGliL3BvbHlmaWxsLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hLWZ1bmN0aW9uLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hbi1vYmplY3QuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmFycmF5LWluY2x1ZGVzLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hcnJheS1tZXRob2RzLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hc3NpZ24uanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNsYXNzb2YuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvZi5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi1zdHJvbmcuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvbGxlY3Rpb24tdG8tanNvbi5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi13ZWFrLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jb2xsZWN0aW9uLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jb3JlLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jdHguanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmRlZi5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZGVmaW5lZC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZG9tLWNyZWF0ZS5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZW51bS1rZXlzLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5lczUtb2JqZWN0LmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5leHBtMS5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZml4LXJlLXdrcy5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZmxhZ3MuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmZvci1vZi5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZ2V0LW5hbWVzLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5nbG9iYWwuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmhhcy5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaGlkZS5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaHRtbC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaW52b2tlLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pcy1hcnJheS1pdGVyLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pcy1pbnRlZ2VyLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pcy1vYmplY3QuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXItYnVnZ3kuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXItY2FsbC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaXRlci1jcmVhdGUuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXItZGVmaW5lLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pdGVyLWRldGVjdC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaXRlci1zdGVwLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pdGVyYXRvcnMuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5rZXlvZi5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQubGlicmFyeS5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQubWl4LmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5vYmplY3QtdG8tYXJyYXkuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLm93bi1rZXlzLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5wYXJ0aWFsLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5wYXRoLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5wcm9wZXJ0eS1kZXNjLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5yZWRlZi5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQucmVwbGFjZXIuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnNhbWUuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnNldC1wcm90by5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuc2hhcmVkLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zaWduLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zcGVjaWVzLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdHJpY3QtbmV3LmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdHJpbmctYXQuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnN0cmluZy1jb250ZXh0LmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdHJpbmctcGFkLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdHJpbmctcmVwZWF0LmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdXBwb3J0LWRlc2MuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnRhZy5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQudGFzay5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQudGhyb3dzLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC50by1pbmRleC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQudG8taW50ZWdlci5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQudG8tbGVuZ3RoLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC50by1vYmplY3QuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnVpZC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQudW5zY29wZS5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQud2tzLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM1LmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmNvcHktd2l0aGluLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZpbGwuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZmluZC1pbmRleC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5maW5kLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZyb20uanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3IuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkub2YuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuc3BlY2llcy5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5mdW5jdGlvbi5oYXMtaW5zdGFuY2UuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuZnVuY3Rpb24ubmFtZS5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5tYXAuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubWF0aC5hY29zaC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5tYXRoLmFzaW5oLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm1hdGguYXRhbmguanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubWF0aC5jYnJ0LmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm1hdGguY2x6MzIuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubWF0aC5jb3NoLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm1hdGguZXhwbTEuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubWF0aC5mcm91bmQuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubWF0aC5oeXBvdC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5tYXRoLmltdWwuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubWF0aC5sb2cxMC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5tYXRoLmxvZzFwLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm1hdGgubG9nMi5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5tYXRoLnNpZ24uanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubWF0aC5zaW5oLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm1hdGgudGFuaC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5tYXRoLnRydW5jLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm51bWJlci5jb25zdHJ1Y3Rvci5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5udW1iZXIuZXBzaWxvbi5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5udW1iZXIuaXMtZmluaXRlLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm51bWJlci5pcy1pbnRlZ2VyLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm51bWJlci5pcy1uYW4uanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubnVtYmVyLmlzLXNhZmUtaW50ZWdlci5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5udW1iZXIubWF4LXNhZmUtaW50ZWdlci5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5udW1iZXIubWluLXNhZmUtaW50ZWdlci5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5udW1iZXIucGFyc2UtZmxvYXQuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubnVtYmVyLnBhcnNlLWludC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm9iamVjdC5pcy5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZi5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3Quc3RhdGljcy1hY2NlcHQtcHJpbWl0aXZlcy5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnByb21pc2UuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVmbGVjdC5hcHBseS5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5yZWZsZWN0LmNvbnN0cnVjdC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5yZWZsZWN0LmRlZmluZS1wcm9wZXJ0eS5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5yZWZsZWN0LmRlbGV0ZS1wcm9wZXJ0eS5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5yZWZsZWN0LmVudW1lcmF0ZS5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5yZWZsZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5yZWZsZWN0LmdldC1wcm90b3R5cGUtb2YuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVmbGVjdC5nZXQuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVmbGVjdC5oYXMuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVmbGVjdC5pcy1leHRlbnNpYmxlLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZmxlY3Qub3duLWtleXMuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVmbGVjdC5wcmV2ZW50LWV4dGVuc2lvbnMuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVmbGVjdC5zZXQtcHJvdG90eXBlLW9mLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZmxlY3Quc2V0LmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZ2V4cC5jb25zdHJ1Y3Rvci5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5yZWdleHAuZmxhZ3MuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVnZXhwLm1hdGNoLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZ2V4cC5yZXBsYWNlLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZ2V4cC5zZWFyY2guanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVnZXhwLnNwbGl0LmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnNldC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuY29kZS1wb2ludC1hdC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuZW5kcy13aXRoLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5mcm9tLWNvZGUtcG9pbnQuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLmluY2x1ZGVzLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvci5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcucmF3LmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5yZXBlYXQuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLnN0YXJ0cy13aXRoLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN5bWJvbC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi53ZWFrLW1hcC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi53ZWFrLXNldC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5hcnJheS5pbmNsdWRlcy5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5tYXAudG8tanNvbi5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5vYmplY3QuZW50cmllcy5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9ycy5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5vYmplY3QudmFsdWVzLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LnJlZ2V4cC5lc2NhcGUuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcuc2V0LnRvLWpzb24uanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcuc3RyaW5nLmF0LmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LnN0cmluZy5scGFkLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LnN0cmluZy5ycGFkLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvanMuYXJyYXkuc3RhdGljcy5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy93ZWIuaW1tZWRpYXRlLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvd2ViLnRpbWVycy5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9zaGltLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci9ydW50aW1lLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL3BvbHlmaWxsLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvcmV2ZWFsLmpzL2pzL3JldmVhbC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvcmV2ZWFsLmpzL2xpYi9qcy9oZWFkLm1pbi5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvd2hhdHdnLWZldGNoL2ZldGNoLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL3NvdXJjZS9qYXZhc2NyaXB0cy9mYWtlXzQyNjg1MGJlLmpzIiwiL1VzZXJzL2pvc2h1YW9nbGUvUHJvamVjdHMvcHJlc2VudGF0aW9uLXRlbXBsYXRlL3NvdXJjZS9qYXZhc2NyaXB0cy9wcmludC5qcyIsIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9zb3VyY2UvamF2YXNjcmlwdHMvc3ZnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7O0FDRkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN29CQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNTVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O1FDL1VPLHFCQUFxQjs7UUFDckIsY0FBYzs7b0NBRUYsMkJBQTJCOzs7O2dDQUMzQixxQkFBcUI7Ozs7bUJBRWIsT0FBTzs7OztxQkFDUCxTQUFTOzs7O0FBRXBDLElBQUksTUFBTSxHQUFHLCtCQUErQixDQUFBOztBQUU1QyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDeEQsT0FBTSxDQUFDLE1BQU0sZ0NBQVMsQ0FBQTtBQUN0QiwrQkFBTyxVQUFVLENBQUM7QUFDakIsVUFBUSxFQUFFLEtBQUs7QUFDZixVQUFRLEVBQUUsSUFBSTtBQUNkLFNBQU8sRUFBRSxJQUFJO0FBQ2IsUUFBTSxFQUFFLElBQUk7QUFDWixZQUFVLEVBQUUsT0FBTztBQUNuQixjQUFZLEVBQUUsQ0FDYixFQUFFLEdBQUcsRUFBSyxNQUFNLHdCQUFxQixFQUFFLFNBQVMsRUFBRTtXQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDO0lBQUEsRUFBRSxFQUNyRyxFQUFFLEdBQUcsRUFBSyxNQUFNLDBCQUF1QixFQUFFLFNBQVMsRUFBRTtXQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDO0lBQUEsRUFBRSxFQUN2RyxFQUFFLEdBQUcsRUFBSyxNQUFNLDRCQUF5QixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO1dBQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDO0lBQUEsRUFBRSxRQUFRLEVBQUU7V0FBTSxJQUFJLENBQUMsc0JBQXNCLEVBQUU7SUFBQSxFQUFFLEVBQzlKLEVBQUUsR0FBRyxFQUFLLE1BQU0scUJBQWtCLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxFQUNqRCxFQUFFLEdBQUcsRUFBSyxNQUFNLG9CQUFpQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFDaEQsRUFBRSxHQUFHLEVBQUssTUFBTSxrQkFBZSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FDOUM7RUFDRCxDQUFDLENBQUE7O0FBRUYsd0JBQWdCLENBQUE7QUFDaEIsMEJBQWMsQ0FBQTtDQUNkLENBQUMsQ0FBQTs7Ozs7Ozs7O3FCQzlCc0IsWUFBWTs7QUFBckIsU0FBUyxZQUFZLEdBQUc7QUFDdEMsS0FBTSxTQUFTLEdBQUcsa0NBQWtDLENBQUE7O0FBRXBELEtBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDekMsS0FBSSxDQUFDLEdBQUcsR0FBRyxZQUFZLENBQUE7QUFDdkIsS0FBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUE7QUFDdEIsS0FBSSxDQUFDLElBQUksR0FBTSxTQUFTLFVBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFFLGFBQWEsQ0FBRSxHQUFHLEtBQUssR0FBRyxPQUFPLENBQUEsU0FBTSxDQUFBO0FBQ2pHLFNBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7Q0FDMUQ7Ozs7Ozs7Ozs7cUJDRXVCLGNBQWM7Ozs7QUFYdEMsU0FBUyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO0FBQ3JDLE1BQUssSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMzQyxNQUFJLElBQUksR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzVCLE1BQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7RUFDeEM7Q0FDRDs7Ozs7OztBQU1jLFNBQVMsY0FBYyxHQUFHO0FBQ3hDLEtBQUksVUFBVSxnQ0FBUSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQTs7QUFFbEUsS0FBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUc7U0FBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUN0RSxJQUFJLENBQUMsVUFBQSxRQUFRO1VBQUksUUFBUSxDQUFDLElBQUksRUFBRTtHQUFBLENBQUMsQ0FDakMsSUFBSSxDQUFDLFVBQUEsT0FBTyxFQUFJO0FBQ2hCLE9BQUksTUFBTSxHQUFHLElBQUksU0FBUyxFQUFFLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQTtBQUN0RSxPQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFBO0FBQ25DLG9CQUFpQixDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUM5QixNQUFHLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUE7R0FDeEMsQ0FBQyxTQUNJLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDZixPQUFJLEVBQUUsS0FBSyxZQUFZLFNBQVMsQ0FBQSxBQUFDLEVBQ2hDLE1BQU0sS0FBSyxDQUFBO0FBQ1osT0FBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN2QyxNQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7QUFDckQsb0JBQWlCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQzNCLE1BQUcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtHQUNyQyxDQUFDO0VBQUEsQ0FBQyxDQUFBOztBQUVKLFFBQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsR0FBRyxFQUFJOzs7Ozs7QUFDakMsd0JBQWdCLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyx3Q0FBd0MsQ0FBQyw4SEFBRTtRQUE1RSxHQUFHOztBQUNYLFFBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQ2pDLFNBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDakMsU0FBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUNsQyxRQUFHLENBQUMsWUFBWSxDQUFDLFNBQVMsV0FBUyxDQUFDLFNBQUksQ0FBQyxDQUFHLENBQUE7S0FDNUM7QUFDRCxPQUFHLENBQUMsWUFBWSxDQUFDLHFCQUFxQixFQUFFLGVBQWUsQ0FBQyxDQUFBO0lBQ3hEOzs7Ozs7Ozs7Ozs7Ozs7RUFDRCxDQUFDLENBQUE7Q0FDRiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG5cInVzZSBzdHJpY3RcIjtcblxucmVxdWlyZShcImNvcmUtanMvc2hpbVwiKTtcblxucmVxdWlyZShcInJlZ2VuZXJhdG9yL3J1bnRpbWVcIik7XG5cbmlmIChnbG9iYWwuX2JhYmVsUG9seWZpbGwpIHtcbiAgdGhyb3cgbmV3IEVycm9yKFwib25seSBvbmUgaW5zdGFuY2Ugb2YgYmFiZWwvcG9seWZpbGwgaXMgYWxsb3dlZFwiKTtcbn1cbmdsb2JhbC5fYmFiZWxQb2x5ZmlsbCA9IHRydWU7XG59KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZih0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59OyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZighaXNPYmplY3QoaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCIvLyBmYWxzZSAtPiBBcnJheSNpbmRleE9mXG4vLyB0cnVlICAtPiBBcnJheSNpbmNsdWRlc1xudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi8kLnRvLW9iamVjdCcpXG4gICwgdG9MZW5ndGggPSByZXF1aXJlKCcuLyQudG8tbGVuZ3RoJylcbiAgLCB0b0luZGV4ICA9IHJlcXVpcmUoJy4vJC50by1pbmRleCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihJU19JTkNMVURFUyl7XG4gIHJldHVybiBmdW5jdGlvbigkdGhpcywgZWwsIGZyb21JbmRleCl7XG4gICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KCR0aGlzKVxuICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aClcbiAgICAgICwgaW5kZXggID0gdG9JbmRleChmcm9tSW5kZXgsIGxlbmd0aClcbiAgICAgICwgdmFsdWU7XG4gICAgaWYoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpd2hpbGUobGVuZ3RoID4gaW5kZXgpe1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgaWYodmFsdWUgIT0gdmFsdWUpcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTyl7XG4gICAgICBpZihPW2luZGV4XSA9PT0gZWwpcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4O1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07IiwiLy8gMCAtPiBBcnJheSNmb3JFYWNoXG4vLyAxIC0+IEFycmF5I21hcFxuLy8gMiAtPiBBcnJheSNmaWx0ZXJcbi8vIDMgLT4gQXJyYXkjc29tZVxuLy8gNCAtPiBBcnJheSNldmVyeVxuLy8gNSAtPiBBcnJheSNmaW5kXG4vLyA2IC0+IEFycmF5I2ZpbmRJbmRleFxudmFyIHRvT2JqZWN0ICA9IHJlcXVpcmUoJy4vJC50by1vYmplY3QnKVxuICAsIEVTNU9iamVjdCA9IHJlcXVpcmUoJy4vJC5lczUtb2JqZWN0JylcbiAgLCBjdHggICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCB0b0xlbmd0aCAgPSByZXF1aXJlKCcuLyQudG8tbGVuZ3RoJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFRZUEUpe1xuICB2YXIgSVNfTUFQICAgICAgICA9IFRZUEUgPT0gMVxuICAgICwgSVNfRklMVEVSICAgICA9IFRZUEUgPT0gMlxuICAgICwgSVNfU09NRSAgICAgICA9IFRZUEUgPT0gM1xuICAgICwgSVNfRVZFUlkgICAgICA9IFRZUEUgPT0gNFxuICAgICwgSVNfRklORF9JTkRFWCA9IFRZUEUgPT0gNlxuICAgICwgTk9fSE9MRVMgICAgICA9IFRZUEUgPT0gNSB8fCBJU19GSU5EX0lOREVYO1xuICByZXR1cm4gZnVuY3Rpb24oJHRoaXMsIGNhbGxiYWNrZm4sIHRoYXQpe1xuICAgIHZhciBPICAgICAgPSB0b09iamVjdCgkdGhpcywgdHJ1ZSlcbiAgICAgICwgc2VsZiAgID0gRVM1T2JqZWN0KE8pXG4gICAgICAsIGYgICAgICA9IGN0eChjYWxsYmFja2ZuLCB0aGF0LCAzKVxuICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChzZWxmLmxlbmd0aClcbiAgICAgICwgaW5kZXggID0gMFxuICAgICAgLCByZXN1bHQgPSBJU19NQVAgPyBBcnJheShsZW5ndGgpIDogSVNfRklMVEVSID8gW10gOiB1bmRlZmluZWRcbiAgICAgICwgdmFsLCByZXM7XG4gICAgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihOT19IT0xFUyB8fCBpbmRleCBpbiBzZWxmKXtcbiAgICAgIHZhbCA9IHNlbGZbaW5kZXhdO1xuICAgICAgcmVzID0gZih2YWwsIGluZGV4LCBPKTtcbiAgICAgIGlmKFRZUEUpe1xuICAgICAgICBpZihJU19NQVApcmVzdWx0W2luZGV4XSA9IHJlczsgICAgICAgICAgICAvLyBtYXBcbiAgICAgICAgZWxzZSBpZihyZXMpc3dpdGNoKFRZUEUpe1xuICAgICAgICAgIGNhc2UgMzogcmV0dXJuIHRydWU7ICAgICAgICAgICAgICAgICAgICAvLyBzb21lXG4gICAgICAgICAgY2FzZSA1OiByZXR1cm4gdmFsOyAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmRcbiAgICAgICAgICBjYXNlIDY6IHJldHVybiBpbmRleDsgICAgICAgICAgICAgICAgICAgLy8gZmluZEluZGV4XG4gICAgICAgICAgY2FzZSAyOiByZXN1bHQucHVzaCh2YWwpOyAgICAgICAgICAgICAgIC8vIGZpbHRlclxuICAgICAgICB9IGVsc2UgaWYoSVNfRVZFUlkpcmV0dXJuIGZhbHNlOyAgICAgICAgICAvLyBldmVyeVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gSVNfRklORF9JTkRFWCA/IC0xIDogSVNfU09NRSB8fCBJU19FVkVSWSA/IElTX0VWRVJZIDogcmVzdWx0O1xuICB9O1xufTsiLCJ2YXIgdG9PYmplY3QgID0gcmVxdWlyZSgnLi8kLnRvLW9iamVjdCcpXG4gICwgRVM1T2JqZWN0ID0gcmVxdWlyZSgnLi8kLmVzNS1vYmplY3QnKVxuICAsIGVudW1LZXlzICA9IHJlcXVpcmUoJy4vJC5lbnVtLWtleXMnKTtcbi8vIDE5LjEuMi4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UsIC4uLilcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgc291cmNlKXtcbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgdmFyIFQgPSB0b09iamVjdCh0YXJnZXQsIHRydWUpXG4gICAgLCBsID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgaSA9IDE7XG4gIHdoaWxlKGwgPiBpKXtcbiAgICB2YXIgUyAgICAgID0gRVM1T2JqZWN0KGFyZ3VtZW50c1tpKytdKVxuICAgICAgLCBrZXlzICAgPSBlbnVtS2V5cyhTKVxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICAgLCBqICAgICAgPSAwXG4gICAgICAsIGtleTtcbiAgICB3aGlsZShsZW5ndGggPiBqKVRba2V5ID0ga2V5c1tqKytdXSA9IFNba2V5XTtcbiAgfVxuICByZXR1cm4gVDtcbn07IiwidmFyIGNvZiA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsIFRBRyA9IHJlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKVxuICAvLyBFUzMgd3JvbmcgaGVyZVxuICAsIEFSRyA9IGNvZihmdW5jdGlvbigpeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID09ICdBcmd1bWVudHMnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIE8sIFQsIEI7XG4gIHJldHVybiBpdCA9PT0gdW5kZWZpbmVkID8gJ1VuZGVmaW5lZCcgOiBpdCA9PT0gbnVsbCA/ICdOdWxsJ1xuICAgIC8vIEBAdG9TdHJpbmdUYWcgY2FzZVxuICAgIDogdHlwZW9mIChUID0gKE8gPSBPYmplY3QoaXQpKVtUQUddKSA9PSAnc3RyaW5nJyA/IFRcbiAgICAvLyBidWlsdGluVGFnIGNhc2VcbiAgICA6IEFSRyA/IGNvZihPKVxuICAgIC8vIEVTMyBhcmd1bWVudHMgZmFsbGJhY2tcbiAgICA6IChCID0gY29mKE8pKSA9PSAnT2JqZWN0JyAmJiB0eXBlb2YgTy5jYWxsZWUgPT0gJ2Z1bmN0aW9uJyA/ICdBcmd1bWVudHMnIDogQjtcbn07IiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBoaWRlICAgICAgICAgPSByZXF1aXJlKCcuLyQuaGlkZScpXG4gICwgY3R4ICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgc3BlY2llcyAgICAgID0gcmVxdWlyZSgnLi8kLnNwZWNpZXMnKVxuICAsIHN0cmljdE5ldyAgICA9IHJlcXVpcmUoJy4vJC5zdHJpY3QtbmV3JylcbiAgLCBkZWZpbmVkICAgICAgPSByZXF1aXJlKCcuLyQuZGVmaW5lZCcpXG4gICwgZm9yT2YgICAgICAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXG4gICwgc3RlcCAgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItc3RlcCcpXG4gICwgSUQgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpKCdpZCcpXG4gICwgJGhhcyAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhhcycpXG4gICwgaXNPYmplY3QgICAgID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpXG4gICwgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCBpc09iamVjdFxuICAsIFNVUFBPUlRfREVTQyA9IHJlcXVpcmUoJy4vJC5zdXBwb3J0LWRlc2MnKVxuICAsIFNJWkUgICAgICAgICA9IFNVUFBPUlRfREVTQyA/ICdfcycgOiAnc2l6ZSdcbiAgLCBpZCAgICAgICAgICAgPSAwO1xuXG5mdW5jdGlvbiBmYXN0S2V5KGl0LCBjcmVhdGUpe1xuICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XG4gIGlmKCFpc09iamVjdChpdCkpcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJyA/IGl0IDogKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyA/ICdTJyA6ICdQJykgKyBpdDtcbiAgaWYoISRoYXMoaXQsIElEKSl7XG4gICAgLy8gY2FuJ3Qgc2V0IGlkIHRvIGZyb3plbiBvYmplY3RcbiAgICBpZighaXNFeHRlbnNpYmxlKGl0KSlyZXR1cm4gJ0YnO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIGlkXG4gICAgaWYoIWNyZWF0ZSlyZXR1cm4gJ0UnO1xuICAgIC8vIGFkZCBtaXNzaW5nIG9iamVjdCBpZFxuICAgIGhpZGUoaXQsIElELCArK2lkKTtcbiAgLy8gcmV0dXJuIG9iamVjdCBpZCB3aXRoIHByZWZpeFxuICB9IHJldHVybiAnTycgKyBpdFtJRF07XG59XG5cbmZ1bmN0aW9uIGdldEVudHJ5KHRoYXQsIGtleSl7XG4gIC8vIGZhc3QgY2FzZVxuICB2YXIgaW5kZXggPSBmYXN0S2V5KGtleSksIGVudHJ5O1xuICBpZihpbmRleCAhPT0gJ0YnKXJldHVybiB0aGF0Ll9pW2luZGV4XTtcbiAgLy8gZnJvemVuIG9iamVjdCBjYXNlXG4gIGZvcihlbnRyeSA9IHRoYXQuX2Y7IGVudHJ5OyBlbnRyeSA9IGVudHJ5Lm4pe1xuICAgIGlmKGVudHJ5LmsgPT0ga2V5KXJldHVybiBlbnRyeTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0Q29uc3RydWN0b3I6IGZ1bmN0aW9uKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpe1xuICAgIHZhciBDID0gd3JhcHBlcihmdW5jdGlvbih0aGF0LCBpdGVyYWJsZSl7XG4gICAgICBzdHJpY3ROZXcodGhhdCwgQywgTkFNRSk7XG4gICAgICB0aGF0Ll9pID0gJC5jcmVhdGUobnVsbCk7IC8vIGluZGV4XG4gICAgICB0aGF0Ll9mID0gdW5kZWZpbmVkOyAgICAgIC8vIGZpcnN0IGVudHJ5XG4gICAgICB0aGF0Ll9sID0gdW5kZWZpbmVkOyAgICAgIC8vIGxhc3QgZW50cnlcbiAgICAgIHRoYXRbU0laRV0gPSAwOyAgICAgICAgICAgLy8gc2l6ZVxuICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcbiAgICB9KTtcbiAgICByZXF1aXJlKCcuLyQubWl4JykoQy5wcm90b3R5cGUsIHtcbiAgICAgIC8vIDIzLjEuMy4xIE1hcC5wcm90b3R5cGUuY2xlYXIoKVxuICAgICAgLy8gMjMuMi4zLjIgU2V0LnByb3RvdHlwZS5jbGVhcigpXG4gICAgICBjbGVhcjogZnVuY3Rpb24gY2xlYXIoKXtcbiAgICAgICAgZm9yKHZhciB0aGF0ID0gdGhpcywgZGF0YSA9IHRoYXQuX2ksIGVudHJ5ID0gdGhhdC5fZjsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XG4gICAgICAgICAgZW50cnkuciA9IHRydWU7XG4gICAgICAgICAgaWYoZW50cnkucCllbnRyeS5wID0gZW50cnkucC5uID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGRlbGV0ZSBkYXRhW2VudHJ5LmldO1xuICAgICAgICB9XG4gICAgICAgIHRoYXQuX2YgPSB0aGF0Ll9sID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGF0W1NJWkVdID0gMDtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4xLjMuMyBNYXAucHJvdG90eXBlLmRlbGV0ZShrZXkpXG4gICAgICAvLyAyMy4yLjMuNCBTZXQucHJvdG90eXBlLmRlbGV0ZSh2YWx1ZSlcbiAgICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xuICAgICAgICB2YXIgdGhhdCAgPSB0aGlzXG4gICAgICAgICAgLCBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSk7XG4gICAgICAgIGlmKGVudHJ5KXtcbiAgICAgICAgICB2YXIgbmV4dCA9IGVudHJ5Lm5cbiAgICAgICAgICAgICwgcHJldiA9IGVudHJ5LnA7XG4gICAgICAgICAgZGVsZXRlIHRoYXQuX2lbZW50cnkuaV07XG4gICAgICAgICAgZW50cnkuciA9IHRydWU7XG4gICAgICAgICAgaWYocHJldilwcmV2Lm4gPSBuZXh0O1xuICAgICAgICAgIGlmKG5leHQpbmV4dC5wID0gcHJldjtcbiAgICAgICAgICBpZih0aGF0Ll9mID09IGVudHJ5KXRoYXQuX2YgPSBuZXh0O1xuICAgICAgICAgIGlmKHRoYXQuX2wgPT0gZW50cnkpdGhhdC5fbCA9IHByZXY7XG4gICAgICAgICAgdGhhdFtTSVpFXS0tO1xuICAgICAgICB9IHJldHVybiAhIWVudHJ5O1xuICAgICAgfSxcbiAgICAgIC8vIDIzLjIuMy42IFNldC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICAgICAgLy8gMjMuMS4zLjUgTWFwLnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gICAgICBmb3JFYWNoOiBmdW5jdGlvbiBmb3JFYWNoKGNhbGxiYWNrZm4gLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgICAgICB2YXIgZiA9IGN0eChjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0sIDMpXG4gICAgICAgICAgLCBlbnRyeTtcbiAgICAgICAgd2hpbGUoZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiB0aGlzLl9mKXtcbiAgICAgICAgICBmKGVudHJ5LnYsIGVudHJ5LmssIHRoaXMpO1xuICAgICAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxuICAgICAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gMjMuMS4zLjcgTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxuICAgICAgLy8gMjMuMi4zLjcgU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXG4gICAgICBoYXM6IGZ1bmN0aW9uIGhhcyhrZXkpe1xuICAgICAgICByZXR1cm4gISFnZXRFbnRyeSh0aGlzLCBrZXkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmKFNVUFBPUlRfREVTQykkLnNldERlc2MoQy5wcm90b3R5cGUsICdzaXplJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZGVmaW5lZCh0aGlzW1NJWkVdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gQztcbiAgfSxcbiAgZGVmOiBmdW5jdGlvbih0aGF0LCBrZXksIHZhbHVlKXtcbiAgICB2YXIgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpXG4gICAgICAsIHByZXYsIGluZGV4O1xuICAgIC8vIGNoYW5nZSBleGlzdGluZyBlbnRyeVxuICAgIGlmKGVudHJ5KXtcbiAgICAgIGVudHJ5LnYgPSB2YWx1ZTtcbiAgICAvLyBjcmVhdGUgbmV3IGVudHJ5XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoYXQuX2wgPSBlbnRyeSA9IHtcbiAgICAgICAgaTogaW5kZXggPSBmYXN0S2V5KGtleSwgdHJ1ZSksIC8vIDwtIGluZGV4XG4gICAgICAgIGs6IGtleSwgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBrZXlcbiAgICAgICAgdjogdmFsdWUsICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHZhbHVlXG4gICAgICAgIHA6IHByZXYgPSB0aGF0Ll9sLCAgICAgICAgICAgICAvLyA8LSBwcmV2aW91cyBlbnRyeVxuICAgICAgICBuOiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgLy8gPC0gbmV4dCBlbnRyeVxuICAgICAgICByOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gcmVtb3ZlZFxuICAgICAgfTtcbiAgICAgIGlmKCF0aGF0Ll9mKXRoYXQuX2YgPSBlbnRyeTtcbiAgICAgIGlmKHByZXYpcHJldi5uID0gZW50cnk7XG4gICAgICB0aGF0W1NJWkVdKys7XG4gICAgICAvLyBhZGQgdG8gaW5kZXhcbiAgICAgIGlmKGluZGV4ICE9PSAnRicpdGhhdC5faVtpbmRleF0gPSBlbnRyeTtcbiAgICB9IHJldHVybiB0aGF0O1xuICB9LFxuICBnZXRFbnRyeTogZ2V0RW50cnksXG4gIHNldFN0cm9uZzogZnVuY3Rpb24oQywgTkFNRSwgSVNfTUFQKXtcbiAgICAvLyBhZGQgLmtleXMsIC52YWx1ZXMsIC5lbnRyaWVzLCBbQEBpdGVyYXRvcl1cbiAgICAvLyAyMy4xLjMuNCwgMjMuMS4zLjgsIDIzLjEuMy4xMSwgMjMuMS4zLjEyLCAyMy4yLjMuNSwgMjMuMi4zLjgsIDIzLjIuMy4xMCwgMjMuMi4zLjExXG4gICAgcmVxdWlyZSgnLi8kLml0ZXItZGVmaW5lJykoQywgTkFNRSwgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xuICAgICAgdGhpcy5fdCA9IGl0ZXJhdGVkOyAgLy8gdGFyZ2V0XG4gICAgICB0aGlzLl9rID0ga2luZDsgICAgICAvLyBraW5kXG4gICAgICB0aGlzLl9sID0gdW5kZWZpbmVkOyAvLyBwcmV2aW91c1xuICAgIH0sIGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgdGhhdCAgPSB0aGlzXG4gICAgICAgICwga2luZCAgPSB0aGF0Ll9rXG4gICAgICAgICwgZW50cnkgPSB0aGF0Ll9sO1xuICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XG4gICAgICB3aGlsZShlbnRyeSAmJiBlbnRyeS5yKWVudHJ5ID0gZW50cnkucDtcbiAgICAgIC8vIGdldCBuZXh0IGVudHJ5XG4gICAgICBpZighdGhhdC5fdCB8fCAhKHRoYXQuX2wgPSBlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoYXQuX3QuX2YpKXtcbiAgICAgICAgLy8gb3IgZmluaXNoIHRoZSBpdGVyYXRpb25cbiAgICAgICAgdGhhdC5fdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHN0ZXAoMSk7XG4gICAgICB9XG4gICAgICAvLyByZXR1cm4gc3RlcCBieSBraW5kXG4gICAgICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGVudHJ5LmspO1xuICAgICAgaWYoa2luZCA9PSAndmFsdWVzJylyZXR1cm4gc3RlcCgwLCBlbnRyeS52KTtcbiAgICAgIHJldHVybiBzdGVwKDAsIFtlbnRyeS5rLCBlbnRyeS52XSk7XG4gICAgfSwgSVNfTUFQID8gJ2VudHJpZXMnIDogJ3ZhbHVlcycgLCAhSVNfTUFQLCB0cnVlKTtcblxuICAgIC8vIGFkZCBbQEBzcGVjaWVzXSwgMjMuMS4yLjIsIDIzLjIuMi4yXG4gICAgc3BlY2llcyhDKTtcbiAgICBzcGVjaWVzKHJlcXVpcmUoJy4vJC5jb3JlJylbTkFNRV0pOyAvLyBmb3Igd3JhcHBlclxuICB9XG59OyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cbnZhciBmb3JPZiAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXG4gICwgY2xhc3NvZiA9IHJlcXVpcmUoJy4vJC5jbGFzc29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUpe1xuICByZXR1cm4gZnVuY3Rpb24gdG9KU09OKCl7XG4gICAgaWYoY2xhc3NvZih0aGlzKSAhPSBOQU1FKXRocm93IFR5cGVFcnJvcihOQU1FICsgXCIjdG9KU09OIGlzbid0IGdlbmVyaWNcIik7XG4gICAgdmFyIGFyciA9IFtdO1xuICAgIGZvck9mKHRoaXMsIGZhbHNlLCBhcnIucHVzaCwgYXJyKTtcbiAgICByZXR1cm4gYXJyO1xuICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgaGlkZSAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhpZGUnKVxuICAsIGFuT2JqZWN0ICAgICA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKVxuICAsIHN0cmljdE5ldyAgICA9IHJlcXVpcmUoJy4vJC5zdHJpY3QtbmV3JylcbiAgLCBmb3JPZiAgICAgICAgPSByZXF1aXJlKCcuLyQuZm9yLW9mJylcbiAgLCBtZXRob2QgICAgICAgPSByZXF1aXJlKCcuLyQuYXJyYXktbWV0aG9kcycpXG4gICwgV0VBSyAgICAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpKCd3ZWFrJylcbiAgLCBpc09iamVjdCAgICAgPSByZXF1aXJlKCcuLyQuaXMtb2JqZWN0JylcbiAgLCAkaGFzICAgICAgICAgPSByZXF1aXJlKCcuLyQuaGFzJylcbiAgLCBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGlzT2JqZWN0XG4gICwgZmluZCAgICAgICAgID0gbWV0aG9kKDUpXG4gICwgZmluZEluZGV4ICAgID0gbWV0aG9kKDYpXG4gICwgaWQgICAgICAgICAgID0gMDtcblxuLy8gZmFsbGJhY2sgZm9yIGZyb3plbiBrZXlzXG5mdW5jdGlvbiBmcm96ZW5TdG9yZSh0aGF0KXtcbiAgcmV0dXJuIHRoYXQuX2wgfHwgKHRoYXQuX2wgPSBuZXcgRnJvemVuU3RvcmUpO1xufVxuZnVuY3Rpb24gRnJvemVuU3RvcmUoKXtcbiAgdGhpcy5hID0gW107XG59XG5Gcm96ZW5TdG9yZS5wcm90b3R5cGUgPSB7XG4gIGdldDogZnVuY3Rpb24oa2V5KXtcbiAgICB2YXIgZW50cnkgPSBmaW5kRnJvemVuKHRoaXMsIGtleSk7XG4gICAgaWYoZW50cnkpcmV0dXJuIGVudHJ5WzFdO1xuICB9LFxuICBoYXM6IGZ1bmN0aW9uKGtleSl7XG4gICAgcmV0dXJuICEhZmluZEZyb3plbih0aGlzLCBrZXkpO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgIHZhciBlbnRyeSA9IGZpbmRGcm96ZW4odGhpcywga2V5KTtcbiAgICBpZihlbnRyeSllbnRyeVsxXSA9IHZhbHVlO1xuICAgIGVsc2UgdGhpcy5hLnB1c2goW2tleSwgdmFsdWVdKTtcbiAgfSxcbiAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XG4gICAgdmFyIGluZGV4ID0gZmluZEluZGV4KHRoaXMuYSwgZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0WzBdID09PSBrZXk7XG4gICAgfSk7XG4gICAgaWYofmluZGV4KXRoaXMuYS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHJldHVybiAhIX5pbmRleDtcbiAgfVxufTtcbmZ1bmN0aW9uIGZpbmRGcm96ZW4oc3RvcmUsIGtleSl7XG4gIHJldHVybiBmaW5kKHN0b3JlLmEsIGZ1bmN0aW9uKGl0KXtcbiAgICByZXR1cm4gaXRbMF0gPT09IGtleTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24od3JhcHBlciwgTkFNRSwgSVNfTUFQLCBBRERFUil7XG4gICAgdmFyIEMgPSB3cmFwcGVyKGZ1bmN0aW9uKHRoYXQsIGl0ZXJhYmxlKXtcbiAgICAgIHN0cmljdE5ldyh0aGF0LCBDLCBOQU1FKTtcbiAgICAgIHRoYXQuX2kgPSBpZCsrOyAgICAgIC8vIGNvbGxlY3Rpb24gaWRcbiAgICAgIHRoYXQuX2wgPSB1bmRlZmluZWQ7IC8vIGxlYWsgc3RvcmUgZm9yIGZyb3plbiBvYmplY3RzXG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhhdFtBRERFUl0sIHRoYXQpO1xuICAgIH0pO1xuICAgIHJlcXVpcmUoJy4vJC5taXgnKShDLnByb3RvdHlwZSwge1xuICAgICAgLy8gMjMuMy4zLjIgV2Vha01hcC5wcm90b3R5cGUuZGVsZXRlKGtleSlcbiAgICAgIC8vIDIzLjQuMy4zIFdlYWtTZXQucHJvdG90eXBlLmRlbGV0ZSh2YWx1ZSlcbiAgICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xuICAgICAgICBpZighaXNPYmplY3Qoa2V5KSlyZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmKCFpc0V4dGVuc2libGUoa2V5KSlyZXR1cm4gZnJvemVuU3RvcmUodGhpcylbJ2RlbGV0ZSddKGtleSk7XG4gICAgICAgIHJldHVybiAkaGFzKGtleSwgV0VBSykgJiYgJGhhcyhrZXlbV0VBS10sIHRoaXMuX2kpICYmIGRlbGV0ZSBrZXlbV0VBS11bdGhpcy5faV07XG4gICAgICB9LFxuICAgICAgLy8gMjMuMy4zLjQgV2Vha01hcC5wcm90b3R5cGUuaGFzKGtleSlcbiAgICAgIC8vIDIzLjQuMy40IFdlYWtTZXQucHJvdG90eXBlLmhhcyh2YWx1ZSlcbiAgICAgIGhhczogZnVuY3Rpb24gaGFzKGtleSl7XG4gICAgICAgIGlmKCFpc09iamVjdChrZXkpKXJldHVybiBmYWxzZTtcbiAgICAgICAgaWYoIWlzRXh0ZW5zaWJsZShrZXkpKXJldHVybiBmcm96ZW5TdG9yZSh0aGlzKS5oYXMoa2V5KTtcbiAgICAgICAgcmV0dXJuICRoYXMoa2V5LCBXRUFLKSAmJiAkaGFzKGtleVtXRUFLXSwgdGhpcy5faSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIEM7XG4gIH0sXG4gIGRlZjogZnVuY3Rpb24odGhhdCwga2V5LCB2YWx1ZSl7XG4gICAgaWYoIWlzRXh0ZW5zaWJsZShhbk9iamVjdChrZXkpKSl7XG4gICAgICBmcm96ZW5TdG9yZSh0aGF0KS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICRoYXMoa2V5LCBXRUFLKSB8fCBoaWRlKGtleSwgV0VBSywge30pO1xuICAgICAga2V5W1dFQUtdW3RoYXQuX2ldID0gdmFsdWU7XG4gICAgfSByZXR1cm4gdGhhdDtcbiAgfSxcbiAgZnJvemVuU3RvcmU6IGZyb3plblN0b3JlLFxuICBXRUFLOiBXRUFLXG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciBnbG9iYWwgICAgID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgJGRlZiAgICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIEJVR0dZICAgICAgPSByZXF1aXJlKCcuLyQuaXRlci1idWdneScpXG4gICwgZm9yT2YgICAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIHN0cmljdE5ldyAgPSByZXF1aXJlKCcuLyQuc3RyaWN0LW5ldycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUsIHdyYXBwZXIsIG1ldGhvZHMsIGNvbW1vbiwgSVNfTUFQLCBJU19XRUFLKXtcbiAgdmFyIEJhc2UgID0gZ2xvYmFsW05BTUVdXG4gICAgLCBDICAgICA9IEJhc2VcbiAgICAsIEFEREVSID0gSVNfTUFQID8gJ3NldCcgOiAnYWRkJ1xuICAgICwgcHJvdG8gPSBDICYmIEMucHJvdG90eXBlXG4gICAgLCBPICAgICA9IHt9O1xuICBmdW5jdGlvbiBmaXhNZXRob2QoS0VZKXtcbiAgICB2YXIgZm4gPSBwcm90b1tLRVldO1xuICAgIHJlcXVpcmUoJy4vJC5yZWRlZicpKHByb3RvLCBLRVksXG4gICAgICBLRVkgPT0gJ2RlbGV0ZScgPyBmdW5jdGlvbihhKXsgcmV0dXJuIGZuLmNhbGwodGhpcywgYSA9PT0gMCA/IDAgOiBhKTsgfVxuICAgICAgOiBLRVkgPT0gJ2hhcycgPyBmdW5jdGlvbiBoYXMoYSl7IHJldHVybiBmbi5jYWxsKHRoaXMsIGEgPT09IDAgPyAwIDogYSk7IH1cbiAgICAgIDogS0VZID09ICdnZXQnID8gZnVuY3Rpb24gZ2V0KGEpeyByZXR1cm4gZm4uY2FsbCh0aGlzLCBhID09PSAwID8gMCA6IGEpOyB9XG4gICAgICA6IEtFWSA9PSAnYWRkJyA/IGZ1bmN0aW9uIGFkZChhKXsgZm4uY2FsbCh0aGlzLCBhID09PSAwID8gMCA6IGEpOyByZXR1cm4gdGhpczsgfVxuICAgICAgOiBmdW5jdGlvbiBzZXQoYSwgYil7IGZuLmNhbGwodGhpcywgYSA9PT0gMCA/IDAgOiBhLCBiKTsgcmV0dXJuIHRoaXM7IH1cbiAgICApO1xuICB9XG4gIGlmKHR5cGVvZiBDICE9ICdmdW5jdGlvbicgfHwgIShJU19XRUFLIHx8ICFCVUdHWSAmJiBwcm90by5mb3JFYWNoICYmIHByb3RvLmVudHJpZXMpKXtcbiAgICAvLyBjcmVhdGUgY29sbGVjdGlvbiBjb25zdHJ1Y3RvclxuICAgIEMgPSBjb21tb24uZ2V0Q29uc3RydWN0b3Iod3JhcHBlciwgTkFNRSwgSVNfTUFQLCBBRERFUik7XG4gICAgcmVxdWlyZSgnLi8kLm1peCcpKEMucHJvdG90eXBlLCBtZXRob2RzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaW5zdCAgPSBuZXcgQ1xuICAgICAgLCBjaGFpbiA9IGluc3RbQURERVJdKElTX1dFQUsgPyB7fSA6IC0wLCAxKVxuICAgICAgLCBidWdneVplcm87XG4gICAgLy8gd3JhcCBmb3IgaW5pdCBjb2xsZWN0aW9ucyBmcm9tIGl0ZXJhYmxlXG4gICAgaWYoIXJlcXVpcmUoJy4vJC5pdGVyLWRldGVjdCcpKGZ1bmN0aW9uKGl0ZXIpeyBuZXcgQyhpdGVyKTsgfSkpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xuICAgICAgQyA9IHdyYXBwZXIoZnVuY3Rpb24odGFyZ2V0LCBpdGVyYWJsZSl7XG4gICAgICAgIHN0cmljdE5ldyh0YXJnZXQsIEMsIE5BTUUpO1xuICAgICAgICB2YXIgdGhhdCA9IG5ldyBCYXNlO1xuICAgICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhhdFtBRERFUl0sIHRoYXQpO1xuICAgICAgICByZXR1cm4gdGhhdDtcbiAgICAgIH0pO1xuICAgICAgQy5wcm90b3R5cGUgPSBwcm90bztcbiAgICAgIHByb3RvLmNvbnN0cnVjdG9yID0gQztcbiAgICB9XG4gICAgSVNfV0VBSyB8fCBpbnN0LmZvckVhY2goZnVuY3Rpb24odmFsLCBrZXkpe1xuICAgICAgYnVnZ3laZXJvID0gMSAvIGtleSA9PT0gLUluZmluaXR5O1xuICAgIH0pO1xuICAgIC8vIGZpeCBjb252ZXJ0aW5nIC0wIGtleSB0byArMFxuICAgIGlmKGJ1Z2d5WmVybyl7XG4gICAgICBmaXhNZXRob2QoJ2RlbGV0ZScpO1xuICAgICAgZml4TWV0aG9kKCdoYXMnKTtcbiAgICAgIElTX01BUCAmJiBmaXhNZXRob2QoJ2dldCcpO1xuICAgIH1cbiAgICAvLyArIGZpeCAuYWRkICYgLnNldCBmb3IgY2hhaW5pbmdcbiAgICBpZihidWdneVplcm8gfHwgY2hhaW4gIT09IGluc3QpZml4TWV0aG9kKEFEREVSKTtcbiAgICAvLyB3ZWFrIGNvbGxlY3Rpb25zIHNob3VsZCBub3QgY29udGFpbnMgLmNsZWFyIG1ldGhvZFxuICAgIGlmKElTX1dFQUsgJiYgcHJvdG8uY2xlYXIpZGVsZXRlIHByb3RvLmNsZWFyO1xuICB9XG5cbiAgcmVxdWlyZSgnLi8kLnRhZycpKEMsIE5BTUUpO1xuXG4gIE9bTkFNRV0gPSBDO1xuICAkZGVmKCRkZWYuRyArICRkZWYuVyArICRkZWYuRiAqIChDICE9IEJhc2UpLCBPKTtcblxuICBpZighSVNfV0VBSyljb21tb24uc2V0U3Ryb25nKEMsIE5BTUUsIElTX01BUCk7XG5cbiAgcmV0dXJuIEM7XG59OyIsInZhciBjb3JlID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbmlmKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiIsIi8vIE9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vJC5hLWZ1bmN0aW9uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCB0aGF0LCBsZW5ndGgpe1xuICBhRnVuY3Rpb24oZm4pO1xuICBpZih+bGVuZ3RoICYmIHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XG4gIHN3aXRjaChsZW5ndGgpe1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKGEpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9IHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICAgIH07XG59OyIsInZhciBnbG9iYWwgICAgID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgY29yZSAgICAgICA9IHJlcXVpcmUoJy4vJC5jb3JlJylcbiAgLCBoaWRlICAgICAgID0gcmVxdWlyZSgnLi8kLmhpZGUnKVxuICAsICRyZWRlZiAgICAgPSByZXF1aXJlKCcuLyQucmVkZWYnKVxuICAsIFBST1RPVFlQRSAgPSAncHJvdG90eXBlJztcbmZ1bmN0aW9uIGN0eChmbiwgdGhhdCl7XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufVxuZ2xvYmFsLmNvcmUgPSBjb3JlO1xuLy8gdHlwZSBiaXRtYXBcbiRkZWYuRiA9IDE7ICAvLyBmb3JjZWRcbiRkZWYuRyA9IDI7ICAvLyBnbG9iYWxcbiRkZWYuUyA9IDQ7ICAvLyBzdGF0aWNcbiRkZWYuUCA9IDg7ICAvLyBwcm90b1xuJGRlZi5CID0gMTY7IC8vIGJpbmRcbiRkZWYuVyA9IDMyOyAvLyB3cmFwXG5mdW5jdGlvbiAkZGVmKHR5cGUsIG5hbWUsIHNvdXJjZSl7XG4gIHZhciBrZXksIG93biwgb3V0LCBleHBcbiAgICAsIGlzR2xvYmFsID0gdHlwZSAmICRkZWYuR1xuICAgICwgaXNQcm90byAgPSB0eXBlICYgJGRlZi5QXG4gICAgLCB0YXJnZXQgICA9IGlzR2xvYmFsID8gZ2xvYmFsIDogdHlwZSAmICRkZWYuU1xuICAgICAgICA/IGdsb2JhbFtuYW1lXSB8fCAoZ2xvYmFsW25hbWVdID0ge30pIDogKGdsb2JhbFtuYW1lXSB8fCB7fSlbUFJPVE9UWVBFXVxuICAgICwgZXhwb3J0cyAgPSBpc0dsb2JhbCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pO1xuICBpZihpc0dsb2JhbClzb3VyY2UgPSBuYW1lO1xuICBmb3Ioa2V5IGluIHNvdXJjZSl7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gISh0eXBlICYgJGRlZi5GKSAmJiB0YXJnZXQgJiYga2V5IGluIHRhcmdldDtcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxuICAgIG91dCA9IChvd24gPyB0YXJnZXQgOiBzb3VyY2UpW2tleV07XG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICBpZih0eXBlICYgJGRlZi5CICYmIG93billeHAgPSBjdHgob3V0LCBnbG9iYWwpO1xuICAgIGVsc2UgZXhwID0gaXNQcm90byAmJiB0eXBlb2Ygb3V0ID09ICdmdW5jdGlvbicgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcbiAgICAvLyBleHRlbmQgZ2xvYmFsXG4gICAgaWYodGFyZ2V0ICYmICFvd24pJHJlZGVmKHRhcmdldCwga2V5LCBvdXQpO1xuICAgIC8vIGV4cG9ydFxuICAgIGlmKGV4cG9ydHNba2V5XSAhPSBvdXQpaGlkZShleHBvcnRzLCBrZXksIGV4cCk7XG4gICAgaWYoaXNQcm90bykoZXhwb3J0c1tQUk9UT1RZUEVdIHx8IChleHBvcnRzW1BST1RPVFlQRV0gPSB7fSkpW2tleV0gPSBvdXQ7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gJGRlZjsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoaXQgPT0gdW5kZWZpbmVkKXRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufTsiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLyQuaXMtb2JqZWN0JylcbiAgLCBkb2N1bWVudCA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKS5kb2N1bWVudFxuICAvLyBpbiBvbGQgSUUgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCdcbiAgLCBpcyA9IGlzT2JqZWN0KGRvY3VtZW50KSAmJiBpc09iamVjdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTsiLCJ2YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBrZXlzICAgICAgID0gJC5nZXRLZXlzKGl0KVxuICAgICwgaXNFbnVtICAgICA9ICQuaXNFbnVtXG4gICAgLCBnZXRTeW1ib2xzID0gJC5nZXRTeW1ib2xzO1xuICBpZihnZXRTeW1ib2xzKWZvcih2YXIgc3ltYm9scyA9IGdldFN5bWJvbHMoaXQpLCBpID0gMCwga2V5OyBzeW1ib2xzLmxlbmd0aCA+IGk7ICl7XG4gICAgaWYoaXNFbnVtLmNhbGwoaXQsIGtleSA9IHN5bWJvbHNbaSsrXSkpa2V5cy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIGtleXM7XG59OyIsIi8vIGZhbGxiYWNrIGZvciBub3QgYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIGNvZiAgICAgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCAkT2JqZWN0ID0gT2JqZWN0O1xubW9kdWxlLmV4cG9ydHMgPSAwIGluICRPYmplY3QoJ3onKSA/ICRPYmplY3QgOiBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogJE9iamVjdChpdCk7XG59OyIsIi8vIDIwLjIuMi4xNCBNYXRoLmV4cG0xKHgpXG5tb2R1bGUuZXhwb3J0cyA9IE1hdGguZXhwbTEgfHwgZnVuY3Rpb24gZXhwbTEoeCl7XG4gIHJldHVybiAoeCA9ICt4KSA9PSAwID8geCA6IHggPiAtMWUtNiAmJiB4IDwgMWUtNiA/IHggKyB4ICogeCAvIDIgOiBNYXRoLmV4cCh4KSAtIDE7XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oS0VZLCBsZW5ndGgsIGV4ZWMpe1xuICB2YXIgU1lNQk9MICAgPSByZXF1aXJlKCcuLyQud2tzJykoS0VZKVxuICAgICwgb3JpZ2luYWwgPSAnJ1tLRVldO1xuICBpZihmdW5jdGlvbigpe1xuICAgIHRyeSB7XG4gICAgICB2YXIgTyA9IHt9O1xuICAgICAgT1tTWU1CT0xdID0gZnVuY3Rpb24oKXsgcmV0dXJuIDc7IH07XG4gICAgICByZXR1cm4gJydbS0VZXShPKSAhPSA3O1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0oKSl7XG4gICAgcmVxdWlyZSgnLi8kLnJlZGVmJykoU3RyaW5nLnByb3RvdHlwZSwgS0VZLCBleGVjKFNZTUJPTCwgb3JpZ2luYWwpKTtcbiAgICByZXF1aXJlKCcuLyQuaGlkZScpKFJlZ0V4cC5wcm90b3R5cGUsIFNZTUJPTCwgbGVuZ3RoID09IDJcbiAgICAgIC8vIDIxLjIuNS44IFJlZ0V4cC5wcm90b3R5cGVbQEByZXBsYWNlXShzdHJpbmcsIHJlcGxhY2VWYWx1ZSlcbiAgICAgIC8vIDIxLjIuNS4xMSBSZWdFeHAucHJvdG90eXBlW0BAc3BsaXRdKHN0cmluZywgbGltaXQpXG4gICAgICA/IGZ1bmN0aW9uKHN0cmluZywgYXJnKXsgcmV0dXJuIG9yaWdpbmFsLmNhbGwoc3RyaW5nLCB0aGlzLCBhcmcpOyB9XG4gICAgICAvLyAyMS4yLjUuNiBSZWdFeHAucHJvdG90eXBlW0BAbWF0Y2hdKHN0cmluZylcbiAgICAgIC8vIDIxLjIuNS45IFJlZ0V4cC5wcm90b3R5cGVbQEBzZWFyY2hdKHN0cmluZylcbiAgICAgIDogZnVuY3Rpb24oc3RyaW5nKXsgcmV0dXJuIG9yaWdpbmFsLmNhbGwoc3RyaW5nLCB0aGlzKTsgfVxuICAgICk7XG4gIH1cbn07IiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFuLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmbGFncygpe1xuICB2YXIgdGhhdCAgID0gYW5PYmplY3QodGhpcylcbiAgICAsIHJlc3VsdCA9ICcnO1xuICBpZih0aGF0Lmdsb2JhbClyZXN1bHQgKz0gJ2cnO1xuICBpZih0aGF0Lmlnbm9yZUNhc2UpcmVzdWx0ICs9ICdpJztcbiAgaWYodGhhdC5tdWx0aWxpbmUpcmVzdWx0ICs9ICdtJztcbiAgaWYodGhhdC51bmljb2RlKXJlc3VsdCArPSAndSc7XG4gIGlmKHRoYXQuc3RpY2t5KXJlc3VsdCArPSAneSc7XG4gIHJldHVybiByZXN1bHQ7XG59OyIsInZhciBjdHggICAgICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIGNhbGwgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItY2FsbCcpXG4gICwgaXNBcnJheUl0ZXIgPSByZXF1aXJlKCcuLyQuaXMtYXJyYXktaXRlcicpXG4gICwgYW5PYmplY3QgICAgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0JylcbiAgLCB0b0xlbmd0aCAgICA9IHJlcXVpcmUoJy4vJC50by1sZW5ndGgnKVxuICAsIGdldEl0ZXJGbiAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXRlcmFibGUsIGVudHJpZXMsIGZuLCB0aGF0KXtcbiAgdmFyIGl0ZXJGbiA9IGdldEl0ZXJGbihpdGVyYWJsZSlcbiAgICAsIGYgICAgICA9IGN0eChmbiwgdGhhdCwgZW50cmllcyA/IDIgOiAxKVxuICAgICwgaW5kZXggID0gMFxuICAgICwgbGVuZ3RoLCBzdGVwLCBpdGVyYXRvcjtcbiAgaWYodHlwZW9mIGl0ZXJGbiAhPSAnZnVuY3Rpb24nKXRocm93IFR5cGVFcnJvcihpdGVyYWJsZSArICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICAvLyBmYXN0IGNhc2UgZm9yIGFycmF5cyB3aXRoIGRlZmF1bHQgaXRlcmF0b3JcbiAgaWYoaXNBcnJheUl0ZXIoaXRlckZuKSlmb3IobGVuZ3RoID0gdG9MZW5ndGgoaXRlcmFibGUubGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xuICAgIGVudHJpZXMgPyBmKGFuT2JqZWN0KHN0ZXAgPSBpdGVyYWJsZVtpbmRleF0pWzBdLCBzdGVwWzFdKSA6IGYoaXRlcmFibGVbaW5kZXhdKTtcbiAgfSBlbHNlIGZvcihpdGVyYXRvciA9IGl0ZXJGbi5jYWxsKGl0ZXJhYmxlKTsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyApe1xuICAgIGNhbGwoaXRlcmF0b3IsIGYsIHN0ZXAudmFsdWUsIGVudHJpZXMpO1xuICB9XG59OyIsIi8vIGZhbGxiYWNrIGZvciBJRTExIGJ1Z2d5IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHdpdGggaWZyYW1lIGFuZCB3aW5kb3dcbnZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nXG4gICwgdG9PYmplY3QgPSByZXF1aXJlKCcuLyQudG8tb2JqZWN0JylcbiAgLCBnZXROYW1lcyA9IHJlcXVpcmUoJy4vJCcpLmdldE5hbWVzO1xuXG52YXIgd2luZG93TmFtZXMgPSB0eXBlb2Ygd2luZG93ID09ICdvYmplY3QnICYmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzXG4gID8gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMod2luZG93KSA6IFtdO1xuXG5mdW5jdGlvbiBnZXRXaW5kb3dOYW1lcyhpdCl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdldE5hbWVzKGl0KTtcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gd2luZG93TmFtZXMuc2xpY2UoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KXtcbiAgaWYod2luZG93TmFtZXMgJiYgdG9TdHJpbmcuY2FsbChpdCkgPT0gJ1tvYmplY3QgV2luZG93XScpcmV0dXJuIGdldFdpbmRvd05hbWVzKGl0KTtcbiAgcmV0dXJuIGdldE5hbWVzKHRvT2JqZWN0KGl0KSk7XG59OyIsInZhciBnbG9iYWwgPSB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGYgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xubW9kdWxlLmV4cG9ydHMgPSBnbG9iYWw7XG5pZih0eXBlb2YgX19nID09ICdudW1iZXInKV9fZyA9IGdsb2JhbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiIsInZhciBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwga2V5KXtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59OyIsInZhciAkICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi8kLnByb3BlcnR5LWRlc2MnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLnN1cHBvcnQtZGVzYycpID8gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgcmV0dXJuICQuc2V0RGVzYyhvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpLmRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDsiLCIvLyBGYXN0IGFwcGx5XG4vLyBodHRwOi8vanNwZXJmLmxua2l0LmNvbS9mYXN0LWFwcGx5LzVcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIGFyZ3MsIHRoYXQpe1xuICB2YXIgdW4gPSB0aGF0ID09PSB1bmRlZmluZWQ7XG4gIHN3aXRjaChhcmdzLmxlbmd0aCl7XG4gICAgY2FzZSAwOiByZXR1cm4gdW4gPyBmbigpXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQpO1xuICAgIGNhc2UgMTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgIGNhc2UgNDogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSk7XG4gICAgY2FzZSA1OiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdLCBhcmdzWzRdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdLCBhcmdzWzRdKTtcbiAgfSByZXR1cm4gICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIGFyZ3MpO1xufTsiLCJ2YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi8kLml0ZXJhdG9ycycpXG4gICwgSVRFUkFUT1IgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiAoJ0FycmF5JyBpbiBJdGVyYXRvcnMgPyBJdGVyYXRvcnMuQXJyYXkgOiBBcnJheS5wcm90b3R5cGVbSVRFUkFUT1JdKSA9PT0gaXQ7XG59OyIsIi8vIDIwLjEuMi4zIE51bWJlci5pc0ludGVnZXIobnVtYmVyKVxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpXG4gICwgZmxvb3IgICAgPSBNYXRoLmZsb29yO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0ludGVnZXIoaXQpe1xuICByZXR1cm4gIWlzT2JqZWN0KGl0KSAmJiBpc0Zpbml0ZShpdCkgJiYgZmxvb3IoaXQpID09PSBpdDtcbn07IiwiLy8gaHR0cDovL2pzcGVyZi5jb20vY29yZS1qcy1pc29iamVjdFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCAhPT0gbnVsbCAmJiAodHlwZW9mIGl0ID09ICdvYmplY3QnIHx8IHR5cGVvZiBpdCA9PSAnZnVuY3Rpb24nKTtcbn07IiwiLy8gU2FmYXJpIGhhcyBidWdneSBpdGVyYXRvcnMgdy9vIGBuZXh0YFxubW9kdWxlLmV4cG9ydHMgPSAna2V5cycgaW4gW10gJiYgISgnbmV4dCcgaW4gW10ua2V5cygpKTsiLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0Jyk7XG5mdW5jdGlvbiBjbG9zZShpdGVyYXRvcil7XG4gIHZhciByZXQgPSBpdGVyYXRvclsncmV0dXJuJ107XG4gIGlmKHJldCAhPT0gdW5kZWZpbmVkKWFuT2JqZWN0KHJldC5jYWxsKGl0ZXJhdG9yKSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhdG9yLCBmbiwgdmFsdWUsIGVudHJpZXMpe1xuICB0cnkge1xuICAgIHJldHVybiBlbnRyaWVzID8gZm4oYW5PYmplY3QodmFsdWUpWzBdLCB2YWx1ZVsxXSkgOiBmbih2YWx1ZSk7XG4gIH0gY2F0Y2goZSl7XG4gICAgY2xvc2UoaXRlcmF0b3IpO1xuICAgIHRocm93IGU7XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgPSByZXF1aXJlKCcuLyQnKVxuICAsIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG5cbi8vIDI1LjEuMi4xLjEgJUl0ZXJhdG9yUHJvdG90eXBlJVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuLyQuaGlkZScpKEl0ZXJhdG9yUHJvdG90eXBlLCByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJyksIGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzOyB9KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCl7XG4gIENvbnN0cnVjdG9yLnByb3RvdHlwZSA9ICQuY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlLCB7bmV4dDogcmVxdWlyZSgnLi8kLnByb3BlcnR5LWRlc2MnKSgxLG5leHQpfSk7XG4gIHJlcXVpcmUoJy4vJC50YWcnKShDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIExJQlJBUlkgICAgICAgICA9IHJlcXVpcmUoJy4vJC5saWJyYXJ5JylcbiAgLCAkZGVmICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkcmVkZWYgICAgICAgICAgPSByZXF1aXJlKCcuLyQucmVkZWYnKVxuICAsIGhpZGUgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5oaWRlJylcbiAgLCBoYXMgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaGFzJylcbiAgLCBTWU1CT0xfSVRFUkFUT1IgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBJdGVyYXRvcnMgICAgICAgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJylcbiAgLCBGRl9JVEVSQVRPUiAgICAgPSAnQEBpdGVyYXRvcidcbiAgLCBLRVlTICAgICAgICAgICAgPSAna2V5cydcbiAgLCBWQUxVRVMgICAgICAgICAgPSAndmFsdWVzJztcbmZ1bmN0aW9uIHJldHVyblRoaXMoKXsgcmV0dXJuIHRoaXM7IH1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0Upe1xuICByZXF1aXJlKCcuLyQuaXRlci1jcmVhdGUnKShDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCk7XG4gIGZ1bmN0aW9uIGNyZWF0ZU1ldGhvZChraW5kKXtcbiAgICBzd2l0Y2goa2luZCl7XG4gICAgICBjYXNlIEtFWVM6IHJldHVybiBmdW5jdGlvbiBrZXlzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgICBjYXNlIFZBTFVFUzogcmV0dXJuIGZ1bmN0aW9uIHZhbHVlcygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgIH0gcmV0dXJuIGZ1bmN0aW9uIGVudHJpZXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgfVxuICB2YXIgVEFHICAgICAgPSBOQU1FICsgJyBJdGVyYXRvcidcbiAgICAsIHByb3RvICAgID0gQmFzZS5wcm90b3R5cGVcbiAgICAsIF9uYXRpdmUgID0gcHJvdG9bU1lNQk9MX0lURVJBVE9SXSB8fCBwcm90b1tGRl9JVEVSQVRPUl0gfHwgREVGQVVMVCAmJiBwcm90b1tERUZBVUxUXVxuICAgICwgX2RlZmF1bHQgPSBfbmF0aXZlIHx8IGNyZWF0ZU1ldGhvZChERUZBVUxUKVxuICAgICwgbWV0aG9kcywga2V5O1xuICAvLyBGaXggbmF0aXZlXG4gIGlmKF9uYXRpdmUpe1xuICAgIHZhciBJdGVyYXRvclByb3RvdHlwZSA9IHJlcXVpcmUoJy4vJCcpLmdldFByb3RvKF9kZWZhdWx0LmNhbGwobmV3IEJhc2UpKTtcbiAgICAvLyBTZXQgQEB0b1N0cmluZ1RhZyB0byBuYXRpdmUgaXRlcmF0b3JzXG4gICAgcmVxdWlyZSgnLi8kLnRhZycpKEl0ZXJhdG9yUHJvdG90eXBlLCBUQUcsIHRydWUpO1xuICAgIC8vIEZGIGZpeFxuICAgIGlmKCFMSUJSQVJZICYmIGhhcyhwcm90bywgRkZfSVRFUkFUT1IpKWhpZGUoSXRlcmF0b3JQcm90b3R5cGUsIFNZTUJPTF9JVEVSQVRPUiwgcmV0dXJuVGhpcyk7XG4gIH1cbiAgLy8gRGVmaW5lIGl0ZXJhdG9yXG4gIGlmKCFMSUJSQVJZIHx8IEZPUkNFKWhpZGUocHJvdG8sIFNZTUJPTF9JVEVSQVRPUiwgX2RlZmF1bHQpO1xuICAvLyBQbHVnIGZvciBsaWJyYXJ5XG4gIEl0ZXJhdG9yc1tOQU1FXSA9IF9kZWZhdWx0O1xuICBJdGVyYXRvcnNbVEFHXSAgPSByZXR1cm5UaGlzO1xuICBpZihERUZBVUxUKXtcbiAgICBtZXRob2RzID0ge1xuICAgICAga2V5czogICAgSVNfU0VUICAgICAgICAgICAgPyBfZGVmYXVsdCA6IGNyZWF0ZU1ldGhvZChLRVlTKSxcbiAgICAgIHZhbHVlczogIERFRkFVTFQgPT0gVkFMVUVTID8gX2RlZmF1bHQgOiBjcmVhdGVNZXRob2QoVkFMVUVTKSxcbiAgICAgIGVudHJpZXM6IERFRkFVTFQgIT0gVkFMVUVTID8gX2RlZmF1bHQgOiBjcmVhdGVNZXRob2QoJ2VudHJpZXMnKVxuICAgIH07XG4gICAgaWYoRk9SQ0UpZm9yKGtleSBpbiBtZXRob2RzKXtcbiAgICAgIGlmKCEoa2V5IGluIHByb3RvKSkkcmVkZWYocHJvdG8sIGtleSwgbWV0aG9kc1trZXldKTtcbiAgICB9IGVsc2UgJGRlZigkZGVmLlAgKyAkZGVmLkYgKiByZXF1aXJlKCcuLyQuaXRlci1idWdneScpLCBOQU1FLCBtZXRob2RzKTtcbiAgfVxufTsiLCJ2YXIgU1lNQk9MX0lURVJBVE9SID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgU0FGRV9DTE9TSU5HICAgID0gZmFsc2U7XG50cnkge1xuICB2YXIgcml0ZXIgPSBbN11bU1lNQk9MX0lURVJBVE9SXSgpO1xuICByaXRlclsncmV0dXJuJ10gPSBmdW5jdGlvbigpeyBTQUZFX0NMT1NJTkcgPSB0cnVlOyB9O1xuICBBcnJheS5mcm9tKHJpdGVyLCBmdW5jdGlvbigpeyB0aHJvdyAyOyB9KTtcbn0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIGlmKCFTQUZFX0NMT1NJTkcpcmV0dXJuIGZhbHNlO1xuICB2YXIgc2FmZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIHZhciBhcnIgID0gWzddXG4gICAgICAsIGl0ZXIgPSBhcnJbU1lNQk9MX0lURVJBVE9SXSgpO1xuICAgIGl0ZXIubmV4dCA9IGZ1bmN0aW9uKCl7IHNhZmUgPSB0cnVlOyB9O1xuICAgIGFycltTWU1CT0xfSVRFUkFUT1JdID0gZnVuY3Rpb24oKXsgcmV0dXJuIGl0ZXI7IH07XG4gICAgZXhlYyhhcnIpO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gIHJldHVybiBzYWZlO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRvbmUsIHZhbHVlKXtcbiAgcmV0dXJuIHt2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZX07XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge307IiwidmFyICRPYmplY3QgPSBPYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiAgICAgJE9iamVjdC5jcmVhdGUsXG4gIGdldFByb3RvOiAgICRPYmplY3QuZ2V0UHJvdG90eXBlT2YsXG4gIGlzRW51bTogICAgIHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlLFxuICBnZXREZXNjOiAgICAkT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgc2V0RGVzYzogICAgJE9iamVjdC5kZWZpbmVQcm9wZXJ0eSxcbiAgc2V0RGVzY3M6ICAgJE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzLFxuICBnZXRLZXlzOiAgICAkT2JqZWN0LmtleXMsXG4gIGdldE5hbWVzOiAgICRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgZ2V0U3ltYm9sczogJE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMsXG4gIGVhY2g6ICAgICAgIFtdLmZvckVhY2hcbn07IiwidmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCB0b09iamVjdCA9IHJlcXVpcmUoJy4vJC50by1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBlbCl7XG4gIHZhciBPICAgICAgPSB0b09iamVjdChvYmplY3QpXG4gICAgLCBrZXlzICAgPSAkLmdldEtleXMoTylcbiAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXG4gICAgLCBpbmRleCAgPSAwXG4gICAgLCBrZXk7XG4gIHdoaWxlKGxlbmd0aCA+IGluZGV4KWlmKE9ba2V5ID0ga2V5c1tpbmRleCsrXV0gPT09IGVsKXJldHVybiBrZXk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZmFsc2U7IiwidmFyICRyZWRlZiA9IHJlcXVpcmUoJy4vJC5yZWRlZicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQsIHNyYyl7XG4gIGZvcih2YXIga2V5IGluIHNyYykkcmVkZWYodGFyZ2V0LCBrZXksIHNyY1trZXldKTtcbiAgcmV0dXJuIHRhcmdldDtcbn07IiwidmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCB0b09iamVjdCA9IHJlcXVpcmUoJy4vJC50by1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXNFbnRyaWVzKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKGl0KXtcbiAgICB2YXIgTyAgICAgID0gdG9PYmplY3QoaXQpXG4gICAgICAsIGtleXMgICA9ICQuZ2V0S2V5cyhPKVxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICAgLCBpICAgICAgPSAwXG4gICAgICAsIHJlc3VsdCA9IEFycmF5KGxlbmd0aClcbiAgICAgICwga2V5O1xuICAgIGlmKGlzRW50cmllcyl3aGlsZShsZW5ndGggPiBpKXJlc3VsdFtpXSA9IFtrZXkgPSBrZXlzW2krK10sIE9ba2V5XV07XG4gICAgZWxzZSB3aGlsZShsZW5ndGggPiBpKXJlc3VsdFtpXSA9IE9ba2V5c1tpKytdXTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufTsiLCJ2YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFuLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBvd25LZXlzKGl0KXtcbiAgdmFyIGtleXMgICAgICAgPSAkLmdldE5hbWVzKGFuT2JqZWN0KGl0KSlcbiAgICAsIGdldFN5bWJvbHMgPSAkLmdldFN5bWJvbHM7XG4gIHJldHVybiBnZXRTeW1ib2xzID8ga2V5cy5jb25jYXQoZ2V0U3ltYm9scyhpdCkpIDoga2V5cztcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHBhdGggICAgICA9IHJlcXVpcmUoJy4vJC5wYXRoJylcbiAgLCBpbnZva2UgICAgPSByZXF1aXJlKCcuLyQuaW52b2tlJylcbiAgLCBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLyQuYS1mdW5jdGlvbicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigvKiAuLi5wYXJncyAqLyl7XG4gIHZhciBmbiAgICAgPSBhRnVuY3Rpb24odGhpcylcbiAgICAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIHBhcmdzICA9IEFycmF5KGxlbmd0aClcbiAgICAsIGkgICAgICA9IDBcbiAgICAsIF8gICAgICA9IHBhdGguX1xuICAgICwgaG9sZGVyID0gZmFsc2U7XG4gIHdoaWxlKGxlbmd0aCA+IGkpaWYoKHBhcmdzW2ldID0gYXJndW1lbnRzW2krK10pID09PSBfKWhvbGRlciA9IHRydWU7XG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcbiAgICB2YXIgdGhhdCAgICA9IHRoaXNcbiAgICAgICwgX2xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgICwgaiA9IDAsIGsgPSAwLCBhcmdzO1xuICAgIGlmKCFob2xkZXIgJiYgIV9sZW5ndGgpcmV0dXJuIGludm9rZShmbiwgcGFyZ3MsIHRoYXQpO1xuICAgIGFyZ3MgPSBwYXJncy5zbGljZSgpO1xuICAgIGlmKGhvbGRlcilmb3IoO2xlbmd0aCA+IGo7IGorKylpZihhcmdzW2pdID09PSBfKWFyZ3Nbal0gPSBhcmd1bWVudHNbaysrXTtcbiAgICB3aGlsZShfbGVuZ3RoID4gaylhcmdzLnB1c2goYXJndW1lbnRzW2srK10pO1xuICAgIHJldHVybiBpbnZva2UoZm4sIGFyZ3MsIHRoYXQpO1xuICB9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGJpdG1hcCwgdmFsdWUpe1xuICByZXR1cm4ge1xuICAgIGVudW1lcmFibGUgIDogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGUgICAgOiAhKGJpdG1hcCAmIDQpLFxuICAgIHZhbHVlICAgICAgIDogdmFsdWVcbiAgfTtcbn07IiwidmFyIGdsb2JhbCAgICAgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJylcbiAgLCBoYXMgICAgICAgID0gcmVxdWlyZSgnLi8kLmhhcycpXG4gICwgaGlkZSAgICAgICA9IHJlcXVpcmUoJy4vJC5oaWRlJylcbiAgLCB0cGwgICAgICAgID0gU3RyaW5nKHt9Lmhhc093blByb3BlcnR5KVxuICAsIFNSQyAgICAgICAgPSByZXF1aXJlKCcuLyQudWlkJykoJ3NyYycpXG4gICwgX3RvU3RyaW5nICA9IEZ1bmN0aW9uLnRvU3RyaW5nO1xuXG5mdW5jdGlvbiAkcmVkZWYoTywga2V5LCB2YWwsIHNhZmUpe1xuICBpZih0eXBlb2YgdmFsID09ICdmdW5jdGlvbicpe1xuICAgIHZhciBiYXNlID0gT1trZXldO1xuICAgIGhpZGUodmFsLCBTUkMsIGJhc2UgPyBTdHJpbmcoYmFzZSkgOiB0cGwucmVwbGFjZSgvaGFzT3duUHJvcGVydHkvLCBTdHJpbmcoa2V5KSkpO1xuICAgIGlmKCEoJ25hbWUnIGluIHZhbCkpdmFsLm5hbWUgPSBrZXk7XG4gIH1cbiAgaWYoTyA9PT0gZ2xvYmFsKXtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSB7XG4gICAgaWYoIXNhZmUpZGVsZXRlIE9ba2V5XTtcbiAgICBoaWRlKE8sIGtleSwgdmFsKTtcbiAgfVxufVxuXG4vLyBhZGQgZmFrZSBGdW5jdGlvbiN0b1N0cmluZyBmb3IgY29ycmVjdCB3b3JrIHdyYXBwZWQgbWV0aG9kcyAvIGNvbnN0cnVjdG9yc1xuLy8gd2l0aCBtZXRob2RzIHNpbWlsYXIgdG8gTG9EYXNoIGlzTmF0aXZlXG4kcmVkZWYoRnVuY3Rpb24ucHJvdG90eXBlLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpe1xuICByZXR1cm4gaGFzKHRoaXMsIFNSQykgPyB0aGlzW1NSQ10gOiBfdG9TdHJpbmcuY2FsbCh0aGlzKTtcbn0pO1xuXG5yZXF1aXJlKCcuLyQuY29yZScpLmluc3BlY3RTb3VyY2UgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBfdG9TdHJpbmcuY2FsbChpdCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9ICRyZWRlZjsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHJlZ0V4cCwgcmVwbGFjZSl7XG4gIHZhciByZXBsYWNlciA9IHJlcGxhY2UgPT09IE9iamVjdChyZXBsYWNlKSA/IGZ1bmN0aW9uKHBhcnQpe1xuICAgIHJldHVybiByZXBsYWNlW3BhcnRdO1xuICB9IDogcmVwbGFjZTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGl0KXtcbiAgICByZXR1cm4gU3RyaW5nKGl0KS5yZXBsYWNlKHJlZ0V4cCwgcmVwbGFjZXIpO1xuICB9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5pcyB8fCBmdW5jdGlvbiBpcyh4LCB5KXtcbiAgcmV0dXJuIHggPT09IHkgPyB4ICE9PSAwIHx8IDEgLyB4ID09PSAxIC8geSA6IHggIT0geCAmJiB5ICE9IHk7XG59OyIsIi8vIFdvcmtzIHdpdGggX19wcm90b19fIG9ubHkuIE9sZCB2OCBjYW4ndCB3b3JrIHdpdGggbnVsbCBwcm90byBvYmplY3RzLlxuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cbnZhciBnZXREZXNjICA9IHJlcXVpcmUoJy4vJCcpLmdldERlc2NcbiAgLCBpc09iamVjdCA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKVxuICAsIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFuLW9iamVjdCcpO1xuZnVuY3Rpb24gY2hlY2soTywgcHJvdG8pe1xuICBhbk9iamVjdChPKTtcbiAgaWYoIWlzT2JqZWN0KHByb3RvKSAmJiBwcm90byAhPT0gbnVsbCl0aHJvdyBUeXBlRXJyb3IocHJvdG8gKyBcIjogY2FuJ3Qgc2V0IGFzIHByb3RvdHlwZSFcIik7XG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgKCdfX3Byb3RvX18nIGluIHt9IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICA/IGZ1bmN0aW9uKGJ1Z2d5LCBzZXQpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHNldCA9IHJlcXVpcmUoJy4vJC5jdHgnKShGdW5jdGlvbi5jYWxsLCBnZXREZXNjKE9iamVjdC5wcm90b3R5cGUsICdfX3Byb3RvX18nKS5zZXQsIDIpO1xuICAgICAgICAgIHNldCh7fSwgW10pO1xuICAgICAgICB9IGNhdGNoKGUpeyBidWdneSA9IHRydWU7IH1cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHNldFByb3RvdHlwZU9mKE8sIHByb3RvKXtcbiAgICAgICAgICBjaGVjayhPLCBwcm90byk7XG4gICAgICAgICAgaWYoYnVnZ3kpTy5fX3Byb3RvX18gPSBwcm90bztcbiAgICAgICAgICBlbHNlIHNldChPLCBwcm90byk7XG4gICAgICAgICAgcmV0dXJuIE87XG4gICAgICAgIH07XG4gICAgICB9KClcbiAgICA6IHVuZGVmaW5lZCksXG4gIGNoZWNrOiBjaGVja1xufTsiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXydcbiAgLCBzdG9yZSAgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0ge30pO1xufTsiLCIvLyAyMC4yLjIuMjggTWF0aC5zaWduKHgpXG5tb2R1bGUuZXhwb3J0cyA9IE1hdGguc2lnbiB8fCBmdW5jdGlvbiBzaWduKHgpe1xuICByZXR1cm4gKHggPSAreCkgPT0gMCB8fCB4ICE9IHggPyB4IDogeCA8IDAgPyAtMSA6IDE7XG59OyIsInZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBTUEVDSUVTID0gcmVxdWlyZSgnLi8kLndrcycpKCdzcGVjaWVzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEMpe1xuICBpZihyZXF1aXJlKCcuLyQuc3VwcG9ydC1kZXNjJykgJiYgIShTUEVDSUVTIGluIEMpKSQuc2V0RGVzYyhDLCBTUEVDSUVTLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH1cbiAgfSk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIENvbnN0cnVjdG9yLCBuYW1lKXtcbiAgaWYoIShpdCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSl0aHJvdyBUeXBlRXJyb3IobmFtZSArIFwiOiB1c2UgdGhlICduZXcnIG9wZXJhdG9yIVwiKTtcbiAgcmV0dXJuIGl0O1xufTsiLCIvLyB0cnVlICAtPiBTdHJpbmcjYXRcbi8vIGZhbHNlIC0+IFN0cmluZyNjb2RlUG9pbnRBdFxudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vJC50by1pbnRlZ2VyJylcbiAgLCBkZWZpbmVkICAgPSByZXF1aXJlKCcuLyQuZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihUT19TVFJJTkcpe1xuICByZXR1cm4gZnVuY3Rpb24odGhhdCwgcG9zKXtcbiAgICB2YXIgcyA9IFN0cmluZyhkZWZpbmVkKHRoYXQpKVxuICAgICAgLCBpID0gdG9JbnRlZ2VyKHBvcylcbiAgICAgICwgbCA9IHMubGVuZ3RoXG4gICAgICAsIGEsIGI7XG4gICAgaWYoaSA8IDAgfHwgaSA+PSBsKXJldHVybiBUT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBhIDwgMHhkODAwIHx8IGEgPiAweGRiZmYgfHwgaSArIDEgPT09IGxcbiAgICAgIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxuICAgICAgICA/IFRPX1NUUklORyA/IHMuY2hhckF0KGkpIDogYVxuICAgICAgICA6IFRPX1NUUklORyA/IHMuc2xpY2UoaSwgaSArIDIpIDogKGEgLSAweGQ4MDAgPDwgMTApICsgKGIgLSAweGRjMDApICsgMHgxMDAwMDtcbiAgfTtcbn07IiwiLy8gaGVscGVyIGZvciBTdHJpbmcje3N0YXJ0c1dpdGgsIGVuZHNXaXRoLCBpbmNsdWRlc31cbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi8kLmRlZmluZWQnKVxuICAsIGNvZiAgICAgPSByZXF1aXJlKCcuLyQuY29mJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGhhdCwgc2VhcmNoU3RyaW5nLCBOQU1FKXtcbiAgaWYoY29mKHNlYXJjaFN0cmluZykgPT0gJ1JlZ0V4cCcpdGhyb3cgVHlwZUVycm9yKCdTdHJpbmcjJyArIE5BTUUgKyBcIiBkb2Vzbid0IGFjY2VwdCByZWdleCFcIik7XG4gIHJldHVybiBTdHJpbmcoZGVmaW5lZCh0aGF0KSk7XG59OyIsIi8vIGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPXN0cmF3bWFuOnN0cmluZ19wYWRkaW5nXG52YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi8kLnRvLWludGVnZXInKVxuICAsIHJlcGVhdCAgICA9IHJlcXVpcmUoJy4vJC5zdHJpbmctcmVwZWF0JylcbiAgLCBkZWZpbmVkICAgPSByZXF1aXJlKCcuLyQuZGVmaW5lZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRoYXQsIG1pbkxlbmd0aCwgZmlsbENoYXIsIGxlZnQpe1xuICAvLyAxLiBMZXQgTyBiZSBDaGVja09iamVjdENvZXJjaWJsZSh0aGlzIHZhbHVlKS5cbiAgLy8gMi4gTGV0IFMgYmUgVG9TdHJpbmcoTykuXG4gIHZhciBTID0gU3RyaW5nKGRlZmluZWQodGhhdCkpO1xuICAvLyA0LiBJZiBpbnRNaW5MZW5ndGggaXMgdW5kZWZpbmVkLCByZXR1cm4gUy5cbiAgaWYobWluTGVuZ3RoID09PSB1bmRlZmluZWQpcmV0dXJuIFM7XG4gIC8vIDQuIExldCBpbnRNaW5MZW5ndGggYmUgVG9JbnRlZ2VyKG1pbkxlbmd0aCkuXG4gIHZhciBpbnRNaW5MZW5ndGggPSB0b0ludGVnZXIobWluTGVuZ3RoKTtcbiAgLy8gNS4gTGV0IGZpbGxMZW4gYmUgdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIGluIFMgbWludXMgaW50TWluTGVuZ3RoLlxuICB2YXIgZmlsbExlbiA9IGludE1pbkxlbmd0aCAtIFMubGVuZ3RoO1xuICAvLyA2LiBJZiBmaWxsTGVuIDwgMCwgdGhlbiB0aHJvdyBhIFJhbmdlRXJyb3IgZXhjZXB0aW9uLlxuICAvLyA3LiBJZiBmaWxsTGVuIGlzICviiJ4sIHRoZW4gdGhyb3cgYSBSYW5nZUVycm9yIGV4Y2VwdGlvbi5cbiAgaWYoZmlsbExlbiA8IDAgfHwgZmlsbExlbiA9PT0gSW5maW5pdHkpe1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdDYW5ub3Qgc2F0aXNmeSBzdHJpbmcgbGVuZ3RoICcgKyBtaW5MZW5ndGggKyAnIGZvciBzdHJpbmc6ICcgKyBTKTtcbiAgfVxuICAvLyA4LiBMZXQgc0ZpbGxTdHIgYmUgdGhlIHN0cmluZyByZXByZXNlbnRlZCBieSBmaWxsU3RyLlxuICAvLyA5LiBJZiBzRmlsbFN0ciBpcyB1bmRlZmluZWQsIGxldCBzRmlsbFN0ciBiZSBhIHNwYWNlIGNoYXJhY3Rlci5cbiAgdmFyIHNGaWxsU3RyID0gZmlsbENoYXIgPT09IHVuZGVmaW5lZCA/ICcgJyA6IFN0cmluZyhmaWxsQ2hhcik7XG4gIC8vIDEwLiBMZXQgc0ZpbGxWYWwgYmUgYSBTdHJpbmcgbWFkZSBvZiBzRmlsbFN0ciwgcmVwZWF0ZWQgdW50aWwgZmlsbExlbiBpcyBtZXQuXG4gIHZhciBzRmlsbFZhbCA9IHJlcGVhdC5jYWxsKHNGaWxsU3RyLCBNYXRoLmNlaWwoZmlsbExlbiAvIHNGaWxsU3RyLmxlbmd0aCkpO1xuICAvLyB0cnVuY2F0ZSBpZiB3ZSBvdmVyZmxvd2VkXG4gIGlmKHNGaWxsVmFsLmxlbmd0aCA+IGZpbGxMZW4pc0ZpbGxWYWwgPSBsZWZ0XG4gICAgPyBzRmlsbFZhbC5zbGljZShzRmlsbFZhbC5sZW5ndGggLSBmaWxsTGVuKVxuICAgIDogc0ZpbGxWYWwuc2xpY2UoMCwgZmlsbExlbik7XG4gIC8vIDExLiBSZXR1cm4gYSBzdHJpbmcgbWFkZSBmcm9tIHNGaWxsVmFsLCBmb2xsb3dlZCBieSBTLlxuICAvLyAxMS4gUmV0dXJuIGEgU3RyaW5nIG1hZGUgZnJvbSBTLCBmb2xsb3dlZCBieSBzRmlsbFZhbC5cbiAgcmV0dXJuIGxlZnQgPyBzRmlsbFZhbC5jb25jYXQoUykgOiBTLmNvbmNhdChzRmlsbFZhbCk7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuLyQudG8taW50ZWdlcicpXG4gICwgZGVmaW5lZCAgID0gcmVxdWlyZSgnLi8kLmRlZmluZWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXBlYXQoY291bnQpe1xuICB2YXIgc3RyID0gU3RyaW5nKGRlZmluZWQodGhpcykpXG4gICAgLCByZXMgPSAnJ1xuICAgICwgbiAgID0gdG9JbnRlZ2VyKGNvdW50KTtcbiAgaWYobiA8IDAgfHwgbiA9PSBJbmZpbml0eSl0aHJvdyBSYW5nZUVycm9yKFwiQ291bnQgY2FuJ3QgYmUgbmVnYXRpdmVcIik7XG4gIGZvcig7biA+IDA7IChuID4+Pj0gMSkgJiYgKHN0ciArPSBzdHIpKWlmKG4gJiAxKXJlcyArPSBzdHI7XG4gIHJldHVybiByZXM7XG59OyIsIi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gISFmdW5jdGlvbigpe1xuICB0cnkge1xuICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDI7IH19KS5hID09IDI7XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbn0oKTsiLCJ2YXIgaGFzICA9IHJlcXVpcmUoJy4vJC5oYXMnKVxuICAsIGhpZGUgPSByZXF1aXJlKCcuLyQuaGlkZScpXG4gICwgVEFHICA9IHJlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgdGFnLCBzdGF0KXtcbiAgaWYoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSloaWRlKGl0LCBUQUcsIHRhZyk7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciBjdHggICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBpbnZva2UgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaW52b2tlJylcbiAgLCBodG1sICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaHRtbCcpXG4gICwgY2VsICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmRvbS1jcmVhdGUnKVxuICAsIGdsb2JhbCAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxuICAsIHByb2Nlc3MgICAgICAgICAgICA9IGdsb2JhbC5wcm9jZXNzXG4gICwgc2V0VGFzayAgICAgICAgICAgID0gZ2xvYmFsLnNldEltbWVkaWF0ZVxuICAsIGNsZWFyVGFzayAgICAgICAgICA9IGdsb2JhbC5jbGVhckltbWVkaWF0ZVxuICAsIE1lc3NhZ2VDaGFubmVsICAgICA9IGdsb2JhbC5NZXNzYWdlQ2hhbm5lbFxuICAsIGNvdW50ZXIgICAgICAgICAgICA9IDBcbiAgLCBxdWV1ZSAgICAgICAgICAgICAgPSB7fVxuICAsIE9OUkVBRFlTVEFURUNIQU5HRSA9ICdvbnJlYWR5c3RhdGVjaGFuZ2UnXG4gICwgZGVmZXIsIGNoYW5uZWwsIHBvcnQ7XG5mdW5jdGlvbiBydW4oKXtcbiAgdmFyIGlkID0gK3RoaXM7XG4gIGlmKHF1ZXVlLmhhc093blByb3BlcnR5KGlkKSl7XG4gICAgdmFyIGZuID0gcXVldWVbaWRdO1xuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XG4gICAgZm4oKTtcbiAgfVxufVxuZnVuY3Rpb24gbGlzdG5lcihldmVudCl7XG4gIHJ1bi5jYWxsKGV2ZW50LmRhdGEpO1xufVxuLy8gTm9kZS5qcyAwLjkrICYgSUUxMCsgaGFzIHNldEltbWVkaWF0ZSwgb3RoZXJ3aXNlOlxuaWYoIXNldFRhc2sgfHwgIWNsZWFyVGFzayl7XG4gIHNldFRhc2sgPSBmdW5jdGlvbiBzZXRJbW1lZGlhdGUoZm4pe1xuICAgIHZhciBhcmdzID0gW10sIGkgPSAxO1xuICAgIHdoaWxlKGFyZ3VtZW50cy5sZW5ndGggPiBpKWFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XG4gICAgcXVldWVbKytjb3VudGVyXSA9IGZ1bmN0aW9uKCl7XG4gICAgICBpbnZva2UodHlwZW9mIGZuID09ICdmdW5jdGlvbicgPyBmbiA6IEZ1bmN0aW9uKGZuKSwgYXJncyk7XG4gICAgfTtcbiAgICBkZWZlcihjb3VudGVyKTtcbiAgICByZXR1cm4gY291bnRlcjtcbiAgfTtcbiAgY2xlYXJUYXNrID0gZnVuY3Rpb24gY2xlYXJJbW1lZGlhdGUoaWQpe1xuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XG4gIH07XG4gIC8vIE5vZGUuanMgMC44LVxuICBpZihyZXF1aXJlKCcuLyQuY29mJykocHJvY2VzcykgPT0gJ3Byb2Nlc3MnKXtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY3R4KHJ1biwgaWQsIDEpKTtcbiAgICB9O1xuICAvLyBNb2Rlcm4gYnJvd3NlcnMsIHNraXAgaW1wbGVtZW50YXRpb24gZm9yIFdlYldvcmtlcnNcbiAgLy8gSUU4IGhhcyBwb3N0TWVzc2FnZSwgYnV0IGl0J3Mgc3luYyAmIHR5cGVvZiBpdHMgcG9zdE1lc3NhZ2UgaXMgJ29iamVjdCdcbiAgfSBlbHNlIGlmKGdsb2JhbC5hZGRFdmVudExpc3RlbmVyICYmIHR5cGVvZiBwb3N0TWVzc2FnZSA9PSAnZnVuY3Rpb24nICYmICFnbG9iYWwuaW1wb3J0U2NyaXB0cyl7XG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XG4gICAgICBnbG9iYWwucG9zdE1lc3NhZ2UoaWQsICcqJyk7XG4gICAgfTtcbiAgICBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RuZXIsIGZhbHNlKTtcbiAgLy8gV2ViV29ya2Vyc1xuICB9IGVsc2UgaWYoTWVzc2FnZUNoYW5uZWwpe1xuICAgIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XG4gICAgcG9ydCAgICA9IGNoYW5uZWwucG9ydDI7XG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBsaXN0bmVyO1xuICAgIGRlZmVyID0gY3R4KHBvcnQucG9zdE1lc3NhZ2UsIHBvcnQsIDEpO1xuICAvLyBJRTgtXG4gIH0gZWxzZSBpZihPTlJFQURZU1RBVEVDSEFOR0UgaW4gY2VsKCdzY3JpcHQnKSl7XG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XG4gICAgICBodG1sLmFwcGVuZENoaWxkKGNlbCgnc2NyaXB0JykpW09OUkVBRFlTVEFURUNIQU5HRV0gPSBmdW5jdGlvbigpe1xuICAgICAgICBodG1sLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICBydW4uY2FsbChpZCk7XG4gICAgICB9O1xuICAgIH07XG4gIC8vIFJlc3Qgb2xkIGJyb3dzZXJzXG4gIH0gZWxzZSB7XG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XG4gICAgICBzZXRUaW1lb3V0KGN0eChydW4sIGlkLCAxKSwgMCk7XG4gICAgfTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNldDogICBzZXRUYXNrLFxuICBjbGVhcjogY2xlYXJUYXNrXG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgZXhlYygpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTsiLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi8kLnRvLWludGVnZXInKVxuICAsIG1heCAgICAgICA9IE1hdGgubWF4XG4gICwgbWluICAgICAgID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGluZGV4LCBsZW5ndGgpe1xuICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xufTsiLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsICA9IE1hdGguY2VpbFxuICAsIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07IiwiLy8gNy4xLjE1IFRvTGVuZ3RoXG52YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi8kLnRvLWludGVnZXInKVxuICAsIG1pbiAgICAgICA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgMHgxZmZmZmZmZmZmZmZmZikgOiAwOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59OyIsInZhciBFUzVPYmplY3QgPSByZXF1aXJlKCcuLyQuZXM1LW9iamVjdCcpXG4gICwgZGVmaW5lZCAgID0gcmVxdWlyZSgnLi8kLmRlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIHJlYWxTdHJpbmcpe1xuICByZXR1cm4gKHJlYWxTdHJpbmcgPyBPYmplY3QgOiBFUzVPYmplY3QpKGRlZmluZWQoaXQpKTtcbn07IiwidmFyIGlkID0gMFxuICAsIHB4ID0gTWF0aC5yYW5kb20oKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07IiwiLy8gMjIuMS4zLjMxIEFycmF5LnByb3RvdHlwZVtAQHVuc2NvcGFibGVzXVxudmFyIFVOU0NPUEFCTEVTID0gcmVxdWlyZSgnLi8kLndrcycpKCd1bnNjb3BhYmxlcycpO1xuaWYoIShVTlNDT1BBQkxFUyBpbiBbXSkpcmVxdWlyZSgnLi8kLmhpZGUnKShBcnJheS5wcm90b3R5cGUsIFVOU0NPUEFCTEVTLCB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIFtdW1VOU0NPUEFCTEVTXVtrZXldID0gdHJ1ZTtcbn07IiwidmFyIHN0b3JlICA9IHJlcXVpcmUoJy4vJC5zaGFyZWQnKSgnd2tzJylcbiAgLCBTeW1ib2wgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJykuU3ltYm9sO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9XG4gICAgU3ltYm9sICYmIFN5bWJvbFtuYW1lXSB8fCAoU3ltYm9sIHx8IHJlcXVpcmUoJy4vJC51aWQnKSkoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTsiLCJ2YXIgZ2xvYmFsICAgID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgY2xhc3NvZiAgID0gcmVxdWlyZSgnLi8kLmNsYXNzb2YnKVxuICAsIElURVJBVE9SICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmNvcmUnKS5nZXRJdGVyYXRvck1ldGhvZCA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIFN5bWJvbCA9IGdsb2JhbC5TeW1ib2w7XG4gIGlmKGl0ICE9IHVuZGVmaW5lZCl7XG4gICAgcmV0dXJuIGl0W1N5bWJvbCAmJiBTeW1ib2wuaXRlcmF0b3IgfHwgJ0BAaXRlcmF0b3InXVxuICAgICAgfHwgaXRbSVRFUkFUT1JdXG4gICAgICB8fCBJdGVyYXRvcnNbY2xhc3NvZihpdCldO1xuICB9XG59OyIsInZhciAkICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBTVVBQT1JUX0RFU0MgICAgID0gcmVxdWlyZSgnLi8kLnN1cHBvcnQtZGVzYycpXG4gICwgY3JlYXRlRGVzYyAgICAgICA9IHJlcXVpcmUoJy4vJC5wcm9wZXJ0eS1kZXNjJylcbiAgLCBodG1sICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmh0bWwnKVxuICAsIGNlbCAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZG9tLWNyZWF0ZScpXG4gICwgaGFzICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5oYXMnKVxuICAsIGNvZiAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCAkZGVmICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgaW52b2tlICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5pbnZva2UnKVxuICAsIGFycmF5TWV0aG9kICAgICAgPSByZXF1aXJlKCcuLyQuYXJyYXktbWV0aG9kcycpXG4gICwgSUVfUFJPVE8gICAgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKSgnX19wcm90b19fJylcbiAgLCBpc09iamVjdCAgICAgICAgID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpXG4gICwgYW5PYmplY3QgICAgICAgICA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKVxuICAsIGFGdW5jdGlvbiAgICAgICAgPSByZXF1aXJlKCcuLyQuYS1mdW5jdGlvbicpXG4gICwgdG9PYmplY3QgICAgICAgICA9IHJlcXVpcmUoJy4vJC50by1vYmplY3QnKVxuICAsIHRvSW50ZWdlciAgICAgICAgPSByZXF1aXJlKCcuLyQudG8taW50ZWdlcicpXG4gICwgdG9JbmRleCAgICAgICAgICA9IHJlcXVpcmUoJy4vJC50by1pbmRleCcpXG4gICwgdG9MZW5ndGggICAgICAgICA9IHJlcXVpcmUoJy4vJC50by1sZW5ndGgnKVxuICAsIEVTNU9iamVjdCAgICAgICAgPSByZXF1aXJlKCcuLyQuZXM1LW9iamVjdCcpXG4gICwgT2JqZWN0UHJvdG8gICAgICA9IE9iamVjdC5wcm90b3R5cGVcbiAgLCBBICAgICAgICAgICAgICAgID0gW11cbiAgLCBfc2xpY2UgICAgICAgICAgID0gQS5zbGljZVxuICAsIF9qb2luICAgICAgICAgICAgPSBBLmpvaW5cbiAgLCBkZWZpbmVQcm9wZXJ0eSAgID0gJC5zZXREZXNjXG4gICwgZ2V0T3duRGVzY3JpcHRvciA9ICQuZ2V0RGVzY1xuICAsIGRlZmluZVByb3BlcnRpZXMgPSAkLnNldERlc2NzXG4gICwgSUU4X0RPTV9ERUZJTkUgICA9IGZhbHNlXG4gICwgJGluZGV4T2YgICAgICAgICA9IHJlcXVpcmUoJy4vJC5hcnJheS1pbmNsdWRlcycpKGZhbHNlKVxuICAsICRmb3JFYWNoICAgICAgICAgPSBhcnJheU1ldGhvZCgwKVxuICAsICRtYXAgICAgICAgICAgICAgPSBhcnJheU1ldGhvZCgxKVxuICAsICRmaWx0ZXIgICAgICAgICAgPSBhcnJheU1ldGhvZCgyKVxuICAsICRzb21lICAgICAgICAgICAgPSBhcnJheU1ldGhvZCgzKVxuICAsICRldmVyeSAgICAgICAgICAgPSBhcnJheU1ldGhvZCg0KVxuICAsIGZhY3RvcmllcyAgICAgICAgPSB7fVxuICAsICR0cmltICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQucmVwbGFjZXInKSgvXlxccyooW1xcc1xcU10qXFxTKT9cXHMqJC8sICckMScpO1xuXG5pZighU1VQUE9SVF9ERVNDKXtcbiAgdHJ5IHtcbiAgICBJRThfRE9NX0RFRklORSA9IGRlZmluZVByb3BlcnR5KGNlbCgnZGl2JyksICd4JyxcbiAgICAgIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA4OyB9fVxuICAgICkueCA9PSA4O1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gICQuc2V0RGVzYyA9IGZ1bmN0aW9uKE8sIFAsIEF0dHJpYnV0ZXMpe1xuICAgIGlmKElFOF9ET01fREVGSU5FKXRyeSB7XG4gICAgICByZXR1cm4gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcyk7XG4gICAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICAgIGlmKCdnZXQnIGluIEF0dHJpYnV0ZXMgfHwgJ3NldCcgaW4gQXR0cmlidXRlcyl0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkIScpO1xuICAgIGlmKCd2YWx1ZScgaW4gQXR0cmlidXRlcylhbk9iamVjdChPKVtQXSA9IEF0dHJpYnV0ZXMudmFsdWU7XG4gICAgcmV0dXJuIE87XG4gIH07XG4gICQuZ2V0RGVzYyA9IGZ1bmN0aW9uKE8sIFApe1xuICAgIGlmKElFOF9ET01fREVGSU5FKXRyeSB7XG4gICAgICByZXR1cm4gZ2V0T3duRGVzY3JpcHRvcihPLCBQKTtcbiAgICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gICAgaWYoaGFzKE8sIFApKXJldHVybiBjcmVhdGVEZXNjKCFPYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKE8sIFApLCBPW1BdKTtcbiAgfTtcbiAgJC5zZXREZXNjcyA9IGRlZmluZVByb3BlcnRpZXMgPSBmdW5jdGlvbihPLCBQcm9wZXJ0aWVzKXtcbiAgICBhbk9iamVjdChPKTtcbiAgICB2YXIga2V5cyAgID0gJC5nZXRLZXlzKFByb3BlcnRpZXMpXG4gICAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXG4gICAgICAsIGkgPSAwXG4gICAgICAsIFA7XG4gICAgd2hpbGUobGVuZ3RoID4gaSkkLnNldERlc2MoTywgUCA9IGtleXNbaSsrXSwgUHJvcGVydGllc1tQXSk7XG4gICAgcmV0dXJuIE87XG4gIH07XG59XG4kZGVmKCRkZWYuUyArICRkZWYuRiAqICFTVVBQT1JUX0RFU0MsICdPYmplY3QnLCB7XG4gIC8vIDE5LjEuMi42IC8gMTUuMi4zLjMgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6ICQuZ2V0RGVzYyxcbiAgLy8gMTkuMS4yLjQgLyAxNS4yLjMuNiBPYmplY3QuZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcylcbiAgZGVmaW5lUHJvcGVydHk6ICQuc2V0RGVzYyxcbiAgLy8gMTkuMS4yLjMgLyAxNS4yLjMuNyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKVxuICBkZWZpbmVQcm9wZXJ0aWVzOiBkZWZpbmVQcm9wZXJ0aWVzXG59KTtcblxuICAvLyBJRSA4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXG52YXIga2V5czEgPSAoJ2NvbnN0cnVjdG9yLGhhc093blByb3BlcnR5LGlzUHJvdG90eXBlT2YscHJvcGVydHlJc0VudW1lcmFibGUsJyArXG4gICAgICAgICAgICAndG9Mb2NhbGVTdHJpbmcsdG9TdHJpbmcsdmFsdWVPZicpLnNwbGl0KCcsJylcbiAgLy8gQWRkaXRpb25hbCBrZXlzIGZvciBnZXRPd25Qcm9wZXJ0eU5hbWVzXG4gICwga2V5czIgPSBrZXlzMS5jb25jYXQoJ2xlbmd0aCcsICdwcm90b3R5cGUnKVxuICAsIGtleXNMZW4xID0ga2V5czEubGVuZ3RoO1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggYG51bGxgIHByb3RvdHlwZTogdXNlIGlmcmFtZSBPYmplY3Qgd2l0aCBjbGVhcmVkIHByb3RvdHlwZVxudmFyIGNyZWF0ZURpY3QgPSBmdW5jdGlvbigpe1xuICAvLyBUaHJhc2gsIHdhc3RlIGFuZCBzb2RvbXk6IElFIEdDIGJ1Z1xuICB2YXIgaWZyYW1lID0gY2VsKCdpZnJhbWUnKVxuICAgICwgaSAgICAgID0ga2V5c0xlbjFcbiAgICAsIGd0ICAgICA9ICc+J1xuICAgICwgaWZyYW1lRG9jdW1lbnQ7XG4gIGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBodG1sLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZS5zcmMgPSAnamF2YXNjcmlwdDonOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNjcmlwdC11cmxcbiAgLy8gY3JlYXRlRGljdCA9IGlmcmFtZS5jb250ZW50V2luZG93Lk9iamVjdDtcbiAgLy8gaHRtbC5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XG4gIGlmcmFtZURvY3VtZW50LndyaXRlKCc8c2NyaXB0PmRvY3VtZW50LkY9T2JqZWN0PC9zY3JpcHQnICsgZ3QpO1xuICBpZnJhbWVEb2N1bWVudC5jbG9zZSgpO1xuICBjcmVhdGVEaWN0ID0gaWZyYW1lRG9jdW1lbnQuRjtcbiAgd2hpbGUoaS0tKWRlbGV0ZSBjcmVhdGVEaWN0LnByb3RvdHlwZVtrZXlzMVtpXV07XG4gIHJldHVybiBjcmVhdGVEaWN0KCk7XG59O1xuZnVuY3Rpb24gY3JlYXRlR2V0S2V5cyhuYW1lcywgbGVuZ3RoKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCl7XG4gICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KG9iamVjdClcbiAgICAgICwgaSAgICAgID0gMFxuICAgICAgLCByZXN1bHQgPSBbXVxuICAgICAgLCBrZXk7XG4gICAgZm9yKGtleSBpbiBPKWlmKGtleSAhPSBJRV9QUk9UTyloYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xuICAgIC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcbiAgICB3aGlsZShsZW5ndGggPiBpKWlmKGhhcyhPLCBrZXkgPSBuYW1lc1tpKytdKSl7XG4gICAgICB+JGluZGV4T2YocmVzdWx0LCBrZXkpIHx8IHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5mdW5jdGlvbiBFbXB0eSgpe31cbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge1xuICAvLyAxOS4xLjIuOSAvIDE1LjIuMy4yIE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxuICBnZXRQcm90b3R5cGVPZjogJC5nZXRQcm90byA9ICQuZ2V0UHJvdG8gfHwgZnVuY3Rpb24oTyl7XG4gICAgTyA9IHRvT2JqZWN0KE8sIHRydWUpO1xuICAgIGlmKGhhcyhPLCBJRV9QUk9UTykpcmV0dXJuIE9bSUVfUFJPVE9dO1xuICAgIGlmKHR5cGVvZiBPLmNvbnN0cnVjdG9yID09ICdmdW5jdGlvbicgJiYgTyBpbnN0YW5jZW9mIE8uY29uc3RydWN0b3Ipe1xuICAgICAgcmV0dXJuIE8uY29uc3RydWN0b3IucHJvdG90eXBlO1xuICAgIH0gcmV0dXJuIE8gaW5zdGFuY2VvZiBPYmplY3QgPyBPYmplY3RQcm90byA6IG51bGw7XG4gIH0sXG4gIC8vIDE5LjEuMi43IC8gMTUuMi4zLjQgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbiAgZ2V0T3duUHJvcGVydHlOYW1lczogJC5nZXROYW1lcyA9ICQuZ2V0TmFtZXMgfHwgY3JlYXRlR2V0S2V5cyhrZXlzMiwga2V5czIubGVuZ3RoLCB0cnVlKSxcbiAgLy8gMTkuMS4yLjIgLyAxNS4yLjMuNSBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG4gIGNyZWF0ZTogJC5jcmVhdGUgPSAkLmNyZWF0ZSB8fCBmdW5jdGlvbihPLCAvKj8qL1Byb3BlcnRpZXMpe1xuICAgIHZhciByZXN1bHQ7XG4gICAgaWYoTyAhPT0gbnVsbCl7XG4gICAgICBFbXB0eS5wcm90b3R5cGUgPSBhbk9iamVjdChPKTtcbiAgICAgIHJlc3VsdCA9IG5ldyBFbXB0eSgpO1xuICAgICAgRW1wdHkucHJvdG90eXBlID0gbnVsbDtcbiAgICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2Ygc2hpbVxuICAgICAgcmVzdWx0W0lFX1BST1RPXSA9IE87XG4gICAgfSBlbHNlIHJlc3VsdCA9IGNyZWF0ZURpY3QoKTtcbiAgICByZXR1cm4gUHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogZGVmaW5lUHJvcGVydGllcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xuICB9LFxuICAvLyAxOS4xLjIuMTQgLyAxNS4yLjMuMTQgT2JqZWN0LmtleXMoTylcbiAga2V5czogJC5nZXRLZXlzID0gJC5nZXRLZXlzIHx8IGNyZWF0ZUdldEtleXMoa2V5czEsIGtleXNMZW4xLCBmYWxzZSksXG4gIC8vIDE5LjEuMi4xNyAvIDE1LjIuMy44IE9iamVjdC5zZWFsKE8pXG4gIHNlYWw6IGZ1bmN0aW9uIHNlYWwoaXQpe1xuICAgIHJldHVybiBpdDsgLy8gPC0gY2FwXG4gIH0sXG4gIC8vIDE5LjEuMi41IC8gMTUuMi4zLjkgT2JqZWN0LmZyZWV6ZShPKVxuICBmcmVlemU6IGZ1bmN0aW9uIGZyZWV6ZShpdCl7XG4gICAgcmV0dXJuIGl0OyAvLyA8LSBjYXBcbiAgfSxcbiAgLy8gMTkuMS4yLjE1IC8gMTUuMi4zLjEwIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyhPKVxuICBwcmV2ZW50RXh0ZW5zaW9uczogZnVuY3Rpb24gcHJldmVudEV4dGVuc2lvbnMoaXQpe1xuICAgIHJldHVybiBpdDsgLy8gPC0gY2FwXG4gIH0sXG4gIC8vIDE5LjEuMi4xMyAvIDE1LjIuMy4xMSBPYmplY3QuaXNTZWFsZWQoTylcbiAgaXNTZWFsZWQ6IGZ1bmN0aW9uIGlzU2VhbGVkKGl0KXtcbiAgICByZXR1cm4gIWlzT2JqZWN0KGl0KTsgLy8gPC0gY2FwXG4gIH0sXG4gIC8vIDE5LjEuMi4xMiAvIDE1LjIuMy4xMiBPYmplY3QuaXNGcm96ZW4oTylcbiAgaXNGcm96ZW46IGZ1bmN0aW9uIGlzRnJvemVuKGl0KXtcbiAgICByZXR1cm4gIWlzT2JqZWN0KGl0KTsgLy8gPC0gY2FwXG4gIH0sXG4gIC8vIDE5LjEuMi4xMSAvIDE1LjIuMy4xMyBPYmplY3QuaXNFeHRlbnNpYmxlKE8pXG4gIGlzRXh0ZW5zaWJsZTogZnVuY3Rpb24gaXNFeHRlbnNpYmxlKGl0KXtcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpOyAvLyA8LSBjYXBcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdChGLCBsZW4sIGFyZ3Mpe1xuICBpZighKGxlbiBpbiBmYWN0b3JpZXMpKXtcbiAgICBmb3IodmFyIG4gPSBbXSwgaSA9IDA7IGkgPCBsZW47IGkrKyluW2ldID0gJ2FbJyArIGkgKyAnXSc7XG4gICAgZmFjdG9yaWVzW2xlbl0gPSBGdW5jdGlvbignRixhJywgJ3JldHVybiBuZXcgRignICsgbi5qb2luKCcsJykgKyAnKScpO1xuICB9XG4gIHJldHVybiBmYWN0b3JpZXNbbGVuXShGLCBhcmdzKTtcbn1cblxuLy8gMTkuMi4zLjIgLyAxNS4zLjQuNSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCh0aGlzQXJnLCBhcmdzLi4uKVxuJGRlZigkZGVmLlAsICdGdW5jdGlvbicsIHtcbiAgYmluZDogZnVuY3Rpb24odGhhdCAvKiwgYXJncy4uLiAqLyl7XG4gICAgdmFyIGZuICAgICAgID0gYUZ1bmN0aW9uKHRoaXMpXG4gICAgICAsIHBhcnRBcmdzID0gX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBmdW5jdGlvbiBib3VuZCgvKiBhcmdzLi4uICovKXtcbiAgICAgIHZhciBhcmdzID0gcGFydEFyZ3MuY29uY2F0KF9zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBib3VuZCA/IGNvbnN0cnVjdChmbiwgYXJncy5sZW5ndGgsIGFyZ3MpIDogaW52b2tlKGZuLCBhcmdzLCB0aGF0KTtcbiAgICB9XG4gICAgaWYoaXNPYmplY3QoZm4ucHJvdG90eXBlKSlib3VuZC5wcm90b3R5cGUgPSBmbi5wcm90b3R5cGU7XG4gICAgcmV0dXJuIGJvdW5kO1xuICB9XG59KTtcblxuLy8gZmFsbGJhY2sgZm9yIG5vdCBhcnJheS1saWtlIEVTMyBzdHJpbmdzIGFuZCBET00gb2JqZWN0c1xudmFyIGJ1Z2d5U2xpY2UgPSB0cnVlO1xudHJ5IHtcbiAgaWYoaHRtbClfc2xpY2UuY2FsbChodG1sKTtcbiAgYnVnZ3lTbGljZSA9IGZhbHNlO1xufSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuXG4kZGVmKCRkZWYuUCArICRkZWYuRiAqIGJ1Z2d5U2xpY2UsICdBcnJheScsIHtcbiAgc2xpY2U6IGZ1bmN0aW9uIHNsaWNlKGJlZ2luLCBlbmQpe1xuICAgIHZhciBsZW4gICA9IHRvTGVuZ3RoKHRoaXMubGVuZ3RoKVxuICAgICAgLCBrbGFzcyA9IGNvZih0aGlzKTtcbiAgICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IGVuZDtcbiAgICBpZihrbGFzcyA9PSAnQXJyYXknKXJldHVybiBfc2xpY2UuY2FsbCh0aGlzLCBiZWdpbiwgZW5kKTtcbiAgICB2YXIgc3RhcnQgID0gdG9JbmRleChiZWdpbiwgbGVuKVxuICAgICAgLCB1cFRvICAgPSB0b0luZGV4KGVuZCwgbGVuKVxuICAgICAgLCBzaXplICAgPSB0b0xlbmd0aCh1cFRvIC0gc3RhcnQpXG4gICAgICAsIGNsb25lZCA9IEFycmF5KHNpemUpXG4gICAgICAsIGkgICAgICA9IDA7XG4gICAgZm9yKDsgaSA8IHNpemU7IGkrKyljbG9uZWRbaV0gPSBrbGFzcyA9PSAnU3RyaW5nJ1xuICAgICAgPyB0aGlzLmNoYXJBdChzdGFydCArIGkpXG4gICAgICA6IHRoaXNbc3RhcnQgKyBpXTtcbiAgICByZXR1cm4gY2xvbmVkO1xuICB9XG59KTtcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogKEVTNU9iamVjdCAhPSBPYmplY3QpLCAnQXJyYXknLCB7XG4gIGpvaW46IGZ1bmN0aW9uIGpvaW4oKXtcbiAgICByZXR1cm4gX2pvaW4uYXBwbHkoRVM1T2JqZWN0KHRoaXMpLCBhcmd1bWVudHMpO1xuICB9XG59KTtcblxuLy8gMjIuMS4yLjIgLyAxNS40LjMuMiBBcnJheS5pc0FycmF5KGFyZylcbiRkZWYoJGRlZi5TLCAnQXJyYXknLCB7aXNBcnJheTogZnVuY3Rpb24oYXJnKXsgcmV0dXJuIGNvZihhcmcpID09ICdBcnJheSc7IH19KTtcblxuZnVuY3Rpb24gY3JlYXRlQXJyYXlSZWR1Y2UoaXNSaWdodCl7XG4gIHJldHVybiBmdW5jdGlvbihjYWxsYmFja2ZuLCBtZW1vKXtcbiAgICBhRnVuY3Rpb24oY2FsbGJhY2tmbik7XG4gICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KHRoaXMpXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxuICAgICAgLCBpbmRleCAgPSBpc1JpZ2h0ID8gbGVuZ3RoIC0gMSA6IDBcbiAgICAgICwgaSAgICAgID0gaXNSaWdodCA/IC0xIDogMTtcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoIDwgMilmb3IoOzspe1xuICAgICAgaWYoaW5kZXggaW4gTyl7XG4gICAgICAgIG1lbW8gPSBPW2luZGV4XTtcbiAgICAgICAgaW5kZXggKz0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpbmRleCArPSBpO1xuICAgICAgaWYoaXNSaWdodCA/IGluZGV4IDwgMCA6IGxlbmd0aCA8PSBpbmRleCl7XG4gICAgICAgIHRocm93IFR5cGVFcnJvcignUmVkdWNlIG9mIGVtcHR5IGFycmF5IHdpdGggbm8gaW5pdGlhbCB2YWx1ZScpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IoO2lzUmlnaHQgPyBpbmRleCA+PSAwIDogbGVuZ3RoID4gaW5kZXg7IGluZGV4ICs9IGkpaWYoaW5kZXggaW4gTyl7XG4gICAgICBtZW1vID0gY2FsbGJhY2tmbihtZW1vLCBPW2luZGV4XSwgaW5kZXgsIHRoaXMpO1xuICAgIH1cbiAgICByZXR1cm4gbWVtbztcbiAgfTtcbn1cbiRkZWYoJGRlZi5QLCAnQXJyYXknLCB7XG4gIC8vIDIyLjEuMy4xMCAvIDE1LjQuNC4xOCBBcnJheS5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxuICBmb3JFYWNoOiAkLmVhY2ggPSAkLmVhY2ggfHwgZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgIHJldHVybiAkZm9yRWFjaCh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xuICB9LFxuICAvLyAyMi4xLjMuMTUgLyAxNS40LjQuMTkgQXJyYXkucHJvdG90eXBlLm1hcChjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxuICBtYXA6IGZ1bmN0aW9uIG1hcChjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgIHJldHVybiAkbWFwKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH0sXG4gIC8vIDIyLjEuMy43IC8gMTUuNC40LjIwIEFycmF5LnByb3RvdHlwZS5maWx0ZXIoY2FsbGJhY2tmbiBbLCB0aGlzQXJnXSlcbiAgZmlsdGVyOiBmdW5jdGlvbiBmaWx0ZXIoY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcbiAgICByZXR1cm4gJGZpbHRlcih0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xuICB9LFxuICAvLyAyMi4xLjMuMjMgLyAxNS40LjQuMTcgQXJyYXkucHJvdG90eXBlLnNvbWUoY2FsbGJhY2tmbiBbLCB0aGlzQXJnXSlcbiAgc29tZTogZnVuY3Rpb24gc29tZShjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgIHJldHVybiAkc29tZSh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xuICB9LFxuICAvLyAyMi4xLjMuNSAvIDE1LjQuNC4xNiBBcnJheS5wcm90b3R5cGUuZXZlcnkoY2FsbGJhY2tmbiBbLCB0aGlzQXJnXSlcbiAgZXZlcnk6IGZ1bmN0aW9uIGV2ZXJ5KGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgcmV0dXJuICRldmVyeSh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xuICB9LFxuICAvLyAyMi4xLjMuMTggLyAxNS40LjQuMjEgQXJyYXkucHJvdG90eXBlLnJlZHVjZShjYWxsYmFja2ZuIFssIGluaXRpYWxWYWx1ZV0pXG4gIHJlZHVjZTogY3JlYXRlQXJyYXlSZWR1Y2UoZmFsc2UpLFxuICAvLyAyMi4xLjMuMTkgLyAxNS40LjQuMjIgQXJyYXkucHJvdG90eXBlLnJlZHVjZVJpZ2h0KGNhbGxiYWNrZm4gWywgaW5pdGlhbFZhbHVlXSlcbiAgcmVkdWNlUmlnaHQ6IGNyZWF0ZUFycmF5UmVkdWNlKHRydWUpLFxuICAvLyAyMi4xLjMuMTEgLyAxNS40LjQuMTQgQXJyYXkucHJvdG90eXBlLmluZGV4T2Yoc2VhcmNoRWxlbWVudCBbLCBmcm9tSW5kZXhdKVxuICBpbmRleE9mOiBmdW5jdGlvbiBpbmRleE9mKGVsIC8qLCBmcm9tSW5kZXggPSAwICovKXtcbiAgICByZXR1cm4gJGluZGV4T2YodGhpcywgZWwsIGFyZ3VtZW50c1sxXSk7XG4gIH0sXG4gIC8vIDIyLjEuMy4xNCAvIDE1LjQuNC4xNSBBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2Yoc2VhcmNoRWxlbWVudCBbLCBmcm9tSW5kZXhdKVxuICBsYXN0SW5kZXhPZjogZnVuY3Rpb24gbGFzdEluZGV4T2YoZWwsIGZyb21JbmRleCAvKiA9IEBbKi0xXSAqLyl7XG4gICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KHRoaXMpXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxuICAgICAgLCBpbmRleCAgPSBsZW5ndGggLSAxO1xuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGggPiAxKWluZGV4ID0gTWF0aC5taW4oaW5kZXgsIHRvSW50ZWdlcihmcm9tSW5kZXgpKTtcbiAgICBpZihpbmRleCA8IDApaW5kZXggPSB0b0xlbmd0aChsZW5ndGggKyBpbmRleCk7XG4gICAgZm9yKDtpbmRleCA+PSAwOyBpbmRleC0tKWlmKGluZGV4IGluIE8paWYoT1tpbmRleF0gPT09IGVsKXJldHVybiBpbmRleDtcbiAgICByZXR1cm4gLTE7XG4gIH1cbn0pO1xuXG4vLyAyMS4xLjMuMjUgLyAxNS41LjQuMjAgU3RyaW5nLnByb3RvdHlwZS50cmltKClcbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge3RyaW06IGZ1bmN0aW9uIHRyaW0oKXsgcmV0dXJuICR0cmltKHRoaXMpOyB9fSk7XG5cbi8vIDIwLjMuMy4xIC8gMTUuOS40LjQgRGF0ZS5ub3coKVxuJGRlZigkZGVmLlMsICdEYXRlJywge25vdzogZnVuY3Rpb24gbm93KCl7IHJldHVybiArbmV3IERhdGU7IH19KTtcblxuZnVuY3Rpb24gbHoobnVtKXtcbiAgcmV0dXJuIG51bSA+IDkgPyBudW0gOiAnMCcgKyBudW07XG59XG5cbi8vIDIwLjMuNC4zNiAvIDE1LjkuNS40MyBEYXRlLnByb3RvdHlwZS50b0lTT1N0cmluZygpXG4vLyBQaGFudG9tSlMgYW5kIG9sZCB3ZWJraXQgaGFkIGEgYnJva2VuIERhdGUgaW1wbGVtZW50YXRpb24uXG52YXIgZGF0ZSAgICAgICA9IG5ldyBEYXRlKC01ZTEzIC0gMSlcbiAgLCBicm9rZW5EYXRlID0gIShkYXRlLnRvSVNPU3RyaW5nICYmIGRhdGUudG9JU09TdHJpbmcoKSA9PSAnMDM4NS0wNy0yNVQwNzowNjozOS45OTlaJ1xuICAgICAgJiYgcmVxdWlyZSgnLi8kLnRocm93cycpKGZ1bmN0aW9uKCl7IG5ldyBEYXRlKE5hTikudG9JU09TdHJpbmcoKTsgfSkpO1xuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiBicm9rZW5EYXRlLCAnRGF0ZScsIHtcbiAgdG9JU09TdHJpbmc6IGZ1bmN0aW9uIHRvSVNPU3RyaW5nKCl7XG4gICAgaWYoIWlzRmluaXRlKHRoaXMpKXRocm93IFJhbmdlRXJyb3IoJ0ludmFsaWQgdGltZSB2YWx1ZScpO1xuICAgIHZhciBkID0gdGhpc1xuICAgICAgLCB5ID0gZC5nZXRVVENGdWxsWWVhcigpXG4gICAgICAsIG0gPSBkLmdldFVUQ01pbGxpc2Vjb25kcygpXG4gICAgICAsIHMgPSB5IDwgMCA/ICctJyA6IHkgPiA5OTk5ID8gJysnIDogJyc7XG4gICAgcmV0dXJuIHMgKyAoJzAwMDAwJyArIE1hdGguYWJzKHkpKS5zbGljZShzID8gLTYgOiAtNCkgK1xuICAgICAgJy0nICsgbHooZC5nZXRVVENNb250aCgpICsgMSkgKyAnLScgKyBseihkLmdldFVUQ0RhdGUoKSkgK1xuICAgICAgJ1QnICsgbHooZC5nZXRVVENIb3VycygpKSArICc6JyArIGx6KGQuZ2V0VVRDTWludXRlcygpKSArXG4gICAgICAnOicgKyBseihkLmdldFVUQ1NlY29uZHMoKSkgKyAnLicgKyAobSA+IDk5ID8gbSA6ICcwJyArIGx6KG0pKSArICdaJztcbiAgfVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICRkZWYgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgdG9PYmplY3QgPSByZXF1aXJlKCcuLyQudG8tb2JqZWN0JylcbiAgLCB0b0luZGV4ICA9IHJlcXVpcmUoJy4vJC50by1pbmRleCcpXG4gICwgdG9MZW5ndGggPSByZXF1aXJlKCcuLyQudG8tbGVuZ3RoJyk7XG4kZGVmKCRkZWYuUCwgJ0FycmF5Jywge1xuICAvLyAyMi4xLjMuMyBBcnJheS5wcm90b3R5cGUuY29weVdpdGhpbih0YXJnZXQsIHN0YXJ0LCBlbmQgPSB0aGlzLmxlbmd0aClcbiAgY29weVdpdGhpbjogZnVuY3Rpb24gY29weVdpdGhpbih0YXJnZXQvKiA9IDAgKi8sIHN0YXJ0IC8qID0gMCwgZW5kID0gQGxlbmd0aCAqLyl7XG4gICAgdmFyIE8gICAgID0gdG9PYmplY3QodGhpcywgdHJ1ZSlcbiAgICAgICwgbGVuICAgPSB0b0xlbmd0aChPLmxlbmd0aClcbiAgICAgICwgdG8gICAgPSB0b0luZGV4KHRhcmdldCwgbGVuKVxuICAgICAgLCBmcm9tICA9IHRvSW5kZXgoc3RhcnQsIGxlbilcbiAgICAgICwgZW5kICAgPSBhcmd1bWVudHNbMl1cbiAgICAgICwgZmluICAgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IHRvSW5kZXgoZW5kLCBsZW4pXG4gICAgICAsIGNvdW50ID0gTWF0aC5taW4oZmluIC0gZnJvbSwgbGVuIC0gdG8pXG4gICAgICAsIGluYyAgID0gMTtcbiAgICBpZihmcm9tIDwgdG8gJiYgdG8gPCBmcm9tICsgY291bnQpe1xuICAgICAgaW5jICA9IC0xO1xuICAgICAgZnJvbSA9IGZyb20gKyBjb3VudCAtIDE7XG4gICAgICB0byAgID0gdG8gICArIGNvdW50IC0gMTtcbiAgICB9XG4gICAgd2hpbGUoY291bnQtLSA+IDApe1xuICAgICAgaWYoZnJvbSBpbiBPKU9bdG9dID0gT1tmcm9tXTtcbiAgICAgIGVsc2UgZGVsZXRlIE9bdG9dO1xuICAgICAgdG8gICArPSBpbmM7XG4gICAgICBmcm9tICs9IGluYztcbiAgICB9IHJldHVybiBPO1xuICB9XG59KTtcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoJ2NvcHlXaXRoaW4nKTsiLCIndXNlIHN0cmljdCc7XG52YXIgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCB0b09iamVjdCA9IHJlcXVpcmUoJy4vJC50by1vYmplY3QnKVxuICAsIHRvSW5kZXggID0gcmVxdWlyZSgnLi8kLnRvLWluZGV4JylcbiAgLCB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vJC50by1sZW5ndGgnKTtcbiRkZWYoJGRlZi5QLCAnQXJyYXknLCB7XG4gIC8vIDIyLjEuMy42IEFycmF5LnByb3RvdHlwZS5maWxsKHZhbHVlLCBzdGFydCA9IDAsIGVuZCA9IHRoaXMubGVuZ3RoKVxuICBmaWxsOiBmdW5jdGlvbiBmaWxsKHZhbHVlIC8qLCBzdGFydCA9IDAsIGVuZCA9IEBsZW5ndGggKi8pe1xuICAgIHZhciBPICAgICAgPSB0b09iamVjdCh0aGlzLCB0cnVlKVxuICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aClcbiAgICAgICwgaW5kZXggID0gdG9JbmRleChhcmd1bWVudHNbMV0sIGxlbmd0aClcbiAgICAgICwgZW5kICAgID0gYXJndW1lbnRzWzJdXG4gICAgICAsIGVuZFBvcyA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuZ3RoIDogdG9JbmRleChlbmQsIGxlbmd0aCk7XG4gICAgd2hpbGUoZW5kUG9zID4gaW5kZXgpT1tpbmRleCsrXSA9IHZhbHVlO1xuICAgIHJldHVybiBPO1xuICB9XG59KTtcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoJ2ZpbGwnKTsiLCIndXNlIHN0cmljdCc7XG4vLyAyMi4xLjMuOSBBcnJheS5wcm90b3R5cGUuZmluZEluZGV4KHByZWRpY2F0ZSwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbnZhciBLRVkgICAgPSAnZmluZEluZGV4J1xuICAsICRkZWYgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGZvcmNlZCA9IHRydWVcbiAgLCAkZmluZCAgPSByZXF1aXJlKCcuLyQuYXJyYXktbWV0aG9kcycpKDYpO1xuLy8gU2hvdWxkbid0IHNraXAgaG9sZXNcbmlmKEtFWSBpbiBbXSlBcnJheSgxKVtLRVldKGZ1bmN0aW9uKCl7IGZvcmNlZCA9IGZhbHNlOyB9KTtcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogZm9yY2VkLCAnQXJyYXknLCB7XG4gIGZpbmRJbmRleDogZnVuY3Rpb24gZmluZEluZGV4KGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgcmV0dXJuICRmaW5kKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH1cbn0pO1xucmVxdWlyZSgnLi8kLnVuc2NvcGUnKShLRVkpOyIsIid1c2Ugc3RyaWN0Jztcbi8vIDIyLjEuMy44IEFycmF5LnByb3RvdHlwZS5maW5kKHByZWRpY2F0ZSwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbnZhciBLRVkgICAgPSAnZmluZCdcbiAgLCAkZGVmICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBmb3JjZWQgPSB0cnVlXG4gICwgJGZpbmQgID0gcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKSg1KTtcbi8vIFNob3VsZG4ndCBza2lwIGhvbGVzXG5pZihLRVkgaW4gW10pQXJyYXkoMSlbS0VZXShmdW5jdGlvbigpeyBmb3JjZWQgPSBmYWxzZTsgfSk7XG4kZGVmKCRkZWYuUCArICRkZWYuRiAqIGZvcmNlZCwgJ0FycmF5Jywge1xuICBmaW5kOiBmdW5jdGlvbiBmaW5kKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgcmV0dXJuICRmaW5kKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH1cbn0pO1xucmVxdWlyZSgnLi8kLnVuc2NvcGUnKShLRVkpOyIsInZhciBjdHggICAgICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsICRkZWYgICAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgdG9PYmplY3QgICAgPSByZXF1aXJlKCcuLyQudG8tb2JqZWN0JylcbiAgLCBjYWxsICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyLWNhbGwnKVxuICAsIGlzQXJyYXlJdGVyID0gcmVxdWlyZSgnLi8kLmlzLWFycmF5LWl0ZXInKVxuICAsIHRvTGVuZ3RoICAgID0gcmVxdWlyZSgnLi8kLnRvLWxlbmd0aCcpXG4gICwgZ2V0SXRlckZuICAgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhcmVxdWlyZSgnLi8kLml0ZXItZGV0ZWN0JykoZnVuY3Rpb24oaXRlcil7IEFycmF5LmZyb20oaXRlcik7IH0pLCAnQXJyYXknLCB7XG4gIC8vIDIyLjEuMi4xIEFycmF5LmZyb20oYXJyYXlMaWtlLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgZnJvbTogZnVuY3Rpb24gZnJvbShhcnJheUxpa2UvKiwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQqLyl7XG4gICAgdmFyIE8gICAgICAgPSB0b09iamVjdChhcnJheUxpa2UsIHRydWUpXG4gICAgICAsIEMgICAgICAgPSB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5XG4gICAgICAsIG1hcGZuICAgPSBhcmd1bWVudHNbMV1cbiAgICAgICwgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWRcbiAgICAgICwgaW5kZXggICA9IDBcbiAgICAgICwgaXRlckZuICA9IGdldEl0ZXJGbihPKVxuICAgICAgLCBsZW5ndGgsIHJlc3VsdCwgc3RlcCwgaXRlcmF0b3I7XG4gICAgaWYobWFwcGluZyltYXBmbiA9IGN0eChtYXBmbiwgYXJndW1lbnRzWzJdLCAyKTtcbiAgICAvLyBpZiBvYmplY3QgaXNuJ3QgaXRlcmFibGUgb3IgaXQncyBhcnJheSB3aXRoIGRlZmF1bHQgaXRlcmF0b3IgLSB1c2Ugc2ltcGxlIGNhc2VcbiAgICBpZihpdGVyRm4gIT0gdW5kZWZpbmVkICYmICEoQyA9PSBBcnJheSAmJiBpc0FycmF5SXRlcihpdGVyRm4pKSl7XG4gICAgICBmb3IoaXRlcmF0b3IgPSBpdGVyRm4uY2FsbChPKSwgcmVzdWx0ID0gbmV3IEM7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgaW5kZXgrKyl7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gY2FsbChpdGVyYXRvciwgbWFwZm4sIFtzdGVwLnZhbHVlLCBpbmRleF0sIHRydWUpIDogc3RlcC52YWx1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yKHJlc3VsdCA9IG5ldyBDKGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKSk7IGxlbmd0aCA+IGluZGV4OyBpbmRleCsrKXtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBtYXBmbihPW2luZGV4XSwgaW5kZXgpIDogT1tpbmRleF07XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5sZW5ndGggPSBpbmRleDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59KTsiLCJ2YXIgc2V0VW5zY29wZSA9IHJlcXVpcmUoJy4vJC51bnNjb3BlJylcbiAgLCBzdGVwICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItc3RlcCcpXG4gICwgSXRlcmF0b3JzICA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKVxuICAsIHRvT2JqZWN0ICAgPSByZXF1aXJlKCcuLyQudG8tb2JqZWN0Jyk7XG5cbi8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcbi8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXG4vLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXG4vLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKEFycmF5LCAnQXJyYXknLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gIHRoaXMuX3QgPSB0b09iamVjdChpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgICAvLyBuZXh0IGluZGV4XG4gIHRoaXMuX2sgPSBraW5kOyAgICAgICAgICAgICAgIC8vIGtpbmRcbi8vIDIyLjEuNS4yLjEgJUFycmF5SXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIE8gICAgID0gdGhpcy5fdFxuICAgICwga2luZCAgPSB0aGlzLl9rXG4gICAgLCBpbmRleCA9IHRoaXMuX2krKztcbiAgaWYoIU8gfHwgaW5kZXggPj0gTy5sZW5ndGgpe1xuICAgIHRoaXMuX3QgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHN0ZXAoMSk7XG4gIH1cbiAgaWYoa2luZCA9PSAna2V5cycgIClyZXR1cm4gc3RlcCgwLCBpbmRleCk7XG4gIGlmKGtpbmQgPT0gJ3ZhbHVlcycpcmV0dXJuIHN0ZXAoMCwgT1tpbmRleF0pO1xuICByZXR1cm4gc3RlcCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XG59LCAndmFsdWVzJyk7XG5cbi8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJSAoOS40LjQuNiwgOS40LjQuNylcbkl0ZXJhdG9ycy5Bcmd1bWVudHMgPSBJdGVyYXRvcnMuQXJyYXk7XG5cbnNldFVuc2NvcGUoJ2tleXMnKTtcbnNldFVuc2NvcGUoJ3ZhbHVlcycpO1xuc2V0VW5zY29wZSgnZW50cmllcycpOyIsInZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuJGRlZigkZGVmLlMsICdBcnJheScsIHtcbiAgLy8gMjIuMS4yLjMgQXJyYXkub2YoIC4uLml0ZW1zKVxuICBvZjogZnVuY3Rpb24gb2YoLyogLi4uYXJncyAqLyl7XG4gICAgdmFyIGluZGV4ICA9IDBcbiAgICAgICwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgLCByZXN1bHQgPSBuZXcgKHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXkpKGxlbmd0aCk7XG4gICAgd2hpbGUobGVuZ3RoID4gaW5kZXgpcmVzdWx0W2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleCsrXTtcbiAgICByZXN1bHQubGVuZ3RoID0gbGVuZ3RoO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0pOyIsInJlcXVpcmUoJy4vJC5zcGVjaWVzJykoQXJyYXkpOyIsInZhciAkICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBpc09iamVjdCAgICAgID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpXG4gICwgSEFTX0lOU1RBTkNFICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaGFzSW5zdGFuY2UnKVxuICAsIEZ1bmN0aW9uUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG4vLyAxOS4yLjMuNiBGdW5jdGlvbi5wcm90b3R5cGVbQEBoYXNJbnN0YW5jZV0oVilcbmlmKCEoSEFTX0lOU1RBTkNFIGluIEZ1bmN0aW9uUHJvdG8pKSQuc2V0RGVzYyhGdW5jdGlvblByb3RvLCBIQVNfSU5TVEFOQ0UsIHt2YWx1ZTogZnVuY3Rpb24oTyl7XG4gIGlmKHR5cGVvZiB0aGlzICE9ICdmdW5jdGlvbicgfHwgIWlzT2JqZWN0KE8pKXJldHVybiBmYWxzZTtcbiAgaWYoIWlzT2JqZWN0KHRoaXMucHJvdG90eXBlKSlyZXR1cm4gTyBpbnN0YW5jZW9mIHRoaXM7XG4gIC8vIGZvciBlbnZpcm9ubWVudCB3L28gbmF0aXZlIGBAQGhhc0luc3RhbmNlYCBsb2dpYyBlbm91Z2ggYGluc3RhbmNlb2ZgLCBidXQgYWRkIHRoaXM6XG4gIHdoaWxlKE8gPSAkLmdldFByb3RvKE8pKWlmKHRoaXMucHJvdG90eXBlID09PSBPKXJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59fSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGhhcyAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaGFzJylcbiAgLCBjcmVhdGVEZXNjICAgID0gcmVxdWlyZSgnLi8kLnByb3BlcnR5LWRlc2MnKVxuICAsIHNldERlc2MgICAgICAgPSAkLnNldERlc2NcbiAgLCBGdW5jdGlvblByb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlXG4gICwgTkFNRSAgICAgICAgICA9ICduYW1lJztcbi8vIDE5LjIuNC4yIG5hbWVcbk5BTUUgaW4gRnVuY3Rpb25Qcm90byB8fCByZXF1aXJlKCcuLyQuc3VwcG9ydC1kZXNjJykgJiYgc2V0RGVzYyhGdW5jdGlvblByb3RvLCBOQU1FLCB7XG4gIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbigpe1xuICAgIHZhciBtYXRjaCA9IFN0cmluZyh0aGlzKS5tYXRjaCgvXlxccypmdW5jdGlvbiAoW14gKF0qKS8pXG4gICAgICAsIG5hbWUgID0gbWF0Y2ggPyBtYXRjaFsxXSA6ICcnO1xuICAgIGhhcyh0aGlzLCBOQU1FKSB8fCBzZXREZXNjKHRoaXMsIE5BTUUsIGNyZWF0ZURlc2MoNSwgbmFtZSkpO1xuICAgIHJldHVybiBuYW1lO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICBoYXModGhpcywgTkFNRSkgfHwgc2V0RGVzYyh0aGlzLCBOQU1FLCBjcmVhdGVEZXNjKDAsIHZhbHVlKSk7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciBzdHJvbmcgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi1zdHJvbmcnKTtcblxuLy8gMjMuMSBNYXAgT2JqZWN0c1xucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnTWFwJywgZnVuY3Rpb24oZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uIE1hcCgpeyByZXR1cm4gZ2V0KHRoaXMsIGFyZ3VtZW50c1swXSk7IH07XG59LCB7XG4gIC8vIDIzLjEuMy42IE1hcC5wcm90b3R5cGUuZ2V0KGtleSlcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoa2V5KXtcbiAgICB2YXIgZW50cnkgPSBzdHJvbmcuZ2V0RW50cnkodGhpcywga2V5KTtcbiAgICByZXR1cm4gZW50cnkgJiYgZW50cnkudjtcbiAgfSxcbiAgLy8gMjMuMS4zLjkgTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcbiAgc2V0OiBmdW5jdGlvbiBzZXQoa2V5LCB2YWx1ZSl7XG4gICAgcmV0dXJuIHN0cm9uZy5kZWYodGhpcywga2V5ID09PSAwID8gMCA6IGtleSwgdmFsdWUpO1xuICB9XG59LCBzdHJvbmcsIHRydWUpOyIsIi8vIDIwLjIuMi4zIE1hdGguYWNvc2goeClcbnZhciAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIEUgICAgID0gTWF0aC5FXG4gICwgc3FydCAgPSBNYXRoLnNxcnQ7XG5cbiRkZWYoJGRlZi5TLCAnTWF0aCcsIHtcbiAgYWNvc2g6IGZ1bmN0aW9uIGFjb3NoKHgpe1xuICAgIHJldHVybiAoeCA9ICt4KSA8IDEgPyBOYU4gOiBpc0Zpbml0ZSh4KVxuICAgICAgPyBNYXRoLmxvZyh4IC8gRSArIHNxcnQoeCArIDEpICogc3FydCh4IC0gMSkgLyBFKSArIDEgOiB4O1xuICB9XG59KTsiLCIvLyAyMC4yLjIuNSBNYXRoLmFzaW5oKHgpXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcblxuZnVuY3Rpb24gYXNpbmgoeCl7XG4gIHJldHVybiAhaXNGaW5pdGUoeCA9ICt4KSB8fCB4ID09IDAgPyB4IDogeCA8IDAgPyAtYXNpbmgoLXgpIDogTWF0aC5sb2coeCArIE1hdGguc3FydCh4ICogeCArIDEpKTtcbn1cblxuJGRlZigkZGVmLlMsICdNYXRoJywge2FzaW5oOiBhc2luaH0pOyIsIi8vIDIwLjIuMi43IE1hdGguYXRhbmgoeClcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuXG4kZGVmKCRkZWYuUywgJ01hdGgnLCB7XG4gIGF0YW5oOiBmdW5jdGlvbiBhdGFuaCh4KXtcbiAgICByZXR1cm4gKHggPSAreCkgPT0gMCA/IHggOiBNYXRoLmxvZygoMSArIHgpIC8gKDEgLSB4KSkgLyAyO1xuICB9XG59KTsiLCIvLyAyMC4yLjIuOSBNYXRoLmNicnQoeClcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgc2lnbiA9IHJlcXVpcmUoJy4vJC5zaWduJyk7XG5cbiRkZWYoJGRlZi5TLCAnTWF0aCcsIHtcbiAgY2JydDogZnVuY3Rpb24gY2JydCh4KXtcbiAgICByZXR1cm4gc2lnbih4ID0gK3gpICogTWF0aC5wb3coTWF0aC5hYnMoeCksIDEgLyAzKTtcbiAgfVxufSk7IiwiLy8gMjAuMi4yLjExIE1hdGguY2x6MzIoeClcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuXG4kZGVmKCRkZWYuUywgJ01hdGgnLCB7XG4gIGNsejMyOiBmdW5jdGlvbiBjbHozMih4KXtcbiAgICByZXR1cm4gKHggPj4+PSAwKSA/IDMxIC0gTWF0aC5mbG9vcihNYXRoLmxvZyh4ICsgMC41KSAqIE1hdGguTE9HMkUpIDogMzI7XG4gIH1cbn0pOyIsIi8vIDIwLjIuMi4xMiBNYXRoLmNvc2goeClcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgZXhwICA9IE1hdGguZXhwO1xuXG4kZGVmKCRkZWYuUywgJ01hdGgnLCB7XG4gIGNvc2g6IGZ1bmN0aW9uIGNvc2goeCl7XG4gICAgcmV0dXJuIChleHAoeCA9ICt4KSArIGV4cCgteCkpIC8gMjtcbiAgfVxufSk7IiwiLy8gMjAuMi4yLjE0IE1hdGguZXhwbTEoeClcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuXG4kZGVmKCRkZWYuUywgJ01hdGgnLCB7ZXhwbTE6IHJlcXVpcmUoJy4vJC5leHBtMScpfSk7IiwiLy8gMjAuMi4yLjE2IE1hdGguZnJvdW5kKHgpXG52YXIgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBzaWduICA9IHJlcXVpcmUoJy4vJC5zaWduJylcbiAgLCBwb3cgICA9IE1hdGgucG93XG4gICwgRVBTSUxPTiAgID0gcG93KDIsIC01MilcbiAgLCBFUFNJTE9OMzIgPSBwb3coMiwgLTIzKVxuICAsIE1BWDMyICAgICA9IHBvdygyLCAxMjcpICogKDIgLSBFUFNJTE9OMzIpXG4gICwgTUlOMzIgICAgID0gcG93KDIsIC0xMjYpO1xuXG5mdW5jdGlvbiByb3VuZFRpZXNUb0V2ZW4obil7XG4gIHJldHVybiBuICsgMSAvIEVQU0lMT04gLSAxIC8gRVBTSUxPTjtcbn1cblxuXG4kZGVmKCRkZWYuUywgJ01hdGgnLCB7XG4gIGZyb3VuZDogZnVuY3Rpb24gZnJvdW5kKHgpe1xuICAgIHZhciAkYWJzICA9IE1hdGguYWJzKHgpXG4gICAgICAsICRzaWduID0gc2lnbih4KVxuICAgICAgLCBhLCByZXN1bHQ7XG4gICAgaWYoJGFicyA8IE1JTjMyKXJldHVybiAkc2lnbiAqIHJvdW5kVGllc1RvRXZlbigkYWJzIC8gTUlOMzIgLyBFUFNJTE9OMzIpICogTUlOMzIgKiBFUFNJTE9OMzI7XG4gICAgYSA9ICgxICsgRVBTSUxPTjMyIC8gRVBTSUxPTikgKiAkYWJzO1xuICAgIHJlc3VsdCA9IGEgLSAoYSAtICRhYnMpO1xuICAgIGlmKHJlc3VsdCA+IE1BWDMyIHx8IHJlc3VsdCAhPSByZXN1bHQpcmV0dXJuICRzaWduICogSW5maW5pdHk7XG4gICAgcmV0dXJuICRzaWduICogcmVzdWx0O1xuICB9XG59KTsiLCIvLyAyMC4yLjIuMTcgTWF0aC5oeXBvdChbdmFsdWUxWywgdmFsdWUyWywg4oCmIF1dXSlcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgYWJzICA9IE1hdGguYWJzO1xuXG4kZGVmKCRkZWYuUywgJ01hdGgnLCB7XG4gIGh5cG90OiBmdW5jdGlvbiBoeXBvdCh2YWx1ZTEsIHZhbHVlMil7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICB2YXIgc3VtICA9IDBcbiAgICAgICwgaSAgICA9IDBcbiAgICAgICwgbGVuICA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgICwgbGFyZyA9IDBcbiAgICAgICwgYXJnLCBkaXY7XG4gICAgd2hpbGUoaSA8IGxlbil7XG4gICAgICBhcmcgPSBhYnMoYXJndW1lbnRzW2krK10pO1xuICAgICAgaWYobGFyZyA8IGFyZyl7XG4gICAgICAgIGRpdiAgPSBsYXJnIC8gYXJnO1xuICAgICAgICBzdW0gID0gc3VtICogZGl2ICogZGl2ICsgMTtcbiAgICAgICAgbGFyZyA9IGFyZztcbiAgICAgIH0gZWxzZSBpZihhcmcgPiAwKXtcbiAgICAgICAgZGl2ICA9IGFyZyAvIGxhcmc7XG4gICAgICAgIHN1bSArPSBkaXYgKiBkaXY7XG4gICAgICB9IGVsc2Ugc3VtICs9IGFyZztcbiAgICB9XG4gICAgcmV0dXJuIGxhcmcgPT09IEluZmluaXR5ID8gSW5maW5pdHkgOiBsYXJnICogTWF0aC5zcXJ0KHN1bSk7XG4gIH1cbn0pOyIsIi8vIDIwLjIuMi4xOCBNYXRoLmltdWwoeCwgeSlcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuXG4kZGVmKCRkZWYuUywgJ01hdGgnLCB7XG4gIGltdWw6IGZ1bmN0aW9uIGltdWwoeCwgeSl7XG4gICAgdmFyIFVJTlQxNiA9IDB4ZmZmZlxuICAgICAgLCB4biA9ICt4XG4gICAgICAsIHluID0gK3lcbiAgICAgICwgeGwgPSBVSU5UMTYgJiB4blxuICAgICAgLCB5bCA9IFVJTlQxNiAmIHluO1xuICAgIHJldHVybiAwIHwgeGwgKiB5bCArICgoVUlOVDE2ICYgeG4gPj4+IDE2KSAqIHlsICsgeGwgKiAoVUlOVDE2ICYgeW4gPj4+IDE2KSA8PCAxNiA+Pj4gMCk7XG4gIH1cbn0pOyIsIi8vIDIwLjIuMi4yMSBNYXRoLmxvZzEwKHgpXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcblxuJGRlZigkZGVmLlMsICdNYXRoJywge1xuICBsb2cxMDogZnVuY3Rpb24gbG9nMTAoeCl7XG4gICAgcmV0dXJuIE1hdGgubG9nKHgpIC8gTWF0aC5MTjEwO1xuICB9XG59KTsiLCIvLyAyMC4yLjIuMjAgTWF0aC5sb2cxcCh4KVxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG5cbiRkZWYoJGRlZi5TLCAnTWF0aCcsIHtcbiAgbG9nMXA6IGZ1bmN0aW9uIGxvZzFwKHgpe1xuICAgIHJldHVybiAoeCA9ICt4KSA+IC0xZS04ICYmIHggPCAxZS04ID8geCAtIHggKiB4IC8gMiA6IE1hdGgubG9nKDEgKyB4KTtcbiAgfVxufSk7IiwiLy8gMjAuMi4yLjIyIE1hdGgubG9nMih4KVxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG5cbiRkZWYoJGRlZi5TLCAnTWF0aCcsIHtcbiAgbG9nMjogZnVuY3Rpb24gbG9nMih4KXtcbiAgICByZXR1cm4gTWF0aC5sb2coeCkgLyBNYXRoLkxOMjtcbiAgfVxufSk7IiwiLy8gMjAuMi4yLjI4IE1hdGguc2lnbih4KVxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG5cbiRkZWYoJGRlZi5TLCAnTWF0aCcsIHtzaWduOiByZXF1aXJlKCcuLyQuc2lnbicpfSk7IiwiLy8gMjAuMi4yLjMwIE1hdGguc2luaCh4KVxudmFyICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgZXhwbTEgPSByZXF1aXJlKCcuLyQuZXhwbTEnKVxuICAsIGV4cCAgID0gTWF0aC5leHA7XG5cbiRkZWYoJGRlZi5TLCAnTWF0aCcsIHtcbiAgc2luaDogZnVuY3Rpb24gc2luaCh4KXtcbiAgICByZXR1cm4gTWF0aC5hYnMoeCA9ICt4KSA8IDFcbiAgICAgID8gKGV4cG0xKHgpIC0gZXhwbTEoLXgpKSAvIDJcbiAgICAgIDogKGV4cCh4IC0gMSkgLSBleHAoLXggLSAxKSkgKiAoTWF0aC5FIC8gMik7XG4gIH1cbn0pOyIsIi8vIDIwLjIuMi4zMyBNYXRoLnRhbmgoeClcbnZhciAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGV4cG0xID0gcmVxdWlyZSgnLi8kLmV4cG0xJylcbiAgLCBleHAgICA9IE1hdGguZXhwO1xuXG4kZGVmKCRkZWYuUywgJ01hdGgnLCB7XG4gIHRhbmg6IGZ1bmN0aW9uIHRhbmgoeCl7XG4gICAgdmFyIGEgPSBleHBtMSh4ID0gK3gpXG4gICAgICAsIGIgPSBleHBtMSgteCk7XG4gICAgcmV0dXJuIGEgPT0gSW5maW5pdHkgPyAxIDogYiA9PSBJbmZpbml0eSA/IC0xIDogKGEgLSBiKSAvIChleHAoeCkgKyBleHAoLXgpKTtcbiAgfVxufSk7IiwiLy8gMjAuMi4yLjM0IE1hdGgudHJ1bmMoeClcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuXG4kZGVmKCRkZWYuUywgJ01hdGgnLCB7XG4gIHRydW5jOiBmdW5jdGlvbiB0cnVuYyhpdCl7XG4gICAgcmV0dXJuIChpdCA+IDAgPyBNYXRoLmZsb29yIDogTWF0aC5jZWlsKShpdCk7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBnbG9iYWwgICAgID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgaGFzICAgICAgICA9IHJlcXVpcmUoJy4vJC5oYXMnKVxuICAsIGNvZiAgICAgICAgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCBpc09iamVjdCAgID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpXG4gICwgTlVNQkVSICAgICA9ICdOdW1iZXInXG4gICwgJE51bWJlciAgICA9IGdsb2JhbFtOVU1CRVJdXG4gICwgQmFzZSAgICAgICA9ICROdW1iZXJcbiAgLCBwcm90byAgICAgID0gJE51bWJlci5wcm90b3R5cGVcbiAgLy8gT3BlcmEgfjEyIGhhcyBicm9rZW4gT2JqZWN0I3RvU3RyaW5nXG4gICwgZmFrZU51bWJlciA9IGNvZigkLmNyZWF0ZShwcm90bykpID09IE5VTUJFUlxuICAgID8gZnVuY3Rpb24oaXQpeyB0cnkgeyBwcm90by52YWx1ZU9mLmNhbGwoaXQpOyByZXR1cm4gZmFsc2U7IH0gY2F0Y2goZSl7IHJldHVybiB0cnVlOyB9IH1cbiAgICA6IGZ1bmN0aW9uKGl0KXsgcmV0dXJuIGNvZihpdCkgIT0gTlVNQkVSOyB9O1xuZnVuY3Rpb24gdG9QcmltaXRpdmUoaXQpe1xuICB2YXIgZm4sIHZhbDtcbiAgaWYodHlwZW9mIChmbiA9IGl0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICBpZih0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBudW1iZXJcIik7XG59XG5mdW5jdGlvbiB0b051bWJlcihpdCl7XG4gIGlmKGlzT2JqZWN0KGl0KSlpdCA9IHRvUHJpbWl0aXZlKGl0KTtcbiAgaWYodHlwZW9mIGl0ID09ICdzdHJpbmcnICYmIGl0Lmxlbmd0aCA+IDIgJiYgaXQuY2hhckNvZGVBdCgwKSA9PSA0OCl7XG4gICAgdmFyIGJpbmFyeSA9IGZhbHNlO1xuICAgIHN3aXRjaChpdC5jaGFyQ29kZUF0KDEpKXtcbiAgICAgIGNhc2UgNjYgOiBjYXNlIDk4ICA6IGJpbmFyeSA9IHRydWU7XG4gICAgICBjYXNlIDc5IDogY2FzZSAxMTEgOiByZXR1cm4gcGFyc2VJbnQoaXQuc2xpY2UoMiksIGJpbmFyeSA/IDIgOiA4KTtcbiAgICB9XG4gIH0gcmV0dXJuICtpdDtcbn1cbmlmKCEoJE51bWJlcignMG8xJykgJiYgJE51bWJlcignMGIxJykpKXtcbiAgJE51bWJlciA9IGZ1bmN0aW9uIE51bWJlcihpdCl7XG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiAkTnVtYmVyICYmIGZha2VOdW1iZXIodGhpcykgPyBuZXcgQmFzZSh0b051bWJlcihpdCkpIDogdG9OdW1iZXIoaXQpO1xuICB9O1xuICAkLmVhY2guY2FsbChyZXF1aXJlKCcuLyQuc3VwcG9ydC1kZXNjJykgPyAkLmdldE5hbWVzKEJhc2UpIDogKFxuICAgICAgLy8gRVMzOlxuICAgICAgJ01BWF9WQUxVRSxNSU5fVkFMVUUsTmFOLE5FR0FUSVZFX0lORklOSVRZLFBPU0lUSVZFX0lORklOSVRZLCcgK1xuICAgICAgLy8gRVM2IChpbiBjYXNlLCBpZiBtb2R1bGVzIHdpdGggRVM2IE51bWJlciBzdGF0aWNzIHJlcXVpcmVkIGJlZm9yZSk6XG4gICAgICAnRVBTSUxPTixpc0Zpbml0ZSxpc0ludGVnZXIsaXNOYU4saXNTYWZlSW50ZWdlcixNQVhfU0FGRV9JTlRFR0VSLCcgK1xuICAgICAgJ01JTl9TQUZFX0lOVEVHRVIscGFyc2VGbG9hdCxwYXJzZUludCxpc0ludGVnZXInXG4gICAgKS5zcGxpdCgnLCcpLCBmdW5jdGlvbihrZXkpe1xuICAgICAgaWYoaGFzKEJhc2UsIGtleSkgJiYgIWhhcygkTnVtYmVyLCBrZXkpKXtcbiAgICAgICAgJC5zZXREZXNjKCROdW1iZXIsIGtleSwgJC5nZXREZXNjKEJhc2UsIGtleSkpO1xuICAgICAgfVxuICAgIH1cbiAgKTtcbiAgJE51bWJlci5wcm90b3R5cGUgPSBwcm90bztcbiAgcHJvdG8uY29uc3RydWN0b3IgPSAkTnVtYmVyO1xuICByZXF1aXJlKCcuLyQucmVkZWYnKShnbG9iYWwsIE5VTUJFUiwgJE51bWJlcik7XG59IiwiLy8gMjAuMS4yLjEgTnVtYmVyLkVQU0lMT05cbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuXG4kZGVmKCRkZWYuUywgJ051bWJlcicsIHtFUFNJTE9OOiBNYXRoLnBvdygyLCAtNTIpfSk7IiwiLy8gMjAuMS4yLjIgTnVtYmVyLmlzRmluaXRlKG51bWJlcilcbnZhciAkZGVmICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBfaXNGaW5pdGUgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJykuaXNGaW5pdGU7XG5cbiRkZWYoJGRlZi5TLCAnTnVtYmVyJywge1xuICBpc0Zpbml0ZTogZnVuY3Rpb24gaXNGaW5pdGUoaXQpe1xuICAgIHJldHVybiB0eXBlb2YgaXQgPT0gJ251bWJlcicgJiYgX2lzRmluaXRlKGl0KTtcbiAgfVxufSk7IiwiLy8gMjAuMS4yLjMgTnVtYmVyLmlzSW50ZWdlcihudW1iZXIpXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcblxuJGRlZigkZGVmLlMsICdOdW1iZXInLCB7aXNJbnRlZ2VyOiByZXF1aXJlKCcuLyQuaXMtaW50ZWdlcicpfSk7IiwiLy8gMjAuMS4yLjQgTnVtYmVyLmlzTmFOKG51bWJlcilcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuXG4kZGVmKCRkZWYuUywgJ051bWJlcicsIHtcbiAgaXNOYU46IGZ1bmN0aW9uIGlzTmFOKG51bWJlcil7XG4gICAgcmV0dXJuIG51bWJlciAhPSBudW1iZXI7XG4gIH1cbn0pOyIsIi8vIDIwLjEuMi41IE51bWJlci5pc1NhZmVJbnRlZ2VyKG51bWJlcilcbnZhciAkZGVmICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBpc0ludGVnZXIgPSByZXF1aXJlKCcuLyQuaXMtaW50ZWdlcicpXG4gICwgYWJzICAgICAgID0gTWF0aC5hYnM7XG5cbiRkZWYoJGRlZi5TLCAnTnVtYmVyJywge1xuICBpc1NhZmVJbnRlZ2VyOiBmdW5jdGlvbiBpc1NhZmVJbnRlZ2VyKG51bWJlcil7XG4gICAgcmV0dXJuIGlzSW50ZWdlcihudW1iZXIpICYmIGFicyhudW1iZXIpIDw9IDB4MWZmZmZmZmZmZmZmZmY7XG4gIH1cbn0pOyIsIi8vIDIwLjEuMi42IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcblxuJGRlZigkZGVmLlMsICdOdW1iZXInLCB7TUFYX1NBRkVfSU5URUdFUjogMHgxZmZmZmZmZmZmZmZmZn0pOyIsIi8vIDIwLjEuMi4xMCBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUlxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG5cbiRkZWYoJGRlZi5TLCAnTnVtYmVyJywge01JTl9TQUZFX0lOVEVHRVI6IC0weDFmZmZmZmZmZmZmZmZmfSk7IiwiLy8gMjAuMS4yLjEyIE51bWJlci5wYXJzZUZsb2F0KHN0cmluZylcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuXG4kZGVmKCRkZWYuUywgJ051bWJlcicsIHtwYXJzZUZsb2F0OiBwYXJzZUZsb2F0fSk7IiwiLy8gMjAuMS4yLjEzIE51bWJlci5wYXJzZUludChzdHJpbmcsIHJhZGl4KVxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG5cbiRkZWYoJGRlZi5TLCAnTnVtYmVyJywge3BhcnNlSW50OiBwYXJzZUludH0pOyIsIi8vIDE5LjEuMy4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UpXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge2Fzc2lnbjogcmVxdWlyZSgnLi8kLmFzc2lnbicpfSk7IiwiLy8gMTkuMS4zLjEwIE9iamVjdC5pcyh2YWx1ZTEsIHZhbHVlMilcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7XG4gIGlzOiByZXF1aXJlKCcuLyQuc2FtZScpXG59KTsiLCIvLyAxOS4xLjMuMTkgT2JqZWN0LnNldFByb3RvdHlwZU9mKE8sIHByb3RvKVxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHtzZXRQcm90b3R5cGVPZjogcmVxdWlyZSgnLi8kLnNldC1wcm90bycpLnNldH0pOyIsInZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY29yZSAgICAgPSByZXF1aXJlKCcuLyQuY29yZScpXG4gICwgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCB0b09iamVjdCA9IHJlcXVpcmUoJy4vJC50by1vYmplY3QnKVxuICAsIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpO1xuJC5lYWNoLmNhbGwoKCdmcmVlemUsc2VhbCxwcmV2ZW50RXh0ZW5zaW9ucyxpc0Zyb3plbixpc1NlYWxlZCxpc0V4dGVuc2libGUsJyArXG4gICdnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsZ2V0UHJvdG90eXBlT2Ysa2V5cyxnZXRPd25Qcm9wZXJ0eU5hbWVzJykuc3BsaXQoJywnKVxuLCBmdW5jdGlvbihLRVksIElEKXtcbiAgdmFyIGZuICAgICA9IChjb3JlLk9iamVjdCB8fCB7fSlbS0VZXSB8fCBPYmplY3RbS0VZXVxuICAgICwgZm9yY2VkID0gMFxuICAgICwgbWV0aG9kID0ge307XG4gIG1ldGhvZFtLRVldID0gSUQgPT0gMCA/IGZ1bmN0aW9uIGZyZWV6ZShpdCl7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGl0O1xuICB9IDogSUQgPT0gMSA/IGZ1bmN0aW9uIHNlYWwoaXQpe1xuICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiBpdDtcbiAgfSA6IElEID09IDIgPyBmdW5jdGlvbiBwcmV2ZW50RXh0ZW5zaW9ucyhpdCl7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGl0O1xuICB9IDogSUQgPT0gMyA/IGZ1bmN0aW9uIGlzRnJvemVuKGl0KXtcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogdHJ1ZTtcbiAgfSA6IElEID09IDQgPyBmdW5jdGlvbiBpc1NlYWxlZChpdCl7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IHRydWU7XG4gIH0gOiBJRCA9PSA1ID8gZnVuY3Rpb24gaXNFeHRlbnNpYmxlKGl0KXtcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogZmFsc2U7XG4gIH0gOiBJRCA9PSA2ID8gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICAgIHJldHVybiBmbih0b09iamVjdChpdCksIGtleSk7XG4gIH0gOiBJRCA9PSA3ID8gZnVuY3Rpb24gZ2V0UHJvdG90eXBlT2YoaXQpe1xuICAgIHJldHVybiBmbih0b09iamVjdChpdCwgdHJ1ZSkpO1xuICB9IDogSUQgPT0gOCA/IGZ1bmN0aW9uIGtleXMoaXQpe1xuICAgIHJldHVybiBmbih0b09iamVjdChpdCkpO1xuICB9IDogcmVxdWlyZSgnLi8kLmdldC1uYW1lcycpLmdldDtcbiAgdHJ5IHtcbiAgICBmbigneicpO1xuICB9IGNhdGNoKGUpe1xuICAgIGZvcmNlZCA9IDE7XG4gIH1cbiAgJGRlZigkZGVmLlMgKyAkZGVmLkYgKiBmb3JjZWQsICdPYmplY3QnLCBtZXRob2QpO1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuLy8gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4vJC5jbGFzc29mJylcbiAgLCB0ZXN0ICAgID0ge307XG50ZXN0W3JlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKV0gPSAneic7XG5pZih0ZXN0ICsgJycgIT0gJ1tvYmplY3Qgel0nKXtcbiAgcmVxdWlyZSgnLi8kLnJlZGVmJykoT2JqZWN0LnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKXtcbiAgICByZXR1cm4gJ1tvYmplY3QgJyArIGNsYXNzb2YodGhpcykgKyAnXSc7XG4gIH0sIHRydWUpO1xufSIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBMSUJSQVJZICAgID0gcmVxdWlyZSgnLi8kLmxpYnJhcnknKVxuICAsIGdsb2JhbCAgICAgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJylcbiAgLCBjdHggICAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgY2xhc3NvZiAgICA9IHJlcXVpcmUoJy4vJC5jbGFzc29mJylcbiAgLCAkZGVmICAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgaXNPYmplY3QgICA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKVxuICAsIGFuT2JqZWN0ICAgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0JylcbiAgLCBhRnVuY3Rpb24gID0gcmVxdWlyZSgnLi8kLmEtZnVuY3Rpb24nKVxuICAsIHN0cmljdE5ldyAgPSByZXF1aXJlKCcuLyQuc3RyaWN0LW5ldycpXG4gICwgZm9yT2YgICAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIHNldFByb3RvICAgPSByZXF1aXJlKCcuLyQuc2V0LXByb3RvJykuc2V0XG4gICwgc2FtZSAgICAgICA9IHJlcXVpcmUoJy4vJC5zYW1lJylcbiAgLCBzcGVjaWVzICAgID0gcmVxdWlyZSgnLi8kLnNwZWNpZXMnKVxuICAsIFNQRUNJRVMgICAgPSByZXF1aXJlKCcuLyQud2tzJykoJ3NwZWNpZXMnKVxuICAsIFJFQ09SRCAgICAgPSByZXF1aXJlKCcuLyQudWlkJykoJ3JlY29yZCcpXG4gICwgUFJPTUlTRSAgICA9ICdQcm9taXNlJ1xuICAsIHByb2Nlc3MgICAgPSBnbG9iYWwucHJvY2Vzc1xuICAsIGlzTm9kZSAgICAgPSBjbGFzc29mKHByb2Nlc3MpID09ICdwcm9jZXNzJ1xuICAsIGFzYXAgICAgICAgPSBwcm9jZXNzICYmIHByb2Nlc3MubmV4dFRpY2sgfHwgcmVxdWlyZSgnLi8kLnRhc2snKS5zZXRcbiAgLCBQICAgICAgICAgID0gZ2xvYmFsW1BST01JU0VdXG4gICwgV3JhcHBlcjtcblxuZnVuY3Rpb24gdGVzdFJlc29sdmUoc3ViKXtcbiAgdmFyIHRlc3QgPSBuZXcgUChmdW5jdGlvbigpe30pO1xuICBpZihzdWIpdGVzdC5jb25zdHJ1Y3RvciA9IE9iamVjdDtcbiAgcmV0dXJuIFAucmVzb2x2ZSh0ZXN0KSA9PT0gdGVzdDtcbn1cblxudmFyIHVzZU5hdGl2ZSA9IGZ1bmN0aW9uKCl7XG4gIHZhciB3b3JrcyA9IGZhbHNlO1xuICBmdW5jdGlvbiBQMih4KXtcbiAgICB2YXIgc2VsZiA9IG5ldyBQKHgpO1xuICAgIHNldFByb3RvKHNlbGYsIFAyLnByb3RvdHlwZSk7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cbiAgdHJ5IHtcbiAgICB3b3JrcyA9IFAgJiYgUC5yZXNvbHZlICYmIHRlc3RSZXNvbHZlKCk7XG4gICAgc2V0UHJvdG8oUDIsIFApO1xuICAgIFAyLnByb3RvdHlwZSA9ICQuY3JlYXRlKFAucHJvdG90eXBlLCB7Y29uc3RydWN0b3I6IHt2YWx1ZTogUDJ9fSk7XG4gICAgLy8gYWN0dWFsIEZpcmVmb3ggaGFzIGJyb2tlbiBzdWJjbGFzcyBzdXBwb3J0LCB0ZXN0IHRoYXRcbiAgICBpZighKFAyLnJlc29sdmUoNSkudGhlbihmdW5jdGlvbigpe30pIGluc3RhbmNlb2YgUDIpKXtcbiAgICAgIHdvcmtzID0gZmFsc2U7XG4gICAgfVxuICAgIC8vIGFjdHVhbCBWOCBidWcsIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD00MTYyXG4gICAgaWYod29ya3MgJiYgcmVxdWlyZSgnLi8kLnN1cHBvcnQtZGVzYycpKXtcbiAgICAgIHZhciB0aGVuYWJsZVRoZW5Hb3R0ZW4gPSBmYWxzZTtcbiAgICAgIFAucmVzb2x2ZSgkLnNldERlc2Moe30sICd0aGVuJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7IHRoZW5hYmxlVGhlbkdvdHRlbiA9IHRydWU7IH1cbiAgICAgIH0pKTtcbiAgICAgIHdvcmtzID0gdGhlbmFibGVUaGVuR290dGVuO1xuICAgIH1cbiAgfSBjYXRjaChlKXsgd29ya3MgPSBmYWxzZTsgfVxuICByZXR1cm4gd29ya3M7XG59KCk7XG5cbi8vIGhlbHBlcnNcbmZ1bmN0aW9uIGlzUHJvbWlzZShpdCl7XG4gIHJldHVybiBpc09iamVjdChpdCkgJiYgKHVzZU5hdGl2ZSA/IGNsYXNzb2YoaXQpID09ICdQcm9taXNlJyA6IFJFQ09SRCBpbiBpdCk7XG59XG5mdW5jdGlvbiBzYW1lQ29uc3RydWN0b3IoYSwgYil7XG4gIC8vIGxpYnJhcnkgd3JhcHBlciBzcGVjaWFsIGNhc2VcbiAgaWYoTElCUkFSWSAmJiBhID09PSBQICYmIGIgPT09IFdyYXBwZXIpcmV0dXJuIHRydWU7XG4gIHJldHVybiBzYW1lKGEsIGIpO1xufVxuZnVuY3Rpb24gZ2V0Q29uc3RydWN0b3IoQyl7XG4gIHZhciBTID0gYW5PYmplY3QoQylbU1BFQ0lFU107XG4gIHJldHVybiBTICE9IHVuZGVmaW5lZCA/IFMgOiBDO1xufVxuZnVuY3Rpb24gaXNUaGVuYWJsZShpdCl7XG4gIHZhciB0aGVuO1xuICByZXR1cm4gaXNPYmplY3QoaXQpICYmIHR5cGVvZiAodGhlbiA9IGl0LnRoZW4pID09ICdmdW5jdGlvbicgPyB0aGVuIDogZmFsc2U7XG59XG5mdW5jdGlvbiBub3RpZnkocmVjb3JkLCBpc1JlamVjdCl7XG4gIGlmKHJlY29yZC5uKXJldHVybjtcbiAgcmVjb3JkLm4gPSB0cnVlO1xuICB2YXIgY2hhaW4gPSByZWNvcmQuYztcbiAgLy8gc3RyYW5nZSBJRSArIHdlYnBhY2sgZGV2IHNlcnZlciBidWcgLSB1c2UgLmNhbGwoZ2xvYmFsKVxuICBhc2FwLmNhbGwoZ2xvYmFsLCBmdW5jdGlvbigpe1xuICAgIHZhciB2YWx1ZSA9IHJlY29yZC52XG4gICAgICAsIG9rICAgID0gcmVjb3JkLnMgPT0gMVxuICAgICAgLCBpICAgICA9IDA7XG4gICAgZnVuY3Rpb24gcnVuKHJlYWN0KXtcbiAgICAgIHZhciBjYiA9IG9rID8gcmVhY3Qub2sgOiByZWFjdC5mYWlsXG4gICAgICAgICwgcmV0LCB0aGVuO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYoY2Ipe1xuICAgICAgICAgIGlmKCFvaylyZWNvcmQuaCA9IHRydWU7XG4gICAgICAgICAgcmV0ID0gY2IgPT09IHRydWUgPyB2YWx1ZSA6IGNiKHZhbHVlKTtcbiAgICAgICAgICBpZihyZXQgPT09IHJlYWN0LlApe1xuICAgICAgICAgICAgcmVhY3QucmVqKFR5cGVFcnJvcignUHJvbWlzZS1jaGFpbiBjeWNsZScpKTtcbiAgICAgICAgICB9IGVsc2UgaWYodGhlbiA9IGlzVGhlbmFibGUocmV0KSl7XG4gICAgICAgICAgICB0aGVuLmNhbGwocmV0LCByZWFjdC5yZXMsIHJlYWN0LnJlaik7XG4gICAgICAgICAgfSBlbHNlIHJlYWN0LnJlcyhyZXQpO1xuICAgICAgICB9IGVsc2UgcmVhY3QucmVqKHZhbHVlKTtcbiAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgcmVhY3QucmVqKGVycik7XG4gICAgICB9XG4gICAgfVxuICAgIHdoaWxlKGNoYWluLmxlbmd0aCA+IGkpcnVuKGNoYWluW2krK10pOyAvLyB2YXJpYWJsZSBsZW5ndGggLSBjYW4ndCB1c2UgZm9yRWFjaFxuICAgIGNoYWluLmxlbmd0aCA9IDA7XG4gICAgcmVjb3JkLm4gPSBmYWxzZTtcbiAgICBpZihpc1JlamVjdClzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAvLyBzdHJhbmdlIElFICsgd2VicGFjayBkZXYgc2VydmVyIGJ1ZyAtIHVzZSAuY2FsbChnbG9iYWwpXG4gICAgICBhc2FwLmNhbGwoZ2xvYmFsLCBmdW5jdGlvbigpe1xuICAgICAgICBpZihpc1VuaGFuZGxlZChyZWNvcmQucCkpe1xuICAgICAgICAgIGlmKGlzTm9kZSl7XG4gICAgICAgICAgICBwcm9jZXNzLmVtaXQoJ3VuaGFuZGxlZFJlamVjdGlvbicsIHZhbHVlLCByZWNvcmQucCk7XG4gICAgICAgICAgfSBlbHNlIGlmKGdsb2JhbC5jb25zb2xlICYmIGNvbnNvbGUuZXJyb3Ipe1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uJywgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZWNvcmQuYSA9IHVuZGVmaW5lZDtcbiAgICAgIH0pO1xuICAgIH0sIDEpO1xuICB9KTtcbn1cbmZ1bmN0aW9uIGlzVW5oYW5kbGVkKHByb21pc2Upe1xuICB2YXIgcmVjb3JkID0gcHJvbWlzZVtSRUNPUkRdXG4gICAgLCBjaGFpbiAgPSByZWNvcmQuYSB8fCByZWNvcmQuY1xuICAgICwgaSAgICAgID0gMFxuICAgICwgcmVhY3Q7XG4gIGlmKHJlY29yZC5oKXJldHVybiBmYWxzZTtcbiAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSl7XG4gICAgcmVhY3QgPSBjaGFpbltpKytdO1xuICAgIGlmKHJlYWN0LmZhaWwgfHwgIWlzVW5oYW5kbGVkKHJlYWN0LlApKXJldHVybiBmYWxzZTtcbiAgfSByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uICRyZWplY3QodmFsdWUpe1xuICB2YXIgcmVjb3JkID0gdGhpcztcbiAgaWYocmVjb3JkLmQpcmV0dXJuO1xuICByZWNvcmQuZCA9IHRydWU7XG4gIHJlY29yZCA9IHJlY29yZC5yIHx8IHJlY29yZDsgLy8gdW53cmFwXG4gIHJlY29yZC52ID0gdmFsdWU7XG4gIHJlY29yZC5zID0gMjtcbiAgcmVjb3JkLmEgPSByZWNvcmQuYy5zbGljZSgpO1xuICBub3RpZnkocmVjb3JkLCB0cnVlKTtcbn1cbmZ1bmN0aW9uICRyZXNvbHZlKHZhbHVlKXtcbiAgdmFyIHJlY29yZCA9IHRoaXNcbiAgICAsIHRoZW47XG4gIGlmKHJlY29yZC5kKXJldHVybjtcbiAgcmVjb3JkLmQgPSB0cnVlO1xuICByZWNvcmQgPSByZWNvcmQuciB8fCByZWNvcmQ7IC8vIHVud3JhcFxuICB0cnkge1xuICAgIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHZhbHVlKSl7XG4gICAgICAvLyBzdHJhbmdlIElFICsgd2VicGFjayBkZXYgc2VydmVyIGJ1ZyAtIHVzZSAuY2FsbChnbG9iYWwpXG4gICAgICBhc2FwLmNhbGwoZ2xvYmFsLCBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgd3JhcHBlciA9IHtyOiByZWNvcmQsIGQ6IGZhbHNlfTsgLy8gd3JhcFxuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoZW4uY2FsbCh2YWx1ZSwgY3R4KCRyZXNvbHZlLCB3cmFwcGVyLCAxKSwgY3R4KCRyZWplY3QsIHdyYXBwZXIsIDEpKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAkcmVqZWN0LmNhbGwod3JhcHBlciwgZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWNvcmQudiA9IHZhbHVlO1xuICAgICAgcmVjb3JkLnMgPSAxO1xuICAgICAgbm90aWZ5KHJlY29yZCwgZmFsc2UpO1xuICAgIH1cbiAgfSBjYXRjaChlKXtcbiAgICAkcmVqZWN0LmNhbGwoe3I6IHJlY29yZCwgZDogZmFsc2V9LCBlKTsgLy8gd3JhcFxuICB9XG59XG5cbi8vIGNvbnN0cnVjdG9yIHBvbHlmaWxsXG5pZighdXNlTmF0aXZlKXtcbiAgLy8gMjUuNC4zLjEgUHJvbWlzZShleGVjdXRvcilcbiAgUCA9IGZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3Ipe1xuICAgIGFGdW5jdGlvbihleGVjdXRvcik7XG4gICAgdmFyIHJlY29yZCA9IHtcbiAgICAgIHA6IHN0cmljdE5ldyh0aGlzLCBQLCBQUk9NSVNFKSwgICAgICAgICAvLyA8LSBwcm9taXNlXG4gICAgICBjOiBbXSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gYXdhaXRpbmcgcmVhY3Rpb25zXG4gICAgICBhOiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gY2hlY2tlZCBpbiBpc1VuaGFuZGxlZCByZWFjdGlvbnNcbiAgICAgIHM6IDAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBzdGF0ZVxuICAgICAgZDogZmFsc2UsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGRvbmVcbiAgICAgIHY6IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSB2YWx1ZVxuICAgICAgaDogZmFsc2UsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGhhbmRsZWQgcmVqZWN0aW9uXG4gICAgICBuOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gbm90aWZ5XG4gICAgfTtcbiAgICB0aGlzW1JFQ09SRF0gPSByZWNvcmQ7XG4gICAgdHJ5IHtcbiAgICAgIGV4ZWN1dG9yKGN0eCgkcmVzb2x2ZSwgcmVjb3JkLCAxKSwgY3R4KCRyZWplY3QsIHJlY29yZCwgMSkpO1xuICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICRyZWplY3QuY2FsbChyZWNvcmQsIGVycik7XG4gICAgfVxuICB9O1xuICByZXF1aXJlKCcuLyQubWl4JykoUC5wcm90b3R5cGUsIHtcbiAgICAvLyAyNS40LjUuMyBQcm9taXNlLnByb3RvdHlwZS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKVxuICAgIHRoZW46IGZ1bmN0aW9uIHRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpe1xuICAgICAgdmFyIFMgPSBhbk9iamVjdChhbk9iamVjdCh0aGlzKS5jb25zdHJ1Y3RvcilbU1BFQ0lFU107XG4gICAgICB2YXIgcmVhY3QgPSB7XG4gICAgICAgIG9rOiAgIHR5cGVvZiBvbkZ1bGZpbGxlZCA9PSAnZnVuY3Rpb24nID8gb25GdWxmaWxsZWQgOiB0cnVlLFxuICAgICAgICBmYWlsOiB0eXBlb2Ygb25SZWplY3RlZCA9PSAnZnVuY3Rpb24nICA/IG9uUmVqZWN0ZWQgIDogZmFsc2VcbiAgICAgIH07XG4gICAgICB2YXIgcHJvbWlzZSA9IHJlYWN0LlAgPSBuZXcgKFMgIT0gdW5kZWZpbmVkID8gUyA6IFApKGZ1bmN0aW9uKHJlcywgcmVqKXtcbiAgICAgICAgcmVhY3QucmVzID0gYUZ1bmN0aW9uKHJlcyk7XG4gICAgICAgIHJlYWN0LnJlaiA9IGFGdW5jdGlvbihyZWopO1xuICAgICAgfSk7XG4gICAgICB2YXIgcmVjb3JkID0gdGhpc1tSRUNPUkRdO1xuICAgICAgcmVjb3JkLmMucHVzaChyZWFjdCk7XG4gICAgICBpZihyZWNvcmQuYSlyZWNvcmQuYS5wdXNoKHJlYWN0KTtcbiAgICAgIGlmKHJlY29yZC5zKW5vdGlmeShyZWNvcmQsIGZhbHNlKTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH0sXG4gICAgLy8gMjUuNC41LjEgUHJvbWlzZS5wcm90b3R5cGUuY2F0Y2gob25SZWplY3RlZClcbiAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGVkKXtcbiAgICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGVkKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBleHBvcnRcbiRkZWYoJGRlZi5HICsgJGRlZi5XICsgJGRlZi5GICogIXVzZU5hdGl2ZSwge1Byb21pc2U6IFB9KTtcbnJlcXVpcmUoJy4vJC50YWcnKShQLCBQUk9NSVNFKTtcbnNwZWNpZXMoUCk7XG5zcGVjaWVzKFdyYXBwZXIgPSByZXF1aXJlKCcuLyQuY29yZScpW1BST01JU0VdKTtcblxuLy8gc3RhdGljc1xuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhdXNlTmF0aXZlLCBQUk9NSVNFLCB7XG4gIC8vIDI1LjQuNC41IFByb21pc2UucmVqZWN0KHIpXG4gIHJlamVjdDogZnVuY3Rpb24gcmVqZWN0KHIpe1xuICAgIHJldHVybiBuZXcgdGhpcyhmdW5jdGlvbihyZXMsIHJlail7IHJlaihyKTsgfSk7XG4gIH1cbn0pO1xuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAoIXVzZU5hdGl2ZSB8fCB0ZXN0UmVzb2x2ZSh0cnVlKSksIFBST01JU0UsIHtcbiAgLy8gMjUuNC40LjYgUHJvbWlzZS5yZXNvbHZlKHgpXG4gIHJlc29sdmU6IGZ1bmN0aW9uIHJlc29sdmUoeCl7XG4gICAgcmV0dXJuIGlzUHJvbWlzZSh4KSAmJiBzYW1lQ29uc3RydWN0b3IoeC5jb25zdHJ1Y3RvciwgdGhpcylcbiAgICAgID8geCA6IG5ldyB0aGlzKGZ1bmN0aW9uKHJlcyl7IHJlcyh4KTsgfSk7XG4gIH1cbn0pO1xuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhKHVzZU5hdGl2ZSAmJiByZXF1aXJlKCcuLyQuaXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXtcbiAgUC5hbGwoaXRlcilbJ2NhdGNoJ10oZnVuY3Rpb24oKXt9KTtcbn0pKSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuMSBQcm9taXNlLmFsbChpdGVyYWJsZSlcbiAgYWxsOiBmdW5jdGlvbiBhbGwoaXRlcmFibGUpe1xuICAgIHZhciBDICAgICAgPSBnZXRDb25zdHJ1Y3Rvcih0aGlzKVxuICAgICAgLCB2YWx1ZXMgPSBbXTtcbiAgICByZXR1cm4gbmV3IEMoZnVuY3Rpb24ocmVzLCByZWope1xuICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCB2YWx1ZXMucHVzaCwgdmFsdWVzKTtcbiAgICAgIHZhciByZW1haW5pbmcgPSB2YWx1ZXMubGVuZ3RoXG4gICAgICAgICwgcmVzdWx0cyAgID0gQXJyYXkocmVtYWluaW5nKTtcbiAgICAgIGlmKHJlbWFpbmluZykkLmVhY2guY2FsbCh2YWx1ZXMsIGZ1bmN0aW9uKHByb21pc2UsIGluZGV4KXtcbiAgICAgICAgQy5yZXNvbHZlKHByb21pc2UpLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgLS1yZW1haW5pbmcgfHwgcmVzKHJlc3VsdHMpO1xuICAgICAgICB9LCByZWopO1xuICAgICAgfSk7XG4gICAgICBlbHNlIHJlcyhyZXN1bHRzKTtcbiAgICB9KTtcbiAgfSxcbiAgLy8gMjUuNC40LjQgUHJvbWlzZS5yYWNlKGl0ZXJhYmxlKVxuICByYWNlOiBmdW5jdGlvbiByYWNlKGl0ZXJhYmxlKXtcbiAgICB2YXIgQyA9IGdldENvbnN0cnVjdG9yKHRoaXMpO1xuICAgIHJldHVybiBuZXcgQyhmdW5jdGlvbihyZXMsIHJlail7XG4gICAgICBmb3JPZihpdGVyYWJsZSwgZmFsc2UsIGZ1bmN0aW9uKHByb21pc2Upe1xuICAgICAgICBDLnJlc29sdmUocHJvbWlzZSkudGhlbihyZXMsIHJlaik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufSk7IiwiLy8gMjYuMS4xIFJlZmxlY3QuYXBwbHkodGFyZ2V0LCB0aGlzQXJndW1lbnQsIGFyZ3VtZW50c0xpc3QpXG52YXIgJGRlZiAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgX2FwcGx5ID0gRnVuY3Rpb24uYXBwbHk7XG5cbiRkZWYoJGRlZi5TLCAnUmVmbGVjdCcsIHtcbiAgYXBwbHk6IGZ1bmN0aW9uIGFwcGx5KHRhcmdldCwgdGhpc0FyZ3VtZW50LCBhcmd1bWVudHNMaXN0KXtcbiAgICByZXR1cm4gX2FwcGx5LmNhbGwodGFyZ2V0LCB0aGlzQXJndW1lbnQsIGFyZ3VtZW50c0xpc3QpO1xuICB9XG59KTsiLCIvLyAyNi4xLjIgUmVmbGVjdC5jb25zdHJ1Y3QodGFyZ2V0LCBhcmd1bWVudHNMaXN0IFssIG5ld1RhcmdldF0pXG52YXIgJCAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLyQuYS1mdW5jdGlvbicpXG4gICwgaXNPYmplY3QgID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpXG4gICwgYXBwbHkgICAgID0gRnVuY3Rpb24uYXBwbHlcbiAgLCBiaW5kICAgICAgPSBGdW5jdGlvbi5iaW5kIHx8IHJlcXVpcmUoJy4vJC5jb3JlJykuRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQ7XG5cbiRkZWYoJGRlZi5TLCAnUmVmbGVjdCcsIHtcbiAgY29uc3RydWN0OiBmdW5jdGlvbiBjb25zdHJ1Y3QodGFyZ2V0LCBhcmd1bWVudHNMaXN0IC8qLCBuZXdUYXJnZXQqLyl7XG4gICAgaWYoYXJndW1lbnRzLmxlbmd0aCA8IDMpcmV0dXJuIG5ldyAoYmluZC5hcHBseSh0YXJnZXQsIFtudWxsXS5jb25jYXQoYXJndW1lbnRzTGlzdCkpKSgpO1xuICAgIHZhciBwcm90byAgICA9IGFGdW5jdGlvbihhcmd1bWVudHNbMl0pLnByb3RvdHlwZVxuICAgICAgLCBpbnN0YW5jZSA9ICQuY3JlYXRlKGlzT2JqZWN0KHByb3RvKSA/IHByb3RvIDogT2JqZWN0LnByb3RvdHlwZSlcbiAgICAgICwgcmVzdWx0ICAgPSBhcHBseS5jYWxsKHRhcmdldCwgaW5zdGFuY2UsIGFyZ3VtZW50c0xpc3QpO1xuICAgIHJldHVybiBpc09iamVjdChyZXN1bHQpID8gcmVzdWx0IDogaW5zdGFuY2U7XG4gIH1cbn0pOyIsIi8vIDI2LjEuMyBSZWZsZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXksIGF0dHJpYnV0ZXMpXG52YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsICRkZWYgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgYW5PYmplY3QgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0Jyk7XG5cbi8vIE1TIEVkZ2UgaGFzIGJyb2tlbiBSZWZsZWN0LmRlZmluZVByb3BlcnR5IC0gdGhyb3dpbmcgaW5zdGVhZCBvZiByZXR1cm5pbmcgZmFsc2VcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogcmVxdWlyZSgnLi8kLnRocm93cycpKGZ1bmN0aW9uKCl7XG4gIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoJC5zZXREZXNjKHt9LCAxLCB7dmFsdWU6IDF9KSwgMSwge3ZhbHVlOiAyfSk7XG59KSwgJ1JlZmxlY3QnLCB7XG4gIGRlZmluZVByb3BlcnR5OiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5LCBhdHRyaWJ1dGVzKXtcbiAgICBhbk9iamVjdCh0YXJnZXQpO1xuICAgIHRyeSB7XG4gICAgICAkLnNldERlc2ModGFyZ2V0LCBwcm9wZXJ0eUtleSwgYXR0cmlidXRlcyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufSk7IiwiLy8gMjYuMS40IFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSlcbnZhciAkZGVmICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGdldERlc2MgID0gcmVxdWlyZSgnLi8kJykuZ2V0RGVzY1xuICAsIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFuLW9iamVjdCcpO1xuXG4kZGVmKCRkZWYuUywgJ1JlZmxlY3QnLCB7XG4gIGRlbGV0ZVByb3BlcnR5OiBmdW5jdGlvbiBkZWxldGVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5KXtcbiAgICB2YXIgZGVzYyA9IGdldERlc2MoYW5PYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpO1xuICAgIHJldHVybiBkZXNjICYmICFkZXNjLmNvbmZpZ3VyYWJsZSA/IGZhbHNlIDogZGVsZXRlIHRhcmdldFtwcm9wZXJ0eUtleV07XG4gIH1cbn0pOyIsIi8vIDI2LjEuNSBSZWZsZWN0LmVudW1lcmF0ZSh0YXJnZXQpXG52YXIgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBhbk9iamVjdCA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKTtcblxuZnVuY3Rpb24gRW51bWVyYXRlKGl0ZXJhdGVkKXtcbiAgdGhpcy5fdCA9IGFuT2JqZWN0KGl0ZXJhdGVkKTsgLy8gdGFyZ2V0XG4gIHRoaXMuX2sgPSB1bmRlZmluZWQ7ICAgICAgICAgIC8vIGtleXNcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxufVxucmVxdWlyZSgnLi8kLml0ZXItY3JlYXRlJykoRW51bWVyYXRlLCAnT2JqZWN0JywgZnVuY3Rpb24oKXtcbiAgdmFyIHRoYXQgPSB0aGlzXG4gICAgLCBrZXlzID0gdGhhdC5fa1xuICAgICwga2V5O1xuICBpZihrZXlzID09IHVuZGVmaW5lZCl7XG4gICAgdGhhdC5fayA9IGtleXMgPSBbXTtcbiAgICBmb3Ioa2V5IGluIHRoYXQuX3Qpa2V5cy5wdXNoKGtleSk7XG4gIH1cbiAgZG8ge1xuICAgIGlmKHRoYXQuX2kgPj0ga2V5cy5sZW5ndGgpcmV0dXJuIHt2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlfTtcbiAgfSB3aGlsZSghKChrZXkgPSBrZXlzW3RoYXQuX2krK10pIGluIHRoYXQuX3QpKTtcbiAgcmV0dXJuIHt2YWx1ZToga2V5LCBkb25lOiBmYWxzZX07XG59KTtcblxuJGRlZigkZGVmLlMsICdSZWZsZWN0Jywge1xuICBlbnVtZXJhdGU6IGZ1bmN0aW9uIGVudW1lcmF0ZSh0YXJnZXQpe1xuICAgIHJldHVybiBuZXcgRW51bWVyYXRlKHRhcmdldCk7XG4gIH1cbn0pOyIsIi8vIDI2LjEuNyBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KVxudmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFuLW9iamVjdCcpO1xuXG4kZGVmKCRkZWYuUywgJ1JlZmxlY3QnLCB7XG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpe1xuICAgIHJldHVybiAkLmdldERlc2MoYW5PYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpO1xuICB9XG59KTsiLCIvLyAyNi4xLjggUmVmbGVjdC5nZXRQcm90b3R5cGVPZih0YXJnZXQpXG52YXIgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBnZXRQcm90byA9IHJlcXVpcmUoJy4vJCcpLmdldFByb3RvXG4gICwgYW5PYmplY3QgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0Jyk7XG5cbiRkZWYoJGRlZi5TLCAnUmVmbGVjdCcsIHtcbiAgZ2V0UHJvdG90eXBlT2Y6IGZ1bmN0aW9uIGdldFByb3RvdHlwZU9mKHRhcmdldCl7XG4gICAgcmV0dXJuIGdldFByb3RvKGFuT2JqZWN0KHRhcmdldCkpO1xuICB9XG59KTsiLCIvLyAyNi4xLjYgUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSBbLCByZWNlaXZlcl0pXG52YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGhhcyAgICAgID0gcmVxdWlyZSgnLi8kLmhhcycpXG4gICwgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBpc09iamVjdCA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKVxuICAsIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFuLW9iamVjdCcpO1xuXG5mdW5jdGlvbiBnZXQodGFyZ2V0LCBwcm9wZXJ0eUtleS8qLCByZWNlaXZlciovKXtcbiAgdmFyIHJlY2VpdmVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDMgPyB0YXJnZXQgOiBhcmd1bWVudHNbMl1cbiAgICAsIGRlc2MsIHByb3RvO1xuICBpZihhbk9iamVjdCh0YXJnZXQpID09PSByZWNlaXZlcilyZXR1cm4gdGFyZ2V0W3Byb3BlcnR5S2V5XTtcbiAgaWYoZGVzYyA9ICQuZ2V0RGVzYyh0YXJnZXQsIHByb3BlcnR5S2V5KSlyZXR1cm4gaGFzKGRlc2MsICd2YWx1ZScpXG4gICAgPyBkZXNjLnZhbHVlXG4gICAgOiBkZXNjLmdldCAhPT0gdW5kZWZpbmVkXG4gICAgICA/IGRlc2MuZ2V0LmNhbGwocmVjZWl2ZXIpXG4gICAgICA6IHVuZGVmaW5lZDtcbiAgaWYoaXNPYmplY3QocHJvdG8gPSAkLmdldFByb3RvKHRhcmdldCkpKXJldHVybiBnZXQocHJvdG8sIHByb3BlcnR5S2V5LCByZWNlaXZlcik7XG59XG5cbiRkZWYoJGRlZi5TLCAnUmVmbGVjdCcsIHtnZXQ6IGdldH0pOyIsIi8vIDI2LjEuOSBSZWZsZWN0Lmhhcyh0YXJnZXQsIHByb3BlcnR5S2V5KVxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG5cbiRkZWYoJGRlZi5TLCAnUmVmbGVjdCcsIHtcbiAgaGFzOiBmdW5jdGlvbiBoYXModGFyZ2V0LCBwcm9wZXJ0eUtleSl7XG4gICAgcmV0dXJuIHByb3BlcnR5S2V5IGluIHRhcmdldDtcbiAgfVxufSk7IiwiLy8gMjYuMS4xMCBSZWZsZWN0LmlzRXh0ZW5zaWJsZSh0YXJnZXQpXG52YXIgJGRlZiAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGFuT2JqZWN0ICAgICAgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0JylcbiAgLCBfaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCByZXF1aXJlKCcuLyQuaXMtb2JqZWN0Jyk7XG5cbiRkZWYoJGRlZi5TLCAnUmVmbGVjdCcsIHtcbiAgaXNFeHRlbnNpYmxlOiBmdW5jdGlvbiBpc0V4dGVuc2libGUodGFyZ2V0KXtcbiAgICByZXR1cm4gX2lzRXh0ZW5zaWJsZShhbk9iamVjdCh0YXJnZXQpKTtcbiAgfVxufSk7IiwiLy8gMjYuMS4xMSBSZWZsZWN0Lm93bktleXModGFyZ2V0KVxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG5cbiRkZWYoJGRlZi5TLCAnUmVmbGVjdCcsIHtvd25LZXlzOiByZXF1aXJlKCcuLyQub3duLWtleXMnKX0pOyIsIi8vIDI2LjEuMTIgUmVmbGVjdC5wcmV2ZW50RXh0ZW5zaW9ucyh0YXJnZXQpXG52YXIgJGRlZiAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgYW5PYmplY3QgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmFuLW9iamVjdCcpXG4gICwgX3ByZXZlbnRFeHRlbnNpb25zID0gT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zO1xuXG4kZGVmKCRkZWYuUywgJ1JlZmxlY3QnLCB7XG4gIHByZXZlbnRFeHRlbnNpb25zOiBmdW5jdGlvbiBwcmV2ZW50RXh0ZW5zaW9ucyh0YXJnZXQpe1xuICAgIGFuT2JqZWN0KHRhcmdldCk7XG4gICAgdHJ5IHtcbiAgICAgIGlmKF9wcmV2ZW50RXh0ZW5zaW9ucylfcHJldmVudEV4dGVuc2lvbnModGFyZ2V0KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59KTsiLCIvLyAyNi4xLjE0IFJlZmxlY3Quc2V0UHJvdG90eXBlT2YodGFyZ2V0LCBwcm90bylcbnZhciAkZGVmICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIHNldFByb3RvID0gcmVxdWlyZSgnLi8kLnNldC1wcm90bycpO1xuXG5pZihzZXRQcm90bykkZGVmKCRkZWYuUywgJ1JlZmxlY3QnLCB7XG4gIHNldFByb3RvdHlwZU9mOiBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZih0YXJnZXQsIHByb3RvKXtcbiAgICBzZXRQcm90by5jaGVjayh0YXJnZXQsIHByb3RvKTtcbiAgICB0cnkge1xuICAgICAgc2V0UHJvdG8uc2V0KHRhcmdldCwgcHJvdG8pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn0pOyIsIi8vIDI2LjEuMTMgUmVmbGVjdC5zZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSwgViBbLCByZWNlaXZlcl0pXG52YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgaGFzICAgICAgICA9IHJlcXVpcmUoJy4vJC5oYXMnKVxuICAsICRkZWYgICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi8kLnByb3BlcnR5LWRlc2MnKVxuICAsIGFuT2JqZWN0ICAgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0JylcbiAgLCBpc09iamVjdCAgID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpO1xuXG5mdW5jdGlvbiBzZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSwgVi8qLCByZWNlaXZlciovKXtcbiAgdmFyIHJlY2VpdmVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDQgPyB0YXJnZXQgOiBhcmd1bWVudHNbM11cbiAgICAsIG93bkRlc2MgID0gJC5nZXREZXNjKGFuT2JqZWN0KHRhcmdldCksIHByb3BlcnR5S2V5KVxuICAgICwgZXhpc3RpbmdEZXNjcmlwdG9yLCBwcm90bztcbiAgaWYoIW93bkRlc2Mpe1xuICAgIGlmKGlzT2JqZWN0KHByb3RvID0gJC5nZXRQcm90byh0YXJnZXQpKSl7XG4gICAgICByZXR1cm4gc2V0KHByb3RvLCBwcm9wZXJ0eUtleSwgViwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgICBvd25EZXNjID0gY3JlYXRlRGVzYygwKTtcbiAgfVxuICBpZihoYXMob3duRGVzYywgJ3ZhbHVlJykpe1xuICAgIGlmKG93bkRlc2Mud3JpdGFibGUgPT09IGZhbHNlIHx8ICFpc09iamVjdChyZWNlaXZlcikpcmV0dXJuIGZhbHNlO1xuICAgIGV4aXN0aW5nRGVzY3JpcHRvciA9ICQuZ2V0RGVzYyhyZWNlaXZlciwgcHJvcGVydHlLZXkpIHx8IGNyZWF0ZURlc2MoMCk7XG4gICAgZXhpc3RpbmdEZXNjcmlwdG9yLnZhbHVlID0gVjtcbiAgICAkLnNldERlc2MocmVjZWl2ZXIsIHByb3BlcnR5S2V5LCBleGlzdGluZ0Rlc2NyaXB0b3IpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBvd25EZXNjLnNldCA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiAob3duRGVzYy5zZXQuY2FsbChyZWNlaXZlciwgViksIHRydWUpO1xufVxuXG4kZGVmKCRkZWYuUywgJ1JlZmxlY3QnLCB7c2V0OiBzZXR9KTsiLCJ2YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgZ2xvYmFsICA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxuICAsIGNvZiAgICAgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCAkZmxhZ3MgID0gcmVxdWlyZSgnLi8kLmZsYWdzJylcbiAgLCAkUmVnRXhwID0gZ2xvYmFsLlJlZ0V4cFxuICAsIEJhc2UgICAgPSAkUmVnRXhwXG4gICwgcHJvdG8gICA9ICRSZWdFeHAucHJvdG90eXBlXG4gICwgcmUgICAgICA9IC9hL2dcbiAgLy8gXCJuZXdcIiBjcmVhdGVzIGEgbmV3IG9iamVjdFxuICAsIENPUlJFQ1RfTkVXID0gbmV3ICRSZWdFeHAocmUpICE9PSByZVxuICAvLyBSZWdFeHAgYWxsb3dzIGEgcmVnZXggd2l0aCBmbGFncyBhcyB0aGUgcGF0dGVyblxuICAsIEFMTE9XU19SRV9XSVRIX0ZMQUdTID0gZnVuY3Rpb24oKXtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuICRSZWdFeHAocmUsICdpJykgPT0gJy9hL2knO1xuICAgIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbiAgfSgpO1xuXG5pZihyZXF1aXJlKCcuLyQuc3VwcG9ydC1kZXNjJykpe1xuICBpZighQ09SUkVDVF9ORVcgfHwgIUFMTE9XU19SRV9XSVRIX0ZMQUdTKXtcbiAgICAkUmVnRXhwID0gZnVuY3Rpb24gUmVnRXhwKHBhdHRlcm4sIGZsYWdzKXtcbiAgICAgIHZhciBwYXR0ZXJuSXNSZWdFeHAgID0gY29mKHBhdHRlcm4pID09ICdSZWdFeHAnXG4gICAgICAgICwgZmxhZ3NJc1VuZGVmaW5lZCA9IGZsYWdzID09PSB1bmRlZmluZWQ7XG4gICAgICBpZighKHRoaXMgaW5zdGFuY2VvZiAkUmVnRXhwKSAmJiBwYXR0ZXJuSXNSZWdFeHAgJiYgZmxhZ3NJc1VuZGVmaW5lZClyZXR1cm4gcGF0dGVybjtcbiAgICAgIHJldHVybiBDT1JSRUNUX05FV1xuICAgICAgICA/IG5ldyBCYXNlKHBhdHRlcm5Jc1JlZ0V4cCAmJiAhZmxhZ3NJc1VuZGVmaW5lZCA/IHBhdHRlcm4uc291cmNlIDogcGF0dGVybiwgZmxhZ3MpXG4gICAgICAgIDogbmV3IEJhc2UocGF0dGVybklzUmVnRXhwID8gcGF0dGVybi5zb3VyY2UgOiBwYXR0ZXJuXG4gICAgICAgICAgLCBwYXR0ZXJuSXNSZWdFeHAgJiYgZmxhZ3NJc1VuZGVmaW5lZCA/ICRmbGFncy5jYWxsKHBhdHRlcm4pIDogZmxhZ3MpO1xuICAgIH07XG4gICAgJC5lYWNoLmNhbGwoJC5nZXROYW1lcyhCYXNlKSwgZnVuY3Rpb24oa2V5KXtcbiAgICAgIGtleSBpbiAkUmVnRXhwIHx8ICQuc2V0RGVzYygkUmVnRXhwLCBrZXksIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiBCYXNlW2tleV07IH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oaXQpeyBCYXNlW2tleV0gPSBpdDsgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcHJvdG8uY29uc3RydWN0b3IgPSAkUmVnRXhwO1xuICAgICRSZWdFeHAucHJvdG90eXBlID0gcHJvdG87XG4gICAgcmVxdWlyZSgnLi8kLnJlZGVmJykoZ2xvYmFsLCAnUmVnRXhwJywgJFJlZ0V4cCk7XG4gIH1cbn1cblxucmVxdWlyZSgnLi8kLnNwZWNpZXMnKSgkUmVnRXhwKTsiLCIvLyAyMS4yLjUuMyBnZXQgUmVnRXhwLnByb3RvdHlwZS5mbGFncygpXG52YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xuaWYocmVxdWlyZSgnLi8kLnN1cHBvcnQtZGVzYycpICYmIC8uL2cuZmxhZ3MgIT0gJ2cnKSQuc2V0RGVzYyhSZWdFeHAucHJvdG90eXBlLCAnZmxhZ3MnLCB7XG4gIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgZ2V0OiByZXF1aXJlKCcuLyQuZmxhZ3MnKVxufSk7IiwiLy8gQEBtYXRjaCBsb2dpY1xucmVxdWlyZSgnLi8kLmZpeC1yZS13a3MnKSgnbWF0Y2gnLCAxLCBmdW5jdGlvbihNQVRDSCl7XG4gIC8vIDIxLjEuMy4xMSBTdHJpbmcucHJvdG90eXBlLm1hdGNoKHJlZ2V4cClcbiAgcmV0dXJuIGZ1bmN0aW9uIG1hdGNoKHJlZ2V4cCl7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIHZhciBzdHIgPSBTdHJpbmcodGhpcylcbiAgICAgICwgZm4gID0gcmVnZXhwID09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IHJlZ2V4cFtNQVRDSF07XG4gICAgcmV0dXJuIGZuICE9PSB1bmRlZmluZWQgPyBmbi5jYWxsKHJlZ2V4cCwgc3RyKSA6IG5ldyBSZWdFeHAocmVnZXhwKVtNQVRDSF0oc3RyKTtcbiAgfTtcbn0pOyIsIi8vIEBAcmVwbGFjZSBsb2dpY1xucmVxdWlyZSgnLi8kLmZpeC1yZS13a3MnKSgncmVwbGFjZScsIDIsIGZ1bmN0aW9uKFJFUExBQ0UsICRyZXBsYWNlKXtcbiAgLy8gMjEuMS4zLjE0IFN0cmluZy5wcm90b3R5cGUucmVwbGFjZShzZWFyY2hWYWx1ZSwgcmVwbGFjZVZhbHVlKVxuICByZXR1cm4gZnVuY3Rpb24gcmVwbGFjZShzZWFyY2hWYWx1ZSwgcmVwbGFjZVZhbHVlKXtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgdmFyIHN0ciA9IFN0cmluZyh0aGlzKVxuICAgICAgLCBmbiAgPSBzZWFyY2hWYWx1ZSA9PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBzZWFyY2hWYWx1ZVtSRVBMQUNFXTtcbiAgICByZXR1cm4gZm4gIT09IHVuZGVmaW5lZFxuICAgICAgPyBmbi5jYWxsKHNlYXJjaFZhbHVlLCBzdHIsIHJlcGxhY2VWYWx1ZSlcbiAgICAgIDogJHJlcGxhY2UuY2FsbChzdHIsIHNlYXJjaFZhbHVlLCByZXBsYWNlVmFsdWUpO1xuICB9O1xufSk7IiwiLy8gQEBzZWFyY2ggbG9naWNcbnJlcXVpcmUoJy4vJC5maXgtcmUtd2tzJykoJ3NlYXJjaCcsIDEsIGZ1bmN0aW9uKFNFQVJDSCl7XG4gIC8vIDIxLjEuMy4xNSBTdHJpbmcucHJvdG90eXBlLnNlYXJjaChyZWdleHApXG4gIHJldHVybiBmdW5jdGlvbiBzZWFyY2gocmVnZXhwKXtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgdmFyIHN0ciA9IFN0cmluZyh0aGlzKVxuICAgICAgLCBmbiAgPSByZWdleHAgPT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogcmVnZXhwW1NFQVJDSF07XG4gICAgcmV0dXJuIGZuICE9PSB1bmRlZmluZWQgPyBmbi5jYWxsKHJlZ2V4cCwgc3RyKSA6IG5ldyBSZWdFeHAocmVnZXhwKVtTRUFSQ0hdKHN0cik7XG4gIH07XG59KTsiLCIvLyBAQHNwbGl0IGxvZ2ljXG5yZXF1aXJlKCcuLyQuZml4LXJlLXdrcycpKCdzcGxpdCcsIDIsIGZ1bmN0aW9uKFNQTElULCAkc3BsaXQpe1xuICAvLyAyMS4xLjMuMTcgU3RyaW5nLnByb3RvdHlwZS5zcGxpdChzZXBhcmF0b3IsIGxpbWl0KVxuICByZXR1cm4gZnVuY3Rpb24gc3BsaXQoc2VwYXJhdG9yLCBsaW1pdCl7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIHZhciBzdHIgPSBTdHJpbmcodGhpcylcbiAgICAgICwgZm4gID0gc2VwYXJhdG9yID09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IHNlcGFyYXRvcltTUExJVF07XG4gICAgcmV0dXJuIGZuICE9PSB1bmRlZmluZWQgPyBmbi5jYWxsKHNlcGFyYXRvciwgc3RyLCBsaW1pdCkgOiAkc3BsaXQuY2FsbChzdHIsIHNlcGFyYXRvciwgbGltaXQpO1xuICB9O1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHN0cm9uZyA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXN0cm9uZycpO1xuXG4vLyAyMy4yIFNldCBPYmplY3RzXG5yZXF1aXJlKCcuLyQuY29sbGVjdGlvbicpKCdTZXQnLCBmdW5jdGlvbihnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24gU2V0KCl7IHJldHVybiBnZXQodGhpcywgYXJndW1lbnRzWzBdKTsgfTtcbn0sIHtcbiAgLy8gMjMuMi4zLjEgU2V0LnByb3RvdHlwZS5hZGQodmFsdWUpXG4gIGFkZDogZnVuY3Rpb24gYWRkKHZhbHVlKXtcbiAgICByZXR1cm4gc3Ryb25nLmRlZih0aGlzLCB2YWx1ZSA9IHZhbHVlID09PSAwID8gMCA6IHZhbHVlLCB2YWx1ZSk7XG4gIH1cbn0sIHN0cm9uZyk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkYXQgID0gcmVxdWlyZSgnLi8kLnN0cmluZy1hdCcpKGZhbHNlKTtcbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xuICAvLyAyMS4xLjMuMyBTdHJpbmcucHJvdG90eXBlLmNvZGVQb2ludEF0KHBvcylcbiAgY29kZVBvaW50QXQ6IGZ1bmN0aW9uIGNvZGVQb2ludEF0KHBvcyl7XG4gICAgcmV0dXJuICRhdCh0aGlzLCBwb3MpO1xuICB9XG59KTsiLCIndXNlIHN0cmljdCc7XG52YXIgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vJC50by1sZW5ndGgnKVxuICAsIGNvbnRleHQgID0gcmVxdWlyZSgnLi8kLnN0cmluZy1jb250ZXh0Jyk7XG5cbi8vIHNob3VsZCB0aHJvdyBlcnJvciBvbiByZWdleFxuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiAhcmVxdWlyZSgnLi8kLnRocm93cycpKGZ1bmN0aW9uKCl7ICdxJy5lbmRzV2l0aCgvLi8pOyB9KSwgJ1N0cmluZycsIHtcbiAgLy8gMjEuMS4zLjYgU3RyaW5nLnByb3RvdHlwZS5lbmRzV2l0aChzZWFyY2hTdHJpbmcgWywgZW5kUG9zaXRpb25dKVxuICBlbmRzV2l0aDogZnVuY3Rpb24gZW5kc1dpdGgoc2VhcmNoU3RyaW5nIC8qLCBlbmRQb3NpdGlvbiA9IEBsZW5ndGggKi8pe1xuICAgIHZhciB0aGF0ID0gY29udGV4dCh0aGlzLCBzZWFyY2hTdHJpbmcsICdlbmRzV2l0aCcpXG4gICAgICAsIGVuZFBvc2l0aW9uID0gYXJndW1lbnRzWzFdXG4gICAgICAsIGxlbiAgICA9IHRvTGVuZ3RoKHRoYXQubGVuZ3RoKVxuICAgICAgLCBlbmQgICAgPSBlbmRQb3NpdGlvbiA9PT0gdW5kZWZpbmVkID8gbGVuIDogTWF0aC5taW4odG9MZW5ndGgoZW5kUG9zaXRpb24pLCBsZW4pXG4gICAgICAsIHNlYXJjaCA9IFN0cmluZyhzZWFyY2hTdHJpbmcpO1xuICAgIHJldHVybiB0aGF0LnNsaWNlKGVuZCAtIHNlYXJjaC5sZW5ndGgsIGVuZCkgPT09IHNlYXJjaDtcbiAgfVxufSk7IiwidmFyICRkZWYgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCB0b0luZGV4ID0gcmVxdWlyZSgnLi8kLnRvLWluZGV4JylcbiAgLCBmcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlXG4gICwgJGZyb21Db2RlUG9pbnQgPSBTdHJpbmcuZnJvbUNvZGVQb2ludDtcblxuLy8gbGVuZ3RoIHNob3VsZCBiZSAxLCBvbGQgRkYgcHJvYmxlbVxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAoISEkZnJvbUNvZGVQb2ludCAmJiAkZnJvbUNvZGVQb2ludC5sZW5ndGggIT0gMSksICdTdHJpbmcnLCB7XG4gIC8vIDIxLjEuMi4yIFN0cmluZy5mcm9tQ29kZVBvaW50KC4uLmNvZGVQb2ludHMpXG4gIGZyb21Db2RlUG9pbnQ6IGZ1bmN0aW9uIGZyb21Db2RlUG9pbnQoeCl7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICB2YXIgcmVzID0gW11cbiAgICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgLCBpICAgPSAwXG4gICAgICAsIGNvZGU7XG4gICAgd2hpbGUobGVuID4gaSl7XG4gICAgICBjb2RlID0gK2FyZ3VtZW50c1tpKytdO1xuICAgICAgaWYodG9JbmRleChjb2RlLCAweDEwZmZmZikgIT09IGNvZGUpdGhyb3cgUmFuZ2VFcnJvcihjb2RlICsgJyBpcyBub3QgYSB2YWxpZCBjb2RlIHBvaW50Jyk7XG4gICAgICByZXMucHVzaChjb2RlIDwgMHgxMDAwMFxuICAgICAgICA/IGZyb21DaGFyQ29kZShjb2RlKVxuICAgICAgICA6IGZyb21DaGFyQ29kZSgoKGNvZGUgLT0gMHgxMDAwMCkgPj4gMTApICsgMHhkODAwLCBjb2RlICUgMHg0MDAgKyAweGRjMDApXG4gICAgICApO1xuICAgIH0gcmV0dXJuIHJlcy5qb2luKCcnKTtcbiAgfVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICRkZWYgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBjb250ZXh0ID0gcmVxdWlyZSgnLi8kLnN0cmluZy1jb250ZXh0Jyk7XG5cbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xuICAvLyAyMS4xLjMuNyBTdHJpbmcucHJvdG90eXBlLmluY2x1ZGVzKHNlYXJjaFN0cmluZywgcG9zaXRpb24gPSAwKVxuICBpbmNsdWRlczogZnVuY3Rpb24gaW5jbHVkZXMoc2VhcmNoU3RyaW5nIC8qLCBwb3NpdGlvbiA9IDAgKi8pe1xuICAgIHJldHVybiAhIX5jb250ZXh0KHRoaXMsIHNlYXJjaFN0cmluZywgJ2luY2x1ZGVzJykuaW5kZXhPZihzZWFyY2hTdHJpbmcsIGFyZ3VtZW50c1sxXSk7XG4gIH1cbn0pOyIsInZhciAkYXQgID0gcmVxdWlyZSgnLi8kLnN0cmluZy1hdCcpKHRydWUpO1xuXG4vLyAyMS4xLjMuMjcgU3RyaW5nLnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuLyQuaXRlci1kZWZpbmUnKShTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbihpdGVyYXRlZCl7XG4gIHRoaXMuX3QgPSBTdHJpbmcoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbi8vIDIxLjEuNS4yLjEgJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcbn0sIGZ1bmN0aW9uKCl7XG4gIHZhciBPICAgICA9IHRoaXMuX3RcbiAgICAsIGluZGV4ID0gdGhpcy5faVxuICAgICwgcG9pbnQ7XG4gIGlmKGluZGV4ID49IE8ubGVuZ3RoKXJldHVybiB7dmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZX07XG4gIHBvaW50ID0gJGF0KE8sIGluZGV4KTtcbiAgdGhpcy5faSArPSBwb2ludC5sZW5ndGg7XG4gIHJldHVybiB7dmFsdWU6IHBvaW50LCBkb25lOiBmYWxzZX07XG59KTsiLCJ2YXIgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCB0b09iamVjdCA9IHJlcXVpcmUoJy4vJC50by1vYmplY3QnKVxuICAsIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi8kLnRvLWxlbmd0aCcpO1xuXG4kZGVmKCRkZWYuUywgJ1N0cmluZycsIHtcbiAgLy8gMjEuMS4yLjQgU3RyaW5nLnJhdyhjYWxsU2l0ZSwgLi4uc3Vic3RpdHV0aW9ucylcbiAgcmF3OiBmdW5jdGlvbiByYXcoY2FsbFNpdGUpe1xuICAgIHZhciB0cGwgPSB0b09iamVjdChjYWxsU2l0ZS5yYXcpXG4gICAgICAsIGxlbiA9IHRvTGVuZ3RoKHRwbC5sZW5ndGgpXG4gICAgICAsIHNsbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgICwgcmVzID0gW11cbiAgICAgICwgaSAgID0gMDtcbiAgICB3aGlsZShsZW4gPiBpKXtcbiAgICAgIHJlcy5wdXNoKFN0cmluZyh0cGxbaSsrXSkpO1xuICAgICAgaWYoaSA8IHNsbilyZXMucHVzaChTdHJpbmcoYXJndW1lbnRzW2ldKSk7XG4gICAgfSByZXR1cm4gcmVzLmpvaW4oJycpO1xuICB9XG59KTsiLCJ2YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcblxuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XG4gIC8vIDIxLjEuMy4xMyBTdHJpbmcucHJvdG90eXBlLnJlcGVhdChjb3VudClcbiAgcmVwZWF0OiByZXF1aXJlKCcuLyQuc3RyaW5nLXJlcGVhdCcpXG59KTsiLCIndXNlIHN0cmljdCc7XG52YXIgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vJC50by1sZW5ndGgnKVxuICAsIGNvbnRleHQgID0gcmVxdWlyZSgnLi8kLnN0cmluZy1jb250ZXh0Jyk7XG5cbi8vIHNob3VsZCB0aHJvdyBlcnJvciBvbiByZWdleFxuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiAhcmVxdWlyZSgnLi8kLnRocm93cycpKGZ1bmN0aW9uKCl7ICdxJy5zdGFydHNXaXRoKC8uLyk7IH0pLCAnU3RyaW5nJywge1xuICAvLyAyMS4xLjMuMTggU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoKHNlYXJjaFN0cmluZyBbLCBwb3NpdGlvbiBdKVxuICBzdGFydHNXaXRoOiBmdW5jdGlvbiBzdGFydHNXaXRoKHNlYXJjaFN0cmluZyAvKiwgcG9zaXRpb24gPSAwICovKXtcbiAgICB2YXIgdGhhdCAgID0gY29udGV4dCh0aGlzLCBzZWFyY2hTdHJpbmcsICdzdGFydHNXaXRoJylcbiAgICAgICwgaW5kZXggID0gdG9MZW5ndGgoTWF0aC5taW4oYXJndW1lbnRzWzFdLCB0aGF0Lmxlbmd0aCkpXG4gICAgICAsIHNlYXJjaCA9IFN0cmluZyhzZWFyY2hTdHJpbmcpO1xuICAgIHJldHVybiB0aGF0LnNsaWNlKGluZGV4LCBpbmRleCArIHNlYXJjaC5sZW5ndGgpID09PSBzZWFyY2g7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0Jztcbi8vIEVDTUFTY3JpcHQgNiBzeW1ib2xzIHNoaW1cbnZhciAkICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgZ2xvYmFsICAgICAgICAgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJylcbiAgLCBoYXMgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5oYXMnKVxuICAsIFNVUFBPUlRfREVTQyAgID0gcmVxdWlyZSgnLi8kLnN1cHBvcnQtZGVzYycpXG4gICwgJGRlZiAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkcmVkZWYgICAgICAgICA9IHJlcXVpcmUoJy4vJC5yZWRlZicpXG4gICwgc2hhcmVkICAgICAgICAgPSByZXF1aXJlKCcuLyQuc2hhcmVkJylcbiAgLCBzZXRUYWcgICAgICAgICA9IHJlcXVpcmUoJy4vJC50YWcnKVxuICAsIHVpZCAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpXG4gICwgd2tzICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQud2tzJylcbiAgLCBrZXlPZiAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5rZXlvZicpXG4gICwgJG5hbWVzICAgICAgICAgPSByZXF1aXJlKCcuLyQuZ2V0LW5hbWVzJylcbiAgLCBlbnVtS2V5cyAgICAgICA9IHJlcXVpcmUoJy4vJC5lbnVtLWtleXMnKVxuICAsIGFuT2JqZWN0ICAgICAgID0gcmVxdWlyZSgnLi8kLmFuLW9iamVjdCcpXG4gICwgdG9PYmplY3QgICAgICAgPSByZXF1aXJlKCcuLyQudG8tb2JqZWN0JylcbiAgLCBjcmVhdGVEZXNjICAgICA9IHJlcXVpcmUoJy4vJC5wcm9wZXJ0eS1kZXNjJylcbiAgLCBnZXREZXNjICAgICAgICA9ICQuZ2V0RGVzY1xuICAsIHNldERlc2MgICAgICAgID0gJC5zZXREZXNjXG4gICwgJGNyZWF0ZSAgICAgICAgPSAkLmNyZWF0ZVxuICAsIGdldE5hbWVzICAgICAgID0gJG5hbWVzLmdldFxuICAsICRTeW1ib2wgICAgICAgID0gZ2xvYmFsLlN5bWJvbFxuICAsIHNldHRlciAgICAgICAgID0gZmFsc2VcbiAgLCBISURERU4gICAgICAgICA9IHdrcygnX2hpZGRlbicpXG4gICwgaXNFbnVtICAgICAgICAgPSAkLmlzRW51bVxuICAsIFN5bWJvbFJlZ2lzdHJ5ID0gc2hhcmVkKCdzeW1ib2wtcmVnaXN0cnknKVxuICAsIEFsbFN5bWJvbHMgICAgID0gc2hhcmVkKCdzeW1ib2xzJylcbiAgLCB1c2VOYXRpdmUgICAgICA9IHR5cGVvZiAkU3ltYm9sID09ICdmdW5jdGlvbidcbiAgLCBPYmplY3RQcm90byAgICA9IE9iamVjdC5wcm90b3R5cGU7XG5cbnZhciBzZXRTeW1ib2xEZXNjID0gU1VQUE9SVF9ERVNDID8gZnVuY3Rpb24oKXsgLy8gZmFsbGJhY2sgZm9yIG9sZCBBbmRyb2lkXG4gIHRyeSB7XG4gICAgcmV0dXJuICRjcmVhdGUoc2V0RGVzYyh7fSwgSElEREVOLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBzZXREZXNjKHRoaXMsIEhJRERFTiwge3ZhbHVlOiBmYWxzZX0pW0hJRERFTl07XG4gICAgICB9XG4gICAgfSkpW0hJRERFTl0gfHwgc2V0RGVzYztcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oaXQsIGtleSwgRCl7XG4gICAgICB2YXIgcHJvdG9EZXNjID0gZ2V0RGVzYyhPYmplY3RQcm90bywga2V5KTtcbiAgICAgIGlmKHByb3RvRGVzYylkZWxldGUgT2JqZWN0UHJvdG9ba2V5XTtcbiAgICAgIHNldERlc2MoaXQsIGtleSwgRCk7XG4gICAgICBpZihwcm90b0Rlc2MgJiYgaXQgIT09IE9iamVjdFByb3RvKXNldERlc2MoT2JqZWN0UHJvdG8sIGtleSwgcHJvdG9EZXNjKTtcbiAgICB9O1xuICB9XG59KCkgOiBzZXREZXNjO1xuXG5mdW5jdGlvbiB3cmFwKHRhZyl7XG4gIHZhciBzeW0gPSBBbGxTeW1ib2xzW3RhZ10gPSAkY3JlYXRlKCRTeW1ib2wucHJvdG90eXBlKTtcbiAgc3ltLl9rID0gdGFnO1xuICBTVVBQT1JUX0RFU0MgJiYgc2V0dGVyICYmIHNldFN5bWJvbERlc2MoT2JqZWN0UHJvdG8sIHRhZywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIGlmKGhhcyh0aGlzLCBISURERU4pICYmIGhhcyh0aGlzW0hJRERFTl0sIHRhZykpdGhpc1tISURERU5dW3RhZ10gPSBmYWxzZTtcbiAgICAgIHNldFN5bWJvbERlc2ModGhpcywgdGFnLCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHN5bTtcbn1cblxuZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgRCl7XG4gIGlmKEQgJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkpe1xuICAgIGlmKCFELmVudW1lcmFibGUpe1xuICAgICAgaWYoIWhhcyhpdCwgSElEREVOKSlzZXREZXNjKGl0LCBISURERU4sIGNyZWF0ZURlc2MoMSwge30pKTtcbiAgICAgIGl0W0hJRERFTl1ba2V5XSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0paXRbSElEREVOXVtrZXldID0gZmFsc2U7XG4gICAgICBEID0gJGNyZWF0ZShELCB7ZW51bWVyYWJsZTogY3JlYXRlRGVzYygwLCBmYWxzZSl9KTtcbiAgICB9IHJldHVybiBzZXRTeW1ib2xEZXNjKGl0LCBrZXksIEQpO1xuICB9IHJldHVybiBzZXREZXNjKGl0LCBrZXksIEQpO1xufVxuZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhpdCwgUCl7XG4gIGFuT2JqZWN0KGl0KTtcbiAgdmFyIGtleXMgPSBlbnVtS2V5cyhQID0gdG9PYmplY3QoUCkpXG4gICAgLCBpICAgID0gMFxuICAgICwgbCA9IGtleXMubGVuZ3RoXG4gICAgLCBrZXk7XG4gIHdoaWxlKGwgPiBpKWRlZmluZVByb3BlcnR5KGl0LCBrZXkgPSBrZXlzW2krK10sIFBba2V5XSk7XG4gIHJldHVybiBpdDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZShpdCwgUCl7XG4gIHJldHVybiBQID09PSB1bmRlZmluZWQgPyAkY3JlYXRlKGl0KSA6IGRlZmluZVByb3BlcnRpZXMoJGNyZWF0ZShpdCksIFApO1xufVxuZnVuY3Rpb24gcHJvcGVydHlJc0VudW1lcmFibGUoa2V5KXtcbiAgdmFyIEUgPSBpc0VudW0uY2FsbCh0aGlzLCBrZXkpO1xuICByZXR1cm4gRSB8fCAhaGFzKHRoaXMsIGtleSkgfHwgIWhhcyhBbGxTeW1ib2xzLCBrZXkpIHx8IGhhcyh0aGlzLCBISURERU4pICYmIHRoaXNbSElEREVOXVtrZXldXG4gICAgPyBFIDogdHJ1ZTtcbn1cbmZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcbiAgdmFyIEQgPSBnZXREZXNjKGl0ID0gdG9PYmplY3QoaXQpLCBrZXkpO1xuICBpZihEICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICEoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkpRC5lbnVtZXJhYmxlID0gdHJ1ZTtcbiAgcmV0dXJuIEQ7XG59XG5mdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KXtcbiAgdmFyIG5hbWVzICA9IGdldE5hbWVzKHRvT2JqZWN0KGl0KSlcbiAgICAsIHJlc3VsdCA9IFtdXG4gICAgLCBpICAgICAgPSAwXG4gICAgLCBrZXk7XG4gIHdoaWxlKG5hbWVzLmxlbmd0aCA+IGkpaWYoIWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiBrZXkgIT0gSElEREVOKXJlc3VsdC5wdXNoKGtleSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoaXQpe1xuICB2YXIgbmFtZXMgID0gZ2V0TmFtZXModG9PYmplY3QoaXQpKVxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGkgICAgICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZihoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkpcmVzdWx0LnB1c2goQWxsU3ltYm9sc1trZXldKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gMTkuNC4xLjEgU3ltYm9sKFtkZXNjcmlwdGlvbl0pXG5pZighdXNlTmF0aXZlKXtcbiAgJFN5bWJvbCA9IGZ1bmN0aW9uIFN5bWJvbCgpe1xuICAgIGlmKHRoaXMgaW5zdGFuY2VvZiAkU3ltYm9sKXRocm93IFR5cGVFcnJvcignU3ltYm9sIGlzIG5vdCBhIGNvbnN0cnVjdG9yJyk7XG4gICAgcmV0dXJuIHdyYXAodWlkKGFyZ3VtZW50c1swXSkpO1xuICB9O1xuICAkcmVkZWYoJFN5bWJvbC5wcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuX2s7XG4gIH0pO1xuXG4gICQuY3JlYXRlICAgICA9IGNyZWF0ZTtcbiAgJC5pc0VudW0gICAgID0gcHJvcGVydHlJc0VudW1lcmFibGU7XG4gICQuZ2V0RGVzYyAgICA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgJC5zZXREZXNjICAgID0gZGVmaW5lUHJvcGVydHk7XG4gICQuc2V0RGVzY3MgICA9IGRlZmluZVByb3BlcnRpZXM7XG4gICQuZ2V0TmFtZXMgICA9ICRuYW1lcy5nZXQgPSBnZXRPd25Qcm9wZXJ0eU5hbWVzO1xuICAkLmdldFN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbiAgaWYoU1VQUE9SVF9ERVNDICYmICFyZXF1aXJlKCcuLyQubGlicmFyeScpKXtcbiAgICAkcmVkZWYoT2JqZWN0UHJvdG8sICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsIHByb3BlcnR5SXNFbnVtZXJhYmxlLCB0cnVlKTtcbiAgfVxufVxuXG52YXIgc3ltYm9sU3RhdGljcyA9IHtcbiAgLy8gMTkuNC4yLjEgU3ltYm9sLmZvcihrZXkpXG4gICdmb3InOiBmdW5jdGlvbihrZXkpe1xuICAgIHJldHVybiBoYXMoU3ltYm9sUmVnaXN0cnksIGtleSArPSAnJylcbiAgICAgID8gU3ltYm9sUmVnaXN0cnlba2V5XVxuICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gJFN5bWJvbChrZXkpO1xuICB9LFxuICAvLyAxOS40LjIuNSBTeW1ib2wua2V5Rm9yKHN5bSlcbiAga2V5Rm9yOiBmdW5jdGlvbiBrZXlGb3Ioa2V5KXtcbiAgICByZXR1cm4ga2V5T2YoU3ltYm9sUmVnaXN0cnksIGtleSk7XG4gIH0sXG4gIHVzZVNldHRlcjogZnVuY3Rpb24oKXsgc2V0dGVyID0gdHJ1ZTsgfSxcbiAgdXNlU2ltcGxlOiBmdW5jdGlvbigpeyBzZXR0ZXIgPSBmYWxzZTsgfVxufTtcbi8vIDE5LjQuMi4yIFN5bWJvbC5oYXNJbnN0YW5jZVxuLy8gMTkuNC4yLjMgU3ltYm9sLmlzQ29uY2F0U3ByZWFkYWJsZVxuLy8gMTkuNC4yLjQgU3ltYm9sLml0ZXJhdG9yXG4vLyAxOS40LjIuNiBTeW1ib2wubWF0Y2hcbi8vIDE5LjQuMi44IFN5bWJvbC5yZXBsYWNlXG4vLyAxOS40LjIuOSBTeW1ib2wuc2VhcmNoXG4vLyAxOS40LjIuMTAgU3ltYm9sLnNwZWNpZXNcbi8vIDE5LjQuMi4xMSBTeW1ib2wuc3BsaXRcbi8vIDE5LjQuMi4xMiBTeW1ib2wudG9QcmltaXRpdmVcbi8vIDE5LjQuMi4xMyBTeW1ib2wudG9TdHJpbmdUYWdcbi8vIDE5LjQuMi4xNCBTeW1ib2wudW5zY29wYWJsZXNcbiQuZWFjaC5jYWxsKChcbiAgICAnaGFzSW5zdGFuY2UsaXNDb25jYXRTcHJlYWRhYmxlLGl0ZXJhdG9yLG1hdGNoLHJlcGxhY2Usc2VhcmNoLCcgK1xuICAgICdzcGVjaWVzLHNwbGl0LHRvUHJpbWl0aXZlLHRvU3RyaW5nVGFnLHVuc2NvcGFibGVzJ1xuICApLnNwbGl0KCcsJyksIGZ1bmN0aW9uKGl0KXtcbiAgICB2YXIgc3ltID0gd2tzKGl0KTtcbiAgICBzeW1ib2xTdGF0aWNzW2l0XSA9IHVzZU5hdGl2ZSA/IHN5bSA6IHdyYXAoc3ltKTtcbiAgfVxuKTtcblxuc2V0dGVyID0gdHJ1ZTtcblxuJGRlZigkZGVmLkcgKyAkZGVmLlcsIHtTeW1ib2w6ICRTeW1ib2x9KTtcblxuJGRlZigkZGVmLlMsICdTeW1ib2wnLCBzeW1ib2xTdGF0aWNzKTtcblxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhdXNlTmF0aXZlLCAnT2JqZWN0Jywge1xuICAvLyAxOS4xLjIuMiBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG4gIGNyZWF0ZTogY3JlYXRlLFxuICAvLyAxOS4xLjIuNCBPYmplY3QuZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcylcbiAgZGVmaW5lUHJvcGVydHk6IGRlZmluZVByb3BlcnR5LFxuICAvLyAxOS4xLjIuMyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKVxuICBkZWZpbmVQcm9wZXJ0aWVzOiBkZWZpbmVQcm9wZXJ0aWVzLFxuICAvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxuICAvLyAxOS4xLjIuNyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxuICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiBnZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICAvLyAxOS4xLjIuOCBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKE8pXG4gIGdldE93blByb3BlcnR5U3ltYm9sczogZ2V0T3duUHJvcGVydHlTeW1ib2xzXG59KTtcblxuLy8gMTkuNC4zLjUgU3ltYm9sLnByb3RvdHlwZVtAQHRvU3RyaW5nVGFnXVxuc2V0VGFnKCRTeW1ib2wsICdTeW1ib2wnKTtcbi8vIDIwLjIuMS45IE1hdGhbQEB0b1N0cmluZ1RhZ11cbnNldFRhZyhNYXRoLCAnTWF0aCcsIHRydWUpO1xuLy8gMjQuMy4zIEpTT05bQEB0b1N0cmluZ1RhZ11cbnNldFRhZyhnbG9iYWwuSlNPTiwgJ0pTT04nLCB0cnVlKTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCB3ZWFrICAgICAgICAgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi13ZWFrJylcbiAgLCBpc09iamVjdCAgICAgPSByZXF1aXJlKCcuLyQuaXMtb2JqZWN0JylcbiAgLCBoYXMgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaGFzJylcbiAgLCBmcm96ZW5TdG9yZSAgPSB3ZWFrLmZyb3plblN0b3JlXG4gICwgV0VBSyAgICAgICAgID0gd2Vhay5XRUFLXG4gICwgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCBpc09iamVjdFxuICAsIHRtcCAgICAgICAgICA9IHt9O1xuXG4vLyAyMy4zIFdlYWtNYXAgT2JqZWN0c1xudmFyICRXZWFrTWFwID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnV2Vha01hcCcsIGZ1bmN0aW9uKGdldCl7XG4gIHJldHVybiBmdW5jdGlvbiBXZWFrTWFwKCl7IHJldHVybiBnZXQodGhpcywgYXJndW1lbnRzWzBdKTsgfTtcbn0sIHtcbiAgLy8gMjMuMy4zLjMgV2Vha01hcC5wcm90b3R5cGUuZ2V0KGtleSlcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoa2V5KXtcbiAgICBpZihpc09iamVjdChrZXkpKXtcbiAgICAgIGlmKCFpc0V4dGVuc2libGUoa2V5KSlyZXR1cm4gZnJvemVuU3RvcmUodGhpcykuZ2V0KGtleSk7XG4gICAgICBpZihoYXMoa2V5LCBXRUFLKSlyZXR1cm4ga2V5W1dFQUtdW3RoaXMuX2ldO1xuICAgIH1cbiAgfSxcbiAgLy8gMjMuMy4zLjUgV2Vha01hcC5wcm90b3R5cGUuc2V0KGtleSwgdmFsdWUpXG4gIHNldDogZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpe1xuICAgIHJldHVybiB3ZWFrLmRlZih0aGlzLCBrZXksIHZhbHVlKTtcbiAgfVxufSwgd2VhaywgdHJ1ZSwgdHJ1ZSk7XG5cbi8vIElFMTEgV2Vha01hcCBmcm96ZW4ga2V5cyBmaXhcbmlmKG5ldyAkV2Vha01hcCgpLnNldCgoT2JqZWN0LmZyZWV6ZSB8fCBPYmplY3QpKHRtcCksIDcpLmdldCh0bXApICE9IDcpe1xuICAkLmVhY2guY2FsbChbJ2RlbGV0ZScsICdoYXMnLCAnZ2V0JywgJ3NldCddLCBmdW5jdGlvbihrZXkpe1xuICAgIHZhciBwcm90byAgPSAkV2Vha01hcC5wcm90b3R5cGVcbiAgICAgICwgbWV0aG9kID0gcHJvdG9ba2V5XTtcbiAgICByZXF1aXJlKCcuLyQucmVkZWYnKShwcm90bywga2V5LCBmdW5jdGlvbihhLCBiKXtcbiAgICAgIC8vIHN0b3JlIGZyb3plbiBvYmplY3RzIG9uIGxlYWt5IG1hcFxuICAgICAgaWYoaXNPYmplY3QoYSkgJiYgIWlzRXh0ZW5zaWJsZShhKSl7XG4gICAgICAgIHZhciByZXN1bHQgPSBmcm96ZW5TdG9yZSh0aGlzKVtrZXldKGEsIGIpO1xuICAgICAgICByZXR1cm4ga2V5ID09ICdzZXQnID8gdGhpcyA6IHJlc3VsdDtcbiAgICAgIC8vIHN0b3JlIGFsbCB0aGUgcmVzdCBvbiBuYXRpdmUgd2Vha21hcFxuICAgICAgfSByZXR1cm4gbWV0aG9kLmNhbGwodGhpcywgYSwgYik7XG4gICAgfSk7XG4gIH0pO1xufSIsIid1c2Ugc3RyaWN0JztcbnZhciB3ZWFrID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24td2VhaycpO1xuXG4vLyAyMy40IFdlYWtTZXQgT2JqZWN0c1xucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnV2Vha1NldCcsIGZ1bmN0aW9uKGdldCl7XG4gIHJldHVybiBmdW5jdGlvbiBXZWFrU2V0KCl7IHJldHVybiBnZXQodGhpcywgYXJndW1lbnRzWzBdKTsgfTtcbn0sIHtcbiAgLy8gMjMuNC4zLjEgV2Vha1NldC5wcm90b3R5cGUuYWRkKHZhbHVlKVxuICBhZGQ6IGZ1bmN0aW9uIGFkZCh2YWx1ZSl7XG4gICAgcmV0dXJuIHdlYWsuZGVmKHRoaXMsIHZhbHVlLCB0cnVlKTtcbiAgfVxufSwgd2VhaywgZmFsc2UsIHRydWUpOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkZGVmICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkaW5jbHVkZXMgPSByZXF1aXJlKCcuLyQuYXJyYXktaW5jbHVkZXMnKSh0cnVlKTtcbiRkZWYoJGRlZi5QLCAnQXJyYXknLCB7XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kb21lbmljL0FycmF5LnByb3RvdHlwZS5pbmNsdWRlc1xuICBpbmNsdWRlczogZnVuY3Rpb24gaW5jbHVkZXMoZWwgLyosIGZyb21JbmRleCA9IDAgKi8pe1xuICAgIHJldHVybiAkaW5jbHVkZXModGhpcywgZWwsIGFyZ3VtZW50c1sxXSk7XG4gIH1cbn0pO1xucmVxdWlyZSgnLi8kLnVuc2NvcGUnKSgnaW5jbHVkZXMnKTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG52YXIgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG5cbiRkZWYoJGRlZi5QLCAnTWFwJywge3RvSlNPTjogcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tdG8tanNvbicpKCdNYXAnKX0pOyIsIi8vIGh0dHA6Ly9nb28uZ2wvWGtCcmpEXG52YXIgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkZW50cmllcyA9IHJlcXVpcmUoJy4vJC5vYmplY3QtdG8tYXJyYXknKSh0cnVlKTtcblxuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7XG4gIGVudHJpZXM6IGZ1bmN0aW9uIGVudHJpZXMoaXQpe1xuICAgIHJldHVybiAkZW50cmllcyhpdCk7XG4gIH1cbn0pOyIsIi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL1dlYlJlZmxlY3Rpb24vOTM1Mzc4MVxudmFyICQgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsICRkZWYgICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBvd25LZXlzICAgID0gcmVxdWlyZSgnLi8kLm93bi1rZXlzJylcbiAgLCB0b09iamVjdCAgID0gcmVxdWlyZSgnLi8kLnRvLW9iamVjdCcpXG4gICwgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vJC5wcm9wZXJ0eS1kZXNjJyk7XG5cbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge1xuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKG9iamVjdCl7XG4gICAgdmFyIE8gICAgICAgPSB0b09iamVjdChvYmplY3QpXG4gICAgICAsIHNldERlc2MgPSAkLnNldERlc2NcbiAgICAgICwgZ2V0RGVzYyA9ICQuZ2V0RGVzY1xuICAgICAgLCBrZXlzICAgID0gb3duS2V5cyhPKVxuICAgICAgLCByZXN1bHQgID0ge31cbiAgICAgICwgaSAgICAgICA9IDBcbiAgICAgICwga2V5LCBEO1xuICAgIHdoaWxlKGtleXMubGVuZ3RoID4gaSl7XG4gICAgICBEID0gZ2V0RGVzYyhPLCBrZXkgPSBrZXlzW2krK10pO1xuICAgICAgaWYoa2V5IGluIHJlc3VsdClzZXREZXNjKHJlc3VsdCwga2V5LCBjcmVhdGVEZXNjKDAsIEQpKTtcbiAgICAgIGVsc2UgcmVzdWx0W2tleV0gPSBEO1xuICAgIH0gcmV0dXJuIHJlc3VsdDtcbiAgfVxufSk7IiwiLy8gaHR0cDovL2dvby5nbC9Ya0JyakRcbnZhciAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJHZhbHVlcyA9IHJlcXVpcmUoJy4vJC5vYmplY3QtdG8tYXJyYXknKShmYWxzZSk7XG5cbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge1xuICB2YWx1ZXM6IGZ1bmN0aW9uIHZhbHVlcyhpdCl7XG4gICAgcmV0dXJuICR2YWx1ZXMoaXQpO1xuICB9XG59KTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vYmVuamFtaW5nci9SZXhFeHAuZXNjYXBlXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICRyZSAgPSByZXF1aXJlKCcuLyQucmVwbGFjZXInKSgvW1xcXFxeJCorPy4oKXxbXFxde31dL2csICdcXFxcJCYnKTtcbiRkZWYoJGRlZi5TLCAnUmVnRXhwJywge2VzY2FwZTogZnVuY3Rpb24gZXNjYXBlKGl0KXsgcmV0dXJuICRyZShpdCk7IH19KTtcbiIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cbnZhciAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcblxuJGRlZigkZGVmLlAsICdTZXQnLCB7dG9KU09OOiByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi10by1qc29uJykoJ1NldCcpfSk7IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL21hdGhpYXNieW5lbnMvU3RyaW5nLnByb3RvdHlwZS5hdFxuJ3VzZSBzdHJpY3QnO1xudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkYXQgID0gcmVxdWlyZSgnLi8kLnN0cmluZy1hdCcpKHRydWUpO1xuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XG4gIGF0OiBmdW5jdGlvbiBhdChwb3Mpe1xuICAgIHJldHVybiAkYXQodGhpcywgcG9zKTtcbiAgfVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkcGFkID0gcmVxdWlyZSgnLi8kLnN0cmluZy1wYWQnKTtcbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xuICBscGFkOiBmdW5jdGlvbiBscGFkKG4pe1xuICAgIHJldHVybiAkcGFkKHRoaXMsIG4sIGFyZ3VtZW50c1sxXSwgdHJ1ZSk7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJHBhZCA9IHJlcXVpcmUoJy4vJC5zdHJpbmctcGFkJyk7XG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcbiAgcnBhZDogZnVuY3Rpb24gcnBhZChuKXtcbiAgICByZXR1cm4gJHBhZCh0aGlzLCBuLCBhcmd1bWVudHNbMV0sIGZhbHNlKTtcbiAgfVxufSk7IiwiLy8gSmF2YVNjcmlwdCAxLjYgLyBTdHJhd21hbiBhcnJheSBzdGF0aWNzIHNoaW1cbnZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJEFycmF5ICA9IHJlcXVpcmUoJy4vJC5jb3JlJykuQXJyYXkgfHwgQXJyYXlcbiAgLCBzdGF0aWNzID0ge307XG5mdW5jdGlvbiBzZXRTdGF0aWNzKGtleXMsIGxlbmd0aCl7XG4gICQuZWFjaC5jYWxsKGtleXMuc3BsaXQoJywnKSwgZnVuY3Rpb24oa2V5KXtcbiAgICBpZihsZW5ndGggPT0gdW5kZWZpbmVkICYmIGtleSBpbiAkQXJyYXkpc3RhdGljc1trZXldID0gJEFycmF5W2tleV07XG4gICAgZWxzZSBpZihrZXkgaW4gW10pc3RhdGljc1trZXldID0gcmVxdWlyZSgnLi8kLmN0eCcpKEZ1bmN0aW9uLmNhbGwsIFtdW2tleV0sIGxlbmd0aCk7XG4gIH0pO1xufVxuc2V0U3RhdGljcygncG9wLHJldmVyc2Usc2hpZnQsa2V5cyx2YWx1ZXMsZW50cmllcycsIDEpO1xuc2V0U3RhdGljcygnaW5kZXhPZixldmVyeSxzb21lLGZvckVhY2gsbWFwLGZpbHRlcixmaW5kLGZpbmRJbmRleCxpbmNsdWRlcycsIDMpO1xuc2V0U3RhdGljcygnam9pbixzbGljZSxjb25jYXQscHVzaCxzcGxpY2UsdW5zaGlmdCxzb3J0LGxhc3RJbmRleE9mLCcgK1xuICAgICAgICAgICAncmVkdWNlLHJlZHVjZVJpZ2h0LGNvcHlXaXRoaW4sZmlsbCcpO1xuJGRlZigkZGVmLlMsICdBcnJheScsIHN0YXRpY3MpOyIsInJlcXVpcmUoJy4vZXM2LmFycmF5Lml0ZXJhdG9yJyk7XG52YXIgZ2xvYmFsICAgICAgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJylcbiAgLCBoaWRlICAgICAgICA9IHJlcXVpcmUoJy4vJC5oaWRlJylcbiAgLCBJdGVyYXRvcnMgICA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKVxuICAsIElURVJBVE9SICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgTkwgICAgICAgICAgPSBnbG9iYWwuTm9kZUxpc3RcbiAgLCBIVEMgICAgICAgICA9IGdsb2JhbC5IVE1MQ29sbGVjdGlvblxuICAsIE5MUHJvdG8gICAgID0gTkwgJiYgTkwucHJvdG90eXBlXG4gICwgSFRDUHJvdG8gICAgPSBIVEMgJiYgSFRDLnByb3RvdHlwZVxuICAsIEFycmF5VmFsdWVzID0gSXRlcmF0b3JzLk5vZGVMaXN0ID0gSXRlcmF0b3JzLkhUTUxDb2xsZWN0aW9uID0gSXRlcmF0b3JzLkFycmF5O1xuaWYoTkwgJiYgIShJVEVSQVRPUiBpbiBOTFByb3RvKSloaWRlKE5MUHJvdG8sIElURVJBVE9SLCBBcnJheVZhbHVlcyk7XG5pZihIVEMgJiYgIShJVEVSQVRPUiBpbiBIVENQcm90bykpaGlkZShIVENQcm90bywgSVRFUkFUT1IsIEFycmF5VmFsdWVzKTsiLCJ2YXIgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkdGFzayA9IHJlcXVpcmUoJy4vJC50YXNrJyk7XG4kZGVmKCRkZWYuRyArICRkZWYuQiwge1xuICBzZXRJbW1lZGlhdGU6ICAgJHRhc2suc2V0LFxuICBjbGVhckltbWVkaWF0ZTogJHRhc2suY2xlYXJcbn0pOyIsIi8vIGllOS0gc2V0VGltZW91dCAmIHNldEludGVydmFsIGFkZGl0aW9uYWwgcGFyYW1ldGVycyBmaXhcbnZhciBnbG9iYWwgICAgID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgJGRlZiAgICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGludm9rZSAgICAgPSByZXF1aXJlKCcuLyQuaW52b2tlJylcbiAgLCBwYXJ0aWFsICAgID0gcmVxdWlyZSgnLi8kLnBhcnRpYWwnKVxuICAsIG5hdmlnYXRvciAgPSBnbG9iYWwubmF2aWdhdG9yXG4gICwgTVNJRSAgICAgICA9ICEhbmF2aWdhdG9yICYmIC9NU0lFIC5cXC4vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7IC8vIDwtIGRpcnR5IGllOS0gY2hlY2tcbmZ1bmN0aW9uIHdyYXAoc2V0KXtcbiAgcmV0dXJuIE1TSUUgPyBmdW5jdGlvbihmbiwgdGltZSAvKiwgLi4uYXJncyAqLyl7XG4gICAgcmV0dXJuIHNldChpbnZva2UoXG4gICAgICBwYXJ0aWFsLFxuICAgICAgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpLFxuICAgICAgdHlwZW9mIGZuID09ICdmdW5jdGlvbicgPyBmbiA6IEZ1bmN0aW9uKGZuKVxuICAgICksIHRpbWUpO1xuICB9IDogc2V0O1xufVxuJGRlZigkZGVmLkcgKyAkZGVmLkIgKyAkZGVmLkYgKiBNU0lFLCB7XG4gIHNldFRpbWVvdXQ6ICB3cmFwKGdsb2JhbC5zZXRUaW1lb3V0KSxcbiAgc2V0SW50ZXJ2YWw6IHdyYXAoZ2xvYmFsLnNldEludGVydmFsKVxufSk7IiwicmVxdWlyZSgnLi9tb2R1bGVzL2VzNScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zeW1ib2wnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3QuaXMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3Quc3RhdGljcy1hY2NlcHQtcHJpbWl0aXZlcycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5mdW5jdGlvbi5uYW1lJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmZ1bmN0aW9uLmhhcy1pbnN0YW5jZScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5udW1iZXIuY29uc3RydWN0b3InKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubnVtYmVyLmVwc2lsb24nKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubnVtYmVyLmlzLWZpbml0ZScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5udW1iZXIuaXMtaW50ZWdlcicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5udW1iZXIuaXMtbmFuJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm51bWJlci5pcy1zYWZlLWludGVnZXInKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubnVtYmVyLm1heC1zYWZlLWludGVnZXInKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubnVtYmVyLm1pbi1zYWZlLWludGVnZXInKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubnVtYmVyLnBhcnNlLWZsb2F0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm51bWJlci5wYXJzZS1pbnQnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubWF0aC5hY29zaCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5tYXRoLmFzaW5oJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm1hdGguYXRhbmgnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubWF0aC5jYnJ0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm1hdGguY2x6MzInKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubWF0aC5jb3NoJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm1hdGguZXhwbTEnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubWF0aC5mcm91bmQnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubWF0aC5oeXBvdCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5tYXRoLmltdWwnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubWF0aC5sb2cxMCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5tYXRoLmxvZzFwJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm1hdGgubG9nMicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5tYXRoLnNpZ24nKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubWF0aC5zaW5oJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm1hdGgudGFuaCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5tYXRoLnRydW5jJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5mcm9tLWNvZGUtcG9pbnQnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLnJhdycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLmNvZGUtcG9pbnQtYXQnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLmVuZHMtd2l0aCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuaW5jbHVkZXMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLnJlcGVhdCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuc3RhcnRzLXdpdGgnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuZnJvbScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5vZicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5zcGVjaWVzJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LmNvcHktd2l0aGluJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LmZpbGwnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuZmluZCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5maW5kLWluZGV4Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZ2V4cC5jb25zdHJ1Y3RvcicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5yZWdleHAuZmxhZ3MnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYucmVnZXhwLm1hdGNoJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZ2V4cC5yZXBsYWNlJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZ2V4cC5zZWFyY2gnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYucmVnZXhwLnNwbGl0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnByb21pc2UnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubWFwJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnNldCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi53ZWFrLW1hcCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi53ZWFrLXNldCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5yZWZsZWN0LmFwcGx5Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZmxlY3QuY29uc3RydWN0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZmxlY3QuZGVmaW5lLXByb3BlcnR5Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZmxlY3QuZGVsZXRlLXByb3BlcnR5Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZmxlY3QuZW51bWVyYXRlJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZmxlY3QuZ2V0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZmxlY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZmxlY3QuZ2V0LXByb3RvdHlwZS1vZicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5yZWZsZWN0LmhhcycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5yZWZsZWN0LmlzLWV4dGVuc2libGUnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYucmVmbGVjdC5vd24ta2V5cycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5yZWZsZWN0LnByZXZlbnQtZXh0ZW5zaW9ucycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5yZWZsZWN0LnNldCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5yZWZsZWN0LnNldC1wcm90b3R5cGUtb2YnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcuYXJyYXkuaW5jbHVkZXMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcuc3RyaW5nLmF0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnN0cmluZy5scGFkJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnN0cmluZy5ycGFkJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnJlZ2V4cC5lc2NhcGUnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcnMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcub2JqZWN0LnZhbHVlcycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5vYmplY3QuZW50cmllcycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5tYXAudG8tanNvbicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5zZXQudG8tanNvbicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2pzLmFycmF5LnN0YXRpY3MnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy93ZWIudGltZXJzJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvd2ViLmltbWVkaWF0ZScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9tb2R1bGVzLyQuY29yZScpOyIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwpe1xuLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogaHR0cHM6Ly9yYXcuZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9tYXN0ZXIvTElDRU5TRSBmaWxlLiBBblxuICogYWRkaXRpb25hbCBncmFudCBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluXG4gKiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKi9cblxuIShmdW5jdGlvbihnbG9iYWwpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIHZhciB1bmRlZmluZWQ7IC8vIE1vcmUgY29tcHJlc3NpYmxlIHRoYW4gdm9pZCAwLlxuICB2YXIgaXRlcmF0b3JTeW1ib2wgPVxuICAgIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG5cbiAgdmFyIGluTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIjtcbiAgdmFyIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lO1xuICBpZiAocnVudGltZSkge1xuICAgIGlmIChpbk1vZHVsZSkge1xuICAgICAgLy8gSWYgcmVnZW5lcmF0b3JSdW50aW1lIGlzIGRlZmluZWQgZ2xvYmFsbHkgYW5kIHdlJ3JlIGluIGEgbW9kdWxlLFxuICAgICAgLy8gbWFrZSB0aGUgZXhwb3J0cyBvYmplY3QgaWRlbnRpY2FsIHRvIHJlZ2VuZXJhdG9yUnVudGltZS5cbiAgICAgIG1vZHVsZS5leHBvcnRzID0gcnVudGltZTtcbiAgICB9XG4gICAgLy8gRG9uJ3QgYm90aGVyIGV2YWx1YXRpbmcgdGhlIHJlc3Qgb2YgdGhpcyBmaWxlIGlmIHRoZSBydW50aW1lIHdhc1xuICAgIC8vIGFscmVhZHkgZGVmaW5lZCBnbG9iYWxseS5cbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBEZWZpbmUgdGhlIHJ1bnRpbWUgZ2xvYmFsbHkgKGFzIGV4cGVjdGVkIGJ5IGdlbmVyYXRlZCBjb2RlKSBhcyBlaXRoZXJcbiAgLy8gbW9kdWxlLmV4cG9ydHMgKGlmIHdlJ3JlIGluIGEgbW9kdWxlKSBvciBhIG5ldywgZW1wdHkgb2JqZWN0LlxuICBydW50aW1lID0gZ2xvYmFsLnJlZ2VuZXJhdG9yUnVudGltZSA9IGluTW9kdWxlID8gbW9kdWxlLmV4cG9ydHMgOiB7fTtcblxuICBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gSWYgb3V0ZXJGbiBwcm92aWRlZCwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZSgob3V0ZXJGbiB8fCBHZW5lcmF0b3IpLnByb3RvdHlwZSk7XG5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoXG4gICAgICBpbm5lckZuLCBzZWxmIHx8IG51bGwsXG4gICAgICBuZXcgQ29udGV4dCh0cnlMb2NzTGlzdCB8fCBbXSlcbiAgICApO1xuXG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfVxuICBydW50aW1lLndyYXAgPSB3cmFwO1xuXG4gIC8vIFRyeS9jYXRjaCBoZWxwZXIgdG8gbWluaW1pemUgZGVvcHRpbWl6YXRpb25zLiBSZXR1cm5zIGEgY29tcGxldGlvblxuICAvLyByZWNvcmQgbGlrZSBjb250ZXh0LnRyeUVudHJpZXNbaV0uY29tcGxldGlvbi4gVGhpcyBpbnRlcmZhY2UgY291bGRcbiAgLy8gaGF2ZSBiZWVuIChhbmQgd2FzIHByZXZpb3VzbHkpIGRlc2lnbmVkIHRvIHRha2UgYSBjbG9zdXJlIHRvIGJlXG4gIC8vIGludm9rZWQgd2l0aG91dCBhcmd1bWVudHMsIGJ1dCBpbiBhbGwgdGhlIGNhc2VzIHdlIGNhcmUgYWJvdXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGFuIGV4aXN0aW5nIG1ldGhvZCB3ZSB3YW50IHRvIGNhbGwsIHNvIHRoZXJlJ3Mgbm8gbmVlZFxuICAvLyB0byBjcmVhdGUgYSBuZXcgZnVuY3Rpb24gb2JqZWN0LiBXZSBjYW4gZXZlbiBnZXQgYXdheSB3aXRoIGFzc3VtaW5nXG4gIC8vIHRoZSBtZXRob2QgdGFrZXMgZXhhY3RseSBvbmUgYXJndW1lbnQsIHNpbmNlIHRoYXQgaGFwcGVucyB0byBiZSB0cnVlXG4gIC8vIGluIGV2ZXJ5IGNhc2UsIHNvIHdlIGRvbid0IGhhdmUgdG8gdG91Y2ggdGhlIGFyZ3VtZW50cyBvYmplY3QuIFRoZVxuICAvLyBvbmx5IGFkZGl0aW9uYWwgYWxsb2NhdGlvbiByZXF1aXJlZCBpcyB0aGUgY29tcGxldGlvbiByZWNvcmQsIHdoaWNoXG4gIC8vIGhhcyBhIHN0YWJsZSBzaGFwZSBhbmQgc28gaG9wZWZ1bGx5IHNob3VsZCBiZSBjaGVhcCB0byBhbGxvY2F0ZS5cbiAgZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9iaiwgYXJnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibm9ybWFsXCIsIGFyZzogZm4uY2FsbChvYmosIGFyZykgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwidGhyb3dcIiwgYXJnOiBlcnIgfTtcbiAgICB9XG4gIH1cblxuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRTdGFydCA9IFwic3VzcGVuZGVkU3RhcnRcIjtcbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkWWllbGQgPSBcInN1c3BlbmRlZFlpZWxkXCI7XG4gIHZhciBHZW5TdGF0ZUV4ZWN1dGluZyA9IFwiZXhlY3V0aW5nXCI7XG4gIHZhciBHZW5TdGF0ZUNvbXBsZXRlZCA9IFwiY29tcGxldGVkXCI7XG5cbiAgLy8gUmV0dXJuaW5nIHRoaXMgb2JqZWN0IGZyb20gdGhlIGlubmVyRm4gaGFzIHRoZSBzYW1lIGVmZmVjdCBhc1xuICAvLyBicmVha2luZyBvdXQgb2YgdGhlIGRpc3BhdGNoIHN3aXRjaCBzdGF0ZW1lbnQuXG4gIHZhciBDb250aW51ZVNlbnRpbmVsID0ge307XG5cbiAgLy8gRHVtbXkgY29uc3RydWN0b3IgZnVuY3Rpb25zIHRoYXQgd2UgdXNlIGFzIHRoZSAuY29uc3RydWN0b3IgYW5kXG4gIC8vIC5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgcHJvcGVydGllcyBmb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIEdlbmVyYXRvclxuICAvLyBvYmplY3RzLiBGb3IgZnVsbCBzcGVjIGNvbXBsaWFuY2UsIHlvdSBtYXkgd2lzaCB0byBjb25maWd1cmUgeW91clxuICAvLyBtaW5pZmllciBub3QgdG8gbWFuZ2xlIHRoZSBuYW1lcyBvZiB0aGVzZSB0d28gZnVuY3Rpb25zLlxuICBmdW5jdGlvbiBHZW5lcmF0b3IoKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge31cblxuICB2YXIgR3AgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUgPSBHZW5lcmF0b3IucHJvdG90eXBlO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGUgPSBHcC5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5kaXNwbGF5TmFtZSA9IFwiR2VuZXJhdG9yRnVuY3Rpb25cIjtcblxuICAvLyBIZWxwZXIgZm9yIGRlZmluaW5nIHRoZSAubmV4dCwgLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzIG9mIHRoZVxuICAvLyBJdGVyYXRvciBpbnRlcmZhY2UgaW4gdGVybXMgb2YgYSBzaW5nbGUgLl9pbnZva2UgbWV0aG9kLlxuICBmdW5jdGlvbiBkZWZpbmVJdGVyYXRvck1ldGhvZHMocHJvdG90eXBlKSB7XG4gICAgW1wibmV4dFwiLCBcInRocm93XCIsIFwicmV0dXJuXCJdLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICBwcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKGFyZykge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBydW50aW1lLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICB2YXIgY3RvciA9IHR5cGVvZiBnZW5GdW4gPT09IFwiZnVuY3Rpb25cIiAmJiBnZW5GdW4uY29uc3RydWN0b3I7XG4gICAgcmV0dXJuIGN0b3JcbiAgICAgID8gY3RvciA9PT0gR2VuZXJhdG9yRnVuY3Rpb24gfHxcbiAgICAgICAgLy8gRm9yIHRoZSBuYXRpdmUgR2VuZXJhdG9yRnVuY3Rpb24gY29uc3RydWN0b3IsIHRoZSBiZXN0IHdlIGNhblxuICAgICAgICAvLyBkbyBpcyB0byBjaGVjayBpdHMgLm5hbWUgcHJvcGVydHkuXG4gICAgICAgIChjdG9yLmRpc3BsYXlOYW1lIHx8IGN0b3IubmFtZSkgPT09IFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICAgICAgOiBmYWxzZTtcbiAgfTtcblxuICBydW50aW1lLm1hcmsgPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgZ2VuRnVuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR3ApO1xuICAgIHJldHVybiBnZW5GdW47XG4gIH07XG5cbiAgLy8gV2l0aGluIHRoZSBib2R5IG9mIGFueSBhc3luYyBmdW5jdGlvbiwgYGF3YWl0IHhgIGlzIHRyYW5zZm9ybWVkIHRvXG4gIC8vIGB5aWVsZCByZWdlbmVyYXRvclJ1bnRpbWUuYXdyYXAoeClgLCBzbyB0aGF0IHRoZSBydW50aW1lIGNhbiB0ZXN0XG4gIC8vIGB2YWx1ZSBpbnN0YW5jZW9mIEF3YWl0QXJndW1lbnRgIHRvIGRldGVybWluZSBpZiB0aGUgeWllbGRlZCB2YWx1ZSBpc1xuICAvLyBtZWFudCB0byBiZSBhd2FpdGVkLiBTb21lIG1heSBjb25zaWRlciB0aGUgbmFtZSBvZiB0aGlzIG1ldGhvZCB0b29cbiAgLy8gY3V0ZXN5LCBidXQgdGhleSBhcmUgY3VybXVkZ2VvbnMuXG4gIHJ1bnRpbWUuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gbmV3IEF3YWl0QXJndW1lbnQoYXJnKTtcbiAgfTtcblxuICBmdW5jdGlvbiBBd2FpdEFyZ3VtZW50KGFyZykge1xuICAgIHRoaXMuYXJnID0gYXJnO1xuICB9XG5cbiAgZnVuY3Rpb24gQXN5bmNJdGVyYXRvcihnZW5lcmF0b3IpIHtcbiAgICAvLyBUaGlzIGludm9rZSBmdW5jdGlvbiBpcyB3cml0dGVuIGluIGEgc3R5bGUgdGhhdCBhc3N1bWVzIHNvbWVcbiAgICAvLyBjYWxsaW5nIGZ1bmN0aW9uIChvciBQcm9taXNlKSB3aWxsIGhhbmRsZSBleGNlcHRpb25zLlxuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgdmFyIHJlc3VsdCA9IGdlbmVyYXRvclttZXRob2RdKGFyZyk7XG4gICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBBd2FpdEFyZ3VtZW50XG4gICAgICAgID8gUHJvbWlzZS5yZXNvbHZlKHZhbHVlLmFyZykudGhlbihpbnZva2VOZXh0LCBpbnZva2VUaHJvdylcbiAgICAgICAgOiBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24odW53cmFwcGVkKSB7XG4gICAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgICAgLy8gdGhlIC52YWx1ZSBvZiB0aGUgUHJvbWlzZTx7dmFsdWUsZG9uZX0+IHJlc3VsdCBmb3IgdGhlXG4gICAgICAgICAgICAvLyBjdXJyZW50IGl0ZXJhdGlvbi4gSWYgdGhlIFByb21pc2UgaXMgcmVqZWN0ZWQsIGhvd2V2ZXIsIHRoZVxuICAgICAgICAgICAgLy8gcmVzdWx0IGZvciB0aGlzIGl0ZXJhdGlvbiB3aWxsIGJlIHJlamVjdGVkIHdpdGggdGhlIHNhbWVcbiAgICAgICAgICAgIC8vIHJlYXNvbi4gTm90ZSB0aGF0IHJlamVjdGlvbnMgb2YgeWllbGRlZCBQcm9taXNlcyBhcmUgbm90XG4gICAgICAgICAgICAvLyB0aHJvd24gYmFjayBpbnRvIHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24sIGFzIGlzIHRoZSBjYXNlXG4gICAgICAgICAgICAvLyB3aGVuIGFuIGF3YWl0ZWQgUHJvbWlzZSBpcyByZWplY3RlZC4gVGhpcyBkaWZmZXJlbmNlIGluXG4gICAgICAgICAgICAvLyBiZWhhdmlvciBiZXR3ZWVuIHlpZWxkIGFuZCBhd2FpdCBpcyBpbXBvcnRhbnQsIGJlY2F1c2UgaXRcbiAgICAgICAgICAgIC8vIGFsbG93cyB0aGUgY29uc3VtZXIgdG8gZGVjaWRlIHdoYXQgdG8gZG8gd2l0aCB0aGUgeWllbGRlZFxuICAgICAgICAgICAgLy8gcmVqZWN0aW9uIChzd2FsbG93IGl0IGFuZCBjb250aW51ZSwgbWFudWFsbHkgLnRocm93IGl0IGJhY2tcbiAgICAgICAgICAgIC8vIGludG8gdGhlIGdlbmVyYXRvciwgYWJhbmRvbiBpdGVyYXRpb24sIHdoYXRldmVyKS4gV2l0aFxuICAgICAgICAgICAgLy8gYXdhaXQsIGJ5IGNvbnRyYXN0LCB0aGVyZSBpcyBubyBvcHBvcnR1bml0eSB0byBleGFtaW5lIHRoZVxuICAgICAgICAgICAgLy8gcmVqZWN0aW9uIHJlYXNvbiBvdXRzaWRlIHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24sIHNvIHRoZVxuICAgICAgICAgICAgLy8gb25seSBvcHRpb24gaXMgdG8gdGhyb3cgaXQgZnJvbSB0aGUgYXdhaXQgZXhwcmVzc2lvbiwgYW5kXG4gICAgICAgICAgICAvLyBsZXQgdGhlIGdlbmVyYXRvciBmdW5jdGlvbiBoYW5kbGUgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHByb2Nlc3MuZG9tYWluKSB7XG4gICAgICBpbnZva2UgPSBwcm9jZXNzLmRvbWFpbi5iaW5kKGludm9rZSk7XG4gICAgfVxuXG4gICAgdmFyIGludm9rZU5leHQgPSBpbnZva2UuYmluZChnZW5lcmF0b3IsIFwibmV4dFwiKTtcbiAgICB2YXIgaW52b2tlVGhyb3cgPSBpbnZva2UuYmluZChnZW5lcmF0b3IsIFwidGhyb3dcIik7XG4gICAgdmFyIGludm9rZVJldHVybiA9IGludm9rZS5iaW5kKGdlbmVyYXRvciwgXCJyZXR1cm5cIik7XG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIHZhciBlbnF1ZXVlUmVzdWx0ID1cbiAgICAgICAgLy8gSWYgZW5xdWV1ZSBoYXMgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIHdlIHdhbnQgdG8gd2FpdCB1bnRpbFxuICAgICAgICAvLyBhbGwgcHJldmlvdXMgUHJvbWlzZXMgaGF2ZSBiZWVuIHJlc29sdmVkIGJlZm9yZSBjYWxsaW5nIGludm9rZSxcbiAgICAgICAgLy8gc28gdGhhdCByZXN1bHRzIGFyZSBhbHdheXMgZGVsaXZlcmVkIGluIHRoZSBjb3JyZWN0IG9yZGVyLiBJZlxuICAgICAgICAvLyBlbnF1ZXVlIGhhcyBub3QgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIGl0IGlzIGltcG9ydGFudCB0b1xuICAgICAgICAvLyBjYWxsIGludm9rZSBpbW1lZGlhdGVseSwgd2l0aG91dCB3YWl0aW5nIG9uIGEgY2FsbGJhY2sgdG8gZmlyZSxcbiAgICAgICAgLy8gc28gdGhhdCB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhcyB0aGUgb3Bwb3J0dW5pdHkgdG8gZG9cbiAgICAgICAgLy8gYW55IG5lY2Vzc2FyeSBzZXR1cCBpbiBhIHByZWRpY3RhYmxlIHdheS4gVGhpcyBwcmVkaWN0YWJpbGl0eVxuICAgICAgICAvLyBpcyB3aHkgdGhlIFByb21pc2UgY29uc3RydWN0b3Igc3luY2hyb25vdXNseSBpbnZva2VzIGl0c1xuICAgICAgICAvLyBleGVjdXRvciBjYWxsYmFjaywgYW5kIHdoeSBhc3luYyBmdW5jdGlvbnMgc3luY2hyb25vdXNseVxuICAgICAgICAvLyBleGVjdXRlIGNvZGUgYmVmb3JlIHRoZSBmaXJzdCBhd2FpdC4gU2luY2Ugd2UgaW1wbGVtZW50IHNpbXBsZVxuICAgICAgICAvLyBhc3luYyBmdW5jdGlvbnMgaW4gdGVybXMgb2YgYXN5bmMgZ2VuZXJhdG9ycywgaXQgaXMgZXNwZWNpYWxseVxuICAgICAgICAvLyBpbXBvcnRhbnQgdG8gZ2V0IHRoaXMgcmlnaHQsIGV2ZW4gdGhvdWdoIGl0IHJlcXVpcmVzIGNhcmUuXG4gICAgICAgIHByZXZpb3VzUHJvbWlzZSA/IHByZXZpb3VzUHJvbWlzZS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBpbnZva2UobWV0aG9kLCBhcmcpO1xuICAgICAgICB9KSA6IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgICByZXNvbHZlKGludm9rZShtZXRob2QsIGFyZykpO1xuICAgICAgICB9KTtcblxuICAgICAgLy8gQXZvaWQgcHJvcGFnYXRpbmcgZW5xdWV1ZVJlc3VsdCBmYWlsdXJlcyB0byBQcm9taXNlcyByZXR1cm5lZCBieVxuICAgICAgLy8gbGF0ZXIgaW52b2NhdGlvbnMgb2YgdGhlIGl0ZXJhdG9yLlxuICAgICAgcHJldmlvdXNQcm9taXNlID0gZW5xdWV1ZVJlc3VsdFtcImNhdGNoXCJdKGZ1bmN0aW9uKGlnbm9yZWQpe30pO1xuXG4gICAgICByZXR1cm4gZW5xdWV1ZVJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuXG4gIC8vIE5vdGUgdGhhdCBzaW1wbGUgYXN5bmMgZnVuY3Rpb25zIGFyZSBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAgLy8gQXN5bmNJdGVyYXRvciBvYmplY3RzOyB0aGV5IGp1c3QgcmV0dXJuIGEgUHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9mXG4gIC8vIHRoZSBmaW5hbCByZXN1bHQgcHJvZHVjZWQgYnkgdGhlIGl0ZXJhdG9yLlxuICBydW50aW1lLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICB2YXIgaXRlciA9IG5ldyBBc3luY0l0ZXJhdG9yKFxuICAgICAgd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdClcbiAgICApO1xuXG4gICAgcmV0dXJuIHJ1bnRpbWUuaXNHZW5lcmF0b3JGdW5jdGlvbihvdXRlckZuKVxuICAgICAgPyBpdGVyIC8vIElmIG91dGVyRm4gaXMgYSBnZW5lcmF0b3IsIHJldHVybiB0aGUgZnVsbCBpdGVyYXRvci5cbiAgICAgIDogaXRlci5uZXh0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRvbmUgPyByZXN1bHQudmFsdWUgOiBpdGVyLm5leHQoKTtcbiAgICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KSB7XG4gICAgdmFyIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVFeGVjdXRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUNvbXBsZXRlZCkge1xuICAgICAgICBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCZSBmb3JnaXZpbmcsIHBlciAyNS4zLjMuMy4zIG9mIHRoZSBzcGVjOlxuICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgIHJldHVybiBkb25lUmVzdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGNvbnRleHQuZGVsZWdhdGU7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgICAgIGlmIChtZXRob2QgPT09IFwicmV0dXJuXCIgfHxcbiAgICAgICAgICAgICAgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiICYmIGRlbGVnYXRlLml0ZXJhdG9yW21ldGhvZF0gPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgIC8vIEEgcmV0dXJuIG9yIHRocm93ICh3aGVuIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgbm8gdGhyb3dcbiAgICAgICAgICAgIC8vIG1ldGhvZCkgYWx3YXlzIHRlcm1pbmF0ZXMgdGhlIHlpZWxkKiBsb29wLlxuICAgICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgYSByZXR1cm4gbWV0aG9kLCBnaXZlIGl0IGFcbiAgICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICAgIHZhciByZXR1cm5NZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvcltcInJldHVyblwiXTtcbiAgICAgICAgICAgIGlmIChyZXR1cm5NZXRob2QpIHtcbiAgICAgICAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKHJldHVybk1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGFyZyk7XG4gICAgICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJldHVybiBtZXRob2QgdGhyZXcgYW4gZXhjZXB0aW9uLCBsZXQgdGhhdFxuICAgICAgICAgICAgICAgIC8vIGV4Y2VwdGlvbiBwcmV2YWlsIG92ZXIgdGhlIG9yaWdpbmFsIHJldHVybiBvciB0aHJvdy5cbiAgICAgICAgICAgICAgICBtZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgICAgIC8vIENvbnRpbnVlIHdpdGggdGhlIG91dGVyIHJldHVybiwgbm93IHRoYXQgdGhlIGRlbGVnYXRlXG4gICAgICAgICAgICAgIC8vIGl0ZXJhdG9yIGhhcyBiZWVuIHRlcm1pbmF0ZWQuXG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChcbiAgICAgICAgICAgIGRlbGVnYXRlLml0ZXJhdG9yW21ldGhvZF0sXG4gICAgICAgICAgICBkZWxlZ2F0ZS5pdGVyYXRvcixcbiAgICAgICAgICAgIGFyZ1xuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgICAgICAgIC8vIExpa2UgcmV0dXJuaW5nIGdlbmVyYXRvci50aHJvdyh1bmNhdWdodCksIGJ1dCB3aXRob3V0IHRoZVxuICAgICAgICAgICAgLy8gb3ZlcmhlYWQgb2YgYW4gZXh0cmEgZnVuY3Rpb24gY2FsbC5cbiAgICAgICAgICAgIG1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICAgIGFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEZWxlZ2F0ZSBnZW5lcmF0b3IgcmFuIGFuZCBoYW5kbGVkIGl0cyBvd24gZXhjZXB0aW9ucyBzb1xuICAgICAgICAgIC8vIHJlZ2FyZGxlc3Mgb2Ygd2hhdCB0aGUgbWV0aG9kIHdhcywgd2UgY29udGludWUgYXMgaWYgaXQgaXNcbiAgICAgICAgICAvLyBcIm5leHRcIiB3aXRoIGFuIHVuZGVmaW5lZCBhcmcuXG4gICAgICAgICAgbWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuICAgICAgICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgICAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuICAgICAgICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuICAgICAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCkge1xuICAgICAgICAgICAgY29udGV4dC5zZW50ID0gYXJnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250ZXh0LnNlbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQpIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oYXJnKSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlIGRpc3BhdGNoZWQgZXhjZXB0aW9uIHdhcyBjYXVnaHQgYnkgYSBjYXRjaCBibG9jayxcbiAgICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgICBtZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChtZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBhcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUV4ZWN1dGluZztcblxuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgICAgIC8vIElmIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSBpbm5lckZuLCB3ZSBsZWF2ZSBzdGF0ZSA9PT1cbiAgICAgICAgICAvLyBHZW5TdGF0ZUV4ZWN1dGluZyBhbmQgbG9vcCBiYWNrIGZvciBhbm90aGVyIGludm9jYXRpb24uXG4gICAgICAgICAgc3RhdGUgPSBjb250ZXh0LmRvbmVcbiAgICAgICAgICAgID8gR2VuU3RhdGVDb21wbGV0ZWRcbiAgICAgICAgICAgIDogR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcblxuICAgICAgICAgIHZhciBpbmZvID0ge1xuICAgICAgICAgICAgdmFsdWU6IHJlY29yZC5hcmcsXG4gICAgICAgICAgICBkb25lOiBjb250ZXh0LmRvbmVcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGlmIChjb250ZXh0LmRlbGVnYXRlICYmIG1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAgICAgLy8gRGVsaWJlcmF0ZWx5IGZvcmdldCB0aGUgbGFzdCBzZW50IHZhbHVlIHNvIHRoYXQgd2UgZG9uJ3RcbiAgICAgICAgICAgICAgLy8gYWNjaWRlbnRhbGx5IHBhc3MgaXQgb24gdG8gdGhlIGRlbGVnYXRlLlxuICAgICAgICAgICAgICBhcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpbmZvO1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgIC8vIERpc3BhdGNoIHRoZSBleGNlcHRpb24gYnkgbG9vcGluZyBiYWNrIGFyb3VuZCB0byB0aGVcbiAgICAgICAgICAvLyBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBtZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgR3BbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR3AudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEdlbmVyYXRvcl1cIjtcbiAgfTtcblxuICBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykge1xuICAgIHZhciBlbnRyeSA9IHsgdHJ5TG9jOiBsb2NzWzBdIH07XG5cbiAgICBpZiAoMSBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV07XG4gICAgfVxuXG4gICAgaWYgKDIgaW4gbG9jcykge1xuICAgICAgZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl07XG4gICAgICBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM107XG4gICAgfVxuXG4gICAgdGhpcy50cnlFbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkge1xuICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9O1xuICAgIHJlY29yZC50eXBlID0gXCJub3JtYWxcIjtcbiAgICBkZWxldGUgcmVjb3JkLmFyZztcbiAgICBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkO1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh0cnlMb2NzTGlzdCkge1xuICAgIC8vIFRoZSByb290IGVudHJ5IG9iamVjdCAoZWZmZWN0aXZlbHkgYSB0cnkgc3RhdGVtZW50IHdpdGhvdXQgYSBjYXRjaFxuICAgIC8vIG9yIGEgZmluYWxseSBibG9jaykgZ2l2ZXMgdXMgYSBwbGFjZSB0byBzdG9yZSB2YWx1ZXMgdGhyb3duIGZyb21cbiAgICAvLyBsb2NhdGlvbnMgd2hlcmUgdGhlcmUgaXMgbm8gZW5jbG9zaW5nIHRyeSBzdGF0ZW1lbnQuXG4gICAgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XTtcbiAgICB0cnlMb2NzTGlzdC5mb3JFYWNoKHB1c2hUcnlFbnRyeSwgdGhpcyk7XG4gICAgdGhpcy5yZXNldCh0cnVlKTtcbiAgfVxuXG4gIHJ1bnRpbWUua2V5cyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIGtleXMucmV2ZXJzZSgpO1xuXG4gICAgLy8gUmF0aGVyIHRoYW4gcmV0dXJuaW5nIGFuIG9iamVjdCB3aXRoIGEgbmV4dCBtZXRob2QsIHdlIGtlZXBcbiAgICAvLyB0aGluZ3Mgc2ltcGxlIGFuZCByZXR1cm4gdGhlIG5leHQgZnVuY3Rpb24gaXRzZWxmLlxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgd2hpbGUgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzLnBvcCgpO1xuICAgICAgICBpZiAoa2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIG5leHQudmFsdWUgPSBrZXk7XG4gICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVG8gYXZvaWQgY3JlYXRpbmcgYW4gYWRkaXRpb25hbCBvYmplY3QsIHdlIGp1c3QgaGFuZyB0aGUgLnZhbHVlXG4gICAgICAvLyBhbmQgLmRvbmUgcHJvcGVydGllcyBvZmYgdGhlIG5leHQgZnVuY3Rpb24gb2JqZWN0IGl0c2VsZi4gVGhpc1xuICAgICAgLy8gYWxzbyBlbnN1cmVzIHRoYXQgdGhlIG1pbmlmaWVyIHdpbGwgbm90IGFub255bWl6ZSB0aGUgZnVuY3Rpb24uXG4gICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWx1ZXMoaXRlcmFibGUpIHtcbiAgICBpZiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBpdGVyYXRvck1ldGhvZCA9IGl0ZXJhYmxlW2l0ZXJhdG9yU3ltYm9sXTtcbiAgICAgIGlmIChpdGVyYXRvck1ldGhvZCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JNZXRob2QuY2FsbChpdGVyYWJsZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc05hTihpdGVyYWJsZS5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsIG5leHQgPSBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbChpdGVyYWJsZSwgaSkpIHtcbiAgICAgICAgICAgICAgbmV4dC52YWx1ZSA9IGl0ZXJhYmxlW2ldO1xuICAgICAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5leHQubmV4dCA9IG5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGFuIGl0ZXJhdG9yIHdpdGggbm8gdmFsdWVzLlxuICAgIHJldHVybiB7IG5leHQ6IGRvbmVSZXN1bHQgfTtcbiAgfVxuICBydW50aW1lLnZhbHVlcyA9IHZhbHVlcztcblxuICBmdW5jdGlvbiBkb25lUmVzdWx0KCkge1xuICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgfVxuXG4gIENvbnRleHQucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBDb250ZXh0LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKHNraXBUZW1wUmVzZXQpIHtcbiAgICAgIHRoaXMucHJldiA9IDA7XG4gICAgICB0aGlzLm5leHQgPSAwO1xuICAgICAgdGhpcy5zZW50ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICB0aGlzLmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuICAgICAgICByZXR1cm4gISFjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbXBsZXRlKHJlY29yZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubmV4dCA9IFwiZW5kXCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiICYmIGFmdGVyTG9jKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGFmdGVyTG9jO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uKGZpbmFsbHlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykge1xuICAgICAgICAgIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuICB9O1xufSkoXG4gIC8vIEFtb25nIHRoZSB2YXJpb3VzIHRyaWNrcyBmb3Igb2J0YWluaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWxcbiAgLy8gb2JqZWN0LCB0aGlzIHNlZW1zIHRvIGJlIHRoZSBtb3N0IHJlbGlhYmxlIHRlY2huaXF1ZSB0aGF0IGRvZXMgbm90XG4gIC8vIHVzZSBpbmRpcmVjdCBldmFsICh3aGljaCB2aW9sYXRlcyBDb250ZW50IFNlY3VyaXR5IFBvbGljeSkuXG4gIHR5cGVvZiBnbG9iYWwgPT09IFwib2JqZWN0XCIgPyBnbG9iYWwgOlxuICB0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiID8gd2luZG93IDpcbiAgdHlwZW9mIHNlbGYgPT09IFwib2JqZWN0XCIgPyBzZWxmIDogdGhpc1xuKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vbGliL3BvbHlmaWxsXCIpO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCIvKiFcbiAqIHJldmVhbC5qc1xuICogaHR0cDovL2xhYi5oYWtpbS5zZS9yZXZlYWwtanNcbiAqIE1JVCBsaWNlbnNlZFxuICpcbiAqIENvcHlyaWdodCAoQykgMjAxNSBIYWtpbSBFbCBIYXR0YWIsIGh0dHA6Ly9oYWtpbS5zZVxuICovXG4oZnVuY3Rpb24oIHJvb3QsIGZhY3RvcnkgKSB7XG5cdGlmKCB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggZnVuY3Rpb24oKSB7XG5cdFx0XHRyb290LlJldmVhbCA9IGZhY3RvcnkoKTtcblx0XHRcdHJldHVybiByb290LlJldmVhbDtcblx0XHR9ICk7XG5cdH0gZWxzZSBpZiggdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICkge1xuXHRcdC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMuXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gQnJvd3NlciBnbG9iYWxzLlxuXHRcdHJvb3QuUmV2ZWFsID0gZmFjdG9yeSgpO1xuXHR9XG59KCB0aGlzLCBmdW5jdGlvbigpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIFJldmVhbDtcblxuXHR2YXIgU0xJREVTX1NFTEVDVE9SID0gJy5zbGlkZXMgc2VjdGlvbicsXG5cdFx0SE9SSVpPTlRBTF9TTElERVNfU0VMRUNUT1IgPSAnLnNsaWRlcz5zZWN0aW9uJyxcblx0XHRWRVJUSUNBTF9TTElERVNfU0VMRUNUT1IgPSAnLnNsaWRlcz5zZWN0aW9uLnByZXNlbnQ+c2VjdGlvbicsXG5cdFx0SE9NRV9TTElERV9TRUxFQ1RPUiA9ICcuc2xpZGVzPnNlY3Rpb246Zmlyc3Qtb2YtdHlwZScsXG5cblx0XHQvLyBDb25maWd1cmF0aW9uIGRlZmF1bHRzLCBjYW4gYmUgb3ZlcnJpZGRlbiBhdCBpbml0aWFsaXphdGlvbiB0aW1lXG5cdFx0Y29uZmlnID0ge1xuXG5cdFx0XHQvLyBUaGUgXCJub3JtYWxcIiBzaXplIG9mIHRoZSBwcmVzZW50YXRpb24sIGFzcGVjdCByYXRpbyB3aWxsIGJlIHByZXNlcnZlZFxuXHRcdFx0Ly8gd2hlbiB0aGUgcHJlc2VudGF0aW9uIGlzIHNjYWxlZCB0byBmaXQgZGlmZmVyZW50IHJlc29sdXRpb25zXG5cdFx0XHR3aWR0aDogOTYwLFxuXHRcdFx0aGVpZ2h0OiA3MDAsXG5cblx0XHRcdC8vIEZhY3RvciBvZiB0aGUgZGlzcGxheSBzaXplIHRoYXQgc2hvdWxkIHJlbWFpbiBlbXB0eSBhcm91bmQgdGhlIGNvbnRlbnRcblx0XHRcdG1hcmdpbjogMC4xLFxuXG5cdFx0XHQvLyBCb3VuZHMgZm9yIHNtYWxsZXN0L2xhcmdlc3QgcG9zc2libGUgc2NhbGUgdG8gYXBwbHkgdG8gY29udGVudFxuXHRcdFx0bWluU2NhbGU6IDAuMixcblx0XHRcdG1heFNjYWxlOiAxLjUsXG5cblx0XHRcdC8vIERpc3BsYXkgY29udHJvbHMgaW4gdGhlIGJvdHRvbSByaWdodCBjb3JuZXJcblx0XHRcdGNvbnRyb2xzOiB0cnVlLFxuXG5cdFx0XHQvLyBEaXNwbGF5IGEgcHJlc2VudGF0aW9uIHByb2dyZXNzIGJhclxuXHRcdFx0cHJvZ3Jlc3M6IHRydWUsXG5cblx0XHRcdC8vIERpc3BsYXkgdGhlIHBhZ2UgbnVtYmVyIG9mIHRoZSBjdXJyZW50IHNsaWRlXG5cdFx0XHRzbGlkZU51bWJlcjogZmFsc2UsXG5cblx0XHRcdC8vIFB1c2ggZWFjaCBzbGlkZSBjaGFuZ2UgdG8gdGhlIGJyb3dzZXIgaGlzdG9yeVxuXHRcdFx0aGlzdG9yeTogZmFsc2UsXG5cblx0XHRcdC8vIEVuYWJsZSBrZXlib2FyZCBzaG9ydGN1dHMgZm9yIG5hdmlnYXRpb25cblx0XHRcdGtleWJvYXJkOiB0cnVlLFxuXG5cdFx0XHQvLyBPcHRpb25hbCBmdW5jdGlvbiB0aGF0IGJsb2NrcyBrZXlib2FyZCBldmVudHMgd2hlbiByZXR1bmluZyBmYWxzZVxuXHRcdFx0a2V5Ym9hcmRDb25kaXRpb246IG51bGwsXG5cblx0XHRcdC8vIEVuYWJsZSB0aGUgc2xpZGUgb3ZlcnZpZXcgbW9kZVxuXHRcdFx0b3ZlcnZpZXc6IHRydWUsXG5cblx0XHRcdC8vIFZlcnRpY2FsIGNlbnRlcmluZyBvZiBzbGlkZXNcblx0XHRcdGNlbnRlcjogdHJ1ZSxcblxuXHRcdFx0Ly8gRW5hYmxlcyB0b3VjaCBuYXZpZ2F0aW9uIG9uIGRldmljZXMgd2l0aCB0b3VjaCBpbnB1dFxuXHRcdFx0dG91Y2g6IHRydWUsXG5cblx0XHRcdC8vIExvb3AgdGhlIHByZXNlbnRhdGlvblxuXHRcdFx0bG9vcDogZmFsc2UsXG5cblx0XHRcdC8vIENoYW5nZSB0aGUgcHJlc2VudGF0aW9uIGRpcmVjdGlvbiB0byBiZSBSVExcblx0XHRcdHJ0bDogZmFsc2UsXG5cblx0XHRcdC8vIFR1cm5zIGZyYWdtZW50cyBvbiBhbmQgb2ZmIGdsb2JhbGx5XG5cdFx0XHRmcmFnbWVudHM6IHRydWUsXG5cblx0XHRcdC8vIEZsYWdzIGlmIHRoZSBwcmVzZW50YXRpb24gaXMgcnVubmluZyBpbiBhbiBlbWJlZGRlZCBtb2RlLFxuXHRcdFx0Ly8gaS5lLiBjb250YWluZWQgd2l0aGluIGEgbGltaXRlZCBwb3J0aW9uIG9mIHRoZSBzY3JlZW5cblx0XHRcdGVtYmVkZGVkOiBmYWxzZSxcblxuXHRcdFx0Ly8gRmxhZ3MgaWYgd2Ugc2hvdWxkIHNob3cgYSBoZWxwIG92ZXJsYXkgd2hlbiB0aGUgcXVlc3Rpb25tYXJrXG5cdFx0XHQvLyBrZXkgaXMgcHJlc3NlZFxuXHRcdFx0aGVscDogdHJ1ZSxcblxuXHRcdFx0Ly8gRmxhZ3MgaWYgaXQgc2hvdWxkIGJlIHBvc3NpYmxlIHRvIHBhdXNlIHRoZSBwcmVzZW50YXRpb24gKGJsYWNrb3V0KVxuXHRcdFx0cGF1c2U6IHRydWUsXG5cblx0XHRcdC8vIE51bWJlciBvZiBtaWxsaXNlY29uZHMgYmV0d2VlbiBhdXRvbWF0aWNhbGx5IHByb2NlZWRpbmcgdG8gdGhlXG5cdFx0XHQvLyBuZXh0IHNsaWRlLCBkaXNhYmxlZCB3aGVuIHNldCB0byAwLCB0aGlzIHZhbHVlIGNhbiBiZSBvdmVyd3JpdHRlblxuXHRcdFx0Ly8gYnkgdXNpbmcgYSBkYXRhLWF1dG9zbGlkZSBhdHRyaWJ1dGUgb24geW91ciBzbGlkZXNcblx0XHRcdGF1dG9TbGlkZTogMCxcblxuXHRcdFx0Ly8gU3RvcCBhdXRvLXNsaWRpbmcgYWZ0ZXIgdXNlciBpbnB1dFxuXHRcdFx0YXV0b1NsaWRlU3RvcHBhYmxlOiB0cnVlLFxuXG5cdFx0XHQvLyBFbmFibGUgc2xpZGUgbmF2aWdhdGlvbiB2aWEgbW91c2Ugd2hlZWxcblx0XHRcdG1vdXNlV2hlZWw6IGZhbHNlLFxuXG5cdFx0XHQvLyBBcHBseSBhIDNEIHJvbGwgdG8gbGlua3Mgb24gaG92ZXJcblx0XHRcdHJvbGxpbmdMaW5rczogZmFsc2UsXG5cblx0XHRcdC8vIEhpZGVzIHRoZSBhZGRyZXNzIGJhciBvbiBtb2JpbGUgZGV2aWNlc1xuXHRcdFx0aGlkZUFkZHJlc3NCYXI6IHRydWUsXG5cblx0XHRcdC8vIE9wZW5zIGxpbmtzIGluIGFuIGlmcmFtZSBwcmV2aWV3IG92ZXJsYXlcblx0XHRcdHByZXZpZXdMaW5rczogZmFsc2UsXG5cblx0XHRcdC8vIEV4cG9zZXMgdGhlIHJldmVhbC5qcyBBUEkgdGhyb3VnaCB3aW5kb3cucG9zdE1lc3NhZ2Vcblx0XHRcdHBvc3RNZXNzYWdlOiB0cnVlLFxuXG5cdFx0XHQvLyBEaXNwYXRjaGVzIGFsbCByZXZlYWwuanMgZXZlbnRzIHRvIHRoZSBwYXJlbnQgd2luZG93IHRocm91Z2ggcG9zdE1lc3NhZ2Vcblx0XHRcdHBvc3RNZXNzYWdlRXZlbnRzOiBmYWxzZSxcblxuXHRcdFx0Ly8gRm9jdXNlcyBib2R5IHdoZW4gcGFnZSBjaGFuZ2VzIHZpc2libGl0eSB0byBlbnN1cmUga2V5Ym9hcmQgc2hvcnRjdXRzIHdvcmtcblx0XHRcdGZvY3VzQm9keU9uUGFnZVZpc2liaWxpdHlDaGFuZ2U6IHRydWUsXG5cblx0XHRcdC8vIFRyYW5zaXRpb24gc3R5bGVcblx0XHRcdHRyYW5zaXRpb246ICdzbGlkZScsIC8vIG5vbmUvZmFkZS9zbGlkZS9jb252ZXgvY29uY2F2ZS96b29tXG5cblx0XHRcdC8vIFRyYW5zaXRpb24gc3BlZWRcblx0XHRcdHRyYW5zaXRpb25TcGVlZDogJ2RlZmF1bHQnLCAvLyBkZWZhdWx0L2Zhc3Qvc2xvd1xuXG5cdFx0XHQvLyBUcmFuc2l0aW9uIHN0eWxlIGZvciBmdWxsIHBhZ2Ugc2xpZGUgYmFja2dyb3VuZHNcblx0XHRcdGJhY2tncm91bmRUcmFuc2l0aW9uOiAnZmFkZScsIC8vIG5vbmUvZmFkZS9zbGlkZS9jb252ZXgvY29uY2F2ZS96b29tXG5cblx0XHRcdC8vIFBhcmFsbGF4IGJhY2tncm91bmQgaW1hZ2Vcblx0XHRcdHBhcmFsbGF4QmFja2dyb3VuZEltYWdlOiAnJywgLy8gQ1NTIHN5bnRheCwgZS5nLiBcImEuanBnXCJcblxuXHRcdFx0Ly8gUGFyYWxsYXggYmFja2dyb3VuZCBzaXplXG5cdFx0XHRwYXJhbGxheEJhY2tncm91bmRTaXplOiAnJywgLy8gQ1NTIHN5bnRheCwgZS5nLiBcIjMwMDBweCAyMDAwcHhcIlxuXG5cdFx0XHQvLyBBbW91bnQgb2YgcGl4ZWxzIHRvIG1vdmUgdGhlIHBhcmFsbGF4IGJhY2tncm91bmQgcGVyIHNsaWRlIHN0ZXBcblx0XHRcdHBhcmFsbGF4QmFja2dyb3VuZEhvcml6b250YWw6IG51bGwsXG5cdFx0XHRwYXJhbGxheEJhY2tncm91bmRWZXJ0aWNhbDogbnVsbCxcblxuXHRcdFx0Ly8gTnVtYmVyIG9mIHNsaWRlcyBhd2F5IGZyb20gdGhlIGN1cnJlbnQgdGhhdCBhcmUgdmlzaWJsZVxuXHRcdFx0dmlld0Rpc3RhbmNlOiAzLFxuXG5cdFx0XHQvLyBTY3JpcHQgZGVwZW5kZW5jaWVzIHRvIGxvYWRcblx0XHRcdGRlcGVuZGVuY2llczogW11cblxuXHRcdH0sXG5cblx0XHQvLyBGbGFncyBpZiByZXZlYWwuanMgaXMgbG9hZGVkIChoYXMgZGlzcGF0Y2hlZCB0aGUgJ3JlYWR5JyBldmVudClcblx0XHRsb2FkZWQgPSBmYWxzZSxcblxuXHRcdC8vIEZsYWdzIGlmIHRoZSBvdmVydmlldyBtb2RlIGlzIGN1cnJlbnRseSBhY3RpdmVcblx0XHRvdmVydmlldyA9IGZhbHNlLFxuXG5cdFx0Ly8gVGhlIGhvcml6b250YWwgYW5kIHZlcnRpY2FsIGluZGV4IG9mIHRoZSBjdXJyZW50bHkgYWN0aXZlIHNsaWRlXG5cdFx0aW5kZXhoLFxuXHRcdGluZGV4dixcblxuXHRcdC8vIFRoZSBwcmV2aW91cyBhbmQgY3VycmVudCBzbGlkZSBIVE1MIGVsZW1lbnRzXG5cdFx0cHJldmlvdXNTbGlkZSxcblx0XHRjdXJyZW50U2xpZGUsXG5cblx0XHRwcmV2aW91c0JhY2tncm91bmQsXG5cblx0XHQvLyBTbGlkZXMgbWF5IGhvbGQgYSBkYXRhLXN0YXRlIGF0dHJpYnV0ZSB3aGljaCB3ZSBwaWNrIHVwIGFuZCBhcHBseVxuXHRcdC8vIGFzIGEgY2xhc3MgdG8gdGhlIGJvZHkuIFRoaXMgbGlzdCBjb250YWlucyB0aGUgY29tYmluZWQgc3RhdGUgb2Zcblx0XHQvLyBhbGwgY3VycmVudCBzbGlkZXMuXG5cdFx0c3RhdGUgPSBbXSxcblxuXHRcdC8vIFRoZSBjdXJyZW50IHNjYWxlIG9mIHRoZSBwcmVzZW50YXRpb24gKHNlZSB3aWR0aC9oZWlnaHQgY29uZmlnKVxuXHRcdHNjYWxlID0gMSxcblxuXHRcdC8vIENTUyB0cmFuc2Zvcm0gdGhhdCBpcyBjdXJyZW50bHkgYXBwbGllZCB0byB0aGUgc2xpZGVzIGNvbnRhaW5lcixcblx0XHQvLyBzcGxpdCBpbnRvIHR3byBncm91cHNcblx0XHRzbGlkZXNUcmFuc2Zvcm0gPSB7IGxheW91dDogJycsIG92ZXJ2aWV3OiAnJyB9LFxuXG5cdFx0Ly8gQ2FjaGVkIHJlZmVyZW5jZXMgdG8gRE9NIGVsZW1lbnRzXG5cdFx0ZG9tID0ge30sXG5cblx0XHQvLyBGZWF0dXJlcyBzdXBwb3J0ZWQgYnkgdGhlIGJyb3dzZXIsIHNlZSAjY2hlY2tDYXBhYmlsaXRpZXMoKVxuXHRcdGZlYXR1cmVzID0ge30sXG5cblx0XHQvLyBDbGllbnQgaXMgYSBtb2JpbGUgZGV2aWNlLCBzZWUgI2NoZWNrQ2FwYWJpbGl0aWVzKClcblx0XHRpc01vYmlsZURldmljZSxcblxuXHRcdC8vIFRocm90dGxlcyBtb3VzZSB3aGVlbCBuYXZpZ2F0aW9uXG5cdFx0bGFzdE1vdXNlV2hlZWxTdGVwID0gMCxcblxuXHRcdC8vIERlbGF5cyB1cGRhdGVzIHRvIHRoZSBVUkwgZHVlIHRvIGEgQ2hyb21lIHRodW1ibmFpbGVyIGJ1Z1xuXHRcdHdyaXRlVVJMVGltZW91dCA9IDAsXG5cblx0XHQvLyBGbGFncyBpZiB0aGUgaW50ZXJhY3Rpb24gZXZlbnQgbGlzdGVuZXJzIGFyZSBib3VuZFxuXHRcdGV2ZW50c0FyZUJvdW5kID0gZmFsc2UsXG5cblx0XHQvLyBUaGUgY3VycmVudCBhdXRvLXNsaWRlIGR1cmF0aW9uXG5cdFx0YXV0b1NsaWRlID0gMCxcblxuXHRcdC8vIEF1dG8gc2xpZGUgcHJvcGVydGllc1xuXHRcdGF1dG9TbGlkZVBsYXllcixcblx0XHRhdXRvU2xpZGVUaW1lb3V0ID0gMCxcblx0XHRhdXRvU2xpZGVTdGFydFRpbWUgPSAtMSxcblx0XHRhdXRvU2xpZGVQYXVzZWQgPSBmYWxzZSxcblxuXHRcdC8vIEhvbGRzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50bHkgb25nb2luZyB0b3VjaCBpbnB1dFxuXHRcdHRvdWNoID0ge1xuXHRcdFx0c3RhcnRYOiAwLFxuXHRcdFx0c3RhcnRZOiAwLFxuXHRcdFx0c3RhcnRTcGFuOiAwLFxuXHRcdFx0c3RhcnRDb3VudDogMCxcblx0XHRcdGNhcHR1cmVkOiBmYWxzZSxcblx0XHRcdHRocmVzaG9sZDogNDBcblx0XHR9LFxuXG5cdFx0Ly8gSG9sZHMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGtleWJvYXJkIHNob3J0Y3V0c1xuXHRcdGtleWJvYXJkU2hvcnRjdXRzID0ge1xuXHRcdFx0J04gICwgIFNQQUNFJzpcdFx0XHQnTmV4dCBzbGlkZScsXG5cdFx0XHQnUCc6XHRcdFx0XHRcdCdQcmV2aW91cyBzbGlkZScsXG5cdFx0XHQnJiM4NTkyOyAgLCAgSCc6XHRcdCdOYXZpZ2F0ZSBsZWZ0Jyxcblx0XHRcdCcmIzg1OTQ7ICAsICBMJzpcdFx0J05hdmlnYXRlIHJpZ2h0Jyxcblx0XHRcdCcmIzg1OTM7ICAsICBLJzpcdFx0J05hdmlnYXRlIHVwJyxcblx0XHRcdCcmIzg1OTU7ICAsICBKJzpcdFx0J05hdmlnYXRlIGRvd24nLFxuXHRcdFx0J0hvbWUnOlx0XHRcdFx0XHQnRmlyc3Qgc2xpZGUnLFxuXHRcdFx0J0VuZCc6XHRcdFx0XHRcdCdMYXN0IHNsaWRlJyxcblx0XHRcdCdCICAsICAuJzpcdFx0XHRcdCdQYXVzZScsXG5cdFx0XHQnRic6XHRcdFx0XHRcdCdGdWxsc2NyZWVuJyxcblx0XHRcdCdFU0MsIE8nOlx0XHRcdFx0J1NsaWRlIG92ZXJ2aWV3J1xuXHRcdH07XG5cblx0LyoqXG5cdCAqIFN0YXJ0cyB1cCB0aGUgcHJlc2VudGF0aW9uIGlmIHRoZSBjbGllbnQgaXMgY2FwYWJsZS5cblx0ICovXG5cdGZ1bmN0aW9uIGluaXRpYWxpemUoIG9wdGlvbnMgKSB7XG5cblx0XHRjaGVja0NhcGFiaWxpdGllcygpO1xuXG5cdFx0aWYoICFmZWF0dXJlcy50cmFuc2Zvcm1zMmQgJiYgIWZlYXR1cmVzLnRyYW5zZm9ybXMzZCApIHtcblx0XHRcdGRvY3VtZW50LmJvZHkuc2V0QXR0cmlidXRlKCAnY2xhc3MnLCAnbm8tdHJhbnNmb3JtcycgKTtcblxuXHRcdFx0Ly8gU2luY2UgSlMgd29uJ3QgYmUgcnVubmluZyBhbnkgZnVydGhlciwgd2UgbG9hZCBhbGwgbGF6eVxuXHRcdFx0Ly8gbG9hZGluZyBlbGVtZW50cyB1cGZyb250XG5cdFx0XHR2YXIgaW1hZ2VzID0gdG9BcnJheSggZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoICdpbWcnICkgKSxcblx0XHRcdFx0aWZyYW1lcyA9IHRvQXJyYXkoIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCAnaWZyYW1lJyApICk7XG5cblx0XHRcdHZhciBsYXp5TG9hZGFibGUgPSBpbWFnZXMuY29uY2F0KCBpZnJhbWVzICk7XG5cblx0XHRcdGZvciggdmFyIGkgPSAwLCBsZW4gPSBsYXp5TG9hZGFibGUubGVuZ3RoOyBpIDwgbGVuOyBpKysgKSB7XG5cdFx0XHRcdHZhciBlbGVtZW50ID0gbGF6eUxvYWRhYmxlW2ldO1xuXHRcdFx0XHRpZiggZWxlbWVudC5nZXRBdHRyaWJ1dGUoICdkYXRhLXNyYycgKSApIHtcblx0XHRcdFx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZSggJ3NyYycsIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnZGF0YS1zcmMnICkgKTtcblx0XHRcdFx0XHRlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSggJ2RhdGEtc3JjJyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBjb3JlIGZlYXR1cmVzIHdlIHdvbid0IGJlXG5cdFx0XHQvLyB1c2luZyBKYXZhU2NyaXB0IHRvIGNvbnRyb2wgdGhlIHByZXNlbnRhdGlvblxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIENhY2hlIHJlZmVyZW5jZXMgdG8ga2V5IERPTSBlbGVtZW50c1xuXHRcdGRvbS53cmFwcGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJy5yZXZlYWwnICk7XG5cdFx0ZG9tLnNsaWRlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICcucmV2ZWFsIC5zbGlkZXMnICk7XG5cblx0XHQvLyBGb3JjZSBhIGxheW91dCB3aGVuIHRoZSB3aG9sZSBwYWdlLCBpbmNsIGZvbnRzLCBoYXMgbG9hZGVkXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgbGF5b3V0LCBmYWxzZSApO1xuXG5cdFx0dmFyIHF1ZXJ5ID0gUmV2ZWFsLmdldFF1ZXJ5SGFzaCgpO1xuXG5cdFx0Ly8gRG8gbm90IGFjY2VwdCBuZXcgZGVwZW5kZW5jaWVzIHZpYSBxdWVyeSBjb25maWcgdG8gYXZvaWRcblx0XHQvLyB0aGUgcG90ZW50aWFsIG9mIG1hbGljaW91cyBzY3JpcHQgaW5qZWN0aW9uXG5cdFx0aWYoIHR5cGVvZiBxdWVyeVsnZGVwZW5kZW5jaWVzJ10gIT09ICd1bmRlZmluZWQnICkgZGVsZXRlIHF1ZXJ5WydkZXBlbmRlbmNpZXMnXTtcblxuXHRcdC8vIENvcHkgb3B0aW9ucyBvdmVyIHRvIG91ciBjb25maWcgb2JqZWN0XG5cdFx0ZXh0ZW5kKCBjb25maWcsIG9wdGlvbnMgKTtcblx0XHRleHRlbmQoIGNvbmZpZywgcXVlcnkgKTtcblxuXHRcdC8vIEhpZGUgdGhlIGFkZHJlc3MgYmFyIGluIG1vYmlsZSBicm93c2Vyc1xuXHRcdGhpZGVBZGRyZXNzQmFyKCk7XG5cblx0XHQvLyBMb2FkcyB0aGUgZGVwZW5kZW5jaWVzIGFuZCBjb250aW51ZXMgdG8gI3N0YXJ0KCkgb25jZSBkb25lXG5cdFx0bG9hZCgpO1xuXG5cdH1cblxuXHQvKipcblx0ICogSW5zcGVjdCB0aGUgY2xpZW50IHRvIHNlZSB3aGF0IGl0J3MgY2FwYWJsZSBvZiwgdGhpc1xuXHQgKiBzaG91bGQgb25seSBoYXBwZW5zIG9uY2UgcGVyIHJ1bnRpbWUuXG5cdCAqL1xuXHRmdW5jdGlvbiBjaGVja0NhcGFiaWxpdGllcygpIHtcblxuXHRcdGZlYXR1cmVzLnRyYW5zZm9ybXMzZCA9ICdXZWJraXRQZXJzcGVjdGl2ZScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSB8fFxuXHRcdFx0XHRcdFx0XHRcdCdNb3pQZXJzcGVjdGl2ZScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSB8fFxuXHRcdFx0XHRcdFx0XHRcdCdtc1BlcnNwZWN0aXZlJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8XG5cdFx0XHRcdFx0XHRcdFx0J09QZXJzcGVjdGl2ZScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSB8fFxuXHRcdFx0XHRcdFx0XHRcdCdwZXJzcGVjdGl2ZScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZTtcblxuXHRcdGZlYXR1cmVzLnRyYW5zZm9ybXMyZCA9ICdXZWJraXRUcmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUgfHxcblx0XHRcdFx0XHRcdFx0XHQnTW96VHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8XG5cdFx0XHRcdFx0XHRcdFx0J21zVHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8XG5cdFx0XHRcdFx0XHRcdFx0J09UcmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUgfHxcblx0XHRcdFx0XHRcdFx0XHQndHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlO1xuXG5cdFx0ZmVhdHVyZXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lTWV0aG9kID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cdFx0ZmVhdHVyZXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdHlwZW9mIGZlYXR1cmVzLnJlcXVlc3RBbmltYXRpb25GcmFtZU1ldGhvZCA9PT0gJ2Z1bmN0aW9uJztcblxuXHRcdGZlYXR1cmVzLmNhbnZhcyA9ICEhZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKS5nZXRDb250ZXh0O1xuXG5cdFx0ZmVhdHVyZXMudG91Y2ggPSAhISggJ29udG91Y2hzdGFydCcgaW4gd2luZG93ICk7XG5cblx0XHQvLyBUcmFuc2l0aW9ucyBpbiB0aGUgb3ZlcnZpZXcgYXJlIGRpc2FibGVkIGluIGRlc2t0b3AgYW5kXG5cdFx0Ly8gbW9iaWxlIFNhZmFyaSBkdWUgdG8gbGFnXG5cdFx0ZmVhdHVyZXMub3ZlcnZpZXdUcmFuc2l0aW9ucyA9ICEvVmVyc2lvblxcL1tcXGRcXC5dKy4qU2FmYXJpLy50ZXN0KCBuYXZpZ2F0b3IudXNlckFnZW50ICk7XG5cblx0XHRpc01vYmlsZURldmljZSA9IC8oaXBob25lfGlwb2R8aXBhZHxhbmRyb2lkKS9naS50ZXN0KCBuYXZpZ2F0b3IudXNlckFnZW50ICk7XG5cblx0fVxuXG4gICAgLyoqXG4gICAgICogTG9hZHMgdGhlIGRlcGVuZGVuY2llcyBvZiByZXZlYWwuanMuIERlcGVuZGVuY2llcyBhcmVcbiAgICAgKiBkZWZpbmVkIHZpYSB0aGUgY29uZmlndXJhdGlvbiBvcHRpb24gJ2RlcGVuZGVuY2llcydcbiAgICAgKiBhbmQgd2lsbCBiZSBsb2FkZWQgcHJpb3IgdG8gc3RhcnRpbmcvYmluZGluZyByZXZlYWwuanMuXG4gICAgICogU29tZSBkZXBlbmRlbmNpZXMgbWF5IGhhdmUgYW4gJ2FzeW5jJyBmbGFnLCBpZiBzbyB0aGV5XG4gICAgICogd2lsbCBsb2FkIGFmdGVyIHJldmVhbC5qcyBoYXMgYmVlbiBzdGFydGVkIHVwLlxuICAgICAqL1xuXHRmdW5jdGlvbiBsb2FkKCkge1xuXG5cdFx0dmFyIHNjcmlwdHMgPSBbXSxcblx0XHRcdHNjcmlwdHNBc3luYyA9IFtdLFxuXHRcdFx0c2NyaXB0c1RvUHJlbG9hZCA9IDA7XG5cblx0XHQvLyBDYWxsZWQgb25jZSBzeW5jaHJvbm91cyBzY3JpcHRzIGZpbmlzaCBsb2FkaW5nXG5cdFx0ZnVuY3Rpb24gcHJvY2VlZCgpIHtcblx0XHRcdGlmKCBzY3JpcHRzQXN5bmMubGVuZ3RoICkge1xuXHRcdFx0XHQvLyBMb2FkIGFzeW5jaHJvbm91cyBzY3JpcHRzXG5cdFx0XHRcdGhlYWQuanMuYXBwbHkoIG51bGwsIHNjcmlwdHNBc3luYyApO1xuXHRcdFx0fVxuXG5cdFx0XHRzdGFydCgpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGxvYWRTY3JpcHQoIHMgKSB7XG5cdFx0XHRoZWFkLnJlYWR5KCBzLnNyYy5tYXRjaCggLyhbXFx3XFxkX1xcLV0qKVxcLj9qcyR8W15cXFxcXFwvXSokL2kgKVswXSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdC8vIEV4dGVuc2lvbiBtYXkgY29udGFpbiBjYWxsYmFjayBmdW5jdGlvbnNcblx0XHRcdFx0aWYoIHR5cGVvZiBzLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nICkge1xuXHRcdFx0XHRcdHMuY2FsbGJhY2suYXBwbHkoIHRoaXMgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKCAtLXNjcmlwdHNUb1ByZWxvYWQgPT09IDAgKSB7XG5cdFx0XHRcdFx0cHJvY2VlZCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRmb3IoIHZhciBpID0gMCwgbGVuID0gY29uZmlnLmRlcGVuZGVuY2llcy5sZW5ndGg7IGkgPCBsZW47IGkrKyApIHtcblx0XHRcdHZhciBzID0gY29uZmlnLmRlcGVuZGVuY2llc1tpXTtcblxuXHRcdFx0Ly8gTG9hZCBpZiB0aGVyZSdzIG5vIGNvbmRpdGlvbiBvciB0aGUgY29uZGl0aW9uIGlzIHRydXRoeVxuXHRcdFx0aWYoICFzLmNvbmRpdGlvbiB8fCBzLmNvbmRpdGlvbigpICkge1xuXHRcdFx0XHRpZiggcy5hc3luYyApIHtcblx0XHRcdFx0XHRzY3JpcHRzQXN5bmMucHVzaCggcy5zcmMgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRzY3JpcHRzLnB1c2goIHMuc3JjICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsb2FkU2NyaXB0KCBzICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYoIHNjcmlwdHMubGVuZ3RoICkge1xuXHRcdFx0c2NyaXB0c1RvUHJlbG9hZCA9IHNjcmlwdHMubGVuZ3RoO1xuXG5cdFx0XHQvLyBMb2FkIHN5bmNocm9ub3VzIHNjcmlwdHNcblx0XHRcdGhlYWQuanMuYXBwbHkoIG51bGwsIHNjcmlwdHMgKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRwcm9jZWVkKCk7XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogU3RhcnRzIHVwIHJldmVhbC5qcyBieSBiaW5kaW5nIGlucHV0IGV2ZW50cyBhbmQgbmF2aWdhdGluZ1xuXHQgKiB0byB0aGUgY3VycmVudCBVUkwgZGVlcGxpbmsgaWYgdGhlcmUgaXMgb25lLlxuXHQgKi9cblx0ZnVuY3Rpb24gc3RhcnQoKSB7XG5cblx0XHQvLyBNYWtlIHN1cmUgd2UndmUgZ290IGFsbCB0aGUgRE9NIGVsZW1lbnRzIHdlIG5lZWRcblx0XHRzZXR1cERPTSgpO1xuXG5cdFx0Ly8gTGlzdGVuIHRvIG1lc3NhZ2VzIHBvc3RlZCB0byB0aGlzIHdpbmRvd1xuXHRcdHNldHVwUG9zdE1lc3NhZ2UoKTtcblxuXHRcdC8vIFByZXZlbnQgaWZyYW1lcyBmcm9tIHNjcm9sbGluZyB0aGUgc2xpZGVzIG91dCBvZiB2aWV3XG5cdFx0c2V0dXBJZnJhbWVTY3JvbGxQcmV2ZW50aW9uKCk7XG5cblx0XHQvLyBSZXNldHMgYWxsIHZlcnRpY2FsIHNsaWRlcyBzbyB0aGF0IG9ubHkgdGhlIGZpcnN0IGlzIHZpc2libGVcblx0XHRyZXNldFZlcnRpY2FsU2xpZGVzKCk7XG5cblx0XHQvLyBVcGRhdGVzIHRoZSBwcmVzZW50YXRpb24gdG8gbWF0Y2ggdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbiB2YWx1ZXNcblx0XHRjb25maWd1cmUoKTtcblxuXHRcdC8vIFJlYWQgdGhlIGluaXRpYWwgaGFzaFxuXHRcdHJlYWRVUkwoKTtcblxuXHRcdC8vIFVwZGF0ZSBhbGwgYmFja2dyb3VuZHNcblx0XHR1cGRhdGVCYWNrZ3JvdW5kKCB0cnVlICk7XG5cblx0XHQvLyBOb3RpZnkgbGlzdGVuZXJzIHRoYXQgdGhlIHByZXNlbnRhdGlvbiBpcyByZWFkeSBidXQgdXNlIGEgMW1zXG5cdFx0Ly8gdGltZW91dCB0byBlbnN1cmUgaXQncyBub3QgZmlyZWQgc3luY2hyb25vdXNseSBhZnRlciAjaW5pdGlhbGl6ZSgpXG5cdFx0c2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBFbmFibGUgdHJhbnNpdGlvbnMgbm93IHRoYXQgd2UncmUgbG9hZGVkXG5cdFx0XHRkb20uc2xpZGVzLmNsYXNzTGlzdC5yZW1vdmUoICduby10cmFuc2l0aW9uJyApO1xuXG5cdFx0XHRsb2FkZWQgPSB0cnVlO1xuXG5cdFx0XHRkaXNwYXRjaEV2ZW50KCAncmVhZHknLCB7XG5cdFx0XHRcdCdpbmRleGgnOiBpbmRleGgsXG5cdFx0XHRcdCdpbmRleHYnOiBpbmRleHYsXG5cdFx0XHRcdCdjdXJyZW50U2xpZGUnOiBjdXJyZW50U2xpZGVcblx0XHRcdH0gKTtcblx0XHR9LCAxICk7XG5cblx0XHQvLyBTcGVjaWFsIHNldHVwIGFuZCBjb25maWcgaXMgcmVxdWlyZWQgd2hlbiBwcmludGluZyB0byBQREZcblx0XHRpZiggaXNQcmludGluZ1BERigpICkge1xuXHRcdFx0cmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcblxuXHRcdFx0Ly8gVGhlIGRvY3VtZW50IG5lZWRzIHRvIGhhdmUgbG9hZGVkIGZvciB0aGUgUERGIGxheW91dFxuXHRcdFx0Ly8gbWVhc3VyZW1lbnRzIHRvIGJlIGFjY3VyYXRlXG5cdFx0XHRpZiggZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyApIHtcblx0XHRcdFx0c2V0dXBQREYoKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCBzZXR1cFBERiApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmRzIGFuZCBzdG9yZXMgcmVmZXJlbmNlcyB0byBET00gZWxlbWVudHMgd2hpY2ggYXJlXG5cdCAqIHJlcXVpcmVkIGJ5IHRoZSBwcmVzZW50YXRpb24uIElmIGEgcmVxdWlyZWQgZWxlbWVudCBpc1xuXHQgKiBub3QgZm91bmQsIGl0IGlzIGNyZWF0ZWQuXG5cdCAqL1xuXHRmdW5jdGlvbiBzZXR1cERPTSgpIHtcblxuXHRcdC8vIFByZXZlbnQgdHJhbnNpdGlvbnMgd2hpbGUgd2UncmUgbG9hZGluZ1xuXHRcdGRvbS5zbGlkZXMuY2xhc3NMaXN0LmFkZCggJ25vLXRyYW5zaXRpb24nICk7XG5cblx0XHQvLyBCYWNrZ3JvdW5kIGVsZW1lbnRcblx0XHRkb20uYmFja2dyb3VuZCA9IGNyZWF0ZVNpbmdsZXRvbk5vZGUoIGRvbS53cmFwcGVyLCAnZGl2JywgJ2JhY2tncm91bmRzJywgbnVsbCApO1xuXG5cdFx0Ly8gUHJvZ3Jlc3MgYmFyXG5cdFx0ZG9tLnByb2dyZXNzID0gY3JlYXRlU2luZ2xldG9uTm9kZSggZG9tLndyYXBwZXIsICdkaXYnLCAncHJvZ3Jlc3MnLCAnPHNwYW4+PC9zcGFuPicgKTtcblx0XHRkb20ucHJvZ3Jlc3NiYXIgPSBkb20ucHJvZ3Jlc3MucXVlcnlTZWxlY3RvciggJ3NwYW4nICk7XG5cblx0XHQvLyBBcnJvdyBjb250cm9sc1xuXHRcdGNyZWF0ZVNpbmdsZXRvbk5vZGUoIGRvbS53cmFwcGVyLCAnYXNpZGUnLCAnY29udHJvbHMnLFxuXHRcdFx0JzxkaXYgY2xhc3M9XCJuYXZpZ2F0ZS1sZWZ0XCI+PC9kaXY+JyArXG5cdFx0XHQnPGRpdiBjbGFzcz1cIm5hdmlnYXRlLXJpZ2h0XCI+PC9kaXY+JyArXG5cdFx0XHQnPGRpdiBjbGFzcz1cIm5hdmlnYXRlLXVwXCI+PC9kaXY+JyArXG5cdFx0XHQnPGRpdiBjbGFzcz1cIm5hdmlnYXRlLWRvd25cIj48L2Rpdj4nICk7XG5cblx0XHQvLyBTbGlkZSBudW1iZXJcblx0XHRkb20uc2xpZGVOdW1iZXIgPSBjcmVhdGVTaW5nbGV0b25Ob2RlKCBkb20ud3JhcHBlciwgJ2RpdicsICdzbGlkZS1udW1iZXInLCAnJyApO1xuXG5cdFx0Ly8gT3ZlcmxheSBncmFwaGljIHdoaWNoIGlzIGRpc3BsYXllZCBkdXJpbmcgdGhlIHBhdXNlZCBtb2RlXG5cdFx0Y3JlYXRlU2luZ2xldG9uTm9kZSggZG9tLndyYXBwZXIsICdkaXYnLCAncGF1c2Utb3ZlcmxheScsIG51bGwgKTtcblxuXHRcdC8vIENhY2hlIHJlZmVyZW5jZXMgdG8gZWxlbWVudHNcblx0XHRkb20uY29udHJvbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnLnJldmVhbCAuY29udHJvbHMnICk7XG5cdFx0ZG9tLnRoZW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJyN0aGVtZScgKTtcblxuXHRcdGRvbS53cmFwcGVyLnNldEF0dHJpYnV0ZSggJ3JvbGUnLCAnYXBwbGljYXRpb24nICk7XG5cblx0XHQvLyBUaGVyZSBjYW4gYmUgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIGNvbnRyb2xzIHRocm91Z2hvdXQgdGhlIHBhZ2Vcblx0XHRkb20uY29udHJvbHNMZWZ0ID0gdG9BcnJheSggZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCggJy5uYXZpZ2F0ZS1sZWZ0JyApICk7XG5cdFx0ZG9tLmNvbnRyb2xzUmlnaHQgPSB0b0FycmF5KCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCAnLm5hdmlnYXRlLXJpZ2h0JyApICk7XG5cdFx0ZG9tLmNvbnRyb2xzVXAgPSB0b0FycmF5KCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCAnLm5hdmlnYXRlLXVwJyApICk7XG5cdFx0ZG9tLmNvbnRyb2xzRG93biA9IHRvQXJyYXkoIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoICcubmF2aWdhdGUtZG93bicgKSApO1xuXHRcdGRvbS5jb250cm9sc1ByZXYgPSB0b0FycmF5KCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCAnLm5hdmlnYXRlLXByZXYnICkgKTtcblx0XHRkb20uY29udHJvbHNOZXh0ID0gdG9BcnJheSggZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCggJy5uYXZpZ2F0ZS1uZXh0JyApICk7XG5cblx0XHRkb20uc3RhdHVzRGl2ID0gY3JlYXRlU3RhdHVzRGl2KCk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGhpZGRlbiBkaXYgd2l0aCByb2xlIGFyaWEtbGl2ZSB0byBhbm5vdW5jZSB0aGVcblx0ICogY3VycmVudCBzbGlkZSBjb250ZW50LiBIaWRlIHRoZSBkaXYgb2ZmLXNjcmVlbiB0byBtYWtlIGl0XG5cdCAqIGF2YWlsYWJsZSBvbmx5IHRvIEFzc2lzdGl2ZSBUZWNobm9sb2dpZXMuXG5cdCAqL1xuXHRmdW5jdGlvbiBjcmVhdGVTdGF0dXNEaXYoKSB7XG5cblx0XHR2YXIgc3RhdHVzRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdhcmlhLXN0YXR1cy1kaXYnICk7XG5cdFx0aWYoICFzdGF0dXNEaXYgKSB7XG5cdFx0XHRzdGF0dXNEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRcdFx0c3RhdHVzRGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcblx0XHRcdHN0YXR1c0Rpdi5zdHlsZS5oZWlnaHQgPSAnMXB4Jztcblx0XHRcdHN0YXR1c0Rpdi5zdHlsZS53aWR0aCA9ICcxcHgnO1xuXHRcdFx0c3RhdHVzRGl2LnN0eWxlLm92ZXJmbG93ID0naGlkZGVuJztcblx0XHRcdHN0YXR1c0Rpdi5zdHlsZS5jbGlwID0gJ3JlY3QoIDFweCwgMXB4LCAxcHgsIDFweCApJztcblx0XHRcdHN0YXR1c0Rpdi5zZXRBdHRyaWJ1dGUoICdpZCcsICdhcmlhLXN0YXR1cy1kaXYnICk7XG5cdFx0XHRzdGF0dXNEaXYuc2V0QXR0cmlidXRlKCAnYXJpYS1saXZlJywgJ3BvbGl0ZScgKTtcblx0XHRcdHN0YXR1c0Rpdi5zZXRBdHRyaWJ1dGUoICdhcmlhLWF0b21pYycsJ3RydWUnICk7XG5cdFx0XHRkb20ud3JhcHBlci5hcHBlbmRDaGlsZCggc3RhdHVzRGl2ICk7XG5cdFx0fVxuXHRcdHJldHVybiBzdGF0dXNEaXY7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDb25maWd1cmVzIHRoZSBwcmVzZW50YXRpb24gZm9yIHByaW50aW5nIHRvIGEgc3RhdGljXG5cdCAqIFBERi5cblx0ICovXG5cdGZ1bmN0aW9uIHNldHVwUERGKCkge1xuXG5cdFx0dmFyIHNsaWRlU2l6ZSA9IGdldENvbXB1dGVkU2xpZGVTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0ICk7XG5cblx0XHQvLyBEaW1lbnNpb25zIG9mIHRoZSBQREYgcGFnZXNcblx0XHR2YXIgcGFnZVdpZHRoID0gTWF0aC5mbG9vciggc2xpZGVTaXplLndpZHRoICogKCAxICsgY29uZmlnLm1hcmdpbiApICksXG5cdFx0XHRwYWdlSGVpZ2h0ID0gTWF0aC5mbG9vciggc2xpZGVTaXplLmhlaWdodCAqICggMSArIGNvbmZpZy5tYXJnaW4gICkgKTtcblxuXHRcdC8vIERpbWVuc2lvbnMgb2Ygc2xpZGVzIHdpdGhpbiB0aGUgcGFnZXNcblx0XHR2YXIgc2xpZGVXaWR0aCA9IHNsaWRlU2l6ZS53aWR0aCxcblx0XHRcdHNsaWRlSGVpZ2h0ID0gc2xpZGVTaXplLmhlaWdodDtcblxuXHRcdC8vIExldCB0aGUgYnJvd3NlciBrbm93IHdoYXQgcGFnZSBzaXplIHdlIHdhbnQgdG8gcHJpbnRcblx0XHRpbmplY3RTdHlsZVNoZWV0KCAnQHBhZ2V7c2l6ZTonKyBwYWdlV2lkdGggKydweCAnKyBwYWdlSGVpZ2h0ICsncHg7IG1hcmdpbjogMDt9JyApO1xuXG5cdFx0Ly8gTGltaXQgdGhlIHNpemUgb2YgY2VydGFpbiBlbGVtZW50cyB0byB0aGUgZGltZW5zaW9ucyBvZiB0aGUgc2xpZGVcblx0XHRpbmplY3RTdHlsZVNoZWV0KCAnLnJldmVhbCBzZWN0aW9uPmltZywgLnJldmVhbCBzZWN0aW9uPnZpZGVvLCAucmV2ZWFsIHNlY3Rpb24+aWZyYW1le21heC13aWR0aDogJysgc2xpZGVXaWR0aCArJ3B4OyBtYXgtaGVpZ2h0OicrIHNsaWRlSGVpZ2h0ICsncHh9JyApO1xuXG5cdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCAncHJpbnQtcGRmJyApO1xuXHRcdGRvY3VtZW50LmJvZHkuc3R5bGUud2lkdGggPSBwYWdlV2lkdGggKyAncHgnO1xuXHRcdGRvY3VtZW50LmJvZHkuc3R5bGUuaGVpZ2h0ID0gcGFnZUhlaWdodCArICdweCc7XG5cblx0XHQvLyBTbGlkZSBhbmQgc2xpZGUgYmFja2dyb3VuZCBsYXlvdXRcblx0XHR0b0FycmF5KCBkb20ud3JhcHBlci5xdWVyeVNlbGVjdG9yQWxsKCBTTElERVNfU0VMRUNUT1IgKSApLmZvckVhY2goIGZ1bmN0aW9uKCBzbGlkZSApIHtcblxuXHRcdFx0Ly8gVmVydGljYWwgc3RhY2tzIGFyZSBub3QgY2VudHJlZCBzaW5jZSB0aGVpciBzZWN0aW9uXG5cdFx0XHQvLyBjaGlsZHJlbiB3aWxsIGJlXG5cdFx0XHRpZiggc2xpZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCAnc3RhY2snICkgPT09IGZhbHNlICkge1xuXHRcdFx0XHQvLyBDZW50ZXIgdGhlIHNsaWRlIGluc2lkZSBvZiB0aGUgcGFnZSwgZ2l2aW5nIHRoZSBzbGlkZSBzb21lIG1hcmdpblxuXHRcdFx0XHR2YXIgbGVmdCA9ICggcGFnZVdpZHRoIC0gc2xpZGVXaWR0aCApIC8gMixcblx0XHRcdFx0XHR0b3AgPSAoIHBhZ2VIZWlnaHQgLSBzbGlkZUhlaWdodCApIC8gMjtcblxuXHRcdFx0XHR2YXIgY29udGVudEhlaWdodCA9IGdldEFic29sdXRlSGVpZ2h0KCBzbGlkZSApO1xuXHRcdFx0XHR2YXIgbnVtYmVyT2ZQYWdlcyA9IE1hdGgubWF4KCBNYXRoLmNlaWwoIGNvbnRlbnRIZWlnaHQgLyBwYWdlSGVpZ2h0ICksIDEgKTtcblxuXHRcdFx0XHQvLyBDZW50ZXIgc2xpZGVzIHZlcnRpY2FsbHlcblx0XHRcdFx0aWYoIG51bWJlck9mUGFnZXMgPT09IDEgJiYgY29uZmlnLmNlbnRlciB8fCBzbGlkZS5jbGFzc0xpc3QuY29udGFpbnMoICdjZW50ZXInICkgKSB7XG5cdFx0XHRcdFx0dG9wID0gTWF0aC5tYXgoICggcGFnZUhlaWdodCAtIGNvbnRlbnRIZWlnaHQgKSAvIDIsIDAgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFBvc2l0aW9uIHRoZSBzbGlkZSBpbnNpZGUgb2YgdGhlIHBhZ2Vcblx0XHRcdFx0c2xpZGUuc3R5bGUubGVmdCA9IGxlZnQgKyAncHgnO1xuXHRcdFx0XHRzbGlkZS5zdHlsZS50b3AgPSB0b3AgKyAncHgnO1xuXHRcdFx0XHRzbGlkZS5zdHlsZS53aWR0aCA9IHNsaWRlV2lkdGggKyAncHgnO1xuXG5cdFx0XHRcdC8vIFRPRE8gQmFja2dyb3VuZHMgbmVlZCB0byBiZSBtdWx0aXBsaWVkIHdoZW4gdGhlIHNsaWRlXG5cdFx0XHRcdC8vIHN0cmV0Y2hlcyBvdmVyIG11bHRpcGxlIHBhZ2VzXG5cdFx0XHRcdHZhciBiYWNrZ3JvdW5kID0gc2xpZGUucXVlcnlTZWxlY3RvciggJy5zbGlkZS1iYWNrZ3JvdW5kJyApO1xuXHRcdFx0XHRpZiggYmFja2dyb3VuZCApIHtcblx0XHRcdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLndpZHRoID0gcGFnZVdpZHRoICsgJ3B4Jztcblx0XHRcdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLmhlaWdodCA9ICggcGFnZUhlaWdodCAqIG51bWJlck9mUGFnZXMgKSArICdweCc7XG5cdFx0XHRcdFx0YmFja2dyb3VuZC5zdHlsZS50b3AgPSAtdG9wICsgJ3B4Jztcblx0XHRcdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLmxlZnQgPSAtbGVmdCArICdweCc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdH0gKTtcblxuXHRcdC8vIFNob3cgYWxsIGZyYWdtZW50c1xuXHRcdHRvQXJyYXkoIGRvbS53cmFwcGVyLnF1ZXJ5U2VsZWN0b3JBbGwoIFNMSURFU19TRUxFQ1RPUiArICcgLmZyYWdtZW50JyApICkuZm9yRWFjaCggZnVuY3Rpb24oIGZyYWdtZW50ICkge1xuXHRcdFx0ZnJhZ21lbnQuY2xhc3NMaXN0LmFkZCggJ3Zpc2libGUnICk7XG5cdFx0fSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBpcyBhbiB1bmZvcnR1bmF0ZSBuZWNlc3NpdHkuIElmcmFtZXMgY2FuIHRyaWdnZXIgdGhlXG5cdCAqIHBhcmVudCB3aW5kb3cgdG8gc2Nyb2xsLCBmb3IgZXhhbXBsZSBieSBmb2N1c2luZyBhbiBpbnB1dC5cblx0ICogVGhpcyBzY3JvbGxpbmcgY2FuIG5vdCBiZSBwcmV2ZW50ZWQgYnkgaGlkaW5nIG92ZXJmbG93IGluXG5cdCAqIENTUyBzbyB3ZSBoYXZlIHRvIHJlc29ydCB0byByZXBlYXRlZGx5IGNoZWNraW5nIGlmIHRoZVxuXHQgKiBicm93c2VyIGhhcyBkZWNpZGVkIHRvIG9mZnNldCBvdXIgc2xpZGVzIDooXG5cdCAqL1xuXHRmdW5jdGlvbiBzZXR1cElmcmFtZVNjcm9sbFByZXZlbnRpb24oKSB7XG5cblx0XHRpZiggZG9tLnNsaWRlcy5xdWVyeVNlbGVjdG9yKCAnaWZyYW1lJyApICkge1xuXHRcdFx0c2V0SW50ZXJ2YWwoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiggZG9tLndyYXBwZXIuc2Nyb2xsVG9wICE9PSAwIHx8IGRvbS53cmFwcGVyLnNjcm9sbExlZnQgIT09IDAgKSB7XG5cdFx0XHRcdFx0ZG9tLndyYXBwZXIuc2Nyb2xsVG9wID0gMDtcblx0XHRcdFx0XHRkb20ud3JhcHBlci5zY3JvbGxMZWZ0ID0gMDtcblx0XHRcdFx0fVxuXHRcdFx0fSwgNTAwICk7XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBIVE1MIGVsZW1lbnQgYW5kIHJldHVybnMgYSByZWZlcmVuY2UgdG8gaXQuXG5cdCAqIElmIHRoZSBlbGVtZW50IGFscmVhZHkgZXhpc3RzIHRoZSBleGlzdGluZyBpbnN0YW5jZSB3aWxsXG5cdCAqIGJlIHJldHVybmVkLlxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlU2luZ2xldG9uTm9kZSggY29udGFpbmVyLCB0YWduYW1lLCBjbGFzc25hbWUsIGlubmVySFRNTCApIHtcblxuXHRcdC8vIEZpbmQgYWxsIG5vZGVzIG1hdGNoaW5nIHRoZSBkZXNjcmlwdGlvblxuXHRcdHZhciBub2RlcyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCAnLicgKyBjbGFzc25hbWUgKTtcblxuXHRcdC8vIENoZWNrIGFsbCBtYXRjaGVzIHRvIGZpbmQgb25lIHdoaWNoIGlzIGEgZGlyZWN0IGNoaWxkIG9mXG5cdFx0Ly8gdGhlIHNwZWNpZmllZCBjb250YWluZXJcblx0XHRmb3IoIHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrICkge1xuXHRcdFx0dmFyIHRlc3ROb2RlID0gbm9kZXNbaV07XG5cdFx0XHRpZiggdGVzdE5vZGUucGFyZW50Tm9kZSA9PT0gY29udGFpbmVyICkge1xuXHRcdFx0XHRyZXR1cm4gdGVzdE5vZGU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gSWYgbm8gbm9kZSB3YXMgZm91bmQsIGNyZWF0ZSBpdCBub3dcblx0XHR2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIHRhZ25hbWUgKTtcblx0XHRub2RlLmNsYXNzTGlzdC5hZGQoIGNsYXNzbmFtZSApO1xuXHRcdGlmKCB0eXBlb2YgaW5uZXJIVE1MID09PSAnc3RyaW5nJyApIHtcblx0XHRcdG5vZGUuaW5uZXJIVE1MID0gaW5uZXJIVE1MO1xuXHRcdH1cblx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoIG5vZGUgKTtcblxuXHRcdHJldHVybiBub2RlO1xuXG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyB0aGUgc2xpZGUgYmFja2dyb3VuZCBlbGVtZW50cyBhbmQgYXBwZW5kcyB0aGVtXG5cdCAqIHRvIHRoZSBiYWNrZ3JvdW5kIGNvbnRhaW5lci4gT25lIGVsZW1lbnQgaXMgY3JlYXRlZCBwZXJcblx0ICogc2xpZGUgbm8gbWF0dGVyIGlmIHRoZSBnaXZlbiBzbGlkZSBoYXMgdmlzaWJsZSBiYWNrZ3JvdW5kLlxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlQmFja2dyb3VuZHMoKSB7XG5cblx0XHR2YXIgcHJpbnRNb2RlID0gaXNQcmludGluZ1BERigpO1xuXG5cdFx0Ly8gQ2xlYXIgcHJpb3IgYmFja2dyb3VuZHNcblx0XHRkb20uYmFja2dyb3VuZC5pbm5lckhUTUwgPSAnJztcblx0XHRkb20uYmFja2dyb3VuZC5jbGFzc0xpc3QuYWRkKCAnbm8tdHJhbnNpdGlvbicgKTtcblxuXHRcdC8vIEl0ZXJhdGUgb3ZlciBhbGwgaG9yaXpvbnRhbCBzbGlkZXNcblx0XHR0b0FycmF5KCBkb20ud3JhcHBlci5xdWVyeVNlbGVjdG9yQWxsKCBIT1JJWk9OVEFMX1NMSURFU19TRUxFQ1RPUiApICkuZm9yRWFjaCggZnVuY3Rpb24oIHNsaWRlaCApIHtcblxuXHRcdFx0dmFyIGJhY2tncm91bmRTdGFjaztcblxuXHRcdFx0aWYoIHByaW50TW9kZSApIHtcblx0XHRcdFx0YmFja2dyb3VuZFN0YWNrID0gY3JlYXRlQmFja2dyb3VuZCggc2xpZGVoLCBzbGlkZWggKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRiYWNrZ3JvdW5kU3RhY2sgPSBjcmVhdGVCYWNrZ3JvdW5kKCBzbGlkZWgsIGRvbS5iYWNrZ3JvdW5kICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEl0ZXJhdGUgb3ZlciBhbGwgdmVydGljYWwgc2xpZGVzXG5cdFx0XHR0b0FycmF5KCBzbGlkZWgucXVlcnlTZWxlY3RvckFsbCggJ3NlY3Rpb24nICkgKS5mb3JFYWNoKCBmdW5jdGlvbiggc2xpZGV2ICkge1xuXG5cdFx0XHRcdGlmKCBwcmludE1vZGUgKSB7XG5cdFx0XHRcdFx0Y3JlYXRlQmFja2dyb3VuZCggc2xpZGV2LCBzbGlkZXYgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjcmVhdGVCYWNrZ3JvdW5kKCBzbGlkZXYsIGJhY2tncm91bmRTdGFjayApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YmFja2dyb3VuZFN0YWNrLmNsYXNzTGlzdC5hZGQoICdzdGFjaycgKTtcblxuXHRcdFx0fSApO1xuXG5cdFx0fSApO1xuXG5cdFx0Ly8gQWRkIHBhcmFsbGF4IGJhY2tncm91bmQgaWYgc3BlY2lmaWVkXG5cdFx0aWYoIGNvbmZpZy5wYXJhbGxheEJhY2tncm91bmRJbWFnZSApIHtcblxuXHRcdFx0ZG9tLmJhY2tncm91bmQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybChcIicgKyBjb25maWcucGFyYWxsYXhCYWNrZ3JvdW5kSW1hZ2UgKyAnXCIpJztcblx0XHRcdGRvbS5iYWNrZ3JvdW5kLnN0eWxlLmJhY2tncm91bmRTaXplID0gY29uZmlnLnBhcmFsbGF4QmFja2dyb3VuZFNpemU7XG5cblx0XHRcdC8vIE1ha2Ugc3VyZSB0aGUgYmVsb3cgcHJvcGVydGllcyBhcmUgc2V0IG9uIHRoZSBlbGVtZW50IC0gdGhlc2UgcHJvcGVydGllcyBhcmVcblx0XHRcdC8vIG5lZWRlZCBmb3IgcHJvcGVyIHRyYW5zaXRpb25zIHRvIGJlIHNldCBvbiB0aGUgZWxlbWVudCB2aWEgQ1NTLiBUbyByZW1vdmVcblx0XHRcdC8vIGFubm95aW5nIGJhY2tncm91bmQgc2xpZGUtaW4gZWZmZWN0IHdoZW4gdGhlIHByZXNlbnRhdGlvbiBzdGFydHMsIGFwcGx5XG5cdFx0XHQvLyB0aGVzZSBwcm9wZXJ0aWVzIGFmdGVyIHNob3J0IHRpbWUgZGVsYXlcblx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRkb20ud3JhcHBlci5jbGFzc0xpc3QuYWRkKCAnaGFzLXBhcmFsbGF4LWJhY2tncm91bmQnICk7XG5cdFx0XHR9LCAxICk7XG5cblx0XHR9XG5cdFx0ZWxzZSB7XG5cblx0XHRcdGRvbS5iYWNrZ3JvdW5kLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9ICcnO1xuXHRcdFx0ZG9tLndyYXBwZXIuY2xhc3NMaXN0LnJlbW92ZSggJ2hhcy1wYXJhbGxheC1iYWNrZ3JvdW5kJyApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGJhY2tncm91bmQgZm9yIHRoZSBnaXZlbiBzbGlkZS5cblx0ICpcblx0ICogQHBhcmFtIHtIVE1MRWxlbWVudH0gc2xpZGVcblx0ICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIFRoZSBlbGVtZW50IHRoYXQgdGhlIGJhY2tncm91bmRcblx0ICogc2hvdWxkIGJlIGFwcGVuZGVkIHRvXG5cdCAqL1xuXHRmdW5jdGlvbiBjcmVhdGVCYWNrZ3JvdW5kKCBzbGlkZSwgY29udGFpbmVyICkge1xuXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRiYWNrZ3JvdW5kOiBzbGlkZS5nZXRBdHRyaWJ1dGUoICdkYXRhLWJhY2tncm91bmQnICksXG5cdFx0XHRiYWNrZ3JvdW5kU2l6ZTogc2xpZGUuZ2V0QXR0cmlidXRlKCAnZGF0YS1iYWNrZ3JvdW5kLXNpemUnICksXG5cdFx0XHRiYWNrZ3JvdW5kSW1hZ2U6IHNsaWRlLmdldEF0dHJpYnV0ZSggJ2RhdGEtYmFja2dyb3VuZC1pbWFnZScgKSxcblx0XHRcdGJhY2tncm91bmRWaWRlbzogc2xpZGUuZ2V0QXR0cmlidXRlKCAnZGF0YS1iYWNrZ3JvdW5kLXZpZGVvJyApLFxuXHRcdFx0YmFja2dyb3VuZElmcmFtZTogc2xpZGUuZ2V0QXR0cmlidXRlKCAnZGF0YS1iYWNrZ3JvdW5kLWlmcmFtZScgKSxcblx0XHRcdGJhY2tncm91bmRDb2xvcjogc2xpZGUuZ2V0QXR0cmlidXRlKCAnZGF0YS1iYWNrZ3JvdW5kLWNvbG9yJyApLFxuXHRcdFx0YmFja2dyb3VuZFJlcGVhdDogc2xpZGUuZ2V0QXR0cmlidXRlKCAnZGF0YS1iYWNrZ3JvdW5kLXJlcGVhdCcgKSxcblx0XHRcdGJhY2tncm91bmRQb3NpdGlvbjogc2xpZGUuZ2V0QXR0cmlidXRlKCAnZGF0YS1iYWNrZ3JvdW5kLXBvc2l0aW9uJyApLFxuXHRcdFx0YmFja2dyb3VuZFRyYW5zaXRpb246IHNsaWRlLmdldEF0dHJpYnV0ZSggJ2RhdGEtYmFja2dyb3VuZC10cmFuc2l0aW9uJyApXG5cdFx0fTtcblxuXHRcdHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblxuXHRcdC8vIENhcnJ5IG92ZXIgY3VzdG9tIGNsYXNzZXMgZnJvbSB0aGUgc2xpZGUgdG8gdGhlIGJhY2tncm91bmRcblx0XHRlbGVtZW50LmNsYXNzTmFtZSA9ICdzbGlkZS1iYWNrZ3JvdW5kICcgKyBzbGlkZS5jbGFzc05hbWUucmVwbGFjZSggL3ByZXNlbnR8cGFzdHxmdXR1cmUvLCAnJyApO1xuXG5cdFx0aWYoIGRhdGEuYmFja2dyb3VuZCApIHtcblx0XHRcdC8vIEF1dG8td3JhcCBpbWFnZSB1cmxzIGluIHVybCguLi4pXG5cdFx0XHRpZiggL14oaHR0cHxmaWxlfFxcL1xcLykvZ2kudGVzdCggZGF0YS5iYWNrZ3JvdW5kICkgfHwgL1xcLihzdmd8cG5nfGpwZ3xqcGVnfGdpZnxibXApJC9naS50ZXN0KCBkYXRhLmJhY2tncm91bmQgKSApIHtcblx0XHRcdFx0c2xpZGUuc2V0QXR0cmlidXRlKCAnZGF0YS1iYWNrZ3JvdW5kLWltYWdlJywgZGF0YS5iYWNrZ3JvdW5kICk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0ZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kID0gZGF0YS5iYWNrZ3JvdW5kO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIENyZWF0ZSBhIGhhc2ggZm9yIHRoaXMgY29tYmluYXRpb24gb2YgYmFja2dyb3VuZCBzZXR0aW5ncy5cblx0XHQvLyBUaGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHdoZW4gdHdvIHNsaWRlIGJhY2tncm91bmRzIGFyZVxuXHRcdC8vIHRoZSBzYW1lLlxuXHRcdGlmKCBkYXRhLmJhY2tncm91bmQgfHwgZGF0YS5iYWNrZ3JvdW5kQ29sb3IgfHwgZGF0YS5iYWNrZ3JvdW5kSW1hZ2UgfHwgZGF0YS5iYWNrZ3JvdW5kVmlkZW8gfHwgZGF0YS5iYWNrZ3JvdW5kSWZyYW1lICkge1xuXHRcdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoICdkYXRhLWJhY2tncm91bmQtaGFzaCcsIGRhdGEuYmFja2dyb3VuZCArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkYXRhLmJhY2tncm91bmRTaXplICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGEuYmFja2dyb3VuZEltYWdlICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGEuYmFja2dyb3VuZFZpZGVvICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGEuYmFja2dyb3VuZElmcmFtZSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkYXRhLmJhY2tncm91bmRDb2xvciArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkYXRhLmJhY2tncm91bmRSZXBlYXQgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YS5iYWNrZ3JvdW5kUG9zaXRpb24gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YS5iYWNrZ3JvdW5kVHJhbnNpdGlvbiApO1xuXHRcdH1cblxuXHRcdC8vIEFkZGl0aW9uYWwgYW5kIG9wdGlvbmFsIGJhY2tncm91bmQgcHJvcGVydGllc1xuXHRcdGlmKCBkYXRhLmJhY2tncm91bmRTaXplICkgZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9IGRhdGEuYmFja2dyb3VuZFNpemU7XG5cdFx0aWYoIGRhdGEuYmFja2dyb3VuZENvbG9yICkgZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBkYXRhLmJhY2tncm91bmRDb2xvcjtcblx0XHRpZiggZGF0YS5iYWNrZ3JvdW5kUmVwZWF0ICkgZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kUmVwZWF0ID0gZGF0YS5iYWNrZ3JvdW5kUmVwZWF0O1xuXHRcdGlmKCBkYXRhLmJhY2tncm91bmRQb3NpdGlvbiApIGVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZFBvc2l0aW9uID0gZGF0YS5iYWNrZ3JvdW5kUG9zaXRpb247XG5cdFx0aWYoIGRhdGEuYmFja2dyb3VuZFRyYW5zaXRpb24gKSBlbGVtZW50LnNldEF0dHJpYnV0ZSggJ2RhdGEtYmFja2dyb3VuZC10cmFuc2l0aW9uJywgZGF0YS5iYWNrZ3JvdW5kVHJhbnNpdGlvbiApO1xuXG5cdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKCBlbGVtZW50ICk7XG5cblx0XHQvLyBJZiBiYWNrZ3JvdW5kcyBhcmUgYmVpbmcgcmVjcmVhdGVkLCBjbGVhciBvbGQgY2xhc3Nlc1xuXHRcdHNsaWRlLmNsYXNzTGlzdC5yZW1vdmUoICdoYXMtZGFyay1iYWNrZ3JvdW5kJyApO1xuXHRcdHNsaWRlLmNsYXNzTGlzdC5yZW1vdmUoICdoYXMtbGlnaHQtYmFja2dyb3VuZCcgKTtcblxuXHRcdC8vIElmIHRoaXMgc2xpZGUgaGFzIGEgYmFja2dyb3VuZCBjb2xvciwgYWRkIGEgY2xhc3MgdGhhdFxuXHRcdC8vIHNpZ25hbHMgaWYgaXQgaXMgbGlnaHQgb3IgZGFyay4gSWYgdGhlIHNsaWRlIGhhcyBubyBiYWNrZ3JvdW5kXG5cdFx0Ly8gY29sb3IsIG5vIGNsYXNzIHdpbGwgYmUgc2V0XG5cdFx0dmFyIGNvbXB1dGVkQmFja2dyb3VuZENvbG9yID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoIGVsZW1lbnQgKS5iYWNrZ3JvdW5kQ29sb3I7XG5cdFx0aWYoIGNvbXB1dGVkQmFja2dyb3VuZENvbG9yICkge1xuXHRcdFx0dmFyIHJnYiA9IGNvbG9yVG9SZ2IoIGNvbXB1dGVkQmFja2dyb3VuZENvbG9yICk7XG5cblx0XHRcdC8vIElnbm9yZSBmdWxseSB0cmFuc3BhcmVudCBiYWNrZ3JvdW5kcy4gU29tZSBicm93c2VycyByZXR1cm5cblx0XHRcdC8vIHJnYmEoMCwwLDAsMCkgd2hlbiByZWFkaW5nIHRoZSBjb21wdXRlZCBiYWNrZ3JvdW5kIGNvbG9yIG9mXG5cdFx0XHQvLyBhbiBlbGVtZW50IHdpdGggbm8gYmFja2dyb3VuZFxuXHRcdFx0aWYoIHJnYiAmJiByZ2IuYSAhPT0gMCApIHtcblx0XHRcdFx0aWYoIGNvbG9yQnJpZ2h0bmVzcyggY29tcHV0ZWRCYWNrZ3JvdW5kQ29sb3IgKSA8IDEyOCApIHtcblx0XHRcdFx0XHRzbGlkZS5jbGFzc0xpc3QuYWRkKCAnaGFzLWRhcmstYmFja2dyb3VuZCcgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRzbGlkZS5jbGFzc0xpc3QuYWRkKCAnaGFzLWxpZ2h0LWJhY2tncm91bmQnICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZWxlbWVudDtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhIGxpc3RlbmVyIHRvIHBvc3RNZXNzYWdlIGV2ZW50cywgdGhpcyBtYWtlcyBpdFxuXHQgKiBwb3NzaWJsZSB0byBjYWxsIGFsbCByZXZlYWwuanMgQVBJIG1ldGhvZHMgZnJvbSBhbm90aGVyXG5cdCAqIHdpbmRvdy4gRm9yIGV4YW1wbGU6XG5cdCAqXG5cdCAqIHJldmVhbFdpbmRvdy5wb3N0TWVzc2FnZSggSlNPTi5zdHJpbmdpZnkoe1xuXHQgKiAgIG1ldGhvZDogJ3NsaWRlJyxcblx0ICogICBhcmdzOiBbIDIgXVxuXHQgKiB9KSwgJyonICk7XG5cdCAqL1xuXHRmdW5jdGlvbiBzZXR1cFBvc3RNZXNzYWdlKCkge1xuXG5cdFx0aWYoIGNvbmZpZy5wb3N0TWVzc2FnZSApIHtcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbWVzc2FnZScsIGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0XHRcdHZhciBkYXRhID0gZXZlbnQuZGF0YTtcblxuXHRcdFx0XHQvLyBNYWtlIHN1cmUgd2UncmUgZGVhbGluZyB3aXRoIEpTT05cblx0XHRcdFx0aWYoIHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJyAmJiBkYXRhLmNoYXJBdCggMCApID09PSAneycgJiYgZGF0YS5jaGFyQXQoIGRhdGEubGVuZ3RoIC0gMSApID09PSAnfScgKSB7XG5cdFx0XHRcdFx0ZGF0YSA9IEpTT04ucGFyc2UoIGRhdGEgKTtcblxuXHRcdFx0XHRcdC8vIENoZWNrIGlmIHRoZSByZXF1ZXN0ZWQgbWV0aG9kIGNhbiBiZSBmb3VuZFxuXHRcdFx0XHRcdGlmKCBkYXRhLm1ldGhvZCAmJiB0eXBlb2YgUmV2ZWFsW2RhdGEubWV0aG9kXSA9PT0gJ2Z1bmN0aW9uJyApIHtcblx0XHRcdFx0XHRcdFJldmVhbFtkYXRhLm1ldGhvZF0uYXBwbHkoIFJldmVhbCwgZGF0YS5hcmdzICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9LCBmYWxzZSApO1xuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGxpZXMgdGhlIGNvbmZpZ3VyYXRpb24gc2V0dGluZ3MgZnJvbSB0aGUgY29uZmlnXG5cdCAqIG9iamVjdC4gTWF5IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcy5cblx0ICovXG5cdGZ1bmN0aW9uIGNvbmZpZ3VyZSggb3B0aW9ucyApIHtcblxuXHRcdHZhciBudW1iZXJPZlNsaWRlcyA9IGRvbS53cmFwcGVyLnF1ZXJ5U2VsZWN0b3JBbGwoIFNMSURFU19TRUxFQ1RPUiApLmxlbmd0aDtcblxuXHRcdGRvbS53cmFwcGVyLmNsYXNzTGlzdC5yZW1vdmUoIGNvbmZpZy50cmFuc2l0aW9uICk7XG5cblx0XHQvLyBOZXcgY29uZmlnIG9wdGlvbnMgbWF5IGJlIHBhc3NlZCB3aGVuIHRoaXMgbWV0aG9kXG5cdFx0Ly8gaXMgaW52b2tlZCB0aHJvdWdoIHRoZSBBUEkgYWZ0ZXIgaW5pdGlhbGl6YXRpb25cblx0XHRpZiggdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICkgZXh0ZW5kKCBjb25maWcsIG9wdGlvbnMgKTtcblxuXHRcdC8vIEZvcmNlIGxpbmVhciB0cmFuc2l0aW9uIGJhc2VkIG9uIGJyb3dzZXIgY2FwYWJpbGl0aWVzXG5cdFx0aWYoIGZlYXR1cmVzLnRyYW5zZm9ybXMzZCA9PT0gZmFsc2UgKSBjb25maWcudHJhbnNpdGlvbiA9ICdsaW5lYXInO1xuXG5cdFx0ZG9tLndyYXBwZXIuY2xhc3NMaXN0LmFkZCggY29uZmlnLnRyYW5zaXRpb24gKTtcblxuXHRcdGRvbS53cmFwcGVyLnNldEF0dHJpYnV0ZSggJ2RhdGEtdHJhbnNpdGlvbi1zcGVlZCcsIGNvbmZpZy50cmFuc2l0aW9uU3BlZWQgKTtcblx0XHRkb20ud3JhcHBlci5zZXRBdHRyaWJ1dGUoICdkYXRhLWJhY2tncm91bmQtdHJhbnNpdGlvbicsIGNvbmZpZy5iYWNrZ3JvdW5kVHJhbnNpdGlvbiApO1xuXG5cdFx0ZG9tLmNvbnRyb2xzLnN0eWxlLmRpc3BsYXkgPSBjb25maWcuY29udHJvbHMgPyAnYmxvY2snIDogJ25vbmUnO1xuXHRcdGRvbS5wcm9ncmVzcy5zdHlsZS5kaXNwbGF5ID0gY29uZmlnLnByb2dyZXNzID8gJ2Jsb2NrJyA6ICdub25lJztcblxuXHRcdGlmKCBjb25maWcucnRsICkge1xuXHRcdFx0ZG9tLndyYXBwZXIuY2xhc3NMaXN0LmFkZCggJ3J0bCcgKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRkb20ud3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKCAncnRsJyApO1xuXHRcdH1cblxuXHRcdGlmKCBjb25maWcuY2VudGVyICkge1xuXHRcdFx0ZG9tLndyYXBwZXIuY2xhc3NMaXN0LmFkZCggJ2NlbnRlcicgKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRkb20ud3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKCAnY2VudGVyJyApO1xuXHRcdH1cblxuXHRcdC8vIEV4aXQgdGhlIHBhdXNlZCBtb2RlIGlmIGl0IHdhcyBjb25maWd1cmVkIG9mZlxuXHRcdGlmKCBjb25maWcucGF1c2UgPT09IGZhbHNlICkge1xuXHRcdFx0cmVzdW1lKCk7XG5cdFx0fVxuXG5cdFx0aWYoIGNvbmZpZy5tb3VzZVdoZWVsICkge1xuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ0RPTU1vdXNlU2Nyb2xsJywgb25Eb2N1bWVudE1vdXNlU2Nyb2xsLCBmYWxzZSApOyAvLyBGRlxuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNld2hlZWwnLCBvbkRvY3VtZW50TW91c2VTY3JvbGwsIGZhbHNlICk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ0RPTU1vdXNlU2Nyb2xsJywgb25Eb2N1bWVudE1vdXNlU2Nyb2xsLCBmYWxzZSApOyAvLyBGRlxuXHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNld2hlZWwnLCBvbkRvY3VtZW50TW91c2VTY3JvbGwsIGZhbHNlICk7XG5cdFx0fVxuXG5cdFx0Ly8gUm9sbGluZyAzRCBsaW5rc1xuXHRcdGlmKCBjb25maWcucm9sbGluZ0xpbmtzICkge1xuXHRcdFx0ZW5hYmxlUm9sbGluZ0xpbmtzKCk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0ZGlzYWJsZVJvbGxpbmdMaW5rcygpO1xuXHRcdH1cblxuXHRcdC8vIElmcmFtZSBsaW5rIHByZXZpZXdzXG5cdFx0aWYoIGNvbmZpZy5wcmV2aWV3TGlua3MgKSB7XG5cdFx0XHRlbmFibGVQcmV2aWV3TGlua3MoKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRkaXNhYmxlUHJldmlld0xpbmtzKCk7XG5cdFx0XHRlbmFibGVQcmV2aWV3TGlua3MoICdbZGF0YS1wcmV2aWV3LWxpbmtdJyApO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBleGlzdGluZyBhdXRvLXNsaWRlIGNvbnRyb2xzXG5cdFx0aWYoIGF1dG9TbGlkZVBsYXllciApIHtcblx0XHRcdGF1dG9TbGlkZVBsYXllci5kZXN0cm95KCk7XG5cdFx0XHRhdXRvU2xpZGVQbGF5ZXIgPSBudWxsO1xuXHRcdH1cblxuXHRcdC8vIEdlbmVyYXRlIGF1dG8tc2xpZGUgY29udHJvbHMgaWYgbmVlZGVkXG5cdFx0aWYoIG51bWJlck9mU2xpZGVzID4gMSAmJiBjb25maWcuYXV0b1NsaWRlICYmIGNvbmZpZy5hdXRvU2xpZGVTdG9wcGFibGUgJiYgZmVhdHVyZXMuY2FudmFzICYmIGZlYXR1cmVzLnJlcXVlc3RBbmltYXRpb25GcmFtZSApIHtcblx0XHRcdGF1dG9TbGlkZVBsYXllciA9IG5ldyBQbGF5YmFjayggZG9tLndyYXBwZXIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gTWF0aC5taW4oIE1hdGgubWF4KCAoIERhdGUubm93KCkgLSBhdXRvU2xpZGVTdGFydFRpbWUgKSAvIGF1dG9TbGlkZSwgMCApLCAxICk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdGF1dG9TbGlkZVBsYXllci5vbiggJ2NsaWNrJywgb25BdXRvU2xpZGVQbGF5ZXJDbGljayApO1xuXHRcdFx0YXV0b1NsaWRlUGF1c2VkID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gV2hlbiBmcmFnbWVudHMgYXJlIHR1cm5lZCBvZmYgdGhleSBzaG91bGQgYmUgdmlzaWJsZVxuXHRcdGlmKCBjb25maWcuZnJhZ21lbnRzID09PSBmYWxzZSApIHtcblx0XHRcdHRvQXJyYXkoIGRvbS5zbGlkZXMucXVlcnlTZWxlY3RvckFsbCggJy5mcmFnbWVudCcgKSApLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuXHRcdFx0XHRlbGVtZW50LmNsYXNzTGlzdC5hZGQoICd2aXNpYmxlJyApO1xuXHRcdFx0XHRlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoICdjdXJyZW50LWZyYWdtZW50JyApO1xuXHRcdFx0fSApO1xuXHRcdH1cblxuXHRcdHN5bmMoKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIEJpbmRzIGFsbCBldmVudCBsaXN0ZW5lcnMuXG5cdCAqL1xuXHRmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVycygpIHtcblxuXHRcdGV2ZW50c0FyZUJvdW5kID0gdHJ1ZTtcblxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnaGFzaGNoYW5nZScsIG9uV2luZG93SGFzaENoYW5nZSwgZmFsc2UgKTtcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3Jlc2l6ZScsIG9uV2luZG93UmVzaXplLCBmYWxzZSApO1xuXG5cdFx0aWYoIGNvbmZpZy50b3VjaCApIHtcblx0XHRcdGRvbS53cmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCBmYWxzZSApO1xuXHRcdFx0ZG9tLndyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCBmYWxzZSApO1xuXHRcdFx0ZG9tLndyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCwgZmFsc2UgKTtcblxuXHRcdFx0Ly8gU3VwcG9ydCBwb2ludGVyLXN0eWxlIHRvdWNoIGludGVyYWN0aW9uIGFzIHdlbGxcblx0XHRcdGlmKCB3aW5kb3cubmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkICkge1xuXHRcdFx0XHQvLyBJRSAxMSB1c2VzIHVuLXByZWZpeGVkIHZlcnNpb24gb2YgcG9pbnRlciBldmVudHNcblx0XHRcdFx0ZG9tLndyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgb25Qb2ludGVyRG93biwgZmFsc2UgKTtcblx0XHRcdFx0ZG9tLndyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgb25Qb2ludGVyTW92ZSwgZmFsc2UgKTtcblx0XHRcdFx0ZG9tLndyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsIG9uUG9pbnRlclVwLCBmYWxzZSApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiggd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkICkge1xuXHRcdFx0XHQvLyBJRSAxMCB1c2VzIHByZWZpeGVkIHZlcnNpb24gb2YgcG9pbnRlciBldmVudHNcblx0XHRcdFx0ZG9tLndyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lciggJ01TUG9pbnRlckRvd24nLCBvblBvaW50ZXJEb3duLCBmYWxzZSApO1xuXHRcdFx0XHRkb20ud3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCAnTVNQb2ludGVyTW92ZScsIG9uUG9pbnRlck1vdmUsIGZhbHNlICk7XG5cdFx0XHRcdGRvbS53cmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoICdNU1BvaW50ZXJVcCcsIG9uUG9pbnRlclVwLCBmYWxzZSApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKCBjb25maWcua2V5Ym9hcmQgKSB7XG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIG9uRG9jdW1lbnRLZXlEb3duLCBmYWxzZSApO1xuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleXByZXNzJywgb25Eb2N1bWVudEtleVByZXNzLCBmYWxzZSApO1xuXHRcdH1cblxuXHRcdGlmKCBjb25maWcucHJvZ3Jlc3MgJiYgZG9tLnByb2dyZXNzICkge1xuXHRcdFx0ZG9tLnByb2dyZXNzLmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIG9uUHJvZ3Jlc3NDbGlja2VkLCBmYWxzZSApO1xuXHRcdH1cblxuXHRcdGlmKCBjb25maWcuZm9jdXNCb2R5T25QYWdlVmlzaWJpbGl0eUNoYW5nZSApIHtcblx0XHRcdHZhciB2aXNpYmlsaXR5Q2hhbmdlO1xuXG5cdFx0XHRpZiggJ2hpZGRlbicgaW4gZG9jdW1lbnQgKSB7XG5cdFx0XHRcdHZpc2liaWxpdHlDaGFuZ2UgPSAndmlzaWJpbGl0eWNoYW5nZSc7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKCAnbXNIaWRkZW4nIGluIGRvY3VtZW50ICkge1xuXHRcdFx0XHR2aXNpYmlsaXR5Q2hhbmdlID0gJ21zdmlzaWJpbGl0eWNoYW5nZSc7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKCAnd2Via2l0SGlkZGVuJyBpbiBkb2N1bWVudCApIHtcblx0XHRcdFx0dmlzaWJpbGl0eUNoYW5nZSA9ICd3ZWJraXR2aXNpYmlsaXR5Y2hhbmdlJztcblx0XHRcdH1cblxuXHRcdFx0aWYoIHZpc2liaWxpdHlDaGFuZ2UgKSB7XG5cdFx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIHZpc2liaWxpdHlDaGFuZ2UsIG9uUGFnZVZpc2liaWxpdHlDaGFuZ2UsIGZhbHNlICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gTGlzdGVuIHRvIGJvdGggdG91Y2ggYW5kIGNsaWNrIGV2ZW50cywgaW4gY2FzZSB0aGUgZGV2aWNlXG5cdFx0Ly8gc3VwcG9ydHMgYm90aFxuXHRcdHZhciBwb2ludGVyRXZlbnRzID0gWyAndG91Y2hzdGFydCcsICdjbGljaycgXTtcblxuXHRcdC8vIE9ubHkgc3VwcG9ydCB0b3VjaCBmb3IgQW5kcm9pZCwgZml4ZXMgZG91YmxlIG5hdmlnYXRpb25zIGluXG5cdFx0Ly8gc3RvY2sgYnJvd3NlclxuXHRcdGlmKCBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKCAvYW5kcm9pZC9naSApICkge1xuXHRcdFx0cG9pbnRlckV2ZW50cyA9IFsgJ3RvdWNoc3RhcnQnIF07XG5cdFx0fVxuXG5cdFx0cG9pbnRlckV2ZW50cy5mb3JFYWNoKCBmdW5jdGlvbiggZXZlbnROYW1lICkge1xuXHRcdFx0ZG9tLmNvbnRyb2xzTGVmdC5mb3JFYWNoKCBmdW5jdGlvbiggZWwgKSB7IGVsLmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZSwgb25OYXZpZ2F0ZUxlZnRDbGlja2VkLCBmYWxzZSApOyB9ICk7XG5cdFx0XHRkb20uY29udHJvbHNSaWdodC5mb3JFYWNoKCBmdW5jdGlvbiggZWwgKSB7IGVsLmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZSwgb25OYXZpZ2F0ZVJpZ2h0Q2xpY2tlZCwgZmFsc2UgKTsgfSApO1xuXHRcdFx0ZG9tLmNvbnRyb2xzVXAuZm9yRWFjaCggZnVuY3Rpb24oIGVsICkgeyBlbC5hZGRFdmVudExpc3RlbmVyKCBldmVudE5hbWUsIG9uTmF2aWdhdGVVcENsaWNrZWQsIGZhbHNlICk7IH0gKTtcblx0XHRcdGRvbS5jb250cm9sc0Rvd24uZm9yRWFjaCggZnVuY3Rpb24oIGVsICkgeyBlbC5hZGRFdmVudExpc3RlbmVyKCBldmVudE5hbWUsIG9uTmF2aWdhdGVEb3duQ2xpY2tlZCwgZmFsc2UgKTsgfSApO1xuXHRcdFx0ZG9tLmNvbnRyb2xzUHJldi5mb3JFYWNoKCBmdW5jdGlvbiggZWwgKSB7IGVsLmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZSwgb25OYXZpZ2F0ZVByZXZDbGlja2VkLCBmYWxzZSApOyB9ICk7XG5cdFx0XHRkb20uY29udHJvbHNOZXh0LmZvckVhY2goIGZ1bmN0aW9uKCBlbCApIHsgZWwuYWRkRXZlbnRMaXN0ZW5lciggZXZlbnROYW1lLCBvbk5hdmlnYXRlTmV4dENsaWNrZWQsIGZhbHNlICk7IH0gKTtcblx0XHR9ICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBVbmJpbmRzIGFsbCBldmVudCBsaXN0ZW5lcnMuXG5cdCAqL1xuXHRmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVycygpIHtcblxuXHRcdGV2ZW50c0FyZUJvdW5kID0gZmFsc2U7XG5cblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIG9uRG9jdW1lbnRLZXlEb3duLCBmYWxzZSApO1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXlwcmVzcycsIG9uRG9jdW1lbnRLZXlQcmVzcywgZmFsc2UgKTtcblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2hhc2hjaGFuZ2UnLCBvbldpbmRvd0hhc2hDaGFuZ2UsIGZhbHNlICk7XG5cdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCBvbldpbmRvd1Jlc2l6ZSwgZmFsc2UgKTtcblxuXHRcdGRvbS53cmFwcGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCBmYWxzZSApO1xuXHRcdGRvbS53cmFwcGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSwgZmFsc2UgKTtcblx0XHRkb20ud3JhcHBlci5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSApO1xuXG5cdFx0Ly8gSUUxMVxuXHRcdGlmKCB3aW5kb3cubmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkICkge1xuXHRcdFx0ZG9tLndyYXBwZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgb25Qb2ludGVyRG93biwgZmFsc2UgKTtcblx0XHRcdGRvbS53cmFwcGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIG9uUG9pbnRlck1vdmUsIGZhbHNlICk7XG5cdFx0XHRkb20ud3JhcHBlci5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgb25Qb2ludGVyVXAsIGZhbHNlICk7XG5cdFx0fVxuXHRcdC8vIElFMTBcblx0XHRlbHNlIGlmKCB3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQgKSB7XG5cdFx0XHRkb20ud3JhcHBlci5yZW1vdmVFdmVudExpc3RlbmVyKCAnTVNQb2ludGVyRG93bicsIG9uUG9pbnRlckRvd24sIGZhbHNlICk7XG5cdFx0XHRkb20ud3JhcHBlci5yZW1vdmVFdmVudExpc3RlbmVyKCAnTVNQb2ludGVyTW92ZScsIG9uUG9pbnRlck1vdmUsIGZhbHNlICk7XG5cdFx0XHRkb20ud3JhcHBlci5yZW1vdmVFdmVudExpc3RlbmVyKCAnTVNQb2ludGVyVXAnLCBvblBvaW50ZXJVcCwgZmFsc2UgKTtcblx0XHR9XG5cblx0XHRpZiAoIGNvbmZpZy5wcm9ncmVzcyAmJiBkb20ucHJvZ3Jlc3MgKSB7XG5cdFx0XHRkb20ucHJvZ3Jlc3MucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb25Qcm9ncmVzc0NsaWNrZWQsIGZhbHNlICk7XG5cdFx0fVxuXG5cdFx0WyAndG91Y2hzdGFydCcsICdjbGljaycgXS5mb3JFYWNoKCBmdW5jdGlvbiggZXZlbnROYW1lICkge1xuXHRcdFx0ZG9tLmNvbnRyb2xzTGVmdC5mb3JFYWNoKCBmdW5jdGlvbiggZWwgKSB7IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZSwgb25OYXZpZ2F0ZUxlZnRDbGlja2VkLCBmYWxzZSApOyB9ICk7XG5cdFx0XHRkb20uY29udHJvbHNSaWdodC5mb3JFYWNoKCBmdW5jdGlvbiggZWwgKSB7IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZSwgb25OYXZpZ2F0ZVJpZ2h0Q2xpY2tlZCwgZmFsc2UgKTsgfSApO1xuXHRcdFx0ZG9tLmNvbnRyb2xzVXAuZm9yRWFjaCggZnVuY3Rpb24oIGVsICkgeyBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCBldmVudE5hbWUsIG9uTmF2aWdhdGVVcENsaWNrZWQsIGZhbHNlICk7IH0gKTtcblx0XHRcdGRvbS5jb250cm9sc0Rvd24uZm9yRWFjaCggZnVuY3Rpb24oIGVsICkgeyBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCBldmVudE5hbWUsIG9uTmF2aWdhdGVEb3duQ2xpY2tlZCwgZmFsc2UgKTsgfSApO1xuXHRcdFx0ZG9tLmNvbnRyb2xzUHJldi5mb3JFYWNoKCBmdW5jdGlvbiggZWwgKSB7IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZSwgb25OYXZpZ2F0ZVByZXZDbGlja2VkLCBmYWxzZSApOyB9ICk7XG5cdFx0XHRkb20uY29udHJvbHNOZXh0LmZvckVhY2goIGZ1bmN0aW9uKCBlbCApIHsgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lciggZXZlbnROYW1lLCBvbk5hdmlnYXRlTmV4dENsaWNrZWQsIGZhbHNlICk7IH0gKTtcblx0XHR9ICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBFeHRlbmQgb2JqZWN0IGEgd2l0aCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cblx0ICogSWYgdGhlcmUncyBhIGNvbmZsaWN0LCBvYmplY3QgYiB0YWtlcyBwcmVjZWRlbmNlLlxuXHQgKi9cblx0ZnVuY3Rpb24gZXh0ZW5kKCBhLCBiICkge1xuXG5cdFx0Zm9yKCB2YXIgaSBpbiBiICkge1xuXHRcdFx0YVsgaSBdID0gYlsgaSBdO1xuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIHRoZSB0YXJnZXQgb2JqZWN0IHRvIGFuIGFycmF5LlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9BcnJheSggbyApIHtcblxuXHRcdHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggbyApO1xuXG5cdH1cblxuXHQvKipcblx0ICogVXRpbGl0eSBmb3IgZGVzZXJpYWxpemluZyBhIHZhbHVlLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGVzZXJpYWxpemUoIHZhbHVlICkge1xuXG5cdFx0aWYoIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgKSB7XG5cdFx0XHRpZiggdmFsdWUgPT09ICdudWxsJyApIHJldHVybiBudWxsO1xuXHRcdFx0ZWxzZSBpZiggdmFsdWUgPT09ICd0cnVlJyApIHJldHVybiB0cnVlO1xuXHRcdFx0ZWxzZSBpZiggdmFsdWUgPT09ICdmYWxzZScgKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRlbHNlIGlmKCB2YWx1ZS5tYXRjaCggL15cXGQrJC8gKSApIHJldHVybiBwYXJzZUZsb2F0KCB2YWx1ZSApO1xuXHRcdH1cblxuXHRcdHJldHVybiB2YWx1ZTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIE1lYXN1cmVzIHRoZSBkaXN0YW5jZSBpbiBwaXhlbHMgYmV0d2VlbiBwb2ludCBhXG5cdCAqIGFuZCBwb2ludCBiLlxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gYSBwb2ludCB3aXRoIHgveSBwcm9wZXJ0aWVzXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBiIHBvaW50IHdpdGggeC95IHByb3BlcnRpZXNcblx0ICovXG5cdGZ1bmN0aW9uIGRpc3RhbmNlQmV0d2VlbiggYSwgYiApIHtcblxuXHRcdHZhciBkeCA9IGEueCAtIGIueCxcblx0XHRcdGR5ID0gYS55IC0gYi55O1xuXG5cdFx0cmV0dXJuIE1hdGguc3FydCggZHgqZHggKyBkeSpkeSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogQXBwbGllcyBhIENTUyB0cmFuc2Zvcm0gdG8gdGhlIHRhcmdldCBlbGVtZW50LlxuXHQgKi9cblx0ZnVuY3Rpb24gdHJhbnNmb3JtRWxlbWVudCggZWxlbWVudCwgdHJhbnNmb3JtICkge1xuXG5cdFx0ZWxlbWVudC5zdHlsZS5XZWJraXRUcmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG5cdFx0ZWxlbWVudC5zdHlsZS5Nb3pUcmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG5cdFx0ZWxlbWVudC5zdHlsZS5tc1RyYW5zZm9ybSA9IHRyYW5zZm9ybTtcblx0XHRlbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IHRyYW5zZm9ybTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGxpZXMgQ1NTIHRyYW5zZm9ybXMgdG8gdGhlIHNsaWRlcyBjb250YWluZXIuIFRoZSBjb250YWluZXJcblx0ICogaXMgdHJhbnNmb3JtZWQgZnJvbSB0d28gc2VwYXJhdGUgc291cmNlczogbGF5b3V0IGFuZCB0aGUgb3ZlcnZpZXdcblx0ICogbW9kZS5cblx0ICovXG5cdGZ1bmN0aW9uIHRyYW5zZm9ybVNsaWRlcyggdHJhbnNmb3JtcyApIHtcblxuXHRcdC8vIFBpY2sgdXAgbmV3IHRyYW5zZm9ybXMgZnJvbSBhcmd1bWVudHNcblx0XHRpZiggdHlwZW9mIHRyYW5zZm9ybXMubGF5b3V0ID09PSAnc3RyaW5nJyApIHNsaWRlc1RyYW5zZm9ybS5sYXlvdXQgPSB0cmFuc2Zvcm1zLmxheW91dDtcblx0XHRpZiggdHlwZW9mIHRyYW5zZm9ybXMub3ZlcnZpZXcgPT09ICdzdHJpbmcnICkgc2xpZGVzVHJhbnNmb3JtLm92ZXJ2aWV3ID0gdHJhbnNmb3Jtcy5vdmVydmlldztcblxuXHRcdC8vIEFwcGx5IHRoZSB0cmFuc2Zvcm1zIHRvIHRoZSBzbGlkZXMgY29udGFpbmVyXG5cdFx0aWYoIHNsaWRlc1RyYW5zZm9ybS5sYXlvdXQgKSB7XG5cdFx0XHR0cmFuc2Zvcm1FbGVtZW50KCBkb20uc2xpZGVzLCBzbGlkZXNUcmFuc2Zvcm0ubGF5b3V0ICsgJyAnICsgc2xpZGVzVHJhbnNmb3JtLm92ZXJ2aWV3ICk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dHJhbnNmb3JtRWxlbWVudCggZG9tLnNsaWRlcywgc2xpZGVzVHJhbnNmb3JtLm92ZXJ2aWV3ICk7XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogSW5qZWN0cyB0aGUgZ2l2ZW4gQ1NTIHN0eWxlcyBpbnRvIHRoZSBET00uXG5cdCAqL1xuXHRmdW5jdGlvbiBpbmplY3RTdHlsZVNoZWV0KCB2YWx1ZSApIHtcblxuXHRcdHZhciB0YWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3R5bGUnICk7XG5cdFx0dGFnLnR5cGUgPSAndGV4dC9jc3MnO1xuXHRcdGlmKCB0YWcuc3R5bGVTaGVldCApIHtcblx0XHRcdHRhZy5zdHlsZVNoZWV0LmNzc1RleHQgPSB2YWx1ZTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0YWcuYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCB2YWx1ZSApICk7XG5cdFx0fVxuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCAnaGVhZCcgKVswXS5hcHBlbmRDaGlsZCggdGFnICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyB2YXJpb3VzIGNvbG9yIGlucHV0IGZvcm1hdHMgdG8gYW4ge3I6MCxnOjAsYjowfSBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgY29sb3IsXG5cdCAqIHRoZSBmb2xsb3dpbmcgZm9ybWF0cyBhcmUgc3VwcG9ydGVkOlxuXHQgKiAtICMwMDBcblx0ICogLSAjMDAwMDAwXG5cdCAqIC0gcmdiKDAsMCwwKVxuXHQgKi9cblx0ZnVuY3Rpb24gY29sb3JUb1JnYiggY29sb3IgKSB7XG5cblx0XHR2YXIgaGV4MyA9IGNvbG9yLm1hdGNoKCAvXiMoWzAtOWEtZl17M30pJC9pICk7XG5cdFx0aWYoIGhleDMgJiYgaGV4M1sxXSApIHtcblx0XHRcdGhleDMgPSBoZXgzWzFdO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0cjogcGFyc2VJbnQoIGhleDMuY2hhckF0KCAwICksIDE2ICkgKiAweDExLFxuXHRcdFx0XHRnOiBwYXJzZUludCggaGV4My5jaGFyQXQoIDEgKSwgMTYgKSAqIDB4MTEsXG5cdFx0XHRcdGI6IHBhcnNlSW50KCBoZXgzLmNoYXJBdCggMiApLCAxNiApICogMHgxMVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHR2YXIgaGV4NiA9IGNvbG9yLm1hdGNoKCAvXiMoWzAtOWEtZl17Nn0pJC9pICk7XG5cdFx0aWYoIGhleDYgJiYgaGV4NlsxXSApIHtcblx0XHRcdGhleDYgPSBoZXg2WzFdO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0cjogcGFyc2VJbnQoIGhleDYuc3Vic3RyKCAwLCAyICksIDE2ICksXG5cdFx0XHRcdGc6IHBhcnNlSW50KCBoZXg2LnN1YnN0ciggMiwgMiApLCAxNiApLFxuXHRcdFx0XHRiOiBwYXJzZUludCggaGV4Ni5zdWJzdHIoIDQsIDIgKSwgMTYgKVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHR2YXIgcmdiID0gY29sb3IubWF0Y2goIC9ecmdiXFxzKlxcKFxccyooXFxkKylcXHMqLFxccyooXFxkKylcXHMqLFxccyooXFxkKylcXHMqXFwpJC9pICk7XG5cdFx0aWYoIHJnYiApIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHI6IHBhcnNlSW50KCByZ2JbMV0sIDEwICksXG5cdFx0XHRcdGc6IHBhcnNlSW50KCByZ2JbMl0sIDEwICksXG5cdFx0XHRcdGI6IHBhcnNlSW50KCByZ2JbM10sIDEwIClcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0dmFyIHJnYmEgPSBjb2xvci5tYXRjaCggL15yZ2JhXFxzKlxcKFxccyooXFxkKylcXHMqLFxccyooXFxkKylcXHMqLFxccyooXFxkKylcXHMqXFwsXFxzKihbXFxkXSt8W1xcZF0qLltcXGRdKylcXHMqXFwpJC9pICk7XG5cdFx0aWYoIHJnYmEgKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyOiBwYXJzZUludCggcmdiYVsxXSwgMTAgKSxcblx0XHRcdFx0ZzogcGFyc2VJbnQoIHJnYmFbMl0sIDEwICksXG5cdFx0XHRcdGI6IHBhcnNlSW50KCByZ2JhWzNdLCAxMCApLFxuXHRcdFx0XHRhOiBwYXJzZUZsb2F0KCByZ2JhWzRdIClcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxjdWxhdGVzIGJyaWdodG5lc3Mgb24gYSBzY2FsZSBvZiAwLTI1NS5cblx0ICpcblx0ICogQHBhcmFtIGNvbG9yIFNlZSBjb2xvclN0cmluZ1RvUmdiIGZvciBzdXBwb3J0ZWQgZm9ybWF0cy5cblx0ICovXG5cdGZ1bmN0aW9uIGNvbG9yQnJpZ2h0bmVzcyggY29sb3IgKSB7XG5cblx0XHRpZiggdHlwZW9mIGNvbG9yID09PSAnc3RyaW5nJyApIGNvbG9yID0gY29sb3JUb1JnYiggY29sb3IgKTtcblxuXHRcdGlmKCBjb2xvciApIHtcblx0XHRcdHJldHVybiAoIGNvbG9yLnIgKiAyOTkgKyBjb2xvci5nICogNTg3ICsgY29sb3IuYiAqIDExNCApIC8gMTAwMDtcblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgaGVpZ2h0IG9mIHRoZSBnaXZlbiBlbGVtZW50IGJ5IGxvb2tpbmdcblx0ICogYXQgdGhlIHBvc2l0aW9uIGFuZCBoZWlnaHQgb2YgaXRzIGltbWVkaWF0ZSBjaGlsZHJlbi5cblx0ICovXG5cdGZ1bmN0aW9uIGdldEFic29sdXRlSGVpZ2h0KCBlbGVtZW50ICkge1xuXG5cdFx0dmFyIGhlaWdodCA9IDA7XG5cblx0XHRpZiggZWxlbWVudCApIHtcblx0XHRcdHZhciBhYnNvbHV0ZUNoaWxkcmVuID0gMDtcblxuXHRcdFx0dG9BcnJheSggZWxlbWVudC5jaGlsZE5vZGVzICkuZm9yRWFjaCggZnVuY3Rpb24oIGNoaWxkICkge1xuXG5cdFx0XHRcdGlmKCB0eXBlb2YgY2hpbGQub2Zmc2V0VG9wID09PSAnbnVtYmVyJyAmJiBjaGlsZC5zdHlsZSApIHtcblx0XHRcdFx0XHQvLyBDb3VudCAjIG9mIGFicyBjaGlsZHJlblxuXHRcdFx0XHRcdGlmKCB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSggY2hpbGQgKS5wb3NpdGlvbiA9PT0gJ2Fic29sdXRlJyApIHtcblx0XHRcdFx0XHRcdGFic29sdXRlQ2hpbGRyZW4gKz0gMTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRoZWlnaHQgPSBNYXRoLm1heCggaGVpZ2h0LCBjaGlsZC5vZmZzZXRUb3AgKyBjaGlsZC5vZmZzZXRIZWlnaHQgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9ICk7XG5cblx0XHRcdC8vIElmIHRoZXJlIGFyZSBubyBhYnNvbHV0ZSBjaGlsZHJlbiwgdXNlIG9mZnNldEhlaWdodFxuXHRcdFx0aWYoIGFic29sdXRlQ2hpbGRyZW4gPT09IDAgKSB7XG5cdFx0XHRcdGhlaWdodCA9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGhlaWdodDtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHJlbWFpbmluZyBoZWlnaHQgd2l0aGluIHRoZSBwYXJlbnQgb2YgdGhlXG5cdCAqIHRhcmdldCBlbGVtZW50LlxuXHQgKlxuXHQgKiByZW1haW5pbmcgaGVpZ2h0ID0gWyBjb25maWd1cmVkIHBhcmVudCBoZWlnaHQgXSAtIFsgY3VycmVudCBwYXJlbnQgaGVpZ2h0IF1cblx0ICovXG5cdGZ1bmN0aW9uIGdldFJlbWFpbmluZ0hlaWdodCggZWxlbWVudCwgaGVpZ2h0ICkge1xuXG5cdFx0aGVpZ2h0ID0gaGVpZ2h0IHx8IDA7XG5cblx0XHRpZiggZWxlbWVudCApIHtcblx0XHRcdHZhciBuZXdIZWlnaHQsIG9sZEhlaWdodCA9IGVsZW1lbnQuc3R5bGUuaGVpZ2h0O1xuXG5cdFx0XHQvLyBDaGFuZ2UgdGhlIC5zdHJldGNoIGVsZW1lbnQgaGVpZ2h0IHRvIDAgaW4gb3JkZXIgZmluZCB0aGUgaGVpZ2h0IG9mIGFsbFxuXHRcdFx0Ly8gdGhlIG90aGVyIGVsZW1lbnRzXG5cdFx0XHRlbGVtZW50LnN0eWxlLmhlaWdodCA9ICcwcHgnO1xuXHRcdFx0bmV3SGVpZ2h0ID0gaGVpZ2h0IC0gZWxlbWVudC5wYXJlbnROb2RlLm9mZnNldEhlaWdodDtcblxuXHRcdFx0Ly8gUmVzdG9yZSB0aGUgb2xkIGhlaWdodCwganVzdCBpbiBjYXNlXG5cdFx0XHRlbGVtZW50LnN0eWxlLmhlaWdodCA9IG9sZEhlaWdodCArICdweCc7XG5cblx0XHRcdHJldHVybiBuZXdIZWlnaHQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGhlaWdodDtcblxuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGlzIGluc3RhbmNlIGlzIGJlaW5nIHVzZWQgdG8gcHJpbnQgYSBQREYuXG5cdCAqL1xuXHRmdW5jdGlvbiBpc1ByaW50aW5nUERGKCkge1xuXG5cdFx0cmV0dXJuICggL3ByaW50LXBkZi9naSApLnRlc3QoIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIEhpZGVzIHRoZSBhZGRyZXNzIGJhciBpZiB3ZSdyZSBvbiBhIG1vYmlsZSBkZXZpY2UuXG5cdCAqL1xuXHRmdW5jdGlvbiBoaWRlQWRkcmVzc0JhcigpIHtcblxuXHRcdGlmKCBjb25maWcuaGlkZUFkZHJlc3NCYXIgJiYgaXNNb2JpbGVEZXZpY2UgKSB7XG5cdFx0XHQvLyBFdmVudHMgdGhhdCBzaG91bGQgdHJpZ2dlciB0aGUgYWRkcmVzcyBiYXIgdG8gaGlkZVxuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgcmVtb3ZlQWRkcmVzc0JhciwgZmFsc2UgKTtcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnb3JpZW50YXRpb25jaGFuZ2UnLCByZW1vdmVBZGRyZXNzQmFyLCBmYWxzZSApO1xuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIENhdXNlcyB0aGUgYWRkcmVzcyBiYXIgdG8gaGlkZSBvbiBtb2JpbGUgZGV2aWNlcyxcblx0ICogbW9yZSB2ZXJ0aWNhbCBzcGFjZSBmdHcuXG5cdCAqL1xuXHRmdW5jdGlvbiByZW1vdmVBZGRyZXNzQmFyKCkge1xuXG5cdFx0c2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHR3aW5kb3cuc2Nyb2xsVG8oIDAsIDEgKTtcblx0XHR9LCAxMCApO1xuXG5cdH1cblxuXHQvKipcblx0ICogRGlzcGF0Y2hlcyBhbiBldmVudCBvZiB0aGUgc3BlY2lmaWVkIHR5cGUgZnJvbSB0aGVcblx0ICogcmV2ZWFsIERPTSBlbGVtZW50LlxuXHQgKi9cblx0ZnVuY3Rpb24gZGlzcGF0Y2hFdmVudCggdHlwZSwgYXJncyApIHtcblxuXHRcdHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCAnSFRNTEV2ZW50cycsIDEsIDIgKTtcblx0XHRldmVudC5pbml0RXZlbnQoIHR5cGUsIHRydWUsIHRydWUgKTtcblx0XHRleHRlbmQoIGV2ZW50LCBhcmdzICk7XG5cdFx0ZG9tLndyYXBwZXIuZGlzcGF0Y2hFdmVudCggZXZlbnQgKTtcblxuXHRcdC8vIElmIHdlJ3JlIGluIGFuIGlmcmFtZSwgcG9zdCBlYWNoIHJldmVhbC5qcyBldmVudCB0byB0aGVcblx0XHQvLyBwYXJlbnQgd2luZG93LiBVc2VkIGJ5IHRoZSBub3RlcyBwbHVnaW5cblx0XHRpZiggY29uZmlnLnBvc3RNZXNzYWdlRXZlbnRzICYmIHdpbmRvdy5wYXJlbnQgIT09IHdpbmRvdy5zZWxmICkge1xuXHRcdFx0d2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSggSlNPTi5zdHJpbmdpZnkoeyBuYW1lc3BhY2U6ICdyZXZlYWwnLCBldmVudE5hbWU6IHR5cGUsIHN0YXRlOiBnZXRTdGF0ZSgpIH0pLCAnKicgKTtcblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBXcmFwIGFsbCBsaW5rcyBpbiAzRCBnb29kbmVzcy5cblx0ICovXG5cdGZ1bmN0aW9uIGVuYWJsZVJvbGxpbmdMaW5rcygpIHtcblxuXHRcdGlmKCBmZWF0dXJlcy50cmFuc2Zvcm1zM2QgJiYgISggJ21zUGVyc3BlY3RpdmUnIGluIGRvY3VtZW50LmJvZHkuc3R5bGUgKSApIHtcblx0XHRcdHZhciBhbmNob3JzID0gZG9tLndyYXBwZXIucXVlcnlTZWxlY3RvckFsbCggU0xJREVTX1NFTEVDVE9SICsgJyBhJyApO1xuXG5cdFx0XHRmb3IoIHZhciBpID0gMCwgbGVuID0gYW5jaG9ycy5sZW5ndGg7IGkgPCBsZW47IGkrKyApIHtcblx0XHRcdFx0dmFyIGFuY2hvciA9IGFuY2hvcnNbaV07XG5cblx0XHRcdFx0aWYoIGFuY2hvci50ZXh0Q29udGVudCAmJiAhYW5jaG9yLnF1ZXJ5U2VsZWN0b3IoICcqJyApICYmICggIWFuY2hvci5jbGFzc05hbWUgfHwgIWFuY2hvci5jbGFzc0xpc3QuY29udGFpbnMoIGFuY2hvciwgJ3JvbGwnICkgKSApIHtcblx0XHRcdFx0XHR2YXIgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcblx0XHRcdFx0XHRzcGFuLnNldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScsIGFuY2hvci50ZXh0KTtcblx0XHRcdFx0XHRzcGFuLmlubmVySFRNTCA9IGFuY2hvci5pbm5lckhUTUw7XG5cblx0XHRcdFx0XHRhbmNob3IuY2xhc3NMaXN0LmFkZCggJ3JvbGwnICk7XG5cdFx0XHRcdFx0YW5jaG9yLmlubmVySFRNTCA9ICcnO1xuXHRcdFx0XHRcdGFuY2hvci5hcHBlbmRDaGlsZChzcGFuKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIFVud3JhcCBhbGwgM0QgbGlua3MuXG5cdCAqL1xuXHRmdW5jdGlvbiBkaXNhYmxlUm9sbGluZ0xpbmtzKCkge1xuXG5cdFx0dmFyIGFuY2hvcnMgPSBkb20ud3JhcHBlci5xdWVyeVNlbGVjdG9yQWxsKCBTTElERVNfU0VMRUNUT1IgKyAnIGEucm9sbCcgKTtcblxuXHRcdGZvciggdmFyIGkgPSAwLCBsZW4gPSBhbmNob3JzLmxlbmd0aDsgaSA8IGxlbjsgaSsrICkge1xuXHRcdFx0dmFyIGFuY2hvciA9IGFuY2hvcnNbaV07XG5cdFx0XHR2YXIgc3BhbiA9IGFuY2hvci5xdWVyeVNlbGVjdG9yKCAnc3BhbicgKTtcblxuXHRcdFx0aWYoIHNwYW4gKSB7XG5cdFx0XHRcdGFuY2hvci5jbGFzc0xpc3QucmVtb3ZlKCAncm9sbCcgKTtcblx0XHRcdFx0YW5jaG9yLmlubmVySFRNTCA9IHNwYW4uaW5uZXJIVE1MO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIEJpbmQgcHJldmlldyBmcmFtZSBsaW5rcy5cblx0ICovXG5cdGZ1bmN0aW9uIGVuYWJsZVByZXZpZXdMaW5rcyggc2VsZWN0b3IgKSB7XG5cblx0XHR2YXIgYW5jaG9ycyA9IHRvQXJyYXkoIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoIHNlbGVjdG9yID8gc2VsZWN0b3IgOiAnYScgKSApO1xuXG5cdFx0YW5jaG9ycy5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCApIHtcblx0XHRcdGlmKCAvXihodHRwfHd3dykvZ2kudGVzdCggZWxlbWVudC5nZXRBdHRyaWJ1dGUoICdocmVmJyApICkgKSB7XG5cdFx0XHRcdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb25QcmV2aWV3TGlua0NsaWNrZWQsIGZhbHNlICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogVW5iaW5kIHByZXZpZXcgZnJhbWUgbGlua3MuXG5cdCAqL1xuXHRmdW5jdGlvbiBkaXNhYmxlUHJldmlld0xpbmtzKCkge1xuXG5cdFx0dmFyIGFuY2hvcnMgPSB0b0FycmF5KCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCAnYScgKSApO1xuXG5cdFx0YW5jaG9ycy5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCApIHtcblx0XHRcdGlmKCAvXihodHRwfHd3dykvZ2kudGVzdCggZWxlbWVudC5nZXRBdHRyaWJ1dGUoICdocmVmJyApICkgKSB7XG5cdFx0XHRcdGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgb25QcmV2aWV3TGlua0NsaWNrZWQsIGZhbHNlICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogT3BlbnMgYSBwcmV2aWV3IHdpbmRvdyBmb3IgdGhlIHRhcmdldCBVUkwuXG5cdCAqL1xuXHRmdW5jdGlvbiBzaG93UHJldmlldyggdXJsICkge1xuXG5cdFx0Y2xvc2VPdmVybGF5KCk7XG5cblx0XHRkb20ub3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0ZG9tLm92ZXJsYXkuY2xhc3NMaXN0LmFkZCggJ292ZXJsYXknICk7XG5cdFx0ZG9tLm92ZXJsYXkuY2xhc3NMaXN0LmFkZCggJ292ZXJsYXktcHJldmlldycgKTtcblx0XHRkb20ud3JhcHBlci5hcHBlbmRDaGlsZCggZG9tLm92ZXJsYXkgKTtcblxuXHRcdGRvbS5vdmVybGF5LmlubmVySFRNTCA9IFtcblx0XHRcdCc8aGVhZGVyPicsXG5cdFx0XHRcdCc8YSBjbGFzcz1cImNsb3NlXCIgaHJlZj1cIiNcIj48c3BhbiBjbGFzcz1cImljb25cIj48L3NwYW4+PC9hPicsXG5cdFx0XHRcdCc8YSBjbGFzcz1cImV4dGVybmFsXCIgaHJlZj1cIicrIHVybCArJ1wiIHRhcmdldD1cIl9ibGFua1wiPjxzcGFuIGNsYXNzPVwiaWNvblwiPjwvc3Bhbj48L2E+Jyxcblx0XHRcdCc8L2hlYWRlcj4nLFxuXHRcdFx0JzxkaXYgY2xhc3M9XCJzcGlubmVyXCI+PC9kaXY+Jyxcblx0XHRcdCc8ZGl2IGNsYXNzPVwidmlld3BvcnRcIj4nLFxuXHRcdFx0XHQnPGlmcmFtZSBzcmM9XCInKyB1cmwgKydcIj48L2lmcmFtZT4nLFxuXHRcdFx0JzwvZGl2Pidcblx0XHRdLmpvaW4oJycpO1xuXG5cdFx0ZG9tLm92ZXJsYXkucXVlcnlTZWxlY3RvciggJ2lmcmFtZScgKS5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdGRvbS5vdmVybGF5LmNsYXNzTGlzdC5hZGQoICdsb2FkZWQnICk7XG5cdFx0fSwgZmFsc2UgKTtcblxuXHRcdGRvbS5vdmVybGF5LnF1ZXJ5U2VsZWN0b3IoICcuY2xvc2UnICkuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0Y2xvc2VPdmVybGF5KCk7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH0sIGZhbHNlICk7XG5cblx0XHRkb20ub3ZlcmxheS5xdWVyeVNlbGVjdG9yKCAnLmV4dGVybmFsJyApLmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdGNsb3NlT3ZlcmxheSgpO1xuXHRcdH0sIGZhbHNlICk7XG5cblx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdGRvbS5vdmVybGF5LmNsYXNzTGlzdC5hZGQoICd2aXNpYmxlJyApO1xuXHRcdH0sIDEgKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIE9wZW5zIGEgb3ZlcmxheSB3aW5kb3cgd2l0aCBoZWxwIG1hdGVyaWFsLlxuXHQgKi9cblx0ZnVuY3Rpb24gc2hvd0hlbHAoKSB7XG5cblx0XHRpZiggY29uZmlnLmhlbHAgKSB7XG5cblx0XHRcdGNsb3NlT3ZlcmxheSgpO1xuXG5cdFx0XHRkb20ub3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0XHRkb20ub3ZlcmxheS5jbGFzc0xpc3QuYWRkKCAnb3ZlcmxheScgKTtcblx0XHRcdGRvbS5vdmVybGF5LmNsYXNzTGlzdC5hZGQoICdvdmVybGF5LWhlbHAnICk7XG5cdFx0XHRkb20ud3JhcHBlci5hcHBlbmRDaGlsZCggZG9tLm92ZXJsYXkgKTtcblxuXHRcdFx0dmFyIGh0bWwgPSAnPHAgY2xhc3M9XCJ0aXRsZVwiPktleWJvYXJkIFNob3J0Y3V0czwvcD48YnIvPic7XG5cblx0XHRcdGh0bWwgKz0gJzx0YWJsZT48dGg+S0VZPC90aD48dGg+QUNUSU9OPC90aD4nO1xuXHRcdFx0Zm9yKCB2YXIga2V5IGluIGtleWJvYXJkU2hvcnRjdXRzICkge1xuXHRcdFx0XHRodG1sICs9ICc8dHI+PHRkPicgKyBrZXkgKyAnPC90ZD48dGQ+JyArIGtleWJvYXJkU2hvcnRjdXRzWyBrZXkgXSArICc8L3RkPjwvdHI+Jztcblx0XHRcdH1cblxuXHRcdFx0aHRtbCArPSAnPC90YWJsZT4nO1xuXG5cdFx0XHRkb20ub3ZlcmxheS5pbm5lckhUTUwgPSBbXG5cdFx0XHRcdCc8aGVhZGVyPicsXG5cdFx0XHRcdFx0JzxhIGNsYXNzPVwiY2xvc2VcIiBocmVmPVwiI1wiPjxzcGFuIGNsYXNzPVwiaWNvblwiPjwvc3Bhbj48L2E+Jyxcblx0XHRcdFx0JzwvaGVhZGVyPicsXG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwidmlld3BvcnRcIj4nLFxuXHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwidmlld3BvcnQtaW5uZXJcIj4nKyBodG1sICsnPC9kaXY+Jyxcblx0XHRcdFx0JzwvZGl2Pidcblx0XHRcdF0uam9pbignJyk7XG5cblx0XHRcdGRvbS5vdmVybGF5LnF1ZXJ5U2VsZWN0b3IoICcuY2xvc2UnICkuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRjbG9zZU92ZXJsYXkoKTtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH0sIGZhbHNlICk7XG5cblx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRkb20ub3ZlcmxheS5jbGFzc0xpc3QuYWRkKCAndmlzaWJsZScgKTtcblx0XHRcdH0sIDEgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIENsb3NlcyBhbnkgY3VycmVudGx5IG9wZW4gb3ZlcmxheS5cblx0ICovXG5cdGZ1bmN0aW9uIGNsb3NlT3ZlcmxheSgpIHtcblxuXHRcdGlmKCBkb20ub3ZlcmxheSApIHtcblx0XHRcdGRvbS5vdmVybGF5LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoIGRvbS5vdmVybGF5ICk7XG5cdFx0XHRkb20ub3ZlcmxheSA9IG51bGw7XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogQXBwbGllcyBKYXZhU2NyaXB0LWNvbnRyb2xsZWQgbGF5b3V0IHJ1bGVzIHRvIHRoZVxuXHQgKiBwcmVzZW50YXRpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBsYXlvdXQoKSB7XG5cblx0XHRpZiggZG9tLndyYXBwZXIgJiYgIWlzUHJpbnRpbmdQREYoKSApIHtcblxuXHRcdFx0dmFyIHNpemUgPSBnZXRDb21wdXRlZFNsaWRlU2l6ZSgpO1xuXG5cdFx0XHR2YXIgc2xpZGVQYWRkaW5nID0gMjA7IC8vIFRPRE8gRGlnIHRoaXMgb3V0IG9mIERPTVxuXG5cdFx0XHQvLyBMYXlvdXQgdGhlIGNvbnRlbnRzIG9mIHRoZSBzbGlkZXNcblx0XHRcdGxheW91dFNsaWRlQ29udGVudHMoIGNvbmZpZy53aWR0aCwgY29uZmlnLmhlaWdodCwgc2xpZGVQYWRkaW5nICk7XG5cblx0XHRcdGRvbS5zbGlkZXMuc3R5bGUud2lkdGggPSBzaXplLndpZHRoICsgJ3B4Jztcblx0XHRcdGRvbS5zbGlkZXMuc3R5bGUuaGVpZ2h0ID0gc2l6ZS5oZWlnaHQgKyAncHgnO1xuXG5cdFx0XHQvLyBEZXRlcm1pbmUgc2NhbGUgb2YgY29udGVudCB0byBmaXQgd2l0aGluIGF2YWlsYWJsZSBzcGFjZVxuXHRcdFx0c2NhbGUgPSBNYXRoLm1pbiggc2l6ZS5wcmVzZW50YXRpb25XaWR0aCAvIHNpemUud2lkdGgsIHNpemUucHJlc2VudGF0aW9uSGVpZ2h0IC8gc2l6ZS5oZWlnaHQgKTtcblxuXHRcdFx0Ly8gUmVzcGVjdCBtYXgvbWluIHNjYWxlIHNldHRpbmdzXG5cdFx0XHRzY2FsZSA9IE1hdGgubWF4KCBzY2FsZSwgY29uZmlnLm1pblNjYWxlICk7XG5cdFx0XHRzY2FsZSA9IE1hdGgubWluKCBzY2FsZSwgY29uZmlnLm1heFNjYWxlICk7XG5cblx0XHRcdC8vIERvbid0IGFwcGx5IGFueSBzY2FsaW5nIHN0eWxlcyBpZiBzY2FsZSBpcyAxXG5cdFx0XHRpZiggc2NhbGUgPT09IDEgKSB7XG5cdFx0XHRcdGRvbS5zbGlkZXMuc3R5bGUuem9vbSA9ICcnO1xuXHRcdFx0XHRkb20uc2xpZGVzLnN0eWxlLmxlZnQgPSAnJztcblx0XHRcdFx0ZG9tLnNsaWRlcy5zdHlsZS50b3AgPSAnJztcblx0XHRcdFx0ZG9tLnNsaWRlcy5zdHlsZS5ib3R0b20gPSAnJztcblx0XHRcdFx0ZG9tLnNsaWRlcy5zdHlsZS5yaWdodCA9ICcnO1xuXHRcdFx0XHR0cmFuc2Zvcm1TbGlkZXMoIHsgbGF5b3V0OiAnJyB9ICk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Ly8gUHJlZmVyIHpvb21pbmcgaW4gZGVza3RvcCBDaHJvbWUgc28gdGhhdCBjb250ZW50IHJlbWFpbnMgY3Jpc3Bcblx0XHRcdFx0aWYoICFpc01vYmlsZURldmljZSAmJiAvY2hyb21lL2kudGVzdCggbmF2aWdhdG9yLnVzZXJBZ2VudCApICYmIHR5cGVvZiBkb20uc2xpZGVzLnN0eWxlLnpvb20gIT09ICd1bmRlZmluZWQnICkge1xuXHRcdFx0XHRcdGRvbS5zbGlkZXMuc3R5bGUuem9vbSA9IHNjYWxlO1xuXHRcdFx0XHRcdHRyYW5zZm9ybVNsaWRlcyggeyBsYXlvdXQ6ICcnIH0gKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBBcHBseSBzY2FsZSB0cmFuc2Zvcm0gYXMgYSBmYWxsYmFja1xuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRkb20uc2xpZGVzLnN0eWxlLmxlZnQgPSAnNTAlJztcblx0XHRcdFx0XHRkb20uc2xpZGVzLnN0eWxlLnRvcCA9ICc1MCUnO1xuXHRcdFx0XHRcdGRvbS5zbGlkZXMuc3R5bGUuYm90dG9tID0gJ2F1dG8nO1xuXHRcdFx0XHRcdGRvbS5zbGlkZXMuc3R5bGUucmlnaHQgPSAnYXV0byc7XG5cdFx0XHRcdFx0dHJhbnNmb3JtU2xpZGVzKCB7IGxheW91dDogJ3RyYW5zbGF0ZSgtNTAlLCAtNTAlKSBzY2FsZSgnKyBzY2FsZSArJyknIH0gKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBTZWxlY3QgYWxsIHNsaWRlcywgdmVydGljYWwgYW5kIGhvcml6b250YWxcblx0XHRcdHZhciBzbGlkZXMgPSB0b0FycmF5KCBkb20ud3JhcHBlci5xdWVyeVNlbGVjdG9yQWxsKCBTTElERVNfU0VMRUNUT1IgKSApO1xuXG5cdFx0XHRmb3IoIHZhciBpID0gMCwgbGVuID0gc2xpZGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrICkge1xuXHRcdFx0XHR2YXIgc2xpZGUgPSBzbGlkZXNbIGkgXTtcblxuXHRcdFx0XHQvLyBEb24ndCBib3RoZXIgdXBkYXRpbmcgaW52aXNpYmxlIHNsaWRlc1xuXHRcdFx0XHRpZiggc2xpZGUuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnICkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoIGNvbmZpZy5jZW50ZXIgfHwgc2xpZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCAnY2VudGVyJyApICkge1xuXHRcdFx0XHRcdC8vIFZlcnRpY2FsIHN0YWNrcyBhcmUgbm90IGNlbnRyZWQgc2luY2UgdGhlaXIgc2VjdGlvblxuXHRcdFx0XHRcdC8vIGNoaWxkcmVuIHdpbGwgYmVcblx0XHRcdFx0XHRpZiggc2xpZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCAnc3RhY2snICkgKSB7XG5cdFx0XHRcdFx0XHRzbGlkZS5zdHlsZS50b3AgPSAwO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdHNsaWRlLnN0eWxlLnRvcCA9IE1hdGgubWF4KCAoICggc2l6ZS5oZWlnaHQgLSBnZXRBYnNvbHV0ZUhlaWdodCggc2xpZGUgKSApIC8gMiApIC0gc2xpZGVQYWRkaW5nLCAwICkgKyAncHgnO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRzbGlkZS5zdHlsZS50b3AgPSAnJztcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdHVwZGF0ZVByb2dyZXNzKCk7XG5cdFx0XHR1cGRhdGVQYXJhbGxheCgpO1xuXG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogQXBwbGllcyBsYXlvdXQgbG9naWMgdG8gdGhlIGNvbnRlbnRzIG9mIGFsbCBzbGlkZXMgaW5cblx0ICogdGhlIHByZXNlbnRhdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIGxheW91dFNsaWRlQ29udGVudHMoIHdpZHRoLCBoZWlnaHQsIHBhZGRpbmcgKSB7XG5cblx0XHQvLyBIYW5kbGUgc2l6aW5nIG9mIGVsZW1lbnRzIHdpdGggdGhlICdzdHJldGNoJyBjbGFzc1xuXHRcdHRvQXJyYXkoIGRvbS5zbGlkZXMucXVlcnlTZWxlY3RvckFsbCggJ3NlY3Rpb24gPiAuc3RyZXRjaCcgKSApLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuXG5cdFx0XHQvLyBEZXRlcm1pbmUgaG93IG11Y2ggdmVydGljYWwgc3BhY2Ugd2UgY2FuIHVzZVxuXHRcdFx0dmFyIHJlbWFpbmluZ0hlaWdodCA9IGdldFJlbWFpbmluZ0hlaWdodCggZWxlbWVudCwgaGVpZ2h0ICk7XG5cblx0XHRcdC8vIENvbnNpZGVyIHRoZSBhc3BlY3QgcmF0aW8gb2YgbWVkaWEgZWxlbWVudHNcblx0XHRcdGlmKCAvKGltZ3x2aWRlbykvZ2kudGVzdCggZWxlbWVudC5ub2RlTmFtZSApICkge1xuXHRcdFx0XHR2YXIgbncgPSBlbGVtZW50Lm5hdHVyYWxXaWR0aCB8fCBlbGVtZW50LnZpZGVvV2lkdGgsXG5cdFx0XHRcdFx0bmggPSBlbGVtZW50Lm5hdHVyYWxIZWlnaHQgfHwgZWxlbWVudC52aWRlb0hlaWdodDtcblxuXHRcdFx0XHR2YXIgZXMgPSBNYXRoLm1pbiggd2lkdGggLyBudywgcmVtYWluaW5nSGVpZ2h0IC8gbmggKTtcblxuXHRcdFx0XHRlbGVtZW50LnN0eWxlLndpZHRoID0gKCBudyAqIGVzICkgKyAncHgnO1xuXHRcdFx0XHRlbGVtZW50LnN0eWxlLmhlaWdodCA9ICggbmggKiBlcyApICsgJ3B4JztcblxuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGVsZW1lbnQuc3R5bGUud2lkdGggPSB3aWR0aCArICdweCc7XG5cdFx0XHRcdGVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gcmVtYWluaW5nSGVpZ2h0ICsgJ3B4Jztcblx0XHRcdH1cblxuXHRcdH0gKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGNvbXB1dGVkIHBpeGVsIHNpemUgb2Ygb3VyIHNsaWRlcy4gVGhlc2Vcblx0ICogdmFsdWVzIGFyZSBiYXNlZCBvbiB0aGUgd2lkdGggYW5kIGhlaWdodCBjb25maWd1cmF0aW9uXG5cdCAqIG9wdGlvbnMuXG5cdCAqL1xuXHRmdW5jdGlvbiBnZXRDb21wdXRlZFNsaWRlU2l6ZSggcHJlc2VudGF0aW9uV2lkdGgsIHByZXNlbnRhdGlvbkhlaWdodCApIHtcblxuXHRcdHZhciBzaXplID0ge1xuXHRcdFx0Ly8gU2xpZGUgc2l6ZVxuXHRcdFx0d2lkdGg6IGNvbmZpZy53aWR0aCxcblx0XHRcdGhlaWdodDogY29uZmlnLmhlaWdodCxcblxuXHRcdFx0Ly8gUHJlc2VudGF0aW9uIHNpemVcblx0XHRcdHByZXNlbnRhdGlvbldpZHRoOiBwcmVzZW50YXRpb25XaWR0aCB8fCBkb20ud3JhcHBlci5vZmZzZXRXaWR0aCxcblx0XHRcdHByZXNlbnRhdGlvbkhlaWdodDogcHJlc2VudGF0aW9uSGVpZ2h0IHx8IGRvbS53cmFwcGVyLm9mZnNldEhlaWdodFxuXHRcdH07XG5cblx0XHQvLyBSZWR1Y2UgYXZhaWxhYmxlIHNwYWNlIGJ5IG1hcmdpblxuXHRcdHNpemUucHJlc2VudGF0aW9uV2lkdGggLT0gKCBzaXplLnByZXNlbnRhdGlvbldpZHRoICogY29uZmlnLm1hcmdpbiApO1xuXHRcdHNpemUucHJlc2VudGF0aW9uSGVpZ2h0IC09ICggc2l6ZS5wcmVzZW50YXRpb25IZWlnaHQgKiBjb25maWcubWFyZ2luICk7XG5cblx0XHQvLyBTbGlkZSB3aWR0aCBtYXkgYmUgYSBwZXJjZW50YWdlIG9mIGF2YWlsYWJsZSB3aWR0aFxuXHRcdGlmKCB0eXBlb2Ygc2l6ZS53aWR0aCA9PT0gJ3N0cmluZycgJiYgLyUkLy50ZXN0KCBzaXplLndpZHRoICkgKSB7XG5cdFx0XHRzaXplLndpZHRoID0gcGFyc2VJbnQoIHNpemUud2lkdGgsIDEwICkgLyAxMDAgKiBzaXplLnByZXNlbnRhdGlvbldpZHRoO1xuXHRcdH1cblxuXHRcdC8vIFNsaWRlIGhlaWdodCBtYXkgYmUgYSBwZXJjZW50YWdlIG9mIGF2YWlsYWJsZSBoZWlnaHRcblx0XHRpZiggdHlwZW9mIHNpemUuaGVpZ2h0ID09PSAnc3RyaW5nJyAmJiAvJSQvLnRlc3QoIHNpemUuaGVpZ2h0ICkgKSB7XG5cdFx0XHRzaXplLmhlaWdodCA9IHBhcnNlSW50KCBzaXplLmhlaWdodCwgMTAgKSAvIDEwMCAqIHNpemUucHJlc2VudGF0aW9uSGVpZ2h0O1xuXHRcdH1cblxuXHRcdHJldHVybiBzaXplO1xuXG5cdH1cblxuXHQvKipcblx0ICogU3RvcmVzIHRoZSB2ZXJ0aWNhbCBpbmRleCBvZiBhIHN0YWNrIHNvIHRoYXQgdGhlIHNhbWVcblx0ICogdmVydGljYWwgc2xpZGUgY2FuIGJlIHNlbGVjdGVkIHdoZW4gbmF2aWdhdGluZyB0byBhbmRcblx0ICogZnJvbSB0aGUgc3RhY2suXG5cdCAqXG5cdCAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHN0YWNrIFRoZSB2ZXJ0aWNhbCBzdGFjayBlbGVtZW50XG5cdCAqIEBwYXJhbSB7aW50fSB2IEluZGV4IHRvIG1lbW9yaXplXG5cdCAqL1xuXHRmdW5jdGlvbiBzZXRQcmV2aW91c1ZlcnRpY2FsSW5kZXgoIHN0YWNrLCB2ICkge1xuXG5cdFx0aWYoIHR5cGVvZiBzdGFjayA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHN0YWNrLnNldEF0dHJpYnV0ZSA9PT0gJ2Z1bmN0aW9uJyApIHtcblx0XHRcdHN0YWNrLnNldEF0dHJpYnV0ZSggJ2RhdGEtcHJldmlvdXMtaW5kZXh2JywgdiB8fCAwICk7XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSB2ZXJ0aWNhbCBpbmRleCB3aGljaCB3YXMgc3RvcmVkIHVzaW5nXG5cdCAqICNzZXRQcmV2aW91c1ZlcnRpY2FsSW5kZXgoKSBvciAwIGlmIG5vIHByZXZpb3VzIGluZGV4XG5cdCAqIGV4aXN0cy5cblx0ICpcblx0ICogQHBhcmFtIHtIVE1MRWxlbWVudH0gc3RhY2sgVGhlIHZlcnRpY2FsIHN0YWNrIGVsZW1lbnRcblx0ICovXG5cdGZ1bmN0aW9uIGdldFByZXZpb3VzVmVydGljYWxJbmRleCggc3RhY2sgKSB7XG5cblx0XHRpZiggdHlwZW9mIHN0YWNrID09PSAnb2JqZWN0JyAmJiB0eXBlb2Ygc3RhY2suc2V0QXR0cmlidXRlID09PSAnZnVuY3Rpb24nICYmIHN0YWNrLmNsYXNzTGlzdC5jb250YWlucyggJ3N0YWNrJyApICkge1xuXHRcdFx0Ly8gUHJlZmVyIG1hbnVhbGx5IGRlZmluZWQgc3RhcnQtaW5kZXh2XG5cdFx0XHR2YXIgYXR0cmlidXRlTmFtZSA9IHN0YWNrLmhhc0F0dHJpYnV0ZSggJ2RhdGEtc3RhcnQtaW5kZXh2JyApID8gJ2RhdGEtc3RhcnQtaW5kZXh2JyA6ICdkYXRhLXByZXZpb3VzLWluZGV4dic7XG5cblx0XHRcdHJldHVybiBwYXJzZUludCggc3RhY2suZ2V0QXR0cmlidXRlKCBhdHRyaWJ1dGVOYW1lICkgfHwgMCwgMTAgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gMDtcblxuXHR9XG5cblx0LyoqXG5cdCAqIERpc3BsYXlzIHRoZSBvdmVydmlldyBvZiBzbGlkZXMgKHF1aWNrIG5hdikgYnkgc2NhbGluZ1xuXHQgKiBkb3duIGFuZCBhcnJhbmdpbmcgYWxsIHNsaWRlIGVsZW1lbnRzLlxuXHQgKi9cblx0ZnVuY3Rpb24gYWN0aXZhdGVPdmVydmlldygpIHtcblxuXHRcdC8vIE9ubHkgcHJvY2VlZCBpZiBlbmFibGVkIGluIGNvbmZpZ1xuXHRcdGlmKCBjb25maWcub3ZlcnZpZXcgJiYgIWlzT3ZlcnZpZXcoKSApIHtcblxuXHRcdFx0b3ZlcnZpZXcgPSB0cnVlO1xuXG5cdFx0XHRkb20ud3JhcHBlci5jbGFzc0xpc3QuYWRkKCAnb3ZlcnZpZXcnICk7XG5cdFx0XHRkb20ud3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKCAnb3ZlcnZpZXctZGVhY3RpdmF0aW5nJyApO1xuXG5cdFx0XHRpZiggZmVhdHVyZXMub3ZlcnZpZXdUcmFuc2l0aW9ucyApIHtcblx0XHRcdFx0c2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZG9tLndyYXBwZXIuY2xhc3NMaXN0LmFkZCggJ292ZXJ2aWV3LWFuaW1hdGVkJyApO1xuXHRcdFx0XHR9LCAxICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIERvbid0IGF1dG8tc2xpZGUgd2hpbGUgaW4gb3ZlcnZpZXcgbW9kZVxuXHRcdFx0Y2FuY2VsQXV0b1NsaWRlKCk7XG5cblx0XHRcdC8vIE1vdmUgdGhlIGJhY2tncm91bmRzIGVsZW1lbnQgaW50byB0aGUgc2xpZGUgY29udGFpbmVyIHRvXG5cdFx0XHQvLyB0aGF0IHRoZSBzYW1lIHNjYWxpbmcgaXMgYXBwbGllZFxuXHRcdFx0ZG9tLnNsaWRlcy5hcHBlbmRDaGlsZCggZG9tLmJhY2tncm91bmQgKTtcblxuXHRcdFx0Ly8gQ2xpY2tpbmcgb24gYW4gb3ZlcnZpZXcgc2xpZGUgbmF2aWdhdGVzIHRvIGl0XG5cdFx0XHR0b0FycmF5KCBkb20ud3JhcHBlci5xdWVyeVNlbGVjdG9yQWxsKCBTTElERVNfU0VMRUNUT1IgKSApLmZvckVhY2goIGZ1bmN0aW9uKCBzbGlkZSApIHtcblx0XHRcdFx0aWYoICFzbGlkZS5jbGFzc0xpc3QuY29udGFpbnMoICdzdGFjaycgKSApIHtcblx0XHRcdFx0XHRzbGlkZS5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCBvbk92ZXJ2aWV3U2xpZGVDbGlja2VkLCB0cnVlICk7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblxuXHRcdFx0dXBkYXRlU2xpZGVzVmlzaWJpbGl0eSgpO1xuXHRcdFx0bGF5b3V0T3ZlcnZpZXcoKTtcblx0XHRcdHVwZGF0ZU92ZXJ2aWV3KCk7XG5cblx0XHRcdGxheW91dCgpO1xuXG5cdFx0XHQvLyBOb3RpZnkgb2JzZXJ2ZXJzIG9mIHRoZSBvdmVydmlldyBzaG93aW5nXG5cdFx0XHRkaXNwYXRjaEV2ZW50KCAnb3ZlcnZpZXdzaG93bicsIHtcblx0XHRcdFx0J2luZGV4aCc6IGluZGV4aCxcblx0XHRcdFx0J2luZGV4dic6IGluZGV4dixcblx0XHRcdFx0J2N1cnJlbnRTbGlkZSc6IGN1cnJlbnRTbGlkZVxuXHRcdFx0fSApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogVXNlcyBDU1MgdHJhbnNmb3JtcyB0byBwb3NpdGlvbiBhbGwgc2xpZGVzIGluIGEgZ3JpZCBmb3Jcblx0ICogZGlzcGxheSBpbnNpZGUgb2YgdGhlIG92ZXJ2aWV3IG1vZGUuXG5cdCAqL1xuXHRmdW5jdGlvbiBsYXlvdXRPdmVydmlldygpIHtcblxuXHRcdHZhciBtYXJnaW4gPSA3MDtcblx0XHR2YXIgc2xpZGVXaWR0aCA9IGNvbmZpZy53aWR0aCArIG1hcmdpbixcblx0XHRcdHNsaWRlSGVpZ2h0ID0gY29uZmlnLmhlaWdodCArIG1hcmdpbjtcblxuXHRcdC8vIFJldmVyc2UgaW4gUlRMIG1vZGVcblx0XHRpZiggY29uZmlnLnJ0bCApIHtcblx0XHRcdHNsaWRlV2lkdGggPSAtc2xpZGVXaWR0aDtcblx0XHR9XG5cblx0XHQvLyBMYXlvdXQgc2xpZGVzXG5cdFx0dG9BcnJheSggZG9tLndyYXBwZXIucXVlcnlTZWxlY3RvckFsbCggSE9SSVpPTlRBTF9TTElERVNfU0VMRUNUT1IgKSApLmZvckVhY2goIGZ1bmN0aW9uKCBoc2xpZGUsIGggKSB7XG5cdFx0XHRoc2xpZGUuc2V0QXR0cmlidXRlKCAnZGF0YS1pbmRleC1oJywgaCApO1xuXHRcdFx0dHJhbnNmb3JtRWxlbWVudCggaHNsaWRlLCAndHJhbnNsYXRlM2QoJyArICggaCAqIHNsaWRlV2lkdGggKSArICdweCwgMCwgMCknICk7XG5cblx0XHRcdGlmKCBoc2xpZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCAnc3RhY2snICkgKSB7XG5cblx0XHRcdFx0dG9BcnJheSggaHNsaWRlLnF1ZXJ5U2VsZWN0b3JBbGwoICdzZWN0aW9uJyApICkuZm9yRWFjaCggZnVuY3Rpb24oIHZzbGlkZSwgdiApIHtcblx0XHRcdFx0XHR2c2xpZGUuc2V0QXR0cmlidXRlKCAnZGF0YS1pbmRleC1oJywgaCApO1xuXHRcdFx0XHRcdHZzbGlkZS5zZXRBdHRyaWJ1dGUoICdkYXRhLWluZGV4LXYnLCB2ICk7XG5cblx0XHRcdFx0XHR0cmFuc2Zvcm1FbGVtZW50KCB2c2xpZGUsICd0cmFuc2xhdGUzZCgwLCAnICsgKCB2ICogc2xpZGVIZWlnaHQgKSArICdweCwgMCknICk7XG5cdFx0XHRcdH0gKTtcblxuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHRcdC8vIExheW91dCBzbGlkZSBiYWNrZ3JvdW5kc1xuXHRcdHRvQXJyYXkoIGRvbS5iYWNrZ3JvdW5kLmNoaWxkTm9kZXMgKS5mb3JFYWNoKCBmdW5jdGlvbiggaGJhY2tncm91bmQsIGggKSB7XG5cdFx0XHR0cmFuc2Zvcm1FbGVtZW50KCBoYmFja2dyb3VuZCwgJ3RyYW5zbGF0ZTNkKCcgKyAoIGggKiBzbGlkZVdpZHRoICkgKyAncHgsIDAsIDApJyApO1xuXG5cdFx0XHR0b0FycmF5KCBoYmFja2dyb3VuZC5xdWVyeVNlbGVjdG9yQWxsKCAnLnNsaWRlLWJhY2tncm91bmQnICkgKS5mb3JFYWNoKCBmdW5jdGlvbiggdmJhY2tncm91bmQsIHYgKSB7XG5cdFx0XHRcdHRyYW5zZm9ybUVsZW1lbnQoIHZiYWNrZ3JvdW5kLCAndHJhbnNsYXRlM2QoMCwgJyArICggdiAqIHNsaWRlSGVpZ2h0ICkgKyAncHgsIDApJyApO1xuXHRcdFx0fSApO1xuXHRcdH0gKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIE1vdmVzIHRoZSBvdmVydmlldyB2aWV3cG9ydCB0byB0aGUgY3VycmVudCBzbGlkZXMuXG5cdCAqIENhbGxlZCBlYWNoIHRpbWUgdGhlIGN1cnJlbnQgc2xpZGUgY2hhbmdlcy5cblx0ICovXG5cdGZ1bmN0aW9uIHVwZGF0ZU92ZXJ2aWV3KCkge1xuXG5cdFx0dmFyIG1hcmdpbiA9IDcwO1xuXHRcdHZhciBzbGlkZVdpZHRoID0gY29uZmlnLndpZHRoICsgbWFyZ2luLFxuXHRcdFx0c2xpZGVIZWlnaHQgPSBjb25maWcuaGVpZ2h0ICsgbWFyZ2luO1xuXG5cdFx0Ly8gUmV2ZXJzZSBpbiBSVEwgbW9kZVxuXHRcdGlmKCBjb25maWcucnRsICkge1xuXHRcdFx0c2xpZGVXaWR0aCA9IC1zbGlkZVdpZHRoO1xuXHRcdH1cblxuXHRcdHRyYW5zZm9ybVNsaWRlcygge1xuXHRcdFx0b3ZlcnZpZXc6IFtcblx0XHRcdFx0J3RyYW5zbGF0ZVgoJysgKCAtaW5kZXhoICogc2xpZGVXaWR0aCApICsncHgpJyxcblx0XHRcdFx0J3RyYW5zbGF0ZVkoJysgKCAtaW5kZXh2ICogc2xpZGVIZWlnaHQgKSArJ3B4KScsXG5cdFx0XHRcdCd0cmFuc2xhdGVaKCcrICggd2luZG93LmlubmVyV2lkdGggPCA0MDAgPyAtMTAwMCA6IC0yNTAwICkgKydweCknXG5cdFx0XHRdLmpvaW4oICcgJyApXG5cdFx0fSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogRXhpdHMgdGhlIHNsaWRlIG92ZXJ2aWV3IGFuZCBlbnRlcnMgdGhlIGN1cnJlbnRseVxuXHQgKiBhY3RpdmUgc2xpZGUuXG5cdCAqL1xuXHRmdW5jdGlvbiBkZWFjdGl2YXRlT3ZlcnZpZXcoKSB7XG5cblx0XHQvLyBPbmx5IHByb2NlZWQgaWYgZW5hYmxlZCBpbiBjb25maWdcblx0XHRpZiggY29uZmlnLm92ZXJ2aWV3ICkge1xuXG5cdFx0XHRvdmVydmlldyA9IGZhbHNlO1xuXG5cdFx0XHRkb20ud3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKCAnb3ZlcnZpZXcnICk7XG5cdFx0XHRkb20ud3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKCAnb3ZlcnZpZXctYW5pbWF0ZWQnICk7XG5cblx0XHRcdC8vIFRlbXBvcmFyaWx5IGFkZCBhIGNsYXNzIHNvIHRoYXQgdHJhbnNpdGlvbnMgY2FuIGRvIGRpZmZlcmVudCB0aGluZ3Ncblx0XHRcdC8vIGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoZXkgYXJlIGV4aXRpbmcvZW50ZXJpbmcgb3ZlcnZpZXcsIG9yIGp1c3Rcblx0XHRcdC8vIG1vdmluZyBmcm9tIHNsaWRlIHRvIHNsaWRlXG5cdFx0XHRkb20ud3JhcHBlci5jbGFzc0xpc3QuYWRkKCAnb3ZlcnZpZXctZGVhY3RpdmF0aW5nJyApO1xuXG5cdFx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGRvbS53cmFwcGVyLmNsYXNzTGlzdC5yZW1vdmUoICdvdmVydmlldy1kZWFjdGl2YXRpbmcnICk7XG5cdFx0XHR9LCAxICk7XG5cblx0XHRcdC8vIE1vdmUgdGhlIGJhY2tncm91bmQgZWxlbWVudCBiYWNrIG91dFxuXHRcdFx0ZG9tLndyYXBwZXIuYXBwZW5kQ2hpbGQoIGRvbS5iYWNrZ3JvdW5kICk7XG5cblx0XHRcdC8vIENsZWFuIHVwIGNoYW5nZXMgbWFkZSB0byBzbGlkZXNcblx0XHRcdHRvQXJyYXkoIGRvbS53cmFwcGVyLnF1ZXJ5U2VsZWN0b3JBbGwoIFNMSURFU19TRUxFQ1RPUiApICkuZm9yRWFjaCggZnVuY3Rpb24oIHNsaWRlICkge1xuXHRcdFx0XHR0cmFuc2Zvcm1FbGVtZW50KCBzbGlkZSwgJycgKTtcblxuXHRcdFx0XHRzbGlkZS5yZW1vdmVFdmVudExpc3RlbmVyKCAnY2xpY2snLCBvbk92ZXJ2aWV3U2xpZGVDbGlja2VkLCB0cnVlICk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdC8vIENsZWFuIHVwIGNoYW5nZXMgbWFkZSB0byBiYWNrZ3JvdW5kc1xuXHRcdFx0dG9BcnJheSggZG9tLmJhY2tncm91bmQucXVlcnlTZWxlY3RvckFsbCggJy5zbGlkZS1iYWNrZ3JvdW5kJyApICkuZm9yRWFjaCggZnVuY3Rpb24oIGJhY2tncm91bmQgKSB7XG5cdFx0XHRcdHRyYW5zZm9ybUVsZW1lbnQoIGJhY2tncm91bmQsICcnICk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdHRyYW5zZm9ybVNsaWRlcyggeyBvdmVydmlldzogJycgfSApO1xuXG5cdFx0XHRzbGlkZSggaW5kZXhoLCBpbmRleHYgKTtcblxuXHRcdFx0bGF5b3V0KCk7XG5cblx0XHRcdGN1ZUF1dG9TbGlkZSgpO1xuXG5cdFx0XHQvLyBOb3RpZnkgb2JzZXJ2ZXJzIG9mIHRoZSBvdmVydmlldyBoaWRpbmdcblx0XHRcdGRpc3BhdGNoRXZlbnQoICdvdmVydmlld2hpZGRlbicsIHtcblx0XHRcdFx0J2luZGV4aCc6IGluZGV4aCxcblx0XHRcdFx0J2luZGV4dic6IGluZGV4dixcblx0XHRcdFx0J2N1cnJlbnRTbGlkZSc6IGN1cnJlbnRTbGlkZVxuXHRcdFx0fSApO1xuXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRvZ2dsZXMgdGhlIHNsaWRlIG92ZXJ2aWV3IG1vZGUgb24gYW5kIG9mZi5cblx0ICpcblx0ICogQHBhcmFtIHtCb29sZWFufSBvdmVycmlkZSBPcHRpb25hbCBmbGFnIHdoaWNoIG92ZXJyaWRlcyB0aGVcblx0ICogdG9nZ2xlIGxvZ2ljIGFuZCBmb3JjaWJseSBzZXRzIHRoZSBkZXNpcmVkIHN0YXRlLiBUcnVlIG1lYW5zXG5cdCAqIG92ZXJ2aWV3IGlzIG9wZW4sIGZhbHNlIG1lYW5zIGl0J3MgY2xvc2VkLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9nZ2xlT3ZlcnZpZXcoIG92ZXJyaWRlICkge1xuXG5cdFx0aWYoIHR5cGVvZiBvdmVycmlkZSA9PT0gJ2Jvb2xlYW4nICkge1xuXHRcdFx0b3ZlcnJpZGUgPyBhY3RpdmF0ZU92ZXJ2aWV3KCkgOiBkZWFjdGl2YXRlT3ZlcnZpZXcoKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpc092ZXJ2aWV3KCkgPyBkZWFjdGl2YXRlT3ZlcnZpZXcoKSA6IGFjdGl2YXRlT3ZlcnZpZXcoKTtcblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIG92ZXJ2aWV3IGlzIGN1cnJlbnRseSBhY3RpdmUuXG5cdCAqXG5cdCAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgdGhlIG92ZXJ2aWV3IGlzIGFjdGl2ZSxcblx0ICogZmFsc2Ugb3RoZXJ3aXNlXG5cdCAqL1xuXHRmdW5jdGlvbiBpc092ZXJ2aWV3KCkge1xuXG5cdFx0cmV0dXJuIG92ZXJ2aWV3O1xuXG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IG9yIHNwZWNpZmllZCBzbGlkZSBpcyB2ZXJ0aWNhbFxuXHQgKiAobmVzdGVkIHdpdGhpbiBhbm90aGVyIHNsaWRlKS5cblx0ICpcblx0ICogQHBhcmFtIHtIVE1MRWxlbWVudH0gc2xpZGUgW29wdGlvbmFsXSBUaGUgc2xpZGUgdG8gY2hlY2tcblx0ICogb3JpZW50YXRpb24gb2Zcblx0ICovXG5cdGZ1bmN0aW9uIGlzVmVydGljYWxTbGlkZSggc2xpZGUgKSB7XG5cblx0XHQvLyBQcmVmZXIgc2xpZGUgYXJndW1lbnQsIG90aGVyd2lzZSB1c2UgY3VycmVudCBzbGlkZVxuXHRcdHNsaWRlID0gc2xpZGUgPyBzbGlkZSA6IGN1cnJlbnRTbGlkZTtcblxuXHRcdHJldHVybiBzbGlkZSAmJiBzbGlkZS5wYXJlbnROb2RlICYmICEhc2xpZGUucGFyZW50Tm9kZS5ub2RlTmFtZS5tYXRjaCggL3NlY3Rpb24vaSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxpbmcgdGhlIGZ1bGxzY3JlZW4gZnVuY3Rpb25hbGl0eSB2aWEgdGhlIGZ1bGxzY3JlZW4gQVBJXG5cdCAqXG5cdCAqIEBzZWUgaHR0cDovL2Z1bGxzY3JlZW4uc3BlYy53aGF0d2cub3JnL1xuXHQgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvRE9NL1VzaW5nX2Z1bGxzY3JlZW5fbW9kZVxuXHQgKi9cblx0ZnVuY3Rpb24gZW50ZXJGdWxsc2NyZWVuKCkge1xuXG5cdFx0dmFyIGVsZW1lbnQgPSBkb2N1bWVudC5ib2R5O1xuXG5cdFx0Ly8gQ2hlY2sgd2hpY2ggaW1wbGVtZW50YXRpb24gaXMgYXZhaWxhYmxlXG5cdFx0dmFyIHJlcXVlc3RNZXRob2QgPSBlbGVtZW50LnJlcXVlc3RGdWxsU2NyZWVuIHx8XG5cdFx0XHRcdFx0XHRcdGVsZW1lbnQud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4gfHxcblx0XHRcdFx0XHRcdFx0ZWxlbWVudC53ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbiB8fFxuXHRcdFx0XHRcdFx0XHRlbGVtZW50Lm1velJlcXVlc3RGdWxsU2NyZWVuIHx8XG5cdFx0XHRcdFx0XHRcdGVsZW1lbnQubXNSZXF1ZXN0RnVsbHNjcmVlbjtcblxuXHRcdGlmKCByZXF1ZXN0TWV0aG9kICkge1xuXHRcdFx0cmVxdWVzdE1ldGhvZC5hcHBseSggZWxlbWVudCApO1xuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIEVudGVycyB0aGUgcGF1c2VkIG1vZGUgd2hpY2ggZmFkZXMgZXZlcnl0aGluZyBvbiBzY3JlZW4gdG9cblx0ICogYmxhY2suXG5cdCAqL1xuXHRmdW5jdGlvbiBwYXVzZSgpIHtcblxuXHRcdGlmKCBjb25maWcucGF1c2UgKSB7XG5cdFx0XHR2YXIgd2FzUGF1c2VkID0gZG9tLndyYXBwZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCAncGF1c2VkJyApO1xuXG5cdFx0XHRjYW5jZWxBdXRvU2xpZGUoKTtcblx0XHRcdGRvbS53cmFwcGVyLmNsYXNzTGlzdC5hZGQoICdwYXVzZWQnICk7XG5cblx0XHRcdGlmKCB3YXNQYXVzZWQgPT09IGZhbHNlICkge1xuXHRcdFx0XHRkaXNwYXRjaEV2ZW50KCAncGF1c2VkJyApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIEV4aXRzIGZyb20gdGhlIHBhdXNlZCBtb2RlLlxuXHQgKi9cblx0ZnVuY3Rpb24gcmVzdW1lKCkge1xuXG5cdFx0dmFyIHdhc1BhdXNlZCA9IGRvbS53cmFwcGVyLmNsYXNzTGlzdC5jb250YWlucyggJ3BhdXNlZCcgKTtcblx0XHRkb20ud3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKCAncGF1c2VkJyApO1xuXG5cdFx0Y3VlQXV0b1NsaWRlKCk7XG5cblx0XHRpZiggd2FzUGF1c2VkICkge1xuXHRcdFx0ZGlzcGF0Y2hFdmVudCggJ3Jlc3VtZWQnICk7XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogVG9nZ2xlcyB0aGUgcGF1c2VkIG1vZGUgb24gYW5kIG9mZi5cblx0ICovXG5cdGZ1bmN0aW9uIHRvZ2dsZVBhdXNlKCBvdmVycmlkZSApIHtcblxuXHRcdGlmKCB0eXBlb2Ygb3ZlcnJpZGUgPT09ICdib29sZWFuJyApIHtcblx0XHRcdG92ZXJyaWRlID8gcGF1c2UoKSA6IHJlc3VtZSgpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGlzUGF1c2VkKCkgPyByZXN1bWUoKSA6IHBhdXNlKCk7XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHdlIGFyZSBjdXJyZW50bHkgaW4gdGhlIHBhdXNlZCBtb2RlLlxuXHQgKi9cblx0ZnVuY3Rpb24gaXNQYXVzZWQoKSB7XG5cblx0XHRyZXR1cm4gZG9tLndyYXBwZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCAncGF1c2VkJyApO1xuXG5cdH1cblxuXHQvKipcblx0ICogVG9nZ2xlcyB0aGUgYXV0byBzbGlkZSBtb2RlIG9uIGFuZCBvZmYuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gb3ZlcnJpZGUgT3B0aW9uYWwgZmxhZyB3aGljaCBzZXRzIHRoZSBkZXNpcmVkIHN0YXRlLlxuXHQgKiBUcnVlIG1lYW5zIGF1dG9wbGF5IHN0YXJ0cywgZmFsc2UgbWVhbnMgaXQgc3RvcHMuXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIHRvZ2dsZUF1dG9TbGlkZSggb3ZlcnJpZGUgKSB7XG5cblx0XHRpZiggdHlwZW9mIG92ZXJyaWRlID09PSAnYm9vbGVhbicgKSB7XG5cdFx0XHRvdmVycmlkZSA/IHJlc3VtZUF1dG9TbGlkZSgpIDogcGF1c2VBdXRvU2xpZGUoKTtcblx0XHR9XG5cblx0XHRlbHNlIHtcblx0XHRcdGF1dG9TbGlkZVBhdXNlZCA/IHJlc3VtZUF1dG9TbGlkZSgpIDogcGF1c2VBdXRvU2xpZGUoKTtcblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIGF1dG8gc2xpZGUgbW9kZSBpcyBjdXJyZW50bHkgb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBpc0F1dG9TbGlkaW5nKCkge1xuXG5cdFx0cmV0dXJuICEhKCBhdXRvU2xpZGUgJiYgIWF1dG9TbGlkZVBhdXNlZCApO1xuXG5cdH1cblxuXHQvKipcblx0ICogU3RlcHMgZnJvbSB0aGUgY3VycmVudCBwb2ludCBpbiB0aGUgcHJlc2VudGF0aW9uIHRvIHRoZVxuXHQgKiBzbGlkZSB3aGljaCBtYXRjaGVzIHRoZSBzcGVjaWZpZWQgaG9yaXpvbnRhbCBhbmQgdmVydGljYWxcblx0ICogaW5kaWNlcy5cblx0ICpcblx0ICogQHBhcmFtIHtpbnR9IGggSG9yaXpvbnRhbCBpbmRleCBvZiB0aGUgdGFyZ2V0IHNsaWRlXG5cdCAqIEBwYXJhbSB7aW50fSB2IFZlcnRpY2FsIGluZGV4IG9mIHRoZSB0YXJnZXQgc2xpZGVcblx0ICogQHBhcmFtIHtpbnR9IGYgT3B0aW9uYWwgaW5kZXggb2YgYSBmcmFnbWVudCB3aXRoaW4gdGhlXG5cdCAqIHRhcmdldCBzbGlkZSB0byBhY3RpdmF0ZVxuXHQgKiBAcGFyYW0ge2ludH0gbyBPcHRpb25hbCBvcmlnaW4gZm9yIHVzZSBpbiBtdWx0aW1hc3RlciBlbnZpcm9ubWVudHNcblx0ICovXG5cdGZ1bmN0aW9uIHNsaWRlKCBoLCB2LCBmLCBvICkge1xuXG5cdFx0Ly8gUmVtZW1iZXIgd2hlcmUgd2Ugd2VyZSBhdCBiZWZvcmVcblx0XHRwcmV2aW91c1NsaWRlID0gY3VycmVudFNsaWRlO1xuXG5cdFx0Ly8gUXVlcnkgYWxsIGhvcml6b250YWwgc2xpZGVzIGluIHRoZSBkZWNrXG5cdFx0dmFyIGhvcml6b250YWxTbGlkZXMgPSBkb20ud3JhcHBlci5xdWVyeVNlbGVjdG9yQWxsKCBIT1JJWk9OVEFMX1NMSURFU19TRUxFQ1RPUiApO1xuXG5cdFx0Ly8gSWYgbm8gdmVydGljYWwgaW5kZXggaXMgc3BlY2lmaWVkIGFuZCB0aGUgdXBjb21pbmcgc2xpZGUgaXMgYVxuXHRcdC8vIHN0YWNrLCByZXN1bWUgYXQgaXRzIHByZXZpb3VzIHZlcnRpY2FsIGluZGV4XG5cdFx0aWYoIHYgPT09IHVuZGVmaW5lZCAmJiAhaXNPdmVydmlldygpICkge1xuXHRcdFx0diA9IGdldFByZXZpb3VzVmVydGljYWxJbmRleCggaG9yaXpvbnRhbFNsaWRlc1sgaCBdICk7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgd2Ugd2VyZSBvbiBhIHZlcnRpY2FsIHN0YWNrLCByZW1lbWJlciB3aGF0IHZlcnRpY2FsIGluZGV4XG5cdFx0Ly8gaXQgd2FzIG9uIHNvIHdlIGNhbiByZXN1bWUgYXQgdGhlIHNhbWUgcG9zaXRpb24gd2hlbiByZXR1cm5pbmdcblx0XHRpZiggcHJldmlvdXNTbGlkZSAmJiBwcmV2aW91c1NsaWRlLnBhcmVudE5vZGUgJiYgcHJldmlvdXNTbGlkZS5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucyggJ3N0YWNrJyApICkge1xuXHRcdFx0c2V0UHJldmlvdXNWZXJ0aWNhbEluZGV4KCBwcmV2aW91c1NsaWRlLnBhcmVudE5vZGUsIGluZGV4diApO1xuXHRcdH1cblxuXHRcdC8vIFJlbWVtYmVyIHRoZSBzdGF0ZSBiZWZvcmUgdGhpcyBzbGlkZVxuXHRcdHZhciBzdGF0ZUJlZm9yZSA9IHN0YXRlLmNvbmNhdCgpO1xuXG5cdFx0Ly8gUmVzZXQgdGhlIHN0YXRlIGFycmF5XG5cdFx0c3RhdGUubGVuZ3RoID0gMDtcblxuXHRcdHZhciBpbmRleGhCZWZvcmUgPSBpbmRleGggfHwgMCxcblx0XHRcdGluZGV4dkJlZm9yZSA9IGluZGV4diB8fCAwO1xuXG5cdFx0Ly8gQWN0aXZhdGUgYW5kIHRyYW5zaXRpb24gdG8gdGhlIG5ldyBzbGlkZVxuXHRcdGluZGV4aCA9IHVwZGF0ZVNsaWRlcyggSE9SSVpPTlRBTF9TTElERVNfU0VMRUNUT1IsIGggPT09IHVuZGVmaW5lZCA/IGluZGV4aCA6IGggKTtcblx0XHRpbmRleHYgPSB1cGRhdGVTbGlkZXMoIFZFUlRJQ0FMX1NMSURFU19TRUxFQ1RPUiwgdiA9PT0gdW5kZWZpbmVkID8gaW5kZXh2IDogdiApO1xuXG5cdFx0Ly8gVXBkYXRlIHRoZSB2aXNpYmlsaXR5IG9mIHNsaWRlcyBub3cgdGhhdCB0aGUgaW5kaWNlcyBoYXZlIGNoYW5nZWRcblx0XHR1cGRhdGVTbGlkZXNWaXNpYmlsaXR5KCk7XG5cblx0XHRsYXlvdXQoKTtcblxuXHRcdC8vIEFwcGx5IHRoZSBuZXcgc3RhdGVcblx0XHRzdGF0ZUxvb3A6IGZvciggdmFyIGkgPSAwLCBsZW4gPSBzdGF0ZS5sZW5ndGg7IGkgPCBsZW47IGkrKyApIHtcblx0XHRcdC8vIENoZWNrIGlmIHRoaXMgc3RhdGUgZXhpc3RlZCBvbiB0aGUgcHJldmlvdXMgc2xpZGUuIElmIGl0XG5cdFx0XHQvLyBkaWQsIHdlIHdpbGwgYXZvaWQgYWRkaW5nIGl0IHJlcGVhdGVkbHlcblx0XHRcdGZvciggdmFyIGogPSAwOyBqIDwgc3RhdGVCZWZvcmUubGVuZ3RoOyBqKysgKSB7XG5cdFx0XHRcdGlmKCBzdGF0ZUJlZm9yZVtqXSA9PT0gc3RhdGVbaV0gKSB7XG5cdFx0XHRcdFx0c3RhdGVCZWZvcmUuc3BsaWNlKCBqLCAxICk7XG5cdFx0XHRcdFx0Y29udGludWUgc3RhdGVMb29wO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKCBzdGF0ZVtpXSApO1xuXG5cdFx0XHQvLyBEaXNwYXRjaCBjdXN0b20gZXZlbnQgbWF0Y2hpbmcgdGhlIHN0YXRlJ3MgbmFtZVxuXHRcdFx0ZGlzcGF0Y2hFdmVudCggc3RhdGVbaV0gKTtcblx0XHR9XG5cblx0XHQvLyBDbGVhbiB1cCB0aGUgcmVtYWlucyBvZiB0aGUgcHJldmlvdXMgc3RhdGVcblx0XHR3aGlsZSggc3RhdGVCZWZvcmUubGVuZ3RoICkge1xuXHRcdFx0ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoIHN0YXRlQmVmb3JlLnBvcCgpICk7XG5cdFx0fVxuXG5cdFx0Ly8gVXBkYXRlIHRoZSBvdmVydmlldyBpZiBpdCdzIGN1cnJlbnRseSBhY3RpdmVcblx0XHRpZiggaXNPdmVydmlldygpICkge1xuXHRcdFx0dXBkYXRlT3ZlcnZpZXcoKTtcblx0XHR9XG5cblx0XHQvLyBGaW5kIHRoZSBjdXJyZW50IGhvcml6b250YWwgc2xpZGUgYW5kIGFueSBwb3NzaWJsZSB2ZXJ0aWNhbCBzbGlkZXNcblx0XHQvLyB3aXRoaW4gaXRcblx0XHR2YXIgY3VycmVudEhvcml6b250YWxTbGlkZSA9IGhvcml6b250YWxTbGlkZXNbIGluZGV4aCBdLFxuXHRcdFx0Y3VycmVudFZlcnRpY2FsU2xpZGVzID0gY3VycmVudEhvcml6b250YWxTbGlkZS5xdWVyeVNlbGVjdG9yQWxsKCAnc2VjdGlvbicgKTtcblxuXHRcdC8vIFN0b3JlIHJlZmVyZW5jZXMgdG8gdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50IHNsaWRlc1xuXHRcdGN1cnJlbnRTbGlkZSA9IGN1cnJlbnRWZXJ0aWNhbFNsaWRlc1sgaW5kZXh2IF0gfHwgY3VycmVudEhvcml6b250YWxTbGlkZTtcblxuXHRcdC8vIFNob3cgZnJhZ21lbnQsIGlmIHNwZWNpZmllZFxuXHRcdGlmKCB0eXBlb2YgZiAhPT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHRuYXZpZ2F0ZUZyYWdtZW50KCBmICk7XG5cdFx0fVxuXG5cdFx0Ly8gRGlzcGF0Y2ggYW4gZXZlbnQgaWYgdGhlIHNsaWRlIGNoYW5nZWRcblx0XHR2YXIgc2xpZGVDaGFuZ2VkID0gKCBpbmRleGggIT09IGluZGV4aEJlZm9yZSB8fCBpbmRleHYgIT09IGluZGV4dkJlZm9yZSApO1xuXHRcdGlmKCBzbGlkZUNoYW5nZWQgKSB7XG5cdFx0XHRkaXNwYXRjaEV2ZW50KCAnc2xpZGVjaGFuZ2VkJywge1xuXHRcdFx0XHQnaW5kZXhoJzogaW5kZXhoLFxuXHRcdFx0XHQnaW5kZXh2JzogaW5kZXh2LFxuXHRcdFx0XHQncHJldmlvdXNTbGlkZSc6IHByZXZpb3VzU2xpZGUsXG5cdFx0XHRcdCdjdXJyZW50U2xpZGUnOiBjdXJyZW50U2xpZGUsXG5cdFx0XHRcdCdvcmlnaW4nOiBvXG5cdFx0XHR9ICk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0Ly8gRW5zdXJlIHRoYXQgdGhlIHByZXZpb3VzIHNsaWRlIGlzIG5ldmVyIHRoZSBzYW1lIGFzIHRoZSBjdXJyZW50XG5cdFx0XHRwcmV2aW91c1NsaWRlID0gbnVsbDtcblx0XHR9XG5cblx0XHQvLyBTb2x2ZXMgYW4gZWRnZSBjYXNlIHdoZXJlIHRoZSBwcmV2aW91cyBzbGlkZSBtYWludGFpbnMgdGhlXG5cdFx0Ly8gJ3ByZXNlbnQnIGNsYXNzIHdoZW4gbmF2aWdhdGluZyBiZXR3ZWVuIGFkamFjZW50IHZlcnRpY2FsXG5cdFx0Ly8gc3RhY2tzXG5cdFx0aWYoIHByZXZpb3VzU2xpZGUgKSB7XG5cdFx0XHRwcmV2aW91c1NsaWRlLmNsYXNzTGlzdC5yZW1vdmUoICdwcmVzZW50JyApO1xuXHRcdFx0cHJldmlvdXNTbGlkZS5zZXRBdHRyaWJ1dGUoICdhcmlhLWhpZGRlbicsICd0cnVlJyApO1xuXG5cdFx0XHQvLyBSZXNldCBhbGwgc2xpZGVzIHVwb24gbmF2aWdhdGUgdG8gaG9tZVxuXHRcdFx0Ly8gSXNzdWU6ICMyODVcblx0XHRcdGlmICggZG9tLndyYXBwZXIucXVlcnlTZWxlY3RvciggSE9NRV9TTElERV9TRUxFQ1RPUiApLmNsYXNzTGlzdC5jb250YWlucyggJ3ByZXNlbnQnICkgKSB7XG5cdFx0XHRcdC8vIExhdW5jaCBhc3luYyB0YXNrXG5cdFx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR2YXIgc2xpZGVzID0gdG9BcnJheSggZG9tLndyYXBwZXIucXVlcnlTZWxlY3RvckFsbCggSE9SSVpPTlRBTF9TTElERVNfU0VMRUNUT1IgKyAnLnN0YWNrJykgKSwgaTtcblx0XHRcdFx0XHRmb3IoIGkgaW4gc2xpZGVzICkge1xuXHRcdFx0XHRcdFx0aWYoIHNsaWRlc1tpXSApIHtcblx0XHRcdFx0XHRcdFx0Ly8gUmVzZXQgc3RhY2tcblx0XHRcdFx0XHRcdFx0c2V0UHJldmlvdXNWZXJ0aWNhbEluZGV4KCBzbGlkZXNbaV0sIDAgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIDAgKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBIYW5kbGUgZW1iZWRkZWQgY29udGVudFxuXHRcdGlmKCBzbGlkZUNoYW5nZWQgfHwgIXByZXZpb3VzU2xpZGUgKSB7XG5cdFx0XHRzdG9wRW1iZWRkZWRDb250ZW50KCBwcmV2aW91c1NsaWRlICk7XG5cdFx0XHRzdGFydEVtYmVkZGVkQ29udGVudCggY3VycmVudFNsaWRlICk7XG5cdFx0fVxuXG5cdFx0Ly8gQW5ub3VuY2UgdGhlIGN1cnJlbnQgc2xpZGUgY29udGVudHMsIGZvciBzY3JlZW4gcmVhZGVyc1xuXHRcdGRvbS5zdGF0dXNEaXYudGV4dENvbnRlbnQgPSBjdXJyZW50U2xpZGUudGV4dENvbnRlbnQ7XG5cblx0XHR1cGRhdGVDb250cm9scygpO1xuXHRcdHVwZGF0ZVByb2dyZXNzKCk7XG5cdFx0dXBkYXRlQmFja2dyb3VuZCgpO1xuXHRcdHVwZGF0ZVBhcmFsbGF4KCk7XG5cdFx0dXBkYXRlU2xpZGVOdW1iZXIoKTtcblxuXHRcdC8vIFVwZGF0ZSB0aGUgVVJMIGhhc2hcblx0XHR3cml0ZVVSTCgpO1xuXG5cdFx0Y3VlQXV0b1NsaWRlKCk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBTeW5jcyB0aGUgcHJlc2VudGF0aW9uIHdpdGggdGhlIGN1cnJlbnQgRE9NLiBVc2VmdWxcblx0ICogd2hlbiBuZXcgc2xpZGVzIG9yIGNvbnRyb2wgZWxlbWVudHMgYXJlIGFkZGVkIG9yIHdoZW5cblx0ICogdGhlIGNvbmZpZ3VyYXRpb24gaGFzIGNoYW5nZWQuXG5cdCAqL1xuXHRmdW5jdGlvbiBzeW5jKCkge1xuXG5cdFx0Ly8gU3Vic2NyaWJlIHRvIGlucHV0XG5cdFx0cmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcblx0XHRhZGRFdmVudExpc3RlbmVycygpO1xuXG5cdFx0Ly8gRm9yY2UgYSBsYXlvdXQgdG8gbWFrZSBzdXJlIHRoZSBjdXJyZW50IGNvbmZpZyBpcyBhY2NvdW50ZWQgZm9yXG5cdFx0bGF5b3V0KCk7XG5cblx0XHQvLyBSZWZsZWN0IHRoZSBjdXJyZW50IGF1dG9TbGlkZSB2YWx1ZVxuXHRcdGF1dG9TbGlkZSA9IGNvbmZpZy5hdXRvU2xpZGU7XG5cblx0XHQvLyBTdGFydCBhdXRvLXNsaWRpbmcgaWYgaXQncyBlbmFibGVkXG5cdFx0Y3VlQXV0b1NsaWRlKCk7XG5cblx0XHQvLyBSZS1jcmVhdGUgdGhlIHNsaWRlIGJhY2tncm91bmRzXG5cdFx0Y3JlYXRlQmFja2dyb3VuZHMoKTtcblxuXHRcdC8vIFdyaXRlIHRoZSBjdXJyZW50IGhhc2ggdG8gdGhlIFVSTFxuXHRcdHdyaXRlVVJMKCk7XG5cblx0XHRzb3J0QWxsRnJhZ21lbnRzKCk7XG5cblx0XHR1cGRhdGVDb250cm9scygpO1xuXHRcdHVwZGF0ZVByb2dyZXNzKCk7XG5cdFx0dXBkYXRlQmFja2dyb3VuZCggdHJ1ZSApO1xuXHRcdHVwZGF0ZVNsaWRlTnVtYmVyKCk7XG5cdFx0dXBkYXRlU2xpZGVzVmlzaWJpbGl0eSgpO1xuXG5cdFx0Zm9ybWF0RW1iZWRkZWRDb250ZW50KCk7XG5cdFx0c3RhcnRFbWJlZGRlZENvbnRlbnQoIGN1cnJlbnRTbGlkZSApO1xuXG5cdFx0aWYoIGlzT3ZlcnZpZXcoKSApIHtcblx0XHRcdGxheW91dE92ZXJ2aWV3KCk7XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogUmVzZXRzIGFsbCB2ZXJ0aWNhbCBzbGlkZXMgc28gdGhhdCBvbmx5IHRoZSBmaXJzdFxuXHQgKiBpcyB2aXNpYmxlLlxuXHQgKi9cblx0ZnVuY3Rpb24gcmVzZXRWZXJ0aWNhbFNsaWRlcygpIHtcblxuXHRcdHZhciBob3Jpem9udGFsU2xpZGVzID0gdG9BcnJheSggZG9tLndyYXBwZXIucXVlcnlTZWxlY3RvckFsbCggSE9SSVpPTlRBTF9TTElERVNfU0VMRUNUT1IgKSApO1xuXHRcdGhvcml6b250YWxTbGlkZXMuZm9yRWFjaCggZnVuY3Rpb24oIGhvcml6b250YWxTbGlkZSApIHtcblxuXHRcdFx0dmFyIHZlcnRpY2FsU2xpZGVzID0gdG9BcnJheSggaG9yaXpvbnRhbFNsaWRlLnF1ZXJ5U2VsZWN0b3JBbGwoICdzZWN0aW9uJyApICk7XG5cdFx0XHR2ZXJ0aWNhbFNsaWRlcy5mb3JFYWNoKCBmdW5jdGlvbiggdmVydGljYWxTbGlkZSwgeSApIHtcblxuXHRcdFx0XHRpZiggeSA+IDAgKSB7XG5cdFx0XHRcdFx0dmVydGljYWxTbGlkZS5jbGFzc0xpc3QucmVtb3ZlKCAncHJlc2VudCcgKTtcblx0XHRcdFx0XHR2ZXJ0aWNhbFNsaWRlLmNsYXNzTGlzdC5yZW1vdmUoICdwYXN0JyApO1xuXHRcdFx0XHRcdHZlcnRpY2FsU2xpZGUuY2xhc3NMaXN0LmFkZCggJ2Z1dHVyZScgKTtcblx0XHRcdFx0XHR2ZXJ0aWNhbFNsaWRlLnNldEF0dHJpYnV0ZSggJ2FyaWEtaGlkZGVuJywgJ3RydWUnICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSApO1xuXG5cdFx0fSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogU29ydHMgYW5kIGZvcm1hdHMgYWxsIG9mIGZyYWdtZW50cyBpbiB0aGVcblx0ICogcHJlc2VudGF0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gc29ydEFsbEZyYWdtZW50cygpIHtcblxuXHRcdHZhciBob3Jpem9udGFsU2xpZGVzID0gdG9BcnJheSggZG9tLndyYXBwZXIucXVlcnlTZWxlY3RvckFsbCggSE9SSVpPTlRBTF9TTElERVNfU0VMRUNUT1IgKSApO1xuXHRcdGhvcml6b250YWxTbGlkZXMuZm9yRWFjaCggZnVuY3Rpb24oIGhvcml6b250YWxTbGlkZSApIHtcblxuXHRcdFx0dmFyIHZlcnRpY2FsU2xpZGVzID0gdG9BcnJheSggaG9yaXpvbnRhbFNsaWRlLnF1ZXJ5U2VsZWN0b3JBbGwoICdzZWN0aW9uJyApICk7XG5cdFx0XHR2ZXJ0aWNhbFNsaWRlcy5mb3JFYWNoKCBmdW5jdGlvbiggdmVydGljYWxTbGlkZSwgeSApIHtcblxuXHRcdFx0XHRzb3J0RnJhZ21lbnRzKCB2ZXJ0aWNhbFNsaWRlLnF1ZXJ5U2VsZWN0b3JBbGwoICcuZnJhZ21lbnQnICkgKTtcblxuXHRcdFx0fSApO1xuXG5cdFx0XHRpZiggdmVydGljYWxTbGlkZXMubGVuZ3RoID09PSAwICkgc29ydEZyYWdtZW50cyggaG9yaXpvbnRhbFNsaWRlLnF1ZXJ5U2VsZWN0b3JBbGwoICcuZnJhZ21lbnQnICkgKTtcblxuXHRcdH0gKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgb25lIGRpbWVuc2lvbiBvZiBzbGlkZXMgYnkgc2hvd2luZyB0aGUgc2xpZGVcblx0ICogd2l0aCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgQSBDU1Mgc2VsZWN0b3IgdGhhdCB3aWxsIGZldGNoXG5cdCAqIHRoZSBncm91cCBvZiBzbGlkZXMgd2UgYXJlIHdvcmtpbmcgd2l0aFxuXHQgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBzbGlkZSB0aGF0IHNob3VsZCBiZVxuXHQgKiBzaG93blxuXHQgKlxuXHQgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBpbmRleCBvZiB0aGUgc2xpZGUgdGhhdCBpcyBub3cgc2hvd24sXG5cdCAqIG1pZ2h0IGRpZmZlciBmcm9tIHRoZSBwYXNzZWQgaW4gaW5kZXggaWYgaXQgd2FzIG91dCBvZlxuXHQgKiBib3VuZHMuXG5cdCAqL1xuXHRmdW5jdGlvbiB1cGRhdGVTbGlkZXMoIHNlbGVjdG9yLCBpbmRleCApIHtcblxuXHRcdC8vIFNlbGVjdCBhbGwgc2xpZGVzIGFuZCBjb252ZXJ0IHRoZSBOb2RlTGlzdCByZXN1bHQgdG9cblx0XHQvLyBhbiBhcnJheVxuXHRcdHZhciBzbGlkZXMgPSB0b0FycmF5KCBkb20ud3JhcHBlci5xdWVyeVNlbGVjdG9yQWxsKCBzZWxlY3RvciApICksXG5cdFx0XHRzbGlkZXNMZW5ndGggPSBzbGlkZXMubGVuZ3RoO1xuXG5cdFx0dmFyIHByaW50TW9kZSA9IGlzUHJpbnRpbmdQREYoKTtcblxuXHRcdGlmKCBzbGlkZXNMZW5ndGggKSB7XG5cblx0XHRcdC8vIFNob3VsZCB0aGUgaW5kZXggbG9vcD9cblx0XHRcdGlmKCBjb25maWcubG9vcCApIHtcblx0XHRcdFx0aW5kZXggJT0gc2xpZGVzTGVuZ3RoO1xuXG5cdFx0XHRcdGlmKCBpbmRleCA8IDAgKSB7XG5cdFx0XHRcdFx0aW5kZXggPSBzbGlkZXNMZW5ndGggKyBpbmRleDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBFbmZvcmNlIG1heCBhbmQgbWluaW11bSBpbmRleCBib3VuZHNcblx0XHRcdGluZGV4ID0gTWF0aC5tYXgoIE1hdGgubWluKCBpbmRleCwgc2xpZGVzTGVuZ3RoIC0gMSApLCAwICk7XG5cblx0XHRcdGZvciggdmFyIGkgPSAwOyBpIDwgc2xpZGVzTGVuZ3RoOyBpKysgKSB7XG5cdFx0XHRcdHZhciBlbGVtZW50ID0gc2xpZGVzW2ldO1xuXG5cdFx0XHRcdHZhciByZXZlcnNlID0gY29uZmlnLnJ0bCAmJiAhaXNWZXJ0aWNhbFNsaWRlKCBlbGVtZW50ICk7XG5cblx0XHRcdFx0ZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCAncGFzdCcgKTtcblx0XHRcdFx0ZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCAncHJlc2VudCcgKTtcblx0XHRcdFx0ZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCAnZnV0dXJlJyApO1xuXG5cdFx0XHRcdC8vIGh0dHA6Ly93d3cudzMub3JnL2h0bWwvd2cvZHJhZnRzL2h0bWwvbWFzdGVyL2VkaXRpbmcuaHRtbCN0aGUtaGlkZGVuLWF0dHJpYnV0ZVxuXHRcdFx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZSggJ2hpZGRlbicsICcnICk7XG5cdFx0XHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlKCAnYXJpYS1oaWRkZW4nLCAndHJ1ZScgKTtcblxuXHRcdFx0XHQvLyBJZiB0aGlzIGVsZW1lbnQgY29udGFpbnMgdmVydGljYWwgc2xpZGVzXG5cdFx0XHRcdGlmKCBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoICdzZWN0aW9uJyApICkge1xuXHRcdFx0XHRcdGVsZW1lbnQuY2xhc3NMaXN0LmFkZCggJ3N0YWNrJyApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gSWYgd2UncmUgcHJpbnRpbmcgc3RhdGljIHNsaWRlcywgYWxsIHNsaWRlcyBhcmUgXCJwcmVzZW50XCJcblx0XHRcdFx0aWYoIHByaW50TW9kZSApIHtcblx0XHRcdFx0XHRlbGVtZW50LmNsYXNzTGlzdC5hZGQoICdwcmVzZW50JyApO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoIGkgPCBpbmRleCApIHtcblx0XHRcdFx0XHQvLyBBbnkgZWxlbWVudCBwcmV2aW91cyB0byBpbmRleCBpcyBnaXZlbiB0aGUgJ3Bhc3QnIGNsYXNzXG5cdFx0XHRcdFx0ZWxlbWVudC5jbGFzc0xpc3QuYWRkKCByZXZlcnNlID8gJ2Z1dHVyZScgOiAncGFzdCcgKTtcblxuXHRcdFx0XHRcdGlmKCBjb25maWcuZnJhZ21lbnRzICkge1xuXHRcdFx0XHRcdFx0dmFyIHBhc3RGcmFnbWVudHMgPSB0b0FycmF5KCBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoICcuZnJhZ21lbnQnICkgKTtcblxuXHRcdFx0XHRcdFx0Ly8gU2hvdyBhbGwgZnJhZ21lbnRzIG9uIHByaW9yIHNsaWRlc1xuXHRcdFx0XHRcdFx0d2hpbGUoIHBhc3RGcmFnbWVudHMubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0XHR2YXIgcGFzdEZyYWdtZW50ID0gcGFzdEZyYWdtZW50cy5wb3AoKTtcblx0XHRcdFx0XHRcdFx0cGFzdEZyYWdtZW50LmNsYXNzTGlzdC5hZGQoICd2aXNpYmxlJyApO1xuXHRcdFx0XHRcdFx0XHRwYXN0RnJhZ21lbnQuY2xhc3NMaXN0LnJlbW92ZSggJ2N1cnJlbnQtZnJhZ21lbnQnICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYoIGkgPiBpbmRleCApIHtcblx0XHRcdFx0XHQvLyBBbnkgZWxlbWVudCBzdWJzZXF1ZW50IHRvIGluZGV4IGlzIGdpdmVuIHRoZSAnZnV0dXJlJyBjbGFzc1xuXHRcdFx0XHRcdGVsZW1lbnQuY2xhc3NMaXN0LmFkZCggcmV2ZXJzZSA/ICdwYXN0JyA6ICdmdXR1cmUnICk7XG5cblx0XHRcdFx0XHRpZiggY29uZmlnLmZyYWdtZW50cyApIHtcblx0XHRcdFx0XHRcdHZhciBmdXR1cmVGcmFnbWVudHMgPSB0b0FycmF5KCBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoICcuZnJhZ21lbnQudmlzaWJsZScgKSApO1xuXG5cdFx0XHRcdFx0XHQvLyBObyBmcmFnbWVudHMgaW4gZnV0dXJlIHNsaWRlcyBzaG91bGQgYmUgdmlzaWJsZSBhaGVhZCBvZiB0aW1lXG5cdFx0XHRcdFx0XHR3aGlsZSggZnV0dXJlRnJhZ21lbnRzLmxlbmd0aCApIHtcblx0XHRcdFx0XHRcdFx0dmFyIGZ1dHVyZUZyYWdtZW50ID0gZnV0dXJlRnJhZ21lbnRzLnBvcCgpO1xuXHRcdFx0XHRcdFx0XHRmdXR1cmVGcmFnbWVudC5jbGFzc0xpc3QucmVtb3ZlKCAndmlzaWJsZScgKTtcblx0XHRcdFx0XHRcdFx0ZnV0dXJlRnJhZ21lbnQuY2xhc3NMaXN0LnJlbW92ZSggJ2N1cnJlbnQtZnJhZ21lbnQnICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIE1hcmsgdGhlIGN1cnJlbnQgc2xpZGUgYXMgcHJlc2VudFxuXHRcdFx0c2xpZGVzW2luZGV4XS5jbGFzc0xpc3QuYWRkKCAncHJlc2VudCcgKTtcblx0XHRcdHNsaWRlc1tpbmRleF0ucmVtb3ZlQXR0cmlidXRlKCAnaGlkZGVuJyApO1xuXHRcdFx0c2xpZGVzW2luZGV4XS5yZW1vdmVBdHRyaWJ1dGUoICdhcmlhLWhpZGRlbicgKTtcblxuXHRcdFx0Ly8gSWYgdGhpcyBzbGlkZSBoYXMgYSBzdGF0ZSBhc3NvY2lhdGVkIHdpdGggaXQsIGFkZCBpdFxuXHRcdFx0Ly8gb250byB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgZGVja1xuXHRcdFx0dmFyIHNsaWRlU3RhdGUgPSBzbGlkZXNbaW5kZXhdLmdldEF0dHJpYnV0ZSggJ2RhdGEtc3RhdGUnICk7XG5cdFx0XHRpZiggc2xpZGVTdGF0ZSApIHtcblx0XHRcdFx0c3RhdGUgPSBzdGF0ZS5jb25jYXQoIHNsaWRlU3RhdGUuc3BsaXQoICcgJyApICk7XG5cdFx0XHR9XG5cblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHQvLyBTaW5jZSB0aGVyZSBhcmUgbm8gc2xpZGVzIHdlIGNhbid0IGJlIGFueXdoZXJlIGJleW9uZCB0aGVcblx0XHRcdC8vIHplcm90aCBpbmRleFxuXHRcdFx0aW5kZXggPSAwO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbmRleDtcblxuXHR9XG5cblx0LyoqXG5cdCAqIE9wdGltaXphdGlvbiBtZXRob2Q7IGhpZGUgYWxsIHNsaWRlcyB0aGF0IGFyZSBmYXIgYXdheVxuXHQgKiBmcm9tIHRoZSBwcmVzZW50IHNsaWRlLlxuXHQgKi9cblx0ZnVuY3Rpb24gdXBkYXRlU2xpZGVzVmlzaWJpbGl0eSgpIHtcblxuXHRcdC8vIFNlbGVjdCBhbGwgc2xpZGVzIGFuZCBjb252ZXJ0IHRoZSBOb2RlTGlzdCByZXN1bHQgdG9cblx0XHQvLyBhbiBhcnJheVxuXHRcdHZhciBob3Jpem9udGFsU2xpZGVzID0gdG9BcnJheSggZG9tLndyYXBwZXIucXVlcnlTZWxlY3RvckFsbCggSE9SSVpPTlRBTF9TTElERVNfU0VMRUNUT1IgKSApLFxuXHRcdFx0aG9yaXpvbnRhbFNsaWRlc0xlbmd0aCA9IGhvcml6b250YWxTbGlkZXMubGVuZ3RoLFxuXHRcdFx0ZGlzdGFuY2VYLFxuXHRcdFx0ZGlzdGFuY2VZO1xuXG5cdFx0aWYoIGhvcml6b250YWxTbGlkZXNMZW5ndGggJiYgdHlwZW9mIGluZGV4aCAhPT0gJ3VuZGVmaW5lZCcgKSB7XG5cblx0XHRcdC8vIFRoZSBudW1iZXIgb2Ygc3RlcHMgYXdheSBmcm9tIHRoZSBwcmVzZW50IHNsaWRlIHRoYXQgd2lsbFxuXHRcdFx0Ly8gYmUgdmlzaWJsZVxuXHRcdFx0dmFyIHZpZXdEaXN0YW5jZSA9IGlzT3ZlcnZpZXcoKSA/IDEwIDogY29uZmlnLnZpZXdEaXN0YW5jZTtcblxuXHRcdFx0Ly8gTGltaXQgdmlldyBkaXN0YW5jZSBvbiB3ZWFrZXIgZGV2aWNlc1xuXHRcdFx0aWYoIGlzTW9iaWxlRGV2aWNlICkge1xuXHRcdFx0XHR2aWV3RGlzdGFuY2UgPSBpc092ZXJ2aWV3KCkgPyA2IDogMjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQWxsIHNsaWRlcyBuZWVkIHRvIGJlIHZpc2libGUgd2hlbiBleHBvcnRpbmcgdG8gUERGXG5cdFx0XHRpZiggaXNQcmludGluZ1BERigpICkge1xuXHRcdFx0XHR2aWV3RGlzdGFuY2UgPSBOdW1iZXIuTUFYX1ZBTFVFO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IoIHZhciB4ID0gMDsgeCA8IGhvcml6b250YWxTbGlkZXNMZW5ndGg7IHgrKyApIHtcblx0XHRcdFx0dmFyIGhvcml6b250YWxTbGlkZSA9IGhvcml6b250YWxTbGlkZXNbeF07XG5cblx0XHRcdFx0dmFyIHZlcnRpY2FsU2xpZGVzID0gdG9BcnJheSggaG9yaXpvbnRhbFNsaWRlLnF1ZXJ5U2VsZWN0b3JBbGwoICdzZWN0aW9uJyApICksXG5cdFx0XHRcdFx0dmVydGljYWxTbGlkZXNMZW5ndGggPSB2ZXJ0aWNhbFNsaWRlcy5sZW5ndGg7XG5cblx0XHRcdFx0Ly8gRGV0ZXJtaW5lIGhvdyBmYXIgYXdheSB0aGlzIHNsaWRlIGlzIGZyb20gdGhlIHByZXNlbnRcblx0XHRcdFx0ZGlzdGFuY2VYID0gTWF0aC5hYnMoICggaW5kZXhoIHx8IDAgKSAtIHggKSB8fCAwO1xuXG5cdFx0XHRcdC8vIElmIHRoZSBwcmVzZW50YXRpb24gaXMgbG9vcGVkLCBkaXN0YW5jZSBzaG91bGQgbWVhc3VyZVxuXHRcdFx0XHQvLyAxIGJldHdlZW4gdGhlIGZpcnN0IGFuZCBsYXN0IHNsaWRlc1xuXHRcdFx0XHRpZiggY29uZmlnLmxvb3AgKSB7XG5cdFx0XHRcdFx0ZGlzdGFuY2VYID0gTWF0aC5hYnMoICggKCBpbmRleGggfHwgMCApIC0geCApICUgKCBob3Jpem9udGFsU2xpZGVzTGVuZ3RoIC0gdmlld0Rpc3RhbmNlICkgKSB8fCAwO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gU2hvdyB0aGUgaG9yaXpvbnRhbCBzbGlkZSBpZiBpdCdzIHdpdGhpbiB0aGUgdmlldyBkaXN0YW5jZVxuXHRcdFx0XHRpZiggZGlzdGFuY2VYIDwgdmlld0Rpc3RhbmNlICkge1xuXHRcdFx0XHRcdHNob3dTbGlkZSggaG9yaXpvbnRhbFNsaWRlICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0aGlkZVNsaWRlKCBob3Jpem9udGFsU2xpZGUgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKCB2ZXJ0aWNhbFNsaWRlc0xlbmd0aCApIHtcblxuXHRcdFx0XHRcdHZhciBveSA9IGdldFByZXZpb3VzVmVydGljYWxJbmRleCggaG9yaXpvbnRhbFNsaWRlICk7XG5cblx0XHRcdFx0XHRmb3IoIHZhciB5ID0gMDsgeSA8IHZlcnRpY2FsU2xpZGVzTGVuZ3RoOyB5KysgKSB7XG5cdFx0XHRcdFx0XHR2YXIgdmVydGljYWxTbGlkZSA9IHZlcnRpY2FsU2xpZGVzW3ldO1xuXG5cdFx0XHRcdFx0XHRkaXN0YW5jZVkgPSB4ID09PSAoIGluZGV4aCB8fCAwICkgPyBNYXRoLmFicyggKCBpbmRleHYgfHwgMCApIC0geSApIDogTWF0aC5hYnMoIHkgLSBveSApO1xuXG5cdFx0XHRcdFx0XHRpZiggZGlzdGFuY2VYICsgZGlzdGFuY2VZIDwgdmlld0Rpc3RhbmNlICkge1xuXHRcdFx0XHRcdFx0XHRzaG93U2xpZGUoIHZlcnRpY2FsU2xpZGUgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRoaWRlU2xpZGUoIHZlcnRpY2FsU2xpZGUgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgcHJvZ3Jlc3MgYmFyIHRvIHJlZmxlY3QgdGhlIGN1cnJlbnQgc2xpZGUuXG5cdCAqL1xuXHRmdW5jdGlvbiB1cGRhdGVQcm9ncmVzcygpIHtcblxuXHRcdC8vIFVwZGF0ZSBwcm9ncmVzcyBpZiBlbmFibGVkXG5cdFx0aWYoIGNvbmZpZy5wcm9ncmVzcyAmJiBkb20ucHJvZ3Jlc3NiYXIgKSB7XG5cblx0XHRcdGRvbS5wcm9ncmVzc2Jhci5zdHlsZS53aWR0aCA9IGdldFByb2dyZXNzKCkgKiBkb20ud3JhcHBlci5vZmZzZXRXaWR0aCArICdweCc7XG5cblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBzbGlkZSBudW1iZXIgZGl2IHRvIHJlZmxlY3QgdGhlIGN1cnJlbnQgc2xpZGUuXG5cdCAqXG5cdCAqIFNsaWRlIG51bWJlciBmb3JtYXQgY2FuIGJlIGRlZmluZWQgYXMgYSBzdHJpbmcgdXNpbmcgdGhlXG5cdCAqIGZvbGxvd2luZyB2YXJpYWJsZXM6XG5cdCAqICBoOiBjdXJyZW50IHNsaWRlJ3MgaG9yaXpvbnRhbCBpbmRleFxuXHQgKiAgdjogY3VycmVudCBzbGlkZSdzIHZlcnRpY2FsIGluZGV4XG5cdCAqICBjOiBjdXJyZW50IHNsaWRlIGluZGV4IChmbGF0dGVuZWQpXG5cdCAqICB0OiB0b3RhbCBudW1iZXIgb2Ygc2xpZGVzIChmbGF0dGVuZWQpXG5cdCAqL1xuXHRmdW5jdGlvbiB1cGRhdGVTbGlkZU51bWJlcigpIHtcblxuXHRcdC8vIFVwZGF0ZSBzbGlkZSBudW1iZXIgaWYgZW5hYmxlZFxuXHRcdGlmKCBjb25maWcuc2xpZGVOdW1iZXIgJiYgZG9tLnNsaWRlTnVtYmVyKSB7XG5cblx0XHRcdC8vIERlZmF1bHQgdG8gb25seSBzaG93aW5nIHRoZSBjdXJyZW50IHNsaWRlIG51bWJlclxuXHRcdFx0dmFyIGZvcm1hdCA9ICdjJztcblxuXHRcdFx0Ly8gQ2hlY2sgaWYgYSBjdXN0b20gc2xpZGUgbnVtYmVyIGZvcm1hdCBpcyBhdmFpbGFibGVcblx0XHRcdGlmKCB0eXBlb2YgY29uZmlnLnNsaWRlTnVtYmVyID09PSAnc3RyaW5nJyApIHtcblx0XHRcdFx0Zm9ybWF0ID0gY29uZmlnLnNsaWRlTnVtYmVyO1xuXHRcdFx0fVxuXG5cdFx0XHRkb20uc2xpZGVOdW1iZXIuaW5uZXJIVE1MID0gZm9ybWF0LnJlcGxhY2UoIC9oL2csIGluZGV4aCApXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSggL3YvZywgaW5kZXh2IClcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKCAvYy9nLCBnZXRTbGlkZVBhc3RDb3VudCgpICsgMSApXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSggL3QvZywgZ2V0VG90YWxTbGlkZXMoKSApO1xuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIHN0YXRlIG9mIGFsbCBjb250cm9sL25hdmlnYXRpb24gYXJyb3dzLlxuXHQgKi9cblx0ZnVuY3Rpb24gdXBkYXRlQ29udHJvbHMoKSB7XG5cblx0XHR2YXIgcm91dGVzID0gYXZhaWxhYmxlUm91dGVzKCk7XG5cdFx0dmFyIGZyYWdtZW50cyA9IGF2YWlsYWJsZUZyYWdtZW50cygpO1xuXG5cdFx0Ly8gUmVtb3ZlIHRoZSAnZW5hYmxlZCcgY2xhc3MgZnJvbSBhbGwgZGlyZWN0aW9uc1xuXHRcdGRvbS5jb250cm9sc0xlZnQuY29uY2F0KCBkb20uY29udHJvbHNSaWdodCApXG5cdFx0XHRcdFx0XHQuY29uY2F0KCBkb20uY29udHJvbHNVcCApXG5cdFx0XHRcdFx0XHQuY29uY2F0KCBkb20uY29udHJvbHNEb3duIClcblx0XHRcdFx0XHRcdC5jb25jYXQoIGRvbS5jb250cm9sc1ByZXYgKVxuXHRcdFx0XHRcdFx0LmNvbmNhdCggZG9tLmNvbnRyb2xzTmV4dCApLmZvckVhY2goIGZ1bmN0aW9uKCBub2RlICkge1xuXHRcdFx0bm9kZS5jbGFzc0xpc3QucmVtb3ZlKCAnZW5hYmxlZCcgKTtcblx0XHRcdG5vZGUuY2xhc3NMaXN0LnJlbW92ZSggJ2ZyYWdtZW50ZWQnICk7XG5cdFx0fSApO1xuXG5cdFx0Ly8gQWRkIHRoZSAnZW5hYmxlZCcgY2xhc3MgdG8gdGhlIGF2YWlsYWJsZSByb3V0ZXNcblx0XHRpZiggcm91dGVzLmxlZnQgKSBkb20uY29udHJvbHNMZWZ0LmZvckVhY2goIGZ1bmN0aW9uKCBlbCApIHsgZWwuY2xhc3NMaXN0LmFkZCggJ2VuYWJsZWQnICk7XHR9ICk7XG5cdFx0aWYoIHJvdXRlcy5yaWdodCApIGRvbS5jb250cm9sc1JpZ2h0LmZvckVhY2goIGZ1bmN0aW9uKCBlbCApIHsgZWwuY2xhc3NMaXN0LmFkZCggJ2VuYWJsZWQnICk7IH0gKTtcblx0XHRpZiggcm91dGVzLnVwICkgZG9tLmNvbnRyb2xzVXAuZm9yRWFjaCggZnVuY3Rpb24oIGVsICkgeyBlbC5jbGFzc0xpc3QuYWRkKCAnZW5hYmxlZCcgKTtcdH0gKTtcblx0XHRpZiggcm91dGVzLmRvd24gKSBkb20uY29udHJvbHNEb3duLmZvckVhY2goIGZ1bmN0aW9uKCBlbCApIHsgZWwuY2xhc3NMaXN0LmFkZCggJ2VuYWJsZWQnICk7IH0gKTtcblxuXHRcdC8vIFByZXYvbmV4dCBidXR0b25zXG5cdFx0aWYoIHJvdXRlcy5sZWZ0IHx8IHJvdXRlcy51cCApIGRvbS5jb250cm9sc1ByZXYuZm9yRWFjaCggZnVuY3Rpb24oIGVsICkgeyBlbC5jbGFzc0xpc3QuYWRkKCAnZW5hYmxlZCcgKTsgfSApO1xuXHRcdGlmKCByb3V0ZXMucmlnaHQgfHwgcm91dGVzLmRvd24gKSBkb20uY29udHJvbHNOZXh0LmZvckVhY2goIGZ1bmN0aW9uKCBlbCApIHsgZWwuY2xhc3NMaXN0LmFkZCggJ2VuYWJsZWQnICk7IH0gKTtcblxuXHRcdC8vIEhpZ2hsaWdodCBmcmFnbWVudCBkaXJlY3Rpb25zXG5cdFx0aWYoIGN1cnJlbnRTbGlkZSApIHtcblxuXHRcdFx0Ly8gQWx3YXlzIGFwcGx5IGZyYWdtZW50IGRlY29yYXRvciB0byBwcmV2L25leHQgYnV0dG9uc1xuXHRcdFx0aWYoIGZyYWdtZW50cy5wcmV2ICkgZG9tLmNvbnRyb2xzUHJldi5mb3JFYWNoKCBmdW5jdGlvbiggZWwgKSB7IGVsLmNsYXNzTGlzdC5hZGQoICdmcmFnbWVudGVkJywgJ2VuYWJsZWQnICk7IH0gKTtcblx0XHRcdGlmKCBmcmFnbWVudHMubmV4dCApIGRvbS5jb250cm9sc05leHQuZm9yRWFjaCggZnVuY3Rpb24oIGVsICkgeyBlbC5jbGFzc0xpc3QuYWRkKCAnZnJhZ21lbnRlZCcsICdlbmFibGVkJyApOyB9ICk7XG5cblx0XHRcdC8vIEFwcGx5IGZyYWdtZW50IGRlY29yYXRvcnMgdG8gZGlyZWN0aW9uYWwgYnV0dG9ucyBiYXNlZCBvblxuXHRcdFx0Ly8gd2hhdCBzbGlkZSBheGlzIHRoZXkgYXJlIGluXG5cdFx0XHRpZiggaXNWZXJ0aWNhbFNsaWRlKCBjdXJyZW50U2xpZGUgKSApIHtcblx0XHRcdFx0aWYoIGZyYWdtZW50cy5wcmV2ICkgZG9tLmNvbnRyb2xzVXAuZm9yRWFjaCggZnVuY3Rpb24oIGVsICkgeyBlbC5jbGFzc0xpc3QuYWRkKCAnZnJhZ21lbnRlZCcsICdlbmFibGVkJyApOyB9ICk7XG5cdFx0XHRcdGlmKCBmcmFnbWVudHMubmV4dCApIGRvbS5jb250cm9sc0Rvd24uZm9yRWFjaCggZnVuY3Rpb24oIGVsICkgeyBlbC5jbGFzc0xpc3QuYWRkKCAnZnJhZ21lbnRlZCcsICdlbmFibGVkJyApOyB9ICk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYoIGZyYWdtZW50cy5wcmV2ICkgZG9tLmNvbnRyb2xzTGVmdC5mb3JFYWNoKCBmdW5jdGlvbiggZWwgKSB7IGVsLmNsYXNzTGlzdC5hZGQoICdmcmFnbWVudGVkJywgJ2VuYWJsZWQnICk7IH0gKTtcblx0XHRcdFx0aWYoIGZyYWdtZW50cy5uZXh0ICkgZG9tLmNvbnRyb2xzUmlnaHQuZm9yRWFjaCggZnVuY3Rpb24oIGVsICkgeyBlbC5jbGFzc0xpc3QuYWRkKCAnZnJhZ21lbnRlZCcsICdlbmFibGVkJyApOyB9ICk7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBiYWNrZ3JvdW5kIGVsZW1lbnRzIHRvIHJlZmxlY3QgdGhlIGN1cnJlbnRcblx0ICogc2xpZGUuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gaW5jbHVkZUFsbCBJZiB0cnVlLCB0aGUgYmFja2dyb3VuZHMgb2Zcblx0ICogYWxsIHZlcnRpY2FsIHNsaWRlcyAobm90IGp1c3QgdGhlIHByZXNlbnQpIHdpbGwgYmUgdXBkYXRlZC5cblx0ICovXG5cdGZ1bmN0aW9uIHVwZGF0ZUJhY2tncm91bmQoIGluY2x1ZGVBbGwgKSB7XG5cblx0XHR2YXIgY3VycmVudEJhY2tncm91bmQgPSBudWxsO1xuXG5cdFx0Ly8gUmV2ZXJzZSBwYXN0L2Z1dHVyZSBjbGFzc2VzIHdoZW4gaW4gUlRMIG1vZGVcblx0XHR2YXIgaG9yaXpvbnRhbFBhc3QgPSBjb25maWcucnRsID8gJ2Z1dHVyZScgOiAncGFzdCcsXG5cdFx0XHRob3Jpem9udGFsRnV0dXJlID0gY29uZmlnLnJ0bCA/ICdwYXN0JyA6ICdmdXR1cmUnO1xuXG5cdFx0Ly8gVXBkYXRlIHRoZSBjbGFzc2VzIG9mIGFsbCBiYWNrZ3JvdW5kcyB0byBtYXRjaCB0aGVcblx0XHQvLyBzdGF0ZXMgb2YgdGhlaXIgc2xpZGVzIChwYXN0L3ByZXNlbnQvZnV0dXJlKVxuXHRcdHRvQXJyYXkoIGRvbS5iYWNrZ3JvdW5kLmNoaWxkTm9kZXMgKS5mb3JFYWNoKCBmdW5jdGlvbiggYmFja2dyb3VuZGgsIGggKSB7XG5cblx0XHRcdGJhY2tncm91bmRoLmNsYXNzTGlzdC5yZW1vdmUoICdwYXN0JyApO1xuXHRcdFx0YmFja2dyb3VuZGguY2xhc3NMaXN0LnJlbW92ZSggJ3ByZXNlbnQnICk7XG5cdFx0XHRiYWNrZ3JvdW5kaC5jbGFzc0xpc3QucmVtb3ZlKCAnZnV0dXJlJyApO1xuXG5cdFx0XHRpZiggaCA8IGluZGV4aCApIHtcblx0XHRcdFx0YmFja2dyb3VuZGguY2xhc3NMaXN0LmFkZCggaG9yaXpvbnRhbFBhc3QgKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKCBoID4gaW5kZXhoICkge1xuXHRcdFx0XHRiYWNrZ3JvdW5kaC5jbGFzc0xpc3QuYWRkKCBob3Jpem9udGFsRnV0dXJlICk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0YmFja2dyb3VuZGguY2xhc3NMaXN0LmFkZCggJ3ByZXNlbnQnICk7XG5cblx0XHRcdFx0Ly8gU3RvcmUgYSByZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgYmFja2dyb3VuZCBlbGVtZW50XG5cdFx0XHRcdGN1cnJlbnRCYWNrZ3JvdW5kID0gYmFja2dyb3VuZGg7XG5cdFx0XHR9XG5cblx0XHRcdGlmKCBpbmNsdWRlQWxsIHx8IGggPT09IGluZGV4aCApIHtcblx0XHRcdFx0dG9BcnJheSggYmFja2dyb3VuZGgucXVlcnlTZWxlY3RvckFsbCggJy5zbGlkZS1iYWNrZ3JvdW5kJyApICkuZm9yRWFjaCggZnVuY3Rpb24oIGJhY2tncm91bmR2LCB2ICkge1xuXG5cdFx0XHRcdFx0YmFja2dyb3VuZHYuY2xhc3NMaXN0LnJlbW92ZSggJ3Bhc3QnICk7XG5cdFx0XHRcdFx0YmFja2dyb3VuZHYuY2xhc3NMaXN0LnJlbW92ZSggJ3ByZXNlbnQnICk7XG5cdFx0XHRcdFx0YmFja2dyb3VuZHYuY2xhc3NMaXN0LnJlbW92ZSggJ2Z1dHVyZScgKTtcblxuXHRcdFx0XHRcdGlmKCB2IDwgaW5kZXh2ICkge1xuXHRcdFx0XHRcdFx0YmFja2dyb3VuZHYuY2xhc3NMaXN0LmFkZCggJ3Bhc3QnICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKCB2ID4gaW5kZXh2ICkge1xuXHRcdFx0XHRcdFx0YmFja2dyb3VuZHYuY2xhc3NMaXN0LmFkZCggJ2Z1dHVyZScgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRiYWNrZ3JvdW5kdi5jbGFzc0xpc3QuYWRkKCAncHJlc2VudCcgKTtcblxuXHRcdFx0XHRcdFx0Ly8gT25seSBpZiB0aGlzIGlzIHRoZSBwcmVzZW50IGhvcml6b250YWwgYW5kIHZlcnRpY2FsIHNsaWRlXG5cdFx0XHRcdFx0XHRpZiggaCA9PT0gaW5kZXhoICkgY3VycmVudEJhY2tncm91bmQgPSBiYWNrZ3JvdW5kdjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXG5cdFx0fSApO1xuXG5cdFx0Ly8gU3RvcCBhbnkgY3VycmVudGx5IHBsYXlpbmcgdmlkZW8gYmFja2dyb3VuZFxuXHRcdGlmKCBwcmV2aW91c0JhY2tncm91bmQgKSB7XG5cblx0XHRcdHZhciBwcmV2aW91c1ZpZGVvID0gcHJldmlvdXNCYWNrZ3JvdW5kLnF1ZXJ5U2VsZWN0b3IoICd2aWRlbycgKTtcblx0XHRcdGlmKCBwcmV2aW91c1ZpZGVvICkgcHJldmlvdXNWaWRlby5wYXVzZSgpO1xuXG5cdFx0fVxuXG5cdFx0aWYoIGN1cnJlbnRCYWNrZ3JvdW5kICkge1xuXG5cdFx0XHQvLyBTdGFydCB2aWRlbyBwbGF5YmFja1xuXHRcdFx0dmFyIGN1cnJlbnRWaWRlbyA9IGN1cnJlbnRCYWNrZ3JvdW5kLnF1ZXJ5U2VsZWN0b3IoICd2aWRlbycgKTtcblx0XHRcdGlmKCBjdXJyZW50VmlkZW8gKSB7XG5cdFx0XHRcdGN1cnJlbnRWaWRlby5jdXJyZW50VGltZSA9IDA7XG5cdFx0XHRcdGN1cnJlbnRWaWRlby5wbGF5KCk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBiYWNrZ3JvdW5kSW1hZ2VVUkwgPSBjdXJyZW50QmFja2dyb3VuZC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgfHwgJyc7XG5cblx0XHRcdC8vIFJlc3RhcnQgR0lGcyAoZG9lc24ndCB3b3JrIGluIEZpcmVmb3gpXG5cdFx0XHRpZiggL1xcLmdpZi9pLnRlc3QoIGJhY2tncm91bmRJbWFnZVVSTCApICkge1xuXHRcdFx0XHRjdXJyZW50QmFja2dyb3VuZC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAnJztcblx0XHRcdFx0d2luZG93LmdldENvbXB1dGVkU3R5bGUoIGN1cnJlbnRCYWNrZ3JvdW5kICkub3BhY2l0eTtcblx0XHRcdFx0Y3VycmVudEJhY2tncm91bmQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gYmFja2dyb3VuZEltYWdlVVJMO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBEb24ndCB0cmFuc2l0aW9uIGJldHdlZW4gaWRlbnRpY2FsIGJhY2tncm91bmRzLiBUaGlzXG5cdFx0XHQvLyBwcmV2ZW50cyB1bndhbnRlZCBmbGlja2VyLlxuXHRcdFx0dmFyIHByZXZpb3VzQmFja2dyb3VuZEhhc2ggPSBwcmV2aW91c0JhY2tncm91bmQgPyBwcmV2aW91c0JhY2tncm91bmQuZ2V0QXR0cmlidXRlKCAnZGF0YS1iYWNrZ3JvdW5kLWhhc2gnICkgOiBudWxsO1xuXHRcdFx0dmFyIGN1cnJlbnRCYWNrZ3JvdW5kSGFzaCA9IGN1cnJlbnRCYWNrZ3JvdW5kLmdldEF0dHJpYnV0ZSggJ2RhdGEtYmFja2dyb3VuZC1oYXNoJyApO1xuXHRcdFx0aWYoIGN1cnJlbnRCYWNrZ3JvdW5kSGFzaCAmJiBjdXJyZW50QmFja2dyb3VuZEhhc2ggPT09IHByZXZpb3VzQmFja2dyb3VuZEhhc2ggJiYgY3VycmVudEJhY2tncm91bmQgIT09IHByZXZpb3VzQmFja2dyb3VuZCApIHtcblx0XHRcdFx0ZG9tLmJhY2tncm91bmQuY2xhc3NMaXN0LmFkZCggJ25vLXRyYW5zaXRpb24nICk7XG5cdFx0XHR9XG5cblx0XHRcdHByZXZpb3VzQmFja2dyb3VuZCA9IGN1cnJlbnRCYWNrZ3JvdW5kO1xuXG5cdFx0fVxuXG5cdFx0Ly8gSWYgdGhlcmUncyBhIGJhY2tncm91bmQgYnJpZ2h0bmVzcyBmbGFnIGZvciB0aGlzIHNsaWRlLFxuXHRcdC8vIGJ1YmJsZSBpdCB0byB0aGUgLnJldmVhbCBjb250YWluZXJcblx0XHRpZiggY3VycmVudFNsaWRlICkge1xuXHRcdFx0WyAnaGFzLWxpZ2h0LWJhY2tncm91bmQnLCAnaGFzLWRhcmstYmFja2dyb3VuZCcgXS5mb3JFYWNoKCBmdW5jdGlvbiggY2xhc3NUb0J1YmJsZSApIHtcblx0XHRcdFx0aWYoIGN1cnJlbnRTbGlkZS5jbGFzc0xpc3QuY29udGFpbnMoIGNsYXNzVG9CdWJibGUgKSApIHtcblx0XHRcdFx0XHRkb20ud3JhcHBlci5jbGFzc0xpc3QuYWRkKCBjbGFzc1RvQnViYmxlICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0ZG9tLndyYXBwZXIuY2xhc3NMaXN0LnJlbW92ZSggY2xhc3NUb0J1YmJsZSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0fVxuXG5cdFx0Ly8gQWxsb3cgdGhlIGZpcnN0IGJhY2tncm91bmQgdG8gYXBwbHkgd2l0aG91dCB0cmFuc2l0aW9uXG5cdFx0c2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRkb20uYmFja2dyb3VuZC5jbGFzc0xpc3QucmVtb3ZlKCAnbm8tdHJhbnNpdGlvbicgKTtcblx0XHR9LCAxICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGFyYWxsYXggYmFja2dyb3VuZCBiYXNlZFxuXHQgKiBvbiB0aGUgY3VycmVudCBzbGlkZSBpbmRleC5cblx0ICovXG5cdGZ1bmN0aW9uIHVwZGF0ZVBhcmFsbGF4KCkge1xuXG5cdFx0aWYoIGNvbmZpZy5wYXJhbGxheEJhY2tncm91bmRJbWFnZSApIHtcblxuXHRcdFx0dmFyIGhvcml6b250YWxTbGlkZXMgPSBkb20ud3JhcHBlci5xdWVyeVNlbGVjdG9yQWxsKCBIT1JJWk9OVEFMX1NMSURFU19TRUxFQ1RPUiApLFxuXHRcdFx0XHR2ZXJ0aWNhbFNsaWRlcyA9IGRvbS53cmFwcGVyLnF1ZXJ5U2VsZWN0b3JBbGwoIFZFUlRJQ0FMX1NMSURFU19TRUxFQ1RPUiApO1xuXG5cdFx0XHR2YXIgYmFja2dyb3VuZFNpemUgPSBkb20uYmFja2dyb3VuZC5zdHlsZS5iYWNrZ3JvdW5kU2l6ZS5zcGxpdCggJyAnICksXG5cdFx0XHRcdGJhY2tncm91bmRXaWR0aCwgYmFja2dyb3VuZEhlaWdodDtcblxuXHRcdFx0aWYoIGJhY2tncm91bmRTaXplLmxlbmd0aCA9PT0gMSApIHtcblx0XHRcdFx0YmFja2dyb3VuZFdpZHRoID0gYmFja2dyb3VuZEhlaWdodCA9IHBhcnNlSW50KCBiYWNrZ3JvdW5kU2l6ZVswXSwgMTAgKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRiYWNrZ3JvdW5kV2lkdGggPSBwYXJzZUludCggYmFja2dyb3VuZFNpemVbMF0sIDEwICk7XG5cdFx0XHRcdGJhY2tncm91bmRIZWlnaHQgPSBwYXJzZUludCggYmFja2dyb3VuZFNpemVbMV0sIDEwICk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBzbGlkZVdpZHRoID0gZG9tLmJhY2tncm91bmQub2Zmc2V0V2lkdGgsXG5cdFx0XHRcdGhvcml6b250YWxTbGlkZUNvdW50ID0gaG9yaXpvbnRhbFNsaWRlcy5sZW5ndGgsXG5cdFx0XHRcdGhvcml6b250YWxPZmZzZXRNdWx0aXBsaWVyLFxuXHRcdFx0XHRob3Jpem9udGFsT2Zmc2V0O1xuXG5cdFx0XHRpZiggdHlwZW9mIGNvbmZpZy5wYXJhbGxheEJhY2tncm91bmRIb3Jpem9udGFsID09PSAnbnVtYmVyJyApIHtcblx0XHRcdFx0aG9yaXpvbnRhbE9mZnNldE11bHRpcGxpZXIgPSBjb25maWcucGFyYWxsYXhCYWNrZ3JvdW5kSG9yaXpvbnRhbDtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRob3Jpem9udGFsT2Zmc2V0TXVsdGlwbGllciA9ICggYmFja2dyb3VuZFdpZHRoIC0gc2xpZGVXaWR0aCApIC8gKCBob3Jpem9udGFsU2xpZGVDb3VudC0xICk7XG5cdFx0XHR9XG5cblx0XHRcdGhvcml6b250YWxPZmZzZXQgPSBob3Jpem9udGFsT2Zmc2V0TXVsdGlwbGllciAqIGluZGV4aCAqIC0xO1xuXG5cdFx0XHR2YXIgc2xpZGVIZWlnaHQgPSBkb20uYmFja2dyb3VuZC5vZmZzZXRIZWlnaHQsXG5cdFx0XHRcdHZlcnRpY2FsU2xpZGVDb3VudCA9IHZlcnRpY2FsU2xpZGVzLmxlbmd0aCxcblx0XHRcdFx0dmVydGljYWxPZmZzZXRNdWx0aXBsaWVyLFxuXHRcdFx0XHR2ZXJ0aWNhbE9mZnNldDtcblxuXHRcdFx0aWYoIHR5cGVvZiBjb25maWcucGFyYWxsYXhCYWNrZ3JvdW5kVmVydGljYWwgPT09ICdudW1iZXInICkge1xuXHRcdFx0XHR2ZXJ0aWNhbE9mZnNldE11bHRpcGxpZXIgPSBjb25maWcucGFyYWxsYXhCYWNrZ3JvdW5kVmVydGljYWw7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dmVydGljYWxPZmZzZXRNdWx0aXBsaWVyID0gKCBiYWNrZ3JvdW5kSGVpZ2h0IC0gc2xpZGVIZWlnaHQgKSAvICggdmVydGljYWxTbGlkZUNvdW50LTEgKTtcblx0XHRcdH1cblxuXHRcdFx0dmVydGljYWxPZmZzZXQgPSB2ZXJ0aWNhbFNsaWRlQ291bnQgPiAwID8gIHZlcnRpY2FsT2Zmc2V0TXVsdGlwbGllciAqIGluZGV4diAqIDEgOiAwO1xuXG5cdFx0XHRkb20uYmFja2dyb3VuZC5zdHlsZS5iYWNrZ3JvdW5kUG9zaXRpb24gPSBob3Jpem9udGFsT2Zmc2V0ICsgJ3B4ICcgKyAtdmVydGljYWxPZmZzZXQgKyAncHgnO1xuXG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gdGhlIGdpdmVuIHNsaWRlIGlzIHdpdGhpbiB0aGUgY29uZmlndXJlZCB2aWV3XG5cdCAqIGRpc3RhbmNlLiBTaG93cyB0aGUgc2xpZGUgZWxlbWVudCBhbmQgbG9hZHMgYW55IGNvbnRlbnRcblx0ICogdGhhdCBpcyBzZXQgdG8gbG9hZCBsYXppbHkgKGRhdGEtc3JjKS5cblx0ICovXG5cdGZ1bmN0aW9uIHNob3dTbGlkZSggc2xpZGUgKSB7XG5cblx0XHQvLyBTaG93IHRoZSBzbGlkZSBlbGVtZW50XG5cdFx0c2xpZGUuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cblx0XHQvLyBNZWRpYSBlbGVtZW50cyB3aXRoIGRhdGEtc3JjIGF0dHJpYnV0ZXNcblx0XHR0b0FycmF5KCBzbGlkZS5xdWVyeVNlbGVjdG9yQWxsKCAnaW1nW2RhdGEtc3JjXSwgdmlkZW9bZGF0YS1zcmNdLCBhdWRpb1tkYXRhLXNyY10nICkgKS5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCApIHtcblx0XHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlKCAnc3JjJywgZWxlbWVudC5nZXRBdHRyaWJ1dGUoICdkYXRhLXNyYycgKSApO1xuXHRcdFx0ZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoICdkYXRhLXNyYycgKTtcblx0XHR9ICk7XG5cblx0XHQvLyBNZWRpYSBlbGVtZW50cyB3aXRoIDxzb3VyY2U+IGNoaWxkcmVuXG5cdFx0dG9BcnJheSggc2xpZGUucXVlcnlTZWxlY3RvckFsbCggJ3ZpZGVvLCBhdWRpbycgKSApLmZvckVhY2goIGZ1bmN0aW9uKCBtZWRpYSApIHtcblx0XHRcdHZhciBzb3VyY2VzID0gMDtcblxuXHRcdFx0dG9BcnJheSggbWVkaWEucXVlcnlTZWxlY3RvckFsbCggJ3NvdXJjZVtkYXRhLXNyY10nICkgKS5mb3JFYWNoKCBmdW5jdGlvbiggc291cmNlICkge1xuXHRcdFx0XHRzb3VyY2Uuc2V0QXR0cmlidXRlKCAnc3JjJywgc291cmNlLmdldEF0dHJpYnV0ZSggJ2RhdGEtc3JjJyApICk7XG5cdFx0XHRcdHNvdXJjZS5yZW1vdmVBdHRyaWJ1dGUoICdkYXRhLXNyYycgKTtcblx0XHRcdFx0c291cmNlcyArPSAxO1xuXHRcdFx0fSApO1xuXG5cdFx0XHQvLyBJZiB3ZSByZXdyb3RlIHNvdXJjZXMgZm9yIHRoaXMgdmlkZW8vYXVkaW8gZWxlbWVudCwgd2UgbmVlZFxuXHRcdFx0Ly8gdG8gbWFudWFsbHkgdGVsbCBpdCB0byBsb2FkIGZyb20gaXRzIG5ldyBvcmlnaW5cblx0XHRcdGlmKCBzb3VyY2VzID4gMCApIHtcblx0XHRcdFx0bWVkaWEubG9hZCgpO1xuXHRcdFx0fVxuXHRcdH0gKTtcblxuXG5cdFx0Ly8gU2hvdyB0aGUgY29ycmVzcG9uZGluZyBiYWNrZ3JvdW5kIGVsZW1lbnRcblx0XHR2YXIgaW5kaWNlcyA9IGdldEluZGljZXMoIHNsaWRlICk7XG5cdFx0dmFyIGJhY2tncm91bmQgPSBnZXRTbGlkZUJhY2tncm91bmQoIGluZGljZXMuaCwgaW5kaWNlcy52ICk7XG5cdFx0aWYoIGJhY2tncm91bmQgKSB7XG5cdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG5cdFx0XHQvLyBJZiB0aGUgYmFja2dyb3VuZCBjb250YWlucyBtZWRpYSwgbG9hZCBpdFxuXHRcdFx0aWYoIGJhY2tncm91bmQuaGFzQXR0cmlidXRlKCAnZGF0YS1sb2FkZWQnICkgPT09IGZhbHNlICkge1xuXHRcdFx0XHRiYWNrZ3JvdW5kLnNldEF0dHJpYnV0ZSggJ2RhdGEtbG9hZGVkJywgJ3RydWUnICk7XG5cblx0XHRcdFx0dmFyIGJhY2tncm91bmRJbWFnZSA9IHNsaWRlLmdldEF0dHJpYnV0ZSggJ2RhdGEtYmFja2dyb3VuZC1pbWFnZScgKSxcblx0XHRcdFx0XHRiYWNrZ3JvdW5kVmlkZW8gPSBzbGlkZS5nZXRBdHRyaWJ1dGUoICdkYXRhLWJhY2tncm91bmQtdmlkZW8nICksXG5cdFx0XHRcdFx0YmFja2dyb3VuZFZpZGVvTG9vcCA9IHNsaWRlLmhhc0F0dHJpYnV0ZSggJ2RhdGEtYmFja2dyb3VuZC12aWRlby1sb29wJyApLFxuXHRcdFx0XHRcdGJhY2tncm91bmRJZnJhbWUgPSBzbGlkZS5nZXRBdHRyaWJ1dGUoICdkYXRhLWJhY2tncm91bmQtaWZyYW1lJyApO1xuXG5cdFx0XHRcdC8vIEltYWdlc1xuXHRcdFx0XHRpZiggYmFja2dyb3VuZEltYWdlICkge1xuXHRcdFx0XHRcdGJhY2tncm91bmQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybCgnKyBiYWNrZ3JvdW5kSW1hZ2UgKycpJztcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBWaWRlb3Ncblx0XHRcdFx0ZWxzZSBpZiAoIGJhY2tncm91bmRWaWRlbyAmJiAhaXNTcGVha2VyTm90ZXMoKSApIHtcblx0XHRcdFx0XHR2YXIgdmlkZW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAndmlkZW8nICk7XG5cblx0XHRcdFx0XHRpZiggYmFja2dyb3VuZFZpZGVvTG9vcCApIHtcblx0XHRcdFx0XHRcdHZpZGVvLnNldEF0dHJpYnV0ZSggJ2xvb3AnLCAnJyApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIFN1cHBvcnQgY29tbWEgc2VwYXJhdGVkIGxpc3RzIG9mIHZpZGVvIHNvdXJjZXNcblx0XHRcdFx0XHRiYWNrZ3JvdW5kVmlkZW8uc3BsaXQoICcsJyApLmZvckVhY2goIGZ1bmN0aW9uKCBzb3VyY2UgKSB7XG5cdFx0XHRcdFx0XHR2aWRlby5pbm5lckhUTUwgKz0gJzxzb3VyY2Ugc3JjPVwiJysgc291cmNlICsnXCI+Jztcblx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0XHRiYWNrZ3JvdW5kLmFwcGVuZENoaWxkKCB2aWRlbyApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIElmcmFtZXNcblx0XHRcdFx0ZWxzZSBpZiggYmFja2dyb3VuZElmcmFtZSApIHtcblx0XHRcdFx0XHR2YXIgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lmcmFtZScgKTtcblx0XHRcdFx0XHRcdGlmcmFtZS5zZXRBdHRyaWJ1dGUoICdzcmMnLCBiYWNrZ3JvdW5kSWZyYW1lICk7XG5cdFx0XHRcdFx0XHRpZnJhbWUuc3R5bGUud2lkdGggID0gJzEwMCUnO1xuXHRcdFx0XHRcdFx0aWZyYW1lLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcblx0XHRcdFx0XHRcdGlmcmFtZS5zdHlsZS5tYXhIZWlnaHQgPSAnMTAwJSc7XG5cdFx0XHRcdFx0XHRpZnJhbWUuc3R5bGUubWF4V2lkdGggPSAnMTAwJSc7XG5cblx0XHRcdFx0XHRiYWNrZ3JvdW5kLmFwcGVuZENoaWxkKCBpZnJhbWUgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIHRoZSBnaXZlbiBzbGlkZSBpcyBtb3ZlZCBvdXRzaWRlIG9mIHRoZVxuXHQgKiBjb25maWd1cmVkIHZpZXcgZGlzdGFuY2UuXG5cdCAqL1xuXHRmdW5jdGlvbiBoaWRlU2xpZGUoIHNsaWRlICkge1xuXG5cdFx0Ly8gSGlkZSB0aGUgc2xpZGUgZWxlbWVudFxuXHRcdHNsaWRlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cblx0XHQvLyBIaWRlIHRoZSBjb3JyZXNwb25kaW5nIGJhY2tncm91bmQgZWxlbWVudFxuXHRcdHZhciBpbmRpY2VzID0gZ2V0SW5kaWNlcyggc2xpZGUgKTtcblx0XHR2YXIgYmFja2dyb3VuZCA9IGdldFNsaWRlQmFja2dyb3VuZCggaW5kaWNlcy5oLCBpbmRpY2VzLnYgKTtcblx0XHRpZiggYmFja2dyb3VuZCApIHtcblx0XHRcdGJhY2tncm91bmQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgd2hhdCBhdmFpbGFibGUgcm91dGVzIHRoZXJlIGFyZSBmb3IgbmF2aWdhdGlvbi5cblx0ICpcblx0ICogQHJldHVybiB7T2JqZWN0fSBjb250YWluaW5nIGZvdXIgYm9vbGVhbnM6IGxlZnQvcmlnaHQvdXAvZG93blxuXHQgKi9cblx0ZnVuY3Rpb24gYXZhaWxhYmxlUm91dGVzKCkge1xuXG5cdFx0dmFyIGhvcml6b250YWxTbGlkZXMgPSBkb20ud3JhcHBlci5xdWVyeVNlbGVjdG9yQWxsKCBIT1JJWk9OVEFMX1NMSURFU19TRUxFQ1RPUiApLFxuXHRcdFx0dmVydGljYWxTbGlkZXMgPSBkb20ud3JhcHBlci5xdWVyeVNlbGVjdG9yQWxsKCBWRVJUSUNBTF9TTElERVNfU0VMRUNUT1IgKTtcblxuXHRcdHZhciByb3V0ZXMgPSB7XG5cdFx0XHRsZWZ0OiBpbmRleGggPiAwIHx8IGNvbmZpZy5sb29wLFxuXHRcdFx0cmlnaHQ6IGluZGV4aCA8IGhvcml6b250YWxTbGlkZXMubGVuZ3RoIC0gMSB8fCBjb25maWcubG9vcCxcblx0XHRcdHVwOiBpbmRleHYgPiAwLFxuXHRcdFx0ZG93bjogaW5kZXh2IDwgdmVydGljYWxTbGlkZXMubGVuZ3RoIC0gMVxuXHRcdH07XG5cblx0XHQvLyByZXZlcnNlIGhvcml6b250YWwgY29udHJvbHMgZm9yIHJ0bFxuXHRcdGlmKCBjb25maWcucnRsICkge1xuXHRcdFx0dmFyIGxlZnQgPSByb3V0ZXMubGVmdDtcblx0XHRcdHJvdXRlcy5sZWZ0ID0gcm91dGVzLnJpZ2h0O1xuXHRcdFx0cm91dGVzLnJpZ2h0ID0gbGVmdDtcblx0XHR9XG5cblx0XHRyZXR1cm4gcm91dGVzO1xuXG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgYXZhaWxhYmxlIGZyYWdtZW50XG5cdCAqIGRpcmVjdGlvbnMuXG5cdCAqXG5cdCAqIEByZXR1cm4ge09iamVjdH0gdHdvIGJvb2xlYW4gcHJvcGVydGllczogcHJldi9uZXh0XG5cdCAqL1xuXHRmdW5jdGlvbiBhdmFpbGFibGVGcmFnbWVudHMoKSB7XG5cblx0XHRpZiggY3VycmVudFNsaWRlICYmIGNvbmZpZy5mcmFnbWVudHMgKSB7XG5cdFx0XHR2YXIgZnJhZ21lbnRzID0gY3VycmVudFNsaWRlLnF1ZXJ5U2VsZWN0b3JBbGwoICcuZnJhZ21lbnQnICk7XG5cdFx0XHR2YXIgaGlkZGVuRnJhZ21lbnRzID0gY3VycmVudFNsaWRlLnF1ZXJ5U2VsZWN0b3JBbGwoICcuZnJhZ21lbnQ6bm90KC52aXNpYmxlKScgKTtcblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0cHJldjogZnJhZ21lbnRzLmxlbmd0aCAtIGhpZGRlbkZyYWdtZW50cy5sZW5ndGggPiAwLFxuXHRcdFx0XHRuZXh0OiAhIWhpZGRlbkZyYWdtZW50cy5sZW5ndGhcblx0XHRcdH07XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuIHsgcHJldjogZmFsc2UsIG5leHQ6IGZhbHNlIH07XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogRW5mb3JjZXMgb3JpZ2luLXNwZWNpZmljIGZvcm1hdCBydWxlcyBmb3IgZW1iZWRkZWQgbWVkaWEuXG5cdCAqL1xuXHRmdW5jdGlvbiBmb3JtYXRFbWJlZGRlZENvbnRlbnQoKSB7XG5cblx0XHR2YXIgX2FwcGVuZFBhcmFtVG9JZnJhbWVTb3VyY2UgPSBmdW5jdGlvbiggc291cmNlQXR0cmlidXRlLCBzb3VyY2VVUkwsIHBhcmFtICkge1xuXHRcdFx0dG9BcnJheSggZG9tLnNsaWRlcy5xdWVyeVNlbGVjdG9yQWxsKCAnaWZyYW1lWycrIHNvdXJjZUF0dHJpYnV0ZSArJyo9XCInKyBzb3VyY2VVUkwgKydcIl0nICkgKS5mb3JFYWNoKCBmdW5jdGlvbiggZWwgKSB7XG5cdFx0XHRcdHZhciBzcmMgPSBlbC5nZXRBdHRyaWJ1dGUoIHNvdXJjZUF0dHJpYnV0ZSApO1xuXHRcdFx0XHRpZiggc3JjICYmIHNyYy5pbmRleE9mKCBwYXJhbSApID09PSAtMSApIHtcblx0XHRcdFx0XHRlbC5zZXRBdHRyaWJ1dGUoIHNvdXJjZUF0dHJpYnV0ZSwgc3JjICsgKCAhL1xcPy8udGVzdCggc3JjICkgPyAnPycgOiAnJicgKSArIHBhcmFtICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHQvLyBZb3VUdWJlIGZyYW1lcyBtdXN0IGluY2x1ZGUgXCI/ZW5hYmxlanNhcGk9MVwiXG5cdFx0X2FwcGVuZFBhcmFtVG9JZnJhbWVTb3VyY2UoICdzcmMnLCAneW91dHViZS5jb20vZW1iZWQvJywgJ2VuYWJsZWpzYXBpPTEnICk7XG5cdFx0X2FwcGVuZFBhcmFtVG9JZnJhbWVTb3VyY2UoICdkYXRhLXNyYycsICd5b3V0dWJlLmNvbS9lbWJlZC8nLCAnZW5hYmxlanNhcGk9MScgKTtcblxuXHRcdC8vIFZpbWVvIGZyYW1lcyBtdXN0IGluY2x1ZGUgXCI/YXBpPTFcIlxuXHRcdF9hcHBlbmRQYXJhbVRvSWZyYW1lU291cmNlKCAnc3JjJywgJ3BsYXllci52aW1lby5jb20vJywgJ2FwaT0xJyApO1xuXHRcdF9hcHBlbmRQYXJhbVRvSWZyYW1lU291cmNlKCAnZGF0YS1zcmMnLCAncGxheWVyLnZpbWVvLmNvbS8nLCAnYXBpPTEnICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBTdGFydCBwbGF5YmFjayBvZiBhbnkgZW1iZWRkZWQgY29udGVudCBpbnNpZGUgb2Zcblx0ICogdGhlIHRhcmdldGVkIHNsaWRlLlxuXHQgKi9cblx0ZnVuY3Rpb24gc3RhcnRFbWJlZGRlZENvbnRlbnQoIHNsaWRlICkge1xuXG5cdFx0aWYoIHNsaWRlICYmICFpc1NwZWFrZXJOb3RlcygpICkge1xuXHRcdFx0Ly8gUmVzdGFydCBHSUZzXG5cdFx0XHR0b0FycmF5KCBzbGlkZS5xdWVyeVNlbGVjdG9yQWxsKCAnaW1nW3NyYyQ9XCIuZ2lmXCJdJyApICkuZm9yRWFjaCggZnVuY3Rpb24oIGVsICkge1xuXHRcdFx0XHQvLyBTZXR0aW5nIHRoZSBzYW1lIHVuY2hhbmdlZCBzb3VyY2UgbGlrZSB0aGlzIHdhcyBjb25maXJtZWRcblx0XHRcdFx0Ly8gdG8gd29yayBpbiBDaHJvbWUsIEZGICYgU2FmYXJpXG5cdFx0XHRcdGVsLnNldEF0dHJpYnV0ZSggJ3NyYycsIGVsLmdldEF0dHJpYnV0ZSggJ3NyYycgKSApO1xuXHRcdFx0fSApO1xuXG5cdFx0XHQvLyBIVE1MNSBtZWRpYSBlbGVtZW50c1xuXHRcdFx0dG9BcnJheSggc2xpZGUucXVlcnlTZWxlY3RvckFsbCggJ3ZpZGVvLCBhdWRpbycgKSApLmZvckVhY2goIGZ1bmN0aW9uKCBlbCApIHtcblx0XHRcdFx0aWYoIGVsLmhhc0F0dHJpYnV0ZSggJ2RhdGEtYXV0b3BsYXknICkgJiYgdHlwZW9mIGVsLnBsYXkgPT09ICdmdW5jdGlvbicgKSB7XG5cdFx0XHRcdFx0ZWwucGxheSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cblx0XHRcdC8vIE5vcm1hbCBpZnJhbWVzXG5cdFx0XHR0b0FycmF5KCBzbGlkZS5xdWVyeVNlbGVjdG9yQWxsKCAnaWZyYW1lW3NyY10nICkgKS5mb3JFYWNoKCBmdW5jdGlvbiggZWwgKSB7XG5cdFx0XHRcdHN0YXJ0RW1iZWRkZWRJZnJhbWUoIHsgdGFyZ2V0OiBlbCB9ICk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdC8vIExhenkgbG9hZGluZyBpZnJhbWVzXG5cdFx0XHR0b0FycmF5KCBzbGlkZS5xdWVyeVNlbGVjdG9yQWxsKCAnaWZyYW1lW2RhdGEtc3JjXScgKSApLmZvckVhY2goIGZ1bmN0aW9uKCBlbCApIHtcblx0XHRcdFx0aWYoIGVsLmdldEF0dHJpYnV0ZSggJ3NyYycgKSAhPT0gZWwuZ2V0QXR0cmlidXRlKCAnZGF0YS1zcmMnICkgKSB7XG5cdFx0XHRcdFx0ZWwucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCBzdGFydEVtYmVkZGVkSWZyYW1lICk7IC8vIHJlbW92ZSBmaXJzdCB0byBhdm9pZCBkdXBlc1xuXHRcdFx0XHRcdGVsLmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgc3RhcnRFbWJlZGRlZElmcmFtZSApO1xuXHRcdFx0XHRcdGVsLnNldEF0dHJpYnV0ZSggJ3NyYycsIGVsLmdldEF0dHJpYnV0ZSggJ2RhdGEtc3JjJyApICk7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBcIlN0YXJ0c1wiIHRoZSBjb250ZW50IG9mIGFuIGVtYmVkZGVkIGlmcmFtZSB1c2luZyB0aGVcblx0ICogcG9zdG1lc3NhZ2UgQVBJLlxuXHQgKi9cblx0ZnVuY3Rpb24gc3RhcnRFbWJlZGRlZElmcmFtZSggZXZlbnQgKSB7XG5cblx0XHR2YXIgaWZyYW1lID0gZXZlbnQudGFyZ2V0O1xuXG5cdFx0Ly8gWW91VHViZSBwb3N0TWVzc2FnZSBBUElcblx0XHRpZiggL3lvdXR1YmVcXC5jb21cXC9lbWJlZFxcLy8udGVzdCggaWZyYW1lLmdldEF0dHJpYnV0ZSggJ3NyYycgKSApICYmIGlmcmFtZS5oYXNBdHRyaWJ1dGUoICdkYXRhLWF1dG9wbGF5JyApICkge1xuXHRcdFx0aWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoICd7XCJldmVudFwiOlwiY29tbWFuZFwiLFwiZnVuY1wiOlwicGxheVZpZGVvXCIsXCJhcmdzXCI6XCJcIn0nLCAnKicgKTtcblx0XHR9XG5cdFx0Ly8gVmltZW8gcG9zdE1lc3NhZ2UgQVBJXG5cdFx0ZWxzZSBpZiggL3BsYXllclxcLnZpbWVvXFwuY29tXFwvLy50ZXN0KCBpZnJhbWUuZ2V0QXR0cmlidXRlKCAnc3JjJyApICkgJiYgaWZyYW1lLmhhc0F0dHJpYnV0ZSggJ2RhdGEtYXV0b3BsYXknICkgKSB7XG5cdFx0XHRpZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSggJ3tcIm1ldGhvZFwiOlwicGxheVwifScsICcqJyApO1xuXHRcdH1cblx0XHQvLyBHZW5lcmljIHBvc3RNZXNzYWdlIEFQSVxuXHRcdGVsc2Uge1xuXHRcdFx0aWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoICdzbGlkZTpzdGFydCcsICcqJyApO1xuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIFN0b3AgcGxheWJhY2sgb2YgYW55IGVtYmVkZGVkIGNvbnRlbnQgaW5zaWRlIG9mXG5cdCAqIHRoZSB0YXJnZXRlZCBzbGlkZS5cblx0ICovXG5cdGZ1bmN0aW9uIHN0b3BFbWJlZGRlZENvbnRlbnQoIHNsaWRlICkge1xuXG5cdFx0aWYoIHNsaWRlICYmIHNsaWRlLnBhcmVudE5vZGUgKSB7XG5cdFx0XHQvLyBIVE1MNSBtZWRpYSBlbGVtZW50c1xuXHRcdFx0dG9BcnJheSggc2xpZGUucXVlcnlTZWxlY3RvckFsbCggJ3ZpZGVvLCBhdWRpbycgKSApLmZvckVhY2goIGZ1bmN0aW9uKCBlbCApIHtcblx0XHRcdFx0aWYoICFlbC5oYXNBdHRyaWJ1dGUoICdkYXRhLWlnbm9yZScgKSAmJiB0eXBlb2YgZWwucGF1c2UgPT09ICdmdW5jdGlvbicgKSB7XG5cdFx0XHRcdFx0ZWwucGF1c2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXG5cdFx0XHQvLyBHZW5lcmljIHBvc3RNZXNzYWdlIEFQSSBmb3Igbm9uLWxhenkgbG9hZGVkIGlmcmFtZXNcblx0XHRcdHRvQXJyYXkoIHNsaWRlLnF1ZXJ5U2VsZWN0b3JBbGwoICdpZnJhbWUnICkgKS5mb3JFYWNoKCBmdW5jdGlvbiggZWwgKSB7XG5cdFx0XHRcdGVsLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoICdzbGlkZTpzdG9wJywgJyonICk7XG5cdFx0XHRcdGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgc3RhcnRFbWJlZGRlZElmcmFtZSApO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIFlvdVR1YmUgcG9zdE1lc3NhZ2UgQVBJXG5cdFx0XHR0b0FycmF5KCBzbGlkZS5xdWVyeVNlbGVjdG9yQWxsKCAnaWZyYW1lW3NyYyo9XCJ5b3V0dWJlLmNvbS9lbWJlZC9cIl0nICkgKS5mb3JFYWNoKCBmdW5jdGlvbiggZWwgKSB7XG5cdFx0XHRcdGlmKCAhZWwuaGFzQXR0cmlidXRlKCAnZGF0YS1pZ25vcmUnICkgJiYgdHlwZW9mIGVsLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UgPT09ICdmdW5jdGlvbicgKSB7XG5cdFx0XHRcdFx0ZWwuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSggJ3tcImV2ZW50XCI6XCJjb21tYW5kXCIsXCJmdW5jXCI6XCJwYXVzZVZpZGVvXCIsXCJhcmdzXCI6XCJcIn0nLCAnKicgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIFZpbWVvIHBvc3RNZXNzYWdlIEFQSVxuXHRcdFx0dG9BcnJheSggc2xpZGUucXVlcnlTZWxlY3RvckFsbCggJ2lmcmFtZVtzcmMqPVwicGxheWVyLnZpbWVvLmNvbS9cIl0nICkgKS5mb3JFYWNoKCBmdW5jdGlvbiggZWwgKSB7XG5cdFx0XHRcdGlmKCAhZWwuaGFzQXR0cmlidXRlKCAnZGF0YS1pZ25vcmUnICkgJiYgdHlwZW9mIGVsLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UgPT09ICdmdW5jdGlvbicgKSB7XG5cdFx0XHRcdFx0ZWwuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSggJ3tcIm1ldGhvZFwiOlwicGF1c2VcIn0nLCAnKicgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIExhenkgbG9hZGluZyBpZnJhbWVzXG5cdFx0XHR0b0FycmF5KCBzbGlkZS5xdWVyeVNlbGVjdG9yQWxsKCAnaWZyYW1lW2RhdGEtc3JjXScgKSApLmZvckVhY2goIGZ1bmN0aW9uKCBlbCApIHtcblx0XHRcdFx0Ly8gT25seSByZW1vdmluZyB0aGUgc3JjIGRvZXNuJ3QgYWN0dWFsbHkgdW5sb2FkIHRoZSBmcmFtZVxuXHRcdFx0XHQvLyBpbiBhbGwgYnJvd3NlcnMgKEZpcmVmb3gpIHNvIHdlIHNldCBpdCB0byBibGFuayBmaXJzdFxuXHRcdFx0XHRlbC5zZXRBdHRyaWJ1dGUoICdzcmMnLCAnYWJvdXQ6YmxhbmsnICk7XG5cdFx0XHRcdGVsLnJlbW92ZUF0dHJpYnV0ZSggJ3NyYycgKTtcblx0XHRcdH0gKTtcblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgcGFzdCBzbGlkZXMuIFRoaXMgY2FuIGJlIHVzZWQgYXMgYSBnbG9iYWxcblx0ICogZmxhdHRlbmVkIGluZGV4IGZvciBzbGlkZXMuXG5cdCAqL1xuXHRmdW5jdGlvbiBnZXRTbGlkZVBhc3RDb3VudCgpIHtcblxuXHRcdHZhciBob3Jpem9udGFsU2xpZGVzID0gdG9BcnJheSggZG9tLndyYXBwZXIucXVlcnlTZWxlY3RvckFsbCggSE9SSVpPTlRBTF9TTElERVNfU0VMRUNUT1IgKSApO1xuXG5cdFx0Ly8gVGhlIG51bWJlciBvZiBwYXN0IHNsaWRlc1xuXHRcdHZhciBwYXN0Q291bnQgPSAwO1xuXG5cdFx0Ly8gU3RlcCB0aHJvdWdoIGFsbCBzbGlkZXMgYW5kIGNvdW50IHRoZSBwYXN0IG9uZXNcblx0XHRtYWluTG9vcDogZm9yKCB2YXIgaSA9IDA7IGkgPCBob3Jpem9udGFsU2xpZGVzLmxlbmd0aDsgaSsrICkge1xuXG5cdFx0XHR2YXIgaG9yaXpvbnRhbFNsaWRlID0gaG9yaXpvbnRhbFNsaWRlc1tpXTtcblx0XHRcdHZhciB2ZXJ0aWNhbFNsaWRlcyA9IHRvQXJyYXkoIGhvcml6b250YWxTbGlkZS5xdWVyeVNlbGVjdG9yQWxsKCAnc2VjdGlvbicgKSApO1xuXG5cdFx0XHRmb3IoIHZhciBqID0gMDsgaiA8IHZlcnRpY2FsU2xpZGVzLmxlbmd0aDsgaisrICkge1xuXG5cdFx0XHRcdC8vIFN0b3AgYXMgc29vbiBhcyB3ZSBhcnJpdmUgYXQgdGhlIHByZXNlbnRcblx0XHRcdFx0aWYoIHZlcnRpY2FsU2xpZGVzW2pdLmNsYXNzTGlzdC5jb250YWlucyggJ3ByZXNlbnQnICkgKSB7XG5cdFx0XHRcdFx0YnJlYWsgbWFpbkxvb3A7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRwYXN0Q291bnQrKztcblxuXHRcdFx0fVxuXG5cdFx0XHQvLyBTdG9wIGFzIHNvb24gYXMgd2UgYXJyaXZlIGF0IHRoZSBwcmVzZW50XG5cdFx0XHRpZiggaG9yaXpvbnRhbFNsaWRlLmNsYXNzTGlzdC5jb250YWlucyggJ3ByZXNlbnQnICkgKSB7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBEb24ndCBjb3VudCB0aGUgd3JhcHBpbmcgc2VjdGlvbiBmb3IgdmVydGljYWwgc2xpZGVzXG5cdFx0XHRpZiggaG9yaXpvbnRhbFNsaWRlLmNsYXNzTGlzdC5jb250YWlucyggJ3N0YWNrJyApID09PSBmYWxzZSApIHtcblx0XHRcdFx0cGFzdENvdW50Kys7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gcGFzdENvdW50O1xuXG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIHZhbHVlIHJhbmdpbmcgZnJvbSAwLTEgdGhhdCByZXByZXNlbnRzXG5cdCAqIGhvdyBmYXIgaW50byB0aGUgcHJlc2VudGF0aW9uIHdlIGhhdmUgbmF2aWdhdGVkLlxuXHQgKi9cblx0ZnVuY3Rpb24gZ2V0UHJvZ3Jlc3MoKSB7XG5cblx0XHQvLyBUaGUgbnVtYmVyIG9mIHBhc3QgYW5kIHRvdGFsIHNsaWRlc1xuXHRcdHZhciB0b3RhbENvdW50ID0gZ2V0VG90YWxTbGlkZXMoKTtcblx0XHR2YXIgcGFzdENvdW50ID0gZ2V0U2xpZGVQYXN0Q291bnQoKTtcblxuXHRcdGlmKCBjdXJyZW50U2xpZGUgKSB7XG5cblx0XHRcdHZhciBhbGxGcmFnbWVudHMgPSBjdXJyZW50U2xpZGUucXVlcnlTZWxlY3RvckFsbCggJy5mcmFnbWVudCcgKTtcblxuXHRcdFx0Ly8gSWYgdGhlcmUgYXJlIGZyYWdtZW50cyBpbiB0aGUgY3VycmVudCBzbGlkZSB0aG9zZSBzaG91bGQgYmVcblx0XHRcdC8vIGFjY291bnRlZCBmb3IgaW4gdGhlIHByb2dyZXNzLlxuXHRcdFx0aWYoIGFsbEZyYWdtZW50cy5sZW5ndGggPiAwICkge1xuXHRcdFx0XHR2YXIgdmlzaWJsZUZyYWdtZW50cyA9IGN1cnJlbnRTbGlkZS5xdWVyeVNlbGVjdG9yQWxsKCAnLmZyYWdtZW50LnZpc2libGUnICk7XG5cblx0XHRcdFx0Ly8gVGhpcyB2YWx1ZSByZXByZXNlbnRzIGhvdyBiaWcgYSBwb3J0aW9uIG9mIHRoZSBzbGlkZSBwcm9ncmVzc1xuXHRcdFx0XHQvLyB0aGF0IGlzIG1hZGUgdXAgYnkgaXRzIGZyYWdtZW50cyAoMC0xKVxuXHRcdFx0XHR2YXIgZnJhZ21lbnRXZWlnaHQgPSAwLjk7XG5cblx0XHRcdFx0Ly8gQWRkIGZyYWdtZW50IHByb2dyZXNzIHRvIHRoZSBwYXN0IHNsaWRlIGNvdW50XG5cdFx0XHRcdHBhc3RDb3VudCArPSAoIHZpc2libGVGcmFnbWVudHMubGVuZ3RoIC8gYWxsRnJhZ21lbnRzLmxlbmd0aCApICogZnJhZ21lbnRXZWlnaHQ7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gcGFzdENvdW50IC8gKCB0b3RhbENvdW50IC0gMSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoaXMgcHJlc2VudGF0aW9uIGlzIHJ1bm5pbmcgaW5zaWRlIG9mIHRoZVxuXHQgKiBzcGVha2VyIG5vdGVzIHdpbmRvdy5cblx0ICovXG5cdGZ1bmN0aW9uIGlzU3BlYWtlck5vdGVzKCkge1xuXG5cdFx0cmV0dXJuICEhd2luZG93LmxvY2F0aW9uLnNlYXJjaC5tYXRjaCggL3JlY2VpdmVyL2dpICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkcyB0aGUgY3VycmVudCBVUkwgKGhhc2gpIGFuZCBuYXZpZ2F0ZXMgYWNjb3JkaW5nbHkuXG5cdCAqL1xuXHRmdW5jdGlvbiByZWFkVVJMKCkge1xuXG5cdFx0dmFyIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcblxuXHRcdC8vIEF0dGVtcHQgdG8gcGFyc2UgdGhlIGhhc2ggYXMgZWl0aGVyIGFuIGluZGV4IG9yIG5hbWVcblx0XHR2YXIgYml0cyA9IGhhc2guc2xpY2UoIDIgKS5zcGxpdCggJy8nICksXG5cdFx0XHRuYW1lID0gaGFzaC5yZXBsYWNlKCAvI3xcXC8vZ2ksICcnICk7XG5cblx0XHQvLyBJZiB0aGUgZmlyc3QgYml0IGlzIGludmFsaWQgYW5kIHRoZXJlIGlzIGEgbmFtZSB3ZSBjYW5cblx0XHQvLyBhc3N1bWUgdGhhdCB0aGlzIGlzIGEgbmFtZWQgbGlua1xuXHRcdGlmKCBpc05hTiggcGFyc2VJbnQoIGJpdHNbMF0sIDEwICkgKSAmJiBuYW1lLmxlbmd0aCApIHtcblx0XHRcdHZhciBlbGVtZW50O1xuXG5cdFx0XHQvLyBFbnN1cmUgdGhlIG5hbWVkIGxpbmsgaXMgYSB2YWxpZCBIVE1MIElEIGF0dHJpYnV0ZVxuXHRcdFx0aWYoIC9eW2EtekEtWl1bXFx3Oi4tXSokLy50ZXN0KCBuYW1lICkgKSB7XG5cdFx0XHRcdC8vIEZpbmQgdGhlIHNsaWRlIHdpdGggdGhlIHNwZWNpZmllZCBJRFxuXHRcdFx0XHRlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIG5hbWUgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYoIGVsZW1lbnQgKSB7XG5cdFx0XHRcdC8vIEZpbmQgdGhlIHBvc2l0aW9uIG9mIHRoZSBuYW1lZCBzbGlkZSBhbmQgbmF2aWdhdGUgdG8gaXRcblx0XHRcdFx0dmFyIGluZGljZXMgPSBSZXZlYWwuZ2V0SW5kaWNlcyggZWxlbWVudCApO1xuXHRcdFx0XHRzbGlkZSggaW5kaWNlcy5oLCBpbmRpY2VzLnYgKTtcblx0XHRcdH1cblx0XHRcdC8vIElmIHRoZSBzbGlkZSBkb2Vzbid0IGV4aXN0LCBuYXZpZ2F0ZSB0byB0aGUgY3VycmVudCBzbGlkZVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHNsaWRlKCBpbmRleGggfHwgMCwgaW5kZXh2IHx8IDAgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHQvLyBSZWFkIHRoZSBpbmRleCBjb21wb25lbnRzIG9mIHRoZSBoYXNoXG5cdFx0XHR2YXIgaCA9IHBhcnNlSW50KCBiaXRzWzBdLCAxMCApIHx8IDAsXG5cdFx0XHRcdHYgPSBwYXJzZUludCggYml0c1sxXSwgMTAgKSB8fCAwO1xuXG5cdFx0XHRpZiggaCAhPT0gaW5kZXhoIHx8IHYgIT09IGluZGV4diApIHtcblx0XHRcdFx0c2xpZGUoIGgsIHYgKTtcblx0XHRcdH1cblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBwYWdlIFVSTCAoaGFzaCkgdG8gcmVmbGVjdCB0aGUgY3VycmVudFxuXHQgKiBzdGF0ZS5cblx0ICpcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5IFRoZSB0aW1lIGluIG1zIHRvIHdhaXQgYmVmb3JlXG5cdCAqIHdyaXRpbmcgdGhlIGhhc2hcblx0ICovXG5cdGZ1bmN0aW9uIHdyaXRlVVJMKCBkZWxheSApIHtcblxuXHRcdGlmKCBjb25maWcuaGlzdG9yeSApIHtcblxuXHRcdFx0Ly8gTWFrZSBzdXJlIHRoZXJlJ3MgbmV2ZXIgbW9yZSB0aGFuIG9uZSB0aW1lb3V0IHJ1bm5pbmdcblx0XHRcdGNsZWFyVGltZW91dCggd3JpdGVVUkxUaW1lb3V0ICk7XG5cblx0XHRcdC8vIElmIGEgZGVsYXkgaXMgc3BlY2lmaWVkLCB0aW1lb3V0IHRoaXMgY2FsbFxuXHRcdFx0aWYoIHR5cGVvZiBkZWxheSA9PT0gJ251bWJlcicgKSB7XG5cdFx0XHRcdHdyaXRlVVJMVGltZW91dCA9IHNldFRpbWVvdXQoIHdyaXRlVVJMLCBkZWxheSApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiggY3VycmVudFNsaWRlICkge1xuXHRcdFx0XHR2YXIgdXJsID0gJy8nO1xuXG5cdFx0XHRcdC8vIEF0dGVtcHQgdG8gY3JlYXRlIGEgbmFtZWQgbGluayBiYXNlZCBvbiB0aGUgc2xpZGUncyBJRFxuXHRcdFx0XHR2YXIgaWQgPSBjdXJyZW50U2xpZGUuZ2V0QXR0cmlidXRlKCAnaWQnICk7XG5cdFx0XHRcdGlmKCBpZCApIHtcblx0XHRcdFx0XHRpZCA9IGlkLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdFx0aWQgPSBpZC5yZXBsYWNlKCAvW15hLXpBLVowLTlcXC1cXF9cXDpcXC5dL2csICcnICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBJZiB0aGUgY3VycmVudCBzbGlkZSBoYXMgYW4gSUQsIHVzZSB0aGF0IGFzIGEgbmFtZWQgbGlua1xuXHRcdFx0XHRpZiggdHlwZW9mIGlkID09PSAnc3RyaW5nJyAmJiBpZC5sZW5ndGggKSB7XG5cdFx0XHRcdFx0dXJsID0gJy8nICsgaWQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gT3RoZXJ3aXNlIHVzZSB0aGUgL2gvdiBpbmRleFxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRpZiggaW5kZXhoID4gMCB8fCBpbmRleHYgPiAwICkgdXJsICs9IGluZGV4aDtcblx0XHRcdFx0XHRpZiggaW5kZXh2ID4gMCApIHVybCArPSAnLycgKyBpbmRleHY7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IHVybDtcblx0XHRcdH1cblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGgvdiBsb2NhdGlvbiBvZiB0aGUgY3VycmVudCwgb3Igc3BlY2lmaWVkLFxuXHQgKiBzbGlkZS5cblx0ICpcblx0ICogQHBhcmFtIHtIVE1MRWxlbWVudH0gc2xpZGUgSWYgc3BlY2lmaWVkLCB0aGUgcmV0dXJuZWRcblx0ICogaW5kZXggd2lsbCBiZSBmb3IgdGhpcyBzbGlkZSByYXRoZXIgdGhhbiB0aGUgY3VycmVudGx5XG5cdCAqIGFjdGl2ZSBvbmVcblx0ICpcblx0ICogQHJldHVybiB7T2JqZWN0fSB7IGg6IDxpbnQ+LCB2OiA8aW50PiwgZjogPGludD4gfVxuXHQgKi9cblx0ZnVuY3Rpb24gZ2V0SW5kaWNlcyggc2xpZGUgKSB7XG5cblx0XHQvLyBCeSBkZWZhdWx0LCByZXR1cm4gdGhlIGN1cnJlbnQgaW5kaWNlc1xuXHRcdHZhciBoID0gaW5kZXhoLFxuXHRcdFx0diA9IGluZGV4dixcblx0XHRcdGY7XG5cblx0XHQvLyBJZiBhIHNsaWRlIGlzIHNwZWNpZmllZCwgcmV0dXJuIHRoZSBpbmRpY2VzIG9mIHRoYXQgc2xpZGVcblx0XHRpZiggc2xpZGUgKSB7XG5cdFx0XHR2YXIgaXNWZXJ0aWNhbCA9IGlzVmVydGljYWxTbGlkZSggc2xpZGUgKTtcblx0XHRcdHZhciBzbGlkZWggPSBpc1ZlcnRpY2FsID8gc2xpZGUucGFyZW50Tm9kZSA6IHNsaWRlO1xuXG5cdFx0XHQvLyBTZWxlY3QgYWxsIGhvcml6b250YWwgc2xpZGVzXG5cdFx0XHR2YXIgaG9yaXpvbnRhbFNsaWRlcyA9IHRvQXJyYXkoIGRvbS53cmFwcGVyLnF1ZXJ5U2VsZWN0b3JBbGwoIEhPUklaT05UQUxfU0xJREVTX1NFTEVDVE9SICkgKTtcblxuXHRcdFx0Ly8gTm93IHRoYXQgd2Uga25vdyB3aGljaCB0aGUgaG9yaXpvbnRhbCBzbGlkZSBpcywgZ2V0IGl0cyBpbmRleFxuXHRcdFx0aCA9IE1hdGgubWF4KCBob3Jpem9udGFsU2xpZGVzLmluZGV4T2YoIHNsaWRlaCApLCAwICk7XG5cblx0XHRcdC8vIEFzc3VtZSB3ZSdyZSBub3QgdmVydGljYWxcblx0XHRcdHYgPSB1bmRlZmluZWQ7XG5cblx0XHRcdC8vIElmIHRoaXMgaXMgYSB2ZXJ0aWNhbCBzbGlkZSwgZ3JhYiB0aGUgdmVydGljYWwgaW5kZXhcblx0XHRcdGlmKCBpc1ZlcnRpY2FsICkge1xuXHRcdFx0XHR2ID0gTWF0aC5tYXgoIHRvQXJyYXkoIHNsaWRlLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvckFsbCggJ3NlY3Rpb24nICkgKS5pbmRleE9mKCBzbGlkZSApLCAwICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYoICFzbGlkZSAmJiBjdXJyZW50U2xpZGUgKSB7XG5cdFx0XHR2YXIgaGFzRnJhZ21lbnRzID0gY3VycmVudFNsaWRlLnF1ZXJ5U2VsZWN0b3JBbGwoICcuZnJhZ21lbnQnICkubGVuZ3RoID4gMDtcblx0XHRcdGlmKCBoYXNGcmFnbWVudHMgKSB7XG5cdFx0XHRcdHZhciBjdXJyZW50RnJhZ21lbnQgPSBjdXJyZW50U2xpZGUucXVlcnlTZWxlY3RvciggJy5jdXJyZW50LWZyYWdtZW50JyApO1xuXHRcdFx0XHRpZiggY3VycmVudEZyYWdtZW50ICYmIGN1cnJlbnRGcmFnbWVudC5oYXNBdHRyaWJ1dGUoICdkYXRhLWZyYWdtZW50LWluZGV4JyApICkge1xuXHRcdFx0XHRcdGYgPSBwYXJzZUludCggY3VycmVudEZyYWdtZW50LmdldEF0dHJpYnV0ZSggJ2RhdGEtZnJhZ21lbnQtaW5kZXgnICksIDEwICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0ZiA9IGN1cnJlbnRTbGlkZS5xdWVyeVNlbGVjdG9yQWxsKCAnLmZyYWdtZW50LnZpc2libGUnICkubGVuZ3RoIC0gMTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7IGg6IGgsIHY6IHYsIGY6IGYgfTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgdG90YWwgbnVtYmVyIG9mIHNsaWRlcyBpbiB0aGlzIHByZXNlbnRhdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIGdldFRvdGFsU2xpZGVzKCkge1xuXG5cdFx0cmV0dXJuIGRvbS53cmFwcGVyLnF1ZXJ5U2VsZWN0b3JBbGwoIFNMSURFU19TRUxFQ1RPUiArICc6bm90KC5zdGFjayknICkubGVuZ3RoO1xuXG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc2xpZGUgZWxlbWVudCBtYXRjaGluZyB0aGUgc3BlY2lmaWVkIGluZGV4LlxuXHQgKi9cblx0ZnVuY3Rpb24gZ2V0U2xpZGUoIHgsIHkgKSB7XG5cblx0XHR2YXIgaG9yaXpvbnRhbFNsaWRlID0gZG9tLndyYXBwZXIucXVlcnlTZWxlY3RvckFsbCggSE9SSVpPTlRBTF9TTElERVNfU0VMRUNUT1IgKVsgeCBdO1xuXHRcdHZhciB2ZXJ0aWNhbFNsaWRlcyA9IGhvcml6b250YWxTbGlkZSAmJiBob3Jpem9udGFsU2xpZGUucXVlcnlTZWxlY3RvckFsbCggJ3NlY3Rpb24nICk7XG5cblx0XHRpZiggdmVydGljYWxTbGlkZXMgJiYgdmVydGljYWxTbGlkZXMubGVuZ3RoICYmIHR5cGVvZiB5ID09PSAnbnVtYmVyJyApIHtcblx0XHRcdHJldHVybiB2ZXJ0aWNhbFNsaWRlcyA/IHZlcnRpY2FsU2xpZGVzWyB5IF0gOiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGhvcml6b250YWxTbGlkZTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGJhY2tncm91bmQgZWxlbWVudCBmb3IgdGhlIGdpdmVuIHNsaWRlLlxuXHQgKiBBbGwgc2xpZGVzLCBldmVuIHRoZSBvbmVzIHdpdGggbm8gYmFja2dyb3VuZCBwcm9wZXJ0aWVzXG5cdCAqIGRlZmluZWQsIGhhdmUgYSBiYWNrZ3JvdW5kIGVsZW1lbnQgc28gYXMgbG9uZyBhcyB0aGVcblx0ICogaW5kZXggaXMgdmFsaWQgYW4gZWxlbWVudCB3aWxsIGJlIHJldHVybmVkLlxuXHQgKi9cblx0ZnVuY3Rpb24gZ2V0U2xpZGVCYWNrZ3JvdW5kKCB4LCB5ICkge1xuXG5cdFx0Ly8gV2hlbiBwcmludGluZyB0byBQREYgdGhlIHNsaWRlIGJhY2tncm91bmRzIGFyZSBuZXN0ZWRcblx0XHQvLyBpbnNpZGUgb2YgdGhlIHNsaWRlc1xuXHRcdGlmKCBpc1ByaW50aW5nUERGKCkgKSB7XG5cdFx0XHR2YXIgc2xpZGUgPSBnZXRTbGlkZSggeCwgeSApO1xuXHRcdFx0aWYoIHNsaWRlICkge1xuXHRcdFx0XHR2YXIgYmFja2dyb3VuZCA9IHNsaWRlLnF1ZXJ5U2VsZWN0b3IoICcuc2xpZGUtYmFja2dyb3VuZCcgKTtcblx0XHRcdFx0aWYoIGJhY2tncm91bmQgJiYgYmFja2dyb3VuZC5wYXJlbnROb2RlID09PSBzbGlkZSApIHtcblx0XHRcdFx0XHRyZXR1cm4gYmFja2dyb3VuZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdHZhciBob3Jpem9udGFsQmFja2dyb3VuZCA9IGRvbS53cmFwcGVyLnF1ZXJ5U2VsZWN0b3JBbGwoICcuYmFja2dyb3VuZHM+LnNsaWRlLWJhY2tncm91bmQnIClbIHggXTtcblx0XHR2YXIgdmVydGljYWxCYWNrZ3JvdW5kcyA9IGhvcml6b250YWxCYWNrZ3JvdW5kICYmIGhvcml6b250YWxCYWNrZ3JvdW5kLnF1ZXJ5U2VsZWN0b3JBbGwoICcuc2xpZGUtYmFja2dyb3VuZCcgKTtcblxuXHRcdGlmKCB2ZXJ0aWNhbEJhY2tncm91bmRzICYmIHZlcnRpY2FsQmFja2dyb3VuZHMubGVuZ3RoICYmIHR5cGVvZiB5ID09PSAnbnVtYmVyJyApIHtcblx0XHRcdHJldHVybiB2ZXJ0aWNhbEJhY2tncm91bmRzID8gdmVydGljYWxCYWNrZ3JvdW5kc1sgeSBdIDogdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdHJldHVybiBob3Jpem9udGFsQmFja2dyb3VuZDtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgcHJlc2VudGF0aW9uIGFzXG5cdCAqIGFuIG9iamVjdC4gVGhpcyBzdGF0ZSBjYW4gdGhlbiBiZSByZXN0b3JlZCBhdCBhbnlcblx0ICogdGltZS5cblx0ICovXG5cdGZ1bmN0aW9uIGdldFN0YXRlKCkge1xuXG5cdFx0dmFyIGluZGljZXMgPSBnZXRJbmRpY2VzKCk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0aW5kZXhoOiBpbmRpY2VzLmgsXG5cdFx0XHRpbmRleHY6IGluZGljZXMudixcblx0XHRcdGluZGV4ZjogaW5kaWNlcy5mLFxuXHRcdFx0cGF1c2VkOiBpc1BhdXNlZCgpLFxuXHRcdFx0b3ZlcnZpZXc6IGlzT3ZlcnZpZXcoKVxuXHRcdH07XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXN0b3JlcyB0aGUgcHJlc2VudGF0aW9uIHRvIHRoZSBnaXZlbiBzdGF0ZS5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IHN0YXRlIEFzIGdlbmVyYXRlZCBieSBnZXRTdGF0ZSgpXG5cdCAqL1xuXHRmdW5jdGlvbiBzZXRTdGF0ZSggc3RhdGUgKSB7XG5cblx0XHRpZiggdHlwZW9mIHN0YXRlID09PSAnb2JqZWN0JyApIHtcblx0XHRcdHNsaWRlKCBkZXNlcmlhbGl6ZSggc3RhdGUuaW5kZXhoICksIGRlc2VyaWFsaXplKCBzdGF0ZS5pbmRleHYgKSwgZGVzZXJpYWxpemUoIHN0YXRlLmluZGV4ZiApICk7XG5cblx0XHRcdHZhciBwYXVzZWRGbGFnID0gZGVzZXJpYWxpemUoIHN0YXRlLnBhdXNlZCApLFxuXHRcdFx0XHRvdmVydmlld0ZsYWcgPSBkZXNlcmlhbGl6ZSggc3RhdGUub3ZlcnZpZXcgKTtcblxuXHRcdFx0aWYoIHR5cGVvZiBwYXVzZWRGbGFnID09PSAnYm9vbGVhbicgJiYgcGF1c2VkRmxhZyAhPT0gaXNQYXVzZWQoKSApIHtcblx0XHRcdFx0dG9nZ2xlUGF1c2UoIHBhdXNlZEZsYWcgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYoIHR5cGVvZiBvdmVydmlld0ZsYWcgPT09ICdib29sZWFuJyAmJiBvdmVydmlld0ZsYWcgIT09IGlzT3ZlcnZpZXcoKSApIHtcblx0XHRcdFx0dG9nZ2xlT3ZlcnZpZXcoIG92ZXJ2aWV3RmxhZyApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiBhIHNvcnRlZCBmcmFnbWVudHMgbGlzdCwgb3JkZXJlZCBieSBhbiBpbmNyZWFzaW5nXG5cdCAqIFwiZGF0YS1mcmFnbWVudC1pbmRleFwiIGF0dHJpYnV0ZS5cblx0ICpcblx0ICogRnJhZ21lbnRzIHdpbGwgYmUgcmV2ZWFsZWQgaW4gdGhlIG9yZGVyIHRoYXQgdGhleSBhcmUgcmV0dXJuZWQgYnlcblx0ICogdGhpcyBmdW5jdGlvbiwgc28geW91IGNhbiB1c2UgdGhlIGluZGV4IGF0dHJpYnV0ZXMgdG8gY29udHJvbCB0aGVcblx0ICogb3JkZXIgb2YgZnJhZ21lbnQgYXBwZWFyYW5jZS5cblx0ICpcblx0ICogVG8gbWFpbnRhaW4gYSBzZW5zaWJsZSBkZWZhdWx0IGZyYWdtZW50IG9yZGVyLCBmcmFnbWVudHMgYXJlIHByZXN1bWVkXG5cdCAqIHRvIGJlIHBhc3NlZCBpbiBkb2N1bWVudCBvcmRlci4gVGhpcyBmdW5jdGlvbiBhZGRzIGEgXCJmcmFnbWVudC1pbmRleFwiXG5cdCAqIGF0dHJpYnV0ZSB0byBlYWNoIG5vZGUgaWYgc3VjaCBhbiBhdHRyaWJ1dGUgaXMgbm90IGFscmVhZHkgcHJlc2VudCxcblx0ICogYW5kIHNldHMgdGhhdCBhdHRyaWJ1dGUgdG8gYW4gaW50ZWdlciB2YWx1ZSB3aGljaCBpcyB0aGUgcG9zaXRpb24gb2Zcblx0ICogdGhlIGZyYWdtZW50IHdpdGhpbiB0aGUgZnJhZ21lbnRzIGxpc3QuXG5cdCAqL1xuXHRmdW5jdGlvbiBzb3J0RnJhZ21lbnRzKCBmcmFnbWVudHMgKSB7XG5cblx0XHRmcmFnbWVudHMgPSB0b0FycmF5KCBmcmFnbWVudHMgKTtcblxuXHRcdHZhciBvcmRlcmVkID0gW10sXG5cdFx0XHR1bm9yZGVyZWQgPSBbXSxcblx0XHRcdHNvcnRlZCA9IFtdO1xuXG5cdFx0Ly8gR3JvdXAgb3JkZXJlZCBhbmQgdW5vcmRlcmVkIGVsZW1lbnRzXG5cdFx0ZnJhZ21lbnRzLmZvckVhY2goIGZ1bmN0aW9uKCBmcmFnbWVudCwgaSApIHtcblx0XHRcdGlmKCBmcmFnbWVudC5oYXNBdHRyaWJ1dGUoICdkYXRhLWZyYWdtZW50LWluZGV4JyApICkge1xuXHRcdFx0XHR2YXIgaW5kZXggPSBwYXJzZUludCggZnJhZ21lbnQuZ2V0QXR0cmlidXRlKCAnZGF0YS1mcmFnbWVudC1pbmRleCcgKSwgMTAgKTtcblxuXHRcdFx0XHRpZiggIW9yZGVyZWRbaW5kZXhdICkge1xuXHRcdFx0XHRcdG9yZGVyZWRbaW5kZXhdID0gW107XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRvcmRlcmVkW2luZGV4XS5wdXNoKCBmcmFnbWVudCApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHVub3JkZXJlZC5wdXNoKCBbIGZyYWdtZW50IF0gKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHQvLyBBcHBlbmQgZnJhZ21lbnRzIHdpdGhvdXQgZXhwbGljaXQgaW5kaWNlcyBpbiB0aGVpclxuXHRcdC8vIERPTSBvcmRlclxuXHRcdG9yZGVyZWQgPSBvcmRlcmVkLmNvbmNhdCggdW5vcmRlcmVkICk7XG5cblx0XHQvLyBNYW51YWxseSBjb3VudCB0aGUgaW5kZXggdXAgcGVyIGdyb3VwIHRvIGVuc3VyZSB0aGVyZVxuXHRcdC8vIGFyZSBubyBnYXBzXG5cdFx0dmFyIGluZGV4ID0gMDtcblxuXHRcdC8vIFB1c2ggYWxsIGZyYWdtZW50cyBpbiB0aGVpciBzb3J0ZWQgb3JkZXIgdG8gYW4gYXJyYXksXG5cdFx0Ly8gdGhpcyBmbGF0dGVucyB0aGUgZ3JvdXBzXG5cdFx0b3JkZXJlZC5mb3JFYWNoKCBmdW5jdGlvbiggZ3JvdXAgKSB7XG5cdFx0XHRncm91cC5mb3JFYWNoKCBmdW5jdGlvbiggZnJhZ21lbnQgKSB7XG5cdFx0XHRcdHNvcnRlZC5wdXNoKCBmcmFnbWVudCApO1xuXHRcdFx0XHRmcmFnbWVudC5zZXRBdHRyaWJ1dGUoICdkYXRhLWZyYWdtZW50LWluZGV4JywgaW5kZXggKTtcblx0XHRcdH0gKTtcblxuXHRcdFx0aW5kZXggKys7XG5cdFx0fSApO1xuXG5cdFx0cmV0dXJuIHNvcnRlZDtcblxuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlIHRvIHRoZSBzcGVjaWZpZWQgc2xpZGUgZnJhZ21lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIGZyYWdtZW50IHRoYXRcblx0ICogc2hvdWxkIGJlIHNob3duLCAtMSBtZWFucyBhbGwgYXJlIGludmlzaWJsZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IEludGVnZXIgb2Zmc2V0IHRvIGFwcGx5IHRvIHRoZVxuXHQgKiBmcmFnbWVudCBpbmRleFxuXHQgKlxuXHQgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGEgY2hhbmdlIHdhcyBtYWRlIGluIGFueVxuXHQgKiBmcmFnbWVudHMgdmlzaWJpbGl0eSBhcyBwYXJ0IG9mIHRoaXMgY2FsbFxuXHQgKi9cblx0ZnVuY3Rpb24gbmF2aWdhdGVGcmFnbWVudCggaW5kZXgsIG9mZnNldCApIHtcblxuXHRcdGlmKCBjdXJyZW50U2xpZGUgJiYgY29uZmlnLmZyYWdtZW50cyApIHtcblxuXHRcdFx0dmFyIGZyYWdtZW50cyA9IHNvcnRGcmFnbWVudHMoIGN1cnJlbnRTbGlkZS5xdWVyeVNlbGVjdG9yQWxsKCAnLmZyYWdtZW50JyApICk7XG5cdFx0XHRpZiggZnJhZ21lbnRzLmxlbmd0aCApIHtcblxuXHRcdFx0XHQvLyBJZiBubyBpbmRleCBpcyBzcGVjaWZpZWQsIGZpbmQgdGhlIGN1cnJlbnRcblx0XHRcdFx0aWYoIHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicgKSB7XG5cdFx0XHRcdFx0dmFyIGxhc3RWaXNpYmxlRnJhZ21lbnQgPSBzb3J0RnJhZ21lbnRzKCBjdXJyZW50U2xpZGUucXVlcnlTZWxlY3RvckFsbCggJy5mcmFnbWVudC52aXNpYmxlJyApICkucG9wKCk7XG5cblx0XHRcdFx0XHRpZiggbGFzdFZpc2libGVGcmFnbWVudCApIHtcblx0XHRcdFx0XHRcdGluZGV4ID0gcGFyc2VJbnQoIGxhc3RWaXNpYmxlRnJhZ21lbnQuZ2V0QXR0cmlidXRlKCAnZGF0YS1mcmFnbWVudC1pbmRleCcgKSB8fCAwLCAxMCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdGluZGV4ID0gLTE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gSWYgYW4gb2Zmc2V0IGlzIHNwZWNpZmllZCwgYXBwbHkgaXQgdG8gdGhlIGluZGV4XG5cdFx0XHRcdGlmKCB0eXBlb2Ygb2Zmc2V0ID09PSAnbnVtYmVyJyApIHtcblx0XHRcdFx0XHRpbmRleCArPSBvZmZzZXQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR2YXIgZnJhZ21lbnRzU2hvd24gPSBbXSxcblx0XHRcdFx0XHRmcmFnbWVudHNIaWRkZW4gPSBbXTtcblxuXHRcdFx0XHR0b0FycmF5KCBmcmFnbWVudHMgKS5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCwgaSApIHtcblxuXHRcdFx0XHRcdGlmKCBlbGVtZW50Lmhhc0F0dHJpYnV0ZSggJ2RhdGEtZnJhZ21lbnQtaW5kZXgnICkgKSB7XG5cdFx0XHRcdFx0XHRpID0gcGFyc2VJbnQoIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnZGF0YS1mcmFnbWVudC1pbmRleCcgKSwgMTAgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBWaXNpYmxlIGZyYWdtZW50c1xuXHRcdFx0XHRcdGlmKCBpIDw9IGluZGV4ICkge1xuXHRcdFx0XHRcdFx0aWYoICFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyggJ3Zpc2libGUnICkgKSBmcmFnbWVudHNTaG93bi5wdXNoKCBlbGVtZW50ICk7XG5cdFx0XHRcdFx0XHRlbGVtZW50LmNsYXNzTGlzdC5hZGQoICd2aXNpYmxlJyApO1xuXHRcdFx0XHRcdFx0ZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCAnY3VycmVudC1mcmFnbWVudCcgKTtcblxuXHRcdFx0XHRcdFx0Ly8gQW5ub3VuY2UgdGhlIGZyYWdtZW50cyBvbmUgYnkgb25lIHRvIHRoZSBTY3JlZW4gUmVhZGVyXG5cdFx0XHRcdFx0XHRkb20uc3RhdHVzRGl2LnRleHRDb250ZW50ID0gZWxlbWVudC50ZXh0Q29udGVudDtcblxuXHRcdFx0XHRcdFx0aWYoIGkgPT09IGluZGV4ICkge1xuXHRcdFx0XHRcdFx0XHRlbGVtZW50LmNsYXNzTGlzdC5hZGQoICdjdXJyZW50LWZyYWdtZW50JyApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBIaWRkZW4gZnJhZ21lbnRzXG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiggZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoICd2aXNpYmxlJyApICkgZnJhZ21lbnRzSGlkZGVuLnB1c2goIGVsZW1lbnQgKTtcblx0XHRcdFx0XHRcdGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSggJ3Zpc2libGUnICk7XG5cdFx0XHRcdFx0XHRlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoICdjdXJyZW50LWZyYWdtZW50JyApO1xuXHRcdFx0XHRcdH1cblxuXG5cdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRpZiggZnJhZ21lbnRzSGlkZGVuLmxlbmd0aCApIHtcblx0XHRcdFx0XHRkaXNwYXRjaEV2ZW50KCAnZnJhZ21lbnRoaWRkZW4nLCB7IGZyYWdtZW50OiBmcmFnbWVudHNIaWRkZW5bMF0sIGZyYWdtZW50czogZnJhZ21lbnRzSGlkZGVuIH0gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKCBmcmFnbWVudHNTaG93bi5sZW5ndGggKSB7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hFdmVudCggJ2ZyYWdtZW50c2hvd24nLCB7IGZyYWdtZW50OiBmcmFnbWVudHNTaG93blswXSwgZnJhZ21lbnRzOiBmcmFnbWVudHNTaG93biB9ICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR1cGRhdGVDb250cm9scygpO1xuXHRcdFx0XHR1cGRhdGVQcm9ncmVzcygpO1xuXG5cdFx0XHRcdHJldHVybiAhISggZnJhZ21lbnRzU2hvd24ubGVuZ3RoIHx8IGZyYWdtZW50c0hpZGRlbi5sZW5ndGggKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGUgdG8gdGhlIG5leHQgc2xpZGUgZnJhZ21lbnQuXG5cdCAqXG5cdCAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgdGhlcmUgd2FzIGEgbmV4dCBmcmFnbWVudCxcblx0ICogZmFsc2Ugb3RoZXJ3aXNlXG5cdCAqL1xuXHRmdW5jdGlvbiBuZXh0RnJhZ21lbnQoKSB7XG5cblx0XHRyZXR1cm4gbmF2aWdhdGVGcmFnbWVudCggbnVsbCwgMSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGUgdG8gdGhlIHByZXZpb3VzIHNsaWRlIGZyYWdtZW50LlxuXHQgKlxuXHQgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIHRoZXJlIHdhcyBhIHByZXZpb3VzIGZyYWdtZW50LFxuXHQgKiBmYWxzZSBvdGhlcndpc2Vcblx0ICovXG5cdGZ1bmN0aW9uIHByZXZpb3VzRnJhZ21lbnQoKSB7XG5cblx0XHRyZXR1cm4gbmF2aWdhdGVGcmFnbWVudCggbnVsbCwgLTEgKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIEN1ZXMgYSBuZXcgYXV0b21hdGVkIHNsaWRlIGlmIGVuYWJsZWQgaW4gdGhlIGNvbmZpZy5cblx0ICovXG5cdGZ1bmN0aW9uIGN1ZUF1dG9TbGlkZSgpIHtcblxuXHRcdGNhbmNlbEF1dG9TbGlkZSgpO1xuXG5cdFx0aWYoIGN1cnJlbnRTbGlkZSApIHtcblxuXHRcdFx0dmFyIGN1cnJlbnRGcmFnbWVudCA9IGN1cnJlbnRTbGlkZS5xdWVyeVNlbGVjdG9yKCAnLmN1cnJlbnQtZnJhZ21lbnQnICk7XG5cblx0XHRcdHZhciBmcmFnbWVudEF1dG9TbGlkZSA9IGN1cnJlbnRGcmFnbWVudCA/IGN1cnJlbnRGcmFnbWVudC5nZXRBdHRyaWJ1dGUoICdkYXRhLWF1dG9zbGlkZScgKSA6IG51bGw7XG5cdFx0XHR2YXIgcGFyZW50QXV0b1NsaWRlID0gY3VycmVudFNsaWRlLnBhcmVudE5vZGUgPyBjdXJyZW50U2xpZGUucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoICdkYXRhLWF1dG9zbGlkZScgKSA6IG51bGw7XG5cdFx0XHR2YXIgc2xpZGVBdXRvU2xpZGUgPSBjdXJyZW50U2xpZGUuZ2V0QXR0cmlidXRlKCAnZGF0YS1hdXRvc2xpZGUnICk7XG5cblx0XHRcdC8vIFBpY2sgdmFsdWUgaW4gdGhlIGZvbGxvd2luZyBwcmlvcml0eSBvcmRlcjpcblx0XHRcdC8vIDEuIEN1cnJlbnQgZnJhZ21lbnQncyBkYXRhLWF1dG9zbGlkZVxuXHRcdFx0Ly8gMi4gQ3VycmVudCBzbGlkZSdzIGRhdGEtYXV0b3NsaWRlXG5cdFx0XHQvLyAzLiBQYXJlbnQgc2xpZGUncyBkYXRhLWF1dG9zbGlkZVxuXHRcdFx0Ly8gNC4gR2xvYmFsIGF1dG9TbGlkZSBzZXR0aW5nXG5cdFx0XHRpZiggZnJhZ21lbnRBdXRvU2xpZGUgKSB7XG5cdFx0XHRcdGF1dG9TbGlkZSA9IHBhcnNlSW50KCBmcmFnbWVudEF1dG9TbGlkZSwgMTAgKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYoIHNsaWRlQXV0b1NsaWRlICkge1xuXHRcdFx0XHRhdXRvU2xpZGUgPSBwYXJzZUludCggc2xpZGVBdXRvU2xpZGUsIDEwICk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKCBwYXJlbnRBdXRvU2xpZGUgKSB7XG5cdFx0XHRcdGF1dG9TbGlkZSA9IHBhcnNlSW50KCBwYXJlbnRBdXRvU2xpZGUsIDEwICk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0YXV0b1NsaWRlID0gY29uZmlnLmF1dG9TbGlkZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgdGhlcmUgYXJlIG1lZGlhIGVsZW1lbnRzIHdpdGggZGF0YS1hdXRvcGxheSxcblx0XHRcdC8vIGF1dG9tYXRpY2FsbHkgc2V0IHRoZSBhdXRvU2xpZGUgZHVyYXRpb24gdG8gdGhlXG5cdFx0XHQvLyBsZW5ndGggb2YgdGhhdCBtZWRpYS4gTm90IGFwcGxpY2FibGUgaWYgdGhlIHNsaWRlXG5cdFx0XHQvLyBpcyBkaXZpZGVkIHVwIGludG8gZnJhZ21lbnRzLlxuXHRcdFx0aWYoIGN1cnJlbnRTbGlkZS5xdWVyeVNlbGVjdG9yQWxsKCAnLmZyYWdtZW50JyApLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdFx0dG9BcnJheSggY3VycmVudFNsaWRlLnF1ZXJ5U2VsZWN0b3JBbGwoICd2aWRlbywgYXVkaW8nICkgKS5mb3JFYWNoKCBmdW5jdGlvbiggZWwgKSB7XG5cdFx0XHRcdFx0aWYoIGVsLmhhc0F0dHJpYnV0ZSggJ2RhdGEtYXV0b3BsYXknICkgKSB7XG5cdFx0XHRcdFx0XHRpZiggYXV0b1NsaWRlICYmIGVsLmR1cmF0aW9uICogMTAwMCA+IGF1dG9TbGlkZSApIHtcblx0XHRcdFx0XHRcdFx0YXV0b1NsaWRlID0gKCBlbC5kdXJhdGlvbiAqIDEwMDAgKSArIDEwMDA7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9ICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEN1ZSB0aGUgbmV4dCBhdXRvLXNsaWRlIGlmOlxuXHRcdFx0Ly8gLSBUaGVyZSBpcyBhbiBhdXRvU2xpZGUgdmFsdWVcblx0XHRcdC8vIC0gQXV0by1zbGlkaW5nIGlzbid0IHBhdXNlZCBieSB0aGUgdXNlclxuXHRcdFx0Ly8gLSBUaGUgcHJlc2VudGF0aW9uIGlzbid0IHBhdXNlZFxuXHRcdFx0Ly8gLSBUaGUgb3ZlcnZpZXcgaXNuJ3QgYWN0aXZlXG5cdFx0XHQvLyAtIFRoZSBwcmVzZW50YXRpb24gaXNuJ3Qgb3ZlclxuXHRcdFx0aWYoIGF1dG9TbGlkZSAmJiAhYXV0b1NsaWRlUGF1c2VkICYmICFpc1BhdXNlZCgpICYmICFpc092ZXJ2aWV3KCkgJiYgKCAhUmV2ZWFsLmlzTGFzdFNsaWRlKCkgfHwgYXZhaWxhYmxlRnJhZ21lbnRzKCkubmV4dCB8fCBjb25maWcubG9vcCA9PT0gdHJ1ZSApICkge1xuXHRcdFx0XHRhdXRvU2xpZGVUaW1lb3V0ID0gc2V0VGltZW91dCggbmF2aWdhdGVOZXh0LCBhdXRvU2xpZGUgKTtcblx0XHRcdFx0YXV0b1NsaWRlU3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblx0XHRcdH1cblxuXHRcdFx0aWYoIGF1dG9TbGlkZVBsYXllciApIHtcblx0XHRcdFx0YXV0b1NsaWRlUGxheWVyLnNldFBsYXlpbmcoIGF1dG9TbGlkZVRpbWVvdXQgIT09IC0xICk7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDYW5jZWxzIGFueSBvbmdvaW5nIHJlcXVlc3QgdG8gYXV0by1zbGlkZS5cblx0ICovXG5cdGZ1bmN0aW9uIGNhbmNlbEF1dG9TbGlkZSgpIHtcblxuXHRcdGNsZWFyVGltZW91dCggYXV0b1NsaWRlVGltZW91dCApO1xuXHRcdGF1dG9TbGlkZVRpbWVvdXQgPSAtMTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gcGF1c2VBdXRvU2xpZGUoKSB7XG5cblx0XHRpZiggYXV0b1NsaWRlICYmICFhdXRvU2xpZGVQYXVzZWQgKSB7XG5cdFx0XHRhdXRvU2xpZGVQYXVzZWQgPSB0cnVlO1xuXHRcdFx0ZGlzcGF0Y2hFdmVudCggJ2F1dG9zbGlkZXBhdXNlZCcgKTtcblx0XHRcdGNsZWFyVGltZW91dCggYXV0b1NsaWRlVGltZW91dCApO1xuXG5cdFx0XHRpZiggYXV0b1NsaWRlUGxheWVyICkge1xuXHRcdFx0XHRhdXRvU2xpZGVQbGF5ZXIuc2V0UGxheWluZyggZmFsc2UgKTtcblx0XHRcdH1cblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIHJlc3VtZUF1dG9TbGlkZSgpIHtcblxuXHRcdGlmKCBhdXRvU2xpZGUgJiYgYXV0b1NsaWRlUGF1c2VkICkge1xuXHRcdFx0YXV0b1NsaWRlUGF1c2VkID0gZmFsc2U7XG5cdFx0XHRkaXNwYXRjaEV2ZW50KCAnYXV0b3NsaWRlcmVzdW1lZCcgKTtcblx0XHRcdGN1ZUF1dG9TbGlkZSgpO1xuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gbmF2aWdhdGVMZWZ0KCkge1xuXG5cdFx0Ly8gUmV2ZXJzZSBmb3IgUlRMXG5cdFx0aWYoIGNvbmZpZy5ydGwgKSB7XG5cdFx0XHRpZiggKCBpc092ZXJ2aWV3KCkgfHwgbmV4dEZyYWdtZW50KCkgPT09IGZhbHNlICkgJiYgYXZhaWxhYmxlUm91dGVzKCkubGVmdCApIHtcblx0XHRcdFx0c2xpZGUoIGluZGV4aCArIDEgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gTm9ybWFsIG5hdmlnYXRpb25cblx0XHRlbHNlIGlmKCAoIGlzT3ZlcnZpZXcoKSB8fCBwcmV2aW91c0ZyYWdtZW50KCkgPT09IGZhbHNlICkgJiYgYXZhaWxhYmxlUm91dGVzKCkubGVmdCApIHtcblx0XHRcdHNsaWRlKCBpbmRleGggLSAxICk7XG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiBuYXZpZ2F0ZVJpZ2h0KCkge1xuXG5cdFx0Ly8gUmV2ZXJzZSBmb3IgUlRMXG5cdFx0aWYoIGNvbmZpZy5ydGwgKSB7XG5cdFx0XHRpZiggKCBpc092ZXJ2aWV3KCkgfHwgcHJldmlvdXNGcmFnbWVudCgpID09PSBmYWxzZSApICYmIGF2YWlsYWJsZVJvdXRlcygpLnJpZ2h0ICkge1xuXHRcdFx0XHRzbGlkZSggaW5kZXhoIC0gMSApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBOb3JtYWwgbmF2aWdhdGlvblxuXHRcdGVsc2UgaWYoICggaXNPdmVydmlldygpIHx8IG5leHRGcmFnbWVudCgpID09PSBmYWxzZSApICYmIGF2YWlsYWJsZVJvdXRlcygpLnJpZ2h0ICkge1xuXHRcdFx0c2xpZGUoIGluZGV4aCArIDEgKTtcblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG5hdmlnYXRlVXAoKSB7XG5cblx0XHQvLyBQcmlvcml0aXplIGhpZGluZyBmcmFnbWVudHNcblx0XHRpZiggKCBpc092ZXJ2aWV3KCkgfHwgcHJldmlvdXNGcmFnbWVudCgpID09PSBmYWxzZSApICYmIGF2YWlsYWJsZVJvdXRlcygpLnVwICkge1xuXHRcdFx0c2xpZGUoIGluZGV4aCwgaW5kZXh2IC0gMSApO1xuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gbmF2aWdhdGVEb3duKCkge1xuXG5cdFx0Ly8gUHJpb3JpdGl6ZSByZXZlYWxpbmcgZnJhZ21lbnRzXG5cdFx0aWYoICggaXNPdmVydmlldygpIHx8IG5leHRGcmFnbWVudCgpID09PSBmYWxzZSApICYmIGF2YWlsYWJsZVJvdXRlcygpLmRvd24gKSB7XG5cdFx0XHRzbGlkZSggaW5kZXhoLCBpbmRleHYgKyAxICk7XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGVzIGJhY2t3YXJkcywgcHJpb3JpdGl6ZWQgaW4gdGhlIGZvbGxvd2luZyBvcmRlcjpcblx0ICogMSkgUHJldmlvdXMgZnJhZ21lbnRcblx0ICogMikgUHJldmlvdXMgdmVydGljYWwgc2xpZGVcblx0ICogMykgUHJldmlvdXMgaG9yaXpvbnRhbCBzbGlkZVxuXHQgKi9cblx0ZnVuY3Rpb24gbmF2aWdhdGVQcmV2KCkge1xuXG5cdFx0Ly8gUHJpb3JpdGl6ZSByZXZlYWxpbmcgZnJhZ21lbnRzXG5cdFx0aWYoIHByZXZpb3VzRnJhZ21lbnQoKSA9PT0gZmFsc2UgKSB7XG5cdFx0XHRpZiggYXZhaWxhYmxlUm91dGVzKCkudXAgKSB7XG5cdFx0XHRcdG5hdmlnYXRlVXAoKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHQvLyBGZXRjaCB0aGUgcHJldmlvdXMgaG9yaXpvbnRhbCBzbGlkZSwgaWYgdGhlcmUgaXMgb25lXG5cdFx0XHRcdHZhciBwcmV2aW91c1NsaWRlO1xuXG5cdFx0XHRcdGlmKCBjb25maWcucnRsICkge1xuXHRcdFx0XHRcdHByZXZpb3VzU2xpZGUgPSB0b0FycmF5KCBkb20ud3JhcHBlci5xdWVyeVNlbGVjdG9yQWxsKCBIT1JJWk9OVEFMX1NMSURFU19TRUxFQ1RPUiArICcuZnV0dXJlJyApICkucG9wKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0cHJldmlvdXNTbGlkZSA9IHRvQXJyYXkoIGRvbS53cmFwcGVyLnF1ZXJ5U2VsZWN0b3JBbGwoIEhPUklaT05UQUxfU0xJREVTX1NFTEVDVE9SICsgJy5wYXN0JyApICkucG9wKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiggcHJldmlvdXNTbGlkZSApIHtcblx0XHRcdFx0XHR2YXIgdiA9ICggcHJldmlvdXNTbGlkZS5xdWVyeVNlbGVjdG9yQWxsKCAnc2VjdGlvbicgKS5sZW5ndGggLSAxICkgfHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRcdHZhciBoID0gaW5kZXhoIC0gMTtcblx0XHRcdFx0XHRzbGlkZSggaCwgdiApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogVGhlIHJldmVyc2Ugb2YgI25hdmlnYXRlUHJldigpLlxuXHQgKi9cblx0ZnVuY3Rpb24gbmF2aWdhdGVOZXh0KCkge1xuXG5cdFx0Ly8gUHJpb3JpdGl6ZSByZXZlYWxpbmcgZnJhZ21lbnRzXG5cdFx0aWYoIG5leHRGcmFnbWVudCgpID09PSBmYWxzZSApIHtcblx0XHRcdGlmKCBhdmFpbGFibGVSb3V0ZXMoKS5kb3duICkge1xuXHRcdFx0XHRuYXZpZ2F0ZURvd24oKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYoIGNvbmZpZy5ydGwgKSB7XG5cdFx0XHRcdG5hdmlnYXRlTGVmdCgpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdG5hdmlnYXRlUmlnaHQoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBJZiBhdXRvLXNsaWRpbmcgaXMgZW5hYmxlZCB3ZSBuZWVkIHRvIGN1ZSB1cFxuXHRcdC8vIGFub3RoZXIgdGltZW91dFxuXHRcdGN1ZUF1dG9TbGlkZSgpO1xuXG5cdH1cblxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRVZFTlRTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXG5cblx0LyoqXG5cdCAqIENhbGxlZCBieSBhbGwgZXZlbnQgaGFuZGxlcnMgdGhhdCBhcmUgYmFzZWQgb24gdXNlclxuXHQgKiBpbnB1dC5cblx0ICovXG5cdGZ1bmN0aW9uIG9uVXNlcklucHV0KCBldmVudCApIHtcblxuXHRcdGlmKCBjb25maWcuYXV0b1NsaWRlU3RvcHBhYmxlICkge1xuXHRcdFx0cGF1c2VBdXRvU2xpZGUoKTtcblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVyIGZvciB0aGUgZG9jdW1lbnQgbGV2ZWwgJ2tleXByZXNzJyBldmVudC5cblx0ICovXG5cdGZ1bmN0aW9uIG9uRG9jdW1lbnRLZXlQcmVzcyggZXZlbnQgKSB7XG5cblx0XHQvLyBDaGVjayBpZiB0aGUgcHJlc3NlZCBrZXkgaXMgcXVlc3Rpb24gbWFya1xuXHRcdGlmKCBldmVudC5zaGlmdEtleSAmJiBldmVudC5jaGFyQ29kZSA9PT0gNjMgKSB7XG5cdFx0XHRpZiggZG9tLm92ZXJsYXkgKSB7XG5cdFx0XHRcdGNsb3NlT3ZlcmxheSgpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHNob3dIZWxwKCB0cnVlICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlciBmb3IgdGhlIGRvY3VtZW50IGxldmVsICdrZXlkb3duJyBldmVudC5cblx0ICovXG5cdGZ1bmN0aW9uIG9uRG9jdW1lbnRLZXlEb3duKCBldmVudCApIHtcblxuXHRcdC8vIElmIHRoZXJlJ3MgYSBjb25kaXRpb24gc3BlY2lmaWVkIGFuZCBpdCByZXR1cm5zIGZhbHNlLFxuXHRcdC8vIGlnbm9yZSB0aGlzIGV2ZW50XG5cdFx0aWYoIHR5cGVvZiBjb25maWcua2V5Ym9hcmRDb25kaXRpb24gPT09ICdmdW5jdGlvbicgJiYgY29uZmlnLmtleWJvYXJkQ29uZGl0aW9uKCkgPT09IGZhbHNlICkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gUmVtZW1iZXIgaWYgYXV0by1zbGlkaW5nIHdhcyBwYXVzZWQgc28gd2UgY2FuIHRvZ2dsZSBpdFxuXHRcdHZhciBhdXRvU2xpZGVXYXNQYXVzZWQgPSBhdXRvU2xpZGVQYXVzZWQ7XG5cblx0XHRvblVzZXJJbnB1dCggZXZlbnQgKTtcblxuXHRcdC8vIENoZWNrIGlmIHRoZXJlJ3MgYSBmb2N1c2VkIGVsZW1lbnQgdGhhdCBjb3VsZCBiZSB1c2luZ1xuXHRcdC8vIHRoZSBrZXlib2FyZFxuXHRcdHZhciBhY3RpdmVFbGVtZW50SXNDRSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5jb250ZW50RWRpdGFibGUgIT09ICdpbmhlcml0Jztcblx0XHR2YXIgYWN0aXZlRWxlbWVudElzSW5wdXQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQudGFnTmFtZSAmJiAvaW5wdXR8dGV4dGFyZWEvaS50ZXN0KCBkb2N1bWVudC5hY3RpdmVFbGVtZW50LnRhZ05hbWUgKTtcblxuXHRcdC8vIERpc3JlZ2FyZCB0aGUgZXZlbnQgaWYgdGhlcmUncyBhIGZvY3VzZWQgZWxlbWVudCBvciBhXG5cdFx0Ly8ga2V5Ym9hcmQgbW9kaWZpZXIga2V5IGlzIHByZXNlbnRcblx0XHRpZiggYWN0aXZlRWxlbWVudElzQ0UgfHwgYWN0aXZlRWxlbWVudElzSW5wdXQgfHwgKGV2ZW50LnNoaWZ0S2V5ICYmIGV2ZW50LmtleUNvZGUgIT09IDMyKSB8fCBldmVudC5hbHRLZXkgfHwgZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5ICkgcmV0dXJuO1xuXG5cdFx0Ly8gV2hpbGUgcGF1c2VkIG9ubHkgYWxsb3cgXCJ1bnBhdXNpbmdcIiBrZXlib2FyZCBldmVudHMgKGIgYW5kIC4pXG5cdFx0aWYoIGlzUGF1c2VkKCkgJiYgWzY2LDE5MCwxOTFdLmluZGV4T2YoIGV2ZW50LmtleUNvZGUgKSA9PT0gLTEgKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dmFyIHRyaWdnZXJlZCA9IGZhbHNlO1xuXG5cdFx0Ly8gMS4gVXNlciBkZWZpbmVkIGtleSBiaW5kaW5nc1xuXHRcdGlmKCB0eXBlb2YgY29uZmlnLmtleWJvYXJkID09PSAnb2JqZWN0JyApIHtcblxuXHRcdFx0Zm9yKCB2YXIga2V5IGluIGNvbmZpZy5rZXlib2FyZCApIHtcblxuXHRcdFx0XHQvLyBDaGVjayBpZiB0aGlzIGJpbmRpbmcgbWF0Y2hlcyB0aGUgcHJlc3NlZCBrZXlcblx0XHRcdFx0aWYoIHBhcnNlSW50KCBrZXksIDEwICkgPT09IGV2ZW50LmtleUNvZGUgKSB7XG5cblx0XHRcdFx0XHR2YXIgdmFsdWUgPSBjb25maWcua2V5Ym9hcmRbIGtleSBdO1xuXG5cdFx0XHRcdFx0Ly8gQ2FsbGJhY2sgZnVuY3Rpb25cblx0XHRcdFx0XHRpZiggdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICkge1xuXHRcdFx0XHRcdFx0dmFsdWUuYXBwbHkoIG51bGwsIFsgZXZlbnQgXSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBTdHJpbmcgc2hvcnRjdXRzIHRvIHJldmVhbC5qcyBBUElcblx0XHRcdFx0XHRlbHNlIGlmKCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBSZXZlYWxbIHZhbHVlIF0gPT09ICdmdW5jdGlvbicgKSB7XG5cdFx0XHRcdFx0XHRSZXZlYWxbIHZhbHVlIF0uY2FsbCgpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRyaWdnZXJlZCA9IHRydWU7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHQvLyAyLiBTeXN0ZW0gZGVmaW5lZCBrZXkgYmluZGluZ3Ncblx0XHRpZiggdHJpZ2dlcmVkID09PSBmYWxzZSApIHtcblxuXHRcdFx0Ly8gQXNzdW1lIHRydWUgYW5kIHRyeSB0byBwcm92ZSBmYWxzZVxuXHRcdFx0dHJpZ2dlcmVkID0gdHJ1ZTtcblxuXHRcdFx0c3dpdGNoKCBldmVudC5rZXlDb2RlICkge1xuXHRcdFx0XHQvLyBwLCBwYWdlIHVwXG5cdFx0XHRcdGNhc2UgODA6IGNhc2UgMzM6IG5hdmlnYXRlUHJldigpOyBicmVhaztcblx0XHRcdFx0Ly8gbiwgcGFnZSBkb3duXG5cdFx0XHRcdGNhc2UgNzg6IGNhc2UgMzQ6IG5hdmlnYXRlTmV4dCgpOyBicmVhaztcblx0XHRcdFx0Ly8gaCwgbGVmdFxuXHRcdFx0XHRjYXNlIDcyOiBjYXNlIDM3OiBuYXZpZ2F0ZUxlZnQoKTsgYnJlYWs7XG5cdFx0XHRcdC8vIGwsIHJpZ2h0XG5cdFx0XHRcdGNhc2UgNzY6IGNhc2UgMzk6IG5hdmlnYXRlUmlnaHQoKTsgYnJlYWs7XG5cdFx0XHRcdC8vIGssIHVwXG5cdFx0XHRcdGNhc2UgNzU6IGNhc2UgMzg6IG5hdmlnYXRlVXAoKTsgYnJlYWs7XG5cdFx0XHRcdC8vIGosIGRvd25cblx0XHRcdFx0Y2FzZSA3NDogY2FzZSA0MDogbmF2aWdhdGVEb3duKCk7IGJyZWFrO1xuXHRcdFx0XHQvLyBob21lXG5cdFx0XHRcdGNhc2UgMzY6IHNsaWRlKCAwICk7IGJyZWFrO1xuXHRcdFx0XHQvLyBlbmRcblx0XHRcdFx0Y2FzZSAzNTogc2xpZGUoIE51bWJlci5NQVhfVkFMVUUgKTsgYnJlYWs7XG5cdFx0XHRcdC8vIHNwYWNlXG5cdFx0XHRcdGNhc2UgMzI6IGlzT3ZlcnZpZXcoKSA/IGRlYWN0aXZhdGVPdmVydmlldygpIDogZXZlbnQuc2hpZnRLZXkgPyBuYXZpZ2F0ZVByZXYoKSA6IG5hdmlnYXRlTmV4dCgpOyBicmVhaztcblx0XHRcdFx0Ly8gcmV0dXJuXG5cdFx0XHRcdGNhc2UgMTM6IGlzT3ZlcnZpZXcoKSA/IGRlYWN0aXZhdGVPdmVydmlldygpIDogdHJpZ2dlcmVkID0gZmFsc2U7IGJyZWFrO1xuXHRcdFx0XHQvLyB0d28tc3BvdCwgc2VtaWNvbG9uLCBiLCBwZXJpb2QsIExvZ2l0ZWNoIHByZXNlbnRlciB0b29scyBcImJsYWNrIHNjcmVlblwiIGJ1dHRvblxuXHRcdFx0XHRjYXNlIDU4OiBjYXNlIDU5OiBjYXNlIDY2OiBjYXNlIDE5MDogY2FzZSAxOTE6IHRvZ2dsZVBhdXNlKCk7IGJyZWFrO1xuXHRcdFx0XHQvLyBmXG5cdFx0XHRcdGNhc2UgNzA6IGVudGVyRnVsbHNjcmVlbigpOyBicmVhaztcblx0XHRcdFx0Ly8gYVxuXHRcdFx0XHRjYXNlIDY1OiBpZiAoIGNvbmZpZy5hdXRvU2xpZGVTdG9wcGFibGUgKSB0b2dnbGVBdXRvU2xpZGUoIGF1dG9TbGlkZVdhc1BhdXNlZCApOyBicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0cmlnZ2VyZWQgPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdC8vIElmIHRoZSBpbnB1dCByZXN1bHRlZCBpbiBhIHRyaWdnZXJlZCBhY3Rpb24gd2Ugc2hvdWxkIHByZXZlbnRcblx0XHQvLyB0aGUgYnJvd3NlcnMgZGVmYXVsdCBiZWhhdmlvclxuXHRcdGlmKCB0cmlnZ2VyZWQgKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCAmJiBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0XHQvLyBFU0Mgb3IgTyBrZXlcblx0XHRlbHNlIGlmICggKCBldmVudC5rZXlDb2RlID09PSAyNyB8fCBldmVudC5rZXlDb2RlID09PSA3OSApICYmIGZlYXR1cmVzLnRyYW5zZm9ybXMzZCApIHtcblx0XHRcdGlmKCBkb20ub3ZlcmxheSApIHtcblx0XHRcdFx0Y2xvc2VPdmVybGF5KCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dG9nZ2xlT3ZlcnZpZXcoKTtcblx0XHRcdH1cblxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQgJiYgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cblx0XHQvLyBJZiBhdXRvLXNsaWRpbmcgaXMgZW5hYmxlZCB3ZSBuZWVkIHRvIGN1ZSB1cFxuXHRcdC8vIGFub3RoZXIgdGltZW91dFxuXHRcdGN1ZUF1dG9TbGlkZSgpO1xuXG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlciBmb3IgdGhlICd0b3VjaHN0YXJ0JyBldmVudCwgZW5hYmxlcyBzdXBwb3J0IGZvclxuXHQgKiBzd2lwZSBhbmQgcGluY2ggZ2VzdHVyZXMuXG5cdCAqL1xuXHRmdW5jdGlvbiBvblRvdWNoU3RhcnQoIGV2ZW50ICkge1xuXG5cdFx0dG91Y2guc3RhcnRYID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRYO1xuXHRcdHRvdWNoLnN0YXJ0WSA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WTtcblx0XHR0b3VjaC5zdGFydENvdW50ID0gZXZlbnQudG91Y2hlcy5sZW5ndGg7XG5cblx0XHQvLyBJZiB0aGVyZSdzIHR3byB0b3VjaGVzIHdlIG5lZWQgdG8gbWVtb3JpemUgdGhlIGRpc3RhbmNlXG5cdFx0Ly8gYmV0d2VlbiB0aG9zZSB0d28gcG9pbnRzIHRvIGRldGVjdCBwaW5jaGluZ1xuXHRcdGlmKCBldmVudC50b3VjaGVzLmxlbmd0aCA9PT0gMiAmJiBjb25maWcub3ZlcnZpZXcgKSB7XG5cdFx0XHR0b3VjaC5zdGFydFNwYW4gPSBkaXN0YW5jZUJldHdlZW4oIHtcblx0XHRcdFx0eDogZXZlbnQudG91Y2hlc1sxXS5jbGllbnRYLFxuXHRcdFx0XHR5OiBldmVudC50b3VjaGVzWzFdLmNsaWVudFlcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogdG91Y2guc3RhcnRYLFxuXHRcdFx0XHR5OiB0b3VjaC5zdGFydFlcblx0XHRcdH0gKTtcblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVyIGZvciB0aGUgJ3RvdWNobW92ZScgZXZlbnQuXG5cdCAqL1xuXHRmdW5jdGlvbiBvblRvdWNoTW92ZSggZXZlbnQgKSB7XG5cblx0XHQvLyBFYWNoIHRvdWNoIHNob3VsZCBvbmx5IHRyaWdnZXIgb25lIGFjdGlvblxuXHRcdGlmKCAhdG91Y2guY2FwdHVyZWQgKSB7XG5cdFx0XHRvblVzZXJJbnB1dCggZXZlbnQgKTtcblxuXHRcdFx0dmFyIGN1cnJlbnRYID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRYO1xuXHRcdFx0dmFyIGN1cnJlbnRZID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRZO1xuXG5cdFx0XHQvLyBJZiB0aGUgdG91Y2ggc3RhcnRlZCB3aXRoIHR3byBwb2ludHMgYW5kIHN0aWxsIGhhc1xuXHRcdFx0Ly8gdHdvIGFjdGl2ZSB0b3VjaGVzOyB0ZXN0IGZvciB0aGUgcGluY2ggZ2VzdHVyZVxuXHRcdFx0aWYoIGV2ZW50LnRvdWNoZXMubGVuZ3RoID09PSAyICYmIHRvdWNoLnN0YXJ0Q291bnQgPT09IDIgJiYgY29uZmlnLm92ZXJ2aWV3ICkge1xuXG5cdFx0XHRcdC8vIFRoZSBjdXJyZW50IGRpc3RhbmNlIGluIHBpeGVscyBiZXR3ZWVuIHRoZSB0d28gdG91Y2ggcG9pbnRzXG5cdFx0XHRcdHZhciBjdXJyZW50U3BhbiA9IGRpc3RhbmNlQmV0d2Vlbigge1xuXHRcdFx0XHRcdHg6IGV2ZW50LnRvdWNoZXNbMV0uY2xpZW50WCxcblx0XHRcdFx0XHR5OiBldmVudC50b3VjaGVzWzFdLmNsaWVudFlcblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdHg6IHRvdWNoLnN0YXJ0WCxcblx0XHRcdFx0XHR5OiB0b3VjaC5zdGFydFlcblx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdC8vIElmIHRoZSBzcGFuIGlzIGxhcmdlciB0aGFuIHRoZSBkZXNpcmUgYW1vdW50IHdlJ3ZlIGdvdFxuXHRcdFx0XHQvLyBvdXJzZWx2ZXMgYSBwaW5jaFxuXHRcdFx0XHRpZiggTWF0aC5hYnMoIHRvdWNoLnN0YXJ0U3BhbiAtIGN1cnJlbnRTcGFuICkgPiB0b3VjaC50aHJlc2hvbGQgKSB7XG5cdFx0XHRcdFx0dG91Y2guY2FwdHVyZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0aWYoIGN1cnJlbnRTcGFuIDwgdG91Y2guc3RhcnRTcGFuICkge1xuXHRcdFx0XHRcdFx0YWN0aXZhdGVPdmVydmlldygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdGRlYWN0aXZhdGVPdmVydmlldygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdH1cblx0XHRcdC8vIFRoZXJlIHdhcyBvbmx5IG9uZSB0b3VjaCBwb2ludCwgbG9vayBmb3IgYSBzd2lwZVxuXHRcdFx0ZWxzZSBpZiggZXZlbnQudG91Y2hlcy5sZW5ndGggPT09IDEgJiYgdG91Y2guc3RhcnRDb3VudCAhPT0gMiApIHtcblxuXHRcdFx0XHR2YXIgZGVsdGFYID0gY3VycmVudFggLSB0b3VjaC5zdGFydFgsXG5cdFx0XHRcdFx0ZGVsdGFZID0gY3VycmVudFkgLSB0b3VjaC5zdGFydFk7XG5cblx0XHRcdFx0aWYoIGRlbHRhWCA+IHRvdWNoLnRocmVzaG9sZCAmJiBNYXRoLmFicyggZGVsdGFYICkgPiBNYXRoLmFicyggZGVsdGFZICkgKSB7XG5cdFx0XHRcdFx0dG91Y2guY2FwdHVyZWQgPSB0cnVlO1xuXHRcdFx0XHRcdG5hdmlnYXRlTGVmdCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYoIGRlbHRhWCA8IC10b3VjaC50aHJlc2hvbGQgJiYgTWF0aC5hYnMoIGRlbHRhWCApID4gTWF0aC5hYnMoIGRlbHRhWSApICkge1xuXHRcdFx0XHRcdHRvdWNoLmNhcHR1cmVkID0gdHJ1ZTtcblx0XHRcdFx0XHRuYXZpZ2F0ZVJpZ2h0KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiggZGVsdGFZID4gdG91Y2gudGhyZXNob2xkICkge1xuXHRcdFx0XHRcdHRvdWNoLmNhcHR1cmVkID0gdHJ1ZTtcblx0XHRcdFx0XHRuYXZpZ2F0ZVVwKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiggZGVsdGFZIDwgLXRvdWNoLnRocmVzaG9sZCApIHtcblx0XHRcdFx0XHR0b3VjaC5jYXB0dXJlZCA9IHRydWU7XG5cdFx0XHRcdFx0bmF2aWdhdGVEb3duKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBJZiB3ZSdyZSBlbWJlZGRlZCwgb25seSBibG9jayB0b3VjaCBldmVudHMgaWYgdGhleSBoYXZlXG5cdFx0XHRcdC8vIHRyaWdnZXJlZCBhbiBhY3Rpb25cblx0XHRcdFx0aWYoIGNvbmZpZy5lbWJlZGRlZCApIHtcblx0XHRcdFx0XHRpZiggdG91Y2guY2FwdHVyZWQgfHwgaXNWZXJ0aWNhbFNsaWRlKCBjdXJyZW50U2xpZGUgKSApIHtcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIE5vdCBlbWJlZGRlZD8gQmxvY2sgdGhlbSBhbGwgdG8gYXZvaWQgbmVlZGxlc3MgdG9zc2luZ1xuXHRcdFx0XHQvLyBhcm91bmQgb2YgdGhlIHZpZXdwb3J0IGluIGlPU1xuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gVGhlcmUncyBhIGJ1ZyB3aXRoIHN3aXBpbmcgb24gc29tZSBBbmRyb2lkIGRldmljZXMgdW5sZXNzXG5cdFx0Ly8gdGhlIGRlZmF1bHQgYWN0aW9uIGlzIGFsd2F5cyBwcmV2ZW50ZWRcblx0XHRlbHNlIGlmKCBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKCAvYW5kcm9pZC9naSApICkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVyIGZvciB0aGUgJ3RvdWNoZW5kJyBldmVudC5cblx0ICovXG5cdGZ1bmN0aW9uIG9uVG91Y2hFbmQoIGV2ZW50ICkge1xuXG5cdFx0dG91Y2guY2FwdHVyZWQgPSBmYWxzZTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnQgcG9pbnRlciBkb3duIHRvIHRvdWNoIHN0YXJ0LlxuXHQgKi9cblx0ZnVuY3Rpb24gb25Qb2ludGVyRG93biggZXZlbnQgKSB7XG5cblx0XHRpZiggZXZlbnQucG9pbnRlclR5cGUgPT09IGV2ZW50Lk1TUE9JTlRFUl9UWVBFX1RPVUNIIHx8IGV2ZW50LnBvaW50ZXJUeXBlID09PSBcInRvdWNoXCIgKSB7XG5cdFx0XHRldmVudC50b3VjaGVzID0gW3sgY2xpZW50WDogZXZlbnQuY2xpZW50WCwgY2xpZW50WTogZXZlbnQuY2xpZW50WSB9XTtcblx0XHRcdG9uVG91Y2hTdGFydCggZXZlbnQgKTtcblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0IHBvaW50ZXIgbW92ZSB0byB0b3VjaCBtb3ZlLlxuXHQgKi9cblx0ZnVuY3Rpb24gb25Qb2ludGVyTW92ZSggZXZlbnQgKSB7XG5cblx0XHRpZiggZXZlbnQucG9pbnRlclR5cGUgPT09IGV2ZW50Lk1TUE9JTlRFUl9UWVBFX1RPVUNIIHx8IGV2ZW50LnBvaW50ZXJUeXBlID09PSBcInRvdWNoXCIgKSAge1xuXHRcdFx0ZXZlbnQudG91Y2hlcyA9IFt7IGNsaWVudFg6IGV2ZW50LmNsaWVudFgsIGNsaWVudFk6IGV2ZW50LmNsaWVudFkgfV07XG5cdFx0XHRvblRvdWNoTW92ZSggZXZlbnQgKTtcblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0IHBvaW50ZXIgdXAgdG8gdG91Y2ggZW5kLlxuXHQgKi9cblx0ZnVuY3Rpb24gb25Qb2ludGVyVXAoIGV2ZW50ICkge1xuXG5cdFx0aWYoIGV2ZW50LnBvaW50ZXJUeXBlID09PSBldmVudC5NU1BPSU5URVJfVFlQRV9UT1VDSCB8fCBldmVudC5wb2ludGVyVHlwZSA9PT0gXCJ0b3VjaFwiICkgIHtcblx0XHRcdGV2ZW50LnRvdWNoZXMgPSBbeyBjbGllbnRYOiBldmVudC5jbGllbnRYLCBjbGllbnRZOiBldmVudC5jbGllbnRZIH1dO1xuXHRcdFx0b25Ub3VjaEVuZCggZXZlbnQgKTtcblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIG1vdXNlIHdoZWVsIHNjcm9sbGluZywgdGhyb3R0bGVkIHRvIGF2b2lkIHNraXBwaW5nXG5cdCAqIG11bHRpcGxlIHNsaWRlcy5cblx0ICovXG5cdGZ1bmN0aW9uIG9uRG9jdW1lbnRNb3VzZVNjcm9sbCggZXZlbnQgKSB7XG5cblx0XHRpZiggRGF0ZS5ub3coKSAtIGxhc3RNb3VzZVdoZWVsU3RlcCA+IDYwMCApIHtcblxuXHRcdFx0bGFzdE1vdXNlV2hlZWxTdGVwID0gRGF0ZS5ub3coKTtcblxuXHRcdFx0dmFyIGRlbHRhID0gZXZlbnQuZGV0YWlsIHx8IC1ldmVudC53aGVlbERlbHRhO1xuXHRcdFx0aWYoIGRlbHRhID4gMCApIHtcblx0XHRcdFx0bmF2aWdhdGVOZXh0KCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0bmF2aWdhdGVQcmV2KCk7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDbGlja2luZyBvbiB0aGUgcHJvZ3Jlc3MgYmFyIHJlc3VsdHMgaW4gYSBuYXZpZ2F0aW9uIHRvIHRoZVxuXHQgKiBjbG9zZXN0IGFwcHJveGltYXRlIGhvcml6b250YWwgc2xpZGUgdXNpbmcgdGhpcyBlcXVhdGlvbjpcblx0ICpcblx0ICogKCBjbGlja1ggLyBwcmVzZW50YXRpb25XaWR0aCApICogbnVtYmVyT2ZTbGlkZXNcblx0ICovXG5cdGZ1bmN0aW9uIG9uUHJvZ3Jlc3NDbGlja2VkKCBldmVudCApIHtcblxuXHRcdG9uVXNlcklucHV0KCBldmVudCApO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciBzbGlkZXNUb3RhbCA9IHRvQXJyYXkoIGRvbS53cmFwcGVyLnF1ZXJ5U2VsZWN0b3JBbGwoIEhPUklaT05UQUxfU0xJREVTX1NFTEVDVE9SICkgKS5sZW5ndGg7XG5cdFx0dmFyIHNsaWRlSW5kZXggPSBNYXRoLmZsb29yKCAoIGV2ZW50LmNsaWVudFggLyBkb20ud3JhcHBlci5vZmZzZXRXaWR0aCApICogc2xpZGVzVG90YWwgKTtcblxuXHRcdGlmKCBjb25maWcucnRsICkge1xuXHRcdFx0c2xpZGVJbmRleCA9IHNsaWRlc1RvdGFsIC0gc2xpZGVJbmRleDtcblx0XHR9XG5cblx0XHRzbGlkZSggc2xpZGVJbmRleCApO1xuXG5cdH1cblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciBmb3IgbmF2aWdhdGlvbiBjb250cm9sIGJ1dHRvbnMuXG5cdCAqL1xuXHRmdW5jdGlvbiBvbk5hdmlnYXRlTGVmdENsaWNrZWQoIGV2ZW50ICkgeyBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyBvblVzZXJJbnB1dCgpOyBuYXZpZ2F0ZUxlZnQoKTsgfVxuXHRmdW5jdGlvbiBvbk5hdmlnYXRlUmlnaHRDbGlja2VkKCBldmVudCApIHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgb25Vc2VySW5wdXQoKTsgbmF2aWdhdGVSaWdodCgpOyB9XG5cdGZ1bmN0aW9uIG9uTmF2aWdhdGVVcENsaWNrZWQoIGV2ZW50ICkgeyBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyBvblVzZXJJbnB1dCgpOyBuYXZpZ2F0ZVVwKCk7IH1cblx0ZnVuY3Rpb24gb25OYXZpZ2F0ZURvd25DbGlja2VkKCBldmVudCApIHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgb25Vc2VySW5wdXQoKTsgbmF2aWdhdGVEb3duKCk7IH1cblx0ZnVuY3Rpb24gb25OYXZpZ2F0ZVByZXZDbGlja2VkKCBldmVudCApIHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgb25Vc2VySW5wdXQoKTsgbmF2aWdhdGVQcmV2KCk7IH1cblx0ZnVuY3Rpb24gb25OYXZpZ2F0ZU5leHRDbGlja2VkKCBldmVudCApIHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgb25Vc2VySW5wdXQoKTsgbmF2aWdhdGVOZXh0KCk7IH1cblxuXHQvKipcblx0ICogSGFuZGxlciBmb3IgdGhlIHdpbmRvdyBsZXZlbCAnaGFzaGNoYW5nZScgZXZlbnQuXG5cdCAqL1xuXHRmdW5jdGlvbiBvbldpbmRvd0hhc2hDaGFuZ2UoIGV2ZW50ICkge1xuXG5cdFx0cmVhZFVSTCgpO1xuXG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlciBmb3IgdGhlIHdpbmRvdyBsZXZlbCAncmVzaXplJyBldmVudC5cblx0ICovXG5cdGZ1bmN0aW9uIG9uV2luZG93UmVzaXplKCBldmVudCApIHtcblxuXHRcdGxheW91dCgpO1xuXG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlIGZvciB0aGUgd2luZG93IGxldmVsICd2aXNpYmlsaXR5Y2hhbmdlJyBldmVudC5cblx0ICovXG5cdGZ1bmN0aW9uIG9uUGFnZVZpc2liaWxpdHlDaGFuZ2UoIGV2ZW50ICkge1xuXG5cdFx0dmFyIGlzSGlkZGVuID0gIGRvY3VtZW50LndlYmtpdEhpZGRlbiB8fFxuXHRcdFx0XHRcdFx0ZG9jdW1lbnQubXNIaWRkZW4gfHxcblx0XHRcdFx0XHRcdGRvY3VtZW50LmhpZGRlbjtcblxuXHRcdC8vIElmLCBhZnRlciBjbGlja2luZyBhIGxpbmsgb3Igc2ltaWxhciBhbmQgd2UncmUgY29taW5nIGJhY2ssXG5cdFx0Ly8gZm9jdXMgdGhlIGRvY3VtZW50LmJvZHkgdG8gZW5zdXJlIHdlIGNhbiB1c2Uga2V5Ym9hcmQgc2hvcnRjdXRzXG5cdFx0aWYoIGlzSGlkZGVuID09PSBmYWxzZSAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBkb2N1bWVudC5ib2R5ICkge1xuXHRcdFx0Ly8gTm90IGFsbCBlbGVtZW50cyBzdXBwb3J0IC5ibHVyKCkgLSBTVkdzIGFtb25nIHRoZW0uXG5cdFx0XHRpZiggdHlwZW9mIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1ciA9PT0gJ2Z1bmN0aW9uJyApIHtcblx0XHRcdFx0ZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG5cdFx0XHR9XG5cdFx0XHRkb2N1bWVudC5ib2R5LmZvY3VzKCk7XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogSW52b2tlZCB3aGVuIGEgc2xpZGUgaXMgYW5kIHdlJ3JlIGluIHRoZSBvdmVydmlldy5cblx0ICovXG5cdGZ1bmN0aW9uIG9uT3ZlcnZpZXdTbGlkZUNsaWNrZWQoIGV2ZW50ICkge1xuXG5cdFx0Ly8gVE9ETyBUaGVyZSdzIGEgYnVnIGhlcmUgd2hlcmUgdGhlIGV2ZW50IGxpc3RlbmVycyBhcmUgbm90XG5cdFx0Ly8gcmVtb3ZlZCBhZnRlciBkZWFjdGl2YXRpbmcgdGhlIG92ZXJ2aWV3LlxuXHRcdGlmKCBldmVudHNBcmVCb3VuZCAmJiBpc092ZXJ2aWV3KCkgKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHR2YXIgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcblxuXHRcdFx0d2hpbGUoIGVsZW1lbnQgJiYgIWVsZW1lbnQubm9kZU5hbWUubWF0Y2goIC9zZWN0aW9uL2dpICkgKSB7XG5cdFx0XHRcdGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG5cdFx0XHR9XG5cblx0XHRcdGlmKCBlbGVtZW50ICYmICFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyggJ2Rpc2FibGVkJyApICkge1xuXG5cdFx0XHRcdGRlYWN0aXZhdGVPdmVydmlldygpO1xuXG5cdFx0XHRcdGlmKCBlbGVtZW50Lm5vZGVOYW1lLm1hdGNoKCAvc2VjdGlvbi9naSApICkge1xuXHRcdFx0XHRcdHZhciBoID0gcGFyc2VJbnQoIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCAnZGF0YS1pbmRleC1oJyApLCAxMCApLFxuXHRcdFx0XHRcdFx0diA9IHBhcnNlSW50KCBlbGVtZW50LmdldEF0dHJpYnV0ZSggJ2RhdGEtaW5kZXgtdicgKSwgMTAgKTtcblxuXHRcdFx0XHRcdHNsaWRlKCBoLCB2ICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgY2xpY2tzIG9uIGxpbmtzIHRoYXQgYXJlIHNldCB0byBwcmV2aWV3IGluIHRoZVxuXHQgKiBpZnJhbWUgb3ZlcmxheS5cblx0ICovXG5cdGZ1bmN0aW9uIG9uUHJldmlld0xpbmtDbGlja2VkKCBldmVudCApIHtcblxuXHRcdGlmKCBldmVudC5jdXJyZW50VGFyZ2V0ICYmIGV2ZW50LmN1cnJlbnRUYXJnZXQuaGFzQXR0cmlidXRlKCAnaHJlZicgKSApIHtcblx0XHRcdHZhciB1cmwgPSBldmVudC5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSggJ2hyZWYnICk7XG5cdFx0XHRpZiggdXJsICkge1xuXHRcdFx0XHRzaG93UHJldmlldyggdXJsICk7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyBjbGljayBvbiB0aGUgYXV0by1zbGlkaW5nIGNvbnRyb2xzIGVsZW1lbnQuXG5cdCAqL1xuXHRmdW5jdGlvbiBvbkF1dG9TbGlkZVBsYXllckNsaWNrKCBldmVudCApIHtcblxuXHRcdC8vIFJlcGxheVxuXHRcdGlmKCBSZXZlYWwuaXNMYXN0U2xpZGUoKSAmJiBjb25maWcubG9vcCA9PT0gZmFsc2UgKSB7XG5cdFx0XHRzbGlkZSggMCwgMCApO1xuXHRcdFx0cmVzdW1lQXV0b1NsaWRlKCk7XG5cdFx0fVxuXHRcdC8vIFJlc3VtZVxuXHRcdGVsc2UgaWYoIGF1dG9TbGlkZVBhdXNlZCApIHtcblx0XHRcdHJlc3VtZUF1dG9TbGlkZSgpO1xuXHRcdH1cblx0XHQvLyBQYXVzZVxuXHRcdGVsc2Uge1xuXHRcdFx0cGF1c2VBdXRvU2xpZGUoKTtcblx0XHR9XG5cblx0fVxuXG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUExBWUJBQ0sgQ09NUE9ORU5UIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cblxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvciBmb3IgdGhlIHBsYXliYWNrIGNvbXBvbmVudCwgd2hpY2ggZGlzcGxheXNcblx0ICogcGxheS9wYXVzZS9wcm9ncmVzcyBjb250cm9scy5cblx0ICpcblx0ICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIFRoZSBjb21wb25lbnQgd2lsbCBhcHBlbmRcblx0ICogaXRzZWxmIHRvIHRoaXNcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gcHJvZ3Jlc3NDaGVjayBBIG1ldGhvZCB3aGljaCB3aWxsIGJlXG5cdCAqIGNhbGxlZCBmcmVxdWVudGx5IHRvIGdldCB0aGUgY3VycmVudCBwcm9ncmVzcyBvbiBhIHJhbmdlXG5cdCAqIG9mIDAtMVxuXHQgKi9cblx0ZnVuY3Rpb24gUGxheWJhY2soIGNvbnRhaW5lciwgcHJvZ3Jlc3NDaGVjayApIHtcblxuXHRcdC8vIENvc21ldGljc1xuXHRcdHRoaXMuZGlhbWV0ZXIgPSA1MDtcblx0XHR0aGlzLnRoaWNrbmVzcyA9IDM7XG5cblx0XHQvLyBGbGFncyBpZiB3ZSBhcmUgY3VycmVudGx5IHBsYXlpbmdcblx0XHR0aGlzLnBsYXlpbmcgPSBmYWxzZTtcblxuXHRcdC8vIEN1cnJlbnQgcHJvZ3Jlc3Mgb24gYSAwLTEgcmFuZ2Vcblx0XHR0aGlzLnByb2dyZXNzID0gMDtcblxuXHRcdC8vIFVzZWQgdG8gbG9vcCB0aGUgYW5pbWF0aW9uIHNtb290aGx5XG5cdFx0dGhpcy5wcm9ncmVzc09mZnNldCA9IDE7XG5cblx0XHR0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcblx0XHR0aGlzLnByb2dyZXNzQ2hlY2sgPSBwcm9ncmVzc0NoZWNrO1xuXG5cdFx0dGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuXHRcdHRoaXMuY2FudmFzLmNsYXNzTmFtZSA9ICdwbGF5YmFjayc7XG5cdFx0dGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmRpYW1ldGVyO1xuXHRcdHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuZGlhbWV0ZXI7XG5cdFx0dGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xuXG5cdFx0dGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoIHRoaXMuY2FudmFzICk7XG5cblx0XHR0aGlzLnJlbmRlcigpO1xuXG5cdH1cblxuXHRQbGF5YmFjay5wcm90b3R5cGUuc2V0UGxheWluZyA9IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblxuXHRcdHZhciB3YXNQbGF5aW5nID0gdGhpcy5wbGF5aW5nO1xuXG5cdFx0dGhpcy5wbGF5aW5nID0gdmFsdWU7XG5cblx0XHQvLyBTdGFydCByZXBhaW50aW5nIGlmIHdlIHdlcmVuJ3QgYWxyZWFkeVxuXHRcdGlmKCAhd2FzUGxheWluZyAmJiB0aGlzLnBsYXlpbmcgKSB7XG5cdFx0XHR0aGlzLmFuaW1hdGUoKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH1cblxuXHR9O1xuXG5cdFBsYXliYWNrLnByb3RvdHlwZS5hbmltYXRlID0gZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgcHJvZ3Jlc3NCZWZvcmUgPSB0aGlzLnByb2dyZXNzO1xuXG5cdFx0dGhpcy5wcm9ncmVzcyA9IHRoaXMucHJvZ3Jlc3NDaGVjaygpO1xuXG5cdFx0Ly8gV2hlbiB3ZSBsb29wLCBvZmZzZXQgdGhlIHByb2dyZXNzIHNvIHRoYXQgaXQgZWFzZXNcblx0XHQvLyBzbW9vdGhseSByYXRoZXIgdGhhbiBpbW1lZGlhdGVseSByZXNldHRpbmdcblx0XHRpZiggcHJvZ3Jlc3NCZWZvcmUgPiAwLjggJiYgdGhpcy5wcm9ncmVzcyA8IDAuMiApIHtcblx0XHRcdHRoaXMucHJvZ3Jlc3NPZmZzZXQgPSB0aGlzLnByb2dyZXNzO1xuXHRcdH1cblxuXHRcdHRoaXMucmVuZGVyKCk7XG5cblx0XHRpZiggdGhpcy5wbGF5aW5nICkge1xuXHRcdFx0ZmVhdHVyZXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lTWV0aG9kLmNhbGwoIHdpbmRvdywgdGhpcy5hbmltYXRlLmJpbmQoIHRoaXMgKSApO1xuXHRcdH1cblxuXHR9O1xuXG5cdC8qKlxuXHQgKiBSZW5kZXJzIHRoZSBjdXJyZW50IHByb2dyZXNzIGFuZCBwbGF5YmFjayBzdGF0ZS5cblx0ICovXG5cdFBsYXliYWNrLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBwcm9ncmVzcyA9IHRoaXMucGxheWluZyA/IHRoaXMucHJvZ3Jlc3MgOiAwLFxuXHRcdFx0cmFkaXVzID0gKCB0aGlzLmRpYW1ldGVyIC8gMiApIC0gdGhpcy50aGlja25lc3MsXG5cdFx0XHR4ID0gdGhpcy5kaWFtZXRlciAvIDIsXG5cdFx0XHR5ID0gdGhpcy5kaWFtZXRlciAvIDIsXG5cdFx0XHRpY29uU2l6ZSA9IDE0O1xuXG5cdFx0Ly8gRWFzZSB0b3dhcmRzIDFcblx0XHR0aGlzLnByb2dyZXNzT2Zmc2V0ICs9ICggMSAtIHRoaXMucHJvZ3Jlc3NPZmZzZXQgKSAqIDAuMTtcblxuXHRcdHZhciBlbmRBbmdsZSA9ICggLSBNYXRoLlBJIC8gMiApICsgKCBwcm9ncmVzcyAqICggTWF0aC5QSSAqIDIgKSApO1xuXHRcdHZhciBzdGFydEFuZ2xlID0gKCAtIE1hdGguUEkgLyAyICkgKyAoIHRoaXMucHJvZ3Jlc3NPZmZzZXQgKiAoIE1hdGguUEkgKiAyICkgKTtcblxuXHRcdHRoaXMuY29udGV4dC5zYXZlKCk7XG5cdFx0dGhpcy5jb250ZXh0LmNsZWFyUmVjdCggMCwgMCwgdGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlciApO1xuXG5cdFx0Ly8gU29saWQgYmFja2dyb3VuZCBjb2xvclxuXHRcdHRoaXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHR0aGlzLmNvbnRleHQuYXJjKCB4LCB5LCByYWRpdXMgKyAyLCAwLCBNYXRoLlBJICogMiwgZmFsc2UgKTtcblx0XHR0aGlzLmNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoIDAsIDAsIDAsIDAuNCApJztcblx0XHR0aGlzLmNvbnRleHQuZmlsbCgpO1xuXG5cdFx0Ly8gRHJhdyBwcm9ncmVzcyB0cmFja1xuXHRcdHRoaXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHR0aGlzLmNvbnRleHQuYXJjKCB4LCB5LCByYWRpdXMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSApO1xuXHRcdHRoaXMuY29udGV4dC5saW5lV2lkdGggPSB0aGlzLnRoaWNrbmVzcztcblx0XHR0aGlzLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnIzY2Nic7XG5cdFx0dGhpcy5jb250ZXh0LnN0cm9rZSgpO1xuXG5cdFx0aWYoIHRoaXMucGxheWluZyApIHtcblx0XHRcdC8vIERyYXcgcHJvZ3Jlc3Mgb24gdG9wIG9mIHRyYWNrXG5cdFx0XHR0aGlzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0XHR0aGlzLmNvbnRleHQuYXJjKCB4LCB5LCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBmYWxzZSApO1xuXHRcdFx0dGhpcy5jb250ZXh0LmxpbmVXaWR0aCA9IHRoaXMudGhpY2tuZXNzO1xuXHRcdFx0dGhpcy5jb250ZXh0LnN0cm9rZVN0eWxlID0gJyNmZmYnO1xuXHRcdFx0dGhpcy5jb250ZXh0LnN0cm9rZSgpO1xuXHRcdH1cblxuXHRcdHRoaXMuY29udGV4dC50cmFuc2xhdGUoIHggLSAoIGljb25TaXplIC8gMiApLCB5IC0gKCBpY29uU2l6ZSAvIDIgKSApO1xuXG5cdFx0Ly8gRHJhdyBwbGF5L3BhdXNlIGljb25zXG5cdFx0aWYoIHRoaXMucGxheWluZyApIHtcblx0XHRcdHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSAnI2ZmZic7XG5cdFx0XHR0aGlzLmNvbnRleHQuZmlsbFJlY3QoIDAsIDAsIGljb25TaXplIC8gMiAtIDIsIGljb25TaXplICk7XG5cdFx0XHR0aGlzLmNvbnRleHQuZmlsbFJlY3QoIGljb25TaXplIC8gMiArIDIsIDAsIGljb25TaXplIC8gMiAtIDIsIGljb25TaXplICk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdFx0dGhpcy5jb250ZXh0LnRyYW5zbGF0ZSggMiwgMCApO1xuXHRcdFx0dGhpcy5jb250ZXh0Lm1vdmVUbyggMCwgMCApO1xuXHRcdFx0dGhpcy5jb250ZXh0LmxpbmVUbyggaWNvblNpemUgLSAyLCBpY29uU2l6ZSAvIDIgKTtcblx0XHRcdHRoaXMuY29udGV4dC5saW5lVG8oIDAsIGljb25TaXplICk7XG5cdFx0XHR0aGlzLmNvbnRleHQuZmlsbFN0eWxlID0gJyNmZmYnO1xuXHRcdFx0dGhpcy5jb250ZXh0LmZpbGwoKTtcblx0XHR9XG5cblx0XHR0aGlzLmNvbnRleHQucmVzdG9yZSgpO1xuXG5cdH07XG5cblx0UGxheWJhY2sucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oIHR5cGUsIGxpc3RlbmVyICkge1xuXHRcdHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoIHR5cGUsIGxpc3RlbmVyLCBmYWxzZSApO1xuXHR9O1xuXG5cdFBsYXliYWNrLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiggdHlwZSwgbGlzdGVuZXIgKSB7XG5cdFx0dGhpcy5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lciggdHlwZSwgbGlzdGVuZXIsIGZhbHNlICk7XG5cdH07XG5cblx0UGxheWJhY2sucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMucGxheWluZyA9IGZhbHNlO1xuXG5cdFx0aWYoIHRoaXMuY2FudmFzLnBhcmVudE5vZGUgKSB7XG5cdFx0XHR0aGlzLmNvbnRhaW5lci5yZW1vdmVDaGlsZCggdGhpcy5jYW52YXMgKTtcblx0XHR9XG5cblx0fTtcblxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBUEkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXG5cblxuXHRSZXZlYWwgPSB7XG5cdFx0aW5pdGlhbGl6ZTogaW5pdGlhbGl6ZSxcblx0XHRjb25maWd1cmU6IGNvbmZpZ3VyZSxcblx0XHRzeW5jOiBzeW5jLFxuXG5cdFx0Ly8gTmF2aWdhdGlvbiBtZXRob2RzXG5cdFx0c2xpZGU6IHNsaWRlLFxuXHRcdGxlZnQ6IG5hdmlnYXRlTGVmdCxcblx0XHRyaWdodDogbmF2aWdhdGVSaWdodCxcblx0XHR1cDogbmF2aWdhdGVVcCxcblx0XHRkb3duOiBuYXZpZ2F0ZURvd24sXG5cdFx0cHJldjogbmF2aWdhdGVQcmV2LFxuXHRcdG5leHQ6IG5hdmlnYXRlTmV4dCxcblxuXHRcdC8vIEZyYWdtZW50IG1ldGhvZHNcblx0XHRuYXZpZ2F0ZUZyYWdtZW50OiBuYXZpZ2F0ZUZyYWdtZW50LFxuXHRcdHByZXZGcmFnbWVudDogcHJldmlvdXNGcmFnbWVudCxcblx0XHRuZXh0RnJhZ21lbnQ6IG5leHRGcmFnbWVudCxcblxuXHRcdC8vIERlcHJlY2F0ZWQgYWxpYXNlc1xuXHRcdG5hdmlnYXRlVG86IHNsaWRlLFxuXHRcdG5hdmlnYXRlTGVmdDogbmF2aWdhdGVMZWZ0LFxuXHRcdG5hdmlnYXRlUmlnaHQ6IG5hdmlnYXRlUmlnaHQsXG5cdFx0bmF2aWdhdGVVcDogbmF2aWdhdGVVcCxcblx0XHRuYXZpZ2F0ZURvd246IG5hdmlnYXRlRG93bixcblx0XHRuYXZpZ2F0ZVByZXY6IG5hdmlnYXRlUHJldixcblx0XHRuYXZpZ2F0ZU5leHQ6IG5hdmlnYXRlTmV4dCxcblxuXHRcdC8vIEZvcmNlcyBhbiB1cGRhdGUgaW4gc2xpZGUgbGF5b3V0XG5cdFx0bGF5b3V0OiBsYXlvdXQsXG5cblx0XHQvLyBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHRoZSBhdmFpbGFibGUgcm91dGVzIGFzIGJvb2xlYW5zIChsZWZ0L3JpZ2h0L3RvcC9ib3R0b20pXG5cdFx0YXZhaWxhYmxlUm91dGVzOiBhdmFpbGFibGVSb3V0ZXMsXG5cblx0XHQvLyBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHRoZSBhdmFpbGFibGUgZnJhZ21lbnRzIGFzIGJvb2xlYW5zIChwcmV2L25leHQpXG5cdFx0YXZhaWxhYmxlRnJhZ21lbnRzOiBhdmFpbGFibGVGcmFnbWVudHMsXG5cblx0XHQvLyBUb2dnbGVzIHRoZSBvdmVydmlldyBtb2RlIG9uL29mZlxuXHRcdHRvZ2dsZU92ZXJ2aWV3OiB0b2dnbGVPdmVydmlldyxcblxuXHRcdC8vIFRvZ2dsZXMgdGhlIFwiYmxhY2sgc2NyZWVuXCIgbW9kZSBvbi9vZmZcblx0XHR0b2dnbGVQYXVzZTogdG9nZ2xlUGF1c2UsXG5cblx0XHQvLyBUb2dnbGVzIHRoZSBhdXRvIHNsaWRlIG1vZGUgb24vb2ZmXG5cdFx0dG9nZ2xlQXV0b1NsaWRlOiB0b2dnbGVBdXRvU2xpZGUsXG5cblx0XHQvLyBTdGF0ZSBjaGVja3Ncblx0XHRpc092ZXJ2aWV3OiBpc092ZXJ2aWV3LFxuXHRcdGlzUGF1c2VkOiBpc1BhdXNlZCxcblx0XHRpc0F1dG9TbGlkaW5nOiBpc0F1dG9TbGlkaW5nLFxuXG5cdFx0Ly8gQWRkcyBvciByZW1vdmVzIGFsbCBpbnRlcm5hbCBldmVudCBsaXN0ZW5lcnMgKHN1Y2ggYXMga2V5Ym9hcmQpXG5cdFx0YWRkRXZlbnRMaXN0ZW5lcnM6IGFkZEV2ZW50TGlzdGVuZXJzLFxuXHRcdHJlbW92ZUV2ZW50TGlzdGVuZXJzOiByZW1vdmVFdmVudExpc3RlbmVycyxcblxuXHRcdC8vIEZhY2lsaXR5IGZvciBwZXJzaXN0aW5nIGFuZCByZXN0b3JpbmcgdGhlIHByZXNlbnRhdGlvbiBzdGF0ZVxuXHRcdGdldFN0YXRlOiBnZXRTdGF0ZSxcblx0XHRzZXRTdGF0ZTogc2V0U3RhdGUsXG5cblx0XHQvLyBQcmVzZW50YXRpb24gcHJvZ3Jlc3Mgb24gcmFuZ2Ugb2YgMC0xXG5cdFx0Z2V0UHJvZ3Jlc3M6IGdldFByb2dyZXNzLFxuXG5cdFx0Ly8gUmV0dXJucyB0aGUgaW5kaWNlcyBvZiB0aGUgY3VycmVudCwgb3Igc3BlY2lmaWVkLCBzbGlkZVxuXHRcdGdldEluZGljZXM6IGdldEluZGljZXMsXG5cblx0XHRnZXRUb3RhbFNsaWRlczogZ2V0VG90YWxTbGlkZXMsXG5cblx0XHQvLyBSZXR1cm5zIHRoZSBzbGlkZSBlbGVtZW50IGF0IHRoZSBzcGVjaWZpZWQgaW5kZXhcblx0XHRnZXRTbGlkZTogZ2V0U2xpZGUsXG5cblx0XHQvLyBSZXR1cm5zIHRoZSBzbGlkZSBiYWNrZ3JvdW5kIGVsZW1lbnQgYXQgdGhlIHNwZWNpZmllZCBpbmRleFxuXHRcdGdldFNsaWRlQmFja2dyb3VuZDogZ2V0U2xpZGVCYWNrZ3JvdW5kLFxuXG5cdFx0Ly8gUmV0dXJucyB0aGUgcHJldmlvdXMgc2xpZGUgZWxlbWVudCwgbWF5IGJlIG51bGxcblx0XHRnZXRQcmV2aW91c1NsaWRlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBwcmV2aW91c1NsaWRlO1xuXHRcdH0sXG5cblx0XHQvLyBSZXR1cm5zIHRoZSBjdXJyZW50IHNsaWRlIGVsZW1lbnRcblx0XHRnZXRDdXJyZW50U2xpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIGN1cnJlbnRTbGlkZTtcblx0XHR9LFxuXG5cdFx0Ly8gUmV0dXJucyB0aGUgY3VycmVudCBzY2FsZSBvZiB0aGUgcHJlc2VudGF0aW9uIGNvbnRlbnRcblx0XHRnZXRTY2FsZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc2NhbGU7XG5cdFx0fSxcblxuXHRcdC8vIFJldHVybnMgdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbiBvYmplY3Rcblx0XHRnZXRDb25maWc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIGNvbmZpZztcblx0XHR9LFxuXG5cdFx0Ly8gSGVscGVyIG1ldGhvZCwgcmV0cmlldmVzIHF1ZXJ5IHN0cmluZyBhcyBhIGtleS92YWx1ZSBoYXNoXG5cdFx0Z2V0UXVlcnlIYXNoOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBxdWVyeSA9IHt9O1xuXG5cdFx0XHRsb2NhdGlvbi5zZWFyY2gucmVwbGFjZSggL1tBLVowLTldKz89KFtcXHdcXC4lLV0qKS9naSwgZnVuY3Rpb24oYSkge1xuXHRcdFx0XHRxdWVyeVsgYS5zcGxpdCggJz0nICkuc2hpZnQoKSBdID0gYS5zcGxpdCggJz0nICkucG9wKCk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdC8vIEJhc2ljIGRlc2VyaWFsaXphdGlvblxuXHRcdFx0Zm9yKCB2YXIgaSBpbiBxdWVyeSApIHtcblx0XHRcdFx0dmFyIHZhbHVlID0gcXVlcnlbIGkgXTtcblxuXHRcdFx0XHRxdWVyeVsgaSBdID0gZGVzZXJpYWxpemUoIHVuZXNjYXBlKCB2YWx1ZSApICk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBxdWVyeTtcblx0XHR9LFxuXG5cdFx0Ly8gUmV0dXJucyB0cnVlIGlmIHdlJ3JlIGN1cnJlbnRseSBvbiB0aGUgZmlyc3Qgc2xpZGVcblx0XHRpc0ZpcnN0U2xpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICggaW5kZXhoID09PSAwICYmIGluZGV4diA9PT0gMCApO1xuXHRcdH0sXG5cblx0XHQvLyBSZXR1cm5zIHRydWUgaWYgd2UncmUgY3VycmVudGx5IG9uIHRoZSBsYXN0IHNsaWRlXG5cdFx0aXNMYXN0U2xpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYoIGN1cnJlbnRTbGlkZSApIHtcblx0XHRcdFx0Ly8gRG9lcyB0aGlzIHNsaWRlIGhhcyBuZXh0IGEgc2libGluZz9cblx0XHRcdFx0aWYoIGN1cnJlbnRTbGlkZS5uZXh0RWxlbWVudFNpYmxpbmcgKSByZXR1cm4gZmFsc2U7XG5cblx0XHRcdFx0Ly8gSWYgaXQncyB2ZXJ0aWNhbCwgZG9lcyBpdHMgcGFyZW50IGhhdmUgYSBuZXh0IHNpYmxpbmc/XG5cdFx0XHRcdGlmKCBpc1ZlcnRpY2FsU2xpZGUoIGN1cnJlbnRTbGlkZSApICYmIGN1cnJlbnRTbGlkZS5wYXJlbnROb2RlLm5leHRFbGVtZW50U2libGluZyApIHJldHVybiBmYWxzZTtcblxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sXG5cblx0XHQvLyBDaGVja3MgaWYgcmV2ZWFsLmpzIGhhcyBiZWVuIGxvYWRlZCBhbmQgaXMgcmVhZHkgZm9yIHVzZVxuXHRcdGlzUmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIGxvYWRlZDtcblx0XHR9LFxuXG5cdFx0Ly8gRm9yd2FyZCBldmVudCBiaW5kaW5nIHRvIHRoZSByZXZlYWwgRE9NIGVsZW1lbnRcblx0XHRhZGRFdmVudExpc3RlbmVyOiBmdW5jdGlvbiggdHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUgKSB7XG5cdFx0XHRpZiggJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdyApIHtcblx0XHRcdFx0KCBkb20ud3JhcHBlciB8fCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnLnJldmVhbCcgKSApLmFkZEV2ZW50TGlzdGVuZXIoIHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlICk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRyZW1vdmVFdmVudExpc3RlbmVyOiBmdW5jdGlvbiggdHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUgKSB7XG5cdFx0XHRpZiggJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdyApIHtcblx0XHRcdFx0KCBkb20ud3JhcHBlciB8fCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnLnJldmVhbCcgKSApLnJlbW92ZUV2ZW50TGlzdGVuZXIoIHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vIFByb2dyYW1hdGljYWxseSB0cmlnZ2VycyBhIGtleWJvYXJkIGV2ZW50XG5cdFx0dHJpZ2dlcktleTogZnVuY3Rpb24oIGtleUNvZGUgKSB7XG5cdFx0XHRvbkRvY3VtZW50S2V5RG93biggeyBrZXlDb2RlOiBrZXlDb2RlIH0gKTtcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIFJldmVhbDtcblxufSkpO1xuIiwiLyoqXG4gICAgSGVhZCBKUyAgICAgVGhlIG9ubHkgc2NyaXB0IGluIHlvdXIgPEhFQUQ+XG4gICAgQ29weXJpZ2h0ICAgVGVybyBQaWlyYWluZW4gKHRpcGlpcmFpKVxuICAgIExpY2Vuc2UgICAgIE1JVCAvIGh0dHA6Ly9iaXQubHkvbWl0LWxpY2Vuc2VcbiAgICBWZXJzaW9uICAgICAwLjk2XG5cbiAgICBodHRwOi8vaGVhZGpzLmNvbVxuKi8oZnVuY3Rpb24oYSl7ZnVuY3Rpb24geigpe2R8fChkPSEwLHMoZSxmdW5jdGlvbihhKXtwKGEpfSkpfWZ1bmN0aW9uIHkoYyxkKXt2YXIgZT1hLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7ZS50eXBlPVwidGV4dC9cIisoYy50eXBlfHxcImphdmFzY3JpcHRcIiksZS5zcmM9Yy5zcmN8fGMsZS5hc3luYz0hMSxlLm9ucmVhZHlzdGF0ZWNoYW5nZT1lLm9ubG9hZD1mdW5jdGlvbigpe3ZhciBhPWUucmVhZHlTdGF0ZTshZC5kb25lJiYoIWF8fC9sb2FkZWR8Y29tcGxldGUvLnRlc3QoYSkpJiYoZC5kb25lPSEwLGQoKSl9LChhLmJvZHl8fGIpLmFwcGVuZENoaWxkKGUpfWZ1bmN0aW9uIHgoYSxiKXtpZihhLnN0YXRlPT1vKXJldHVybiBiJiZiKCk7aWYoYS5zdGF0ZT09bilyZXR1cm4gay5yZWFkeShhLm5hbWUsYik7aWYoYS5zdGF0ZT09bSlyZXR1cm4gYS5vbnByZWxvYWQucHVzaChmdW5jdGlvbigpe3goYSxiKX0pO2Euc3RhdGU9bix5KGEudXJsLGZ1bmN0aW9uKCl7YS5zdGF0ZT1vLGImJmIoKSxzKGdbYS5uYW1lXSxmdW5jdGlvbihhKXtwKGEpfSksdSgpJiZkJiZzKGcuQUxMLGZ1bmN0aW9uKGEpe3AoYSl9KX0pfWZ1bmN0aW9uIHcoYSxiKXthLnN0YXRlPT09dW5kZWZpbmVkJiYoYS5zdGF0ZT1tLGEub25wcmVsb2FkPVtdLHkoe3NyYzphLnVybCx0eXBlOlwiY2FjaGVcIn0sZnVuY3Rpb24oKXt2KGEpfSkpfWZ1bmN0aW9uIHYoYSl7YS5zdGF0ZT1sLHMoYS5vbnByZWxvYWQsZnVuY3Rpb24oYSl7YS5jYWxsKCl9KX1mdW5jdGlvbiB1KGEpe2E9YXx8aDt2YXIgYjtmb3IodmFyIGMgaW4gYSl7aWYoYS5oYXNPd25Qcm9wZXJ0eShjKSYmYVtjXS5zdGF0ZSE9bylyZXR1cm4hMTtiPSEwfXJldHVybiBifWZ1bmN0aW9uIHQoYSl7cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKT09XCJbb2JqZWN0IEZ1bmN0aW9uXVwifWZ1bmN0aW9uIHMoYSxiKXtpZighIWEpe3R5cGVvZiBhPT1cIm9iamVjdFwiJiYoYT1bXS5zbGljZS5jYWxsKGEpKTtmb3IodmFyIGM9MDtjPGEubGVuZ3RoO2MrKyliLmNhbGwoYSxhW2NdLGMpfX1mdW5jdGlvbiByKGEpe3ZhciBiO2lmKHR5cGVvZiBhPT1cIm9iamVjdFwiKWZvcih2YXIgYyBpbiBhKWFbY10mJihiPXtuYW1lOmMsdXJsOmFbY119KTtlbHNlIGI9e25hbWU6cShhKSx1cmw6YX07dmFyIGQ9aFtiLm5hbWVdO2lmKGQmJmQudXJsPT09Yi51cmwpcmV0dXJuIGQ7aFtiLm5hbWVdPWI7cmV0dXJuIGJ9ZnVuY3Rpb24gcShhKXt2YXIgYj1hLnNwbGl0KFwiL1wiKSxjPWJbYi5sZW5ndGgtMV0sZD1jLmluZGV4T2YoXCI/XCIpO3JldHVybiBkIT0tMT9jLnN1YnN0cmluZygwLGQpOmN9ZnVuY3Rpb24gcChhKXthLl9kb25lfHwoYSgpLGEuX2RvbmU9MSl9dmFyIGI9YS5kb2N1bWVudEVsZW1lbnQsYyxkLGU9W10sZj1bXSxnPXt9LGg9e30saT1hLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIikuYXN5bmM9PT0hMHx8XCJNb3pBcHBlYXJhbmNlXCJpbiBhLmRvY3VtZW50RWxlbWVudC5zdHlsZXx8d2luZG93Lm9wZXJhLGo9d2luZG93LmhlYWRfY29uZiYmaGVhZF9jb25mLmhlYWR8fFwiaGVhZFwiLGs9d2luZG93W2pdPXdpbmRvd1tqXXx8ZnVuY3Rpb24oKXtrLnJlYWR5LmFwcGx5KG51bGwsYXJndW1lbnRzKX0sbD0xLG09MixuPTMsbz00O2k/ay5qcz1mdW5jdGlvbigpe3ZhciBhPWFyZ3VtZW50cyxiPWFbYS5sZW5ndGgtMV0sYz17fTt0KGIpfHwoYj1udWxsKSxzKGEsZnVuY3Rpb24oZCxlKXtkIT1iJiYoZD1yKGQpLGNbZC5uYW1lXT1kLHgoZCxiJiZlPT1hLmxlbmd0aC0yP2Z1bmN0aW9uKCl7dShjKSYmcChiKX06bnVsbCkpfSk7cmV0dXJuIGt9OmsuanM9ZnVuY3Rpb24oKXt2YXIgYT1hcmd1bWVudHMsYj1bXS5zbGljZS5jYWxsKGEsMSksZD1iWzBdO2lmKCFjKXtmLnB1c2goZnVuY3Rpb24oKXtrLmpzLmFwcGx5KG51bGwsYSl9KTtyZXR1cm4ga31kPyhzKGIsZnVuY3Rpb24oYSl7dChhKXx8dyhyKGEpKX0pLHgocihhWzBdKSx0KGQpP2Q6ZnVuY3Rpb24oKXtrLmpzLmFwcGx5KG51bGwsYil9KSk6eChyKGFbMF0pKTtyZXR1cm4ga30say5yZWFkeT1mdW5jdGlvbihiLGMpe2lmKGI9PWEpe2Q/cChjKTplLnB1c2goYyk7cmV0dXJuIGt9dChiKSYmKGM9YixiPVwiQUxMXCIpO2lmKHR5cGVvZiBiIT1cInN0cmluZ1wifHwhdChjKSlyZXR1cm4gazt2YXIgZj1oW2JdO2lmKGYmJmYuc3RhdGU9PW98fGI9PVwiQUxMXCImJnUoKSYmZCl7cChjKTtyZXR1cm4ga312YXIgaT1nW2JdO2k/aS5wdXNoKGMpOmk9Z1tiXT1bY107cmV0dXJuIGt9LGsucmVhZHkoYSxmdW5jdGlvbigpe3UoKSYmcyhnLkFMTCxmdW5jdGlvbihhKXtwKGEpfSksay5mZWF0dXJlJiZrLmZlYXR1cmUoXCJkb21sb2FkZWRcIiwhMCl9KTtpZih3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcilhLmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIseiwhMSksd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIseiwhMSk7ZWxzZSBpZih3aW5kb3cuYXR0YWNoRXZlbnQpe2EuYXR0YWNoRXZlbnQoXCJvbnJlYWR5c3RhdGVjaGFuZ2VcIixmdW5jdGlvbigpe2EucmVhZHlTdGF0ZT09PVwiY29tcGxldGVcIiYmeigpfSk7dmFyIEE9MTt0cnl7QT13aW5kb3cuZnJhbWVFbGVtZW50fWNhdGNoKEIpe30hQSYmYi5kb1Njcm9sbCYmZnVuY3Rpb24oKXt0cnl7Yi5kb1Njcm9sbChcImxlZnRcIikseigpfWNhdGNoKGEpe3NldFRpbWVvdXQoYXJndW1lbnRzLmNhbGxlZSwxKTtyZXR1cm59fSgpLHdpbmRvdy5hdHRhY2hFdmVudChcIm9ubG9hZFwiLHopfSFhLnJlYWR5U3RhdGUmJmEuYWRkRXZlbnRMaXN0ZW5lciYmKGEucmVhZHlTdGF0ZT1cImxvYWRpbmdcIixhLmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsaGFuZGxlcj1mdW5jdGlvbigpe2EucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixoYW5kbGVyLCExKSxhLnJlYWR5U3RhdGU9XCJjb21wbGV0ZVwifSwhMSkpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtjPSEwLHMoZixmdW5jdGlvbihhKXthKCl9KX0sMzAwKX0pKGRvY3VtZW50KSIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gbmFtZS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5cXF5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIGZ1bmN0aW9uIEhlYWRlcnMoaGVhZGVycykge1xuICAgIHRoaXMubWFwID0ge31cblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUsIHZhbHVlcykge1xuICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHNlbGYuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgIH0gZWxzZSBpZiAoaGVhZGVycykge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHNlbGYuYXBwZW5kKG5hbWUsIGhlYWRlcnNbbmFtZV0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICB2YWx1ZSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICAgIHZhciBsaXN0ID0gdGhpcy5tYXBbbmFtZV1cbiAgICBpZiAoIWxpc3QpIHtcbiAgICAgIGxpc3QgPSBbXVxuICAgICAgdGhpcy5tYXBbbmFtZV0gPSBsaXN0XG4gICAgfVxuICAgIGxpc3QucHVzaCh2YWx1ZSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlWydkZWxldGUnXSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgdmFsdWVzID0gdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgICByZXR1cm4gdmFsdWVzID8gdmFsdWVzWzBdIDogbnVsbFxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSB8fCBbXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVOYW1lKG5hbWUpKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSA9IFtub3JtYWxpemVWYWx1ZSh2YWx1ZSldXG4gIH1cblxuICAvLyBJbnN0ZWFkIG9mIGl0ZXJhYmxlIGZvciBub3cuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMubWFwKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIGNhbGxiYWNrKG5hbWUsIHNlbGYubWFwW25hbWVdKVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBjb25zdW1lZChib2R5KSB7XG4gICAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKSlcbiAgICB9XG4gICAgYm9keS5ib2R5VXNlZCA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdClcbiAgICAgIH1cbiAgICAgIHJlYWRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IpXG4gICAgcmV0dXJuIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIH1cblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBibG9iOiAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJiAnQmxvYicgaW4gc2VsZiAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQmxvYigpO1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZlxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuXG4gICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gcmVhZEJsb2JBc1RleHQodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIHRleHQnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIHJldHVybiByZWplY3RlZCA/IHJlamVjdGVkIDogUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKEpTT04ucGFyc2UpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgcmV0dXJuIChtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSkgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KHVybCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdGhpcy51cmwgPSB1cmxcblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBvcHRpb25zLmJvZHkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzJylcbiAgICB9XG4gICAgdGhpcy5faW5pdEJvZHkob3B0aW9ucy5ib2R5KVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBoZWFkZXJzKHhocikge1xuICAgIHZhciBoZWFkID0gbmV3IEhlYWRlcnMoKVxuICAgIHZhciBwYWlycyA9IHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKS50cmltKCkuc3BsaXQoJ1xcbicpXG4gICAgcGFpcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgIHZhciBzcGxpdCA9IGhlYWRlci50cmltKCkuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHNwbGl0LnNoaWZ0KCkudHJpbSgpXG4gICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc6JykudHJpbSgpXG4gICAgICBoZWFkLmFwcGVuZChrZXksIHZhbHVlKVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy51cmwgPSBudWxsXG4gICAgdGhpcy5zdGF0dXMgPSBvcHRpb25zLnN0YXR1c1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSBvcHRpb25zLnN0YXR1c1RleHRcbiAgICB0aGlzLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzID8gb3B0aW9ucy5oZWFkZXJzIDogbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgc2VsZi5IZWFkZXJzID0gSGVhZGVycztcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdDtcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4gIHNlbGYuZmV0Y2ggPSBmdW5jdGlvbihpbnB1dCwgaW5pdCkge1xuICAgIC8vIFRPRE86IFJlcXVlc3QgY29uc3RydWN0b3Igc2hvdWxkIGFjY2VwdCBpbnB1dCwgaW5pdFxuICAgIHZhciByZXF1ZXN0XG4gICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpICYmICFpbml0KSB7XG4gICAgICByZXF1ZXN0ID0gaW5wdXRcbiAgICB9IGVsc2Uge1xuICAgICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICBmdW5jdGlvbiByZXNwb25zZVVSTCgpIHtcbiAgICAgICAgaWYgKCdyZXNwb25zZVVSTCcgaW4geGhyKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5yZXNwb25zZVVSTFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXZvaWQgc2VjdXJpdHkgd2FybmluZ3Mgb24gZ2V0UmVzcG9uc2VIZWFkZXIgd2hlbiBub3QgYWxsb3dlZCBieSBDT1JTXG4gICAgICAgIGlmICgvXlgtUmVxdWVzdC1VUkw6L20udGVzdCh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZXF1ZXN0LVVSTCcpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHN0YXR1cyA9ICh4aHIuc3RhdHVzID09PSAxMjIzKSA/IDIwNCA6IHhoci5zdGF0dXNcbiAgICAgICAgaWYgKHN0YXR1cyA8IDEwMCB8fCBzdGF0dXMgPiA1OTkpIHtcbiAgICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMoeGhyKSxcbiAgICAgICAgICB1cmw6IHJlc3BvbnNlVVJMKClcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSlcblxuICAgICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUsIHZhbHVlcykge1xuICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdClcbiAgICB9KVxuICB9XG4gIHNlbGYuZmV0Y2gucG9seWZpbGwgPSB0cnVlXG59KSgpO1xuIiwiaW1wb3J0ICdiYWJlbC1jb3JlL3BvbHlmaWxsJ1xuaW1wb3J0ICd3aGF0d2ctZmV0Y2gnXG5cbmltcG9ydCBoZWFkICAgZnJvbSAncmV2ZWFsLmpzL2xpYi9qcy9oZWFkLm1pbidcbmltcG9ydCBSZXZlYWwgZnJvbSAncmV2ZWFsLmpzL2pzL3JldmVhbCdcblxuaW1wb3J0IGxvYWREYXRhU3JjU1ZHIGZyb20gJy4vc3ZnJ1xuaW1wb3J0IGxvYWRQcmludENTUyAgIGZyb20gJy4vcHJpbnQnXG5cbnZhciBwcmVmaXggPSAnbm9kZV9tb2R1bGVzL3JldmVhbC5qcy9wbHVnaW4nXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoZXZlbnQpID0+IHtcblx0d2luZG93LlJldmVhbCA9IFJldmVhbFxuXHRSZXZlYWwuaW5pdGlhbGl6ZSh7XG5cdFx0Y29udHJvbHM6IGZhbHNlLFxuXHRcdHByb2dyZXNzOiB0cnVlLFxuXHRcdGhpc3Rvcnk6IHRydWUsXG5cdFx0Y2VudGVyOiB0cnVlLFxuXHRcdHRyYW5zaXRpb246ICdzbGlkZScsXG5cdFx0ZGVwZW5kZW5jaWVzOiBbXG5cdFx0XHR7IHNyYzogYCR7cHJlZml4fS9tYXJrZG93bi9tYXJrZWQuanNgLCBjb25kaXRpb246ICgpID0+ICEhZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtbWFya2Rvd25dJykgfSxcblx0XHRcdHsgc3JjOiBgJHtwcmVmaXh9L21hcmtkb3duL21hcmtkb3duLmpzYCwgY29uZGl0aW9uOiAoKSA9PiAhIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLW1hcmtkb3duXScpIH0sXG5cdFx0XHR7IHNyYzogYCR7cHJlZml4fS9oaWdobGlnaHQvaGlnaGxpZ2h0LmpzYCwgYXN5bmM6IHRydWUsIGNvbmRpdGlvbjogKCkgPT4gISFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcmUgY29kZScpLCBjYWxsYmFjazogKCkgPT4gaGxqcy5pbml0SGlnaGxpZ2h0aW5nT25Mb2FkKCkgfSxcblx0XHRcdHsgc3JjOiBgJHtwcmVmaXh9L3pvb20tanMvem9vbS5qc2AsIGFzeW5jOiB0cnVlIH0sXG5cdFx0XHR7IHNyYzogYCR7cHJlZml4fS9ub3Rlcy9ub3Rlcy5qc2AsIGFzeW5jOiB0cnVlIH0sXG5cdFx0XHR7IHNyYzogYCR7cHJlZml4fS9tYXRoL21hdGguanNgLCBhc3luYzogdHJ1ZSB9LFxuXHRcdF0sXG5cdH0pXG5cblx0bG9hZERhdGFTcmNTVkcoKVxuXHRsb2FkUHJpbnRDU1MoKVxufSlcbiIsIi8qKiBsb2FkcyB0aGUgUERGIHByaW50IHN0eWxlc2hlZXQgaWYgP3ByaW50LXBkZiBpcyBhcHBlbmRlZCB0byB0aGUgVVJMICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsb2FkUHJpbnRDU1MoKSB7XG5cdGNvbnN0IGNzc1ByZWZpeCA9ICdub2RlX21vZHVsZXMvcmV2ZWFsLmpzL2Nzcy9wcmludCdcblx0XG5cdGxldCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpXG5cdGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnXG5cdGxpbmsudHlwZSA9ICd0ZXh0L2Nzcydcblx0bGluay5ocmVmID0gYCR7Y3NzUHJlZml4fS8ke3dpbmRvdy5sb2NhdGlvbi5zZWFyY2gubWF0Y2goIC9wcmludC1wZGYvZ2kgKSA/ICdwZGYnIDogJ3BhcGVyJ30uY3NzYFxuXHRkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKGxpbmspXG59IiwiZnVuY3Rpb24gcmVwbGFjZUF0dHJpYnV0ZXMobmV3Xywgb2xkKSB7XG5cdGZvciAobGV0IGk9MDsgaTxvbGQuYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdGxldCBhdHRyID0gb2xkLmF0dHJpYnV0ZXNbaV1cblx0XHRuZXdfLnNldEF0dHJpYnV0ZShhdHRyLm5hbWUsIGF0dHIudmFsdWUpXG5cdH1cbn1cblxuLyoqIGVtYmVkIFNWR3MgdmlhIGRhdGEtc3JjXG4gKiBlLmcuIDxzdmcgZGF0YS1zcmM9XCJpbWFnZXMvdGVzdC5zdmdcIj48L3N2Zz4uXG4gKiBVc2VmdWwgZm9yIHN0eWxpbmcgYW5kIHVzaW5nIGNsYXNzPVwiZnJhZ21lbnRcIiBpbiBTVkcgY29kZVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsb2FkRGF0YVNyY1NWRygpIHtcblx0bGV0IHN2Z3NUb0xvYWQgPSBbIC4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3N2Z1tkYXRhLXNyY10nKSBdXG5cdFxuXHRsZXQgbG9hZFNWR3MgPSBzdmdzVG9Mb2FkLm1hcChzdmcgPT4gZmV0Y2goc3ZnLmdldEF0dHJpYnV0ZSgnZGF0YS1zcmMnKSlcblx0XHQudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS50ZXh0KCkpXG5cdFx0LnRoZW4oc3ZnQ29kZSA9PiB7XG5cdFx0XHRsZXQgc3ZnRG9jID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyhzdmdDb2RlLCAnaW1hZ2Uvc3ZnK3htbCcpXG5cdFx0XHRsZXQgbmV3U1ZHID0gc3ZnRG9jLmRvY3VtZW50RWxlbWVudFxuXHRcdFx0cmVwbGFjZUF0dHJpYnV0ZXMobmV3U1ZHLCBzdmcpXG5cdFx0XHRzdmcucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3U1ZHLCBzdmcpXG5cdFx0fSlcblx0XHQuY2F0Y2goZXJyb3IgPT4ge1xuXHRcdFx0aWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBUeXBlRXJyb3IpKVxuXHRcdFx0XHR0aHJvdyBlcnJvclxuXHRcdFx0bGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpXG5cdFx0XHRpbWcuc2V0QXR0cmlidXRlKCdzcmMnLCBzdmcuZ2V0QXR0cmlidXRlKCdkYXRhLXNyYycpKVxuXHRcdFx0cmVwbGFjZUF0dHJpYnV0ZXMoaW1nLCBzdmcpXG5cdFx0XHRzdmcucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoaW1nLCBzdmcpXG5cdFx0fSkpXG5cdFxuXHRQcm9taXNlLmFsbChsb2FkU1ZHcykudGhlbih2YWwgPT4ge1xuXHRcdGZvciAobGV0IHN2ZyBvZiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzdmcuc3RyZXRjaDpub3QoW3ByZXNlcnZlQXNwZWN0UmF0aW9dKScpKSB7XG5cdFx0XHRpZiAoIXN2Zy5oYXNBdHRyaWJ1dGUoJ3ZpZXdCb3gnKSkge1xuXHRcdFx0XHRsZXQgdyA9IHN2Zy5nZXRBdHRyaWJ1dGUoJ3dpZHRoJylcblx0XHRcdFx0bGV0IGggPSBzdmcuZ2V0QXR0cmlidXRlKCdoZWlnaHQnKVxuXHRcdFx0XHRzdmcuc2V0QXR0cmlidXRlKCd2aWV3Qm94JywgYDAgMCAke3d9ICR7aH1gKVxuXHRcdFx0fVxuXHRcdFx0c3ZnLnNldEF0dHJpYnV0ZSgncHJlc2VydmVBc3BlY3RSYXRpbycsICd4TWlkWU1pZCBtZWV0Jylcblx0XHR9XG5cdH0pXG59Il19
