/***

MochiKit.SVGPlot 1.2

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2006 Jason Gallicchio.  All rights Reserved.


   I don't like the way current plotting programs handle things. I set out to create one that:
   * Outputs SVG and LaTeX and can easily be converted to PS and PDF
   * Works in a client-side browser for real-time manipulation of plots 
   * can hook up live data (JSON, XML, CSV)
   * server-side rendering through Mozilla's command-line JS
   * Has good features of Matlab, Mathematica, Asymptote, Ploticus, Super Mongo, GNU Plot, Origin
   * Clean programatic canvas-like interface and also clean SVG-like XML representation.
   * Reasonable defaults, but ability to tweak everything.

   Everything is object-oriented, but objects get created for you rather than 
   having to call constructors and link them in.  Complimentary like SVG DOM vs Canvas
   You can always access the objects through the scene-tree:
   SVGPlot  // Bad name for SVG, I guess.
     Layout[]  // How things are arranged  PlotCanvases are independent entities that can be moved anywhere without changing properties.
     Frame[]  // Arranged in some way 2x3 or floating, etc.
       Graphics[]  // Random circles floating around
       Ledgend[]  // List of the names of the overlays.  Auto or manual.
       Area // (x,y) coordinates where the all of the datasets get confined.
       Layer[]  // Independent sets of things all plotted over each other.  They share the same physical frame and know to shrink to accomodate each others axes.
         Grid[]  // The cartesian or polar grid or checkerboard, displayed or not displayed.
         XAxis[], YAxis[], XLabels[] XTicks[], YTicks[] // Normally you want one or none, but ability to have an array of them for related axes like both deg C and deg F.
         Dataset[] // If you have multiple line plots that all use the same axes, they get listed here.  Also area accumulations get listed here
           Range (not all functions/data get plotted over their full x-range.)
           Data, Label, Color, ColorFunction
           Decorations[] // like arrows pointing to specific places on the plot.
   This is all represented in the XML structure of the SVG with custom namespace to completly reconstruct these objects uppon load like Inkscape
    API & script commands common across languages: JS, JAva, Python, C++
    Data format just Plain XML, Plain SVG, or Combined
    Easily converted to other formats: PDF, PS, PNG
    Write quickly with small script, but have ability to modify tree later.
   Select layer by color.
   in a histogram, you want steps and not column plot.
   
   Another concept.  Rather than heirarchial, since single plots are the common case, maybe
   there should just be links to things like Axes rather than beging continaed.
   In a long array of plots, they could all be linked to the same axis rather than be
   contained in it.  This way when the axis changes, the plots do too.
   
   
// When you call something, it sets up reasonable defaults for everything else.

// autoColorIncrement = true // cycle through predefined nice default colors

// be able to pass in error bars or stock ranges with any plot
// grid lines
// grid stripes
// ledgend and/or labeling of lines

// hook up live data-sources -- JSON, XML, plain text.

   
   Programming interface concept:  Too many objects and layers, so expose each one's functionality
   to it's children and it's parents.  When you call a high-layer method on a child, it works.
   When you call a child method on a parent, it picks either the "current" one or the default (first) one.
   
   The key to adoption is good defaults.  The key to staying is extensible options.  Have Tufte inspire the defaults.
   Web page:
     -- Galery both in PNG and in JS.  JS has "Do It" button
     -- Tutorial with inline JS.  Find interesting data sources to plot.  Census, etc.
     -- Document code, document defaults.  Document which level in the heirarchy is affected with Color Overlays
   
   Layout information:  Since you've already got an array of a certain size, it makes sense to store the layout information
   in the children, but in some sense it doesn't belong there because you should be able to move children around freely.
   In this scheme you'd have to change the layout information explicitly.
   
   Actual given data should be stored in the PATH element of the SVG.
     -- Good: it's only there once and can be parsed back out. (Beseir stuff is calculated and can be calculated again.)
     -- Bad: Linewidths & Markers get scaled, so 1px no longer means 1px.
     -- Bad: Linweidths & Markers get scaled differently in x and y.
     -- Bad: Log plots and polar plots won't be able to store data this way so it's not uniform.
   Alternate method of explicit scaling, but automatic translation (and rotation).
     -- Bad: Must reverse calculate mouse coordinates.
   
   How to handle click on graphs:
     -- Want to do a trace where (x,y) or (r,th) components show up as float.
     -- Want to drag to manipulate data points (undo?) Need explicit SVG G's rather than Markers?
     -- Want to drag to move graph around.
     -- Drag on axes to zoom
          * always from origin?  For date plots this is dumb.
          * zoom uniformly to keep axis ratios fixed.
          
   Passing Parameters:
     -- Stack-based state method like Canvas
     -- Explicitly with each function like Mathematica
             plot(func, {'x', 0, 10}, {'strokeStyle':'red'} )
     -- Create objects and set properties with setter functions (so that they're updated.)
     * properties are nice for stack-based, but bad for object-based unless you're 
         in Python where you can capture the setting or willing to register callbacks
         that check if the current state is different than it was when it was drawn
         Periodic updates aren't so bad.  element['width']=10 does it this way.
     * Defaults are hard to deal wtih.  Should axes, ticks, and labels start up on
         automatically?  Sure.  Then there's a difference between setting the current
         ones and adding new ones.  When you change a parameter, does it affect the current
         axes or just the drawing of the new axes?
         
   Layout Manager
    -- Draw the axes as if they were full scale
    -- Calculate height of y-axes and width of x-axes including ticks and labels
    -- Add any margins, borders, or padding
    -- Set the actual x/y positions, width of the x-axes and height of the y-axes
    -- Render the axes
    -- Render the plot
***/


