// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
exports.xor = {
    encode(str){
        if (!str) return str;
        return encodeURIComponent(str.toString().split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join(''));
    },
    decode(str){
        if (!str) return str;
        return decodeURIComponent(str).split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join('');
    },
};
exports.plain = {
    encode(str) {
        if (!str) return str;
        return encodeURIComponent(str);
    },
    decode(str) {
        if (!str) return str;
        return decodeURIComponent(str);
    },
};
exports.base64 = {
    encode(str){
        if (!str) return str;
        str = str.toString();
        const b64chs = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=');
        let u32;
        let c0; 
        let c1; 
        let c2; 
        let asc = '';
        let pad = str.length % 3;
        
        for (let i = 0; i < str.length;) {
            if((c0 = str.charCodeAt(i++)) > 255 || (c1 = str.charCodeAt(i++)) > 255 || (c2 = str.charCodeAt(i++)) > 255)throw new TypeError('invalid character found');
            u32 = (c0 << 16) | (c1 << 8) | c2;
            asc += b64chs[u32 >> 18 & 63]
                + b64chs[u32 >> 12 & 63]
                + b64chs[u32 >> 6 & 63]
                + b64chs[u32 & 63];
        }
        
        return encodeURIComponent(pad ? asc.slice(0, pad - 3) + '==='.substr(pad) : asc);
    },
    decode(str){
        if (!str) return str;
        str = decodeURIComponent(str.toString());
        const b64tab = {"0":52,"1":53,"2":54,"3":55,"4":56,"5":57,"6":58,"7":59,"8":60,"9":61,"A":0,"B":1,"C":2,"D":3,"E":4,"F":5,"G":6,"H":7,"I":8,"J":9,"K":10,"L":11,"M":12,"N":13,"O":14,"P":15,"Q":16,"R":17,"S":18,"T":19,"U":20,"V":21,"W":22,"X":23,"Y":24,"Z":25,"a":26,"b":27,"c":28,"d":29,"e":30,"f":31,"g":32,"h":33,"i":34,"j":35,"k":36,"l":37,"m":38,"n":39,"o":40,"p":41,"q":42,"r":43,"s":44,"t":45,"u":46,"v":47,"w":48,"x":49,"y":50,"z":51,"+":62,"/":63,"=":64};
        str = str.replace(/\s+/g, '');        
        str += '=='.slice(2 - (str.length & 3));
        let u24;
        let bin = '';
        let r1;
        let r2;
        
        for (let i = 0; i < str.length;) {
            u24 = b64tab[str.charAt(i++)] << 18
            | b64tab[str.charAt(i++)] << 12
            | (r1 = b64tab[str.charAt(i++)]) << 6
            | (r2 = b64tab[str.charAt(i++)]);
            bin += r1 === 64 ? String.fromCharCode(u24 >> 16 & 255)
                : r2 === 64 ? String.fromCharCode(u24 >> 16 & 255, u24 >> 8 & 255)
                    : String.fromCharCode(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255);
        };
        return bin;
    },
};
