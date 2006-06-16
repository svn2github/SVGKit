/***

SVGCanvas 0.1

See <http://svgkit.com/> for documentation, downloads, license, etc.

(c) 2006 Jason Gallicchio.  All rights Reserved.



Maybe this should auto-export its methods to the SVG object when included.
Convenient, but very confusing to users.

TODO:
* Add other compositing modes, prhaps by calling some getBoundingPath and creating a new <mask>
  <mask id="Mask" maskUnits="userSpaceOnUse"
          x="0" y="0" width="800" height="300">
      <rect x="0" y="0" width="800" height="300" fill="url(#Gradient)"  />
  </mask>
  <text id="Text" x="400" y="200" font-size="100" fill="blue" mask="url(#Mask)" />
* linearGradient doesn't work in inline mode. See bugs in SVGKit
* repetition parameter on patterns: 'repeat', 'repeat-x', 'repeat-y', 'no-repeat'
* shadows: rendered from image A, using the current shadow styles, creating image B.
* arcTo doesn't work in Mozilla so it's not well tested.
* fill() then stroke() should just modify properties of current path.  This is hard,
   because you have to record when you did ANYTHING like changing an attribute or adding a segment.
   Keeping track of all this and/or doing this check will slow things down.  I added draw() instead.
* markers work, but SVG output crashes Inkscape when I click on it, get properties, 
    and look at markers.  Could be Inkscape problem.

Building the SVG DOM from Canvas Calls (Notes):
* Patters and gradients and other global <defs> that can be used at any time also
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
        
***/



////////////////////////////
//  Setup
////////////////////////////

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
SVGCanvas.VERSION = "0.1";
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


////////////////////////////
//  Defaults
////////////////////////////

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
      'textAnchor' : null, // 'text-anchor' {start | middle | end | inherit} defaults to start.  null implicitly means inherit
      
      'applyStyles' : true,  // Apply all of these styles to a given SVG element or let them be inherited.
      
      // Internal State (not copied when you do getStyle or setStyle):
      'currentTransformationMatrix': null,  // Only gets uses for transformation inside of path.
      'transformations' : "",  // Applys to all subpaths.
      'drawGroup' : null, // When you start, there is no clipping and you're not in a marker.
      //'currentGroup' : null
    };  // if this is changed, you also have to change the drawGroup


////////////////////////////
//  Constructor
////////////////////////////

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


