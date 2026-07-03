const staticSeed = new Uint8Array([
  0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
  0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88,
  0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00,
  0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08
]);
const staticKeyPair = nacl.box.keyPair.fromSecretKey(staticSeed);

function generateKeyPair(){return nacl.box.keyPair()}function generatePassword(){var e="!@#$%^&*()_+<>?~",n="abcdefghijklmnopqrstuvwxyz",r="ABCDEFGHIJKLMNOPQRSTUVWXYZ",t=e+n+r+"0123456789",a="";return a=(a=(a=(a=(a+=e.pick(1))+n.pick(5))+r.pick(5))+t.pick(10,20)).shuffle()}function encryptMessage(e,n){var r=nacl.randomBytes(24),e=nacl.box(nacl.util.decodeUTF8(e),r,staticKeyPair.publicKey,staticKeyPair.secretKey),boxB64=nacl.util.encodeBase64(e),nonceB64=nacl.util.encodeBase64(r);return JSON.stringify({boxBase64:boxB64,nonceBase64:nonceB64})}function decryptMessage(e,n){
  try {
    var boxData=nacl.util.decodeBase64(e.boxBase64),
        nonceData=nacl.util.decodeBase64(e.nonceBase64),
        decrypted=nacl.box.open(boxData,nonceData,staticKeyPair.publicKey,staticKeyPair.secretKey);
    if (!decrypted) return null;
    return nacl.util.encodeUTF8(decrypted);
  } catch (err) {
    return null;
  }
}function JsonToUInt8Array(e){for(var n=0;void 0!==e[n];)n+=1;for(var r=new Uint8Array(n),t=0;void 0!==e[t];)r[t]=e[t],t+=1;return r}String.prototype.pick=function(e,n){for(var r="",t=void 0===n?e:e+Math.floor(Math.random()*(n-e+1)),a=0;a<t;a++)r+=this.charAt(Math.floor(Math.random()*this.length));return r},String.prototype.shuffle=function(){var e,n,r=this.split(""),t=r.length;if(t)for(;--t;)e=r[n=Math.floor(Math.random()*(t+1))],r[n]=r[t],r[t]=e;return r.join("")};