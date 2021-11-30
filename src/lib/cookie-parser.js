// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
class CookieStore {
    constructor(val = ''){
        this.data = {};
        val.split(';').map(cookie => {
            var [ name, val = ''] = cookie.trimStart().split('=');
            if (name) this.data[name] = val;
        });
    };
    has(name){
        if (!name || !this.data[name]) return false;
        return true;
    };
    get(name){
        return this.has(name) ? this.data[name] : null; 
    };
    set(name, val){
        if (!name || !val) return;
        return this.data[name] = val;
    };
    delete(name){
        if (!name) return;
        return delete this.data[name];
    };
    forEach(action = (node, key) => null){
        for (let prop in this.data) action(this.data[prop], prop);
    };
    serialize(){
        var str = '';
        for (let i in this.data) str += ` ${i}=${this.data[i]};`;
        return str.substr(1);
    };
};

class SetCookie {
    constructor(val = ''){

        var [ [ name, value = '' ], ...data ] = val.split(';').map(str => str.trimStart().split('='));

        this.name = name;
        this.value = value;
        this.expires = null;  
        this.maxAge = null;
        this.domain = null;
        this.secure = false;
        this.httpOnly = false;
        this.path = null;
        this.sameSite = null;

        data.forEach(([name = null, value = null]) => {
            if (typeof name == 'string') switch(name.toLowerCase()){
                case 'domain':
                    this.domain = value;
                    break;
                case 'secure':
                    this.secure = true;
                    break;
                case 'httponly':
                    this.httpOnly = true;
                    break;
                case 'samesite':
                    this.sameSite = value;
                    break;
                case 'path':
                    this.path = value;
                    break;
                case 'expires':
                    this.expires = value;
                    break;
                case 'maxage':
                    this.maxAge = value;
                    break;
            };
        });
    }; 
    serialize(){
        if (!this.name) return;
        var str = `${this.name}=${this.value};`;
        if (this.expires) str += ` Expires=${this.expires};`;
        if (this.maxAge) str += ` Max-Age=${this.max_age};`;
        if (this.domain) str += ` Domain=${this.domain};`;
        if (this.secure) str += ` Secure;`;
        if (this.httpOnly) str += ` HttpOnly;`;
        if (this.path) str += ` Path=${this.path};`;
        if (this.sameSite) str += ` SameSite=${this.sameSite};`;
        return str;
    };
};

exports.CookieStore = CookieStore;
exports.SetCookie = SetCookie;
