/***

MochiKit.SVGCanvas 1.2

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.
(c) 2006 Jason Gallicchio.  All rights Reserved.

Why would you want this?
* Provides a nice way to build up an SVG without explicit DOM manipulations
    it's easier to write a my plotting software using this.
* SVG (with JavaScript) is a W3C standard, but canvas is not.
* When your browser supports SVG not canvas.
* When you have code written for canvas and you want to use it with SVG.
* When you want to save the result of canvas calls to an SVG file for 
    later display or printing at high-res.

When wouldn't you use this?
* When speed matters. With this, you just stack SVG shapes on top
      of each other forever.  Even you clear it, those others will still
      be around taking memory and rendering time. For most games and many
      others, you want to "blast it on the screen and forget it" model.
* Sometimes the simplest representation of a graphic is a program to draw it
      (e.g. fractals, function plotting)
* When you didn't care about the SVG DOM tree
* When your browser supports canvas but not SVG

Maybe this should auto-export its methods to the SVG object when included.
Convenient, but very confusing to users.

* Function to set the current object to insert into (like a <g>)
* Fix the problem with the stars and clock -- transforming while defining a path
  (maybe emit small path segments in a <g> whose properties get set once the fill or stroke is given.

***/

if (typeof(dojo) != 'undefined') {
    dojo.provide("MochiKit.SVGCanvas");
    dojo.require("MochiKit.SVG");
}
if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Iter", []);
}

try {
    if (typeof(MochiKit.SVG) == 'undefined') {
        throw "";
    }
} catch (e) {
    throw "MochiKit.SVGCanvas depends on MochiKit.SVG!";
}

if (typeof(MochiKit.SVGCanvas) == 'undefined') {
    MochiKit.SVGCanvas = function (widthOrIdOrNode, height, id, type) {
        if (typeof(this.__init__)=='undefined' || this.__init__ == null){
            log("You called SVGCanvas() as a fnuction without new.  Shame on you, but I'll give you a new object anyway");
            return new MochiKit.SVGCanvas(widthOrIdOrNode, height, id, type);
        }
        log("constructor got: ", widthOrIdOrNode, height, id, type); 
        this.__init__(widthOrIdOrNode, height, id, type);
    };
}

MochiKit.SVGCanvas.NAME = "MochiKit.SVGCanvas";
MochiKit.SVGCanvas.VERSION = "1.2";
MochiKit.SVGCanvas.__repr__ = function () {
    return "[" + MochiKit.SVGCanvas.NAME + " " + MochiKit.SVGCanvas.VERSION + "]";
};
MochiKit.SVGCanvas.prototype.__repr__ = MochiKit.SVGCanvas.__repr__;

MochiKit.SVGCanvas.toString = function () {
    return this.__repr__();
};
MochiKit.SVGCanvas.prototype.toString = MochiKit.SVGCanvas.toString;


MochiKit.SVGCanvas.EXPORT = [
    "SVGContext"
];

MochiKit.SVGCanvas.EXPORT_OK = [
];

/* Create a SVGCanvas object that acts just like a canvas context */

MochiKit.SVGCanvas.prototype.__init__ = function (widthOrIdOrNode /*=100*/, height /*=100*/, id /*optional*/, type /*optional*/) {
    /***
        Can pass it in an SVG object, or can pass it things that the SVG constructor uses.
    ***/
    if (typeof(widthOrIdOrNode) == 'object' && widthOrIdOrNode.constructor == MochiKit.SVG)
        this.svg = widthOrIdOrNode;
    else {
        this.svg = new SVG(widthOrIdOrNode, height, id, type)
    }
    
    log("this.svg is: " + this.svg);
    this._defaultState =   {'fillStyle': "#000000",  // Can be: "#RRGGBB", rgba(r, g, b, alpha) (0-255), or from a gradient
                            'strokeStyle': "#000000", // Same as above
                            'globalAlpha': 1.0, // Float between 0.0 and 1.0
                            'globalCompositeOperation': "source-over", // How canvas is displayed relative to background NOT SUPPORTED
                            'lineCap': "butt", // also "round" and "square"
                            'lineJoin': "miter", // also "round" and "bevel"
                            'lineWidth': 1.0, // surrounds the center of the path, with half of the total width on either side in units of the user space
                            'miterLimit': null, // The canvas divides the length of the miter by the line width. If the result is greater than the miter limit, the style is converted to a bevel.
                            'shadowBlur': 0, // width, in coordinate space units, that a shadow should cover. Never negative. 
                            'shadowColor': null, // color the canvas applies when displaying a shadow (same as two color methods above)
                            'shadowOffsetX': 0, // distance, in coordinate space units, that a shadow should be offset horizontally
                            'shadowOffsetY': 0, // distance, in coordinate space units, that a shadow should be offset vertically
                            'transformations': "" /*" translate(.5,.5) "*/ };  // Because canvas pixels are centered. Maybe this should all be in a <g>
    
    this._stateStack = []; // A state stack
    this._pathString = "";
    this._setState(this, this._defaultState);
}

