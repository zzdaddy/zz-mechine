import{i as t,j as e}from"./index-c7e0ea1f.js";var r,n,i,s,a,o={exports:{}};
/*! store2 - v2.14.3 - 2024-02-14
* Copyright (c) 2024 Nathan Bubna; Licensed MIT */r=o,n=t,i=t&&t.define,(a=(s={version:"2.14.3",areas:{},apis:{},nsdelim:".",inherit:function(t,e){for(var r in t)e.hasOwnProperty(r)||Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r));return e},stringify:function(t,e){return void 0===t||"function"==typeof t?t+"":JSON.stringify(t,e||s.replace)},parse:function(t,e){try{return JSON.parse(t,e||s.revive)}catch(r){return t}},fn:function(t,e){for(var r in s.storeAPI[t]=e,s.apis)s.apis[r][t]=e},get:function(t,e){return t.getItem(e)},set:function(t,e,r){t.setItem(e,r)},remove:function(t,e){t.removeItem(e)},key:function(t,e){return t.key(e)},length:function(t){return t.length},clear:function(t){t.clear()},Store:function(t,e,r){var n=s.inherit(s.storeAPI,(function(t,e,r){return 0===arguments.length?n.getAll():"function"==typeof e?n.transact(t,e,r):void 0!==e?n.set(t,e,r):"string"==typeof t||"number"==typeof t?n.get(t):"function"==typeof t?n.each(t):t?n.setAll(t,e):n.clear()}));n._id=t;try{var i="__store2_test";e.setItem(i,"ok"),n._area=e,e.removeItem(i)}catch(a){n._area=s.storage("fake")}return n._ns=r||"",s.areas[t]||(s.areas[t]=n._area),s.apis[n._ns+n._id]||(s.apis[n._ns+n._id]=n),n},storeAPI:{area:function(t,e){var r=this[t];return r&&r.area||(r=s.Store(t,e,this._ns),this[t]||(this[t]=r)),r},namespace:function(t,e,r){if(r=r||this._delim||s.nsdelim,!t)return this._ns?this._ns.substring(0,this._ns.length-r.length):"";var n=t,i=this[n];if(!(i&&i.namespace||((i=s.Store(this._id,this._area,this._ns+n+r))._delim=r,this[n]||(this[n]=i),e)))for(var a in s.areas)i.area(a,s.areas[a]);return i},isFake:function(t){return t?(this._real=this._area,this._area=s.storage("fake")):!1===t&&(this._area=this._real||this._area),"fake"===this._area.name},toString:function(){return"store"+(this._ns?"."+this.namespace():"")+"["+this._id+"]"},has:function(t){return this._area.has?this._area.has(this._in(t)):!!(this._in(t)in this._area)},size:function(){return this.keys().length},each:function(t,e){for(var r=0,n=s.length(this._area);r<n;r++){var i=this._out(s.key(this._area,r));if(void 0!==i&&!1===t.call(this,i,this.get(i),e))break;n>s.length(this._area)&&(n--,r--)}return e||this},keys:function(t){return this.each((function(t,e,r){r.push(t)}),t||[])},get:function(t,e){var r,n=s.get(this._area,this._in(t));return"function"==typeof e&&(r=e,e=null),null!==n?s.parse(n,r):null!=e?e:n},getAll:function(t){return this.each((function(t,e,r){r[t]=e}),t||{})},transact:function(t,e,r){var n=this.get(t,r),i=e(n);return this.set(t,void 0===i?n:i),this},set:function(t,e,r){var n,i=this.get(t);return null!=i&&!1===r?e:("function"==typeof r&&(n=r,r=void 0),s.set(this._area,this._in(t),s.stringify(e,n),r)||i)},setAll:function(t,e){var r,n;for(var i in t)n=t[i],this.set(i,n,e)!==n&&(r=!0);return r},add:function(t,e,r){var n=this.get(t);if(n instanceof Array)e=n.concat(e);else if(null!==n){var i=typeof n;if(i===typeof e&&"object"===i){for(var a in e)n[a]=e[a];e=n}else e=n+e}return s.set(this._area,this._in(t),s.stringify(e,r)),e},remove:function(t,e){var r=this.get(t,e);return s.remove(this._area,this._in(t)),r},clear:function(){return this._ns?this.each((function(t){s.remove(this._area,this._in(t))}),1):s.clear(this._area),this},clearAll:function(){var t=this._area;for(var e in s.areas)s.areas.hasOwnProperty(e)&&(this._area=s.areas[e],this.clear());return this._area=t,this},_in:function(t){return"string"!=typeof t&&(t=s.stringify(t)),this._ns?this._ns+t:t},_out:function(t){return this._ns?t&&0===t.indexOf(this._ns)?t.substring(this._ns.length):void 0:t}},storage:function(t){return s.inherit(s.storageAPI,{items:{},name:t})},storageAPI:{length:0,has:function(t){return this.items.hasOwnProperty(t)},key:function(t){var e=0;for(var r in this.items)if(this.has(r)&&t===e++)return r},setItem:function(t,e){this.has(t)||this.length++,this.items[t]=e},removeItem:function(t){this.has(t)&&(delete this.items[t],this.length--)},getItem:function(t){return this.has(t)?this.items[t]:null},clear:function(){for(var t in this.items)this.removeItem(t)}}}).Store("local",function(){try{return localStorage}catch(t){}}())).local=a,a._=s,a.area("session",function(){try{return sessionStorage}catch(t){}}()),a.area("page",s.storage("page")),"function"==typeof i&&void 0!==i.amd?i("store2",[],(function(){return a})):r.exports?r.exports=a:(n.store&&(s.conflict=n.store),n.store=a);const h=e(o.exports);export{h as s};
