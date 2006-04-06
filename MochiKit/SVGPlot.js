/***

SVGPlot 1.2

See <http://com/> for documentation, downloads, license, etc.

(c) 2006 Jason Gallicchio.  All rights Reserved.


   I don't like the way  plotting programs handle things. I set out to create one that:
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
     Box[]  // Arranged in some way 2x3 or floating, etc.
       Graphics[]  // Random circles floating around
       Ledgend[]  // List of the names of the overlays.  Auto or manual.
       Area // (x,y) coordinates where the all of the datasets get confined.
       Range[]  // Independent sets of things all plotted over each other.  They share the same physical frame and know to shrink to accomodate each others axes.
         Grid[]  // The cartesian or polar grid or checkerboard, displayed or not displayed.
         XAxis[], YAxis[], XLabels[] XTicks[], YTicks[] // Normally you want one or none, but ability to have an array of them for related axes like both deg C and deg F.
         Plot[] // If you have multiple line plots that all use the same axes, they get listed here.  Also area accumulations get listed here
           Range (not all functions/data get plotted over their full x-range.)
           Data, Label, Color, ColorFunction
           Decorations[] // like arrows pointing to specific places on the plot.
   This is all represented in the XML structure of the SVG with custom namespace to completly reconstruct these objects uppon load like Inkscape
    API & script commands common across languages: JS, JAva, Python, C++
    Data format just Plain XML, Plain SVG, or Combined
    Easily converted to other formats: PDF, PS, PNG
    Write quickly with small script, but have ability to modify tree later.
   Select plot or layer by color (or some other characteristic) rather than reference.
   in a histogram, you want steps and not column plot.
   
   Another concept.  Rather than heirarchial, since single plots are the common case, maybe
   there should just be links to things like Axes rather than beging continaed.
   In a long array of plots, they could all be linked to the same axis rather than be
   contained in it.  This way when the axis changes, the plots do too.
   
   
   When you call something, it sets up reasonable defaults for everything else.

   autoColorIncrement = true // cycle through predefined nice default colors

   be able to pass in error bars or stock ranges with any plot
   ledgend and/or labeling of plots
   
   Programming interface concept:  Too many objects and layers, so expose each one's functionality
   to it's children and it's parents.  When you call a high-layer method on a child, it works.
   When you call a child method on a parent, it picks either the "" one or the default (first) one.
   
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
          
   Ways to pass parameters:
     -- Stack-based state method like Canvas
     -- Explicitly with each function like Mathematica
             plot(func, {'x', 0, 10}, {'strokeStyle':'red'} )
     -- Create objects and set properties with setter functions (so that they're updated.)
     * properties are nice for stack-based, but bad for object-based unless you're 
         in Python where you can capture the setting or willing to register callbacks
         that check if the  state is different than it was when it was drawn
         Periodic updates aren't so bad.  element['width']=10 does it this way.
     * Defaults are hard to deal wtih.  Should axes, ticks, and labels start up on
         automatically?  Sure.  Then there's a difference between setting the 
         ones and adding new ones.  When you change a parameter, does it affect the 
         axes or just the drawing of the new axes?
         
   Layout Manager
    -- Draw the axes as if they were full scale
    -- Calculate height of y-axes and width of x-axes including ticks and labels
    -- Add any margins, borders, or padding
    -- Set the actual x/y positions, width of the x-axes and height of the y-axes
    -- Render the axes
    -- Render the plot
    
  TODO
    -- floating axes, drawing on the graph, the plots.
    -- Make all lits both comma or space seperated like in SVG.
    -- Markers (though this is really more of a Canvas thing)
    -- Scatter plot is line plot with transparent stroke, but with markers?
    -- Grid lines like ticks.  Extended ticks?
    -- Tests with multiple boxes and box layout.
    -- Be able to draw using lineTo and things using plot coordinates, not screen coordinates. 
    -- CSS Colors and Fonts
    -- Move stubs to fit on plot or make plot bigger to accomodate stubs
    -- Moving JS objects around should move XML elements around at render time.  This is not done to cache them
    -- Check range for zeros better.
    -- When axes are created automatically as a result of a plot command, they should get the default style
    -- Box background and plot area background.
    -- Grids -- lines or stripes.
    -- Axes, ticks, and grids align themselves to nearest pixel.
    -- Smooth connect lines
    -- Autorange so that at least the line-width fits.
    -- Plot title
***/


if (typeof(dojo) != 'undefined') {
    dojo.provide("SVGPlot");
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
    throw "SVGPlot depends on SVGCanvas!";
}

if (typeof(SVGPlot) == 'undefined') {
    SVGPlot = {};
}


SVGPlot = function (widthOrIdOrNode /*=100*/, height /*=100*/, id /*optional*/) {
    if (arguments.length>0)
        this.__init__(widthOrIdOrNode, height, id);
    if (typeof(this.__init__)=='undefined' || this.__init__ == null) {
        //log("You called SVGPlot() as a fnuction without new.  Shame on you, but I'll give you a new object anyway");
        return new SVGPlot(widthOrIdOrNode, height, id);  // Ends up calling this constructor again, but returning an object.
    }
    return null;
};

// Inheritance ala http://www.kevlindev.com/tutorials/javascript/inheritance/
SVGPlot.prototype = new SVGCanvas();
SVGPlot.prototype.constructor = SVGPlot;
SVGPlot.superclass = SVGCanvas.prototype;

SVGPlot.NAME = "SVGPlot";
SVGPlot.VERSION = "1.2";
SVGPlot.__repr__ = function () {
    return "[" + SVGPlot.NAME + " " + SVGPlot.VERSION + "]";
};
SVGPlot.prototype.__repr__ = SVGPlot.__repr__;

SVGPlot.toString = function () {
    return this.__repr__();
};
SVGPlot.prototype.toString = SVGPlot.toString;


SVGPlot.EXPORT = [
    "SVGPlot"
];

SVGPlot.EXPORT_OK = [
];




















SVGPlot.plotNS = "http://www.svgplot.org";
SVGPlot.defaultAxisStrokeWidth = 1;
SVGPlot.defaultMargins = 0;
SVGPlot.defaultTickLength = 2;


SVGPlot.prototype.__init__ = function (widthOrIdOrNode, height, id /*optional*/) {
    /***
        Can pass it in an SVG object, or can pass it things that the SVG constructor uses.
    ***/
    SVGPlot.superclass.__init__.call(this, widthOrIdOrNode, height, id);
    this.svg.whenReady( bind(this.resetPlot, this, null) );
}


