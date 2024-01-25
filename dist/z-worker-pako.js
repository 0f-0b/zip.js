!function(){"use strict";const{Array:e,Object:t,Number:n,Math:s,Error:r,Uint8Array:a,Uint16Array:o,Uint32Array:i,Int32Array:c,Map:l,DataView:u,Promise:h,TextEncoder:f,crypto:p,postMessage:d,TransformStream:g,ReadableStream:w,WritableStream:y,CompressionStream:m,DecompressionStream:_}=self;class b{constructor(e){return class extends g{constructor(t,n){const s=new e(n);super({transform(e,t){t.enqueue(s.append(e))},flush(e){const t=s.flush();t&&e.enqueue(t)}})}}}}const S=[];for(let e=0;256>e;e++){let t=e;for(let e=0;8>e;e++)1&t?t=t>>>1^3988292384:t>>>=1;S[e]=t}class v{constructor(e){this.crc=e||-1}append(e){let t=0|this.crc;for(let n=0,s=0|e.length;s>n;n++)t=t>>>8^S[255&(t^e[n])];this.crc=t}get(){return~this.crc}}class k extends g{constructor(){let e;const t=new v;super({transform(e,n){t.append(e),n.enqueue(e)},flush(){const n=new a(4);new u(n.buffer).setUint32(0,t.get()),e.value=n}}),e=this}}const z={concat(e,t){if(0===e.length||0===t.length)return e.concat(t);const n=e[e.length-1],s=z.getPartial(n);return 32===s?e.concat(t):z._shiftRight(t,s,0|n,e.slice(0,e.length-1))},bitLength(e){const t=e.length;if(0===t)return 0;const n=e[t-1];return 32*(t-1)+z.getPartial(n)},clamp(e,t){if(32*e.length<t)return e;const n=(e=e.slice(0,s.ceil(t/32))).length;return t&=31,n>0&&t&&(e[n-1]=z.partial(t,e[n-1]&2147483648>>t-1,1)),e},partial:(e,t,n)=>32===e?t:(n?0|t:t<<32-e)+1099511627776*e,getPartial:e=>s.round(e/1099511627776)||32,_shiftRight(e,t,n,s){for(void 0===s&&(s=[]);t>=32;t-=32)s.push(n),n=0;if(0===t)return s.concat(e);for(let r=0;r<e.length;r++)s.push(n|e[r]>>>t),n=e[r]<<32-t;const r=e.length?e[e.length-1]:0,a=z.getPartial(r);return s.push(z.partial(t+a&31,t+a>32?n:s.pop(),1)),s}},D={bytes:{fromBits(e){const t=z.bitLength(e)/8,n=new a(t);let s;for(let r=0;t>r;r++)0==(3&r)&&(s=e[r/4]),n[r]=s>>>24,s<<=8;return n},toBits(e){const t=[];let n,s=0;for(n=0;n<e.length;n++)s=s<<8|e[n],3==(3&n)&&(t.push(s),s=0);return 3&n&&t.push(z.partial(8*(3&n),s)),t}}},C=class{constructor(e){const t=this;t.blockSize=512,t._init=[1732584193,4023233417,2562383102,271733878,3285377520],t._key=[1518500249,1859775393,2400959708,3395469782],e?(t._h=e._h.slice(0),t._buffer=e._buffer.slice(0),t._length=e._length):t.reset()}reset(){const e=this;return e._h=e._init.slice(0),e._buffer=[],e._length=0,e}update(e){const t=this;"string"==typeof e&&(e=D.utf8String.toBits(e));const n=t._buffer=z.concat(t._buffer,e),s=t._length,a=t._length=s+z.bitLength(e);if(a>9007199254740991)throw new r("Cannot hash more than 2^53 - 1 bits");const o=new i(n);let c=0;for(let e=t.blockSize+s-(t.blockSize+s&t.blockSize-1);a>=e;e+=t.blockSize)t._block(o.subarray(16*c,16*(c+1))),c+=1;return n.splice(0,16*c),t}finalize(){const e=this;let t=e._buffer;const n=e._h;t=z.concat(t,[z.partial(1,1)]);for(let e=t.length+2;15&e;e++)t.push(0);for(t.push(s.floor(e._length/4294967296)),t.push(0|e._length);t.length;)e._block(t.splice(0,16));return e.reset(),n}_f(e,t,n,s){return e>19?e>39?e>59?e>79?void 0:t^n^s:t&n|t&s|n&s:t^n^s:t&n|~t&s}_S(e,t){return t<<e|t>>>32-e}_block(t){const n=this,r=n._h,a=e(80);for(let e=0;16>e;e++)a[e]=t[e];let o=r[0],i=r[1],c=r[2],l=r[3],u=r[4];for(let e=0;79>=e;e++){16>e||(a[e]=n._S(1,a[e-3]^a[e-8]^a[e-14]^a[e-16]));const t=n._S(5,o)+n._f(e,i,c,l)+u+a[e]+n._key[s.floor(e/20)]|0;u=l,l=c,c=n._S(30,i),i=o,o=t}r[0]=r[0]+o|0,r[1]=r[1]+i|0,r[2]=r[2]+c|0,r[3]=r[3]+l|0,r[4]=r[4]+u|0}},I={getRandomValues(e){const t=new i(e.buffer),n=e=>{let t=987654321;const n=4294967295;return()=>(t=36969*(65535&t)+(t>>16)&n,(((t<<16)+(e=18e3*(65535&e)+(e>>16)&n)&n)/4294967296+.5)*(s.random()>.5?1:-1))};for(let r,a=0;a<e.length;a+=4){const e=n(4294967296*(r||s.random()));r=987654071*e(),t[a/4]=4294967296*e()|0}return e}},q={importKey:e=>new q.hmacSha1(D.bytes.toBits(e)),pbkdf2(e,t,n,s){if(n=n||1e4,0>s||0>n)throw new r("invalid params to pbkdf2");const a=1+(s>>5)<<2;let o,i,c,l,h;const f=new ArrayBuffer(a),p=new u(f);let d=0;const g=z;for(t=D.bytes.toBits(t),h=1;(a||1)>d;h++){for(o=i=e.encrypt(g.concat(t,[h])),c=1;n>c;c++)for(i=e.encrypt(i),l=0;l<i.length;l++)o[l]^=i[l];for(c=0;(a||1)>d&&c<o.length;c++)p.setInt32(d,o[c]),d+=4}return f.slice(0,s/8)},hmacSha1:class{constructor(e){const t=this,n=t._hash=C,s=[[],[]];t._baseHash=[new n,new n];const r=t._baseHash[0].blockSize/32;e.length>r&&(e=(new n).update(e).finalize());for(let t=0;r>t;t++)s[0][t]=909522486^e[t],s[1][t]=1549556828^e[t];t._baseHash[0].update(s[0]),t._baseHash[1].update(s[1]),t._resultHash=new n(t._baseHash[0])}reset(){const e=this;e._resultHash=new e._hash(e._baseHash[0]),e._updated=!1}update(e){this._updated=!0,this._resultHash.update(e)}digest(){const e=this,t=e._resultHash.finalize(),n=new e._hash(e._baseHash[1]).update(t).finalize();return e.reset(),n}encrypt(e){if(this._updated)throw new r("encrypt on already updated hmac called!");return this.update(e),this.digest(e)}}},A=void 0!==p&&"function"==typeof p.getRandomValues,R="Invalid password",H="Invalid signature",B="zipjs-abort-check-password";function K(e){return A?p.getRandomValues(e):I.getRandomValues(e)}const T=16,V={name:"PBKDF2"},x=t.assign({hash:{name:"HMAC"}},V),P=t.assign({iterations:1e3,hash:{name:"SHA-1"}},V),E=["deriveBits"],U=[8,12,16],W=[16,24,32],M=10,N=[0,0,0,0],O="undefined",L="function",F=typeof p!=O,j=F&&p.subtle,G=F&&typeof j!=O,X=D.bytes,J=class{constructor(e){const t=this;t._tables=[[[],[],[],[],[]],[[],[],[],[],[]]],t._tables[0][0][0]||t._precompute();const n=t._tables[0][4],s=t._tables[1],a=e.length;let o,i,c,l=1;if(4!==a&&6!==a&&8!==a)throw new r("invalid aes key size");for(t._key=[i=e.slice(0),c=[]],o=a;4*a+28>o;o++){let e=i[o-1];(o%a==0||8===a&&o%a==4)&&(e=n[e>>>24]<<24^n[e>>16&255]<<16^n[e>>8&255]<<8^n[255&e],o%a==0&&(e=e<<8^e>>>24^l<<24,l=l<<1^283*(l>>7))),i[o]=i[o-a]^e}for(let e=0;o;e++,o--){const t=i[3&e?o:o-4];c[e]=4>=o||4>e?t:s[0][n[t>>>24]]^s[1][n[t>>16&255]]^s[2][n[t>>8&255]]^s[3][n[255&t]]}}encrypt(e){return this._crypt(e,0)}decrypt(e){return this._crypt(e,1)}_precompute(){const e=this._tables[0],t=this._tables[1],n=e[4],s=t[4],r=[],a=[];let o,i,c,l;for(let e=0;256>e;e++)a[(r[e]=e<<1^283*(e>>7))^e]=e;for(let u=o=0;!n[u];u^=i||1,o=a[o]||1){let a=o^o<<1^o<<2^o<<3^o<<4;a=a>>8^255&a^99,n[u]=a,s[a]=u,l=r[c=r[i=r[u]]];let h=16843009*l^65537*c^257*i^16843008*u,f=257*r[a]^16843008*a;for(let n=0;4>n;n++)e[n][u]=f=f<<24^f>>>8,t[n][a]=h=h<<24^h>>>8}for(let n=0;5>n;n++)e[n]=e[n].slice(0),t[n]=t[n].slice(0)}_crypt(e,t){if(4!==e.length)throw new r("invalid aes block size");const n=this._key[t],s=n.length/4-2,a=[0,0,0,0],o=this._tables[t],i=o[0],c=o[1],l=o[2],u=o[3],h=o[4];let f,p,d,g=e[0]^n[0],w=e[t?3:1]^n[1],y=e[2]^n[2],m=e[t?1:3]^n[3],_=4;for(let e=0;s>e;e++)f=i[g>>>24]^c[w>>16&255]^l[y>>8&255]^u[255&m]^n[_],p=i[w>>>24]^c[y>>16&255]^l[m>>8&255]^u[255&g]^n[_+1],d=i[y>>>24]^c[m>>16&255]^l[g>>8&255]^u[255&w]^n[_+2],m=i[m>>>24]^c[g>>16&255]^l[w>>8&255]^u[255&y]^n[_+3],_+=4,g=f,w=p,y=d;for(let e=0;4>e;e++)a[t?3&-e:e]=h[g>>>24]<<24^h[w>>16&255]<<16^h[y>>8&255]<<8^h[255&m]^n[_++],f=g,g=w,w=y,y=m,m=f;return a}},Q=class{constructor(e,t){this._prf=e,this._initIv=t,this._iv=t}reset(){this._iv=this._initIv}update(e){return this.calculate(this._prf,e,this._iv)}incWord(e){if(255==(e>>24&255)){let t=e>>16&255,n=e>>8&255,s=255&e;255===t?(t=0,255===n?(n=0,255===s?s=0:++s):++n):++t,e=0,e+=t<<16,e+=n<<8,e+=s}else e+=1<<24;return e}incCounter(e){0===(e[0]=this.incWord(e[0]))&&(e[1]=this.incWord(e[1]))}calculate(e,t,n){let s;if(!(s=t.length))return[];const r=z.bitLength(t);for(let r=0;s>r;r+=4){this.incCounter(n);const s=e.encrypt(n);t[r]^=s[0],t[r+1]^=s[1],t[r+2]^=s[2],t[r+3]^=s[3]}return z.clamp(t,r)}},Y=q.hmacSha1;let Z=F&&G&&typeof j.importKey==L,$=F&&G&&typeof j.deriveBits==L;class ee extends g{constructor({password:e,signed:n,encryptionStrength:s,checkPasswordOnly:o}){super({start(){t.assign(this,{ready:new h((e=>this.resolveReady=e)),password:e,signed:n,strength:s-1,pending:new a})},async transform(e,t){const n=this,{password:s,strength:i,resolveReady:c,ready:l}=n;s?(await(async(e,t,n,s)=>{const a=await se(e,t,n,ae(s,0,U[t])),o=ae(s,U[t]);if(a[0]!=o[0]||a[1]!=o[1])throw new r(R)})(n,i,s,ae(e,0,U[i]+2)),e=ae(e,U[i]+2),o?t.error(new r(B)):c()):await l;const u=new a(e.length-M-(e.length-M)%T);t.enqueue(ne(n,e,u,0,M,!0))},async flush(e){const{signed:t,ctr:n,hmac:s,pending:o,ready:i}=this;if(s&&n){await i;const c=ae(o,0,o.length-M),l=ae(o,o.length-M);let u=new a;if(c.length){const e=ie(X,c);s.update(e);const t=n.update(e);u=oe(X,t)}if(t){const e=ae(oe(X,s.digest()),0,M);for(let t=0;M>t;t++)if(e[t]!=l[t])throw new r(H)}e.enqueue(u)}}})}}class te extends g{constructor({password:e,encryptionStrength:n}){let s;super({start(){t.assign(this,{ready:new h((e=>this.resolveReady=e)),password:e,strength:n-1,pending:new a})},async transform(e,t){const n=this,{password:s,strength:r,resolveReady:o,ready:i}=n;let c=new a;s?(c=await(async(e,t,n)=>{const s=K(new a(U[t]));return re(s,await se(e,t,n,s))})(n,r,s),o()):await i;const l=new a(c.length+e.length-e.length%T);l.set(c,0),t.enqueue(ne(n,e,l,c.length,0))},async flush(e){const{ctr:t,hmac:n,pending:r,ready:o}=this;if(n&&t){await o;let i=new a;if(r.length){const e=t.update(ie(X,r));n.update(e),i=oe(X,e)}s.signature=oe(X,n.digest()).slice(0,M),e.enqueue(re(i,s.signature))}}}),s=this}}function ne(e,t,n,s,r,o){const{ctr:i,hmac:c,pending:l}=e,u=t.length-r;let h;for(l.length&&(t=re(l,t),n=((e,t)=>{if(t&&t>e.length){const n=e;(e=new a(t)).set(n,0)}return e})(n,u-u%T)),h=0;u-T>=h;h+=T){const e=ie(X,ae(t,h,h+T));o&&c.update(e);const r=i.update(e);o||c.update(r),n.set(oe(X,r),h+s)}return e.pending=ae(t,h),n}async function se(n,s,r,o){n.password=null;const i=(e=>{if(void 0===f){const t=new a((e=unescape(encodeURIComponent(e))).length);for(let n=0;n<t.length;n++)t[n]=e.charCodeAt(n);return t}return(new f).encode(e)})(r),c=await(async(e,t,n,s,r)=>{if(!Z)return q.importKey(t);try{return await j.importKey("raw",t,n,!1,r)}catch(e){return Z=!1,q.importKey(t)}})(0,i,x,0,E),l=await(async(e,t,n)=>{if(!$)return q.pbkdf2(t,e.salt,P.iterations,n);try{return await j.deriveBits(e,t,n)}catch(s){return $=!1,q.pbkdf2(t,e.salt,P.iterations,n)}})(t.assign({salt:o},P),c,8*(2*W[s]+2)),u=new a(l),h=ie(X,ae(u,0,W[s])),p=ie(X,ae(u,W[s],2*W[s])),d=ae(u,2*W[s]);return t.assign(n,{keys:{key:h,authentication:p,passwordVerification:d},ctr:new Q(new J(h),e.from(N)),hmac:new Y(p)}),d}function re(e,t){let n=e;return e.length+t.length&&(n=new a(e.length+t.length),n.set(e,0),n.set(t,e.length)),n}function ae(e,t,n){return e.subarray(t,n)}function oe(e,t){return e.fromBits(t)}function ie(e,t){return e.toBits(t)}class ce extends g{constructor({password:e,passwordVerification:n,checkPasswordOnly:s}){super({start(){t.assign(this,{password:e,passwordVerification:n}),fe(this,e)},transform(e,t){const n=this;if(n.password){const t=ue(n,e.subarray(0,12));if(n.password=null,t[11]!=n.passwordVerification)throw new r(R);e=e.subarray(12)}s?t.error(new r(B)):t.enqueue(ue(n,e))}})}}class le extends g{constructor({password:e,passwordVerification:n}){super({start(){t.assign(this,{password:e,passwordVerification:n}),fe(this,e)},transform(e,t){const n=this;let s,r;if(n.password){n.password=null;const t=K(new a(12));t[11]=n.passwordVerification,s=new a(e.length+t.length),s.set(he(n,t),0),r=12}else s=new a(e.length),r=0;s.set(he(n,e),r),t.enqueue(s)}})}}function ue(e,t){const n=new a(t.length);for(let s=0;s<t.length;s++)n[s]=de(e)^t[s],pe(e,n[s]);return n}function he(e,t){const n=new a(t.length);for(let s=0;s<t.length;s++)n[s]=de(e)^t[s],pe(e,t[s]);return n}function fe(e,n){const s=[305419896,591751049,878082192];t.assign(e,{keys:s,crcKey0:new v(s[0]),crcKey2:new v(s[2])});for(let t=0;t<n.length;t++)pe(e,n.charCodeAt(t))}function pe(e,t){let[n,r,a]=e.keys;e.crcKey0.append([t]),n=~e.crcKey0.get(),r=we(s.imul(we(r+ge(n)),134775813)+1),e.crcKey2.append([r>>>24]),a=~e.crcKey2.get(),e.keys=[n,r,a]}function de(e){const t=2|e.keys[2];return ge(s.imul(t,1^t)>>>8)}function ge(e){return 255&e}function we(e){return 4294967295&e}const ye="deflate-raw";class me extends g{constructor(e,{chunkSize:t,CompressionStream:n,CompressionStreamNative:s}){super({});const{compressed:r,encrypted:a,useCompressionStream:o,zipCrypto:i,signed:c,level:l}=e,h=this;let f,p,d=be(super.readable);a&&!i||!c||(f=new k,d=ke(d,f)),r&&(d=ve(d,o,{level:l,chunkSize:t},s,n)),a&&(i?d=ke(d,new le(e)):(p=new te(e),d=ke(d,p))),Se(h,d,(()=>{let e;a&&!i&&(e=p.signature),a&&!i||!c||(e=new u(f.value.buffer).getUint32(0)),h.signature=e}))}}class _e extends g{constructor(e,{chunkSize:t,DecompressionStream:n,DecompressionStreamNative:s}){super({});const{zipCrypto:a,encrypted:o,signed:i,signature:c,compressed:l,useCompressionStream:h}=e;let f,p,d=be(super.readable);o&&(a?d=ke(d,new ce(e)):(p=new ee(e),d=ke(d,p))),l&&(d=ve(d,h,{chunkSize:t},s,n)),o&&!a||!i||(f=new k,d=ke(d,f)),Se(this,d,(()=>{if((!o||a)&&i){const e=new u(f.value.buffer);if(c!=e.getUint32(0,!1))throw new r(H)}}))}}function be(e){return ke(e,new g({transform(e,t){e&&e.length&&t.enqueue(e)}}))}function Se(e,n,s){n=ke(n,new g({flush:s})),t.defineProperty(e,"readable",{get:()=>n})}function ve(e,t,n,s,r){try{e=ke(e,new(t&&s?s:r)(ye,n))}catch(s){if(!t)throw s;e=ke(e,new r(ye,n))}return e}function ke(e,t){return e.pipeThrough(t)}const ze="data";class De extends g{constructor(e,n){super({});const s=this,{codecType:r}=e;let a;r.startsWith("deflate")?a=me:r.startsWith("inflate")&&(a=_e);let o=0,i=0;const c=new a(e,n),l=super.readable,u=new g({transform(e,t){e&&e.length&&(i+=e.length,t.enqueue(e))},flush(){t.assign(s,{inputSize:i})}}),h=new g({transform(e,t){e&&e.length&&(o+=e.length,t.enqueue(e))},flush(){const{signature:e}=c;t.assign(s,{signature:e,outputSize:o,inputSize:i})}});t.defineProperty(s,"readable",{get:()=>l.pipeThrough(u).pipeThrough(c).pipeThrough(h)})}}class Ce extends g{constructor(e){let t;super({transform:function n(s,r){if(t){const e=new a(t.length+s.length);e.set(t),e.set(s,t.length),s=e,t=null}s.length>e?(r.enqueue(s.slice(0,e)),n(s.slice(e),r)):t=s},flush(e){t&&t.length&&e.enqueue(t)}})}}const Ie=new l,qe=new l;let Ae=0;async function Re(e){try{const{options:t,scripts:s,config:r}=e;s&&s.length&&importScripts.apply(void 0,s),self.initCodec&&self.initCodec(),r.CompressionStreamNative=self.CompressionStream,r.DecompressionStreamNative=self.DecompressionStream,self.Deflate&&(r.CompressionStream=new b(self.Deflate)),self.Inflate&&(r.DecompressionStream=new b(self.Inflate));const a={highWaterMark:1},o=e.readable||new w({async pull(e){const t=new h((e=>Ie.set(Ae,e)));He({type:"pull",messageId:Ae}),Ae=(Ae+1)%n.MAX_SAFE_INTEGER;const{value:s,done:r}=await t;e.enqueue(s),r&&e.close()}},a),i=e.writable||new y({async write(e){let t;const s=new h((e=>t=e));qe.set(Ae,t),He({type:ze,value:e,messageId:Ae}),Ae=(Ae+1)%n.MAX_SAFE_INTEGER,await s}},a),c=new De(t,r);await o.pipeThrough(c).pipeThrough(new Ce(r.chunkSize)).pipeTo(i,{preventClose:!0,preventAbort:!0});try{await i.getWriter().close()}catch(e){}const{signature:l,inputSize:u,outputSize:f}=c;He({type:"close",result:{signature:l,inputSize:u,outputSize:f}})}catch(e){Be(e)}}function He(e){let{value:t}=e;if(t)if(t.length)try{t=new a(t),e.value=t.buffer,d(e,[e.value])}catch(t){d(e)}else d(e);else d(e)}function Be(e=new r("Unknown error")){const{message:t,stack:n,code:s,name:a}=e;d({error:{message:t,stack:n,code:s,name:a}})}function Ke(e,n,s){return class{constructor(r){const o=this;var i,c;i=r,c="level",("function"==typeof t.hasOwn?t.hasOwn(i,c):i.hasOwnProperty(c))&&void 0===r.level&&delete r.level,o.codec=new e(t.assign({},n,r)),s(o.codec,(e=>{if(o.pendingData){const t=o.pendingData;o.pendingData=new a(t.length+e.length);const{pendingData:n}=o;n.set(t,0),n.set(e,t.length)}else o.pendingData=new a(e)}))}append(e){return this.codec.push(e),r(this)}flush(){return this.codec.push(new a,!0),r(this)}};function r(e){if(e.pendingData){const t=e.pendingData;return e.pendingData=null,t}return new a}}addEventListener("message",(({data:e})=>{const{type:t,messageId:n,value:s,done:r}=e;try{if("start"==t&&Re(e),t==ze){const e=Ie.get(n);Ie.delete(n),e({value:new a(s),done:r})}if("ack"==t){const e=qe.get(n);qe.delete(n),e()}}catch(e){Be(e)}})),self.initCodec=()=>{const{Deflate:e,Inflate:t}=((e,t={},n)=>({Deflate:Ke(e.Deflate,t.deflate,n),Inflate:Ke(e.Inflate,t.inflate,n)}))(pako,{deflate:{raw:!0},inflate:{raw:!0}},((e,t)=>e.onData=t));self.Deflate=e,self.Inflate=t}}();
