// Create clib namespace
clib = {};

clib.Collisions = {};

clib.Collisions.circle = {
    contains: {}
};

clib.Collisions.aabb = {
    contains: {}
};

clib.Collisions.circle.circle = function (a, b) {
    var distance = dist(a, b);
    return distance <= a.radius + b.radius;
};

clib.Collisions.circle.aabb = function (circle, aabb) {
    return clib.Collisions.aabb.circle(aabb, circle);
};

clib.Collisions.circle.contains.point = function (circle, point) {
    var distance = dist(circle, point);
    return distance <= circle.radius;
};

clib.Collisions.aabb.aabb = function (a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
};

clib.Collisions.aabb.circle = function (aabb, circle) {
    var rects = [
        { x: aabb.x - circle.radius, y: aabb.y,
            width: aabb.width + (circle.radius * 2), height: aabb.height },
        { x: aabb.x, y: aabb.y - circle.radius,
            width: aabb.width, height: aabb.height + (circle.radius * 2) }
    ];

    var circles = [
        { x: aabb.x, y: aabb.y, radius: circle.radius },
        { x: aabb.x + aabb.width, y: aabb.y, radius: circle.radius },
        { x: aabb.x + aabb.width, y: aabb.y + aabb.height, radius: circle.radius },
        { x: aabb.x, y: aabb.y + aabb.height, radius: circle.radius },
    ];

    var collides = false;

    for (var c = 0; c < circles.length; c++)
        if (clib.Collisions.circle.contains.point(circles[c], circle)) collides = true;

    for (var i = 0; i < rects.length; i++)
        if (clib.Collisions.aabb.contains.point(rects[i], circle)) collides = true;

    return collides;
};

clib.Collisions.aabb.contains.point = function (aabb, point) {
    return point.x > aabb.x &&
        point.x < aabb.x + aabb.width &&
        point.y > aabb.y &&
        point.y < aabb.y + aabb.height;
};

clib.loadImages = function(sources, finishCallback, singleCallback = (img) => undefined) {
    check(2, 3, Object, Function, Function);
    var images = {};
    var loadedImages = 0;
    var numImages = Object.keys(sources).length;
    if (numImages === 0) finishCallback(images);

    for (var src in sources) {
        images[src] = new Image();
        images[src].onload = function() { // jshint ignore: line
            singleCallback(images[src]);
            if (++loadedImages >= numImages) {
                finishCallback(images);
            }
        };
        images[src].src = sources[src];
    }
};

var Keys = {
    a: 65,
    b: 66,
    c: 67,
    d: 68,
    e: 69,
    f: 70,
    g: 71,
    h: 72,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    m: 77,
    n: 78,
    o: 79,
    p: 80,
    q: 81,
    r: 82,
    s: 83,
    t: 84,
    u: 85,
    v: 86,
    w: 87,
    x: 88,
    y: 89,
    z: 90,

    one: 49,
    two: 50,
    three: 51,
    four: 52,
    five: 53,
    six: 54,
    seven: 55,
    eight: 56,
    nine: 67,
    zero: 48,

    f1: 112,
    f2: 113,
    f3: 114,
    f4: 115,
    f5: 116,
    f6: 117,
    f7: 118,
    f8: 119,
    f9: 120,
    f10: 121,
    f11: 122,
    f12: 123,

    space: 32,
    alt: 18,
    win: 91, cmd: 91,
    ctrl: 17, control: 17,
    shift: 16,
    tab: 9,
    esc: 27, escape: 27,

    equals: 187, plus: 187,
    underscore: 189, dash: 189,
    leftbracket: 219, ltbracket: 219, leftsquarebracket: 219,
    rightbracket: 221, rtbracket: 221, rightsquarebracket: 221,
    pole: 220, backslash: 220,
    apostrophe: 222, quote: 222, speechmark: 222,
    semicolon: 186, colon: 186,
    comma: 188, lessthan: 188,
    period: 190, dot: 190,
    fullstop: 190, greaterthan: 190, morethan: 190,
    slash: 191, forwardslash: 191, question: 191, questionmark: 191,

    left: 37, leftarrow: 37,
    up: 38, uparrow: 38,
    right: 39, rightarrow: 39,
    down: 40, downarrow: 40
};

clib.Maths = {};

clib.Maths.clamp = function(x, min, max) {
    check(3, 3, Number, Number, Number);
    return x < min ? min : x > max ? max : x;
};

clib.Maths.radToDeg = function(rad) {
    check(1, 1, Number);
    return rad * (180 / Math.PI);
};