SVGPlot.prototype.resetPlot = function() {
    // SVGCanvas already has a reset()
    //log("Constructing SVGPlot in SVGPlot.reset");
    this.boxes = []
    this.box = null;
    this.element = this.svg.svgElement;
    //this.fontFamily = "Verdana, Arial, Helvetica, Sans";
    this.fontFamily = "Bitstream Vera Sans";
    this.fontSize = '7px';
}


// Constructors

// All objects have an element and svgPlot member.


SVGPlot.Box = {}                // box
    SVGPlot.Range = {}          // range
        SVGPlot.LinePlot = {}   // plot
        SVGPlot.Scale = {}      // xScale, yScale
            SVGPlot.Axis = {}   // xAxis, yAxis
            SVGPlot.Ticks = {}  // xTicks, yTicks
            SVGPlot.Stubs = {}  // xStubs, yStubs
            SVGPlot.Label = {}  // xLabel, yLabel

SVGPlot.Box.prototype = {}                // box
    SVGPlot.Range.prototype = {}          // range
        SVGPlot.LinePlot.prototype = {}   // plot
        SVGPlot.Scale.prototype = {}      // xScale, yScale
            SVGPlot.Axis.prototype = {}   // xAxis, yAxis
            SVGPlot.Ticks.prototype = {}  // xTicks, yTicks
            SVGPlot.Stubs.prototype = {}  // xStubs, yStubs

/*
Setters set properties of current object.
    If the current object doesnt' exist, it creates a new one
    If you pass in null or don't pass anything retains current value.
        If the current value doesn't exist, it choses a reasonable default value.
Adders create a new object, add it to the appropariate array, and call the Setter.
Removers remove the object.
*/

// Plotting Commands

SVGPlot.genericConstructor = function(self, svgPlot, parent) {
    self.svgPlot = svgPlot;
    self.parent = parent;
    self.element = null;
    self._style = svgPlot.getState();
}


//SVGPlot.prototype.plot = function() {
//  This has the same name as the "currentPlot"
//    /***
//        Designed to work like canvas.stroke() where it just plots its shit into whatever 
//        SVG group happens to be the canvas's Group.
//    ***/    
//}

SVGPlot.prototype.plotLine = function(xorydata /* ydata1, ydata2, ... */) {

    if (arguments.length==1) {
        // If only one argument given, treat it as a y array and plot it against the integers.
        var xdata = new Array(xorydata.length);  // ydata = xorydata;
        for (var i=0; i<xorydata.length; i++)
            xdata[i] = i;
        this.plotLine(xdata, xorydata);  // Call myself again with two arguments this time.
    }
    
    if (this.box == null) {
        this.addBox();
        this.addBoxDefaults();
    }
    
    for (var i=1; i<arguments.length; i++)
        this.plot = new SVGPlot.LinePlot(this, this.range, xorydata, arguments[i]);
    return this.plot;  // Last line plot.  Not of much use, really.
}

SVGPlot.LinePlot = function(svgPlot, parent, xdata, ydata) {
    SVGPlot.genericConstructor(this, svgPlot, parent);
    parent.plots.push(this)
    this.xdata = xdata;
    this.ydata = ydata;
}


SVGPlot.prototype.setPlotStyle = function() {
    this.plot._style = this.getState();
}

SVGPlot.LinePlot.prototype.updateExtents = function(xExtents, yExtents) {
    /***
        used for auto-range
    ***/
    var xrange = SVGPlot.minmax(this.xdata)
    xExtents.min = Math.min(xExtents.min, xrange.min)
    xExtents.max = Math.max(xExtents.max, xrange.max)
    var yrange = SVGPlot.minmax(this.ydata)
    yExtents.min = Math.min(yExtents.min, yrange.min)
    yExtents.max = Math.max(yExtents.max, yrange.max)
}

SVGPlot.prototype.plotFunction = function(func, name, xmin, xmax) {
    var POINT_COUNT = 200;
    var xdata = Array(POINT_COUNT);
    var ydata = Array(POINT_COUNT);
    var temp = {}; // a new object context to set a variable inside and have a function run. 
    for (var i=0; i<POINT_COUNT; i++) {
        temp[name] = xmin + (xmax-xmin)*i/POINT_COUNT;
        xdata[i] = temp[name];
        ydata[i] = eval.call(temp, func);
    }
    //log("Calling plotLine with data");
    return this.plotLine(xdata, ydata);
    // Maybe this should be in a <plotFunction> <plotLine/> <plotFunction>
}


// Box


SVGPlot.prototype.setBox = function(layout /* ='float' */, x /* =0 */, y /* =0 */, width /* =svgWidth */, height /* =svgHeight */) {
    this.box.x = SVGPlot.firstNonNull(x, this.box.x, 0);
    this.box.y = SVGPlot.firstNonNull(y, this.box.y, 0);
    this.box.width  = SVGPlot.firstNonNull(width,  this.box.width,  
                            parseFloat(this.svg.svgElement.getAttribute('width')));
    this.box.height = SVGPlot.firstNonNull(height, this.box.height, 
                            parseFloat(this.svg.svgElement.getAttribute('height')));
}

SVGPlot.prototype.setBoxStyle = function() {
    this.box._style = this.getState();
}

SVGPlot.prototype.addBox  = function(layout /* ='float' */, x /* =0 */, y /* =0 */, width /* =svgWidth */, height /* =svgHeight */)  {
    this.box = new SVGPlot.Box(this, this);
    this.setBox(layout, x, y, width, height);
    return this.box;
}

SVGPlot.prototype.addBoxDefaults = function() {
    this.addRange();
    this.addRangeDefaults();
}

//SVGPlot.Box = function(svgPlot, element)
SVGPlot.Box = function(svgPlot, parent) {
    SVGPlot.genericConstructor(this, svgPlot, parent);
    parent.boxes.push(this)
    this.ranges = [];
}

// Range


SVGPlot.prototype.setXRange = function(xmin /* ='auto' */, xmax /* ='auto' */) {
    if (this.range == null)
        this.addRange(xmin, xmax);
    this.range.xmin = SVGPlot.firstNonNull(xmin, this.range.xmin, 'auto');
    this.range.xmax = SVGPlot.firstNonNull(xmax, this.range.xmax, 'auto');
}

