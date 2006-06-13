/***

SVGCanvas 0.1

See <http://svgkit.com/> for documentation, downloads, license, etc.

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

TODO:
* Add other compositing modes, prhaps by calling some getBoundingPath and creating a new <mask>
  <mask id="Mask" maskUnits="userSpaceOnUse"
          x="0" y="0" width="800" height="300">
      <rect x="0" y="0" width="800" height="300" fill="url(#Gradient)"  />
  </mask>
  <text id="Text" x="400" y="200" font-size="100" fill="blue" mask="url(#Mask)" />
* linearGradient doesn't work in inline mode. Namespace?
* repetition parameter on patterns: 'repeat', 'repeat-x', 'repeat-y', 'no-repeat'
* shadows: rendered from image A, using the current shadow styles, creating image B.
* arcTo doesn't work here or in Mozilla.

Writing the SVG:* Patters and gradients and other global <defs> that can be used at any time also
    get written uppon creation, but in the <defs> so they don't get drawn.
* Test by issuing commands in a random order and make sure you get the same result for Canvas and SVG.
* Graphics only get written to the SVG when you do a fill(), stroke() or clip() 
    or things like fillRect() that call one of these.
* This means that changing things like fillStyle just replace the current fillStyle.
    - These things only get looked at when you do a fill(), so if you issue a bunch of 
    path commands interspersed with setting fillStyle, only the final value when you
    call fill() will matter.
    - You can also issue multiple fills with the same style, in which case it might be 
    efficient to put all of the objects thus created in a single group that has those properties,
    but when you issue the first fill(), you don't know if there will be others with the same styling or not.
    - Of course you can do a stack-based save(), you can do a restore() on these things.
* Transformations are cumulative when you're writing a path rather than replacing like fillStyle
   This can get handled in three ways:
    - We can keep a current transformation matrix as a JavaScript array 
      and apply it explicitly to every number inside of a path's d="" attribute.
      Doing a restore() restores the last JavaScript matrix.
      Disadvantage: Numbers in d are long decimals, not reflective of the commands you issued.
    - We can apply the cumulated transformation to each bit of path as a long string:
      <g fill="red">
          <path d="" transform=transform="translate(0.5, 0.5)"/>
          <path d="" transform=transform="translate(0.5, 0.5) translate(45, 45)"/>
          <path d="" transform=transform="translate(0.5, 0.5) translate(45, 45) translate(85, 85)"/>
      </g>
      A restore() gets you back the previous long transformation string.
      Disadvantage:   It's not consistent with the Canvas API.  Can lineTo, transform, lineTo, fill.
        Until you do a restore(), these strings get longer and longer and
        must be computed redundantly for each path rendered.  Still have to group.
    - We can start a new group every time there is a transformation with just
      that additional transform.  Doing a restore() means you go back to adding elements 
      to the group you were in when you did a save.
      Advantage: Every bit of information is written only once and it's exactly the parameters
      you passed.  This includes color information -- only the differences get written
      when you do a fill and then a new group is started.
      Disadvantage: It's not consistent with the Canvas API.  Can lineTo, transform, lineTo, fill.
         also, clock example looks extremely nested:
      <g fill="red">
        <path/>
        <g transform="rotate()">
          <path/>
          <g transform="rotate()">
            <path/>
            <g transform="rotate()" fill="green">
              ...
          </g>
        </g>
      </g>
      Disadvantage: Set style and then write path. This just includes current style information
        Then you keep the same style but write another path.  It should really create a group,
        move the first path into it, then add the second path.  DOM manipulations are slow, for
        the alternative is to have all properties set in groups, so for every path you get a new group
        even if there's only one.  I guess it's created once and rendered many times, so some slow
        manipulations are okay to make the SVG tighter.
      Disadvantage: Changing to drawing in a different high-level group, you lose all of your
        transform information.  Maybe that's just what you have to live with.  When you go to a new
        high-level group you probably want to start drawing in the userCoordinates of that group anyway.
        
        topLevelGroup  // Not included in stack.  When this changes, if stack is not empty it is a warning: save() restore() imbalance.
        groupAtLastGrphics
        styleAtLastGrphics
        singletonPath   // null if we're in a group with two paths already
        singletonStyleDifferences  // The style of the singleton that we'll have to apply to the group
        currentGroup
        currentStyle

        fillStyle=one
        lineTo
        fill   // creates <path style="one">
        lineTo
        fill  // if there have been no style changes and no transform changes this should be added to d=""
        fillStyle=two
        lineTo 
        fill  // should make <g style="one"> <path/> <path style="two"/> </g>
        fillRect // should make <g style="one"> <path/> <g style="two"> <path/> <rect/> </g> </g>
        
    * SVG Specific: Add SVG element to the current group:
        append( CIRCLE({'r':12})
***/

if (typeof(dojo) != 'undefined') {
    dojo.provide("SVGCanvas");
    dojo.require("SVGKit");
}
if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Iter", []);
}

try {
    if (typeof(SVGKit) == 'undefined') {
        throw "";
    }
} catch (e) {
    throw "SVGCanvas depends on SVGKit!";
}

