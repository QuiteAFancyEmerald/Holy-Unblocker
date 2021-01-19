// World generation as a worker.
function Distort(source, distort) {

    this.source = source;
    this.distort = distort;

    this.getValue = function(x, y) {
        return this.source.getValue(x + this.distort.getValue(x, y), y);
    }

}

function ImprovedNoise(random) {

    var fadeCurve = function(d0) {
        return d0 * d0 * d0 * (d0 * (d0 * 6.0 - 15.0) + 10.0);
    }

    var lerp = function(d0, d1, d2) {
        return d1 + d0 * (d2 - d1);
    }

    var grad = function(i, d0, d1, d2) {
        var d3 = (i &= 15) < 8 ? d0 : d1;
        var d4 = i < 4 ? d1 : (i != 12 && i != 14 ? d2 : d0);

        return ((i & 1) == 0 ? d3 : -d3) + ((i & 2) == 0 ? d4 : -d4);
    }


    this.p = [];

    for (var i = 0; i < 256; i++) {
        this.p[i] = i;
    }

    for (var i = 0; i < 256; i++) {
        //var j = random.nextInt(256 - i) + i;
        //var j = Math.round( Math.random() * 256-i ) + i;
        var j = Math.round(random * (256 - i)) + i;

        var tmp = this.p[i];
        this.p[i] = this.p[j];
        this.p[j] = tmp;

        this.p[i + 256] = this.p[i];
    }


    this.getValue = function(d0, d1) {
        var d2 = 0.0;
        var d3 = d1;
        var d4 = d0;
        var i = Math.floor(d0) & 255;
        var j = Math.floor(d1) & 255;
        var k = Math.floor(0.0) & 255;

        d4 -= Math.floor(d4);
        d3 -= Math.floor(d3);
        d2 = 0.0 - Math.floor(0.0);
        var d5 = fadeCurve(d4);
        var d6 = fadeCurve(d3);
        var d7 = fadeCurve(d2);
        var l = this.p[i] + j;
        var i1 = this.p[l] + k;

        l = this.p[l + 1] + k;
        i = this.p[i + 1] + j;
        j = this.p[i] + k;
        i = this.p[i + 1] + k;
        return lerp(d7, lerp(d6, lerp(d5, grad(this.p[i1], d4, d3, d2), grad(this.p[j], d4 - 1.0, d3, d2)), lerp(d5, grad(this.p[l], d4, d3 - 1.0, d2), grad(this.p[i], d4 - 1.0, d3 - 1.0, d2))), lerp(d6, lerp(d5, grad(this.p[i1 + 1], d4, d3, d2 - 1.0), grad(this.p[j + 1], d4 - 1.0, d3, d2 - 1.0)), lerp(d5, grad(this.p[l + 1], d4, d3 - 1.0, d2 - 1.0), grad(this.p[i + 1], d4 - 1.0, d3 - 1.0, d2 - 1.0))));
    }

}

function PerlinNoise(random, levels) {

    //var ImprovedNoise = require("./ImprovedNoise.js");

    var noiseLevels = [];
    var levels = 8;

    for (var i = 0; i < 8; ++i) {
        noiseLevels[i] = new ImprovedNoise(random);
    }

    this.getValue = function(x, y) {
        var value = 0;
        var pow = 1;

        for (var i = 0; i < levels; i++) {
            value += noiseLevels[i].getValue(x * pow, y * pow) / pow;
            pow /= 2;
        }

        return value;
    }

}

/**
 * Creates a pseudo-random value generator. The seed must be an integer.
 *
 * Uses an optimized version of the Park-Miller PRNG.
 * http://www.firstpr.com.au/dsp/rand31/
 */
function Random(seed) {
    this._seed = seed % 2147483647;
    if (this._seed <= 0) this._seed += 2147483646;
}

/**
 * Returns a pseudo-random value between 1 and 2^32 - 2.
 */
Random.prototype.next = function() {
    return this._seed = this._seed * 16807 % 2147483647;
};

Random.prototype.nextInt = function(max) {
    return Math.floor(this.nextFloat() * max);
};

/**
 * Returns a pseudo-random floating point number in range [0, 1).
 */
Random.prototype.nextFloat = function(opt_minOrMax, opt_max) {
    // We know that result of next() will be 1 to 2147483646 (inclusive).
    return (this.next() - 1) / 2147483646;
};