SVGPlot.prototype.setYRange = function(ymin /* ='auto' */, ymax /* ='auto' */) {
    if (this.range == null)
        this.addRange(null, null, ymin, ymax);
    this.range.ymin = SVGPlot.firstNonNull(ymin, this.range.ymin, 'auto');
    this.range.ymax = SVGPlot.firstNonNull(ymax, this.range.ymax, 'auto');
}

SVGPlot.prototype.setRange = function(xmin /* ='auto' */, xmax /* ='auto' */, ymin /* ='auto' */, ymax /* ='auto' */) {
    this.setXRange(xmin, xmax);
    this.setYRange(ymin, ymax);
}

SVGPlot.prototype.setRangeStyle = function() {
    this.range._style = this.getState();
}

SVGPlot.prototype.addRange = function(xmin /* ='auto' */, xmax /* ='auto' */, ymin /* ='auto' */, ymax /* ='auto' */) { 
    this.range = new SVGPlot.Range(this, this.box);
    this.setRange(xmin, xmax, ymin, ymax);
    return this.range;
}


SVGPlot.prototype.addRangeDefaults = function() {
    this.addXAxis();
    this.addXAxisDefaults();
    this.addYAxis();
    this.addYAxisDefaults();
}

SVGPlot.Range = function(svgPlot, parent) {
    SVGPlot.genericConstructor(this, svgPlot, parent);
    parent.ranges.push(this);
    this.xAxes = [];
    this.yAxes = [];
    this.plots = [];
}

// Axis

SVGPlot.prototype.setXAxis = function(position /* 'bottom' */, scale_type /* ='lnear' */) {
    if (this.xAxis == null)
        this.addXAxis(position, scale_type);
    this.xAxis.type = 'x'
    this.xAxis.position = SVGPlot.firstNonNull(position, this.xAxis.position, 'bottom');
    this.xAxis.scale_type = SVGPlot.firstNonNull(scale_type, this.xAxis.scale_type, 'linear');
}

SVGPlot.prototype.setYAxis = function(position /* 'left' */, scale_type /* ='lnear' */) {
    if (this.yAxis == null)
        this.addYAxis(position, scale_type);
    this.yAxis.type = 'y';
    this.yAxis.position = SVGPlot.firstNonNull(position, this.yAxis.position, 'left');
    this.yAxis.scale_type = SVGPlot.firstNonNull(scale_type, this.xAxis.scale_type, 'linear');
}

SVGPlot.prototype.setXAxisStyle = function() {
    this.xAxis._style = this.getState();
}

SVGPlot.prototype.setYAxisStyle = function() {
    this.yAxis._style = this.getState();
}

SVGPlot.prototype.addXAxis = function(position /* 'bottom' */, scale_type /* ='lnear' */) {
    this.xAxis = new SVGPlot.Axis(this, this.range);
    this.setXAxis(position, scale_type);
    this.range.xAxes.push(this.xAxis);
    return this.xAxis;
}

SVGPlot.prototype.addYAxis = function(position /* 'left' */, scale_type /* ='lnear' */) {
    this.yAxis = new SVGPlot.Axis(this, this.range);
    this.setYAxis(position, scale_type);
    this.range.yAxes.push(this.yAxis);
    return this.yAxis;
}

SVGPlot.Axis = function(svgPlot, parent) {
    SVGPlot.genericConstructor(this, svgPlot, parent);
    this.ticks = [];
    this.stubs = [];
    this.labels = [];
}

SVGPlot.prototype.addXAxisDefaults = function() {
    this.addXTicks();
    this.addXStubs();
}

SVGPlot.prototype.addYAxisDefaults = function() {
    this.addYTicks();
    this.addYStubs();
}

// Ticks

SVGPlot.prototype.setXTicks = function(locs /*='auto'*/, position /* ='bottom' */, length /* =2 */) {
    if (this.xTicks == null)
        this.addXTicks(locs, position, length);
    this.xTicks.locs = SVGPlot.firstNonNull(locs, this.xTicks.locs, 'auto');
    this.xTicks.position = SVGPlot.firstNonNull(position, this.xTicks.position, 'bottom');
    this.xTicks.length = SVGPlot.firstNonNull(length, this.xTicks.length, SVGPlot.defaultTickLength);
}

SVGPlot.prototype.setYTicks = function(locs /*='auto'*/, position /* ='left' */, length /* =2 */) {
    if (this.yTicks == null)
        this.addYTicks(locs, position, length);
    this.yTicks.locs = SVGPlot.firstNonNull(locs, this.yTicks.locs, 'auto');
    this.yTicks.position = SVGPlot.firstNonNull(position, this.yTicks.position, 'left');
    this.yTicks.length = SVGPlot.firstNonNull(length, this.yTicks.length, SVGPlot.defaultTickLength);
}

SVGPlot.prototype.setXTicksStyle = function() {
    this.xTicks._style = this.getState();
}

SVGPlot.prototype.setYTicksStyle = function() {
    this.yTicks._style = this.getState();
}

SVGPlot.prototype.removeXTicks = function() {
    
}

SVGPlot.prototype.removeYTicks = function() {
    
}

SVGPlot.prototype.addXTicks = function(locs /*='auto'*/, position /* ='left' */, length /* =2 */) {
    this.xTicks = new SVGPlot.Ticks(this, this.xAxis);
    this.setXTicks(locs, position, length);
    this.xAxis.ticks.push(this.xTicks);
    return this.xTicks;
}

SVGPlot.prototype.addYTicks = function(locs /*='auto'*/, position /* ='left' */, length /* =2 */) {
    this.yTicks = new SVGPlot.Ticks(this, this.yAxis);
    this.setYTicks(locs, position, length);
    this.yAxis.ticks.push(this.yTicks);
    return this.yTicks;
}

SVGPlot.Ticks = function(svgPlot, parent) {
    SVGPlot.genericConstructor(this, svgPlot, parent);
}

// Stubs

SVGPlot.prototype.setXStubs = function(locs /* ='auto'*/, labels /* = toString(locs) */, position /* ='bottom' */) {
    if (this.xStubs == null)
        this.addXStubs(locs, position, length);
    this.xStubs.locs = SVGPlot.firstNonNull(locs, this.xStubs.locs, 'auto');
    this.xStubs.labels = SVGPlot.firstNonNull(labels, this.xStubs.labels, 'auto');
    this.xStubs.position = SVGPlot.firstNonNull(position, this.xStubs.position, 'bottom');
}

