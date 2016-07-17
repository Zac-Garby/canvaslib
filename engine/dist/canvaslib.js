var Collisions = {};

Collisions.circle = {
    contains: {}
};

Collisions.aabb = {
    contains: {}
};

Collisions.circle.circle = function (a, b) {
    var distance = dist(a, b);
    return distance <= a.radius + b.radius;
};

Collisions.circle.aabb = function (circle, aabb) {
    return Collisions.aabb.circle(aabb, circle);
};

Collisions.circle.contains.point = function (circle, point) {
    var distance = dist(circle, point);
    return distance <= circle.radius;
};

Collisions.aabb.aabb = function (a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
};

Collisions.aabb.circle = function (aabb, circle) {
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
        if (Collisions.circle.contains.point(circles[c], circle)) collides = true;

    for (var i = 0; i < rects.length; i++)
        if (Collisions.aabb.contains.point(rects[i], circle)) collides = true;

    return collides;
};

Collisions.aabb.contains.point = function (aabb, point) {
    return point.x > aabb.x &&
        point.x < aabb.x + aabb.width &&
        point.y > aabb.y &&
        point.y < aabb.y + aabb.height;
};

function clamp (x, min, max) {
    return x < min ? min : x > max ? max : x;
}

function radToDeg (rad) {
    return rad * (180 / Math.PI);
}

function degToRad (deg) {
    return deg * (Math.PI / 180);
}

var Random = {
    vector: function (len = 1) {
        var angle = Math.random(-Math.PI, Math.PI);
        var vec = radToVec(angle);
        return {
            x: vec.x * len,
            y: vec.y * len
        };
    },
    range: function (min, max) {
        if (arguments.length == 1) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    },
    intRange: function (min, max) {
        if (arguments.length == 1) {
            max = min;
            min = 0;
        }
        return Math.floor(Math.random() * (max - min) + min);
    },
    angle: function (unit = 'deg') {
        if (unit == 'deg' || unit == 'degrees' || unit == 'd') {
            return Random.range(0, 360);
        } else if (unit == 'rad' || unit == 'radians' || unit == 'r') {
            return Random.range(-Math.PI, Math.PI);
        } else {
            throw new Error('You must specify the unit as either d, deg, degrees, r, rad, or radians!');
        }
    }
};

var Stage = function (id = 'canvas', options = {}) {
    check(arguments, 1, 2);
    this.canvas = document.getElementById (id);
    if (this.canvas === null || this.canvas.nodeName != 'CANVAS') {
        throw new Error(`No canvas was found with the id: ${id}!`);
    }

    this.context = this.canvas.getContext ('2d');

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

    this.translated = {x: 0, y: 0};

    this._eventDispatcher = document.createElement('DIV');
    this._tickEvent = new Event('tick');
    this._lastTick = undefined;

    options = validateObject(options, {
        background: 'white',
        focusable: true,
        focusedOutline: false
    });

    this.canvas.style.background = options.background;
    if (options.focusable) {
        this.canvas.tabIndex = 1;
        if (!options.focusedOutline) {
            this.canvas.style.outline = 0;
        }
    }

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
};

Stage.prototype.addEventListener = function (evt, callback) {
    check(2, 2, ['string', 'function']);
    if ((['mousedown', 'mousemove', 'mouseup', 'keydown', 'keyup']).indexOf(evt) != -1) {
        this.canvas.addEventListener(evt, callback, false);
    }
    this._eventDispatcher.addEventListener(evt, callback, false);
    return this;
};

Stage.prototype.on = function (evt, callback) {
    this.addEventListener(evt, callback);
    return this;
};

Stage.prototype._dispatch = function (evt) {
    check(1, 1, ['object']);
    this._eventDispatcher.dispatchEvent(evt);
};

