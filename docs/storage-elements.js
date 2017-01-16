(function(o){function s(u){if(t[u])return t[u].exports;var v=t[u]={exports:{},id:u,loaded:!1};return o[u].call(v.exports,v,v.exports,s),v.loaded=!0,v.exports}var t={};return s.m=o,s.c=t,s.p="",s(0)})([function(o,s,t){"use strict";var u=t(7),v=function(x){return x&&x.__esModule?x:{default:x}}(u);v.default.register()},function(o,s){"use strict";function t(y,z){if(u[y])throw Error(`Already registered handler for "${y}"`);u[y]=z}s.__esModule=!0,s.registerHandler=t,s.findHandler=function(z){return u[z]},s.listHandlers=function(){return Object.entries(u)};var u={};class v{constructor(y){this.storage=y}read(y){var z=y.map(A=>[A,this.storage.getItem(A)]).reduce((A,B)=>{var C=B[0],D=B[1];return A[C]=D,A},{});return Promise.resolve(z)}write(y){for(var z=Object.entries(y),A=Array.isArray(z),B=0,z=A?z:z[Symbol.iterator]();;){var C;if(A){if(B>=z.length)break;C=z[B++]}else{if(B=z.next(),B.done)break;C=B.value}var D=C,E=D[0],F=D[1];this.storage.setItem(E,F)}return Promise.resolve()}}s.WebStorageAreaHandler=v,"undefined"!=typeof localStorage&&t("local-storage",new v(localStorage)),"undefined"!=typeof sessionStorage&&t("session-storage",new v(sessionStorage));class w{constructor(y){this.storage=y}read(y){return new Promise(z=>this.storage.get(y,z))}write(y){return new Promise(z=>this.storage.set(y,z))}}s.ChromeStorageAreaHandler=w;class x extends w{constructor(y){super(y),this.delayMillis=3.6e6/y.MAX_WRITE_OPERATIONS_PER_HOUR+500,this.updatedEntries=null,this.writePromise=Promise.reject(Error("Illegal state"))}write(y){return null==this.updatedEntries?(this.updatedEntries=Object.assign({},y),this.writePromise=new Promise(z=>{setTimeout(()=>{null==this.updatedEntries||(this.storage.set(this.updatedEntries,z),this.updatedEntries=null)},this.delayMillis)}),this.writePromise):(Object.assign(this.updatedEntries,y),this.writePromise)}}s.BufferedWriteChromeStorageAreaHandler=x,"undefined"!=typeof chrome&&chrome.storage&&(chrome.storage.local&&t("chrome-local",new w(chrome.storage.local)),chrome.storage.sync&&t("chrome-sync",new x(chrome.storage.sync)))},function(o,s,t){"use strict";function u(I){if(I&&I.__esModule)return I;var J={};if(null!=I)for(var K in I)Object.prototype.hasOwnProperty.call(I,K)&&(J[K]=I[K]);return J.default=I,J}function v(I){return function(){var J=I.apply(this,arguments);return new Promise(function(K,L){function M(N,O){try{var P=J[N](O),Q=P.value}catch(R){return void L(R)}return P.done?void K(Q):Promise.resolve(Q).then(function(R){M("next",R)},function(R){M("throw",R)})}return M("next")})}}function w(I){return new F.default({a:new G(I),b:new H(I),diff(J,K){return{oldValue:J,newValue:K,isChanged:J!==K}}})}function x(I){var J=I.getArea();if(!J)return console.warn("Require 'area' attribute: ",I.getTarget()),null;var K=D.findHandler(J);return K?K:(console.warn("Unsupported 'area':",J,I.getTarget()),null)}function y(I){return I instanceof HTMLInputElement&&["checkbox","radio"].includes(I.type)?I.checked?I.value:I.dataset.uncheckedValue?I.dataset.uncheckedValue:"":null==I.value?void 0:I.value}function z(I,J){I instanceof HTMLInputElement&&["checkbox","radio"].includes(I.type)?I.checked=I.value===J:null!=I.value&&(I.value=J)}s.__esModule=!0;var A=t(3),B=u(A),C=t(1),D=u(C),E=t(5),F=function(J){return J&&J.__esModule?J:{default:J}}(E);s.default=class{constructor(J){var K=this;this.bindee=J,this.autoTask=null,this.init(),this.doAutoTask=B.mergeNextPromise(v(function*(){return K.bindee.isAutoSync()?void(yield K.sync()):void(K.bindee.isAutoLoad()&&(yield K.load()))}))}init(){var J=this;this.binder=w(this.bindee),this.binder.onChange=(()=>{var K=v(function*(L){var M={atob:"load",btoa:"submit",sync:"sync"}[L.type],N={type:M,target:J.bindee.getTarget(),isForce:L.isForce};J.onChange&&(yield J.onChange(N))});return function(){return K.apply(this,arguments)}})()}load(J){var K=this;return v(function*(){yield K.binder.aToB(J)})()}submit(J){var K=this;return v(function*(){yield K.binder.bToA(J)})()}sync(){var J=this;return v(function*(){yield J.binder.sync()})()}startAutoBinding(){var J=this;return v(function*(){J.autoTask&&J.autoTask.cancell(),J.autoTask=J.bindee.isAutoLoad()||J.bindee.isAutoSync()?B.periodicalTask({interval:function(){return J.bindee.getInterval()},task:J.doAutoTask}):null})()}};class G{constructor(I){this.bindee=I;var J=x(I);this.handler=J}readAll(){var I=this;return v(function*(){if(!I.handler)return new Map;var J=yield I.handler.read(Array.from(I.bindee.getNames())),K=Object.entries(J).filter(function(L){var M=L[1];return null!=M});return new Map(K)})()}write(I,J){var K=this;return v(function*(){if(K.handler){var L={};for(var M=I,N=Array.isArray(M),O=0,M=N?M:M[Symbol.iterator]();;){var P;if(N){if(O>=M.length)break;P=M[O++]}else{if(O=M.next(),O.done)break;P=O.value}var Q=P,R=Q[0],S=Q[1],T=S.newValue,U=S.isChanged;(J||U)&&(L[R]=T||"")}yield K.handler.write(L)}})()}}class H{constructor(I){this.bindee=I}readAll(){var I=new Map;for(var J=this.bindee.getElements(),K=Array.isArray(J),L=0,J=K?J:J[Symbol.iterator]();;){var M;if(K){if(L>=J.length)break;M=J[L++]}else{if(L=J.next(),L.done)break;M=L.value}var N=M,O=N.name;if(O){var P=I.get(O);if(!P){var Q=y(N);null==Q||I.set(O,Q)}}}return Promise.resolve(I)}write(I,J){var K=new Map(I);for(var L=this.bindee.getElements(),M=Array.isArray(L),N=0,L=M?L:L[Symbol.iterator]();;){var O;if(M){if(N>=L.length)break;O=L[N++]}else{if(N=L.next(),N.done)break;O=N.value}var P=O,Q=P.name;if(Q){var R=K.get(Q);if(R){var S=J||R.isChanged;if(S){var T=R.newValue||"";z(P,T)}}}}return Promise.resolve()}}},function(o,s){"use strict";function t(x){return function(){var y=x.apply(this,arguments);return new Promise(function(z,A){function B(C,D){try{var E=y[C](D),F=E.value}catch(G){return void A(G)}return E.done?void z(F):Promise.resolve(F).then(function(G){B("next",G)},function(G){B("throw",G)})}return B("next")})}}function u(x){var y=void 0;return new v(z=>{y=setTimeout(()=>z(),x)},()=>{clearTimeout(y)})}s.__esModule=!0,s.sleep=u,s.periodicalTask=function(y){var z=void 0;return new v(t(function*(){do yield y.task(),z=u(y.interval()),yield z;while(z)}),()=>{z&&z.cancell(),z=null})},s.dedup=function(y){var z=1<arguments.length&&void 0!==arguments[1]?arguments[1]:(A,B)=>A===B;return y.reduce((A,B)=>{if(A.some(C=>z(C,B)));return A.concat(B)},[])},s.subtractSet=function(y,z){return new Set(Array.from(y).filter(A=>!z.has(A)))},s.mergeNextPromise=function(y){var z=void 0,A=void 0;return t(function*(){return A?void(yield A):z?(A=t(function*(){z&&(yield z),A=null,z=y(),yield z,z=null})(),void(yield A)):void(z=t(function*(){yield y(),z=null})(),yield z)})};class v extends Promise{constructor(x,y){super(x),this.cancell=y}}s.CancellablePromise=v;class w extends Map{*flattenValues(){for(var x=this.values(),y=Array.isArray(x),z=0,x=y?x:x[Symbol.iterator]();;){var A;if(y){if(z>=x.length)break;A=x[z++]}else{if(z=x.next(),z.done)break;A=z.value}var B=A;for(var C=B,D=Array.isArray(C),E=0,C=D?C:C[Symbol.iterator]();;){var F;if(D){if(E>=C.length)break;F=C[E++]}else{if(E=C.next(),E.done)break;F=E.value}var G=F;yield G}}}}s.ArrayValueMap=class extends w{add(y,z){var A=this.get(y);return A||(A=[],this.set(y,A)),A.push(z),this}getOrSetEmpty(y){var z=super.get(y);if(null==z){var A=[];return super.set(y,A),A}return z}},s.SetValueMap=class extends w{add(y,z){var A=this.get(y);return A||(A=new Set,this.set(y,A)),A.add(z),this}}},function(o,s,t){"use strict";function u(J){return function(){var K=J.apply(this,arguments);return new Promise(function(L,M){function N(O,P){try{var Q=K[O](P),R=Q.value}catch(S){return void M(S)}return Q.done?void L(R):Promise.resolve(R).then(function(S){N("next",S)},function(S){N("throw",S)})}return N("next")})}}function v(J){return class extends J{get area(){return C(this,"area")}set area(K){this.setAttribute("area",K)}constructor(){super()}createdCallback(){var K=this;this.binder=new E.default(w(this)),this.binder.onChange=(()=>{var L=u(function*(M){z(K),B(K,`area-select-${M.type}`,M)});return function(){return L.apply(this,arguments)}})(),x(this,u(function*(){yield K.binder.submit()}))}attachedCallback(){0===this.length&&A(this),this.binder.doAutoTask(),z(this)}static get observedAttributes(){return["area"]}attributeChangedCallback(K){"area"===K?(this.binder.init(),this.binder.doAutoTask()):void 0}sync(){return this.binder?this.binder.sync():Promise.resolve()}}}function w(J){return{getArea:()=>J.area,getInterval:()=>700,isAutoSync:()=>!0,isAutoLoad:()=>!1,getNames:()=>[J.name],getElements:()=>[J],getTarget:()=>J}}function x(J,K){var L=J.value;u(function*(){for(;;)yield y(),J.value===L||(L=J.value,yield K())})()}function y(){return new Promise(J=>requestAnimationFrame(J))}function z(J){var K=J.form;null==K||K.setAttribute("area",J.value)}function A(J){for(var K=G.listHandlers(),L=Array.isArray(K),M=0,K=L?K:K[Symbol.iterator]();;){var N;if(L){if(M>=K.length)break;N=K[M++]}else{if(M=K.next(),M.done)break;N=M.value}var O=N,P=O[0],Q=document.createElement("option");Q.innerHTML=P,J.appendChild(Q)}}function B(J,K,L){return J.dispatchEvent(new CustomEvent(K,L))}function C(J,K){var L=J.getAttribute(K);return L?L:""}s.__esModule=!0,s.mixinAreaSelect=v;var D=t(2),E=function(K){return K&&K.__esModule?K:{default:K}}(D),F=t(1),G=function(K){if(K&&K.__esModule)return K;var L={};if(null!=K)for(var M in K)Object.prototype.hasOwnProperty.call(K,M)&&(L[M]=K[M]);return L.default=K,L}(F),H=v(HTMLSelectElement);class I extends H{static get extends(){return"select"}}s.default=I},function(o,s){"use strict";function t(y){return function(){var z=y.apply(this,arguments);return new Promise(function(A,B){function C(D,E){try{var F=z[D](E),G=F.value}catch(H){return void B(H)}return F.done?void A(G):Promise.resolve(G).then(function(H){C("next",H)},function(H){C("throw",H)})}return C("next")})}}function*u(){for(var y=arguments.length,z=Array(y),A=0;A<y;A++)z[A]=arguments[A];for(var B=z,C=Array.isArray(B),D=0,B=C?B:B[Symbol.iterator]();;){var E;if(C){if(D>=B.length)break;E=B[D++]}else{if(D=B.next(),D.done)break;E=D.value}var F=E;for(var G=F,H=Array.isArray(G),I=0,G=H?G:G[Symbol.iterator]();;){var J;if(H){if(I>=G.length)break;J=G[I++]}else{if(I=G.next(),I.done)break;J=I.value}var K=J;yield K}}}function*v(y,z){for(var A=y,B=Array.isArray(A),C=0,A=B?A:A[Symbol.iterator]();;){var D;if(B){if(C>=A.length)break;D=A[C++]}else{if(C=A.next(),C.done)break;D=C.value}var E=D;yield z(E)}}s.__esModule=!0;var w=(()=>{var y=t(function*(z,A){for(;z.lock;)yield z.lock;z.lock=A();var B=yield z.lock;return z.lock=null,B});return function(){return y.apply(this,arguments)}})(),x=(()=>{var y=t(function*(z,A,B,C){var D=yield A.readAll(),E=z.values;z.values=D;var F=new Set(u(E.keys(),D.keys())),G=!1,H=v(F,function(I){var J=z.handler.diff(E.get(I),D.get(I));return G=G||J.isChanged,[I,J]});return yield B.write(H,C),G});return function(){return y.apply(this,arguments)}})();s.default=class{constructor(z){this.handler=z,this.values=new Map,this.lock=null}aToB(){var z=arguments,A=this;return t(function*(){var B=0<z.length&&void 0!==z[0]?z[0]:{force:!1},C=yield w(A,function(){return x(A,A.handler.a,A.handler.b,B.force)});C&&A.onChange&&(yield A.onChange({type:"atob",isForce:B.force}))})()}bToA(){var z=arguments,A=this;return t(function*(){var B=0<z.length&&void 0!==z[0]?z[0]:{force:!1},C=yield w(A,function(){return x(A,A.handler.b,A.handler.a,B.force)});C&&A.onChange&&(yield A.onChange({type:"btoa",isForce:B.force}))})()}sync(){var z=this;return t(function*(){var A=!1;yield w(z,t(function*(){A=(yield x(z,z.handler.a,z.handler.b,!1))||A,A=(yield x(z,z.handler.b,z.handler.a,!1))||A})),A&&z.onChange&&(yield z.onChange({type:"sync",isForce:!1}))})()}}},function(o,s){"use strict";function t(w){return class extends w{createdCallback(){this.addEventListener("click",x=>{x.preventDefault(),this.form&&"function"==typeof this.form.load?this.form.load():console.error("Unsupported form: ",this.form)})}}}s.__esModule=!0,s.mixinLoadButton=t;var u=t(HTMLButtonElement);class v extends u{static get extends(){return"button"}}s.default=v},function(o,s,t){"use strict";function u(U){return U&&U.__esModule?U:{default:U}}function v(U){if(U&&U.__esModule)return U;var V={};if(null!=U)for(var W in U)Object.prototype.hasOwnProperty.call(U,W)&&(V[W]=U[W]);return V.default=U,V}function w(U){return function(){var V=U.apply(this,arguments);return new Promise(function(W,X){function Y(Z,$){try{var _=V[Z]($),aa=_.value}catch(ba){return void X(ba)}return _.done?void W(aa):Promise.resolve(aa).then(function(ba){Y("next",ba)},function(ba){Y("throw",ba)})}return Y("next")})}}function x(U){return class extends U{get autosync(){return this.hasAttribute("autosync")}set autosync(V){F(this,"autosync",V)}get autoload(){return this.hasAttribute("autoload")}set autoload(V){F(this,"autoload",V)}get interval(){var V=parseInt(E(this,"interval"));return 300<V?V:700}set interval(V){this.setAttribute("interval",V)}get area(){return E(this,"area")}set area(V){this.setAttribute("area",V)}constructor(){super()}createdCallback(){var V=this;this.binder=new L.default(y(this)),this.binder.onChange=(()=>{var W=w(function*(X){A(V,`storage-form-${X.type}`,X)});return function(){return W.apply(this,arguments)}})(),this.binder.startAutoBinding(),this.addEventListener("submit",W=>{W.preventDefault(),this.binder.submit({force:!0})}),B(this)}attachedCallback(){this.binder.startAutoBinding()}static get observedAttributes(){return["autosync","autoload","area"]}attributeChangedCallback(V){"autosync"===V||"autoload"===V?this.binder.startAutoBinding():"area"===V?(this.initBinder(),this.binder.doAutoTask()):void 0}initBinder(){this.binder.init()}load(){return this.binder.load({force:!0})}sync(){return this.binder.sync()}}}function y(U){return{getArea:()=>U.area,getInterval:()=>U.interval,isAutoSync:()=>U.autosync,isAutoLoad:()=>U.autoload,getNames:()=>H(z(U),V=>V.name),getElements:()=>z(U),getTarget:()=>U}}function*z(U){for(var V=U.elements,W=Array.isArray(V),X=0,V=W?V:V[Symbol.iterator]();;){var Y;if(W){if(X>=V.length)break;Y=V[X++]}else{if(X=V.next(),X.done)break;Y=X.value}var Z=Y;null==Z.area&&Z.name&&(yield Z)}}function A(U,V,W){return U.dispatchEvent(new CustomEvent(V,W))}function B(U){function V(Y){var Z=new MutationObserver(()=>U.binder.doAutoTask());Z.observe(Y,{attributes:!0,atributeFilter:["name"]}),X.set(Y,Z)}function W(Y){var Z=X.get(Y);null==Z||(Z.disconnect(),X.delete(Y))}var X=new Map;C(U,(()=>{var Y=w(function*(Z){var $=Z.addedElements,_=Z.removedElements;for(var aa=$,ba=Array.isArray(aa),ca=0,aa=ba?aa:aa[Symbol.iterator]();;){var da;if(ba){if(ca>=aa.length)break;da=aa[ca++]}else{if(ca=aa.next(),ca.done)break;da=ca.value}var ea=da;V(ea)}for(var fa=_,ga=Array.isArray(fa),ha=0,fa=ga?fa:fa[Symbol.iterator]();;){var ia;if(ga){if(ha>=fa.length)break;ia=fa[ha++]}else{if(ha=fa.next(),ha.done)break;ia=ha.value}var ja=ia;W(ja)}yield U.binder.doAutoTask()});return function(){return Y.apply(this,arguments)}})())}function C(U,V){var W=U.elements;w(function*(){for(;;){yield G();var X=U.elements;if(!D(W,X)){var Y=new Set(W),Z=new Set(X),$=J.subtractSet(Z,Y),_=J.subtractSet(Y,Z);W=X,yield V({addedElements:$,removedElements:_})}}})()}function D(U,V){if(U.length!==V.length)return!1;var W=U.length;for(var X=0;X<W;X++)if(U[X]!==V[X])return!1;return!0}function E(U,V){var W=U.getAttribute(V);return W?W:""}function F(U,V,W){W?U.setAttribute(V,""):U.removeAttribute(V)}function G(){return new Promise(U=>requestAnimationFrame(U))}function*H(U,V){for(var W=U,X=Array.isArray(W),Y=0,W=X?W:W[Symbol.iterator]();;){var Z;if(X){if(Y>=W.length)break;Z=W[Y++]}else{if(Y=W.next(),Y.done)break;Z=Y.value}var $=Z;yield V($)}}s.__esModule=!0,s.mixinStorageForm=x;var I=t(3),J=v(I),K=t(2),L=u(K),M=t(1),N=v(M),O=t(4),P=u(O),Q=t(6),R=u(Q),S=x(HTMLFormElement);class T extends S{static get extends(){return"form"}static register(){document.registerElement("storage-form",T),document.registerElement("area-select",P.default),document.registerElement("load-button",R.default)}}s.default=T}]);
//# sourceMappingURL=storage-elements.js.map