SVGPlot.prototype.setYStubs = function(locs /* ='auto'*/, labels /* = toString(locs) */, position /* ='bottom' */) {
    if (this.yStubs == null)
        this.addYStubs(locs, position, length);
    this.yStubs.locs = SVGPlot.firstNonNull(locs, this.yStubs.locs, 'auto');
    this.yStubs.labels = SVGPlot.firstNonNull(labels, this.yStubs.labels, 'auto');
    this.yStubs.position = SVGPlot.firstNonNull(position, this.yStubs.position, 'left');
}

SVGPlot.prototype.setXStubsStyle = function() {
    this.xStubs._style = this.getState();
}

SVGPlot.prototype.setYStubsStyle = function() {
    this.yStubs._style = this.getState();
}

/*
// Right now this doesn't work in Firefox.
SVGPlot.prototype.setStubsStyle = function(stubs) {
    this._copyState(stubs._style, this);
    if (stubs.position=='top' || stubs.position=='bottom')
        stubs._style.textAnchor = 'middle'
    else if (stubs.position=='left')
        stubs._style.textAnchor = 'right'
    else if (stubs.position=='right')
        stubs._style.textAnchor = 'left'
}
*/

SVGPlot.prototype.removeXStubs = function() {
    
}

SVGPlot.prototype.removeYStubs = function() {
    
}

SVGPlot.prototype.addXStubs = function(locs /* ='auto'*/, labels /* = toString(locs) */, position /* ='bottom' */) {
    this.xStubs = new SVGPlot.Stubs(this, this.xAxis);
    this.setXStubs(locs, labels, position);
    this.xAxis.stubs.push(this.xStubs);
    return this.xStubs;
}

SVGPlot.prototype.addYStubs = function(locs /* ='auto'*/, labels /* = toString(locs) */, position /* ='bottom' */) {
    this.yStubs = new SVGPlot.Stubs(this, this.yAxis);
    this.setYStubs(locs, labels, position);
    this.yAxis.stubs.push(this.yStubs);
    return this.yStubs;
}

SVGPlot.Stubs = function(svgPlot, parent) {
    SVGPlot.genericConstructor(this, svgPlot, parent);
}

// Labels



SVGPlot.prototype.setXLabel = function(label, loc /* ='50%' */, position /* 'bottom' */) {
    if (this.xLabel == null)
        this.addXLabel(label, loc, position);
    this.xLabel.label = label;
    this.xLabel.loc = SVGPlot.firstNonNull(loc, this.xLabel.loc, '50%');
    this.xLabel.position = SVGPlot.firstNonNull(position, this.xLabel.position, 'bottom');
    this._copyState(this.xLabel._style, this);
}

SVGPlot.prototype.setYLabel = function(label, loc /* ='50%' */, position /* 'bottom' */) {
    if (this.yLabel == null)
        this.addYLabel(label, loc, position);
    this.yLabel.label = label;
    this.yLabel.loc = SVGPlot.firstNonNull(loc, this.yLabel.loc, '50%');
    this.yLabel.position = SVGPlot.firstNonNull(position, this.yLabel.position, 'left');
    this._copyState(this.yLabel._style, this);
}

SVGPlot.prototype.setXLabelStyle = function() {
    this.xLabel._style = this.getState();
}

SVGPlot.prototype.setYLabelStyle = function() {
    this.yLabel._style = this.getState();
}

SVGPlot.prototype.addXLabel = function(label, loc /* ='50%' */, position /* 'bottom' */) {
    this.xLabel = new SVGPlot.Label(this, this.xAxis);
    this.setXLabel(label, loc, position);
    this.xAxis.labels.push(this.xLabel);
    return this.xLabel;
}

SVGPlot.prototype.addYLabel = function(label, loc /* ='50%' */, position /* 'bottom' */) {
    this.yLabel = new SVGPlot.Label(this, this.yAxis);
    this.setYLabel(label, loc, position);
    this.yAxis.labels.push(this.yLabel);
    return this.yLabel;
}

SVGPlot.Label = function(svgPlot, parent) {
    SVGPlot.genericConstructor(this, svgPlot, parent);
}


// Rendering and Layout

SVGPlot.prototype.render = function () {
    /***
        This can be called many times recursively and will just set a flag.
        It ends when a render is complete and there are no pending requests.
    ***/
    this.layoutBoxes();
    /*
    if ( !this._rendering==true ) {
        this._rendering = true;
        do {
            this._renderAgain = false;
            this._doBoxLayout();
        } while (this._renderAgain == true) 
        this._rendering = false;
    }
    else {
        this._renderAgain = true;
    }
    */
}

SVGPlot.prototype.layoutBoxes = function () {

    var width = parseFloat( this.svg.svgElement.getAttribute('width') );
    var height = parseFloat( this.svg.svgElement.getAttribute('height') );
    var across, down
    if (typeof(this.layout)!='undefined' && this.layout!=null) {
        var across = this.layout.across;
        var down = this.layout.down;
   }
    var i=0;
    var j=0;
    for (var n=0; n<this.boxes.length; n++) {
        /*
        // TODO Check this better. Different kinds of layout management.
        if ( boxes[n].layout != null && boxes[n].layout != null && boxes[n].layout != 'float') {
            this.boxes[n].x = i*width/across;
            this.boxes[n].y = j*height/down;
            this.boxes[n].width = width/across;
            this.boxes[n].height = height/down;
            i++;
            if (i == across) {
                i = 0;
                j++;
            }
        }
        */
        this.boxes[n].render();
    }
}

SVGPlot.Box.prototype.render = function () {
    /* x, y, width, and height must all be set */
    SVGPlot.createGroupIfNeeded(this, 'box', 'stroke');
    
    // Transform the box to the right place
    this.element.setAttribute('transform', 'translate('+this.x+','+this.y+')');
    // Add a clipping box (optional and not yet implimented)
    
    
    // Set any auto-ranges before we create any stubs because they can be 'auto' too.
    for (var i=0; i<this.ranges.length; i++) {
        this.ranges[i].setAutoRange();
        this.ranges[i].createElement();
    }
    
    this.svgPlot.svg.svgElement.forceRedraw();  // So that all of the stubs have bounding boxes for the layout.
    
    var totalXSize = {'left':0, 'right':0, 'first_left':true, 'first_right':true};
    var totalYSize = {'top':0, 'bottom':0, 'first_top':true, 'first_bottom':true};
    
    for (var i=0; i<this.ranges.length; i++) {
        this.ranges[i].layout(totalXSize, totalYSize);
    }
    
    // Find the Plot Area bounds
    var top = totalYSize.top;
    var bottom = this.height-totalYSize.bottom;
    var left = totalXSize.left;
    var right = this.width-totalXSize.right;
    
    for (var i=0; i<this.ranges.length; i++) {
        this.ranges[i].render(left, right, top, bottom)
    }
    
}