Stage.prototype._tick = function () {
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

Stage.prototype.getMouse = function () {
    return {
        x: this._mouse.x - this.translated.x,
        y: this._mouse.y - this.translated.y,
        down: this._down
    };
};

Stage.prototype.getDimensions = function () {
    return {
        width: this.canvas.width,
        height: this.canvas.height,
        half: {
            width: this.canvas.width / 2,
            height: this.canvas.height / 2
        }
    };
};

Stage.prototype.clear = function () {
    var dim = this.getDimensions();
    this.context.save();
    this.context.resetTransform();
    this.context.clearRect(0, 0, dim.width, dim.height);
    this.context.restore();
    return this;
};

Stage.prototype.translate = function (x, y) {
    check(2, 2, ['number', 'number']);
    this.context.translate(x, y);
    this.translated.x += x;
    this.translated.y += y;
    return this;
};

Stage.prototype.translateX = function (dist) {
    check(1, 1, ['number']);
    this.translate(dist, 0);
    return this;
};

Stage.prototype.translateY = function (dist) {
    check(1, 1, ['number']);
    this.translate(0, dist);
    return this;
};

Stage.prototype.beginPath = function () {
    this.context.beginPath();
    this.is.pathing = true;
    return this;
};

Stage.prototype.closePath = function () {
    this.context.closePath();
    this.is.pathing = false;
    return this;
};

Stage.prototype.moveTo = function (x, y) {
    check(2, 2, ['number', 'number']);
    if (!this.is.pathing) {
        this.beginPath();
    }
    this.context.moveTo(x, y);
    return this;
};

Stage.prototype.lineTo = function (x, y) {
    check(2, 2, ['number', 'number']);
    if (!this.is.pathing) {
        this.beginPath();
    }
    this.context.lineTo(x, y);
    return this;
};

Stage.prototype.arc = function (x, y, radius, start, end, counterclockwise = false) {
    check(5, 6, ['number', 'number', 'number', 'number', 'number', 'boolean']);
    if (!this.is.pathing) {
        this.beginPath();
    }
    this.context.arc(x, y, radius, start, end, counterclockwise);
    return this;
};

Stage.prototype.circle = function (x, y, radius) {
    check(3, 3, ['number', 'number', 'number']);
    if (!this.is.pathing) {
        this.beginPath();
    }
    this.context.arc(x, y, radius, -Math.PI, Math.PI);
    return this;
};

Stage.prototype.arcTo = function (x1, y1, x2, y2, radius) {
    check(5, 5, ['number', 'number', 'number', 'number', 'number']);
    if (!this.is.pathing) {
        this.beginPath();
    }
    this.context.arcTo(x1, y1, x2, y2, radius);
    return this;
};

Stage.prototype.bezierCurveTo = function (c1x, c1y, c2x, x2y, x, y) {
    check(6, 6, ['number', 'number', 'number', 'number', 'number', 'number']);
    if (!this.is.pathing) {
        this.beginPath();
    }
    this.context.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
    return this;
};

Stage.prototype.quadraticCurveTo = function (cx, cy, x, y) {
    check(4, 4, ['number', 'number', 'number', 'number']);
    if (!this.is.pathing) {
        this.beginPath();
    }
    this.context.quadraticCurveTo(cx, cy, x, y);
    return this;
};

Stage.prototype.rect = function (x, y, width, height) {
    check(4, 4, ['number', 'number', 'number', 'number']);
    if (!this.is.pathing) {
        this.beginPath();
    }
    this.context.rect(x, y, width, height);
    return this;
};

Stage.prototype.stroke = function (options = {}, shadow = {}) {
    check(0, 1, ['object']);

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

Stage.prototype.fill = function (options = {}, shadow = {}) {
    check(0, 1, ['object']);

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

function exists (arg) {
    return !(arg === undefined || arg === null);
}

function check (args, min = -1, max = Infinity, types = []) {
    if (args.length < min) {
        throw new Error(`You must have at least ${min} arguments! You only have ${args.length}`);
    } else if (args.length > max) {
        throw new Error(`You must have no more than ${max} arguments! You have ${args.length}`);
    }

    for (var arg in args) {
        if (!args.hasOwnProperty(arg)) {
            continue;
        }
        if (exists(types[arg])) {
            if (typeof args[arg] == types[arg]) {
                throw new Error(`Argument ${parseInt(arg) + 1} must be of type ${types[arg]}, not ${typeof args[arg]}!`);
            }
        }
    }
}

function validateObject (obj, defObj) {
    for (var prop in defObj) {
        if (defObj.hasOwnProperty(prop)) {
            if (!obj.hasOwnProperty(prop) || typeof(defObj[prop]) != typeof(obj[prop])) {
                obj[prop] = defObj[prop];
            }
        }
    }
    return obj;
}

function vecLength (vec) {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

function dist (a, b) {
    var dist = {
        x: Math.abs(a.x - b.x),
        y: Math.abs(a.y - b.y)
    };
    return vecLength(dist);
}

function normalize (vec) {
    var len = vecLength(vec);
    return {
        x: vec.x / len,
        y: vec.y / len
    };
}

function degToVec (deg) {
    return {
        x: Math.cos(deg),
        y: Math.sin(deg)
    };
}

function radToVec (rad) {
    return degToVec(radToDeg(rad));
}

function vecToRad (vec) {
    return Math.atan2(vec.y, vec.x);
}

function vecToDeg (vec) {
    return radToDeg(vecToRad(vec));
}