// Helper methods:

MochiKit.SVGCanvas.prototype._setState = function(dest, src) {
    var stateKeys = keys(this._defaultState)
    for (var i=0; i<stateKeys.length; i++) {
        dest[stateKeys[i]] = src[stateKeys[i]];
    }
}

MochiKit.SVGCanvas.prototype._emitPath = function () {
    var path = this.svg.PATH({'d':this._pathString});
    this._setTransformAttribute(path);
    return path;
}

MochiKit.SVGCanvas.prototype._addPathSegment = function(path, ex, ey) {
}

MochiKit.SVGCanvas.prototype._setStrokeAttributes = function (node) {
    if (typeof(this.strokeStyle) == 'string') {
        var c = Color.fromString(this.strokeStyle);
        setNodeAttribute(node, 'stroke', c.toHexString());
        setNodeAttribute(node, 'stroke-opacity', c.asRGB()['a']*this.globalAlpha);
    }
    else if ( this.strokeStyle.constructor == MochiKit.SVGCanvas.LinearGradient || 
              this.strokeStyle.constructor == MochiKit.SVGCanvas.RadialGradient ) {
        log("Trying to stroke with gradient id=", this.strokeStyle.id);
        this.strokeStyle.applyGradient();
        setNodeAttribute(node, 'stroke', 'url(#'+ this.strokeStyle.id +')');
        setNodeAttribute(node, 'stroke-opacity', this.globalAlpha);
    }
    else if ( this.strokeStyle.constructor == MochiKit.SVGCanvas.Pattern ) {
        log("Trying to stroke with pattern id=", this.strokeStyle.id);
        setNodeAttribute(node, 'stroke', 'url(#'+ this.strokeStyle.id +')');
        setNodeAttribute(node, 'stroke-opacity', this.globalAlpha);
    }
    
    setNodeAttribute(node, 'stroke-width', this.lineWidth);
    setNodeAttribute(node, 'stroke-linejoin', this.lineJoin);
    if (this.miterLimit != null)
        setNodeAttribute(node, 'stroke-miterlimit', this.miterLimit);
    setNodeAttribute(node, 'stroke-linecap', this.lineCap);
    setNodeAttribute(node, 'fill', 'none');
    setNodeAttribute(node, 'fill-opacity', 0);
}

MochiKit.SVGCanvas.prototype._setFillAttributes = function (node) {
    if (typeof(this.fillStyle) == 'string') {
        var c = Color.fromString(this.fillStyle);
        setNodeAttribute(node, 'fill', c.toHexString());
        setNodeAttribute(node, 'fill-opacity', c.asRGB()['a']*this.globalAlpha);
    }
    else if ( this.fillStyle.constructor == MochiKit.SVGCanvas.LinearGradient || 
              this.fillStyle.constructor == MochiKit.SVGCanvas.RadialGradient ) {
        log("Trying to fill with gradient id=", this.fillStyle.id);
        this.fillStyle.applyGradient();
        setNodeAttribute(node, 'fill', 'url(#'+ this.fillStyle.id +')');
        setNodeAttribute(node, 'fill-opacity', this.globalAlpha);
    }
    else if ( this.fillStyle.constructor == MochiKit.SVGCanvas.Pattern ) {
        log("Trying to fill with pattern id=", this.fillStyle.id);
        setNodeAttribute(node, 'fill', 'url(#'+ this.fillStyle.id +')');
        setNodeAttribute(node, 'fill-opacity', this.globalAlpha);
    }
    setNodeAttribute(node, 'stroke', 'none');
    setNodeAttribute(node, 'stroke-opacity', 0);
    setNodeAttribute(node, 'fill-rule', 'nonzero');
}
    