SVGPlot.Range.prototype.createElement = function() {
    SVGPlot.createGroupIfNeeded(this, 'range');
    
    for (var j=0; j<this.xAxes.length; j++) {
        this.xAxes[j].createElement()
    }
    for (var j=0; j<this.yAxes.length; j++) {
        this.yAxes[j].createElement()
    }
    for (var j=0; j<this.plots.length; j++) {
        this.plots[j].createElement()
    }
}

SVGPlot.Axis.prototype.createElement = function() {
    SVGPlot.createGroupIfNeeded(this, 'axis', 'stroke');
    
    for (var k=0; k<this.ticks.length; k++)
        this.ticks[k].createElement()
    for (var k=0; k<this.stubs.length; k++)
        this.stubs[k].createElement()
    for (var k=0; k<this.labels.length; k++)
        this.labels[k].createElement()
}


SVGPlot.Ticks.prototype.createElement = function() {
    SVGPlot.createGroupIfNeeded(this, 'ticks', 'stroke');
}

SVGPlot.Stubs.prototype.createElement = function() {
    SVGPlot.createGroupIfNeeded(this, 'stubs', 'text');
    
    this._locs = this.locs;
    if (this.locs=='auto') {
        if (this.parent.type=='x')
            this._locs = SVGPlot.defaultlocs(this.parent.parent._xmin, this.parent.parent._xmax);
        else if (this.parent.type=='y')
            this._locs = SVGPlot.defaultlocs(this.parent.parent._ymin, this.parent.parent._ymax);
    }
    
    var label_strs = this.labels
    if (this.labels=='auto')
        label_strs = map(SVGPlot.prettyNumber, this._locs);
    
    SVGPlot.removeAllChildren(this.element);
    this._texts = [];
    
    var p = this.svgPlot;
    p.save();
    /*  In case you want to set the position here rather than let the layout manager take care of it.
    if (this.position=='bottom' || this.position=='top')
        this.textAnchor = 'middle'
    else if (this.position=='left')
        this.textAnchor = 'start'
    else if (this.position=='right')
        this.textAnchor = 'end'
    */
    p.setGroup(this.element);
    for (var i=0; i<this._locs.length && i<label_strs.length; i++) {
        p.applyStyles = false;
        var text = p.text(label_strs[i]);
        this._texts.push(text);
    }
    p.restore();
}

SVGPlot.Label.prototype.createElement = function() {
    SVGPlot.createGroupIfNeeded(this, 'label', 'text');

    SVGPlot.removeAllChildren(this.element);

    var p = this.svgPlot;
    p.save();
    p.setGroup(this.element);
    if (this.position=='left')
        p.rotate(-Math.PI/2)
    else if (this.position=='right')
        p.rotate(Math.PI/2)
    p.applyStyles = false;
    this._text = p.text(this.label);
    p.restore();
}

SVGPlot.autoRangeMarginFactor = 0.05;

SVGPlot.Range.prototype.setAutoRange = function(include_zero /* =false */) {
    
    if (this.xmin != 'auto' && this.xmax != 'auto' && this.ymin != 'auto' && this.ymax != 'auto') {
        this._xmin = this.xmin;
        this._xmax = this.xmax;
        this._ymin = this.ymin;
        this._ymax = this.ymax;
        return;
    }

    var xExtents = {'min':Number.MAX_VALUE,
                    'max':-Number.MAX_VALUE };
    var yExtents = {'min':Number.MAX_VALUE,
                    'max':-Number.MAX_VALUE };
    for (var i=0; i<this.plots.length; i++) {
        this.plots[i].updateExtents(xExtents, yExtents);
    }
    
    function fixExtents(extents) {
        if (extents.max<extents.min) {  // Shouldn't happen unless we didn't find any plots
            extents = {'min':-10,
                        'max':10 };
        }
        if (extents.max==extents.min) {
            extents.min = extensts.min-1;
            extents.max = extents.max+1;
        }
        var total = extents.max - extents.min;
        
        // If the max or min are close to zero, include zero.
        if (extents.min>0.0 && ( extents.min<total*SVGPlot.autoRangeMarginFactor ||
                          (typeof(include_zero) != 'undefined' && include_zero == true) ) )
            extents.min = 0.0;
        if (extents.max<0.0 && (-extents.max<total*SVGPlot.autoRangeMarginFactor ||
                          (typeof(include_zero) != 'undefined' && include_zero == true) ) )
            extents.max = 0.0;
        
        // If neither one lies on the origin, give them a little extra room.  TODO Make this an option
        /*
        if (min!=0.0)
            min = min - total * SVGPlot.autoRangeMarginFactor;
        if (max!=0.0)
            max = max + total * SVGPlot.autoRangeMarginFactor;
        */
    }
    
    fixExtents(xExtents, yExtents);
    
    this._xmin = (this.xmin!='auto') ? this.xmin : xExtents.min;
    this._xmax = (this.xmax!='auto') ? this.xmax : xExtents.max;
    this._ymin = (this.ymin!='auto') ? this.ymin : yExtents.min;
    this._ymax = (this.ymax!='auto') ? this.ymax : yExtents.max;
}

SVGPlot.Range.prototype.layout = function (totalXSize, totalYSize) {
    for (var i=0; i<this.xAxes.length; i++)
        this.xAxes[i].layout(totalXSize, totalYSize);
    for (var i=0; i<this.yAxes.length; i++)
        this.yAxes[i].layout(totalXSize, totalYSize);
}

SVGPlot.axisMargin = 1;
SVGPlot.componentMargin = 1;