////////////////////////////
//  Utility Functions
////////////////////////////

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
    
    // To detect a fill followed by a stroke that should just add fill attributes.
    this.filledSubpaths = null;
    this.filledStyle = null;
    this.filledNode =  null;
    
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
        Sets the drawGroup and currentGroup so that future 
        fill() and stroke() add their shapes to the given group.
    ***/
    this.drawGroup = group;
    //this.currentGroup = group;
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
                stateKeys[i] != 'drawGroup' /*&&
                stateKeys[i] != 'currentGroup'*/) {
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

SVGCanvas.prototype.compareState = function(state) {
    var stateKeys = keys(SVGCanvas.startingState)
    for (var i=0; i<stateKeys.length; i++) {
        if (this[stateKeys[i]] != state[stateKeys[i]]) {
            return false;
        }
    }
    return true;
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

////////////////////////////
//  Canvas State Methods
////////////////////////////

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


////////////////////////////
//  Canvas Transformation Methods
////////////////////////////

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
    if (typeof(sy) == 'undefined' || sy==null)
        sy = sx;
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
    if (typeof(sy) == 'undefined' || sy==null)
        sy = 0;
    if (this._subpaths.length==1 && this._hasOnlyMoveZero() )
        this.transformations += "translate(" + tx +"," + ty + ")";
    else {
        if (this.currentTransformationMatrix==null)
            this.currentTransformationMatrix = this.svg.svgElement.createSVGMatrix()
        this.currentTransformationMatrix = this.currentTransformationMatrix.translate(tx, ty);
    }
}

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

////////////////////////////
//  Canvas Path Methods
////////////////////////////

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

SVGCanvas.prototype.moveTo = function(x, y, relative /* =false */) {
    /***
        method sets the current position to the given coordinate and creates 
        a new subpath with that point as its first (and only) point. If there 
        was a previous subpath, and it consists of just one point, then that 
        subpath is removed from the path.
        
        We don't error check or optimize.
    ***/
    var cmd = !MochiKit.Base.isUndefinedOrNull(relative) || relative ? ' m ' : ' M ';
    //log("moveTo("+x+","+y+"): path = ", this._subpaths[this._subpaths.length-1]);
    //log("moveTo("+x+","+y+")");
    this._newSubPath();
    var p = this._transformWithCTM(x,y);
    this._subpaths[this._subpaths.length-1] = cmd + p.x + "," + p.y;  // This must pass the hasDrawing RegExp
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

    
SVGCanvas.prototype.lineTo = function(x, y, relative /* =false */) {
    /***
        adds the given coordinate (x, y) to the list of points of the subpath, 
        and connects the current position to that point with a straight line.
        relative is an SVG-only feature.
    ***/
    var cmd = !MochiKit.Base.isUndefinedOrNull(relative) || relative ? ' l ' : ' L ';
    //log("lineTo("+x+","+y+"): path = ", this._subpaths[this._subpaths.length-1]);
    //log("lineTo("+x+","+y+")");
    if (this._subpaths[this._subpaths.length-1] == '') {
        //log("lineTo detected no current path. Calling moveTo instead ala Firefox");
        this.moveTo(x, y);
        return;
    }
    var p = this._transformWithCTM(x,y);
    this._subpaths[this._subpaths.length-1] += cmd + p.x + "," + p.y;
    this._lastx = p.x;
    this._lasty = p.y;
}
    
SVGCanvas.prototype.quadraticCurveTo = function (cpx, cpy, x, y, relative /* =false */) {
    /***
        adds the given coordinate (x, y) to the list of points of the subpath,
        and connects the current position to that point with a quadratic 
        curve with control point (cpx, cpy)
    ***/
    var cmd = !MochiKit.Base.isUndefinedOrNull(relative) || relative ? ' q ' : ' Q ';
    var cp = this._transformWithCTM(cpx,cpy);
    var p = this._transformWithCTM(x,y);
    this._subpaths[this._subpaths.length-1] += cmd + cp.x + "," + cp.y + " " + p.x + "," + p.y;
    this._lastx = p.x;
    this._lasty = p.y;
}

SVGCanvas.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y, relative /* =false */) {
    /***
        adds the given coordinate (x, y) to the list of points of the 
        subpath, and connects the two points with a bezier curve with 
        control points (cp1x, cp1y) and (cp2x, cp2y).
    ***/
    var cmd = !MochiKit.Base.isUndefinedOrNull(relative) || relative ? ' c ' : ' C ';
    var cp1 = this._transformWithCTM(cp1x,cp1y);
    var cp2 = this._transformWithCTM(cp2x,cp2y);
    var p = this._transformWithCTM(x,y);
    this._subpaths[this._subpaths.length-1] += cmd + cp1.x + "," + cp1.y + " " + cp2.x + "," + cp2.y + " " + p.x + "," + p.y;
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
    var s = radius*Math.tan( Math.acos(-dot/ab)/2 );
    //var s = radius*Math.sqrt(2*ab/(ab + dot) - 1);  // The fraction of the way from (x1,y1) to the other two points.
    //log('arcTo x0',x0,'y0',y0,'ax',ax,'ay',ay,'a',a,'bx',bx,'by',by,'b',b,'dot',dot,'ab',ab,'s',s);
    
    t1x = x1 + s*ax/a;
    t1y = y1 + s*ay/a;
    t2x = x1 + s*bx/b;
    t2y = y1 + s*by/b;

    var sweep = (ax*by-ay*bx)>0 ? '0' : '1';
        
    this.lineTo(t1x, t1y);  // The path may already be close enough.
    this._subpaths[this._subpaths.length-1] += " A " + radius + "," + radius + " 0 0," + sweep + " " + t2x + "," + t2y;
    this._lastx = t2x;
    this._lasty = t2y;
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


    
SVGCanvas.prototype.smoothCurveTo = function (x, y, relative /* =false */) {
    /***
        SVG ONLY
        adds the given coordinate (x, y) to the list of points of the subpath,
        and connects the current position to that point with a smooth quadratic 
        curve.  Control point is calculated.
    ***/
    var cmd = !MochiKit.Base.isUndefinedOrNull(relative) || relative ? ' t ' : ' T ';
    var p = this._transformWithCTM(x,y);
    this._subpaths[this._subpaths.length-1] += cmd + p.x + "," + p.y;
    this._lastx = p.x;
    this._lasty = p.y;
}


SVGCanvas.prototype.ellipticalArc = function (rx, ry, xdegrees, large_arc, sweep, x, y, relative /* =false */) {
    /***
     SVG ONLY
     Draws an elliptical arc from the current point to (x, y). The size and 
     orientation of the ellipse are defined by two radii (rx, ry) and an 
     x-axis-rotation, which indicates how the ellipse as a whole is rotated 
     relative to the current coordinate system. The center (cx, cy) of the 
     ellipse is calculated automatically to satisfy the constraints imposed 
     by the other parameters. large-arc-flag and sweep-flag contribute to 
     the automatic calculations and help determine how the arc is drawn.
    ***/
    var cmd = !MochiKit.Base.isUndefinedOrNull(relative) || relative ? ' a ' : ' A ';
    var rp = this._transformWithCTM(rx,ry);
    var p = this._transformWithCTM(x,y);
    this._subpaths[this._subpaths.length-1] += cmd + rp.x + "," + rp.y + " " + 
                                                 xdegrees + " " + 
                                                 large_arc + "," + sweep + " " +
                                                 p.x + "," + p.y;
    this._lastx = p.x;
    this._lasty = p.y;
}


////////////////////////////
//  Canvas Render Methods
////////////////////////////

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
        Returns a single element, either a <path> or a <g> containing many paths. Could return null.
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

SVGCanvas.prototype._setGraphicsStyle = function(node, type, style) {
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
}

SVGCanvas.prototype._setGraphicsAttributes = function(node, type) {
    /***
        type is 'stroke' or 'fill'  (not 'clip')
        TODO:  If you fill, then stroke a path, you should add attributes to the same path,
        not make a new one.
    ***/

    if (this.applyStyles==false)
        return;
    
    var style, other;
    if (type=='stroke') {
        this._setGraphicsStyle(node, 'stroke', this.strokeStyle);
        setNodeAttribute(node, 'fill', 'none');
        //setNodeAttribute(node, 'fill-opacity', 0);
    }
    else if (type=='fill') {
        this._setGraphicsStyle(node, 'fill', this.fillStyle);
        setNodeAttribute(node, 'stroke', 'none');
        //setNodeAttribute(node, 'stroke-opacity', 0);
    }
    else {
        this._setGraphicsStyle(node, 'stroke', this.strokeStyle);
        this._setGraphicsStyle(node, 'fill', this.fillStyle);
    }
    
    
    if (type=='fill' || type=='both') {
        setNodeAttribute(node, 'fill-rule', 'nonzero');
    }
    if (type=='stroke' || type=='both') {
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
        setNodeAttribute(node, 'marker-mid', 'url(#'+this.markerMid+')')
    if (this.markerEnd != null)
        setNodeAttribute(node, 'marker-end', 'url(#'+this.markerEnd+')')
}

SVGCanvas.prototype.append = function (element) {
    /***
        Appends the given element to the current drawingGroup.
        This is used in stroke, fill, and clip, but also can
        be generally useful.
    ***/
    this.drawGroup.appendChild(element);
}

SVGCanvas.prototype._doPath = function(type) {
    var paths = this._emitPaths();
    if (paths != null) {
        this._setGraphicsAttributes(paths, type);
        this.append(paths);
    }
    return paths;
}

SVGCanvas.prototype.stroke = function () {
    /***
        strokes each subpath of the current path in turn, using strokeStyle
        
        returns SVG ONLY svg path element
    ***/
    /*
    document.can = this
    if (this.filledSubpaths != null && this.filledSubpaths == this._subpaths && 
            this.filledStyle != null && this.compareState(this.filledStyle)) {
        this._setGraphicsAttributes(this.filledNode, 'both')
        return this.filledNode;
    }
    else {
        //this.filledSubpaths = null;
        return this._doPath('stroke');
    }
    */
    return this._doPath('stroke');
}

SVGCanvas.prototype.fill = function () {
    /***
        fills each subpath of the current path in turn, using fillStyle, 
        and using the non-zero winding number rule. Open subpaths are implicitly 
        closed when being filled (without affecting the actual subpaths).
        
        returns SVG ONLY svg path element
    ***/
    /*
    this.filledSubpaths = this._subpaths;
    this.filledStyle = this.getState();
    this.filledNode =  this._doPath('fill');
    return this.filledNode;
    */
    return this._doPath('fill');
}

SVGCanvas.prototype.draw = function () {
    /***
        SVG ONLY
        strokes and fills path
    ***/
    return this._doPath('both');
}

SVGCanvas.prototype._doClip = function(clippingContents) {
    //log("clip() or clipRect(): clippingContents = ", clippingContents);
    if (clippingContents == null)
        return null;
    var clipId = this.svg.createUniqueID('clip');
    var clipPath = this.svg.CLIPPATH({'id':clipId});  // , 'clipPathUnits':'userSpaceOnUse'  default
    clipPath.appendChild(clippingContents);
    this.svg.append(clipPath);
    var clipedGroup = this.svg.G({'clip-path':'url(#'+clipId+')'});
    this.drawGroup.appendChild(clipedGroup);
    this.drawGroup = clipedGroup;
    //this.drawGroup = this.svg.G({'clip-path':'url(#'+clipId+')'})
    //this.currentGroup.appendChild(this.drawGroup);
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


SVGCanvas.prototype.outputShape = function(shape, style) {
    /*
    if (style=='fill')
        this._saveFilledState();
    else if (style=='stroke' && this._compareFilledState()) {
        this._setGraphicsAttributes(shape, style);
    }
    */
    this._setShapeTransform(shape);
    this._setGraphicsAttributes(shape, style);
    this.append(shape);
    return shape;
}

SVGCanvas.prototype.strokeRect = function (x, y, w, h) {
    //log("strokeRect(): this.drawGroup=", this.drawGroup);
    var rect = this.svg.RECT({'x':x,
                              'y':y,
                              'width':w,
                              'height':h});
    this.outputShape(rect, 'stroke');
    return rect;
}

SVGCanvas.prototype.fillRect = function (x, y, w, h) {
    //log("fillRect(): this.drawGroup=", this.drawGroup);
    var rect = this.svg.RECT({'x':x,
                              'y':y,
                              'width':w,
                              'height':h});
    this.outputShape(rect, 'fill');
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
    this.append(rect);
    return rect;
}



////////////////////////////
//  SVG Native Shapes
////////////////////////////



SVGCanvas.prototype.path = function (data) {
    var path = this.svg.PATH({'d':data});
    return path;
}

SVGCanvas.prototype.strokePath = function (data) {
    var shape = this.path(data);
    return this.outputShape(shape, 'stroke');
}

SVGCanvas.prototype.fillPath = function (data) {
    var shape = this.path(data);
    return this.outputShape(shape, 'fill');
}

SVGCanvas.prototype.drawPath = function (data) {
    var shape = this.path(data);
    return this.outputShape(shape, 'both');
}

SVGCanvas.prototype.roundedRect = function (x, y, w, h, rx, ry) {
    var rect = this.svg.RECT({'x':x,
                              'y':y,
                              'width':w,
                              'height':h,
                              'rx':rx,
                              'ry':ry});
    return rect;
}

SVGCanvas.prototype.strokeRoundedRect = function (x, y, w, h, rx, ry) {
    var shape = this.roundedRect(x, y, w, h, rx, ry);
    return this.outputShape(shape, 'stroke');
}

SVGCanvas.prototype.fillRoundedRect = function (x, y, w, h, rx, ry) {
    var shape = this.roundedRect(x, y, w, h, rx, ry);
    return this.outputShape(shape, 'fill');
}

SVGCanvas.prototype.drawRoundedRect = function (x, y, w, h, rx, ry) {
    var shape = this.roundedRect(x, y, w, h, rx, ry);
    return this.outputShape(shape, 'both');
}


SVGCanvas.prototype.circle = function (cx, cy, r) {
    var circle = this.svg.CIRCLE({'cx':cx,
                              'cy':cy,
                              'r':r});
    return circle;
}

SVGCanvas.prototype.strokeCircle = function (cx, cy, r) {
    var shape = this.circle(cx, cy, r)
    return this.outputShape(shape, 'stroke');
}

SVGCanvas.prototype.fillCircle = function (cx, cy, r) {
    var shape = this.circle(cx, cy, r)
    return this.outputShape(shape, 'fill');
}

SVGCanvas.prototype.drawCircle = function (cx, cy, r) {
    var shape = this.circle(cx, cy, r)
    return this.outputShape(shape, 'both');
}



SVGCanvas.prototype.ellipse = function (cx, cy, rx, ry) {
    var ellipse = this.svg.ELLIPSE({'cx':cx,
                              'cy':cy,
                              'rx':rx,
                              'ry':ry});
    return ellipse;
}

SVGCanvas.prototype.strokeEllipse = function (cx, cy, rx, ry) {
    var shape = this.ellipse(cx, cy, rx, ry)
    return this.outputShape(shape, 'stroke');
}

SVGCanvas.prototype.fillEllipse = function (cx, cy, rx, ry) {
    var shape = this.ellipse(cx, cy, rx, ry)
    return this.outputShape(shape, 'fill');
}

SVGCanvas.prototype.drawEllipse = function (cx, cy, rx, ry) {
    var shape = this.ellipse(cx, cy, rx, ry)
    return this.outputShape(shape, 'both');
}


SVGCanvas.prototype.line = function (x1, y1, x2, y2) {
    var line = this.svg.LINE({'x1':x1,
                              'y1':y1,
                              'x2':x2,
                              'y2':y2});
    return this.outputShape(shape, 'stroke');
}

SVGCanvas.prototype.polyline = function(points) {
    var polyline = this.svg.POLYLINE({'points':points});
    return polyline
    return this.outputShape(shape, 'stroke');
}

SVGCanvas.prototype.strokePolyline = function (points) {
    var shape = this.polyline(points)
    return this.outputShape(shape, 'stroke');
}

SVGCanvas.prototype.fillPolyline = function (points) {
    var shape = this.polyline(points)
    return this.outputShape(shape, 'fill');
}

SVGCanvas.prototype.drawPolyline = function (points) {
    var shape = this.polyline(points)
    return this.outputShape(shape, 'both');
}

SVGCanvas.prototype.polygon = function(points) {
    var polygon = this.svg.POLYGON({'points':points});
    return polygon
    return this.outputShape(shape, 'stroke');
}

SVGCanvas.prototype.strokePolygon = function (points) {
    var shape = this.polygon(points)
    return this.outputShape(shape, 'stroke');
}

SVGCanvas.prototype.fillPolygon = function (points) {
    var shape = this.polygon(points)
    return this.outputShape(shape, 'fill');
}

SVGCanvas.prototype.drawPolygon = function (points) {
    var shape = this.polygon(points)
    return this.outputShape(shape, 'both');
}




////////////////////////////
//  Text Methods SVG Only
////////////////////////////

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


////////////////////////////
//  Canvas Image Methods
////////////////////////////


SVGCanvas.prototype.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
    /***
        Usage:
        
        drawImage(image, dx, dy) {}
        drawImage(image, dx, dy, dw, dh) {}
        drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {}
        drawImage(image, dx, dy) {}
        drawImage(image, dx, dy, dw, dh) {}
    ***/
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
                              'xlink:href':image.src});
    if (viewBox != null)
        setNodeAttribute(node, 'viewBox', viewBox);
    this._setShapeTransform(img);
    this.svg.append(img);
}


////////////////////////////
//  Creating Gradient, Pattern, and (SVG Only) Marker Styles
////////////////////////////

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

SVGCanvas.prototype.startPattern = SVGCanvas.prototype._startDefineGroup
SVGCanvas.prototype.endPattern = function (repetition) {
    /***
        SVG Only
        returns the pattern object to set strokeStyle or fillStyle to.
    ***/
    var pattern = new this.createPattern(this.drawGroup, repetition);
    this.restore();
    this.beginPath();
    return pattern;
}


SVGCanvas.prototype.startMarker = function() {
    this._startDefineGroup();
    this.markerStart = null;
    this.markerMid = null;
    this.markerEnd = null;
}
SVGCanvas.prototype.endMarker = function(orient /* = 'auto' */, markerUnits /* ='strokeWidth' */, 
                                            overflow /* ='visible' */, 
                                            markerWidth /* =3 */, markerHeight /* =3 */, 
                                            refX /* =0 */, refY /* =0 */) {
    /***
        SVG Only
        Returns the marker object to be used in markerStart, markerMid, or markerEnd
    ***/
    // Note that stroke style and fill properties (including with patterns or gradients) do not affect markers
    var attrs = {};
    if (typeof(orient) == 'undefined' || orient==null)
        attrs['orient'] = 'auto';
    else
        attrs['orient'] = orient;  
    if (typeof(orient) == 'undefined' || orient==null)
        attrs['style'] = 'overflow:visible;';
    else
        attrs['orient'] = 'overflow:'+overflow+';';
    if (!MochiKit.Base.isUndefinedOrNull(markerUnits))
        attrs['markerUnits'] = markerUnits;  //  'strokeWidth' | 'userSpaceOnUse'
    if (!MochiKit.Base.isUndefinedOrNull(markerWidth))
        attrs['markerWidth'] = markerWidth;
    if (!MochiKit.Base.isUndefinedOrNull(markerHeight))
        attrs['markerHeight'] = markerHeight;
    if (!MochiKit.Base.isUndefinedOrNull(refX))
        attrs['refX'] = refX;
    if (!MochiKit.Base.isUndefinedOrNull(refY))
        attrs['refY'] = refY;

    var id = this.svg.createUniqueID('marker');
    //log(' marker id=', id);
    attrs['id'] = id;
    var defs = this.svg.getDefs(true);
    //log(' defs=', defs);
    
    // http://www.w3.org/TR/SVG/painting.html
    var marker = this.svg.MARKER(attrs);
    //log("  marker: ", marker);
    marker.appendChild(this.drawGroup);
    defs.appendChild(marker);

    this.restore();
    this.beginPath();
    return id;
}

////////////////////////////
//  Standard Paths (can be used as Markers)
////////////////////////////


SVGCanvas.prototype.pollygon = function(n, size /* =10 */, rotation /* =0 */, method /* ='area' */) {
    /***
        Issue commands (but don't stroke or fill) for a pollygon based on its:
        'outer' radiu, 'inner' radius, or 'area'
        The area method is good for plots where people perceive area as magnitude, not direction.
        TODO: Inkscape's rounded corners, randomization, and non-regular stars.
    ***/
    if (typeof(rotation)=='undefined' || rotation==null)
        rotation = 0;
    if (typeof(method)=='undefined' || method==null)
        method = 'area';
    if (typeof(size)=='undefined' || size==null) {
        size = 10;
    }
    
    var outer_radius = size;
    if (method == 'area')
        outer_radius = Math.sqrt(2*size*size/n/Math.sin(2*Math.PI/n));
    if (method == 'inner')
        outer_radius = Math.sqrt(size*Math.Sin(Math.PI/n));
        
    this.beginPath();
    var th = rotation - Math.PI/2;
    this.moveTo(outer_radius*Math.cos(th), outer_radius*Math.sin(th));
    for (var i=1; i<n; i++) {
        th = th + 2*Math.PI/n;
        this.lineTo(outer_radius*Math.cos(th), outer_radius*Math.sin(th));
    }
    this.closePath();
}

SVGCanvas.prototype.star = function(n, outer_radius /* =10 */, inner_radius /* =outer_radius/3 */, rotation /* =0 */) {
    /***
        Issue commands (but don't stroke or fill) for a star based on its inner and outer radius
    ***/
    if (typeof(outer_radius)=='undefined' || outer_radius==null)
        outer_radius = 10;
    if (typeof(inner_radius)=='undefined' || inner_radius==null)
        inner_radius = outer_radius/3;
    if (typeof(rotation)=='undefined' || rotation==null)
        rotation = 0;
    this.beginPath();
    var th = rotation - Math.PI/2;
    this.moveTo(outer_radius*Math.cos(th), outer_radius*Math.sin(th));
    for (var i=0; i<n; i++) {
        this.lineTo(outer_radius*Math.cos(th), outer_radius*Math.sin(th));
        th = th + Math.PI/(n);
        this.lineTo(inner_radius*Math.cos(th), inner_radius*Math.sin(th));
        th = th + Math.PI/(n);
    }
    this.closePath();
}

SVGCanvas.prototype.asterisk = function(n, outer_radius /* =10 */, inner_radius /* =0 */, rotation /* = 0 */) {
    /***
        Issue commands (but don't stroke or fill) for an open star or asterisk based on its inner and outer radius
    ***/
    if (typeof(outer_radius)=='undefined' || outer_radius==null)
        outer_radius = 10;
    if (typeof(inner_radius)=='undefined' || inner_radius==null)
        inner_radius = 0;
    if (typeof(rotation)=='undefined' || rotation==null)
        rotation = 0;
    this.beginPath();
    var th = rotation - Math.PI/2;
    for (var i=0; i<n; i++) {
        this.moveTo(inner_radius*Math.cos(th), inner_radius*Math.sin(th));
        this.lineTo(outer_radius*Math.cos(th), outer_radius*Math.sin(th));
        th = th + 2*Math.PI/n;
    }
}


////////////////////////////
//  Inkscape Stock Markers (all but Torso and Legs)
////////////////////////////


SVGCanvas.prototype.inkscapeArrow1 = function() {
    /*
    style="fill-rule:evenodd;stroke:#000000;stroke-width:1.0pt;marker-start:none"
    d="M 0.0,0.0 L 5.0,-5.0 L -12.5,0.0 L 5.0,5.0 L 0.0,0.0 z "
    */
    this.lineWidth = 1.0;
    this.beginPath();
    this.moveTo(0.0,0.0);
    this.lineTo(5.0,-5.0);
    this.lineTo(-12.5,0.0);
    this.lineTo(5.0,5.0);
    this.lineTo(0.0,0.0);
    this.closePath();
    this.fill();
    this.stroke();
}

SVGCanvas.prototype.inkscapeArrow1Lstart = function() {
    this.scale(0.8);
    this.inkscapeArrow1();
}

SVGCanvas.prototype.inkscapeArrow1Lend = function() {
    this.scale(0.8);
    this.rotate(Math.PI);
    this.inkscapeArrow1();
}

SVGCanvas.prototype.inkscapeArrow1Mstart = function() {
    this.scale(0.4);
    this.inkscapeArrow1()
}

SVGCanvas.prototype.inkscapeArrow1Mend = function() {
    this.scale(0.4);
    this.rotate(Math.PI);
    this.inkscapeArrow1();
}

SVGCanvas.prototype.inkscapeArrow1Sstart = function() {
    this.scale(0.2);
    this.inkscapeArrow1();
}

SVGCanvas.prototype.inkscapeArrow1Send = function() {
    this.scale(0.2);
    this.rotate(Math.PI);
    this.inkscapeArrow1();
}

SVGCanvas.prototype.inkscapeArrow2 = function() {
    /*
    style="font-size:12.0;fill-rule:evenodd;stroke-width:0.62500000;stroke-linejoin:round"   
    d="M 8.7185878,4.0337352 L -2.2072895,0.016013256 L 8.7185884,-4.0017078 C 6.9730900,-1.6296469 6.9831476,1.6157441 8.7185878,4.0337352 z "      
    */
    this.translate(-5,0);
    this.lineWidth = 0.62500000;
    this.lineJoin = 'round';
    this.beginPath();
    this.moveTo(8.7185878,4.0337352);
    this.lineTo(-2.2072895,0.016013256);
    this.lineTo(8.7185884,-4.0017078);
    this.bezierCurveTo(6.9730900,-1.6296469, 6.9831476,1.6157441, 8.7185878,4.0337352);
    this.closePath();
    this.fill();
    this.stroke();
}


SVGCanvas.prototype.inkscapeArrow2Lstart = function() {
    this.scale(1.1);
    this.inkscapeArrow2()
}

SVGCanvas.prototype.inkscapeArrow2Lend = function() {
    this.scale(1.1);
    this.rotate(Math.PI);
    this.inkscapeArrow2();
}

SVGCanvas.prototype.inkscapeArrow2Mstart = function() {
    this.scale(0.6);
    this.inkscapeArrow2()
}

SVGCanvas.prototype.inkscapeArrow2Mend = function() {
    this.scale(0.6);
    this.rotate(Math.PI);
    this.inkscapeArrow2();
}

SVGCanvas.prototype.inkscapeArrow2Sstart = function() {
    this.scale(0.3);
    this.inkscapeArrow2()
}

SVGCanvas.prototype.inkscapeArrow2Send = function() {
    this.scale(0.3);
    this.rotate(Math.PI);
    this.inkscapeArrow2();
}

SVGCanvas.prototype.inkscapeTail = function() {
    /*
    style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:0.8;marker-start:none;marker-end:none;stroke-linecap:round" />
    d="M -3.8048674,-3.9585227 L 0.54352094,-0.00068114835"
    d="M -1.2866832,-3.9585227 L 3.0617053,-0.00068114835"
    d="M 1.3053582,-3.9585227 L 5.6537466,-0.00068114835"
    d="M -3.8048674,4.1775838 L 0.54352094,0.21974226"
    d="M -1.2866832,4.1775838 L 3.0617053,0.21974226"
    d="M 1.3053582,4.1775838 L 5.6537466,0.21974226"
    */
    this.scale(-1.2)
    this.lineWidth = 0.8;
    this.lineJoin = 'round';
    this.beginPath();
    this.moveTo(-3.8048674,-3.9585227);
    this.lineTo(0.54352094,-0.00068114835);
    this.stroke();
    this.moveTo(-1.2866832,-3.9585227);
    this.lineTo(3.0617053,-0.00068114835);
    this.stroke();
    this.moveTo(1.3053582,-3.9585227);
    this.lineTo(5.6537466,-0.00068114835);
    this.stroke();
    this.moveTo(-3.8048674,4.1775838);
    this.lineTo(0.54352094,0.21974226);
    this.stroke();
    this.moveTo(-1.2866832,4.1775838);
    this.lineTo(3.0617053,0.21974226);
    this.stroke();
    this.moveTo(1.3053582,4.1775838);
    this.lineTo(5.6537466,0.21974226);
    this.stroke();
}


SVGCanvas.prototype.inkscapeDistance = function() {
    /*
    style="fill-rule:evenodd;stroke:#000000;stroke-width:1.0pt;marker-start:none" />
    d="M 0.0,0.0 L 5.0,-5.0 L -12.5,0.0 L 5.0,5.0 L 0.0,0.0 z "
    style="fill:none;fill-opacity:0.75000000;fill-rule:evenodd;stroke:#000000;stroke-width:1.2pt;marker-start:none" 
    d="M -14.759949,-7 L -14.759949,65"
    */
    this.translate(8,0)
    this.inkscapeArrow1()
    this.strokeWidth = 1.2;
    this.beginPath();
    this.moveTo(-14.759949,-7);
    this.lineTo(-14.759949,65);
    this.stroke();
}

SVGCanvas.prototype.inkscapeDistanceIn = function() {
    this.scale(0.6,0.6)
    this.inkscapeDistance();
}

SVGCanvas.prototype.inkscapeDistanceOut = function() {
    this.scale(-0.6,0.6)
    this.inkscapeDistance();
}

SVGCanvas.prototype.inkscapeDot = function() {
    /*
    d="M -2.5,-1.0 C -2.5,1.7600000 -4.7400000,4.0 -7.5,4.0 C -10.260000,4.0 -12.5,1.7600000 -12.5,-1.0 C -12.5,-3.7600000 -10.260000,-6.0 -7.5,-6.0 C -4.7400000,-6.0 -2.5,-3.7600000 -2.5,-1.0 z "
    style="fill-rule:evenodd;stroke:#000000;stroke-width:1.0pt;marker-start:none;marker-end:none"
    transform="scale(0.8) translate(7.125493, 1)"
    */
    this.strokeWidth = 1.0;
    this.translate(7.125493, 1);
    this.beginPath();
    this.moveTo(-2.5,-1.0);
    this.bezierCurveTo(-2.5,1.76, -4.74,4.0, -7.5,4.0);
    this.bezierCurveTo(-10.26,4.0, -12.5,1.76, -12.5,-1.0);
    this.bezierCurveTo(-12.5,-3.76, -10.26,-6.0, -7.5,-6.0);
    this.bezierCurveTo( -4.74,-6.0, -2.5,-3.76, -2.5,-1.0);
    this.closePath();
    this.fill();
    this.stroke();
}

SVGCanvas.prototype.inkscapeDot_l = function() {
    this.scale(0.8)
    this.inkscapeDot();
}

SVGCanvas.prototype.inkscapeDot_m = function() {
    this.scale(0.4)
    this.inkscapeDot();
}

SVGCanvas.prototype.inkscapeDot_s = function() {
    this.scale(0.2)
    this.inkscapeDot();
}

SVGCanvas.prototype.inkscapeSquare = function() {
    /*
    style="fill-rule:evenodd;stroke:#000000;stroke-width:1.0pt;marker-start:none"
    d="M -5.0,-5.0 L -5.0,5.0 L 5.0,5.0 L 5.0,-5.0 L -5.0,-5.0 z "
    */
    this.strokeWidth = 1.0;
    this.beginPath();
    this.moveTo(-5.0,-5.0);
    this.lineTo(-5.0,5.0);
    this.lineTo(5.0,5.0);
    this.lineTo(5.0,-5.0);
    this.lineTo(-5.0,-5.0);
    this.closePath();
    this.fill();
    this.stroke();
}

SVGCanvas.prototype.inkscapeSquareL = function() {
    this.scale(0.8)
    this.inkscapeSquare();
}

SVGCanvas.prototype.inkscapeSquareM = function() {
    this.scale(0.4)
    this.inkscapeSquare();
}

SVGCanvas.prototype.inkscapeSquareS = function() {
    this.scale(0.2)
    this.inkscapeSquare();
}


SVGCanvas.prototype.inkscapeDiamond = function() {
    /*
    style="fill-rule:evenodd;stroke:#000000;stroke-width:1.0pt;marker-start:none"
    d="M -2.1579186e-005,-7.0710768 L -7.0710894,-8.9383918e-006 L -2.1579186e-005,7.0710589 L 7.0710462,-8.9383918e-006 L -2.1579186e-005,-7.0710768 z "
    */
    this.strokeWidth = 1.0;
    this.beginPath();
    this.moveTo(0,-7.0710768);
    this.lineTo(-7.0710894,0);
    this.lineTo(0,7.0710589);
    this.lineTo(7.0710462,0);
    this.lineTo(0,-7.0710768);
    this.closePath();
    this.fill();
    this.stroke();
}

SVGCanvas.prototype.inkscapeDiamondL = function() {
    this.scale(0.8)
    this.inkscapeDiamond();
}

SVGCanvas.prototype.inkscapeDiamondM = function() {
    this.scale(0.4)
    this.inkscapeDiamond();
}

SVGCanvas.prototype.inkscapeDiamondS = function() {
    this.scale(0.2)
    this.inkscapeDiamond();
}

SVGCanvas.prototype.inkscapeTriangle = function() {
    /*
    style="fill-rule:evenodd;stroke:#000000;stroke-width:1.0pt;marker-start:none"
    d="M 5.77,0.0 L -2.88,5.0 L -2.88,-5.0 L 5.77,0.0 z "
    */
    this.strokeWidth = 1.0;
    this.beginPath();
    this.moveTo(5.77,0.0);
    this.lineTo(-2.88,5.0);
    this.lineTo(-2.88,-5.0);
    this.lineTo(5.77,0.0);
    this.closePath();
    this.fill();
    this.stroke();
}

SVGCanvas.prototype.inkscapeTriangleInL = function() {
    this.scale(-0.8)
    this.inkscapeTriangle();
}

SVGCanvas.prototype.inkscapeTriangleInM = function() {
    this.scale(-0.4)
    this.inkscapeTriangle();
}

SVGCanvas.prototype.inkscapeTriangleInS = function() {
    this.scale(-0.2)
    this.inkscapeTriangle();
}

SVGCanvas.prototype.inkscapeTriangleOutL = function() {
    this.scale(0.8)
    this.inkscapeTriangle();
}

SVGCanvas.prototype.inkscapeTriangleOutM = function() {
    this.scale(0.4)
    this.inkscapeTriangle();
}

SVGCanvas.prototype.inkscapeTriangleOutS = function() {
    this.scale(0.2)
    this.inkscapeTriangle();
}

SVGCanvas.prototype.inkscapeStop = function() {
    /*
    style="fill:none;fill-opacity:0.75000000;fill-rule:evenodd;stroke:#000000;stroke-width:1.0pt"
    d="M 0.0,5.65 L 0.0,-5.65"
    */
    this.strokeWidth = 1.0;
    this.beginPath();
    this.moveTo(0.0,5.65);
    this.lineTo(0.0,-5.65);
    this.stroke();
}

SVGCanvas.prototype.inkscapeStopL = function() {
    this.scale(0.8)
    this.inkscapeStop();
}

SVGCanvas.prototype.inkscapeStopM = function() {
    this.scale(0.4)
    this.inkscapeStop();
}

SVGCanvas.prototype.inkscapeStopS = function() {
    this.scale(0.2)
    this.inkscapeStop();
}


SVGCanvas.prototype.inkscapeSemiCircleIn = function() {
    /*
    style="fill-rule:evenodd;stroke:#000000;stroke-width:1.0pt;marker-start:none;marker-end:none"
    d="M -0.37450702,-0.045692580 C -0.37450702,2.7143074 1.8654930,4.9543074 4.6254930,4.9543074 L 4.6254930,-5.0456926 C 1.8654930,-5.0456926 -0.37450702,-2.8056926 -0.37450702,-0.045692580 z "
    */
    this.scale(0.6);
    this.strokeWidth = 1.0;
    this.beginPath();
    this.moveTo(-0.37450702,-0.045692580);
    this.bezierCurveTo(-0.37450702,2.7143074, 1.8654930,4.9543074, 4.6254930,4.9543074);
    this.lineTo(4.6254930,-5.0456926);
    this.bezierCurveTo(1.8654930,-5.0456926, -0.37450702,-2.8056926, -0.37450702,-0.045692580);
    this.closePath();
    this.fill();
    this.stroke();
}

SVGCanvas.prototype.inkscapeSemiCircleOut = function() {
    /*
    style="fill-rule:evenodd;stroke:#000000;stroke-width:1.0pt;marker-start:none;marker-end:none"
    M -2.5,-0.80913858 C -2.5,1.9508614 -4.7400000,4.1908614 -7.5,4.1908614 L -7.5,-5.8091386 C -4.7400000,-5.8091386 -2.5,-3.5691386 -2.5,-0.80913858 z
    */
    this.scale(0.6)
    this.translate(7.125493,0.763446)
    this.strokeWidth = 1.0;
    this.beginPath();
    this.moveTo(-2.5,-0.80913858);
    this.bezierCurveTo(-2.5,1.9508614, -4.7400000,4.1908614, -7.5,4.1908614);
    this.lineTo( -7.5,-5.8091386);
    this.bezierCurveTo(-4.7400000,-5.8091386, -2.5,-3.5691386, -2.5,-0.80913858);
    this.closePath();
    this.fill();
    this.stroke();
}

SVGCanvas.prototype.inkscapeSemiCurveIn = function() {
    /*
    style="fill-rule:evenodd;stroke:#000000;stroke-width:1.0pt;marker-start:none;marker-end:none;fill:none"
    d="M 4.6254930,-5.0456926 C 1.8654930,-5.0456926 -0.37450702,-2.8056926 -0.37450702,-0.045692580 C -0.37450702,2.7143074 1.8654930,4.9543074 4.6254930,4.9543074"
    */
    this.scale(0.6);
    this.strokeWidth = 1.0;
    this.beginPath();
    this.moveTo(4.6254930,-5.0456926);
    this.bezierCurveTo(1.8654930,-5.0456926, -0.37450702,-2.8056926, -0.37450702,-0.045692580);
    this.bezierCurveTo( -0.37450702,2.7143074, 1.8654930,4.9543074, 4.6254930,4.9543074);
    this.stroke();
}

SVGCanvas.prototype.inkscapeSemiCurveOut = function() {
    /*
    style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1.0pt;marker-start:none;marker-end:none"
    d="M -5.4129913,-5.0456926 C -2.6529913,-5.0456926 -0.41299131,-2.8056926 -0.41299131,-0.045692580 C -0.41299131,2.7143074 -2.6529913,4.9543074 -5.4129913,4.9543074"
    */
    this.scale(0.6);
    this.strokeWidth = 1.0;
    this.beginPath();
    this.moveTo(-5.4129913,-5.0456926);
    this.bezierCurveTo(-2.6529913,-5.0456926, -0.41299131,-2.8056926, -0.41299131,-0.045692580);
    this.bezierCurveTo(-0.41299131,2.7143074, -2.6529913,4.9543074, -5.4129913,4.9543074);
    this.stroke();
}


SVGCanvas.prototype.inkscapeSemiCurvyCross = function() {
    this.save();
    this.inkscapeSemiCurveIn()
    this.restore();
    this.inkscapeSemiCurveOut()
}


SVGCanvas.prototype.inkscapeSemiScissors = function() {
    this.beginPath();
    this.moveTo(9.0898857,-3.6061018);
    this.bezierCurveTo(8.1198849,-4.7769976, 6.3697607,-4.7358294, 5.0623558,-4.2327734 );
    this.lineTo(-3.1500488,-1.1548705 );
    this.bezierCurveTo(-5.5383421,-2.4615840, -7.8983361,-2.0874077, -7.8983361,-2.7236578 );
    this.bezierCurveTo(-7.8983361,-3.2209742, -7.4416699,-3.1119800, -7.5100293,-4.4068519 );
    this.bezierCurveTo(-7.5756648,-5.6501286, -8.8736064,-6.5699315, -10.100428,-6.4884954 );
    this.bezierCurveTo(-11.327699,-6.4958500, -12.599867,-5.5553341, -12.610769,-4.2584343 );
    this.bezierCurveTo(-12.702194,-2.9520479, -11.603560,-1.7387447, -10.304005,-1.6532027 );
    this.bezierCurveTo(-8.7816644,-1.4265411, -6.0857470,-2.3487593, -4.8210600,-0.082342643 );
    this.bezierCurveTo(-5.7633447,1.6559151, -7.4350844,1.6607341, -8.9465707,1.5737277 );
    this.bezierCurveTo(-10.201445,1.5014928, -11.708664,1.8611256, -12.307219,3.0945882 );
    this.bezierCurveTo(-12.885586,4.2766744, -12.318421,5.9591904, -10.990470,6.3210002 );
    this.bezierCurveTo(-9.6502788,6.8128279, -7.8098011,6.1912892, -7.4910978,4.6502760 );
    this.bezierCurveTo(-7.2454393,3.4624530, -8.0864637,2.9043186, -7.7636052,2.4731223 );
    this.bezierCurveTo(-7.5199917,2.1477623, -5.9728246,2.3362771, -3.2164999,1.0982979 );
    this.lineTo(5.6763468,4.2330688 );
    this.bezierCurveTo(6.8000164,4.5467672, 8.1730685,4.5362646, 9.1684433,3.4313614 );
    this.lineTo(-0.051640930,-0.053722219 );
    this.lineTo(9.0898857,-3.6061018 );
    this.closePath();
    this.moveTo(-9.2179159,-5.5066058 );
    this.bezierCurveTo(-7.9233569,-4.7838060, -8.0290767,-2.8230356, -9.3743431,-2.4433169 );
    this.bezierCurveTo(-10.590861,-2.0196559, -12.145370,-3.2022863, -11.757521,-4.5207817 );
    this.bezierCurveTo(-11.530373,-5.6026336, -10.104134,-6.0014137, -9.2179159,-5.5066058 );
    this.closePath();
    this.moveTo(-9.1616516,2.5107591);
    this.bezierCurveTo(-7.8108215,3.0096239, -8.0402087,5.2951947, -9.4138723,5.6023681 );
    this.bezierCurveTo(-10.324932,5.9187072, -11.627422,5.4635705, -11.719569,4.3902287 );
    this.bezierCurveTo(-11.897178,3.0851737, -10.363484,1.9060805, -9.1616516,2.5107591 );
    this.closePath();
    this.stroke();
}

SVGCanvas.prototype.inkscapeSemiClub = function() {
    /*
    style="fill-rule:evenodd;stroke:#000000;stroke-width:0.74587913pt;marker-start:none"
    */
    this.scale(0.6);
    this.strokeWidth = 0.74587913;
    this.beginPath();
    this.moveTo(-1.5971367,-7.0977635 );
    this.bezierCurveTo(-3.4863874,-7.0977635, -5.0235187,-5.5606321, -5.0235187,-3.6713813 );
    this.bezierCurveTo(-5.0235187,-3.0147015, -4.7851656,-2.4444556, -4.4641095,-1.9232271 );
    this.bezierCurveTo(-4.5028609,-1.8911157, -4.5437814,-1.8647646, -4.5806531,-1.8299921 );
    this.bezierCurveTo(-5.2030765,-2.6849849, -6.1700514,-3.2751330, -7.3077730,-3.2751330 );
    this.bezierCurveTo(-9.1970245,-3.2751331, -10.734155,-1.7380016, -10.734155,0.15124914 );
    this.bezierCurveTo(-10.734155,2.0404999, -9.1970245,3.5776313, -7.3077730,3.5776313 );
    this.bezierCurveTo(-6.3143268,3.5776313, -5.4391540,3.1355702, -4.8137404,2.4588126 );
    this.bezierCurveTo(-4.9384274,2.8137041, -5.0235187,3.1803000, -5.0235187,3.5776313 );
    this.bezierCurveTo(-5.0235187,5.4668819, -3.4863874,7.0040135, -1.5971367,7.0040135 );
    this.bezierCurveTo(0.29211394,7.0040135, 1.8292454,5.4668819, 1.8292454,3.5776313 );
    this.bezierCurveTo(1.8292454,2.7842354, 1.5136868,2.0838028, 1.0600576,1.5031550 );
    this.bezierCurveTo(2.4152718,1.7663868, 3.7718375,2.2973711, 4.7661444,3.8340272 );
    this.bezierCurveTo(4.0279463,3.0958289, 3.5540908,1.7534117, 3.5540908,-0.058529361); 
    this.lineTo(2.9247554,-0.10514681 );
    this.lineTo(3.5074733,-0.12845553 );
    this.bezierCurveTo(3.5074733,-1.9403966, 3.9580199,-3.2828138, 4.6962183,-4.0210121 );
    this.bezierCurveTo(3.7371277,-2.5387813, 2.4390549,-1.9946496, 1.1299838,-1.7134486 );
    this.bezierCurveTo(1.5341802,-2.2753578, 1.8292454,-2.9268556, 1.8292454,-3.6713813 );
    this.bezierCurveTo(1.8292454,-5.5606319, 0.29211394,-7.0977635, -1.5971367,-7.0977635 );
    this.closePath();
    this.fill();
    this.stroke();
}

////////////////////////////
// Class Utilities
////////////////////////////


SVGCanvas.__new__ = function (win) {

    var m = MochiKit.Base;

    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": m.concat(this.EXPORT, this.EXPORT_OK)
    };

    m.nameFunctions(this);
};

SVGCanvas.__new__(this);

//MochiKit.Base._exportSymbols(this, SVGCanvas);
