/***

MochiKit.SVGPlot 1.2

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2006 Jason Gallicchio.  All rights Reserved.


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
   
   The key to adoption is good defaults.  The key to staying is extensible options.  Have Turfte inspire the defaults.
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

MochiKit.SVGPlot.prototype.resetPlot = function() {
    log("Constructing SVGPlot in SVGPlot.reset");
    this._currentFrame = new MochiKit.SVGPlot.Frame(this)
    this._frames = [this._currentFrame];
}

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

MochiKit.SVGPlot.prototype.plotLine = function(xorydata /* ydata1, ydata2, ... */) {
    if (arguments.length==1) {
        var xdata = new Array(xorydata.length);  // ydata = xorydata;
        for (var i=0; i<xorydata.length; i++)
            xdata[i] = i;
        this.plotLine(xdata, xorydata);
    }
    for (var data_index=1; data_index<arguments.length; data_index++) {
        // Check for nulls
        log("Going to call addPlotDataset data_index = ", data_index);
        this._currentFrame._currentLayer.addPlotDataset( new MochiKit.SVGPlot.LinePlotDataset( this._currentFrame._currentLayer,
                                                                    xorydata, 
                                                                    arguments[data_index]) );
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


MochiKit.SVGPlot.Layer.prototype.getDatasetRect = function() {
    return {'x':0, 'y':0, 'width':200, 'height':200};
}


MochiKit.SVGPlot.Layer.prototype.addPlotDataset = function(plotDataset /* optional */) {
    MochiKit.SVGPlot._add(this, plotDataset, this._plotDatasets, this._element, this._parentFrame._element, '_currentPlotDataset', MochiKit.SVGPlot.LinePlotDataset);
    var canvas = this._parentFrame._parentSVGPlot;
    canvas.save();
    canvas.setGroup(this._parentFrame._element);
    var rect = this.getDatasetRect();
    canvas.clipRect(0, 0, rect.width, rect.height);
    canvas.translate(rect.x, rect.y);
    plotDataset.plot();
    canvas.restore();
}

MochiKit.SVGPlot.prototype.deletePlotDataset = function(plotDataset /*optional*/) {
    MochiKit.SVGPlot._remove(this, plotDataset, this._plotDatasets, this._groupElement, '_currentPlotDataset');
}

MochiKit.SVGPlot._minmax = function(array) {
    var max = Number.MIN_VALUE;
    var min = Number.MAX_VALUE;
    for (var i=0; i<array.length; i++) {
        max = array[i]>max ? array[i] : max;
        min = array[i]<min ? array[i] : min;
    }
    return {'min':min, 'max':max};
}


MochiKit.SVGPlot.LinePlotDataset = function(parentLayer, xdata, ydata) {
    log("Constructing LinePlotDataset parentLayer=", parentLayer);
    this._parentLayer = parentLayer;
    var rect = parentLayer.getDatasetRect()
    this.width = rect.width;
    this.height = rect.height;
    this.xdata = xdata;
    this.ydata = ydata;
    this.autoRange();   // default.
}

MochiKit.SVGPlot.LinePlotDataset.prototype.plot = function() {
    /***
        Designed to work like canvas.stroke() where it just plots its shit into whatever 
        SVG group happens to be the canvas's currentGroup.
    ***/
    // Must to scaling by hand to keep line-widths properly sized.
    // At full scale, thick lines get cut off.
    var xscale=this.width/(this.xmax-this.xmin);
    var yscale=this.height/(this.ymax-this.ymin);
    //var svg = this._parentLayer._parentFrame._parentSVGPlot.svg
    var canvas = this._parentLayer._parentFrame._parentSVGPlot;
    
    
    // Should really loop through and draw one point off of each side if it exists.
    // Maybe not becuase you can plot arbitrary loopy xy sets and make 
    // crazy lines which can exit and enter, so SVG should have all points.
    canvas.translate(0,this.height);
    canvas.scale(1,-1);
    canvas.beginPath();
    // Handle infinite and NaN properly.
    var drawingFunction = canvas.moveTo;
    for (i=0; i<this.ydata.length; i++) {
        var sx = xscale*(this.xdata[i]-this.xmin);
        var sy = yscale*(this.ydata[i]-this.ymin);
        if (sx!=Number.NaN  && sx!=Number.MAX_VALYE && sx!=Number.MIN_VALUE &&
            sy!=Number.NaN && sy!=Number.MAX_VALYE && sy!=Number.MIN_VALUE) {
                drawingFunction.call(canvas, sx, sy);
                drawingFunction = canvas.lineTo;
        }
    }
    var plot = canvas.stroke();
    // Add our own stuff to the attributes produced.
    return plot;
}


MochiKit.SVGPlot.LinePlotDataset.prototype.autoRange = function() {
    var xrange = MochiKit.SVGPlot._minmax(this.xdata);
    this.xmin=xrange.min;
    this.xmax=xrange.max;
    var yrange = MochiKit.SVGPlot._minmax(this.ydata);
    this.ymin=yrange.min;
    this.ymax=yrange.max;
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