MochiKit.SVGCanvas.prototype._setTransformAttribute = function (node) {
    if (this.transformations != "") {
        setNodeAttribute(node, 'transform', this.transformations);
    }
}

//Canvas State Methods

MochiKit.SVGCanvas.prototype.save = function() {
    var currentState = {};
    this._setState(currentState, this);
    this._stateStack.push(currentState);
}
MochiKit.SVGCanvas.prototype.restore = function() {
    var prevState = this._stateStack.pop();
    this._setState(this, prevState);
}

/*
    NOT IMPLIMENTED:
    For now, you cannot rotate while you're in the middle of drawing a path, as in the stars example.
    The cumulated rotations get applied to a single path -- not the right way to behave.
    Not easy to fix without transforming all of the path coordinates explicitly because
    there's no easy way to anticipate if the end result will be a fill or a stroke, so you can't just emit small paths.
*/
MochiKit.SVGCanvas.prototype.rotate = function(angle) {
    if (this._pathString != "") {
        log("rotate inside of a path string.");
        // Begin a new group and start inserting into that (should transformations go in the group?)
        // Emit the path into the new group and reset _pathString
    }
    this.transformations += "rotate(" + angle * 180.0 / Math.PI + ")";
}
MochiKit.SVGCanvas.prototype.scale = function(sx, sy) {
    if (this._pathString != "") {
        log("scale inside of a path string.");
    }
    this.transformations += "scale(" + sx +"," + sy + ")";
}
MochiKit.SVGCanvas.prototype.translate = function(tx, ty) {
    if (this._pathString != "") {
        log("translate inside of a path string.");
    }
    this.transformations += "translate(" + tx +"," + ty + ")";
}

// Working With Paths

    
MochiKit.SVGCanvas.prototype.beginPath = function() {
    /* Note: The current path is not part of the graphics state. 
       Consequently, saving and restoring the graphics state has 
       no effect on the current path. */
    this._pathString = "";
}
    
MochiKit.SVGCanvas.prototype.closePath = function() {
    this._pathString += " Z";
}
    
MochiKit.SVGCanvas.prototype.moveTo = function(x, y) {
    var newPath = " M " + x + "," + y;;
    log("Move path.d = ", newPath);
    this._pathString += newPath;
    this._lastx = x;
    this._lasty = y;
}
    
MochiKit.SVGCanvas.prototype.lineTo = function(x, y) {
    this._pathString += " L " + x + "," + y;
    this._lastx = x;
    this._lasty = y;
}
    
MochiKit.SVGCanvas.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
    this._pathString += " Q " + cpx + "," + cpy + " " + x + "," + y;
    this._lastx = x;
    this._lasty = y;
}
MochiKit.SVGCanvas.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
    this._pathString += " C " + cp1x + "," + cp1y + " " + cp2x + "," + cp2y + " " + x + "," + y;
    this._lastx = x;
    this._lasty = y;
}
MochiKit.SVGCanvas.prototype.arcTo = function (x1, y1, x2, y2, radius) {
    /*
     This method draws an arc that is tangent to the line from the 
     current point to (x1, y1) and to the line from (x1, y1) to (x2, y2). 
     The start and end points of the arc are located on the first and second 
     tangent lines, respectively. The start and end points of the arc are 
     also the “tangent points” of the lines.
     If the current point and the first tangent point of the arc 
     (the starting point) are not equal, the canvas appends a straight 
     line segment from the current point to the first tangent point. 
     After adding the arc, the current point is reset to the endpoint 
     of the arc (the second tangent point). 
    */
    var t1x, t1y, t2x, t2y; // Tangent points 1 and 2
    var x0 = this._lastx
    var y0 = this._lasty;
    // First tangent point
    var ax = x0-x1;
    var ay = y0-y1;
    var a = Math.sqrt(ax*ax+ay*ay);
    // Second tangent point
    var bx = x2-x1;
    var by = y2-y1;
    var b = Math.sqrt(bx*bx+by*by);
    var dot = ax*bx + ay*by;
    var ab = a*b;
    var s = Math.sqrt(2*ab/(ab + dot) - 1);  // The result of some calculations.
    
    t1x = x1 + s*ax/a;
    t1y = y1 + s*ay/a;
    t2x = x1 + s*bx/b;
    t2y = y1 + s*by/b;

    this.lineTo(tp1x, tp1y);  // The path may already be close enough.
    this._pathString += " A " + radius + "," + radius + " 0 0,1 " + t2x + "," + t2y;
    this._lastx = x;
    this._lasty = y;
}