clib.Maths.degToRad = function(deg) {
    check(1, 1, Number);
    return deg * (Math.PI / 180);
};

clib.Maths.lerp = function(a, b, t, allowExtrapolation = false) {
    check(3, 4, Number, Number, Number, Boolean);
    if (!allowExtrapolation) {
        t = clib.Maths.clamp(t, 0, 1);
    }
    return a + t * (b - a);
};

clib.Random = {
    vector: function (len = 1) {
        check(0, 1, Number);
        var angle = Math.random(-Math.PI, Math.PI);
        var vec = radToVec(angle);
        return {
            x: vec.x * len,
            y: vec.y * len
        };
    },
    range: function (min, max) {
        check(1, 2, Number, Number);
        if (arguments.length == 1) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    },
    intRange: function (min, max) {
        check(1, 2, Number, Number);
        if (arguments.length == 1) {
            max = min;
            min = 0;
        }
        return Math.floor(Math.random() * (max - min) + min);
    },
    angle: function (unit = 'deg') {
        check(0, 1, String);
        if (unit == 'deg' || unit == 'degrees' || unit == 'd') {
            return Random.range(0, 360);
        } else if (unit == 'rad' || unit == 'radians' || unit == 'r') {
            return Random.range(-Math.PI, Math.PI);
        } else {
            throw new Error('You must specify the unit as either d, deg, degrees, r, rad, or radians!');
        }
    }
};

clib.Scene = function(name, functions) {
    check(2, 2, String, Object);
    this.name = name;
    this.active = false;

    functions = validateObject(functions, {
        init: function(stage) {},
        enter: function(stage) {},
        exit: function(stage) {},
        update: function(stage, dt) {},
        render: function(stage, dt) {}
    });

    this.init = functions.init.bind(this);
    this.enter = functions.enter.bind(this);
    this.exit = functions.exit.bind(this);
    this.update = functions.update.bind(this);
    this.render = functions.render.bind(this);
};

clib.Stage = function(id = 'canvas', options = {}) {
    check(arguments, 1, 2);
    this.canvas = document.getElementById(id);
    if (this.canvas === null || this.canvas.nodeName != 'CANVAS') {
        throw new Error(`No canvas was found with the id: ${id}!`);
    }

    this.context = this.canvas.getContext('2d');

    this.is = {
        pathing: false
    };

    this.deltaTime = 0;
    this.fps = 0;

    this._mouse = {
        x: 0,
        y: 0,
        down: {}
    };

    this.keys = {};

    this.translated = {
        x: 0,
        y: 0
    };

    this._scenes = [];
    this._activeSceneName = undefined;

    this._eventDispatcher = document.createElement('DIV');
    this._tickEvent = new Event('tick');
    this._lastTick = undefined;

    this.options = validateObject(options, {
        background: 'white',
        focusable: true,
        focusedOutline: false,
        imageSmoothing: true,
        autoRound: true
    });

    this.canvas.style.background = options.background;
    if (options.focusable) {
        this.canvas.tabIndex = 1;
        if (!options.focusedOutline) {
            this.canvas.style.outline = 0;
        }
    }

    this.context.imageSmoothingEnabled = options.imageSmoothing;

    window.requestAnimationFrame(this._tick.bind(this));

    this.canvas.addEventListener('mousemove', (function(evt) {
        this._mouse = {
            x: evt.layerX,
            y: evt.layerY,
            down: this._mouse.down
        };
    }).bind(this));

    this.canvas.addEventListener('mousedown', (function(evt) {
        this._mouse.down[evt.button] = true;
    }).bind(this));

    this.canvas.addEventListener('mouseup', (function(evt) {
        this._mouse.down[evt.button] = false;
    }).bind(this));

    this.canvas.addEventListener('keydown', (function(evt) {
        this.keys[evt.keyCode] = true;
    }).bind(this));

    this.canvas.addEventListener('keyup', (function(evt) {
        this.keys[evt.keyCode] = false;
    }).bind(this));
    
    if (!this.canvas.style.width)
        this.canvas.style.width = this.canvas.width + 'px';
    if (!this.canvas.style.height)
        this.canvas.style.height = this.canvas.height + 'px';

    var scaleFactor = window.devicePixelRatio;
    this.canvas.width = Math.ceil(this.canvas.width * scaleFactor);
    this.canvas.height = Math.ceil(this.canvas.height * scaleFactor);
    var c = this.canvas.getContext('2d');
    c.scale(scaleFactor, scaleFactor);
};