if (typeof(dojo) != 'undefined') {
    dojo.provide("MochiKit.SVGPlot");
    dojo.require("MochiKit.SVGCanvas");
}
if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Iter", []);
}

try {
    if (typeof(MochiKit.SVGCanvas) == 'undefined') {
        throw "";
    }
} catch (e) {
    throw "MochiKit.SVGPlot depends on MochiKit.SVGCanvas!";
}

if (typeof(MochiKit.SVGPlot) == 'undefined') {
    MochiKit.SVGPlot = {};
}




MochiKit.SVGPlot = function (widthOrIdOrNode /*=100*/, height /*=100*/, id /*optional*/) {
    if (arguments.length>0)
        this.__init__(widthOrIdOrNode, height, id);
    if (typeof(this.__init__)=='undefined' || this.__init__ == null) {
        log("You called SVGPlot() as a fnuction without new.  Shame on you, but I'll give you a new object anyway");
        return new MochiKit.SVGPlot(widthOrIdOrNode, height, id);  // Ends up calling this constructor again, but returning an object.
    }
    return null;
};

// Inheritance ala http://www.kevlindev.com/tutorials/javascript/inheritance/
MochiKit.SVGPlot.prototype = new MochiKit.SVGCanvas();
MochiKit.SVGPlot.prototype.constructor = MochiKit.SVGPlot;
MochiKit.SVGPlot.superclass = MochiKit.SVGCanvas.prototype;

MochiKit.SVGPlot.NAME = "MochiKit.SVGPlot";
MochiKit.SVGPlot.VERSION = "1.2";
MochiKit.SVGPlot.__repr__ = function () {
    return "[" + MochiKit.SVGPlot.NAME + " " + MochiKit.SVGPlot.VERSION + "]";
};
MochiKit.SVGPlot.prototype.__repr__ = MochiKit.SVGPlot.__repr__;

MochiKit.SVGPlot.toString = function () {
    return this.__repr__();
};
MochiKit.SVGPlot.prototype.toString = MochiKit.SVGPlot.toString;


MochiKit.SVGPlot.EXPORT = [
    "SVGPlot"
];

MochiKit.SVGPlot.EXPORT_OK = [
];


MochiKit.SVGPlot.prototype.__init__ = function (widthOrIdOrNode, height, id /*optional*/) {
    /***
        Can pass it in an SVG object, or can pass it things that the SVG constructor uses.
    ***/
    MochiKit.SVGPlot.superclass.__init__.call(this, widthOrIdOrNode, height, id);
    this.svg.whenReady( bind(this.resetPlot, this, null) );
}


MochiKit.SVGPlot.prototype.prettyNumber = function(number) {
    /***
        p.prettyNumber(3.000000000000001)
        p.prettyNumber(0.39999999999999997)
        p.prettyNumber(3.9999999999999997)
        p.prettyNumber(.9999999999999997)
    ***/
    var str = ''+number;
    if (str.length > 15) {  // TODO check for exponential
        // Chop off the last digit
        var location = str.length-2;
        if (str[location] == '0') {
            while (str[location] == '0')
                location--;
            if (str[location]=='.')
                return str.slice(0, location);
            return str.slice(0, location+1);
        }
        if (str[location]  == '9') {
            while (str[location] == '9')
                location--;
            var last = str[location];
            if (last == '.') {
                location--
                last = str[location];
            }
            return str.slice(0,location)+(parseInt(last)+1)
        }
    }
    return str;
}

MochiKit.SVGPlot.prototype.resetPlot = function() {
    log("Constructing SVGPlot in SVGPlot.reset");
    this._currentBox = null;
    //this._currentFrame = new MochiKit.SVGPlot.Frame(this)
    //this._frames = [this._currentFrame];
}

/*
MochiKit.SVGPlot.Frame = function(parentSVGPlot) {
    log("Constructing Frame parentSVGPlot=", parentSVGPlot);
    this._parentSVGPlot = parentSVGPlot;
    this._element = this._parentSVGPlot.svg.G(null);
    log("in Frame this._element=", this._element);
    this._parentSVGPlot.svg.svgElement.appendChild(this._element);
    this._currentLayer = new MochiKit.SVGPlot.Layer(this)
    this._layers = [this._currentLayer];
}

MochiKit.SVGPlot.Layer = function(parentFrame) {
    log("Constructing Layer parentFrame=", parentFrame);
    this._parentFrame = parentFrame;    
    this._element = this._parentFrame._parentSVGPlot.svg.G(null);
    log("in Layer _element=", this._element);
    log("    _element=", this._element, " this._parentFrame=", this._parentFrame);
    log("     this._parentFrame._element=", this._parentFrame._element);
    this._parentFrame._element.appendChild(this._element);
    
    this.currentYAxis = new MochiKit.SVGPlot.XAxis();
    this._xAxes = [this.currentXAxis];
    this.currentYAxis = new MochiKit.SVGPlot.YAxis();
    this._yAxes = [this.currentYAxis];
    this.currentXLabel = new MochiKit.SVGPlot.XLabel();
    this._xLabels = [this.currentXLabel];
    this.currentYLabel = new MochiKit.SVGPlot.YLabel();
    this._yLabels = [this.currentYLabel];
    this.currentXTicks = new MochiKit.SVGPlot.XTicks();
    this._xTicks = [this.currentXTicks];
    this.currentYTicks = new MochiKit.SVGPlot.YTicks();
    this._yTicks = [this.currentYTicks];
    this.currentXGrid = new MochiKit.SVGPlot.XGrid();
    this._xGrids = [this.currentXGrid];
    this.currentYGrid = new MochiKit.SVGPlot.YGrid();
    this._yGrids = [this.currentYGrid];
    this.currentHorizontalLine = new MochiKit.SVGPlot.HorizontalLine();
    this._horizontalLines = [this.currentHorizontalLine];
    this.currentVerticalLine = new MochiKit.SVGPlot.VerticalLine();
    this._verticalLines = [this.currentVerticalLine];
    //this.currentPlotDataset = new MochiKit.SVGPlot.PlotDataset();
    this._plotDatasets = []; // [this.currentPlotDataset];
}

MochiKit.SVGPlot.XAxis  = function(parent) {}
MochiKit.SVGPlot.YAxis  = function(parent) {}
MochiKit.SVGPlot.XLabel  = function(parent) {}
MochiKit.SVGPlot.YLabel  = function(parent) {}
MochiKit.SVGPlot.XTicks  = function(parent) {}
MochiKit.SVGPlot.YTicks  = function(parent) {}
MochiKit.SVGPlot.XGrid  = function(parent) {}
MochiKit.SVGPlot.YGrid  = function(parent) {}
MochiKit.SVGPlot.HorizontalLine  = function(parent) {}
MochiKit.SVGPlot.VerticalLine  = function(parent) {}
*/