MochiKit.SVGCanvas.prototype._normalizeAngle = function (radians) {
    /***
    Convert an arbitrary angle in radians to one between zero and 2 PI.
    If it's 2 PI, it will stay 2 PI because the arc methods thinks that's okay.
    ***/
    var twoPI = 2.0 * Math.PI;
    if (radians>0)
        return radians - twoPI * Math.floor(radians/twoPI);
    else
        return radians + twoPI * (1.0 + Math.ceil(radians/twoPI));
}


MochiKit.SVGCanvas.prototype.arc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
    /*
    adds an arc to the current path. The arc is given by the circle that 
    has its origin at (x, y) and that has radius radius. The points at 
    startAngle and endAngle along the circle, measured in radians clockwise 
    from the positive x-axis, are the start and end points. The arc is the 
    path along the circumference of the circle from the start point to the 
    end point going anti-clockwise if the anticlockwise argument is true, 
    and clockwise otherwise.
    The start point is added to the list of points of the subpath and 
    the current position is joined to that point by a straight line. 
    Then, the end point is added to the list of points and these last 
    two points are joined by the arc described above. Finally, the 
    current position is set to the end point. 
    
    On the SVG side, see http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
    */
    log("arc: ", x, y, radius, startAngle*180/Math.PI, endAngle*180/Math.PI, anticlockwise);
    var da = endAngle-startAngle;
    if ( Math.abs(da) >= 2.0 * Math.PI ) {
        // Full Circle
        this.moveTo(x-radius, y);
        this._pathString += " A " + radius + "," + radius + " 0 1,0 " + (x+radius) + "," + y;
        this._pathString += " A " + radius + "," + radius + " 0 1,0 " + (x-radius) + "," + y;
    }
    else {
        da = this._normalizeAngle(da);
        startAngle = this._normalizeAngle(startAngle);
        endAngle = this._normalizeAngle(endAngle);
        /*
        if ( (anticlockwise && -da > Math.PI) || (!anticlockwise && da > Math.PI)) {
            log("  angle too big:", (endAngle-startAngle)*180/Math.PI );
            this.arc(x, y, radius, startAngle, startAngle+Math.PI, anticlockwise);
            this.arc(x, y, radius, startAngle+Math.PI, endAngle, anticlockwise);
            return;
        }
        */
        var sx = x + radius*Math.cos(startAngle);
        var sy = y + radius*Math.sin(startAngle);
        var ex = x + radius*Math.cos(endAngle);
        var ey = y + radius*Math.sin(endAngle);
        var sa = startAngle * 180 / Math.PI;
        var ea = endAngle * 180 / Math.PI;
        var da = da * 180 / Math.PI;
        
        var largeArc = ((da<180 && !anticlockwise) || (da>180 && anticlockwise)) ? '0' : '1';
        var sweep = anticlockwise ? '0' : '1';
        this.moveTo(sx, sy);
        /*
        if ( this._pathString == "" ) {
            this.moveTo(sx, sy);
        }
        else {
            this.lineTo(sx, sy);  // The path may already be close enough.
        }
        */
        var newPath = " A " + radius + "," + radius + " 0 " +  largeArc + "," + sweep + " " + ex + "," + ey;
        log("Arcing path.d = ", newPath);
        this._pathString += newPath;
    }
    this._lastx = ex;
    this._lasty = ey;
}
MochiKit.SVGCanvas.prototype.rect = function (x, y, w, h) {
    log("RECT ", x, y, w, h);
    this._pathString += " M " + x + "," + y;
    this._pathString += " L " + (x+w) + "," + y;
    this._pathString += " L " + (x+w) + "," + (y+w);
    this._pathString += " L " + x + "," + (y+w);
    this._pathString += " L " + x + "," + y;
    log("this._pathString = ", this._pathString);
    this._lastx = x;
    this._lasty = y;
}
    