SVGPlot.Axis.prototype.layout = function(totalXSize, totalYSize) {
    var offsets = {'above':0.5, 'below':0.5};  // TODO actually find line-width
    
    var components = [this.ticks, this.stubs, this.labels];
    
    // Layout ticks, stubs, labels
    for (var i=0; i<components.length; i++) {
        extents = {'above':0, 'below':0};
        for(var j=0; j<components[i].length; j++) {
            var component = components[i][j];
            var size = component.getSize(this.type);
            var position = component.position;
            var direction =  (position=='top' || position=='left') ? -1 : 1
            if (position=='top' || position=='right') {
                component._offset = direction*offsets.above;
                extents.above = Math.max(extents.above, size+SVGPlot.componentMargin);
            }
            else if (position=='bottom' || position=='left') {
                component._offset = direction*offsets.below;
                extents.below = Math.max(extents.below, size+SVGPlot.componentMargin);
            }
        }
        offsets.above += extents.above;
        offsets.below += extents.below;
    }
    
    this._offset = 0;  // Signed-distance from the plot area, which we don't know yet.
    if (this.position=='bottom') {
        this._offset = totalYSize.bottom;
        if (totalYSize.first_bottom==false) {
            totalYSize.bottom += offsets.above + SVGPlot.axisMargin;
            this._offset += offsets.above + SVGPlot.axisMargin;
        }
        totalYSize.bottom += offsets.below + SVGPlot.axisMargin;
        totalYSize.first_bottom = false;
    }
    else if (this.position=='top') {
        this._offset = -totalYSize.top;
        if (totalYSize.first_top==false) {
            totalYSize.top += offsets.below + SVGPlot.axisMargin;
            this._offset -= offsets.below + SVGPlot.axisMargin;
        }
        totalYSize.top += offsets.above + SVGPlot.axisMargin;
        totalYSize.first_top = false;
    }
    else if (this.position=='left'){
        this._offset = -totalXSize.left;
        if (totalXSize.first_left==false) {
            totalXSize.left += offsets.above + SVGPlot.axisMargin;
            this._offset -= offsets.above + SVGPlot.axisMargin;
        }
        totalXSize.left += offsets.below + SVGPlot.axisMargin;
        totalXSize.first_left = false;
    }
    else if (this.position=='right'){
        this._offset = totalXSize.right;
        if (totalXSize.first_right==false) {
            totalXSize.right += offsets.below + SVGPlot.axisMargin;
            this._offset += offsets.below + SVGPlot.axisMargin;
        }
        totalXSize.right += offsets.above + SVGPlot.axisMargin;
        totalXSize.first_right = false;
    }
}


SVGPlot.Ticks.prototype.getSize = function(type) {
    return this.length;
}

SVGPlot.Stubs.prototype.getSize = function(type) {
    return SVGPlot.getTextSize(this.element, type);
}

SVGPlot.Label.prototype.getSize = function(type) {
    return SVGPlot.getTextSize(this.element, type);
}

SVGPlot.getTextSize = function(element, type) {
    // Add up the space that stubs and labels take up, but only if they are not covering the graph.
    var bbox = element.getBBox();
    if (type=='x')
        return bbox.height;
    else if (type=='y')
        return bbox.width;
}

SVGPlot.Label.prototype.layoutText = SVGPlot.Stubs.prototype.layoutText;

SVGPlot.Range.prototype.render = function(left, right, top, bottom) {
    this._width = right-left;
    this._height = bottom-top;
    this._xscale = this._width/(this._xmax-this._xmin);
    this._yscale = this._height/(this._ymax-this._ymin);
    function xtoi(xmin, xscale, x) { return (x-xmin)*xscale }
    this.xtoi = partial(xtoi, this._xmin, this._xscale);
    function ytoj(ymin, yscale, height, y) { return height - (y-ymin)*yscale }
    this.ytoj = partial(ytoj, this._ymin, this._yscale, this._height);
    for (var i=0; i<this.xAxes.length; i++)
        this.xAxes[i].render(left, right, top, bottom, this.xtoi, this.ytoj);
    for (var i=0; i<this.yAxes.length; i++)
        this.yAxes[i].render(left, right, top, bottom, this.xtoi, this.ytoj);
    for (var i=0; i<this.plots.length; i++)
        this.plots[i].render(left, right, top, bottom, this.xtoi, this.ytoj);
}

SVGPlot.Axis.prototype.render = function(left, right, top, bottom, xtoi, ytoj) {
    var min, max, map;
    if (this.type=='x') {
        min = this.parent._xmin;
        max = this.parent._xmax;
        map = xtoi;
    }
    else if (this.type=='y') {
        min = this.parent._ymin;
        max = this.parent._ymax;
        map = ytoj;
    }
    
    // First position the axis as a whole with a transform on its group.
    var translate_x = 0;
    var translate_y = 0;
    if (this.position=='top') {
        translate_x = left;
        translate_y = top+this._offset;
    }
    else if (this.position=='bottom') {
        translate_x = left;
        translate_y = bottom+this._offset;
    }
    else if (this.position=='left') {
        translate_x = left+this._offset;
        translate_y = top;
    }
    else if (this.position=='right') {
        translate_x = right+this._offset;
        translate_y = top;
    }
    else {
        if (this.type=='x') {
            translate_x = left
            translate_y = top + ytoj(this.position);
        }
        else if (this.type=='y') {
            translate_x = left + xtoi(this.position)
            translate_y = top;
        }
    }
    this.element.setAttribute('transform', 'translate('+translate_x+', '+translate_y+')');

    
    // Just render it as if you start at the origin.  A transform has already been applied
    // Different namespace for calculated/default versus explicitly defined attributes.
    // TODO Something about the corners where the axes meet.
    // TODO Add in margins
    // TODO Grid lines
    // TODO Maybe move the ticks to along the zero-line rather than taking into account the axis thickness.

    
    // Render Axes
    var path;
    if (this.type=='x')
        path = 'M 0,0 h '+(right-left);
    else if (this.type=='y')
        path = 'M 0,'+(bottom-top)+' v '+(top-bottom);
    var pathElem = this.svgPlot.svg.PATH({'d': path});
    //SVGPlot.removeAllChildren(this.element);  // TODO Remove the paths.
    this.element.appendChild(pathElem);
    
    var components = [this.ticks, this.stubs, this.labels];
    
    // Translate and then render ticks, stubs, labels
    for (var i=0; i<components.length; i++) {
        for(var j=0; j<components[i].length; j++) {
            var offset = components[i][j]._offset;
            if (this.type=='x')
                components[i][j].element.setAttribute('transform', 'translate(0,'+offset+')');
            else if (this.type=='y')
                components[i][j].element.setAttribute('transform', 'translate('+offset+',0)');
            components[i][j].render(min, max, map);
        }
    }
}