MochiKit.SVGPlot.prototype._arrayToString = function(array) {
    var str = '';
    for (var i=0; i<array.length; i++) {
        if (i!=0)
            str += ' ';
        str += array[i];
    }
    return str;
}

MochiKit.SVGPlot.prototype.plotLine = function(xorydata /* ydata1, ydata2, ... */) {
    var plotNS = MochiKit.SVGPlot.plotNS;
    if (arguments.length==1) {
        // If only one argument given, treat it as a y array and plot it against the integers.
        var xdata = new Array(xorydata.length);  // ydata = xorydata;
        for (var i=0; i<xorydata.length; i++)
            xdata[i] = i;
        this.plotLine(xdata, xorydata);  // Call myself again with two arguments this time.
    }
    if (this._currentBox == null)
        this._currentBox = this._createDefaultBox();
    var xdata_str = this._arrayToString(xorydata);
    for (var data_index=1; data_index<arguments.length; data_index++) {
        // TODO Check for nulls
        var ydata_str = this._arrayToString(arguments[data_index]);
        var lineplotElement = this.svg.G(null);
        lineplotElement.setAttributeNS(plotNS, 'cmd', "lineplot");
        lineplotElement.setAttributeNS(plotNS, 'xdata', xdata_str);
        lineplotElement.setAttributeNS(plotNS, 'ydata', ydata_str);
        this._setGraphicsAttributes(lineplotElement, 'stroke');
        this._currentBox.appendChild(lineplotElement);
        this.render(); // TODO Move this down
    }
}

MochiKit.SVGPlot.prototype.plotFunction = function(func, name, xmin, xmax) {
    var POINT_COUNT = 200;
    var xdata = Array(POINT_COUNT);
    var ydata = Array(POINT_COUNT);
    var temp = {}; // a new object context to set a variable inside and have a function run. 
    for (var i=0; i<POINT_COUNT; i++) {
        temp[name] = xmin + (xmax-xmin)*i/POINT_COUNT;
        xdata[i] = temp[name];
        ydata[i] = eval.call(temp, func);
    }
    log("Calling plotLine with data");
    this.plotLine(xdata, ydata);
}



MochiKit.SVGPlot.prototype.plot = function() {
    /***
        Designed to work like canvas.stroke() where it just plots its shit into whatever 
        SVG group happens to be the canvas's currentGroup.
    ***/
    
}

MochiKit.SVGPlot.prototype._minmax = function(array) {
    var max = Number.MIN_VALUE;
    var min = Number.MAX_VALUE;
    for (var i=0; i<array.length; i++) {
        max = array[i]>max ? array[i] : max;
        min = array[i]<min ? array[i] : min;
    }
    return {'min':min, 'max':max};
}

MochiKit.SVGPlot._add = function (self, object, array, element, parentElement, currentName, constructor) {
    /***
        used all over the place to add elements to arrays and svg elements beofre or after other
        custom processing.
    ***/
    if (typeof(object)=='undefined' || object==null)
        object = new constructor();
    array.push(object);
    self[currentName] = object;
}

MochiKit.SVGPlot._remove = function(self, object, array, element, parentElement, currentName) {
    if (typeof(object) == 'undefined' || object == null)
        object = self[currentName];
    parentElement.removeChild(element);
    
    if (self[currentName] == object) {
        // JS doen't have array.remove(object)
        for(var i=0; i<array.length; i++) {
            if (array[i]==object) {
                array[i] = array[array.length-1];  // Move it to the end
                array.length--;  // Delete it.
            }
        }
        self[currentName] = (array.length>0) ? array[array.length-1] : null;  // Set current to the last item or null
    }
    return object;
}

MochiKit.SVGPlot.plotNS = "http://www.svgplot.org";
MochiKit.SVGPlot.defaultAxisStrokeWidth = 1;
MochiKit.SVGPlot.defaultMargins = 1;

MochiKit.SVGPlot.prototype._setAttrWithDefault = function (node, attr, value) {
   // If the given attribute is not set, set it to value
   var plotNS = MochiKit.SVGPlot.plotNS
   var current = node.getAttributeNS(plotNS, attr);
   if (typeof(current) == 'undefined' || current==null)
      node.setAttributeNS(plotNS, attr, value);
}

MochiKit.SVGPlot.prototype._getCommand = function (node, name) {
    var plotNS = MochiKit.SVGPlot.plotNS;
    var nodes = [];
    var groups = node.getElementsByTagName('g');
    for (var i=0; i<groups.length; i++) {
        var cmd = groups[i].getAttributeNS(plotNS, 'cmd');
        if (cmd == name) {
            nodes.push(groups[i]);
        }
    }
    return nodes;
}