clib.Stage.prototype.addScene = function(scene) {
    check(1, 1, clib.Scene);
    if (scene.constructor !== clib.Scene) {
        throw new Error('Your scene isn\'t of the type clib.Scene');
    }
    this._scenes.push(scene);
    scene.init(this);
    return this;
};

clib.Stage.prototype.addScenes = function(...scenes) {
    check(1, Infinity);
    for (var scene of scenes) {
        if (scene.constructor !== clib.Scene) {
            throw new Error('All the scenes must be of type clib.Scene');
        }
    }
    for (scene of scenes) {
        this.addScene(scene);
    }
    return this;
};

clib.Stage.prototype.setActiveScene = function(name) {
    check(1, 1, String);
    for (var scene of this._scenes) {
        if (scene.name === name) {
            this._activeSceneName = scene.name;
            scene.enter(this);
            scene.active = true;
        } else {
            if (scene.active) scene.exit(this);
            scene.active = false;
        }
    }
    return this;
};

clib.Stage.prototype.getActiveScene = function() {
    for (var scene of this._scenes) {
        if (scene.name === this._activeSceneName) {
            return scene;
        }
    }
    return undefined;
};

clib.Stage.prototype.updateScene = function() {
    var scene = this.getActiveScene();
    if (exists(scene)) {
        scene.update(this, this.deltaTime);
    }
    return this;
};

clib.Stage.prototype.renderScene = function() {
    var scene = this.getActiveScene();
    if (exists(scene)) {
        scene.render(this, this.deltaTime);
    }
    return this;
};

clib.Stage.prototype.addEventListener = function(evt, callback) {
    check(2, 2, String, Function);
    if ((['mousedown', 'mousemove', 'mouseup', 'keydown', 'keyup']).indexOf(evt) != -1) {
        this.canvas.addEventListener(evt, callback, false);
    }
    this._eventDispatcher.addEventListener(evt, callback, false);
    return this;
};

clib.Stage.prototype.on = function(evt, callback) {
    this.addEventListener(evt, callback);
    return this;
};

clib.Stage.prototype._dispatch = function(evt) {
    check(1, 1, Object);
    this._eventDispatcher.dispatchEvent(evt);
};

clib.Stage.prototype._tick = function() {
    if (exists(this._lastTick)) {
        var now = Date.now();
        this.deltaTime = (now - this._lastTick) / 1000;
        this._lastTick = now;
        this.fps = 1 / this.deltaTime;
    } else {
        this._lastTick = Date.now();
    }

    this._dispatch(this._tickEvent);
    window.requestAnimationFrame(this._tick.bind(this));
};

clib.Stage.prototype.getMouse = function() {
    return {
        x: this._mouse.x - this.translated.x,
        y: this._mouse.y - this.translated.y,
        down: this._down
    };
};

clib.Stage.prototype.getDimensions = function() {
    return {
        width: this.canvas.width,
        height: this.canvas.height,
        half: {
            width: this.canvas.width / 2,
            height: this.canvas.height / 2
        }
    };
};

clib.Stage.prototype.clear = function() {
    var dim = this.getDimensions();
    this.context.save();
    this.context.resetTransform();
    this.context.clearRect(0, 0, dim.width, dim.height);
    this.context.restore();
    return this;
};

clib.Stage.prototype.translate = function(x, y) {
    check(2, 2, Number, Number);
    this.context.translate(x, y);
    this.translated.x += x;
    this.translated.y += y;
    return this;
};

clib.Stage.prototype.translateX = function(dist) {
    check(1, 1, Number);
    this.translate(dist, 0);
    return this;
};

clib.Stage.prototype.translateY = function(dist) {
    check(1, 1, Number);
    this.translate(0, dist);
    return this;
};

clib.Stage.prototype.beginPath = function() {
    this.context.beginPath();
    this.is.pathing = true;
    return this;
};

clib.Stage.prototype.closePath = function() {
    this.context.closePath();
    this.is.pathing = false;
    return this;
};

clib.Stage.prototype.moveTo = function(x, y) {
    check(2, 2, Number, Number);
    if (!this.is.pathing) {
        this.beginPath();
    }
    this.context.moveTo(x, y);
    return this;
};

clib.Stage.prototype.lineTo = function(x, y) {
    check(2, 2, Number, Number);
    if (!this.is.pathing) {
        this.beginPath();
    }
    this.context.lineTo(x, y);
    return this;
};

clib.Stage.prototype.arc = function(x, y, radius, start, end, counterclockwise = false) {
    check(5, 6, Number, Number, Number, Number, Number, Boolean);
    if (radius < 0) throw new Error('The radius can be no less than 0!');
    if (!this.is.pathing) {
        this.beginPath().moveTo(x, y);
    }
    this.context.arc(x, y, radius, start, end, counterclockwise);
    return this;
};