var RandomLevel = function() {

    var progress = {
        string: "",
        percent: 0,
        tiles: null
    }

    this.createLevel = function(seed, xSize, zSize, ySize) {

        //this.progressRenderer.progressStart("Generating level");
        //return;
        var random = new Random(seed);


        this.xSize = xSize;
        this.zSize = zSize;
        this.ySize = 64;
        this.random = random.nextFloat();
        this.tiles = []; //new Array(xSize*zSize*ySize);//[];
        this.fillQueue = [];

        //console.log(this.random);

        // grow
        this.grow = function(aint) {
            var i = this.xSize;
            var j = this.zSize;
            var k = this.ySize;
            var perlinnoise = new PerlinNoise(this.random, 8);
            var perlinnoise1 = new PerlinNoise(this.random, 8);

            for (var l = 0; l < i; ++l) {
                //this.progress(l * 100 / (this.xSize - 1));
                progress.percent = l * 100 / (this.xSize - 1);
                self.postMessage(progress);

                for (var i1 = 0; i1 < j; ++i1) {
                    var flag = perlinnoise.getValue(l, i1) > 8.0;
                    var flag1 = perlinnoise1.getValue(l, i1) > 12.0;
                    var j1;
                    var k1 = parseInt(((j1 = parseInt(aint[l + i1 * i], 10)) * this.zSize + i1) * this.xSize + l, 10);
                    var l1;
                    // 7 waterid
                    //if (((l1 = this.tiles[((j1 + 1) * this.zSize + i1) * this.xSize + l] & 255) == 7) && j1 <= k / 2 - 1 && flag1) {
                    if (((l1 = parseInt(this.tiles[((j1 + 1) * this.zSize + i1) * this.xSize + l], 10) & 255) == 7) && j1 <= k / 2 - 1 && flag1) {

                        this.tiles[k1] = 12; //(byte) Tile.gravel.id;
                    }

                    if (l1 == 0) {
                        var i2 = 1; //Tile.grass.id;

                        if (j1 <= k / 2 - 1 && flag) {
                            i2 = 11; //Tile.sand.id;
                        }

                        this.tiles[k1] = i2;
                    }
                }
            }

        }

        // melt
        this.melt = function() {
            var i = 0;
            var j = this.xSize * this.zSize * this.ySize / 10000;

            for (var k = 0; k < j; ++k) {
                if (k % 100 == 0) {
                    //    this.progress(k * 100 / (j - 1));
                    progress.percent = k * 100 / (j - 1);
                    self.postMessage(progress);
                }

                var extray = 16;

                var l = random.nextInt(this.xSize);
                var i1 = random.nextInt(this.ySize / 2 - 4) + extray;
                var j1 = random.nextInt(this.zSize);

                if (this.tiles[(i1 * this.zSize + j1) * this.xSize + l] == 0) {
                    ++i;
                    //this.floodFill(l, i1, j1, 0, Tile.calmLava.id);
                    this.floodFill(l, i1, j1, 0, 17);

                }
            }

            //this.progress(100);
            //System.out.println("LavaCount: " + i);
            //console.log("LavaCount: " + i);
        }

        // plant
        this.plant = function(aint) {
            var i = this.xSize;
            var j = this.xSize * this.zSize / 4000;

            for (var k = 0; k < j; ++k) {
                //this.progress(k * 100 / (j - 1));
                progress.percent = k * 100 / (j - 1);
                self.postMessage(progress);

                var l = random.nextInt(this.xSize);
                var i1 = random.nextInt(this.zSize);

                for (var j1 = 0; j1 < 20; ++j1) {
                    var k1 = l;
                    var l1 = i1;

                    for (var i2 = 0; i2 < 20; ++i2) {
                        k1 += random.nextInt(6) - random.nextInt(6);
                        l1 += random.nextInt(6) - random.nextInt(6);
                        if (k1 >= 0 && l1 >= 0 && k1 < this.xSize && l1 < this.zSize) {
                            var j2 = aint[k1 + l1 * i] + 1;
                            var k2 = random.nextInt(3) + 4;
                            var flag = true;

                            var l2;
                            var i3;
                            var j3;

                            for (l2 = j2; l2 <= j2 + 1 + k2; ++l2) {
                                var b0 = 1;

                                if (l2 >= j2 + 1 + k2 - 2) {
                                    b0 = 2;
                                }

                                for (i3 = k1 - b0; i3 <= k1 + b0 && flag; ++i3) {
                                    for (j3 = l1 - b0; j3 <= l1 + b0 && flag; ++j3) {
                                        if (i3 >= 0 && l2 >= 0 && j3 >= 0 && i3 < this.xSize && l2 < this.ySize && j3 < this.zSize) {
                                            if ((this.tiles[(l2 * this.zSize + j3) * this.xSize + i3] & 255) != 0) {
                                                flag = false;
                                            }
                                        } else {
                                            flag = false;
                                        }
                                    }
                                }
                            }

                            if (flag) {
                                l2 = (j2 * this.zSize + l1) * this.xSize + k1;
                                if ((this.tiles[((j2 - 1) * this.zSize + l1) * this.xSize + k1] & 255) == 1 && j2 < this.ySize - k2 - 1) {
                                    this.tiles[l2 - 1 * this.xSize * this.zSize] = 3; //(byte) Tile.dirt.id;

                                    for (i3 = j2 - 3 + k2; i3 <= j2 + k2; ++i3) {
                                        j3 = i3 - (j2 + k2);
                                        var k3 = parseInt(1 - j3 / 2, 10);

                                        for (var l3 = k1 - k3; l3 <= k1 + k3; ++l3) {
                                            var i4 = parseInt(l3 - k1, 10);

                                            for (var j4 = l1 - k3; j4 <= l1 + k3; ++j4) {
                                                var k4 = parseInt(j4 - l1, 10);

                                                if (Math.abs(i4) != k3 || Math.abs(k4) != k3 || random.nextInt(2) != 0 && j3 != 0) {
                                                    this.tiles[(i3 * this.zSize + j4) * this.xSize + l3] = 14; //(byte) Tile.leaves.id;
                                                }
                                            }
                                        }
                                    }

                                    for (i3 = 0; i3 < k2; ++i3) {
                                        this.tiles[l2 + i3 * this.xSize * this.zSize] = 13; //(byte) Tile.treeTrunk.id;
                                    }
                                }
                            }
                        }
                    }
                }
            }

        }

        // place ore
        this.placeOre = function(tile, j, k, l) {
            l = this.xSize;
            var i1 = this.zSize;
            var j1 = this.ySize;
            var k1 = l * i1 * j1 / 256 / 64 * j / 100;

            for (var l1 = 0; l1 < k1; ++l1) {
                //this.progress(l1 * 100 / (k1 - 1) / 4 + k * 100 / 4);
                progress.percent = l1 * 100 / (k1 - 1) / 4 + k * 100 / 4;
                self.postMessage(progress);

                var f = random.nextFloat() * l;
                var f1 = random.nextFloat() * j1;
                var f2 = random.nextFloat() * i1;
                var i2 = parseInt(((random.nextFloat() + random.nextFloat()) * 75.0 * j / 100.0), 10);
                var f3 = (random.nextFloat() * 3.141592653589793 * 2.0);
                var f4 = 0.0;
                var f5 = (random.nextFloat() * 3.141592653589793 * 2.0);
                var f6 = 0.0;

                for (var j2 = 0; j2 < i2; ++j2) {
                    f = (f + Math.sin(f3) * Math.cos(f5));
                    f2 = (f2 + Math.cos(f3) * Math.cos(f5));
                    f1 = (f1 + Math.sin(f5));
                    f3 += f4 * 0.2;
                    f4 = (f4 *= 0.9) + (random.nextFloat() - random.nextFloat());
                    f5 = (f5 + f6 * 0.5) * 0.5;
                    f6 = (f6 *= 0.9) + (random.nextFloat() - random.nextFloat());
                    var f7 = (Math.sin(j2 * 3.141592653589793 / i2) * j / 100.0 + 1.0);

                    for (var k2 = Math.round(f - f7); k2 <= Math.round(f + f7); ++k2) {
                        for (var l2 = Math.round(f1 - f7); l2 <= Math.round(f1 + f7); ++l2) {
                            for (var i3 = Math.round(f2 - f7); i3 <= Math.round(f2 + f7); ++i3) {
                                var f8 = k2 - f;
                                var f9 = l2 - f1;
                                var f10 = i3 - f2;

                                if (f8 * f8 + f9 * f9 * 2.0 + f10 * f10 < f7 * f7 && k2 >= 1 && l2 >= 1 && i3 >= 1 && k2 < this.xSize - 1 && l2 < this.ySize - 1 && i3 < this.zSize - 1) {
                                    var j3 = parseInt((l2 * this.zSize + i3) * this.xSize + k2, 10);

                                    //if (this.tiles[j3] == Tile.rock.id) {
                                    if (this.tiles[j3] == 2) {
                                        this.tiles[j3] = tile;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // floodfill
        this.floodFill = function(xc, yc, zc, unused, tile) {
            //ArrayList<int[]> fillBuffer = new ArrayList<>();
            //console.log(yc)
            //yc+=31

            //var fillBuffer = [];

            var wBits = 1;
            var hBits = 1;

            while (1 << wBits < xSize)
                wBits++;
            while (1 << hBits < ySize)
                hBits++;

            var zMask = this.zSize - 1;
            var xMask = this.xSize - 1;
            var count = 1;

            this.fillQueue[0] = ((yc << hBits) + zc << wBits) + xc;

            //console.log(this.fillQueue[0]);
            var k2 = 0;


            var offset = this.xSize * this.zSize;

            while (count > 0) {
                --count;
                var val = this.fillQueue[count];
                //if (count == 0 && fillBuffer.size() > 0) {
                /*if (count == 0 && fillBuffer.length > 0) {
                    //System.out.println("IT HAPPENED!");
                    console.log("IT HAPPENED!");
                    //this.fillQueue = fillBuffer.remove(fillBuffer.size() - 1);
                    this.fillQueue = fillBuffer.slice(fillBuffer.length-1);

                    count = this.fillQueue.length;
                }*/

                var z = val >> wBits & zMask;
                var l2 = val >> wBits + hBits;

                var i3 = 0;
                var j3 = 0;

                for (j3 = i3 = val & xMask; i3 > 0 && this.tiles[val - 1] == 0; --val) {
                    --i3;
                }

                while (j3 < this.xSize && this.tiles[val + j3 - i3] == 0) {
                    ++j3;
                }

                var k3 = val >> wBits & zMask;
                var l3 = val >> wBits + hBits;

                if (k3 != z || l3 != l2) {
                    //System.out.println("hoooly fuck");
                    console.log("hoooly fuck")
                }

                var flag = false;
                var flag1 = false;
                var flag2 = false;

                k2 += (j3 - i3);

                //console.log(k2)

                for (i3 = i3; i3 < j3; ++i3) {
                    //console.log(val)
                    this.tiles[val] = tile;
                    var flag3;

                    if (z > 0) {
                        if ((flag3 = this.tiles[val - this.xSize] == 0) && !flag) {
                            //if (count == this.fillQueue.length) {
                            //fillBuffer.add(this.fillQueue);
                            //console.log("111");
                            //fillBuffer.concat(this.fillQueue);
                            //this.fillQueue = [];
                            //count = 0;
                            //}

                            this.fillQueue[count++] = val - this.xSize;
                        }

                        flag = flag3;
                    }

                    if (z < this.zSize - 1) {
                        if ((flag3 = this.tiles[val + this.xSize] == 0) && !flag1) {
                            //if (count == this.fillQueue.length) {
                            //fillBuffer.add(this.fillQueue);
                            //console.log("222");
                            //fillBuffer.concat(this.fillQueue);
                            //this.fillQueue = [];
                            //count = 0;
                            //}

                            this.fillQueue[count++] = val + this.xSize;
                        }

                        flag1 = flag3;
                    }

                    if (l2 > 0) {
                        var b2 = this.tiles[val - offset];

                        //if (( tile == Tile.lava.id || tile == Tile.calmLava.id) && (b2 == Tile.water.id || b2 == Tile.calmWater.id)) {
                        if ((tile == 17) && (b2 == 7)) {
                            this.tiles[val - offset] = 2; //Tile.rock.id;
                        }

                        if ((flag3 = b2 == 0) && !flag2) {
                            //if (count == this.fillQueue.length) {
                            //fillBuffer.add(this.fillQueue);
                            //console.log("333");
                            //fillBuffer.concat(this.fillQueue);
                            // this.fillQueue = [];
                            //count = 0;
                            //}

                            this.fillQueue[count++] = val - offset;
                        }

                        flag2 = flag3;
                    }

                    ++val;
                }
            }

            return k2;
        }






        progress.string = "Raising..";
        //this.progressRenderer.progressStage("Raising..");
        var distort = new Distort(new PerlinNoise(this.random, 8), new PerlinNoise(this.random, 8));
        var distort1 = new Distort(new PerlinNoise(this.random, 8), new PerlinNoise(this.random, 8));
        var perlinnoise = new PerlinNoise(this.random, 8);
        var aint = [];
        var f = 1.3;

        var l;
        var i1;

        for (l = 0; l < xSize; ++l) {
            //progress(l * 100 / (xSize - 1));
            progress.percent = l * 100 / (xSize - 1);
            self.postMessage(progress);

            for (i1 = 0; i1 < zSize; ++i1) {
                var d0 = distort.getValue((l * f), (i1 * f)) / 8.0 - 8.0;
                var d1 = distort1.getValue((l * f), (i1 * f)) / 6.0 + 6.0;

                if (perlinnoise.getValue(l, i1) / 8.0 > 0.0) {
                    d1 = d0;
                }

                var d2;

                if ((d2 = Math.max(d0, d1) / 2.0) < 0.0) {
                    d2 *= 0.8;
                }

                aint[l + i1 * xSize] = d2;
            }
        }


        progress.string = "Eroding..";
        //this.progressRenderer.progressStage("Eroding..");
        var aint1 = aint;

        distort1 = new Distort(new PerlinNoise(this.random, 8), new PerlinNoise(this.random, 8));
        var distort2 = new Distort(new PerlinNoise(this.random, 8), new PerlinNoise(this.random, 8));

        var j1;
        var k1;
        var l1;
        var i2;

        for (j1 = 0; j1 < xSize; ++j1) {
            //progress(j1 * 100 / (xSize - 1));
            progress.percent = j1 * 100 / (xSize - 1);
            self.postMessage(progress);

            for (k1 = 0; k1 < zSize; ++k1) {
                var d3 = distort1.getValue((j1 << 1), (k1 << 1)) / 8.0;

                l1 = distort2.getValue((j1 << 1), (k1 << 1)) > 0.0 ? 1 : 0;
                if (d3 > 2.0) {
                    i2 = ((aint1[j1 + k1 * xSize] - l1) / 2 << 1) + l1;
                    aint1[j1 + k1 * xSize] = i2;
                }
            }
        }


        progress.string = "Soiling..";
        //this.progressRenderer.progressStage("Soiling..");
        aint1 = aint;
        var j2 = this.xSize;
        var k2 = this.zSize;

        j1 = this.ySize;
        var perlinnoise1 = new PerlinNoise(this.random, 8);

        var l2;
        var i3;

        for (l = 0; l < j2; ++l) {
            //progress(l * 100 / (xSize - 1));
            progress.percent = l * 100 / (xSize - 1);
            self.postMessage(progress);

            for (i1 = 0; i1 < k2; ++i1) {
                l1 = (perlinnoise1.getValue(l, i1) / 24.0) - 4;
                l2 = (i2 = aint1[l + i1 * j2] + j1 / 2) + l1;
                aint1[l + i1 * j2] = Math.max(i2, l2);

                for (i3 = 0; i3 < j1; ++i3) {
                    var j3 = (i3 * zSize + i1) * xSize + l;
                    var k3 = 0;

                    if (i3 <= i2) {
                        k3 = 3; //Tile.dirt.id;
                    }

                    if (i3 <= l2) {
                        k3 = 2; //Tile.rock.id;
                    }

                    this.tiles[j3] = k3;
                }
            }
        }


        progress.string = "Carving..";
        //this.progressRenderer.progressStage("Carving..");

        k2 = this.xSize;
        j1 = this.zSize;
        k1 = this.ySize;
        l = k2 * j1 * k1 / 256 / 64;

        for (i1 = 0; i1 < l; ++i1) {
            //progress(i1 * 100 / (l - 1) / 4);
            progress.percent = i1 * 100 / (l - 1) / 4;
            self.postMessage(progress);

            var f1 = random.nextFloat() * k2;
            var f2 = random.nextFloat() * k1;
            var f3 = random.nextFloat() * j1;

            i3 = ((random.nextFloat() + random.nextFloat()) * 75.0);
            var f4 = (random.nextFloat() * 3.141592653589793 * 2.0);
            var f5 = 0.0;
            var f6 = (random.nextFloat() * 3.141592653589793 * 2.0);
            var f7 = 0.0;

            for (var l3 = 0; l3 < i3; ++l3) {
                f1 = (f1 + Math.sin(f4) * Math.cos(f6));
                f3 = (f3 + Math.cos(f4) * Math.cos(f6));
                f2 = (f2 + Math.sin(f6));
                f4 += f5 * 0.2;
                f5 = (f5 *= 0.9) + (random.nextFloat() - random.nextFloat());
                f6 = (f6 + f7 * 0.5) * 0.5;
                f7 = (f7 *= 0.9) + (random.nextFloat() - random.nextFloat());
                if (random.nextFloat() >= 0.3) {
                    var f8 = f1 + random.nextFloat() * 4.0 - 2.0;
                    var f9 = f2 + random.nextFloat() * 4.0 - 2.0;
                    var f10 = f3 + random.nextFloat() * 4.0 - 2.0;
                    var f11 = (Math.sin(l3 * 3.141592653589793 / i3) * 2.5 + 1.0);

                    for (var i4 = parseInt((f8 - f11), 10); i4 <= parseInt((f8 + f11), 10); ++i4) {
                        for (var j4 = parseInt((f9 - f11), 10); j4 <= parseInt((f9 + f11), 10); ++j4) {
                            for (var k4 = (f10 - f11); k4 <= (f10 + f11); ++k4) {
                                var f12 = i4 - f8;
                                var f13 = j4 - f9;
                                var f14 = k4 - f10;

                                if (f12 * f12 + f13 * f13 * 2.0 + f14 * f14 < f11 * f11 && i4 >= 1 && j4 >= 1 && k4 >= 1 && i4 < xSize - 1 && j4 < ySize - 1 && k4 < zSize - 1) {
                                    var l4 = parseInt((j4 * zSize + k4) * xSize + i4, 10);

                                    //if (tiles[l4] == Tile.rock.id) {
                                    if (this.tiles[l4] == 2) {
                                        this.tiles[l4] = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        this.placeOre(20, 90, 1, 4); // coal
        this.placeOre(19, 70, 2, 4); // iron
        this.placeOre(18, 50, 3, 4); // gold

        progress.string = "Watering..";
        //this.progressRenderer.progressStage("Watering..");
        //long i5 = System.nanoTime();
        var i5 = random.nextFloat(); //Math.random();
        var j5 = 0;

        l = 7; //Tile.calmWater.id;
        //this.progress(0);

        // hack for floodfill to work...
        var extray = 64 - 35;
        if (xSize >= 256) extray = 128 - 36;
        if (xSize >= 512) extray = 256 - 37;

        //console.log(ySize / 2 - 1)

        for (i1 = 0; i1 < xSize; ++i1) {
            j5 = j5 + this.floodFill(i1, ySize / 2 - 1 + extray, 0, 0, l) + this.floodFill(i1, ySize / 2 - 1, zSize - 1 + extray, 0, l);
        }

        for (i1 = 0; i1 < zSize; ++i1) {
            j5 = j5 + this.floodFill(0, ySize / 2 - 1 + extray, i1, 0, l) + this.floodFill(xSize - 1, ySize / 2 - 1 + extray, i1, 0, l);
        }


        i1 = xSize * zSize / 200;

        for (l1 = 0; l1 < i1; ++l1) {
            if (l1 % 100 == 0) {
                //    progress(l1 * 100 / (i1 - 1));
                progress.percent = l1 * 100 / (i1 - 1);
                self.postMessage(progress);
            }

            i2 = random.nextInt(xSize);
            l2 = ySize / 2 - 1 - random.nextInt(3) + extray;
            i3 = random.nextInt(zSize);
            if (this.tiles[(l2 * zSize + i3) * xSize + i2] == 0) {
                j5 += this.floodFill(i2, l2, i3, 0, l);
            }
        }

        progress.percent = 100;
        self.postMessage(progress);

        progress.string = "Melting..";
        //this.progressRenderer.progressStage("Melting..");
        this.melt();
        progress.string = "Growing..";
        //this.progressRenderer.progressStage("Growing..");
        this.grow(aint);
        progress.string = "Planting..";
        //this.progressRenderer.progressStage("Planting..");
        this.plant(aint);

        progress.tiles = this.tiles;
        progress.string = "";
        self.postMessage(progress);

    }


}

function startGeneration(obj) { //{worldSize: worldSize, seed: props.seed, seedrandom: seedrandom}
    var level = new RandomLevel();
    //console.log(level)
    var width = obj.worldSize;
    var depth = obj.worldSize;
    var height = 64;
    level.createLevel(obj.seed, width, depth, height);
}

self.addEventListener('message', function(e) {
    //console.log("worker get "+e.data);
    startGeneration(e.data)
}, false);