MochiKit.SVGPlot.prototype.render = function () {
   this._doBoxLayout();
}

MochiKit.SVGPlot.prototype._doBoxLayout = function () {
    var plotNS = MochiKit.SVGPlot.plotNS;
    var width = parseFloat( this.svg.svgElement.getAttribute('width') );
    var height = parseFloat( this.svg.svgElement.getAttribute('height') );
    var layout = this.svg.svgElement.getAttributeNS(plotNS, 'layout');
    var layout = layout.split(' ');
    var layout_across = parseFloat( layout[0] );
    var layout_down = parseFloat( layout[1] );
    var boxes = this._getCommand(this.svg.svgElement, 'box');
    var i=0;
    var j=0;
    for (var n=0; n<boxes.length; n++) {
        if ( boxes[n].getAttributeNS(plotNS, 'float') != 'true' ) {
            boxes[n].setAttributeNS(plotNS, 'x', i*width/layout_across);
            boxes[n].setAttributeNS(plotNS, 'y', j*height/layout_down);
            boxes[n].setAttributeNS(plotNS, 'width', width/layout_across);
            boxes[n].setAttributeNS(plotNS, 'height', height/layout_down);
            i++;
            if (i == layout_across) {
                i = 0;
                j++;
            }
        }
        else {
           // Check to see if it has x, y, width, height and if not set them to be full-screen
           this._setAttrWithDefault(boxes[n], 'x', 0);
           this._setAttrWithDefault(boxes[n], 'y', 0);
           this._setAttrWithDefault(boxes[n], 'width', width);
           this._setAttrWithDefault(boxes[n], 'height', height);
        }
        this._renderBox(boxes[n]);
    }
}

MochiKit.SVGPlot.prototype._renderBox = function (box) {
    /* x, y, width, and height must all be set */
    var plotNS = MochiKit.SVGPlot.plotNS
    var width = parseFloat( box.getAttributeNS(plotNS, 'width') );
    var height = parseFloat( box.getAttributeNS(plotNS, 'height') );
    var x = parseFloat( box.getAttributeNS(plotNS, 'x') );
    var y = parseFloat( box.getAttributeNS(plotNS, 'y') );
    log("_renderBox: x = ", x, ' y = ', y, ' width = ', width, ' height = ', height);
    // Transform the box to the right place
    box.setAttributeNS(plotNS, 'transform', 'translate('+x+','+y+')');
    // Add a clipping box (optional and not yet implimented)
    
    // Find sixe of xscales and yscales
    var xscales = this._getCommand(box, 'xscale');
    var yscales = this._getCommand(box, 'yscale');
    
    if (xscales.length==0)
        xscales = [ this._createDefaultScale(box, 'x') ];
    if (yscales.length==0)
        yscales = [ this._createDefaultScale(box, 'y') ];
    
    
    // Style All Text (must do here so that bounding boxes are right.
    var texts = box.getElementsByTagName('text');
    for (var i=0; i<texts.length; i++) {
        texts[i].setAttribute('style', "font-size:12px;font-style:normal;font-weight:normal;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;font-family:Bitstream Vera Sans");
    }
    this.svg.svgElement.forceRedraw();
    
    var xScalesSize = this._calculateScalesSize(xscales, 'x');
    var yScalesSize = this._calculateScalesSize(yscales, 'y');
    
    // Find the plot area bounding box
    var top = xScalesSize.top;
    var bottom = height-xScalesSize.bottom;
    var left = yScalesSize.bottom;
    var right = width-yScalesSize.top;
    var width = right-left;
    var height = bottom-top;
    log("_renderBox: top = ", top, ' bottom = ', bottom, 'left = ', left, ' right = ', right, 
            ' width = ', width, ' height = ', height);
    //var plotArea = this.svg.G({'transform':'translate('+left+','+top+')'});
    
    // (scales, left, right, top, bottom, type)
    this._renderScales(xscales, left, right, top, bottom, 'x');
    this._renderScales(yscales, left, right, top, bottom, 'y');
    
    var xrange;  // These accumulate in order.
    var yrange;
    var xscale;
    var yscale;
    for (var i=0; i<box.childNodes.length; i++) {
        var elem = box.childNodes[i];
        if (elem.tagName=='g' && elem.getAttributeNS(plotNS, 'cmd') == 'xscale') {
            xrange = map( parseFloat, elem.getAttributeNS(plotNS, 'range').split(' ') );
            log("got xrange = ", xrange);
        }
        else if (elem.tagName=='g' && elem.getAttributeNS(plotNS, 'cmd') == 'yscale') {
            yrange = map( parseFloat, elem.getAttributeNS(plotNS, 'range').split(' ') );
            log("got yrange = ", yrange);
        }
        else if (elem.tagName=='g' && elem.getAttributeNS(plotNS, 'cmd') == 'function')
            this._renderFunctionPlot(elem, left, top, width, height, xrange, yrange);
        else if (elem.tagName=='g' && elem.getAttributeNS(plotNS, 'cmd') == 'lineplot')
            this._renderLinePlot(elem, left, top, width, height, xrange, yrange);
        else if (elem.tagName=='g' && elem.getAttributeNS(plotNS, 'cmd') == 'scatter')
            this._renderScatterPlot(elem, left, top, width, height, xrange, yrange);
    }
    //box.appendChild(plotArea);
}