clib.Stage.prototype.circle = function(x, y, radius) {
    check(3, 3, Number, Number, Number);
    if (radius < 0) throw new Error('The radius can be no less than 0!');
    if (!this.is.pathing) {
        this.beginPath().moveTo(x, y);
    }
    this.context.arc(x, y, radius, -Math.PI, Math.PI);
    return this;
};

clib.Stage.prototype.arcTo = function(x1, y1, x2, y2, radius) {
    check(5, 5, Number, Number, Number, Number, Number);
    if (radius < 0) throw new Error('The radius can be no less than 0!');
    if (!this.is.pathing) {
        this.beginPath();
    }
    this.context.arcTo(x1, y1, x2, y2, radius);
    return this;
};

clib.Stage.prototype.bezierCurveTo = function(c1x, c1y, c2x, x2y, x, y) {
    check(6, 6, Number, Number, Number, Number, Number, Number);
    if (!this.is.pathing) {
        this.beginPath();
    }
    this.context.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
    return this;
};

clib.Stage.prototype.quadraticCurveTo = function(cx, cy, x, y) {
    check(4, 4, Number, Number, Number, Number);
    if (!this.is.pathing) {
        this.beginPath();
    }
    this.context.quadraticCurveTo(cx, cy, x, y);
    return this;
};

clib.Stage.prototype.rect = function(x, y, width, height) {
    check(4, 4, Number, Number, Number, Number);
    if (!this.is.pathing) {
        this.beginPath().moveTo(x, y);
    }
    this.context.rect(x, y, width, height);
    return this;
};

clib.Stage.prototype.polyline = function(verts) {
    check(1, 1, Array);
    if (verts.lenth < 2) {
        throw new Error('You must have at least 2 vertices!');
    }
    if (!this.is.pathing) {
        this.beginPath();
    }
    this.moveTo(verts[0].x, verts[0].y);
    for (var vert in verts) {
        if (verts.hasOwnProperty(vert)) {
            var pos = {
                x: verts[vert].x,
                y: verts[vert].y
            };
            if (this.options.autoRound) {
                pos.x = Math.round(pos.x) + 0.5;
                pos.y = Math.round(pos.y) + 0.5;
            }
            this.lineTo(pos.x, pos.y);
        }
    }
    return this;
};

clib.Stage.prototype.poly = function(verts) {
    check(1, 1, Array);
    if (verts.length < 3) {
        throw new Error('You must have at least 3 vertices!');
    }
    this.polyline(verts);
    this.lineTo(verts[0].x, verts[0].y);
    return this;
};

clib.Stage.prototype.strokeText = function(text, x, y, options = {}) {
    check(3, 4, String, Number, Number, Object);

    options = validateObject(options, {
        font: '14px sans-serif',
        style: 'black',
        align: 'start',
        baseline: 'alphabetic',
        direction: 'inherit'
    });

    this.context.font = options.font;
    this.context.strokeStyle = options.style;
    this.context.textAlign = options.align;
    this.context.textBaseline = options.baseline;
    this.context.direction = options.direction;

    this.context.strokeText(text, x, y);
};

clib.Stage.prototype.fillText = function(text, x, y, options = {}) {
    check(3, 4, String, Number, Number, Object);

    options = validateObject(options, {
        font: '14px sans-serif',
        style: 'black',
        align: 'start',
        baseline: 'alphabetic',
        direction: 'inherit'
    });

    this.context.font = options.font;
    this.context.fillStyle = options.style;
    this.context.textAlign = options.align;
    this.context.textBaseline = options.baseline;
    this.context.direction = options.direction;

    this.context.fillText(text, x, y);
};

clib.Stage.prototype.stroke = function(options = {}, shadow = {}) {
    check(0, 2, Object, Object);

    options = validateObject(options, {
        style: 'black',
        width: 0.5,
        join: 'miter',
        cap: 'butt'
    });

    shadow = validateObject(shadow, {
        colour: 'black',
        blur: 0,
        offsetX: 0,
        offsetY: 0
    });

    this.context.shadowColor = shadow.colour;
    this.context.shadowBlur = shadow.blur;
    this.context.shadowOffsetX = shadow.offsetX;
    this.context.shadowOffsetY = shadow.offsetY;

    this.context.strokeStyle = options.style;
    this.context.lineWidth = options.width;
    this.context.lineJoin = options.join;
    this.context.lineCap = options.cap;
    this.context.save();
    this.context.translate(0.5, 0.5);
    this.context.stroke();
    this.context.restore();
    return this;
};