if (typeof(SVGCanvas) == 'undefined') {
    SVGCanvas = function (widthOrIdOrNode, height, id /* optional */) {
        if (arguments.length==0) {
            //log('Called SVGCanvas constructor with no arguments.');
            return;
        }
        if (typeof(this.__init__)=='undefined' || this.__init__ == null){
            //log("You called SVGCanvas() as a fnuction without new.  Shame on you, but I'll give you a new object anyway");
            return new SVGCanvas(widthOrIdOrNode, height, id, type);
        }
        //log("constructor got: ", widthOrIdOrNode, height, id);
        this.__init__(widthOrIdOrNode, height, id);
        return null;
    };
}

SVGCanvas.NAME = "SVGCanvas";
SVGCanvas.VERSION = "1.2";
SVGCanvas.__repr__ = function () {
    return "[" + SVGCanvas.NAME + " " + SVGCanvas.VERSION + "]";
};
SVGCanvas.prototype.__repr__ = SVGCanvas.__repr__;

SVGCanvas.toString = function () {
    return this.__repr__();
};
SVGCanvas.prototype.toString = SVGCanvas.toString;


SVGCanvas.EXPORT = [
    "SVGContext"
];

SVGCanvas.EXPORT_OK = [
];


SVGCanvas.startingState = 
    { 'fillStyle': "#000000",  // Can be: "#RRGGBB", "rgba(r, g, b, alpha)" where rgb in (0-255), or from a gradient
      'strokeStyle': "#000000", // Same as above.  Affects SVG's 'stroke', 'stroke-opacity', gradient and marker
      'globalAlpha': 1.0, // Float between 0.0 and 1.0
      'globalCompositeOperation': 'source-over', // How canvas is displayed relative to background NOT SUPPORTED
      'lineCap': "butt", // also "round" and "square"
      'lineJoin': "miter", // also "round" and "bevel"
      'lineWidth': 1.0, // surrounds the center of the path, with half of the total width on either side in units of the user space
      'miterLimit': null, // The canvas divides the length of the miter by the line width. If the result is greater than the miter limit, the style is converted to a bevel.
      'shadowBlur': 0, // width, in coordinate space units, that a shadow should cover. Never negative. 
      'shadowColor': null, // color the canvas applies when displaying a shadow (same as two color methods above)
      'shadowOffsetX': 0, // distance, in coordinate space units, that a shadow should be offset horizontally
      'shadowOffsetY': 0, // distance, in coordinate space units, that a shadow should be offset vertically
      // SVG Only extensions:
      'dasharray' : null,  // a string list "1,2" to make strokes dashed
      'dashoffset' : null, // a number like 3 which specifies how to start the dashing
      'markerStart' : null,  // marker group object
      'markerMid' : null,
      'markerEnd' : null,
      // 'font' : null, // SVG's font, which is shorthand for all of the below:
      'fontFamily' : null,  // SVG's font-family="Verdana" 
      'fontSize' : null,    // SVG's font-size="45"
      'fontWeight' : null,  // SVG's font-weight= 	normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | inherit
      'fontStyle' : null,    // SVG's font-style = normal | italic | oblique |  inherit
      'fontVariant' : null,    // SVG's font-variant= normal | small-caps |  inherit
      'fontStretch' : null,  // SVT's font-stretch = normal | wider | narrower | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded | inherit
      'textAnchor' : null, // 'text-anchor' start | middle | end | inherit (defaults to start.  null implicitly means inherit
      
      'applyStyles' : true,  // Apply all of these styles to a given SVG element or let them be inherited.
      
      // Internal State (not copied when you do getStyle or setStyle):
      'currentTransformationMatrix': null,  // Only gets uses for transformation inside of path.
      'transformations' : "",  // Applys to all subpaths.
      'drawGroup' : null, // When you start, there is no clipping and you're not in a marker.
      'currentGroup' : null
    };  // if this is changed, you also have to change the drawGroup


/* Create a SVGCanvas object that acts just like a canvas context */
SVGCanvas.prototype.__init__ = function (widthOrIdOrNode /*=100*/, height /*=100*/, id /*optional*/) {
    /***
        You can pass it in an SVG object to draw on,
        or can pass it anything that the SVG constructor uses.
    ***/
    var isSVG = typeof(widthOrIdOrNode) == 'object' && widthOrIdOrNode.constructor == SVGKit;
    this.svg = isSVG ? widthOrIdOrNode : new SVGKit(widthOrIdOrNode, height, id);
    //log("Working with svg: ", this.svg, " this: ", this);
    this.svg.whenReady( bind(this.reset, this, null) );
}

SVGCanvas.prototype.reset = function(startingGroup /*=_startingGroup or svg.svgElement*/) {
    /***
        SVG ONLY used by the constructor, but can also be called to reset the state
        to have black fills and no transformations.  If this is done, it should be
        come between a save() and restore().
        This can be used to set the drawingGroup if you happen to also want to reset.
    ***/
    
    if (typeof(startingGroup) == 'undefined' || startingGroup==null)
        this._startingGroup = startingGroup;
    if (typeof(this._startingGroup) == 'undefined' || this._startingGroup==null)
        startingGroup = this.svg.svgElement;
    this._startingGroup = startingGroup;  // Set it so next time we can just call reset()
    this.setState(SVGCanvas.startingState);
    this.setGroup(startingGroup);
    
    // If we don't already have a state stack for save() and restore(), create one.
    if (typeof(this._stateStack)=='undefined' || this._stateStack==null)
        this._stateStack = [];
    // Canvas spec says that on initialization, begin path is called.
    this.beginPath();  // clears _subpaths, and calls and calls moveTo(0,0)
}