MochiKit.SVGPlot.prototype._createDefaultBox = function() {
    var plotNS = MochiKit.SVGPlot.plotNS;
    var width = this.svg.svgElement.getAttribute('width');
    var height = this.svg.svgElement.getAttribute('height');
    var box = this.svg.G({'stroke-width':2});   // TODO some default parameters
    box.setAttributeNS(plotNS, 'cmd', 'box');
    box.setAttributeNS(plotNS, 'width', width);
    box.setAttributeNS(plotNS, 'height', height);
    box.setAttributeNS(plotNS, 'float', 'true');
    box.setAttributeNS(plotNS, 'x', 0);
    box.setAttributeNS(plotNS, 'y', 0);
    this.svg.svgElement.appendChild(box);
    return box;
}

MochiKit.SVGPlot._autoRangeMarginFactor = 0.05;
MochiKit.SVGPlot._defaultNumberOfTicks = 7;

// Axis options:  auto, include_zero = true, auto number=10, auto increment=5, 
MochiKit.SVGPlot.prototype._createDefaultScale = function(box, type, include_zero /* = false */) {
    var plotNS = MochiKit.SVGPlot.plotNS;
    var lineplots = this._getCommand(box, 'lineplot');
    var max = Number.MIN_VALUE;
    var min = Number.MAX_VALUE;
    for (var i=0; i<lineplots.length; i++) {
        var data = map( parseFloat, lineplots[i].getAttributeNS(plotNS, type+'data').split(' ') );
        var range = this._minmax(data);
        max = Math.max(max, range.max);
        min = Math.min(min, range.min);
    }
    if (max<min) {  // Shouldn't happen unless we didn't find any plots
        min = -10;
        max = 10;
    }
    else if (max==min) {  // All of the data were on one line (kind of taken care of below if they're not zero.)
        min = min-1;
        max = max+1;
    }
    var total = max-min;
    // If the max or min are close to zero, include zero.
    if (min>0.0 && ( min<total*MochiKit.SVGPlot._autoRangeMarginFactor ||
                      (typeof(include_zero) != 'undefined' && include_zero == true) ) )
        min = 0.0;
    if (max<0.0 && (-max<total*MochiKit.SVGPlot._autoRangeMarginFactor ||
                      (typeof(include_zero) != 'undefined' && include_zero == true) ) )
        max = 0.0;
    // If neither one lies on the origin, give them a little extra room.
    if (min!=0.0)
        min = min - total * MochiKit.SVGPlot._autoRangeMarginFactor;
    if (max!=0.0)
        max = max + total * MochiKit.SVGPlot._autoRangeMarginFactor;
    var position = (type=='x') ? "bottom" : "left";
    var range_str = min+' '+max;
    var axis = this.svg.G({'stroke-width':2,
                             'stroke':'black',
                             'stroke-opacity':1});   // TODO some default parameters
    axis.setAttributeNS(plotNS, 'cmd', "axis");
    var interval = this._defaultInterval(min, max, MochiKit.SVGPlot._defaultNumberOfTicks);
    var locations = this._defaultLocations(min, max, interval, [min, max]);
    var ticks = this._createDefaultTicks(locations, position);
    var stubs = this._createDefaultStubs(locations, position);
    var scale = this.svg.G(null, axis, ticks, stubs);
    scale.setAttributeNS(plotNS, 'cmd', type+"scale");
    scale.setAttributeNS(plotNS, 'range', range_str);
    scale.setAttributeNS(plotNS, 'position', position);
    scale.setAttributeNS(plotNS, 'type', "linear");
    box.insertBefore(scale, box.firstChild);  // TODO The second scale is always y, yet it gets inserted before x here.
    
    //var range2 = scale.getAttributeNS(plotNS, 'range')
    return scale
}


MochiKit.SVGPlot.prototype._defaultInterval = function(min, max, number) {
    /***
        return a nice spacing interval.  Nice is a power of 10,
        or a power of ten times 2, 3, or 5.  What you get out is one of:
        ..., .1, .2, .3, .5, 1, 2, 3, 5, 10, 20, 30, 50, 100, ...
    ***/
    var raw_interval = (max-min)/number;
    // First find the nearest power of ten
    var log_base10 = Math.log(raw_interval)/Math.LN10;
    var power_of_ten = Math.pow(10, Math.floor(log_base10));
    // Find what you have to multiply this nearest power of ten by to get the interval
    var increment_multiple = raw_interval/power_of_ten;
    function log_closest_to(x, array) {
        var logx = Math.log(x);
        var best_value = -1;
        var best_distance = Number.MAX_VALUE;
        for (var i=0; i<array.length; i++) {
            var log_distance = Math.abs(logx - Math.log(array[i]));
            if (log_distance<best_distance) {
                best_distance = log_distance;
                best_value = array[i];
            }
        }
        return best_value;
    }
    // Finally find the round multiple to get closest.
    var increment = power_of_ten * log_closest_to(increment_multiple, [1, 2, 3, 5, 10]);
    return increment;
}

MochiKit.SVGPlot.prototype._defaultLocations = function(min, max, interval, avoid /* = [] */, offset /* = 0*/) {
    /***
        Come up with locations for the ticks/grids/stubs, etc.
        @param min -- the actual start of the scale (can be some non-round number)
        @param max -- the actual end of the scale (can be some non-round number)
        @param interval -- the interval at which you want the ticks, usually 1, 2, 3, 5, 10, 20, etc.
        @param avoid -- an array of locations to avoid putting a mark (usually the axes and endpoints.)
        @param offset -- the ticks start counting around here (defaults to zero)
        
        @returns an array of floats which list the tick locations.
        
    ***/
    if (typeof(avoid)=='undefined' || avoid==null)
        avoid = [];
    if (typeof(offset)=='undefined' || offset==null)
        offset = 0;
    
    
    // Make sure we won't loop forever:
    interval = Math.abs(interval);
    if (interval==0)
        interval = 1;
    
    locations = [];
    var avoidance = (max-min)*MochiKit.SVGPlot._autoRangeMarginFactor;
    var mark = Math.ceil( (min-offset)/interval ) * interval + offset;
    while (mark < max) {
        var reject = false;
        for (var i=0; i<avoid.length; i++)
            if (Math.abs(mark-avoid[i]) < avoidance/2)
                reject = true;
        if ( reject==false )
            locations.push(mark)
        mark += interval;
    }
    return locations;
}