SVGPlot.Ticks.prototype.render = function(min, max, map) {
    SVGPlot.createGroupIfNeeded(this, 'ticks', 'stroke');
    
    var locs = this.locs
    if (this.locs=='auto')
        locs = SVGPlot.defaultlocs(min, max, this.interval, this.number);
    var path = '';
    for (var k=0; k<locs.length; k++) {
        if (locs[k]>min && locs[k]<max) {
            if (this.position=='top')
                path += ' M '+map(locs[k])+' 0 '+'v '+(-this.length);
            else if (this.position=='bottom')
                path += ' M '+map(locs[k])+' 0 '+'v '+(this.length);
            else if (this.position=='right')
                path += ' M 0 '+map(locs[k])+'h '+(this.length);
            else if (this.position=='left')
                path += ' M 0 '+map(locs[k])+'h '+(-this.length);
        }
    }
    SVGPlot.removeAllChildren(this.element);
    this.element.appendChild( this.svgPlot.svg.PATH({'d':path}) );
}

SVGPlot.Stubs.prototype.render = function(min, max, map) {
    SVGPlot.translateBottomText(this)
    for (var i=0; i<this._texts.length; i++) {
        SVGPlot.renderText(this._texts[i], this._locs[i], 
                             this._texts[i].getBBox(), 
                             this.position, min, max, map)
    }
}

SVGPlot.Label.prototype.render = function(min, max, map) {
    SVGPlot.translateBottomText(this)
    // When rotation is applied to a <text>, the bounding box doens't change.
    // It does, however, change for any group that contains it.
    SVGPlot.renderText(this._text, this.loc, 
                             this._text.parentNode.getBBox(), 
                             this.position, min, max, map)
}

SVGPlot.translateBottomText = function(component) {
    if (component.position=='bottom') {
        var transform = component.element.getAttribute('transform');
        transform += 'translate(0,'+(component.element.getBBox().height-1)+')'
        component.element.setAttribute('transform', transform);
    }
}

SVGPlot.renderText = function (text, loc, bbox, position, min, max, map) {
    if (loc<min || loc>max)
        text.setAttribute('display', 'none');
    else
        text.removeAttribute('display');
    if (typeof(loc)=='string' && loc[loc.length-1] == '%')
        loc = min + parseFloat(loc.substring(0, loc.length-1)) / 100 * (max-min)
    var transform = text.getAttribute('transform');
    if (typeof(transform)=='undefined' || transform == null)
        transform = '';
    //var bbox = text.getBBox(); //{'x':0, 'y':0, 'width':10, 'height':10};
    if (position=='top')
        transform = 'translate('+(map(loc)-bbox.width/2)+', 0)' + transform;
    else if (position=='bottom')
        transform = 'translate('+(map(loc)-bbox.width/2)+', 0)' + transform;
    else if (position=='right')
        transform = 'translate(0, '+(map(loc)+bbox.height/2)+')' + transform;
    else if (position=='left')
        transform = 'translate('+(-bbox.width-bbox.x)+', '+(map(loc)+bbox.height/2)+')' + transform;
    text.setAttribute('transform', transform);
}

SVGPlot.LinePlot.prototype.createElement = function() {
    SVGPlot.createGroupIfNeeded(this, 'line-plot', 'stroke');
}

SVGPlot.LinePlot.prototype.render = function(left, right, top, bottom, xtoi, ytoj) {
    
    
    SVGPlot.removeAllChildren(this.element);
    
    var p = this.svgPlot;
    
    p.save();
    p.applyStyles = false;
    p.setGroup(this.element);
    //var rect = this.getDatasetRect();
    p.clipRect(left, top, right-left, bottom-top);
    //this.translate(rect.x, rect.y);
    //plotDataset.plot();
    
    // Should really loop through and draw one point off of each side if it exists.
    // Maybe not becuase you can plot arbitrary loopy xy sets and make 
    // crazy lines which can exit and enter, so SVG should have all points.
    p.translate(left, top);
    p.beginPath();
    // Handle infinite and NaN properly.
    var drawingFunction = p.moveTo;
    // TODO Handle cases where the plot goes WAY off the  scales.
    for (i=0; i<this.ydata.length; i++) {
        var sx = xtoi(this.xdata[i]);
        var sy = ytoj(this.ydata[i]);
        if (!isNaN(sx) && sx!=Number.MAX_VALUE && sx!=Number.MIN_VALUE &&
            sx!=Number.NEGATIVE_INFINITY && sx!=Number.POSITIVE_INFINITY &&
            !isNaN(sy) && sy!=Number.MAX_VALUE && sy!=Number.MIN_VALUE &&
            sy!=Number.NEGATIVE_INFINITY && sy!=Number.POSITIVE_INFINITY ) {
                drawingFunction.call(p, sx, sy);
                //log("Plotting point ("+sx+","+sy+")");
                drawingFunction = p.lineTo;
        }
    }
    var plot = p.stroke();
    // Add our own stuff to the attributes produced.
    
    p.restore();
    return plot;
}




// Utility Functions



SVGPlot.add = function (self, child, array, Name) {
    /***
        used all over the place to add elements to arrays and svg elements beofre or after other
        custom processing.
        
        @param child -- If this is a string, treat it as the name of a constructor.
    ***/
    if (typeof(child)=='string')
        child = new SVGPlot[child]();
    array.push(child);
    if (typeof(Name) != 'undefined' && Name != null)
        self.svgPlot[Name] = object;
    self.element.appendChild(child.element);
}

SVGPlot.remove = function(self, child, array, Name) {
    if (typeof(child) == 'undefined' || child == null)
        child = self[Name];
    
    // Remove its element from the DOM tree
    self.element.removeChild(child.element);
    // Remove it from the JS array since JS doen't have array.remove(object)
    for(var i=0; i<array.length; i++) {
        if (array[i]==object) {
            array[i] = array[array.length-1];  // Move it to the end
            array.length--;  // Delete it.
        }
    }
    if (Name!='undefined' && Name!=null && self[Name] == child) {
        self.svgPlot[Name] = (array.length>0) ? array[array.length-1] : null;  // Set  to the last item or null
    }
    return child;
}

SVGPlot.minmax = function(array) {
    var min = Number.MAX_VALUE;
    var max = -Number.MAX_VALUE;
    for (var i=0; i<array.length; i++) {
        max = array[i]>max ? array[i] : max;
        min = array[i]<min ? array[i] : min;
    }
    return {'min':min, 'max':max};
}