SVGCanvas.prototype.setGroup = function(group) {
    /***
        SVG ONLY
        should probably come between a save() and restore().
    ***/
    this.drawGroup = group;
    this.currentGroup = group;
    this.transformations = "";
    this.currentTransformationMatrix = null;
}

SVGCanvas.prototype._copyState = function(dest, src, just_style /*=false*/) {
    /***
        All of the drawing state (like strokeStyle) are members of
        the SVGCanvas object, but not all members are state members,
        so it goes through the keys in the startingState and copies
        just those items from src to dest.
        Either parameter can be the SVGCanvas object itself.
        If just_style is true, only style information (as opposed to
        transform and group information) is copied
    ***/
    if (typeof(just_style) == 'undefined' || just_style==null)
        just_style = false;
    var stateKeys = keys(SVGCanvas.startingState)
    for (var i=0; i<stateKeys.length; i++) {
        if (just_style==false || just_style==true && 
                stateKeys[i] != 'currentTransformationMatrix' &&
                stateKeys[i] != 'transformations' &&
                stateKeys[i] != 'drawGroup' &&
                stateKeys[i] != 'currentGroup') {
            dest[stateKeys[i]] = src[stateKeys[i]];
        }
    }
}

SVGCanvas.prototype.setState = function(state) {
    /***
        SVG ONLY
        Overwrites the current state,
        including the drawGroup and currentGroup
    ***/
    this._copyState(this, state);
}

SVGCanvas.prototype.getState = function() {
    /***
        SVG ONLY
        Copies and returns the current state, 
        including the drawGroup and currentGroup
    ***/
    var state = {};
    this._copyState(state, this);
    return state;
}

SVGCanvas.prototype.setStyle = function(style) {
    /***
        SVG ONLY
        Overwrites the style attributes of the current state.
    ***/
    this._copyState(this, style, true);
}

SVGCanvas.prototype.getStyle = function() {
    /***
        SVG ONLY
        Copies and returns the style attributes of the current state.
    ***/
    var style = {};
    this._copyState(style, this, true);
    return style;
}

//Canvas State Methods

SVGCanvas.prototype.save = function() {
    /***
        pushes a copy of the current drawing state onto the drawing 
        state stack.
    ***/
    var currentState = {};
    this._copyState(currentState, this);
    this._stateStack.push(currentState);
}
SVGCanvas.prototype.restore = function() {
    /***
        pops the top entry in the drawing state stack, and resets the 
        drawing state it describes. If there is no saved state, 
        the method does nothing.
    ***/
    if (this._stateStack.length>0) {
        var prevState = this._stateStack.pop();
        this._copyState(this, prevState);
    }
}

SVGCanvas.prototype._hasOnlyMoveZero = function() {
    /***
        returns true if there is either no subpath or one that
        only includes a move to 0,0.
    ***/
    return this._subpaths[this._subpaths.length-1] == '' || 
            this._subpaths[this._subpaths.length-1] == ' M 0,0'
}

SVGCanvas.prototype.scale = function(sx, sy) {
    /***
        Add the scaling transformation described by the arguments to the 
        transformation matrix. The x argument represents the scale factor in 
        the horizontal direction and the y argument represents the scale 
        factor in the vertical direction. The factors are multiples.
        
        SVG implimentation:  If you haven't drawn anything yet, it will add a
        scale the transform attribute of the emitted shapes so that the 
        coordinates that get included in the SVG elements will be identical 
        to those you passed.
        If you've started a path already, you can't apply a global 
        transformation any more, so this builds up a transformation matrix that
        each future coordinate explicitly get multiplied by before inclusion
        in the SVG.
        To increase the speed of SVG rendering at the cost of nice SVG ouput,
        you could get rid of the transform attribute bit and always explicitly
        multiply coordinaets.
    ***/
    if (this._subpaths.length==1 && this._hasOnlyMoveZero())
        this.transformations += "scale(" + sx +"," + sy + ")";
    else{
        if (this.currentTransformationMatrix==null)
            this.currentTransformationMatrix = this.svg.svgElement.createSVGMatrix()
        this.currentTransformationMatrix = this.currentTransformationMatrix.scaleNonUniform(sx, sy);
    }
}
SVGCanvas.prototype.rotate = function(angle) {
    /***
        Add the rotation transformation described by the argument to the 
        transformation matrix. The angle argument represents a clockwise 
        rotation angle expressed in radians.
    ***/
    var deg = angle*180/Math.PI;
    if (this._subpaths.length==1 && this._hasOnlyMoveZero() )
        this.transformations += "rotate(" + deg + ")";
    else {
        if (this.currentTransformationMatrix==null)
            this.currentTransformationMatrix = this.svg.svgElement.createSVGMatrix()
        this.currentTransformationMatrix = this.currentTransformationMatrix.rotate(deg);
    }
}
SVGCanvas.prototype.translate = function(tx, ty) {
    /***
        dd the translation transformation described by the arguments 
        to the transformation matrix. The x argument represents the 
        translation distance in the horizontal direction and the y 
        argument represents the translation distance in the vertical 
        direction. The arguments are in coordinate space units.
    ***/
    if (this._subpaths.length==1 && this._hasOnlyMoveZero() )
        this.transformations += "translate(" + tx +"," + ty + ")";
    else {
        if (this.currentTransformationMatrix==null)
            this.currentTransformationMatrix = this.svg.svgElement.createSVGMatrix()
        this.currentTransformationMatrix = this.currentTransformationMatrix.translate(tx, ty);
    }
}

