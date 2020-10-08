var GameboyJS;
(function (GameboyJS) {
"use strict";

// List of CPU operations
// Most operations have been factorized here to limit code redundancy
//
// How to read operations:
// Uppercase letters qualify the kind of operation (LD = LOAD, INC = INCREMENT, etc.)
// Lowercase letters are used to hint parameters :
// r = register, n = 1 memory byte, sp = sp register,
// a = suffix for memory address, i = bit index
// Example : LDrrar = LOAD operation with two-registers memory address
// as first parameter and one register value as second
//
// Underscore-prefixed functions are here to delegate the logic between similar operations,
// they should not be called from outside
//
// It's up to each operation to update the CPU clock
var ops = {
    LDrrnn: function(p, r1, r2) {p.wr(r2, p.memory.rb(p.r.pc));p.wr(r1, p.memory.rb(p.r.pc+1)); p.r.pc+=2;p.clock.c += 12;},
    LDrrar: function(p, r1, r2, r3) {ops._LDav(p, GameboyJS.Util.getRegAddr(p, r1, r2), p.r[r3]);p.clock.c += 8;},
    LDrrra: function(p, r1, r2, r3) {p.wr(r1, p.memory.rb(GameboyJS.Util.getRegAddr(p, r2, r3)));p.clock.c += 8;},
    LDrn:   function(p, r1) {p.wr(r1, p.memory.rb(p.r.pc++));p.clock.c += 8;},
    LDrr:   function(p, r1, r2) {p.wr(r1, p.r[r2]);p.clock.c += 4;},
    LDrar:  function(p, r1, r2) {p.memory.wb(p.r[r1]+0xFF00, p.r[r2]);p.clock.c += 8;},
    LDrra:  function(p, r1, r2) {p.wr(r1, p.memory.rb(p.r[r2]+0xFF00));p.clock.c += 8;},
    LDspnn: function(p) {p.wr('sp', (p.memory.rb(p.r.pc + 1) << 8) + p.memory.rb(p.r.pc));p.r.pc+=2;p.clock.c += 12;},
    LDsprr: function(p, r1, r2) {p.wr('sp', GameboyJS.Util.getRegAddr(p, r1, r2));p.clock.c += 8;},
    LDnnar: function(p, r1) {var addr=(p.memory.rb(p.r.pc + 1) << 8) + p.memory.rb(p.r.pc);p.memory.wb(addr,p.r[r1]);p.r.pc+=2; p.clock.c += 16;},
    LDrnna: function(p, r1) {var addr=(p.memory.rb(p.r.pc + 1) << 8) + p.memory.rb(p.r.pc);p.wr(r1, p.memory.rb(addr));p.r.pc+=2; p.clock.c += 16;},
    LDrrspn:function(p, r1, r2) {var rel = p.memory.rb(p.r.pc++);rel=GameboyJS.Util.getSignedValue(rel);var val=p.r.sp + rel;
        var c = (p.r.sp&0xFF) + (rel&0xFF) > 0xFF;var h = (p.r.sp & 0xF) + (rel & 0xF) > 0xF;val &= 0xFFFF;
        var f = 0; if(h)f|=0x20;if(c)f|=0x10;p.wr('F', f);
        p.wr(r1, val >> 8);p.wr(r2, val&0xFF);
        p.clock.c+=12;},
    LDnnsp: function(p) {var addr = p.memory.rb(p.r.pc++) + (p.memory.rb(p.r.pc++)<<8); ops._LDav(p, addr, p.r.sp & 0xFF);ops._LDav(p, addr+1, p.r.sp >> 8);p.clock.c+=20;},
    LDrran: function(p, r1, r2){var addr = GameboyJS.Util.getRegAddr(p, r1, r2);ops._LDav(p, addr, p.memory.rb(p.r.pc++));p.clock.c+=12;},
    _LDav:  function(p, addr, val){p.memory.wb(addr, val);},
    LDHnar: function(p, r1){p.memory.wb(0xFF00 + p.memory.rb(p.r.pc++), p.r[r1]);p.clock.c+=12;},
    LDHrna: function(p, r1){p.wr(r1, p.memory.rb(0xFF00 + p.memory.rb(p.r.pc++)));p.clock.c+=12;},
    INCrr:  function(p, r1, r2) {p.wr(r2, (p.r[r2]+1)&0xFF); if (p.r[r2] == 0) p.wr(r1, (p.r[r1]+1)&0xFF);p.clock.c += 8;},
    INCrra: function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);var val = (p.memory.rb(addr)+1)&0xFF;var z = val==0;var h=(p.memory.rb(addr)&0xF)+1 > 0xF;
        p.memory.wb(addr, val);
        p.r.F&=0x10;if(h)p.r.F|=0x20;if(z)p.r.F|=0x80;
        p.clock.c+=12;},
    INCsp:  function(p){p.wr('sp', p.r.sp+1); p.r.sp &= 0xFFFF; p.clock.c+=8;},
    INCr:   function(p, r1) {var h = ((p.r[r1]&0xF) + 1)&0x10;p.wr(r1, (p.r[r1] + 1)&0xFF);var z = p.r[r1]==0;
        p.r.F&=0x10;if(h)p.r.F|=0x20;if(z)p.r.F|=0x80;
        p.clock.c += 4;},
    DECrr:  function(p, r1, r2) {p.wr(r2, (p.r[r2] - 1) & 0xFF); if (p.r[r2] == 0xFF) p.wr(r1, (p.r[r1] - 1)&0xFF);p.clock.c += 8;},
    DECsp:  function(p){p.wr('sp', p.r.sp-1); p.r.sp &= 0xFFFF; p.clock.c+=8;},
    DECr:   function(p, r1) {var h = (p.r[r1]&0xF) < 1;p.wr(r1, (p.r[r1] - 1) & 0xFF);var z = p.r[r1]==0;
        p.r.F&=0x10;p.r.F|=0x40;if(h)p.r.F|=0x20;if(z)p.r.F|=0x80;
        p.clock.c += 4;},
    DECrra: function(p, r1, r2){var addr = GameboyJS.Util.getRegAddr(p, r1, r2);var val = (p.memory.rb(addr)-1)&0xFF;var z = val==0;var h=(p.memory.rb(addr)&0xF) < 1;
        p.memory.wb(addr, val);
        p.r.F&=0x10;p.r.F|=0x40;if(h)p.r.F|=0x20;if(z)p.r.F|=0x80;
        p.clock.c+=12;},
    ADDrr:  function(p, r1, r2) {var n = p.r[r2];ops._ADDrn(p, r1, n); p.clock.c += 4;},
    ADDrn:  function(p, r1) {var n = p.memory.rb(p.r.pc++);ops._ADDrn(p, r1, n); p.clock.c+=8;},
    _ADDrn: function(p, r1, n) {var h=((p.r[r1]&0xF)+(n&0xF))&0x10;p.wr(r1, p.r[r1]+n);var c=p.r[r1]&0x100;p.r[r1]&=0xFF;
            var f = 0;if (p.r[r1]==0)f|=0x80;if (h)f|=0x20;if (c)f|=0x10;p.wr('F', f);},
    ADDrrrr:function(p, r1, r2, r3, r4) {ops._ADDrrn(p, r1, r2, (p.r[r3]<<8) + p.r[r4]); p.clock.c+=8;},
    ADDrrsp:function(p, r1, r2) {ops._ADDrrn(p, r1, r2, p.r.sp); p.clock.c += 8;},
    ADDspn: function(p) {var v = p.memory.rb(p.r.pc++);v = GameboyJS.Util.getSignedValue(v);
        var c = ((p.r.sp&0xFF) + (v&0xFF)) > 0xFF; var h = (p.r.sp & 0xF) + (v&0xF) > 0xF;
        var f = 0; if(h)f|=0x20;if(c)f|=0x10;p.wr('F', f);
        p.wr('sp', (p.r.sp + v) & 0xFFFF);
        p.clock.c+=16;},
    _ADDrrn:function(p, r1, r2, n) {var v1 = (p.r[r1]<<8) + p.r[r2];var v2 = n;
        var res = v1 + v2;var c = res&0x10000;var h = ((v1&0xFFF) + (v2&0xFFF))&0x1000;var z = p.r.F&0x80;
        res&=0xFFFF;p.r[r2]=res&0xFF;res=res>>8;p.r[r1]=res&0xFF;
        var f=0;if(z)f|=0x80;if(h)f|=0x20;if(c)f|=0x10;p.r.F=f;},
    ADCrr:  function(p, r1, r2) {var n = p.r[r2]; ops._ADCrn(p, r1, n); p.clock.c += 4;},
    ADCrn:  function(p, r1) {var n = p.memory.rb(p.r.pc++); ops._ADCrn(p, r1, n); p.clock.c += 8;},
    _ADCrn: function(p, r1, n) {
        var c = p.r.F&0x10?1:0;var h=((p.r[r1]&0xF)+(n&0xF)+c)&0x10;
        p.wr(r1, p.r[r1]+n+c);c=p.r[r1]&0x100;p.r[r1]&=0xFF;
        var f = 0;if (p.r[r1]==0)f|=0x80;if (h)f|=0x20;if (c)f|=0x10;p.r.F=f;},
    ADCrrra:function(p, r1, r2, r3) {var n = p.memory.rb(GameboyJS.Util.getRegAddr(p, r2, r3)); ops._ADCrn(p, r1, n); p.clock.c += 8;},
    ADDrrra:function(p, r1, r2, r3) {var v = p.memory.rb(GameboyJS.Util.getRegAddr(p, r2, r3));var h=((p.r[r1]&0xF)+(v&0xF))&0x10;p.wr(r1, p.r[r1]+v);var c=p.r[r1]&0x100;p.r[r1]&=0xFF;
        var f = 0;if (p.r[r1]==0)f|=0x80;if (h)f|=0x20;if (c)f|=0x10;p.wr('F', f);
        p.clock.c += 8;},
    SUBr:   function(p, r1) {var n = p.r[r1];ops._SUBn(p, n);p.clock.c += 4;},
    SUBn:   function(p) {var n = p.memory.rb(p.r.pc++);ops._SUBn(p, n);p.clock.c += 8;},
    SUBrra: function(p, r1, r2) {var n = p.memory.rb(GameboyJS.Util.getRegAddr(p, r1, r2));ops._SUBn(p, n);p.clock.c+=8;},
    _SUBn:  function(p, n) {var c = p.r.A < n;var h = (p.r.A&0xF) < (n&0xF);
        p.wr('A', p.r.A - n);p.r.A&=0xFF; var z = p.r.A==0;
        var f = 0x40;if (z)f|=0x80;if (h)f|=0x20;if (c)f|=0x10;p.wr('F', f);},
    SBCn:   function(p) {var n = p.memory.rb(p.r.pc++); ops._SBCn(p, n); p.clock.c += 8;},
    SBCr:   function(p, r1) {var n = p.r[r1]; ops._SBCn(p, n); p.clock.c += 4;},
    SBCrra: function(p, r1, r2) {var v = p.memory.rb((p.r[r1] << 8) + p.r[r2]); ops._SBCn(p, v); p.clock.c += 8;},
    _SBCn:  function(p, n) {var carry = p.r.F&0x10 ? 1 : 0;
        var c = p.r.A < n + carry;var h = (p.r.A&0xF) < (n&0xF) + carry;
        p.wr('A', p.r.A - n - carry); p.r.A&=0xFF; var z = p.r.A == 0;
        var f = 0x40;if (z)f|=0x80;if (h)f|=0x20;if (c)f|=0x10;p.r.F=f;},
    ORr:    function(p, r1) {p.r.A|=p.r[r1];p.r.F=(p.r.A==0)?0x80:0x00;p.clock.c += 4;},
    ORn:    function(p) {p.r.A|=p.memory.rb(p.r.pc++);p.r.F=(p.r.A==0)?0x80:0x00;p.clock.c += 8;},
    ORrra:  function(p, r1, r2) {p.r.A|=p.memory.rb((p.r[r1] << 8)+ p.r[r2]);p.r.F=(p.r.A==0)?0x80:0x00;p.clock.c += 8;},
    ANDr:   function(p, r1) {p.r.A&=p.r[r1];p.r.F=(p.r.A==0)?0xA0:0x20;p.clock.c += 4;},
    ANDn:   function(p) {p.r.A&=p.memory.rb(p.r.pc++);p.r.F=(p.r.A==0)?0xA0:0x20;p.clock.c += 8;},
    ANDrra: function(p, r1, r2) {p.r.A&=p.memory.rb(GameboyJS.Util.getRegAddr(p, r1, r2));p.r.F=(p.r.A==0)?0xA0:0x20;p.clock.c += 8;},
    XORr:   function(p, r1) {p.r.A^=p.r[r1];p.r.F=(p.r.A==0)?0x80:0x00;p.clock.c += 4;},
    XORn:   function(p) {p.r.A^=p.memory.rb(p.r.pc++);p.r.F=(p.r.A==0)?0x80:0x00;p.clock.c += 8;},
    XORrra: function(p, r1, r2) {p.r.A^=p.memory.rb((p.r[r1] << 8)+ p.r[r2]);p.r.F=(p.r.A==0)?0x80:0x00;p.clock.c += 8;},
    CPr:    function(p, r1) {var n = p.r[r1];ops._CPn(p, n); p.clock.c += 4;},
    CPn:    function(p) {var n =p.memory.rb(p.r.pc++);ops._CPn(p, n);p.clock.c+=8;},
    CPrra:  function(p, r1, r2) {var n = p.memory.rb(GameboyJS.Util.getRegAddr(p, r1, r2));ops._CPn(p, n);p.clock.c+=8;},
    _CPn:   function(p, n) {
        var c = p.r.A < n;var z = p.r.A == n;var h = (p.r.A&0xF) < (n&0xF);
        var f = 0x40;if(z)f+=0x80;if (h)f+=0x20;if (c)f+=0x10;p.r.F=f;},
    RRCr:   function(p, r1) {p.r.F=0;var out=p.r[r1] & 0x01;if(out)p.r.F|=0x10;p.r[r1]=(p.r[r1]>>1)|(out*0x80);if(p.r[r1]==0)p.r.F|=0x80;p.clock.c+=4;},
    RRCrra: function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);p.r.F=0;var out=p.memory.rb(addr)&0x01;if(out)p.r.F|=0x10;p.memory.wb(addr, (p.memory.rb(addr)>>1)|(out*0x80));if(p.memory.rb(addr)==0)p.r.F|=0x80;p.clock.c+=12;},
    RLCr:   function(p, r1) {p.r.F=0;var out=p.r[r1]&0x80?1:0;if(out)p.r.F|=0x10;p.r[r1]=((p.r[r1]<<1)+out)&0xFF;if(p.r[r1]==0)p.r.F|=0x80;p.clock.c+=4;},
    RLCrra: function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);p.r.F=0;var out=p.memory.rb(addr)&0x80?1:0;if(out)p.r.F|=0x10;p.memory.wb(addr, ((p.memory.rb(addr)<<1)+out)&0xFF);if(p.memory.rb(addr)==0)p.r.F|=0x80;p.clock.c+=12;},
    RLr:    function(p, r1) {var c=(p.r.F&0x10)?1:0;p.r.F=0;var out=p.r[r1]&0x80;out?p.r.F|=0x10:p.r.F&=0xEF;p.r[r1]=((p.r[r1]<<1)+c)&0xFF;if(p.r[r1]==0)p.r.F|=0x80;p.clock.c+=4;},
    RLrra:  function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);var c=(p.r.F&0x10)?1:0;p.r.F=0;var out=p.memory.rb(addr)&0x80;out?p.r.F|=0x10:p.r.F&=0xEF;p.memory.wb(addr,((p.memory.rb(addr)<<1)+c)&0xFF);if(p.memory.rb(addr)==0)p.r.F|=0x80;p.clock.c+=12;},
    RRr:    function(p, r1) {var c=(p.r.F&0x10)?1:0;p.r.F=0;var out=p.r[r1]&0x01;out?p.r.F|=0x10:p.r.F&=0xEF;p.r[r1]=(p.r[r1]>>1)|(c*0x80);if(p.r[r1]==0)p.r.F|=0x80;p.clock.c+=4;},
    RRrra:  function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);var c=(p.r.F&0x10)?1:0;p.r.F=0;var out=p.memory.rb(addr)&0x01;out?p.r.F|=0x10:p.r.F&=0xEF;p.memory.wb(addr,(p.memory.rb(addr)>>1)|(c*0x80));if(p.memory.rb(addr)==0)p.r.F|=0x80;p.clock.c+=12;},
    SRAr:   function(p, r1) {p.r.F = 0;if (p.r[r1]&0x01)p.r.F|=0x10;var msb=p.r[r1]&0x80;p.r[r1]=(p.r[r1]>>1)|msb;if (p.r[r1]==0)p.r.F|=0x80;p.clock.c+=4;},
    SRArra: function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);p.r.F = 0;if (p.memory.rb(addr)&0x01)p.r.F|=0x10;var msb=p.memory.rb(addr)&0x80;p.memory.wb(addr, (p.memory.rb(addr)>>1)|msb);if (p.memory.rb(addr)==0)p.r.F|=0x80;p.clock.c+=12;},
    SLAr:   function(p, r1) {p.r.F = 0;if (p.r[r1]&0x80)p.r.F|=0x10;p.r[r1]=(p.r[r1]<<1)&0xFF;if (p.r[r1]==0)p.r.F|=0x80;p.clock.c+=4;},
    SLArra: function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);p.r.F = 0;if (p.memory.rb(addr)&0x80)p.r.F|=0x10;p.memory.wb(addr, (p.memory.rb(addr)<<1)&0xFF);if (p.memory.rb(addr)==0)p.r.F|=0x80;p.clock.c+=12;},
    SRLr:   function(p, r1) {p.r.F = 0;if (p.r[r1]&0x01)p.r.F|=0x10;p.r[r1]=p.r[r1]>>1;if (p.r[r1]==0)p.r.F|=0x80;p.clock.c+=4;},
    SRLrra: function(p, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);p.r.F = 0;if (p.memory.rb(addr)&0x01)p.r.F|=0x10;p.memory.wb(addr, p.memory.rb(addr)>>1);if (p.memory.rb(addr)==0)p.r.F|=0x80;p.clock.c+=12;},
    BITir:  function(p, i, r1) {var mask=1<<i;var z=(p.r[r1]&mask)?0:1;var f=p.r.F&0x10;f |= 0x20;if(z)f|=0x80;p.r.F=f;p.clock.c+=4;},
    BITirra:function(p, i, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);var mask=1<<i;var z=(p.memory.rb(addr)&mask)?0:1;var f=p.r.F&0x10;f |= 0x20;if(z)f|=0x80;p.r.F=f;p.clock.c+=8;},
    SETir:  function(p, i, r1) {var mask=1<<i;p.r[r1]|=mask;p.clock.c += 4;},
    SETirra:function(p, i, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);var mask=1<<i;p.memory.wb(addr, p.memory.rb(addr)|mask);p.clock.c += 12;},
    RESir:  function(p, i, r1) {var mask=0xFF - (1<<i);p.r[r1]&=mask;p.clock.c += 4;},
    RESirra:function(p, i, r1, r2) {var addr = GameboyJS.Util.getRegAddr(p, r1, r2);var mask=0xFF - (1<<i);p.memory.wb(addr, p.memory.rb(addr)&mask);p.clock.c += 12;},
    SWAPr:  function(p, r1) {p.r[r1] = ops._SWAPn(p, p.r[r1]);p.clock.c+=4;},
    SWAPrra:function(p, r1, r2){var addr = (p.r[r1] << 8)+ p.r[r2]; p.memory.wb(addr, ops._SWAPn(p, p.memory.rb(addr))); p.clock.c+=12;},
    _SWAPn: function(p, n){p.r.F = n==0?0x80:0;return ((n&0xF0) >> 4) | ((n&0x0F) << 4);},
    JPnn:   function(p) {p.wr('pc', (p.memory.rb(p.r.pc+1) << 8) + p.memory.rb(p.r.pc));p.clock.c += 16;},
    JRccn:  function(p, cc) {if (GameboyJS.Util.testFlag(p, cc)){var v=p.memory.rb(p.r.pc++);v=GameboyJS.Util.getSignedValue(v);p.r.pc += v;p.clock.c+=4;}else{p.r.pc++;}p.clock.c += 8;},
    JPccnn: function(p, cc) {if (GameboyJS.Util.testFlag(p, cc)){p.wr('pc', (p.memory.rb(p.r.pc+1) << 8) + p.memory.rb(p.r.pc));p.clock.c+=4;}else{p.r.pc+=2;}p.clock.c += 12;},
    JPrr:   function(p, r1, r2) {p.r.pc = (p.r[r1] << 8) + p.r[r2];p.clock.c += 4;},
    JRn:    function(p) {var v=p.memory.rb(p.r.pc++);v=GameboyJS.Util.getSignedValue(v);p.r.pc += v;p.clock.c += 12;},
    PUSHrr: function(p, r1, r2) {p.wr('sp', p.r.sp-1);p.memory.wb(p.r.sp, p.r[r1]);p.wr('sp', p.r.sp-1);p.memory.wb(p.r.sp, p.r[r2]);p.clock.c+=16;},
    POPrr:  function(p, r1, r2) {p.wr(r2, p.memory.rb(p.r.sp));p.wr('sp', p.r.sp+1);p.wr(r1, p.memory.rb(p.r.sp));p.wr('sp', p.r.sp+1);p.clock.c+=12;},
    RSTn:   function(p, n) {p.wr('sp', p.r.sp-1);p.memory.wb(p.r.sp,p.r.pc>>8);p.wr('sp', p.r.sp-1);p.memory.wb(p.r.sp,p.r.pc&0xFF);p.r.pc=n;p.clock.c+=16;},
    RET:    function(p) {p.r.pc = p.memory.rb(p.r.sp);p.wr('sp', p.r.sp+1);p.r.pc+=p.memory.rb(p.r.sp)<<8;p.wr('sp', p.r.sp+1);p.clock.c += 16;},
    RETcc:  function(p, cc) {if (GameboyJS.Util.testFlag(p, cc)){p.r.pc = p.memory.rb(p.r.sp);p.wr('sp', p.r.sp+1);p.r.pc+=p.memory.rb(p.r.sp)<<8;p.wr('sp', p.r.sp+1);p.clock.c+=12;}p.clock.c+=8;},
    CALLnn: function(p) {ops._CALLnn(p); p.clock.c+=24;},
    CALLccnn:function(p, cc) {if (GameboyJS.Util.testFlag(p, cc)){ops._CALLnn(p);p.clock.c+=12;}else{p.r.pc+=2;}p.clock.c+=12; },
    _CALLnn:function(p){p.wr('sp', p.r.sp - 1); p.memory.wb(p.r.sp, ((p.r.pc+2)&0xFF00)>>8);
        p.wr('sp', p.r.sp - 1); p.memory.wb(p.r.sp, (p.r.pc+2)&0x00FF);
        var j=p.memory.rb(p.r.pc)+(p.memory.rb(p.r.pc+1)<<8);p.r.pc=j;},
    CPL:    function(p) {p.wr('A', (~p.r.A)&0xFF);p.r.F|=0x60,p.clock.c += 4;},
    CCF:    function(p) {p.r.F&=0x9F;p.r.F&0x10?p.r.F&=0xE0:p.r.F|=0x10;p.clock.c += 4;},
    SCF:    function(p) {p.r.F&=0x9F;p.r.F|=0x10;p.clock.c+=4;},
    DAA:    function(p) {
        var sub = (p.r.F&0x40) ? 1 : 0; var h = (p.r.F&0x20)?1:0;var c = (p.r.F&0x10)?1:0;
        if (sub) {
            if (h) {
                p.r.A = (p.r.A - 0x6) & 0xFF;
            }
            if (c) {
                p.r.A -= 0x60;
            }
        } else {
            if ((p.r.A&0xF) > 9 || h) {
                p.r.A += 0x6;
            }
            if (p.r.A > 0x9F || c) {
                p.r.A += 0x60;
            }
        }
        if (p.r.A&0x100) c = 1;

        p.r.A &= 0xFF;
        p.r.F &= 0x40;if (p.r.A == 0) p.r.F|=0x80;if (c) p.r.F|=0x10;
        p.clock.c += 4;
    },
    HALT:   function(p) {p.halt(); p.clock.c+=4;},
    DI:     function(p) {p.disableInterrupts();p.clock.c += 4;},
    EI:     function(p) {p.enableInterrupts();p.clock.c += 4;},
    RETI:   function(p) {p.enableInterrupts();ops.RET(p);},
    CB:     function(p) {var opcode = p.memory.rb(p.r.pc++);
        GameboyJS.opcodeCbmap[opcode](p);
        p.clock.c+=4;}
};
GameboyJS.cpuOps = ops;
}(GameboyJS || (GameboyJS = {})));
