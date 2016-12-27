(function(h){function j(l){if(k[l])return k[l].exports;var m=k[l]={exports:{},id:l,loaded:!1};return h[l].call(m.exports,m,m.exports,j),m.loaded=!0,m.exports}var k={};return j.m=h,j.c=k,j.p="",j(0)})([function(h,j,k){"use strict";function l(y){if(y&&y.__esModule)return y;var z={};if(null!=y)for(var A in y)Object.prototype.hasOwnProperty.call(y,A)&&(z[A]=y[A]);return z.default=y,z}function m(y){return y&&y.__esModule?y:{default:y}}var n=k(2),o=m(n),p=k(4),q=l(p),r=k(1),s=l(r),t=k(6),v=m(t),w=k(3),x=m(w);localStorage&&s.registerHandler("local-storage",new v.default(localStorage)),sessionStorage&&s.registerHandler("session-storage",new v.default(sessionStorage)),chrome&&chrome.storage&&(chrome.storage.local&&s.registerHandler("chrome-local",new x.default(chrome.storage.local)),chrome.storage.sync&&s.registerHandler("chrome-sync",new x.default(chrome.storage.sync))),[["storage-form",o.default,"form"],["storage-input",q.StorageInputElement,"input"],["storage-textarea",q.StorageTextAreaElement,"textarea"],["storage-select",q.StorageSelectElement,"select"]].forEach(y=>{var z=y[0],A=y[1],B=y[2];Object.defineProperty(A,"extends",{get:()=>B}),document.registerElement(z,A)})},function(h,j){"use strict";j.__esModule=!0,j.registerHandler=function(m,n){if(k[m])throw Error(`Already registered handler for "${m}"`);k[m]=n},j.findHandler=function(m){return k[m]};var k={}},function(h,j,k){"use strict";function l(p){return function(){var q=p.apply(this,arguments);return new Promise(function(r,s){function t(v,w){try{var x=q[v](w),y=x.value}catch(z){return void s(z)}return x.done?void r(y):Promise.resolve(y).then(function(z){t("next",z)},function(z){t("throw",z)})}return t("next")})}}j.__esModule=!0;var m=k(5),n=function(q){if(q&&q.__esModule)return q;var r={};if(null!=q)for(var s in q)Object.prototype.hasOwnProperty.call(q,s)&&(r[s]=q[s]);return r.default=q,r}(m);class o extends HTMLFormElement{constructor(){super()}createdCallback(){this.addEventListener("submit",p=>{p.preventDefault(),this.store()}),this.isAutoSyncEnabled()&&this.periodicalSync()}store(){var p=this;return l(function*(){var q=Array.from(p.elements).reduce(function(r,s){if(!(s.store instanceof Function))return r;var t=s.name;return t?r.has(t)?s.checked?(r.set(t,s),r):r:(r.set(t,s),r):r},new Map);yield Promise.all(Array.from(q.values()).map(function(r){return r.store()}))})()}sync(){var p=this;return l(function*(){var q=p.getSyncDelay();return null==q?Promise.reject(Error("Require positive integer value 'sync-delay' attribute")):0>=q?Promise.reject(Error(`Require positive number for "sync-delay": ${q}`)):(yield n.sleep(q),p.isAutoSyncEnabled()?p.store():void 0)})()}isAutoSyncEnabled(){return this.hasAttribute("sync")&&null!==this.getSyncDelay()}getSyncDelay(){var p=this.getAttribute("sync-delay");if(!p)return null;var q=parseInt(p);return 0>=q?null:q}periodicalSync(){var p=this;return l(function*(){for(;p.isAutoSyncEnabled();)yield p.sync()})()}attachedCallback(){}detachedCallback(){}static get observedAttributes(){return["sync","sync-delay"]}attributeChangedCallback(p){("sync"===p||"sync-delay"===p)&&this.periodicalSync()}}j.default=o},function(h,j){"use strict";j.__esModule=!0,j.default=class{constructor(l){this.storage=l}read(l){return new Promise(m=>this.storage.get(l,n=>m(n[l])))}write(l,m){return new Promise(n=>this.storage.set({[l]:m},n))}removeItem(l){return new Promise(m=>this.storage.remove(l,m))}}},function(h,j,k){"use strict";function l(s){return function(){var t=s.apply(this,arguments);return new Promise(function(v,w){function x(y,z){try{var A=t[y](z),B=A.value}catch(C){return void w(C)}return A.done?void v(B):Promise.resolve(B).then(function(C){x("next",C)},function(C){x("throw",C)})}return x("next")})}}function m(s){return class extends s{constructor(){super()}createdCallback(){this.name&&this.load()}attachedCallback(){this.load()}load(){var t=this;return l(function*(){if(!t.name)throw Error("\"name\" attribute are required");var v=yield t.getAreaHandler().read(t.name);t.value=v?v:""})()}getAreaHandler(){var t=this.getArea();if(!t)throw Error("\"area\" attribute is required");var v=o.findHandler(t);if(!v)throw Error(`Unsupported area: ${t}`);return v}getArea(){var t=this.getAttribute("area");if(t)return t;var v=this.getForm().getAttribute("area");return v?v:null}getForm(){var t=this.form;if(t instanceof q.default)return t;throw Error(`'${this.getAttribute("is")+""}' requires `+"'<form is=\"storage-form\" ...>' as a parent Node")}store(){var t=this;return l(function*(){if(!t.name)throw Error("\"name\" attribute are required");yield t.getAreaHandler().write(t.name,t.value)})()}detachedCallback(){}}}j.__esModule=!0,j.StorageInputElement=j.StorageSelectElement=j.StorageTextAreaElement=void 0,j.mixinStorageElement=m;var n=k(1),o=function(t){if(t&&t.__esModule)return t;var v={};if(null!=t)for(var w in t)Object.prototype.hasOwnProperty.call(t,w)&&(v[w]=t[w]);return v.default=t,v}(n),p=k(2),q=function(t){return t&&t.__esModule?t:{default:t}}(p);j.StorageTextAreaElement=m(HTMLTextAreaElement),j.StorageSelectElement=m(HTMLSelectElement);var r=m(HTMLInputElement);j.StorageInputElement=class extends r{load(){if(!this.name)throw Error("\"name\" attribute are required");return"checkbox"===this.type?this.getAreaHandler().read(this.name).then(t=>{this.checked=null!=t,this.store()}):"radio"===this.type?this.getAreaHandler().read(this.name).then(t=>{this.checked=this.value===t}):super.load()}store(){if(!this.name)throw Error("\"name\" attribute are required");return"checkbox"===this.type?this.checked?super.store():this.deleteStore():"radio"===this.type?this.checked?super.store():Promise.resolve():super.store()}deleteStore(){return this.getAreaHandler().removeItem(this.name)}}},function(h,j){"use strict";j.__esModule=!0,j.sleep=function(l){return new Promise(m=>{setInterval(()=>m(),l)})}},function(h,j){"use strict";j.__esModule=!0,j.default=class{constructor(l){this.storage=l}read(l){return Promise.resolve(this.storage.getItem(l))}write(l,m){return this.storage.setItem(l,m),Promise.resolve()}removeItem(l){return this.storage.removeItem(l),Promise.resolve()}}}]);
//# sourceMappingURL=storage-elements.js.map