// Helper method
SVGCanvas.prototype._transformWithCTM = function(x,y) {
    /***
        When a transformation happens in the middle of a path, you 
        can no longer rely on SVG's transform attribute, so we
        explicitly build up a transform matrix and transform
        incomming points by it before adding it to the path.
        
        @return an SVGPoint with .x and .y members
    ***/
    var p = this.svg.svgElement.createSVGPoint()
    p.x = x
    p.y = y
    if (this.currentTransformationMatrix == null)
        return p;
    else {
        if (this.currentTransformationMatrix==null)
            this.currentTransformationMatrix == this.svg.svgElement.createSVGMatrix()
        return p.matrixTransform(this.currentTransformationMatrix);
    }
}

// Working With Paths

    
SVGCanvas.prototype.beginPath = function() {
    /***
        resets the list of subpaths to an empty list, and calls 
        moveTo() with the point (0,0). When the context is 
        created, a call to beginPath() is implied.
        
        Note: The current path is not part of the graphics state. 
        Consequently, saving and restoring the graphics state has 
        no effect on the current path. 
    ***/
    //log("in beginPath");
    this._subpaths = [""];
    this.moveTo(0,0);
}


SVGCanvas.prototype.hasDrawing = / M [\-0-9eE\.]+,[\-0-9eE\.]+ /;
/*
    a regular expression to determine if the current path has stuff in it
    as opposed to being empty.
*/

SVGCanvas.prototype._newSubPath = function(addToEnd) {
    /***
        If the current path includes anything, add it to the subpaths
        list and clear the current subpath.
        
        @param addToEnd a string that gets added to the end of the 
        subpath before it is added to the list.
    ***/
    if (this.hasDrawing.test(this._subpaths[this._subpaths.length-1])) {
        //log("_newSubPath: current sub path = ", this._subpaths[this._subpaths.length-1]), "  making new empty one";
        if (typeof(addToEnd) == 'string')
            this._subpaths[this._subpaths.length-1] += addToEnd;
        this._subpaths.push("");
    }
    else {
        //log("_newSubPath: didn't push it = ", this._subpaths[this._subpaths.length-1]);
    }
}

/*
Optimize path output: not repeating vector graphics commands 
(e.g. two consecutive lines could be specified as "L30 762L 40 563"
but would be output as "L30 762 40 563", removing the unnecessary 
repetition of the L command).
*/

SVGCanvas.prototype.moveTo = function(x, y) {
    /***
        method sets the current position to the given coordinate and creates 
        a new subpath with that point as its first (and only) point. If there 
        was a previous subpath, and it consists of just one point, then that 
        subpath is removed from the path.
        
        We don't error check or optimize.
    ***/
    //log("moveTo("+x+","+y+"): path = ", this._subpaths[this._subpaths.length-1]);
    //log("moveTo("+x+","+y+")");
    this._newSubPath();
    var p = this._transformWithCTM(x,y);
    this._subpaths[this._subpaths.length-1] = " M " + p.x + "," + p.y;  // This must pass the hasDrawing RegExp
    this._lastx = p.x;
    this._lasty = p.y;
}

SVGCanvas.prototype.closePath = function() {
    /***
        adds a straight line from the current position to the first point in 
        the last subpath and marks the subpath as closed, if the last subpath 
        isn't closed, and if it has more than one point in its list of points. 
        If the last subpath is not open or has only one point, it does nothing.
        SVG handles this. We don't error check or optimize.
    ***/
    //log("closePath(): path = ", this._subpaths[this._subpaths.length-1]);
    this._newSubPath(" Z");
}

    
SVGCanvas.prototype.lineTo = function(x, y) {
    /***
        adds the given coordinate (x, y) to the list of points of the subpath, 
        and connects the current position to that point with a straight line.
    ***/
    //log("lineTo("+x+","+y+"): path = ", this._subpaths[this._subpaths.length-1]);
    //log("lineTo("+x+","+y+")");
    if (this._subpaths[this._subpaths.length-1] == '') {
        //log("lineTo detected no current path. Calling moveTo instead ala Firefox");
        this.moveTo(x, y);
        return;
    }
    var p = this._transformWithCTM(x,y);
    this._subpaths[this._subpaths.length-1] += " L " + p.x + "," + p.y;
    this._lastx = p.x;
    this._lasty = p.y;
}
    
SVGCanvas.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
    /***
        adds the given coordinate (x, y) to the list of points of the subpath,
        and connects the current position to that point with a quadratic 
        curve with control point (cpx, cpy)
    ***/
    var cp = this._transformWithCTM(cpx,cpy);
    var p = this._transformWithCTM(x,y);
    this._subpaths[this._subpaths.length-1] += " Q " + cp.x + "," + cp.y + " " + p.x + "," + p.y;
    this._lastx = p.x;
    this._lasty = p.y;
}

SVGCanvas.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
    /***
        adds the given coordinate (x, y) to the list of points of the 
        subpath, and connects the two points with a bezier curve with 
        control points (cp1x, cp1y) and (cp2x, cp2y).
    ***/
    var cp1 = this._transformWithCTM(cp1x,cp1y);
    var cp2 = this._transformWithCTM(cp2x,cp2y);
    var p = this._transformWithCTM(x,y);
    this._subpaths[this._subpaths.length-1] += " C " + cp1.x + "," + cp1.y + " " + cp2.x + "," + cp2.y + " " + p.x + "," + p.y;
    this._lastx = p.x;
    this._lasty = p.y;
}