SVGPlot.firstNonNull = function() {
    for (var i=0; i<arguments.length; i++)
        if ( typeof(arguments[i])!='undefined' && arguments[i]!=null )
            return arguments[i]
    return null;
}

SVGPlot.prettyNumber = function(number) {
    /***
        p.prettyNumber(3.000000000000001)
        p.prettyNumber(0.39999999999999997)
        p.prettyNumber(3.9999999999999997)
        p.prettyNumber(.9999999999999997)
    ***/
    var str = ''+number;
    if (str.length > 15) {  // TODO check for exponential
        // Chop off the last digit
        var loc = str.length-2;
        if (str[loc] == '0') {
            while (str[loc] == '0')
                loc--;
            if (str[loc]=='.')
                return str.slice(0, loc);
            return str.slice(0, loc+1);
        }
        if (str[loc]  == '9') {
            while (str[loc] == '9')
                loc--;
            var last = str[loc];
            if (last == '.') {
                loc--
                last = str[loc];
            }
            return str.slice(0,loc)+(parseInt(last)+1)
        }
    }
    return str;
}

SVGPlot.arrayToString = function(array) {
    var str = '';
    for (var i=0; i<array.length; i++) {
        if (typeof(array[i]) == 'number' || typeof(array[i]) == 'string') {
            if (i!=0)
                str += ' ';
            str += array[i];
        }
    }
    return str;
}

SVGPlot.defaultInterval = function(min, max, number /* =7 */) {
    /***
        return a nice spacing interval.  Nice is a power of 10,
        or a power of ten times 2, 3, or 5.  What you get out is one of:
        ..., .1, .2, .3, .5, 1, 2, 3, 5, 10, 20, 30, 50, 100, ...
    ***/
    if (typeof(number)=='undefined' || number==null || isNaN(number))
        number = 7;
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

SVGPlot.defaultlocs = function(min, max, interval /* defaultInterval */, number /* =7 */, avoid /* = [min, max] */, offset /* = 0*/) {
    /***
        Come up with locs for the ticks/grids/stubs, etc.
        @param min -- the actual start of the scale (can be some non-round number)
        @param max -- the actual end of the scale (can be some non-round number)
        @param interval -- the interval at which you want the ticks, usually 1, 2, 3, 5, 10, 20, etc.
        @param avoid -- an array of locs to avoid putting a mark (usually the axes and endpoints.)
        @param offset -- the ticks start counting around here (defaults to zero)
        
        @returns an array of floats which list the tick locs.
        
    ***/
    if (typeof(avoid)=='undefined' || avoid==null)
        avoid = []; //[min, max];
    if (typeof(offset)=='undefined' || offset==null)
        offset = 0;
    if (typeof(interval)=='undefined' || interval==null || isNaN(interval))
        interval = SVGPlot.defaultInterval(min, max, number)
    
    // Make sure we won't loop forever:
    interval = Math.abs(interval);
    if (interval==0)
        interval = 1;
    
    locs = [];
    var avoidance = (max-min)*SVGPlot.autoRangeMarginFactor;
    var mark = Math.ceil( (min-offset)/interval ) * interval + offset;
    while (mark < max) {
        var reject = false;
        for (var i=0; i<avoid.length; i++)
            if (Math.abs(mark-avoid[i]) < avoidance/2)
                reject = true;
        if ( reject==false )
            locs.push(mark)
        mark += interval;
    }
    return locs;
}


SVGPlot.createGroupIfNeeded = function(self, cmd, style_type /* 'stroke' 'fill' or 'text' */) {
    if (self.element == null) {
        self.element = self.svgPlot.svg.G(null);
    }
    self.parent.element.appendChild(self.element);
    
    SVGPlot.setPlotAttributes(self, cmd);
    
    if (typeof(style_type)=='string')
        SVGPlot.setStyleAttributes(self, style_type);
}



SVGPlot.setPlotAttributes = function(self, cmd) {
    var plotNS = SVGPlot.plotNS
    // Set the command property
    self.element.setAttributeNS(plotNS, 'cmd', cmd)
    
    // Set all of the string, number, and arrays
    var members = keys(self)
    for (var i=0; i<members.length; i++) {
        if (members[i][0] != '_' && self[members[i]] != null && typeof(self[members[i]])!='undefined' ) {
            if (typeof(self[members[i]]) == 'number' || typeof(self[members[i]]) == 'string')
                self.element.setAttributeNS(plotNS, members[i], self[members[i]])
            else if ( typeof(self[members[i]].length) != 'undefined' && typeof(self[members[i]].length) != null ) {
                // It's an array, so concatinate all of its elements togetner in a big string.
                var str = SVGPlot.arrayToString(self[members[i]])
                if (str != '') {
                    self.element.setAttributeNS(plotNS, members[i], str)
                }
            }
        }
    }
}

SVGPlot.setStyleAttributes = function(self, style_type /* 'stroke' 'fill' or 'text' */) {
    var p = self.svgPlot
    var backupStyle = p.getState();
    p.setState(self._style);
    
    if (style_type=='text') {
        p._setFontAttributes(self.element);
        style_type = 'fill'
    }
    p._setGraphicsAttributes(self.element, style_type);
    
    p.setState(backupStyle);
}



SVGPlot.removeAllChildren = function(node) {
    while(node.childNodes.length>0) {
        node.removeChild(node.childNodes[0]);
    }
}




// set add delete replace actions

// plotLine(xdata, ydata)  // If xdata is the same as  overlay, adds ydata to it.  Otherwise creates new overlay.
// plotLine(ydata)  // Uses  xdata in overlay or automatically creates (0,1,2,3,...) or (1,2,3,4,...)
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
// setXAxisloc('edge')  // These return an Axis list so you can set Axis yourself
// setXAxisloc('zero')  // For classic sin(x) plots
// setXAxisloc('box')
// replaceAxis(axesToReplace /* optional */) // If no parameter is given, all axes replaced
// deleteAxis()
// setXTicks('linear')  // Assumes default axis otherwise you can change Axis
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
// addHorizontalLine()  // For a horizontal line across at a specific x loc.  Just like gridlines, but only one.
// addVerticalLine()  // For a horizontal line across at a specific x loc.


// labelXAxis('linear')
// ... same as Ticks plus one more:
// labelXAxis(data, values)