MochiKit.SVGPlot.prototype._createDefaultTicks = function(locations, position) {
    var plotNS = MochiKit.SVGPlot.plotNS;
    // TODO Make these default parameters somewhere.
    var locations_str = this._arrayToString(locations)
    var ticks = this.svg.G({'stroke':'black',
                              'stroke-width':1});
    ticks.setAttributeNS(plotNS, 'cmd', "ticks");
    ticks.setAttributeNS(plotNS, 'locations', locations_str);
    ticks.setAttributeNS(plotNS, 'length', 5);  
    ticks.setAttributeNS(plotNS, 'position', position);
    return ticks;
}

MochiKit.SVGPlot.prototype._createDefaultStubs = function(locations, position) {
    var plotNS = MochiKit.SVGPlot.plotNS
    var length = 5;
    var stroke = 'purple';
    var stubsElement = this.svg.G(null);
    stubsElement.setAttributeNS(plotNS, 'cmd', "autostubs");
    for (var i=0; i<locations.length; i++) {
        var text = this.svg.TEXT(null, this.prettyNumber(locations[i]) );
        //var text = this.svg.TEXT(null, locations[i] );
        var stub = this.svg.G(null, text);
        stub.setAttributeNS(plotNS, 'cmd', "stub");
        stub.setAttributeNS(plotNS, 'location', locations[i]);
        stub.setAttributeNS(plotNS, 'position', position);
        stubsElement.appendChild(stub);
    }
    return stubsElement;
}

MochiKit.SVGPlot.prototype._calculateScalesSize = function (scales, type) {

    // TODO: -- Add any margins, borders, or padding
    // First one gets treated differently from the rest
    var plotNS = MochiKit.SVGPlot.plotNS;
    var first_top = true;
    var first_bottom = true;
    var scaleOffsets = {'top':0, 'bottom':0};
    for (var i=0; i<scales.length; i++) {
        var sizes = this._layoutScale(scales[i], type);
        log('_calculateScalesSize: sizes.below =', sizes.below, ' sizes.above =', sizes.above);
        var position = scales[i].getAttributeNS(plotNS, 'position');
        if (position != 'none' && position != 'float') {
            if (position == 'bottom'||position=='left') {
                if (first_bottom==false)
                    scaleOffsets.bottom += sizes.above;  // Ticks and labels can portrude into the graph.
                scales[i].setAttributeNS(plotNS, 'offset', scaleOffsets.bottom)
                scaleOffsets.bottom += sizes.below;
                first_bottom = false;
            }
            if (position == 'top'||position=='right') {
                if (first_top==false)
                    scaleOffsets.top += sizes.below; 
                scales[i].setAttributeNS(plotNS, 'offset', scaleOffsets.top)
                scaleOffsets.top += sizes.above;
                first_top = false;
            }
        }
    }
    return scaleOffsets;
}

MochiKit.SVGPlot.prototype._getInheritedAttribute = function(node, attr) {
    var value = node.getAttribute(attr)
    if (typeof(value)!='undefined' && value!=null)
        return value;
    if (node.parentNode == this.svg.svgElement)
        return null;
    return this._getInheritedAttribute(node.parentNode, attr);
}

MochiKit.SVGPlot.prototype._layoutScale = function (scale, type) {
    // Determines the distance from the center of the axis of the ticks, stubs, and labels
    // returns the total above size and below size
    var plotNS = MochiKit.SVGPlot.plotNS;
    var margin = 1;  // TODO Margin
    var sizes = {'above':0, 'below':0};
    log('_layoutScale: sizes.below =', sizes.below, ' sizes.above =', sizes.above);
    
    var axes = this._getCommand(scale, 'axis');
    var axis_thickness = 0;
    for (var j=0; j<axes.length; j++) {
        var stroke_width = parseFloat( this._getInheritedAttribute(axes[j], 'stroke-width') );
        axis_thickness = Math.max(axis_thickness, stroke_width);
    }
    sizes.above += axis_thickness/2;
    sizes.below += axis_thickness/2;
    log('_layoutScale after axes: sizes.below =', sizes.below, ' sizes.above =', sizes.above);
    
    // Add up the space that ticks take up, but only if they are not covering the graph.
    var tick_above = 0;
    var tick_below = 0;
    var ticks = this._getCommand(scale, 'ticks');
    for (var j=0; j<ticks.length; j++) {
        var length = parseFloat( ticks[j].getAttributeNS(plotNS, 'length') );
        var tick_position = ticks[j].getAttributeNS(plotNS, 'position');
        if (tick_position=='top' || tick_position=='right') {
            ticks[j].setAttributeNS(plotNS, 'offset', sizes.above);
            tick_above = Math.max(tick_above, length+margin);
        }
        if (tick_position=='bottom' || tick_position=='left') {
            ticks[j].setAttributeNS(plotNS, 'offset', sizes.below);
            tick_below = Math.max(tick_below, length+margin);
        }
    }
    sizes.above += tick_above;
    sizes.below += tick_below;
    
    // Add up the space that stubs take up, but only if they are not covering the graph.
    
    
    layoutText = function(text) {
        var above = 0;
        var below = 0;
        for (var j=0; j<text.length; j++) {
            var size;
            var bbox = text[j].getBBox();
            // Potential problem that BBox could only work if it's being shown
            if (type=='x') {
                size = bbox.height;
                // TODO Set the text layout to be ancored on the top/bottom
            }
            else if (type=='y') {
                size = bbox.width;
                // TODO Set the text layout to be ancored on the left/right
            }
            var position = text[j].getAttributeNS(plotNS, 'position');
            log('bbox.width = ', bbox.width, ' bbox.height = ', bbox.height, 
                    ' position = ', position, ' size = ', size);
            if (position=='top' || position=='right') {
                text[j].setAttributeNS(plotNS, 'offset', sizes.above);
                above = Math.max(above, size+margin);
            }
            if (position=='bottom' || position=='left') {
                text[j].setAttributeNS(plotNS, 'offset', sizes.below);
                below = Math.max(below, size+margin);
            }
        }
        sizes.above += above;
        sizes.below += below;
        return sizes;
    }
    
    layoutText(this._getCommand(scale, 'stub'));
    layoutText(this._getCommand(scale, 'label'));
    
    return sizes;
}