SVGCanvas.prototype.rect = function (x, y, w, h) {
    /***
        Does not start a new path.
        creates a new subpath containing just the rectangle with top left 
        coordinate (x, y), width w and height h, and marks it as closed. 
        It then calls moveTo with the point (0,0).
    ***/
    //log("RECT ", x, y, w, h);
    this.moveTo(x,y);
    this.lineTo(x+w,y);
    this.lineTo(x+w,y+w);
    this.lineTo(x,y+w);
    this.lineTo(x,y);
    this.moveTo(0,0);
}

SVGCanvas.prototype.arcTo = function (x1, y1, x2, y2, radius) {
    /*
     This method draws an arc that is tangent to the line from the 
     current point to (x1, y1) and to the line from (x1, y1) to (x2, y2). 
     The start and end points of the arc are located on the first and second 
     tangent lines, respectively. The start and end points of the arc are 
     also the �tangent points� of the lines.
     If the current point and the first tangent point of the arc 
     (the starting point) are not equal, the canvas appends a straight 
     line segment from the current point to the first tangent point. 
     After adding the arc, the current point is reset to the endpoint 
     of the arc (the second tangent point). 
    */
    /* Looks like Mozilla hasn't implimented it yet either. */
    return
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
    this._subpaths[this._subpaths.length-1] += " A " + radius + "," + radius + " 0 0,1 " + t2x + "," + t2y;
    this._lastx = x;
    this._lasty = y;
}