clib.Stage.prototype.fill = function(options = {}, shadow = {}) {
    check(0, 2, Object, Object);

    options = validateObject(options, {
        style: 'black'
    });

    shadow = validateObject(shadow, {
        colour: 'black',
        blur: 0,
        offsetX: 0,
        offsetY: 0
    });

    this.context.shadowColor = shadow.colour;
    this.context.shadowBlur = shadow.blur;
    this.context.shadowOffsetX = shadow.offsetX;
    this.context.shadowOffsetY = shadow.offsetY;

    this.context.fillStyle = options.style;
    this.context.fill();
    return this;
};

clib.Stage.prototype.drawImage = function(image, x, y, width = image.width, height = image.height) {
    check(3, 5, Image, Number, Number, Number, Number);
    this.context.drawImage(image, x, y, width, height);
    return this;
};

function exists (arg) {
    return !(arg === undefined || arg === null);
}

function check (args, min = -1, max = Infinity) {
    if (args.length < min) {
        throw new Error(`You must have at least ${min} arguments! You only have ${args.length}`);
    } else if (args.length > max) {
        throw new Error(`You must have no more than ${max} arguments! You have ${args.length}`);
    }

    types = Array.prototype.slice.call(arguments).slice(3);

    for (var arg in args) {
        if (!args.hasOwnProperty(arg)) {
            continue;
        }
        if (exists(types[arg])) {
            if (args[arg].constructor === types[arg]) {
                throw new Error(`Argument ${parseInt(arg) + 1} must be of type ${types[arg].name}!`);
            }
        }
    }
}

function validateObject (obj, defObj) {
    check(2, 2, Object, Object);
    for (var prop in defObj) {
        if (defObj.hasOwnProperty(prop)) {
            if (!obj.hasOwnProperty(prop) || typeof(defObj[prop]) != typeof(obj[prop])) {
                obj[prop] = defObj[prop];
            }
        }
    }
    return obj;
}

function validateVector(vec, throwError = false) {
    var x = vec.hasOwnProperty('x');
    var y = vec.hasOwnProperty('y');
    var valid = x && y;
    if (throwError && !valid) {
        if (!x && !y) throw new Error('Your vector must have an X and Y component!');
        if (!x) throw new Error('Your vector must have an X component!');
        if (!y) throw new Error('Your vector must have a Y component!');
    } else {
        return valid;
    }
}

function addVec (a, b) {
    check(2, 2, Object, Object);
    validateVector(a, true);
    validateVector(b, true);
    return {x: a.x + b.x, y: a.y + b.y};
}

function scaleVec (vec, scale) {
    check(2, 2, Object, Number);
    validateVector(vec, true);
    return {x: vec.x * scale, y: vec.y * scale};
}

function divideVec (vec, divisor) {
    check(2, 2, Object, Number);
    validateVector(vec, true);
    return scaleVec(vec, 1 / scale);
}

function lengthVec (vec) {
    check(1, 1, Object);
    validateVector(vec, true);
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

function dist (a, b) {
    check(2, 2, Object, Object);
    validateVector(a, true);
    validateVector(b, true);
    var dist = {
        x: Math.abs(a.x - b.x),
        y: Math.abs(a.y - b.y)
    };
    return lengthVec(dist);
}

function normalizeVec (vec) {
    check(1, 1, Object);
    validateVector(vec, true);
    var len = lengthVec(vec);
    return {
        x: vec.x / len,
        y: vec.y / len
    };
}

function lerpVec (vec, targetVec, t, allowExtrapolation = false) {
    check(3, 4, Object, Object, Number, Boolean);
    validateVector(vec, true);
    validateVector(targetVec, true);
    return {
        x: clib.Maths.lerp(vec.x, targetVec.x, t, allowExtrapolation),
        y: clib.Maths.lerp(vec.y, targetVec.y, t, allowExtrapolation)
    };
}

function degToVec (deg) {
    check(1, 1, Number);
    return radToVec(clib.Maths.degToRad(deg));
}

function radToVec (rad) {
    check(1, 1, Number);
    return {
        x: Math.cos(rad),
        y: Math.sin(rad)
    };
}

function vecToRad (vec) {
    check(1, 1, Object);
    validateVector(vec, true);
    return Math.atan2(vec.y, vec.x);
}

function vecToDeg (vec) {
    check(1, 1, Object);
    validateVector(vec, true);
    return clib.Maths.radToDeg(vecToRad(vec));
}