MochiKit.SVGPlot.prototype._renderScales = function (scales, left, right, top, bottom, type) {
    var plotNS = MochiKit.SVGPlot.plotNS;
    for (var i=0; i<scales.length; i++) {
        var position = scales[i].getAttributeNS(plotNS, 'position');
        var offset = parseFloat( scales[i].getAttributeNS(plotNS, 'offset') );
        var translate_x = 1;
        var translate_y = 1;
        if (position=='top')
            translate_y = top-offset;
        else if (position=='bottom')
            translate_y = bottom+offset;
        else if (position=='left')
            translate_x = left-offset;
        else if (position=='right')
            translate_x = right+offset;
        else {
            // Axis is on the graph
        }
        var length;
        if (type=='x') {
            translate_x = left;
            length = right-left;
        }
        else if (type=='y') {
            translate_y = bottom;
            length = bottom-top;
        }
        else {
            log("ERROR Bad type passed to _renderScales");
            return
        }
        log("_renderScales position =", position, 'offset = ', offset, 
                'tx = ', translate_x, 'ty = ', translate_y, '(', left, right, top, bottom, ')');
        scales[i].setAttribute('transform', 'translate('+translate_x+', '+translate_y+')');
        this._renderScale(scales[i], length, type);
    }
}

MochiKit.SVGPlot.prototype._renderScale = function (scale, length, type) {
    // Just render it as if you start at the origin.  A transform has already been applied
    // Different namespace for calculated/default versus explicitly defined attributes.
    // TODO Something about the corners where the axes meet.
    // TODO Add in margins
    // TODO Grid lines
    // TODO Maybe move the ticks to along the zero-line rather than taking into account the axis thickness.
    // TODO Defaults
    // TODO Make styles consistent with current stroke and fill styles
    var plotNS = MochiKit.SVGPlot.plotNS;

    var range = map( parseFloat, scale.getAttributeNS(plotNS, 'range').split(' ') );
    var length_scale = length/(range[1]-range[0]);
    
    var axes = this._getCommand(scale, 'axis');
    log("_renderScale axes.length = ", axes.length);
    for (var j=0; j<axes.length; j++) {
        // Get linerange or take it to be full
        
        var path;
        if (type=='x')
            path = 'M 0,0 H '+length;
        else if (type=='y')
            path = 'M 0,0 V '+-length;
        else {
            log("ERROR Bad type passed to _getCommand");
            return
        }
        //axes[j].setAttributeNS(plotNS, 'd', path);
        axes[j].appendChild( this.svg.PATH({'d':path}) );
        log("axis apending path:", path); 
    }
    // TODO Defaults for position.
    var ticks = this._getCommand(scale, 'ticks');
    for (var j=0; j<ticks.length; j++) {
        var offset = parseFloat( ticks[j].getAttributeNS(plotNS, 'offset') );
        var length = parseFloat( ticks[j].getAttributeNS(plotNS, 'length') );
        var locations = map(parseFloat, ticks[j].getAttributeNS(plotNS, 'locations').split(' ') );
        var position = ticks[j].getAttributeNS(plotNS, 'position');
        var path = '';
        for (var k=0; k<locations.length; k++) {
            var scaled = length_scale*(locations[k]-range[0]);
            if (position=='top')
                path += ' M '+scaled+' '+(-offset)+'v '+(-length);
            else if (position=='bottom')
                path += ' M '+scaled+' '+(offset)+'v '+(length);
            else if (position=='right')
                path += ' M '+offset+' '+(-scaled)+'h '+(length);
            else if (position=='left')
                path += ' M '+(-offset)+' '+(-scaled)+'h '+(-length);
        }
        ticks[j].appendChild( this.svg.PATH({'d':path}) );
        log("ticks apending path:", path); 
    }
    
    function renderText(text) {
        for (var j=0; j<text.length; j++) {
            var offset = parseFloat( text[j].getAttributeNS(plotNS, 'offset') );
            var location = parseFloat( text[j].getAttributeNS(plotNS, 'location') );  // TODO Handle location for labels differently.
            var position = text[j].getAttributeNS(plotNS, 'position');
            var bbox = text[j].getBBox();
            var scaled = length_scale*(location-range[0]);
            if (position=='top')
                text[j].setAttribute('transform', 'translate('+(scaled-bbox.width/2-1)+', '+(-offset)+')');
            else if (position=='bottom')
                text[j].setAttribute('transform', 'translate('+(scaled-bbox.width/2-1)+', '+(offset+bbox.height)+')');
            else if (position=='right')
                text[j].setAttribute('transform', 'translate('+(offset-1)+', '+(-scaled+bbox.height/2)+')');
            else if (position=='left')
                text[j].setAttribute('transform', 'translate('+(-offset-bbox.width-1)+', '+(-scaled+bbox.height/2)+')');
        }
    }
    
    renderText( this._getCommand(scale, 'stub') );
    renderText( this._getCommand(scale, 'label') );
}