SVGCanvas.prototype._normalizeAngle = function (radians) {
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

SVGCanvas.prototype._distance = function (point1, point2) {
    var dx = point1.x - point2.x;
    var dy = point1.y - point2.y;
    return Math.sqrt(dx*dx+dy*dy);
}


SVGCanvas.prototype.arc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
    /***
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
    
    Modification:  Joined to a straight line if the current subpath has
    more than just a move to (0,0)
    
    On the SVG side, see http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
    ***/
    //log("arc: ", x, y, radius, startAngle*180/Math.PI, endAngle*180/Math.PI, anticlockwise);
    var da = endAngle-startAngle;
    if ( Math.abs(da) >= 2.0 * Math.PI ) {
        // Full Circle
        //log("Full Circle");
        this.arc(x, y, radius, 0, Math.PI, true);
        this.arc(x, y, radius, Math.PI, 0, true);
        //this.moveTo(x-radius, y);
        //this._subpaths[this._subpaths.length-1] += " A " + radius + "," + radius + " 0 1,0 " + (x+radius) + "," + y;
        //this._subpaths[this._subpaths.length-1] += " A " + radius + "," + radius + " 0 1,0 " + (x-radius) + "," + y;
    }
    else {
        da = this._normalizeAngle(da);
        startAngle = this._normalizeAngle(startAngle);
        endAngle = this._normalizeAngle(endAngle);
        /*
        if ( (anticlockwise && -da > Math.PI) || (!anticlockwise && da > Math.PI)) {
            //log("  angle too big:", (endAngle-startAngle)*180/Math.PI );
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
        var s = this._transformWithCTM(sx, sy);
        var e = this._transformWithCTM(ex, ey);
        var org = this._transformWithCTM(0, 0);
        // Can probably get angle directly from CTM's shear and rotation rather thnan through complicated steps that follow:
        var rx = this._transformWithCTM(radius, 0);
        var ry = this._transformWithCTM(0, radius);
        var radx = this._distance(org, rx);
        var rady = this._distance(org, ry);
        var angle = Math.acos( (rx.x - org.x) / radx ) * 180 / Math.PI;
        if (this._lastx != s.x && this._lasty != s.y) {
            if (!this._hasOnlyMoveZero())
                this.lineTo(sx, sy);
            else if (this._lastx != s.x && this._lasty != s.y)
                this.moveTo(sx,sy);
        }
        var newPath = " A " + radx + "," + rady + " " + angle + " " +  largeArc + "," + sweep + " " + e.x + "," + e.y;
        //log("Arcing path.d = ", newPath);
        this._subpaths[this._subpaths.length-1] += newPath;
        this._lastx = e.x;
        this._lasty = e.y;
    }
}

   
SVGCanvas.prototype._setShapeTransform = function(shape) {
    var m = this.currentTransformationMatrix;
    // Add the current transformation matrix to the transformation list only if it's not the identity matrix.
    var transform = m==null ?  '' : ' matrix('+m['a']+','+m['b']+','+m['c']+','+m['d']+','+m['e']+','+m['f']+')'
    if (transform  != '' || this.transformations != '')
        setNodeAttribute(shape, 'transform', this.transformations + transform);
}


SVGCanvas.prototype._setPathTransformAttribute = function (node) {
    if (this.transformations != "") {
        setNodeAttribute(node, 'transform', this.transformations);
    }
}

SVGCanvas.prototype._emitPaths = function () {
    /***
        Go through the subpath list and pick out only the ones that have drawing content
        
    ***/
    var pathcount = this._subpaths.length;
    var paths = [];
    var i;
    
    for (i=0; i<pathcount; i++) {
        //log("_emitPaths(): _subpaths.length =", pathcount, "current subpath["+i+"] =", this._subpaths[i]);
        if (this.hasDrawing.test(this._subpaths[i])) {
            var path = this.svg.PATH({'d':this._subpaths[i]});
            paths.push(path)
        }
    }
    if (paths.length == 0) {    
        //log("emitting null path");
        return null;
    }
    if (paths.length == 1) {
        // Construct a single path:  <path transform="blah">
        this._setPathTransformAttribute(paths[0])
        return paths[0];
    }
    else {
        // Construct a group:  <g transform="blah"> <path> <path> <path> </g>
        var group = this.svg.G(null);
        this._setPathTransformAttribute(group);
        for (i=0; i<paths.length; i++) {
            group.appendChild(paths[i]);
        }
        return group;
    }
}


    //Stroking a Path

SVGCanvas.prototype._setGraphicsAttributes = function(node, type) {
    /***
        type is 'stroke' or 'fill'  (not 'clip')
    ***/

    if (this.applyStyles==false)
        return;
    
    var style, other;
    if (type=='stroke') {
        style = this.strokeStyle;
        other = 'fill';
    }
    else if (type=='fill') {
        style = this.fillStyle;
        other = 'stroke';
    }
    //log('_setGraphicsAttributes(): type =', type, 'style = ', style, 'this.strokeStyle=', this.strokeStyle);
    
    if (typeof(style) == 'string') {      // like '#FF00FF' or 'rgba(200,200,100,0.5)'
        var c = Color.fromString(style);
        setNodeAttribute(node, type, c.toHexString());
        setNodeAttribute(node, type+'-opacity', c.asRGB()['a']*this.globalAlpha);
    }
    else if ( style.constructor == SVGCanvas.LinearGradient || 
               style.constructor == SVGCanvas.RadialGradient ) {
        //log("Trying to draw with gradient id=", style.id);
        style.applyGradient();
        setNodeAttribute(node, type, 'url(#'+ style.id +')');
        setNodeAttribute(node, type+'-opacity', this.globalAlpha);
    }
    else if ( style.constructor == SVGCanvas.Pattern ) {
        //log("Trying to stroke with pattern id=", style.id);
        setNodeAttribute(node, type, 'url(#'+ style.id +')');
        setNodeAttribute(node, type+'-opacity', this.globalAlpha);
    }
    
    setNodeAttribute(node, other, 'none');
    setNodeAttribute(node, other+'-opacity', 0);
    
    if (type=='fill') {
        setNodeAttribute(node, 'fill-rule', 'nonzero');
    }
    else if (type=='stroke') {
        setNodeAttribute(node, 'stroke-width', this.lineWidth);
        setNodeAttribute(node, 'stroke-linejoin', this.lineJoin);
        if (this.miterLimit != null)
            setNodeAttribute(node, 'stroke-miterlimit', this.miterLimit);
        setNodeAttribute(node, 'stroke-linecap', this.lineCap);
        // SVG Only:
        if (this.dasharray)
            setNodeAttribute(node, 'stroke-dasharray', this.dasharray);
        if (this.dashoffset != null)
            setNodeAttribute(node, 'stroke-dashoffset', this.dashoffset);
    }
    
    // SVG Only:  Markers
    if (this.markerStart != null)
        setNodeAttribute(node, 'marker-start', 'url(#'+this.markerStart+')')
    if (this.markerMid != null)
        setNodeAttribute(node, 'marker-start', 'url(#'+this.markerMid+')')
    if (this.markerEnd != null)
        setNodeAttribute(node, 'marker-start', 'url(#'+this.markerEnd+')')
}

SVGCanvas.prototype.stroke = function () {
    /***
        strokes each subpath of the current path in turn, using strokeStyle
        
        returns SVG ONLY svg path element
    ***/
    var paths = this._emitPaths();
    if (paths != null) {
        //log("stroke(): this.drawGroup=", this.drawGroup);
        this._setGraphicsAttributes(paths, 'stroke');
        this.drawGroup.appendChild(paths);
        //log("  in stroke(): finished appending child nodes");
    }
    return paths;
}

SVGCanvas.prototype.fill = function () {
    /***
        fills each subpath of the current path in turn, using fillStyle, 
        and using the non-zero winding number rule. Open subpaths are implicitly 
        closed when being filled (without affecting the actual subpaths).
        
        returns SVG ONLY svg path element
    ***/
    var paths = this._emitPaths();
    if (paths != null) {
        //log("fill(): this.drawGroup=", this.drawGroup);
        this._setGraphicsAttributes(paths, 'fill');
        this.drawGroup.appendChild(paths);
    }
    return paths;
}

SVGCanvas.prototype._doClip = function(clippingContents) {
    //log("clip() or clipRect(): clippingContents = ", clippingContents);
    if (clippingContents == null)
        return null;
    var clipId = this.svg.createUniqueID('clip');
    var clipPath = this.svg.CLIPPATH({'id':clipId});  // , 'clipPathUnits':'userSpaceOnUse'  default
    clipPath.appendChild(clippingContents);
    this.svg.append(clipPath);
    this.drawGroup = this.svg.G({'clip-path':'url(#'+clipId+')'})
    this.currentGroup.appendChild(this.drawGroup);
    return clipPath;
}

SVGCanvas.prototype.clip = function (x, y, width, height) {
    /***
        <g clip-rule="nonzero">
          <clipPath id="MyClip">
            <path d="..." />
          </clipPath>
          <rect clip-path="url(#MyClip)" clip-rule="evenodd" ... />
        </g>
    ***/
    return this._doClip(this._emitPaths());
}

SVGCanvas.prototype.clipRect = function(x, y, w, h) {
    /***
        SVG ONLY: CDefine a simple clip rectangle without drawing a path.
    ***/
    var rect = this.svg.RECT({'x':x,
                              'y':y,
                              'width':w,
                              'height':h});
    this._setShapeTransform(rect);
    return this._doClip(rect);
}

SVGCanvas.prototype.strokeRect = function (x, y, w, h) {
    //log("strokeRect(): this.drawGroup=", this.drawGroup);
    var rect = this.svg.RECT({'x':x,
                              'y':y,
                              'width':w,
                              'height':h});
    this._setShapeTransform(rect);
    this._setGraphicsAttributes(rect, 'stroke');
    this.drawGroup.appendChild(rect);
    return rect;
}

SVGCanvas.prototype.fillRect = function (x, y, w, h) {
    //log("fillRect(): this.drawGroup=", this.drawGroup);
    var rect = this.svg.RECT({'x':x,
                              'y':y,
                              'width':w,
                              'height':h});
    this._setShapeTransform(rect);
    this._setGraphicsAttributes(rect, 'fill');
    this.drawGroup.appendChild(rect);
    return rect;
}

SVGCanvas.prototype.clearRect = function (x, y, w, h) {
    //log("clearRect(): this.drawGroup=", this.drawGroup);
    var rect = this.svg.RECT({'x':x,
                              'y':y,
                              'width':w,
                              'height':h,
                              'fill':'white',
                              'fill-opacity':1.0,
                              'fill-rule':'nonzero'});
    this._setShapeTransform(rect);
    this.drawGroup.appendChild(rect);
    return rect;
}


// SVG Only text

SVGCanvas.prototype.text = function(text, x /* =0 */ , y /* =0 */) {
    //log("text(): this.drawGroup=", this.drawGroup);
    var text = this.svg.TEXT(null, text);
    if (x!=null)                   setNodeAttribute(node, 'x', x);
    if (y!=null)                   setNodeAttribute(node, 'y', y);
    this._setShapeTransform(text);
    this._setGraphicsAttributes(text, 'fill');
    this._setFontAttributes(text);
    this.drawGroup.appendChild(text);
    return text;
}

SVGCanvas.prototype._setFontAttributes = function(node) {
    if (this.applyStyles==false)
        return;
    // Often these are null, so set them in a way that nothing will actually get set if you pass null.
    if (this.font!=null)          setNodeAttribute(node, 'font', this.font);
    if (this.fontFamily!=null)    setNodeAttribute(node, 'font-family', this.fontFamily);
    if (this.fontSize!=null)      setNodeAttribute(node, 'font-size', this.fontSize);
    if (this.fontWeight!=null)    setNodeAttribute(node, 'font-weight', this.fontWeight);
    if (this.fontStyle!=null)     setNodeAttribute(node, 'font-style', this.fontStyle);
    if (this.fontVariant!=null)   setNodeAttribute(node, 'font-variant', this.fontVariant);
    if (this.fontStretch!=null)   setNodeAttribute(node, 'font-stretch', this.fontStretch);
    if (this.textAnchor!=null)    setNodeAttribute(node, 'text-anchor', this.textAnchor);
}

// Creating Gradient, Pattern, and (SVG Only) Marker Styles

SVGCanvas.Gradient = function(self, svg) {
    /***
        Common constructor for both LinearGradient and RadialGradient
    ***/
    self.svg = svg;
    self.need0 = true;  // Do we still need to explicity add a stop at zero?
    self.need1 = true;
    //log('  id=', self.id);
    self.defs = svg.getDefs(true);
}

SVGCanvas.LinearGradient = function(svg, x0, y0, x1, y1) {
    //log('LinearGradient:', svg, x0, y0, x1, y1);
    this.id = svg.createUniqueID('linearGradient');
    SVGCanvas.Gradient(this, svg);
    this.gradientElement = svg.LINEARGRADIENT({'x1':x0, 'y1':y0, 'x2':x1, 'y2':y1, 'id':this.id, 'gradientUnits':'userSpaceOnUse'});
    //log("Created gradientElement=", this.gradientElement);
    //log("Going to append gradient id=", this.id, " to defs=", this.defs);
    this.defs.appendChild(this.gradientElement);
}

SVGCanvas.LinearGradient.prototype.addColorStop = function(offset, color) {
    //log("addColorStop: ", offset, color);
    if (offset==0) {
        this.need0 = false;
    }
    else if (offset==1) {
        this.need1 = false;
    }
    var c = Color.fromString(color);
    //log('stop-color', c.toHexString(), 'stop-opacity', c.asRGB()['a']);
    var stop = this.svg.STOP({'offset':offset, 
                              'stop-color':c.toHexString(), 
                              'stop-opacity':c.asRGB()['a']});
    this.gradientElement.appendChild(stop);
}

SVGCanvas.LinearGradient.prototype.applyGradient = function() {
    if (this.need0)
        this.addColorStop(0, "rgba(0,0,0,0)");
    if (this.need1)
        this.addColorStop(1, "rgba(0,0,0,0)");
}

SVGCanvas.RadialGradient = function(svg, x0, y0, r0, x1, y1, r1) {
    //log('RadialGradient:', svg, x0, y0, x1, y1);
    this.id = svg.createUniqueID('radialGradient');
    SVGCanvas.Gradient(this, svg)
    this.gradientElement = svg.RADIALGRADIENT( {'fx':x0, 'fy':y0, 'r':r1, 'cx':x1, 'cy':y1, 'id':this.id, 'gradientUnits':'userSpaceOnUse'} );
    this.ratio = r0/r1;
    //log("Created gradientElement=", this.gradientElement);
    //log("Going to append gradient id=", this.id, " to defs=", this.defs);
    this.defs.appendChild(this.gradientElement);
}

SVGCanvas.RadialGradient.prototype.addLinearColorStop = SVGCanvas.LinearGradient.prototype.addColorStop;
SVGCanvas.RadialGradient.prototype.addColorStop = function(offset, color) {
    var svgOffset = offset*(1-this.ratio) + this.ratio;
    this.addLinearColorStop(svgOffset, color);
}
SVGCanvas.RadialGradient.prototype.applyGradient = SVGCanvas.LinearGradient.prototype.applyGradient;

SVGCanvas.prototype.createLinearGradient = function (x0, y0, x1, y1) {
    return new SVGCanvas.LinearGradient(this.svg, x0, y0, x1, y1)
}
SVGCanvas.prototype.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {
    return new SVGCanvas.RadialGradient(this.svg, x0, y0, r0, x1, y1, r1);
}

SVGCanvas.Pattern = function(svg, contents, repetition) {
    /***
        Firefox doesn't seem to support patterns from images in SVG
        
        SVG Only -- contents can be an SVG group.
    ***/
    this.svg = svg;
    this.id = svg.createUniqueID('pattern');
    //log('  id=', this.id);
    this.defs = svg.getDefs(true);
    this.contents = contents;
    
    var width = null;
    var height = null;
    if (contents.constructor == Image) {
        //log("  img: ", contents.width, contents.height, contents.src);
        width = contents.width;
        height = contents.height;
        contents = this.svg.IMAGE({'x':0, 
                                   'y':0, 
                                   'width':width,
                                   'height': height,
                                   'xlink:href': contents.src});
    }
    
    this.pattern = this.svg.PATTERN({'patternUnits':'userSpaceOnUse',
                                     'patternContentUnits':'userSpaceOnUse',
                                     'width': width,
                                     'height': height,
                                     'id':this.id});
    //log("  pattern: ", this.pattern);
    this.defs.appendChild(this.pattern);
    this.pattern.appendChild(contents);
}

SVGCanvas.prototype.createPattern = function (image, repetition) {
    /***
        @param image : Can either be an image element or another canvas.
          or (SVG Only) an SVG group.
    ***/
    return new SVGCanvas.Pattern(this.svg, image, repetition);
}

SVGCanvas.prototype._startDefineGroup = function () {
    /***
        SVG Only
        Until endMarker or endPattern are called, all drawing will be done in a group that doesn't get displayed.
        Reset the transformations, but not the fillStyle, strokeStyle and things like that.
    ***/
    this.save();
    this.currentTransformationMatrix = null;
    this.transformations = '';
    this.drawGroup = this.svg.G();
}


SVGCanvas.prototype.startPattern = SVGCanvas.prototype._startDefineGroup
SVGCanvas.prototype.endPattern = function (repetition) {
    /***
        SVG Only
        returns the pattern object to set strokeStyle or fillStyle to.
    ***/
    var pattern = new this.createPattern(this.drawGroup, repetition);
    this.restore();
    return pattern;
}

SVGCanvas.prototype.startMarker = SVGCanvas.prototype._startDefineGroup
SVGCanvas.prototype.endMarker = function(orient /* = 'auto' */) {
    /***
        SVG Only
        Returns the marker object to be used in markerStart, markerMid, or markerEnd
    ***/
    // Note that stroke style and fill properties (including with patterns or gradients) do not affect markers
    if (typeof(orient) == 'undefined' || orient==null)
        orient = 'auto';

    var id = svg.createUniqueID('marker');
    //log(' marker id=', this.id);
    var defs = svg.getDefs(true);
    
    var marker = this.svg.MARKER({'orient':orient,  // 'auto'
                                     'id':this.id});
    //log("  marker: ", this.marker);
    this.defs.appendChild(this.marker);
    this.marker.appendChild(this.drawGroup);

    this.restore();
    return id;
}

// Drawing an Image

/*
this.drawImage(image, dx, dy) {}
this.drawImage(image, dx, dy, dw, dh) {}
this.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {}
this.drawImage(image, dx, dy) {}
this.drawImage(image, dx, dy, dw, dh) {}
*/
SVGCanvas.prototype.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
    //log("drawImage(", image, sx, sy, sw, sh, dx, dy, dw, dh, ")");
    //log("  img: ", image.width, image.height, image.src);
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
    this._setShapeTransform(img);
    this.svg.append(img);
}

SVGCanvas.__new__ = function (win) {

    var m = MochiKit.Base;

    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": m.concat(this.EXPORT, this.EXPORT_OK)
    };

    m.nameFunctions(this);
};

SVGCanvas.__new__(this);

MochiKit.Base._exportSymbols(this, SVGCanvas);

var SVGCanvas = SVGCanvas;