MochiKit.SVGCanvas.prototype.clip = function () {
    /***
        NOT IMPLIMENTED
    ***/
    this._pathString = "";
}
    

    //Stroking a Path

MochiKit.SVGCanvas.prototype.stroke = function () {
    var path = this._emitPath();
    this._setStrokeAttributes(path);
    this.svg.append(path);
}
MochiKit.SVGCanvas.prototype.strokeRect = function (x, y, w, h) {
    var rect = this.svg.RECT({'x':x,
                              'y':y,
                              'width':w,
                              'height':h});
    this._setTransformAttribute(rect);
    this._setStrokeAttributes(rect);
    this.svg.append(rect);
}

//Filling an Area

MochiKit.SVGCanvas.prototype.fill = function () {
    var path = this._emitPath();
    this._setFillAttributes(path);
    this.svg.append(path);
}
MochiKit.SVGCanvas.prototype.clearRect = function (x, y, w, h) {
    var rect = this.svg.RECT({'x':x,
                              'y':y,
                              'width':w,
                              'height':h,
                              'fill':'white',
                              'fill-opacity':1.0,
                              'fill-rule':'nonzero'});
    this._setTransformAttribute(rect);
    this.svg.append(rect);
}
MochiKit.SVGCanvas.prototype.fillRect = function (x, y, w, h) {
    var rect = this.svg.RECT({'x':x,
                              'y':y,
                              'width':w,
                              'height':h});
    this._setTransformAttribute(rect);
    this._setFillAttributes(rect);
    this.svg.append(rect);
}

// Creating Gradient and Pattern Styles

MochiKit.SVGCanvas.Gradient = function(self, svg) {
    /***
        Common constructor for both LinearGradient and RadialGradient
    ***/
    self.svg = svg;
    self.need0 = true;  // Do we still need to explicity add a stop at zero?
    self.need1 = true;
    log('  id=', self.id);
    self.defs = svg.getDefs(true);
}

MochiKit.SVGCanvas.LinearGradient = function(svg, x0, y0, x1, y1) {
    log('LinearGradient:', svg, x0, y0, x1, y1);
    this.id = svg.createUniqueID('linearGradient');
    MochiKit.SVGCanvas.Gradient(this, svg);
    this.gradientElement = svg.LINEARGRADIENT({'x1':x0, 'y1':y0, 'x2':x1, 'y2':y1, 'id':this.id, 'gradientUnits':'userSpaceOnUse'});
    log("Created gradientElement=", this.gradientElement);
    log("Going to append gradient id=", this.id, " to defs=", this.defs);
    appendChildNodes(this.defs, this.gradientElement);
}

MochiKit.SVGCanvas.LinearGradient.prototype.addColorStop = function(offset, color) {
    log("addColorStop: ", offset, color);
    if (offset==0) {
        this.need0 = false;
    }
    else if (offset==1) {
        this.need1 = false;
    }
    var c = Color.fromString(color);
    log('stop-color', c.toHexString(), 'stop-opacity', c.asRGB()['a']);
    var stop = this.svg.STOP({'offset':offset, 
                              'stop-color':c.toHexString(), 
                              'stop-opacity':c.asRGB()['a']});
    appendChildNodes(this.gradientElement, stop);
}

MochiKit.SVGCanvas.LinearGradient.prototype.applyGradient = function() {
    if (this.need0)
        this.addColorStop(0, "rgba(0,0,0,0)");
    if (this.need1)
        this.addColorStop(1, "rgba(0,0,0,0)");
}

MochiKit.SVGCanvas.RadialGradient = function(svg, x0, y0, r0, x1, y1, r1) {
    log('RadialGradient:', svg, x0, y0, x1, y1);
    this.id = svg.createUniqueID('radialGradient');
    MochiKit.SVGCanvas.Gradient(this, svg)
    this.gradientElement = svg.RADIALGRADIENT( {'fx':x0, 'fy':y0, 'r':r1, 'cx':x1, 'cy':y1, 'id':this.id, 'gradientUnits':'userSpaceOnUse'} );
    this.ratio = r0/r1;
    log("Created gradientElement=", this.gradientElement);
    log("Going to append gradient id=", this.id, " to defs=", this.defs);
    appendChildNodes(this.defs, this.gradientElement);
}