MochiKit.SVGPlot.prototype._renderLinePlot = function (linePlot, left, top, plotAreaWidth, plotAreaHeight, xrange, yrange) {
    /***
        Designed to work like canvas.stroke() where it just plots its shit into whatever 
        SVG group happens to be the canvas's currentGroup.
    ***/
    var plotNS = MochiKit.SVGPlot.plotNS;
    
    var xscale = plotAreaWidth/(xrange[1]-xrange[0]);
    var yscale = plotAreaHeight/(yrange[1]-yrange[0]);
    log("xscale = ", xscale, "  yscale = ", yscale);
    
    var xdata = map( parseFloat, linePlot.getAttributeNS(plotNS, 'xdata').split(' ') );
    var ydata = map( parseFloat, linePlot.getAttributeNS(plotNS, 'ydata').split(' ') );
    log("xdata = ", xdata, "  ydata = ", ydata);
    
    this.save();
    this.applyStyles = false;
    
    this.setGroup(linePlot);
    //var rect = this.getDatasetRect();
    //this.clipRect(0, 0, rect.width, rect.height);
    //this.translate(rect.x, rect.y);
    //plotDataset.plot();
    
    // Should really loop through and draw one point off of each side if it exists.
    // Maybe not becuase you can plot arbitrary loopy xy sets and make 
    // crazy lines which can exit and enter, so SVG should have all points.
    this.translate(left, top+plotAreaHeight);
    //this.translate(0,plotAreaHeight);
    this.scale(1,-1);
    this.beginPath();
    // Handle infinite and NaN properly.
    var drawingFunction = this.moveTo;
    // TODO Handle cases where the plot goes WAY off the current scales.
    for (i=0; i<ydata.length; i++) {
        var sx = xscale*(xdata[i]-xrange[0]);
        var sy = yscale*(ydata[i]-yrange[0]);
        if (sx!=Number.NaN  && sx!=Number.MAX_VALYE && sx!=Number.MIN_VALUE &&
            sy!=Number.NaN && sy!=Number.MAX_VALYE && sy!=Number.MIN_VALUE) {
                drawingFunction.call(this, sx, sy);
                log("Plotting point ("+sx+","+sy+")");
                drawingFunction = this.lineTo;
        }
    }
    var plot = this.stroke();
    // Add our own stuff to the attributes produced.
    
    this.restore();
    return plot;
}


// set add delete replace actions

// plotLine(xdata, ydata)  // If xdata is the same as current overlay, adds ydata to it.  Otherwise creates new overlay.
// plotLine(ydata)  // Uses current xdata in overlay or automatically creates (0,1,2,3,...) or (1,2,3,4,...)
// plotSmooth(ydata)
// plotStock(data)
// plotBoxAndWhisker()  // Zeba's statistical (min, 25%, median, 75%, max) Good instead of 100 histograms.
// plotStackedArea()
// plotPercentageArea()
// plotClusteredBar()  // Different categories are next to each other
// plotStackedBar()
// plotPercentBar()
// plotClusteredColumn()
// plotStackedColumn()
// plotPercentColumn()
// plotHistogram(data, bins)
// plotFunction(func, x, min, max)  // defines sin, cos, etc in context and does eval()
// plotScatter(datax, datay)  // dots proportional to size, dots with error bars in y and/or x, dots with error areas.
// plotPie(data, /* optional labels */)
// plotPolar()  // similar implimentation to plotPie
// plotParametric()

// independent vertical scales on same plot for different types of data overlayed
// that have the same x-axis.  Dependent scales like foot and meter.

// Be able to set defaults for all plots.
// defaultColor = 'auto-increment'
// defaultXAxis = 'auto'

// At any point be able to print out your "context" -- the path into the tree where you're working.

// 
// addColorFunction() // for complex plots and such.
// setColor()
// setDashes(a, b, c, ...)  // List the stroke-dasharray explicitly 
// setDashOffset(offset)
// setAxisDirection('up') // 'down' 'right' 'left'  for screen graphics and non-western hotties.
// addXAxis()  // To get more than the default.
// setXAxisLocation('edge')  // These return an Axis list so you can set currentAxis yourself
// setXAxisLocation('zero')  // For classic sin(x) plots
// setXAxisLocation('box')
// replaceAxis(axesToReplace /* optional */) // If no parameter is given, all axes replaced
// deleteAxis()
// setXTicks('linear')  // Assumes default axis otherwise you can change currentAxis
// setXTicks('linear', everyn, offset)  // Multiples of pi, Months, time, 10^1, 10^2...
// setXTicks('log')  // Minor ticks bunch up toward the regularly spaced big ticks.
// setXTicks('log', everyn offset)
// setXTicks(list)
// repeated for setMinorXTicks()
// setXGridLines(/*same as above*/)   // Gridlines is not a word. Grid might not be enough.
// setYGridLines()
// addXGridLines()  // Add another set, possibly with a different spacing, usually for specific lines.
// setXGridLinesStyle('light-grey')
// setXMinorGridLines(/*same as above*/)
// addHorizontalLine()  // For a horizontal line across at a specific x location.  Just like gridlines, but only one.
// addVerticalLine()  // For a horizontal line across at a specific x location.


// labelXAxis('linear')
// ... same as Ticks plus one more:
// labelXAxis(data, values)

var SVGPlot = MochiKit.SVGPlot;