MochiKit.SVGCanvas.RadialGradient.prototype.addLinearColorStop = MochiKit.SVGCanvas.LinearGradient.prototype.addColorStop;
MochiKit.SVGCanvas.RadialGradient.prototype.addColorStop = function(offset, color) {
    var svgOffset = offset*(1-this.ratio) + this.ratio;
    this.addLinearColorStop(svgOffset, color);
}
MochiKit.SVGCanvas.RadialGradient.prototype.applyGradient = MochiKit.SVGCanvas.LinearGradient.prototype.applyGradient;

MochiKit.SVGCanvas.prototype.createLinearGradient = function (x0, y0, x1, y1) {
    return new MochiKit.SVGCanvas.LinearGradient(this.svg, x0, y0, x1, y1)
}
MochiKit.SVGCanvas.prototype.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {
    return new MochiKit.SVGCanvas.RadialGradient(this.svg, x0, y0, r0, x1, y1, r1);
}

MochiKit.SVGCanvas.Pattern = function(svg, image, repetition) {
    /***
        Firefox doesn't seem to support patterns from images.
    ***/
    this.svg = svg;
    this.id = svg.createUniqueID('pattern');
    log('  id=', this.id);
    this.defs = svg.getDefs(true);
    
    this.pattern = this.svg.PATTERN({'patternUnits':'userSpaceOnUse',
                                     'patternContentUnits':'userSpaceOnUse',
                                     'width':image.width,
                                     'height':image.height,
                                     'id':this.id});
    log("  pattern: ", this.pattern);
    appendChildNodes(this.defs, this.pattern);
    this.image = image;
    log("  img: ", image.width, image.height, image.src);
    var img = this.svg.IMAGE({'x':0, 
                              'y':0, 
                              'width':image.width,
                              'height':image.height,
                              'xlink:href':image.src});
    appendChildNodes(this.pattern, img);
    //'repeat', 'repeat-x', 'repeat-y', 'no-repeat'
}

MochiKit.SVGCanvas.prototype.createPattern = function (image, repetition) {
    /***
        @param image : Can either be an image element or another canvas.
    ***/
    return new MochiKit.SVGCanvas.Pattern(this.svg, image, repetition);
}


// Drawing an Image

/*
this.drawImage(image, dx, dy) {}
this.drawImage(image, dx, dy, dw, dh) {}
this.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {}
this.drawImage(image, dx, dy) {}
this.drawImage(image, dx, dy, dw, dh) {}
*/
MochiKit.SVGCanvas.prototype.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
    log("drawImage(", image, sx, sy, sw, sh, dx, dy, dw, dh, ")");
    log("  img: ", image.width, image.height, image.src);
    var x = sx;
    var y = sy;
    var width = (typeof(sw)=='undefined' || sw == null) ? image.width : sw;
    var height = (typeof(sw)=='undefined' || sw == null) ? image.width : sh;
    var viewBox = null;
    if (typeof(dh)!='undefined' && dh != null) {
        viewBox = sx + " " + sy + " " + sw + " " + sh;
        x = dx;
        y = dy;
        width = dw;
        height = dh;
    }
    var img = this.svg.IMAGE({'x':x, 
                              'y':y, 
                              'width':width,
                              'height':height,
                              'xlink:href':image.src,
                              'viewBox':viewBox});
    this._setTransformAttribute(img);
    this.svg.append(img);
}

// drawImageFromRect

MochiKit.SVGCanvas.__new__ = function (win) {

    var m = MochiKit.Base;

    //this.$ = this.getElement;

    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": m.concat(this.EXPORT, this.EXPORT_OK)
    };

    m.nameFunctions(this);
};

MochiKit.SVGCanvas.__new__(this);

MochiKit.Base._exportSymbols(this, MochiKit.SVGCanvas);

SVGCanvas = MochiKit.SVGCanvas;