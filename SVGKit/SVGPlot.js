/***

SVGPlot 0.1

See <http://svgkit.com/> for documentation, downloads, license, etc.

(c) 2006 Jason Gallicchio.  All rights Reserved.

   Another kit I found:  http://www.liquidx.net/plotkit/

   I don't like the way  plotting programs handle things. I set out to create one that:
   * Outputs SVG and LaTeX and can easily be converted to PDF, PS, PNG
   * Works in a client-side browser for real-time manipulation of plots 
   * can hook up live data (JSON, XML, CSV)
   * server-side rendering through Mozilla's command-line JS
   * Has good features of Matlab, Mathematica, Asymptote, Ploticus, SuperMongo, GNU Plot, Origin
   * Can reproduce any plot in Science and Nature as strighforwardly as possible
   * Can reproduce any plot in Physics and Math textbooks as straightforwardly as possible.
   * Clean programatic canvas-like interface and also clean SVG-like XML representation.
   * Reasonable defaults, but ability to tweak everything.
   * Client-side features of zooming, panning, and exploring the data.

   Everything is object-oriented, but objects get created for you rather than 
   having to call constructors and link them in.  Complimentary like SVG DOM vs Canvas.
   You can always access the objects through the scene-tree.

   This is all represented in the XML structure of the SVG with custom namespace to 
   completly reconstruct these objects uppon load like Inkscape
    * API & script commands common across languages: JS, Java, Python, C++
    * Data format just Plain XML, Plain SVG, or Combined
    * Write quickly with small script, but have ability to modify tree later.
   Select plot or layer by color (or some other characteristic) rather than reference.
   in a histogram, you want steps and not column plot.
   
   Another concept.  Rather than heirarchial, since single plots are the common case, maybe
   there should just be links to things like Axes rather than beging continaed.
   In a long array of plots, they could all be linked to the same axis rather than be
   contained in it.  This way when the axis changes, the plots do too.
   
   
   When you call something, it sets up reasonable defaults for everything else.

   autoColorIncrement = true // cycle through predefined nice default colors

   be able to pass in error bars or stock ranges with any plot
   ledgend and/or labeling of plots is automatic, alpha blended, unobtrusive, and auto-positioned.
   
   Programming interface concept:  Too many objects and layers, so expose each one's functionality
   to it's children and it's parents.  When you call a high-layer method on a child, it works.
   When you call a child method on a parent, it picks either the "" one or the default (first) one.
   
   The key to adoption is good defaults.
   The key to staying is extensible options.
   Have good practices (like Tufte) inspire the defaults.
   Web page:
     -- Galery both in PNG and in JS.  JS has "Do It" button
     -- Tutorial with inline JS.  Find interesting data sources to plot.  Census, etc.
     -- Document code, document defaults.  Document which level in the heirarchy is affected with Color Overlays
   
   Box Layout information:  Since you've already got an array of a certain size, it makes sense to store the layout information
   in the children, but in some sense it doesn't belong there because you should be able to move children around freely.
   In this scheme you'd have to change the layout information explicitly.
   
   How to handle click on graphs:
     -- Want to do a trace where (x,y) or (r,th) components show up as float.
     -- Want to drag to manipulate data points (undo?) Need explicit SVG G's rather than Markers?
     -- Want to drag to move graph around.
     -- Drag on axes to zoom
          * always from origin?  For date plots this is dumb.
          * zoom uniformly to keep axis ratios fixed.
    
   Procedural model (plot function) versus data model (XML/JSON rep).
    -- Like Canvas vs SVG.
    -- The procedural model makes it easier to crate variables based on the data
        and use them in other parts without a lotof xrefs. (How to even do in JSON?)
    -- The data model makes it easier to change parameters with a UI, 
        add data, and re-render.
   
   Ways to pass graph properties:
     -- Stack-based state method like Canvas
     -- Explicitly with each function like Mathematica
             plot(func, {'x', 0, 10}, {'strokeStyle':'red'} )
     -- Create objects and set properties with setter functions like vtk
     * properties are nice for stack-based, but bad for object-based unless you're 
         in Python where you can capture the setting or you're willing to register callbacks
         that check if the  state is different than it was when it was drawn
         Periodic updates aren't so bad.  Mozilla's native SVG element['width']=10 does it this way.
     * Defaults are hard to deal wtih.  Should axes, ticks, and labels start up on
         automatically?  Sure.  Then there's a difference between setting the 
         ones and adding new ones.  When you change a parameter, does it affect the 
         axes or just the drawing of the new axes?  What if you don't want all of the
         default ticks and stuff - do you have to delete them all explicitly?
    
  Drawing Function can take all of the row and do whatever it wants.
    it draws a shape around the origin given the parameters, 
    which gets translated to the right spot based on the x,y coords.
  Predefined Drawing Functions include:
    -- Change shape based on category
    -- Change color based on category
    -- Error bars dx, dy, dx&dy
    -- Error elipse dx, dy, theta
  Drawing functions can either by Canvas-like, ending in a stroke() and/or fill() or
    SVG-like returning a node which the drawing function can add events like mouseover to.
  Use this feature to re-impliment the star viewer with displayed coordinates and 
    mouseover star names.
    
  Ways to pass parameters:
    -- List like Mathematica [min, max] or [name, min, max]
    -- Object/dictionary {min:-5, max:5} 
    
  Input data:
   -- Table (2D array) with column headings (most efficient). First row may be heading.
      [[['x', 'y', 'a'], [7, 3, 6], [4, 2, 9], ...]
   -- List of objects with uniform attributes. Uniform, and what SQLObject returns
      [{x:7, y:3, a:6}, {x:4, y:2, a:9}, ...]
   
  TODO
    -- Make all list parameters both comma or space seperated like in SVG.
    -- Scatter plot is line plot with transparent stroke, but with markers? Can't have data-dependent markers.
    -- Grid lines function like ticks.  Just Extended ticks?  what about checkerboard/stripes?
    -- Tests with multiple boxes and box layout.
    -- Integer-only axis labels/ticks (a parameter of the auto-axis)
    -- Auto range has options like "always include zero"
    -- Be able to draw using lineTo and things using plot coordinates, not screen coordinates. 
    -- You want to draw over a graph.  This means mapping into plot coordinates without distorting your
        line widths and shapes in some crazy way.  You obviously map (x,y) to (i,j) but do you map 
        widths, heights, and radii?  Not if you want to draw a normal looking arrow, but yes if you
        want to draw a circle or an arc that is in a specific place on the graph.
    -- When you change ranges, you want decorations you've drawn to move too.  Decorations tied to point on plot.
    -- CSS Colors and Fonts
    -- For tickLabels at the edge, either move them to fit on plot or make plot bigger to accomodate them.
    -- Check range for zeros better.
    -- Box background and plot area background.
    -- Axes, ticks, and grids align themselves to nearest pixel.
    -- Smooth connect plot lines using bezier or quartic
    -- Autorange so that at least the line-width fits.
    -- Plot title
    -- Pie, optional pullout of wedges, optional 2nd parameter setting slice area "Spie  Chart"
    -- Excel has tick positions 'inside' 'outside' and 'cross'.  This makes more sense when 
          axes are on the sides, but not when it's in the middle.  We should have a 'cross' though.
    -- Handle axis types: number, log, category, date, time, date-time
    -- Option like Excel to drop grid lines from plot to axis (a partial grid)
    -- Auto ticks works differently for numberical versus category data, at least for bar graphs
         For categories, often you want ticks/grid in between bars and labels on bars
    -- How much to mix state-machine vs explicit options.  When you draw a box, do you take the
         current style and transform from the current state, or as a parameter?  Some things only require
         one or two style parameters and it's nicer just to set them.  Some like boxBG and plotAreaBG require lots and state is bad.
         Also, setting the fillStyle for text is confusing.
    -- How to handle polar plots?  Keep (x,y) range, but just add a polar grid/tickLabels/ticks/etc or
         completely change to a polar range where (x,y) now mean (r,phi)
    -- TickLabels appearing over axes or other elements should be somehow avoided -- constrained layout?
    -- Right now if you want to set something, you have to either:
        * Plot a function and get the default stuff
        * Explicitly add a box and it's defaults or whatever you want, then set it
        * Explicitly add everything starting with the box, which is unintuitive.  Should be able to 
               just addAxis or addXTickLabels and have it use those when I plot, even if it has to add an axis or box.
    -- Plot with both a line and a point component.  options:
        * Have to plot twice to get a drawingFunction for each point.
        * 'connected' is an option of scatter plot, which uses a drawingFunction.  This is easy to do.
        * 'markers' is an style parameter of line plot (automaticly included by SVGCanvas)
    -- Must have a way to generate data for line plots at a level so that it's straightforward to shade between two:
            var s = plotFunction(Sin)
            var c = plotFunction(Cos)
            shadeBetween(s, c, 0, pi)  // optional start and stop
    -- In above example, should plotFunction return the whole plot, a reference to just
         the function ploted, the SVGElement that corresponds to what was plotted, what?
***/


////////////////////////////
//  Setup
////////////////////////////


if (typeof(dojo) != 'undefined') {
    dojo.provide("SVGPlot");
    dojo.require("SVGCanvas");
}
if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Iter", []);
}

try {
    if (typeof(SVGCanvas) == 'undefined') {
        throw "";
    }
} catch (e) {
    throw "SVGPlot depends on SVGCanvas!";
}

if (typeof(SVGPlot) == 'undefined' || SVGCanvas == null) {
    // Constructor
    SVGPlot = function (widthOrIdOrNode /*=100*/, height /*=100*/, id /*optional*/) {
        if (arguments.length>0)
            this.__init__(widthOrIdOrNode, height, id);
        if (typeof(this.__init__)=='undefined' || this.__init__ == null) {
            //log("You called SVGPlot() as a fnuction without new.  Shame on you, but I'll give you a new object anyway");
            return new SVGPlot(widthOrIdOrNode, height, id);  // Ends up calling this constructor again, but returning an object.
        }
        return null;
    };
}


// Inheritance ala http://www.kevlindev.com/tutorials/javascript/inheritance/
SVGPlot.prototype = new SVGCanvas();
SVGPlot.prototype.constructor = SVGPlot;
SVGPlot.superclass = SVGCanvas.prototype;

SVGPlot.NAME = "SVGPlot";
SVGPlot.VERSION = "0.1";
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



////////////////////////////
//  Defaults
////////////////////////////


SVGPlot.plotNS = "http://www.svgplot.org";
SVGPlot.defaultAxisStrokeWidth = 1;
SVGPlot.defaultMargins = 0;
SVGPlot.defaultTickLength = 2;
SVGPlot.defaultStyle = null;   // To be set by resetPlot()


////////////////////////////
//  Constructor
////////////////////////////

SVGPlot.prototype.__init__ = function (widthOrIdOrNode, height, id /*optional*/) {
    /***
        Can pass it in an SVG object, or can pass it things that the SVG constructor uses.
    ***/
    // Aditional State:
    SVGCanvas.startingState.plotCoordinates = false // instead of (i,j) use (x,y) or (r,theta) or (category, date) or whatever
    SVGCanvas.startingState.pointFunction = null // a function that takes a row of data and draws a point
    SVGCanvas.startingState.lineFunction = null // takes start and stop and draws a line (possibly smooth or of varying thickness/color.)
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
    SVGPlot.defaultStyle = this.getStyle();
}



////////////////////////////
//  Plot Class Initializations
////////////////////////////


// All objects have an element and svgPlot member.

                
/*

Alternative layout where things have links to the range rather than being contained in a range.  Flatter, but more interlinked heirarchy -- harder for XML

SVGPlot.Layout = {}
SVGPlot.Box = {}     // box
    SVGPlot.Graphic = {}  // Random shapes tied to (i,j) not (x,y) coordinates.  When plot is zoomed/moved, do these go too?
    SVGPlot.Ledgend = {} // List of the names of the plots.  Auto or manual.
    SVGPlot.Range = {} // becomes a list of ranges that can be linked to by everything else.
    SVGPlot.LinePlot = {}   // plot  (xrange and yrange)
    SVGPlot.ScatterPlot = {}   // plot  (xrange and yrange)
    SVGPlot.Decoration = {}  // (xrange and yrange) like arrows pointing to specific places on the plot.  tied to (x,y) not (i,j).  When plot is zoomed/moved, these move around.
    SVGPlot.Axis = {}   // xAxis, yAxis (xrange or yrange)
        SVGPlot.AxisTitle = {}  // xAxisTitle, yAxisTitle
        SVGPlot.Ticks = {}  // xTicks, yTicks
        SVGPlot.TickLabels = {}  // xTickLabels, yTickLabels
        SVGPlot.Gridlines = {} // xGridlines, yGridlines

*/

SVGPlot.Layout = {}
SVGPlot.Box = {}     // box
    SVGPlot.Graphic = {}  // Random shapes tied to (i,j) not (x,y) coordinates.  When plot is zoomed/moved, do these go too?
    SVGPlot.Ledgend = {} // List of the names of the plots.  Auto or manual.
    SVGPlot.View = {}   // view  Is this Heirarchy too deep with this?  You need it for xtoi()
        SVGPlot.LinePlot = {}   // plot
        SVGPlot.ScatterPlot = {}   // plot
        SVGPlot.Decoration = {}  // like arrows pointing to specific places on the plot.  tied to (x,y) not (i,j).  When plot is zoomed/moved, these move around.
        SVGPlot.Range = {}      // xRange, yRange
            SVGPlot.Axis = {}   // xAxis, yAxis
                SVGPlot.AxisTitle = {}  // xAxisTitle, yAxisTitle
                SVGPlot.Ticks = {}  // xTicks, yTicks
                SVGPlot.TickLabels = {}  // xTickLabels, yTickLabels
                SVGPlot.Gridlines = {} // xGridlines, yGridlines




SVGPlot.Box.prototype = {}                // box
    SVGPlot.View.prototype = {}   // view
        SVGPlot.LinePlot.prototype = {}   // plot
        SVGPlot.Range.prototype = {}      // xRange, yRange
            SVGPlot.Axis.prototype = {}   // xAxis, yAxis
            SVGPlot.AxisTitle.prototype = {}  // xAxisTitle, yAxisTitle
            SVGPlot.Ticks.prototype = {}  // xTicks, yTicks
            SVGPlot.TickLabels.prototype = {}  // xTickLabels, yTickLabels
            SVGPlot.Gridlines.prototype = {} // xGridlines, yGridlines


/*
Setters set properties of current object.
    If the current object doesnt' exist, it creates a new one
    If you pass in null or don't pass anything retains current value.
        If the current value doesn't exist, it choses a reasonable default value.
Adders create a new object and call the Setter.
Removers remove the object.
*/

// Plotting Commands

SVGPlot.genericConstructor = function(self, svgPlot, parent) {
    self.svgPlot = svgPlot;
    self.parent = parent;
    self.element = null;
    self.style = svgPlot.getStyle();
}


// Box -- The area that the plot and axes appear.  Seperate background for box and plotArea

SVGPlot.Box = function(svgPlot, parent,
                        layout /* ='float' */, x /* =0 */, y /* =0 */, width /* =svgWidth */, height /* =svgHeight */) {
    SVGPlot.genericConstructor(this, svgPlot, parent);
    this.boxBackgroundStroke = null;
    this.boxBackgroundFill = null;
    this.plotAreaBackgroundStroke = null;
    this.plotAreaBackgroundFull = null;
    this.set(layout, x, y, width, height);
    parent.boxes.push(this)
    this.views = [];
}

SVGPlot.Box.prototype.set = function(layout /* ='float' */, x /* =0 */, y /* =0 */, width /* =svgWidth */, height /* =svgHeight */) {
    this.x = SVGPlot.firstNonNull(x, this.x, 0);
    this.y = SVGPlot.firstNonNull(y, this.y, 0);
    var svg_width = parseFloat(this.svgPlot.svg.svgElement.getAttribute('width'));
    var svg_height =  parseFloat(this.svgPlot.svg.svgElement.getAttribute('height'));
    this.width  = SVGPlot.firstNonNull(width,  this.width, svg_width);
    this.height = SVGPlot.firstNonNull(height, this.height,svg_height);
}

SVGPlot.Box.addDefaults = function() {
    this.save();
    this.setStyle(SVGPlot.defaultStyle);
    this.addView();
    //this.coordinates._autoAdded = true;
    this.addViewDefaults();
    this.restore();
}

SVGPlot.prototype.setBox = function(layout /* ='float' */, x /* =0 */, y /* =0 */, width /* =svgWidth */, height /* =svgHeight */) {
    this.box.set(layout, x, y, width, height);
    return this.box;
}

SVGPlot.prototype.addBox  = function(layout /* ='float' */, x /* =0 */, y /* =0 */, width /* =svgWidth */, height /* =svgHeight */)  {
    this.box = new SVGPlot.Box(this, this);
    this.box.set(layout, x, y, width, height);
    return this.box;
}

// View  -- View eventually defines mapping (x,y) -> (i,j).  What about polar?

SVGPlot.View = function(svgPlot, parent) {
    SVGPlot.genericConstructor(this, svgPlot, parent);
    parent.views.push(this);
    this.xRange = new Range();
    this.yRange = new Range();
    this.plots = [];  // Plots to be drawn with this coordinate system
}

SVGPlot.View.prototype.setXRange = function(xmin /* ='auto' */, xmax /* ='auto' */, xreverse /*=false*/, xlog /*=false*/ ) {
    this.xRange.set(xmin, xmax, xreverse, xlog);
}

SVGPlot.View.prototype.setYRange = function(ymin /* ='auto' */, ymax /* ='auto' */, yreverse /*=false*/, ylog /*=false*/ ) {
    this.yRange.set(ymin, ymax, yreverse, ylog);
}

SVGPlot.prototype.setXRange = function(xmin /* ='auto' */, xmax /* ='auto' */, xreverse /*=false*/, xlog /*=false*/ ) {
    if (this.views == null)
        this.views = new SVGPlot.View(this, this.box);
    this.views.setXRange(xmin, xmax, xreverse, xlog);
    return this.views;
}

SVGPlot.prototype.setYRange = function(ymin /* ='auto' */, ymax /* ='auto' */, yreverse /*=false*/, ylog /*=false*/ ) {
    if (this.views == null)
        this.views = new SVGPlot.View(this, this.box);
    this.views.setYRange(ymin, ymax, yreverse, ylog);
    return this.views;
}

SVGPlot.prototype.setRange = function(xmin /* ='auto' */, xmax /* ='auto' */, xreverse /*=false*/, xlog /*=false*/,
                                       ymin /* ='auto' */, ymax /* ='auto' */, yreverse /*=false*/, ylog /*=false*/) {
    if (this.views == null)
        this.views = new SVGPlot.View(this, this.box);
    this.views.setXRange(xmin, xmax, xreverse, xlog);
    this.views.setYRange(ymin, ymax, yreverse, ylog);
    return this.views;
}

SVGPlot.prototype.addView = function(xmin /* ='auto' */, xmax /* ='auto' */, xreverse /*=false*/, xlog /*=false*/,
                                       ymin /* ='auto' */, ymax /* ='auto' */, yreverse /*=false*/, ylog /*=false*/) { 
    this.views = new SVGPlot.View(this, this.box);
    this.views.setXRange(xmin, xmax, xreverse, xlog);
    this.views.setYRange(ymin, ymax, yreverse, ylog);
    return this.views;
}

SVGPlot.prototype.addViewDefaults = function() {
    /***
        Adds axes and axes defaults to current Range.
    ***/
    this.save();
    this.setStyle(SVGPlot.defaultStyle);
    this.addXAxis();
    //this.xAxis._autoAdded = true;
    this.addXAxisDefaults();
    this.addYAxis();
    //this.yAxis._autoAdded = true;
    this.addYAxisDefaults();
    this.restore();
}

// Range -- for one coordinate (either x or y)

SVGPlot.LinearRange = null
SVGPlot.LogRange = null
SVGPlot.SqrtRange = null // See difference between theory and error
SVGPlot.CagetoryRange = null
SVGPlot.DateTimeRange = null  // Is this just an integer range and only labels and where auto-ticks go matter?

SVGPlot.Range = function(min /* ='auto' */, max /* ='auto' */, reverse /*=false*/, log /*=false*/ ) {
    this.set(min, max, reverse, log)
}

SVGPlot.Range.prototype.set = function(min /* ='auto' */, max /* ='auto' */, reverse /*=false*/, log /*=false*/ ) {
    /***
        Defaults are first the current ragne, 
        then auto if that doesn't exist.
    ***/
    this.min = SVGPlot.firstNonNull(min, this.min, 'auto');
    this.max = SVGPlot.firstNonNull(max, this.max, 'auto');
    this.reverse = SVGPlot.firstNonNull(reverse, this.reverse, false);
    this.log = SVGPlot.firstNonNull(log, this.log, false);
}

// Axis

SVGPlot.Axis = function(svgPlot, parent, type, position /* = 'bottom' */, range_type /* ='lnear' */) {
    SVGPlot.genericConstructor(this, svgPlot, parent);
    this.set(type, position, range_type)
    this.ticks = [];
    this.tickLabels = [];
    this.labels = [];
}

SVGPlot.Axis.prototype.set(type, position /* 'bottom' */, range_type /* ='lnear' */) {
    this.type = 'x'
    this.position = SVGPlot.firstNonNull(position, this.position, 'bottom');
    this.range_type = SVGPlot.firstNonNull(range_type, this.range_type, 'linear');
}

SVGPlot.Axis.prototype.addDefaults() {
    this.save();
    this.setStyle(SVGPlot.defaultStyle);
    this.addTicks(this.type);
    this.addTickLabels(this.type);
    this.restore();
}

SVGPlot.prototype.setXAxis = function(position /* 'bottom' */, range_type /* ='lnear' */) {
    if (this.xAxis == null)
        this.xAxis = new SVGPlot.Axis(this, this.views, 'x', position, range_type);
    else
        this.xAxis.set('x', position, range_type);
}

SVGPlot.prototype.setYAxis = function(position /* 'left' */, range_type /* ='lnear' */) {
    if (this.yAxis == null)
        this.yAxis = new SVGPlot.Axis(this, this.views, 'y', position, range_type);
    else
        this.xAxis.set('y', position, range_type);
}

SVGPlot.prototype.addXAxis = function(position /* 'bottom' */, range_type /* ='lnear' */) {
    this.xAxis = new SVGPlot.Axis(this, this.views, 'x', position, range_type);
    this.views.xAxes.push(this.xAxis);
    return this.xAxis;
}

SVGPlot.prototype.addYAxis = function(position /* 'left' */, range_type /* ='lnear' */) {
    this.yAxis = new SVGPlot.Axis(this, this.views, 'y', position, range_type);
    this.views.yAxes.push(this.yAxis);
    return this.yAxis;
}


// AxisTitle

SVGPlot.AxisTitle = function(svgPlot, parent,
                               text, location /* ='50%' */, position /* 'left' */) {
    SVGPlot.genericConstructor(this, svgPlot, parent);
    this.set(text, location, position);
}

SVGPlot.AxisTitle.set = function(text, location /* ='50%' */, position /* 'left' */) {
    this.text = text;
    this.location = SVGPlot.firstNonNull(location, this.loc, '50%');
    this.position = SVGPlot.firstNonNull(position, this.position, 'left');
}

SVGPlot.prototype.setXAxisTitle = function(text, location /* ='50%' */, position /* 'left' */) {
    if (this.xAxisTitle == null)
        this.xAxisTitle = new SVGPlot.AxisTitle(this. this.xAxis, text, location, position);
    else
        this.xAxisTitle.set(text, location, position);
}

SVGPlot.prototype.setYAxisTitle = function(text, loc /* ='50%' */, position /* 'bottom' */) {
    if (this.yAxisTitle == null)
        this.yAxisTitle = new SVGPlot.AxisTitle(this. this.yAxis, text, location, position);
    else
        this.yAxisTitle.set(text, location, position);
}

SVGPlot.prototype.addXAxisTitle = function(text, loc /* ='50%' */, position /* 'left' */) {
    this.xAxisTitle = new SVGPlot.AxisTitle(this. this.xAxis, text, location, position);
    this.xAxisTitle.set(text, location, position);
    return this.xAxisTitle;
}

SVGPlot.prototype.addYAxisTitle = function(text, loc /* ='50%' */, position /* 'bottom' */) {
    this.yAxisTitle = new SVGPlot.AxisTitle(this. this.yAxis, text, location, position);
    this.yAxisTitle.set(text, location, position);
    return this.yAxisTitle;
}



// AxisItem -- Ticks, TickLabels, Gridlines

SVGPlot.AxisItem = function(svgPlot, parent, locations /*='auto'*/, position /* ='bottom' */) {
    SVGPlot.genericConstructor(this, svgPlot, parent);
    this.set(type, locations, position);
}

SVGPlot.AxisItem.set(locations /*='auto'*/, position /* ='bottom' */) {
    this.locations = SVGPlot.firstNonNull(locations, this.locations, 'auto');
    this.position = SVGPlot.firstNonNull(position, this.position, 'bottom');
}

// Ticks -- includes functionality also for TickLabels and TickLines (grid)

SVGPlot.Ticks = function(svgPlot, parent,
                          locations /*='auto'*/, position /* ='bottom' */, length /* =2 */, 
                          minorPerMajor /* = 4 */, minorLength /* =length/2 */) {
    this.set(locations, position, length, minorPerMajor, minorLength);
}
SVGPlot.Ticks.prototype = new SVGPlot.AxisItem();
SVGPlot.Ticks.prototype.constructor = SVGPlot.AxisItem;
SVGPlot.Ticks.superclass = SVGPlot.AxisItem.prototype;

SVGPlot.Ticks.prototype.set = function(locations /*='auto'*/, position /* ='bottom' */, length /* =2 */, 
                                         minorPerMajor /* = 4 */, minorLength /* =length/2 */) {
    this.superclass.set(locations, position)
    this.length = SVGPlot.firstNonNull(locations, this.locations, 2);
    this.minorPerMajor = SVGPlot.firstNonNull(minorPerMajor, this.minorPerMajor, 4);
    this.minorLength = SVGPlot.firstNonNull(minorLength, this.minorLength, this.length/2);
}

SVGPlot.prototype.setXTicks = function(locations /*='auto'*/, position /* ='bottom' */, length /* =2 */, 
                                         minorPerMajor /* = 4 */, minorLength /* =length/2 */) {
    if (this.xTicks == null)
        this.xTicks = new Ticks('x', locations, position, length, minorPerMajor, minorLength)
    else
        this.xTicks.set('x', locations, position, length, minorPerMajor, minorLength)
}

SVGPlot.prototype.setYTicks = function(locations /*='auto'*/, position /* ='left' */, length /* =2 */, 
                                         minorPerMajor /* = 4 */, minorLength /* =length/2 */) {
    if (this.yTicks == null)
        this.yTicks = new Ticks('x', locations, position, length, minorPerMajor, minorLength)
    else
        this.yTicks.set('x', locations, position, length, minorPerMajor, minorLength)
}

SVGPlot.prototype.removeXTicks = function() {
    
}

SVGPlot.prototype.removeYTicks = function() {
    
}

SVGPlot.prototype.addXTicks = function(locations /*='auto'*/, position /* ='left' */, length /* =2 */, 
                                         minorPerMajor /* = 4 */, minorLength /* =length/2 */) {
    this.xTicks = new SVGPlot.Ticks(this, this.xAxis, 'x', locations, position, length, minorPerMajor, minorLength);
    this.xAxis.ticks.push(this.xTicks);
    return this.xTicks;
}

SVGPlot.prototype.addYTicks = function(locations /*='auto'*/, position /* ='left' */, length /* =2 */, 
                                         minorPerMajor /* = 4 */, minorLength /* =length/2 */) {
    this.yTicks = new SVGPlot.Ticks(this, this.yAxis, 'y', locations, position, length, minorPerMajor, minorLength);
    this.yAxis.ticks.push(this.yTicks);
    return this.yTicks;
}



////////////////////////////
//  createElement(), layout() and render()
////////////////////////////

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
    // Add a clipping box (optional and not yet implimented) data shouldn't leak out (or should it?)
    
    
    // Set any auto-ranges before we create any tickLabels. If the tickLabels are 'auto', they need to know the range.
    for (var i=0; i<this.coordinatesSystem.length; i++) {
        this.coordinatesSystem[i].setAutoView();
        this.coordinatesSystem[i].createElement();
    }
    
    this.svgPlot.svg.svgElement.forceRedraw();  // So that all of the tickLabels have bounding boxes for the layout.
    
    var totalXSize = {'left':0, 'right':0, 'first_left':true, 'first_right':true};
    var totalYSize = {'top':0, 'bottom':0, 'first_top':true, 'first_bottom':true};
    
    for (var i=0; i<this.views.length; i++) {
        this.views[i].layout(totalXSize, totalYSize);
    }
    
    // Find the Plot Area bounds
    var top = totalYSize.top;
    var bottom = this.height-totalYSize.bottom;
    var left = totalXSize.left;
    var right = this.width-totalXSize.right;
    
    for (var i=0; i<this.views.length; i++) {
        this.views[i].render(left, right, top, bottom)
    }
    
}

SVGPlot.View.prototype.createElement = function() {
    SVGPlot.createGroupIfNeeded(this, 'range');
    
    for (var j=0; j<this.xAxes.length; j++) {
        this.xAxes[j].createElement();
    }
    for (var j=0; j<this.yAxes.length; j++) {
        this.yAxes[j].createElement();
    }
    for (var j=0; j<this.plots.length; j++) {
        this.plots[j].createElement();
    }
}

SVGPlot.Axis.prototype.createElement = function() {
    SVGPlot.createGroupIfNeeded(this, 'axis', 'stroke');
    
    for (var k=0; k<this.ticks.length; k++)
        this.ticks[k].createElement()
    for (var k=0; k<this.tickLabels.length; k++)
        this.tickLabels[k].createElement()
    for (var k=0; k<this.labels.length; k++)
        this.labels[k].createElement()
}


SVGPlot.Ticks.prototype.createElement = function() {
    SVGPlot.createGroupIfNeeded(this, 'ticks', 'stroke');
}

SVGPlot.TickLabels.prototype.createElement = function() {
    SVGPlot.createGroupIfNeeded(this, 'tickLabels', 'text');
    
    this._locations = this.locations;
    if (this.locations=='auto') {
        if (this.parent.type=='x')
            this._locations = SVGPlot.defaultlocations(this.parent.parent._xmin, this.parent.parent._xmax);
        else if (this.parent.type=='y')
            this._locations = SVGPlot.defaultlocations(this.parent.parent._ymin, this.parent.parent._ymax);
    }
    
    var label_strs = this.labels
    if (this.labels=='auto')
        label_strs = map(SVGPlot.prettyNumber, this._locations);
    
    MochiKit.DOM.replaceChildNodes(this.element);
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
    for (var i=0; i<this._locations.length && i<label_strs.length; i++) {
        p.applyStyles = false;
        var text = p.text(label_strs[i]);
        this._texts.push(text);
    }
    p.restore();
}

SVGPlot.AxisTitle.prototype.createElement = function() {
    SVGPlot.createGroupIfNeeded(this, 'label', 'text');

    MochiKit.DOM.replaceChildNodes(this.element);

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

SVGPlot.autoViewMarginFactor = 0.05;

SVGPlot.View.prototype.setAutoView = function(include_zero /* =false */) {
    
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
        if (extents.min>0.0 && ( extents.min<total*SVGPlot.autoViewMarginFactor ||
                          (typeof(include_zero) != 'undefined' && include_zero == true) ) )
            extents.min = 0.0;
        if (extents.max<0.0 && (-extents.max<total*SVGPlot.autoViewMarginFactor ||
                          (typeof(include_zero) != 'undefined' && include_zero == true) ) )
            extents.max = 0.0;
        
        // If neither one lies on the origin, give them a little extra room.  TODO Make this an option
        /*
        if (min!=0.0)
            min = min - total * SVGPlot.autoViewMarginFactor;
        if (max!=0.0)
            max = max + total * SVGPlot.autoViewMarginFactor;
        */
    }
    
    fixExtents(xExtents, yExtents);
    
    this._xmin = (this.xmin!='auto') ? this.xmin : xExtents.min;
    this._xmax = (this.xmax!='auto') ? this.xmax : xExtents.max;
    this._ymin = (this.ymin!='auto') ? this.ymin : yExtents.min;
    this._ymax = (this.ymax!='auto') ? this.ymax : yExtents.max;
}

SVGPlot.View.prototype.bankTo45deg = function(/*[ { xextents:[xmin, xmax], 
                                                      yextents:[ymin, ymax], 
                                                      curve:[[x,y],[x,y]...] }, ...]*/) {
    /***
        For good perception of rates of change, you want the median line-segment to
        be banked at 45 degrees (prhaps weighted by the length of the segments.)
        
        The curve is given by an ordered list of x,y coordinates.
        
        If you're plotting multiple curves on one graph, or plotting curves in many 
        panels, the banking to 45deg should include the effects of all curves.
        Because different curves can have different min/max, this information must
        be passed in for each curve.
        
        @returns aspect ratio as a float.  This can be used to size the physical graph.
    ***/
}

SVGPlot.View.prototype.layout = function (totalXSize, totalYSize) {
    for (var i=0; i<this.xAxes.length; i++)
        this.xAxes[i].layout(totalXSize, totalYSize);
    for (var i=0; i<this.yAxes.length; i++)
        this.yAxes[i].layout(totalXSize, totalYSize);
}

SVGPlot.axisMargin = 1;
SVGPlot.componentMargin = 1;

SVGPlot.Axis.prototype.layout = function(totalXSize, totalYSize) {
    var offsets = {'above':0.5, 'below':0.5};  // TODO actually find line-width
    
    var components = [this.ticks, this.tickLabels, this.labels];
    
    // Layout ticks, tickLabels, labels
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

SVGPlot.TickLabels.prototype.getSize = function(type) {
    return SVGPlot.getTextSize(this.element, type);
}

SVGPlot.AxisTitle.prototype.getSize = function(type) {
    return SVGPlot.getTextSize(this.element, type);
}

SVGPlot.getTextSize = function(element, type) {
    // Add up the space that tickLabels and labels take up, but only if they are not covering the graph.
    var bbox = element.getBBox();
    if (type=='x')
        return bbox.height;
    else if (type=='y')
        return bbox.width;
}

SVGPlot.AxisTitle.prototype.layoutText = SVGPlot.TickLabels.prototype.layoutText;

SVGPlot.View.prototype.render = function(left, right, top, bottom) {
    this._width = right-left;
    this._height = bottom-top;
    this._xrange = this._width/(this._xmax-this._xmin);
    this._yrange = this._height/(this._ymax-this._ymin);
    function xtoi(xmin, xrange, x) { return (x-xmin)*xrange }
    this.xtoi = partial(xtoi, this._xmin, this._xrange);
    function ytoj(ymin, yrange, height, y) { return height - (y-ymin)*yrange }
    this.ytoj = partial(ytoj, this._ymin, this._yrange, this._height);
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
    //MochiKit.DOM.replaceChildNodes(this.element);  // TODO Remove the paths.
    this.element.appendChild(pathElem);
    
    var components = [this.ticks, this.tickLabels, this.labels];
    
    // Translate and then render ticks, tickLabels, labels
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
    
    var locations = this.locations
    if (this.locations=='auto')
        locations = SVGPlot.defaultlocations(min, max, this.interval, this.number);
    var path = '';
    for (var k=0; k<locations.length; k++) {
        if (locations[k]>min && locations[k]<max) {
            if (this.position=='top')
                path += ' M '+map(locations[k])+' 0 '+'v '+(-this.length);
            else if (this.position=='bottom')
                path += ' M '+map(locations[k])+' 0 '+'v '+(this.length);
            else if (this.position=='right')
                path += ' M 0 '+map(locations[k])+'h '+(this.length);
            else if (this.position=='left')
                path += ' M 0 '+map(locations[k])+'h '+(-this.length);
        }
    }
    MochiKit.DOM.replaceChildNodes(this.element);
    this.element.appendChild( this.svgPlot.svg.PATH({'d':path}) );
}

SVGPlot.TickLabels.prototype.render = function(min, max, map) {
    SVGPlot.translateBottomText(this)
    for (var i=0; i<this._texts.length; i++) {
        SVGPlot.renderText(this._texts[i], this._locations[i], 
                             this._texts[i].getBBox(), 
                             this.position, min, max, map)
    }
}

SVGPlot.AxisTitle.prototype.render = function(min, max, map) {
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




////////////////////////////
//  Line Plot
////////////////////////////


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
        this.box.addDefaults();
    }
    
    for (var i=1; i<arguments.length; i++)
        this.plot = new SVGPlot.LinePlot(this, this.coordinates, xorydata, arguments[i]);
    return this.plot;  // Last line plot.  Not of much use, really.
}

SVGPlot.LinePlot = function(svgPlot, parent, xdata, ydata) {
    SVGPlot.genericConstructor(this, svgPlot, parent);
    parent.plots.push(this)
    this.xdata = xdata;
    this.ydata = ydata;
}


SVGPlot.LinePlot.prototype.createElement = function () {
    SVGPlot.createGroupIfNeeded(this, 'line-plot', 'stroke');
}

SVGPlot.LinePlot.prototype.render = function(left, right, top, bottom, xtoi, ytoj) {
    
    
    MochiKit.DOM.replaceChildNodes(this.element);
    
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
    // TODO Handle cases where the plot goes WAY off the  ranges.
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

SVGPlot.prototype.setPlotStyle = function() {
    this.plot.style = this.getStyle();
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


// ScatterPlot
 
SVGPlot.prototype.plotScatter = function(xdata, ydata) {
}
 
SVGPlot.prototype.plotScatterStyle = function(xdata, ydata /* val1, val2, val3 */) {
}

// Color Functions

/*
    If you passed plotLine(x, y, p, q) for each point the
    color function gets passed colorFunction([x, xin, xmax], [y, ymin, ymax],
                                             [p, pmin, pmax], [q, qmin, qmax])
    and it has to return an [r, g, b, a] value.  For line plots and area plots,
    a gradient is constructed from the color functions.  For scatterPlots and columns
    and stuff, 
*/

SVGPlot.prototype.colorCycle = function(colorList) {
}

SVGPlot.prototype.colorDarken = function() {
}


// Marker Fnuctions
/*
    This allows you do draw things like error bars, set colors, draw
    funny shapes, draw whiskers that point in a given direction.
*/

SVGPlot.prototype.markerShapeCycle = function(shapeList) {
}

SVGPlot.prototype.markerSize = function() {
}

SVGPlot.prototype.markerColor = function() {
}





////////////////////////////
// Utility Functions
////////////////////////////



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

SVGPlot.defaultlocations = function(min, max, interval /* defaultInterval */, number /* =7 */, avoid /* = [min, max] */, offset /* = 0*/) {
    /***
        Come up with locations for the ticks/grids/tickLabels, etc.
        @param min -- the actual start of the range (can be some non-round number)
        @param max -- the actual end of the range (can be some non-round number)
        @param interval -- the interval at which you want the ticks, usually 1, 2, 3, 5, 10, 20, etc.
        @param avoid -- an array of locations to avoid putting a mark (usually the axes and endpoints.)
        @param offset -- the ticks start counting around here (defaults to zero)
        
        @returns an array of floats which list the tick locations.
        
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
    
    locations = [];
    var avoidance = (max-min)*SVGPlot.autoViewMarginFactor;
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
    var backupStyle = p.getStyle();
    p.setStyle(self.style);
    
    if (style_type=='text') {
        p._setFontAttributes(self.element);
        style_type = 'fill'
    }
    p._setGraphicsAttributes(self.element, style_type);
    
    p.setStyle(backupStyle);
}




////////////////////////////
// Plot Data
////////////////////////////


/***
    The following work for array style data of the form:
    { x:[7, 4, ...], 
      y:[3, 2, ...],
      a:[6, 9, ...] }
***/

SVGPlot.prototype.maxmin = function(data, max, min) {
    for (key in data) {
        min[key] = reduce(Math.min, data[key]);
        max[key] = reduce(Math.max, data[key]);
    }
}

/***
    The following work for SQL/JSON style data of the form:
    [{x:7, y:3, a:6}, {x:4, y:2, a:9}, ...]
***/

SVGPlot.prototype.maxmin = function(data, max, min) {
    /***
    
        Call this with:
            var max = {}
            var min = {}
            maxmin(data, max, min);
        It will fill in max and min.
        If data is empty, max and min are unchanged.
    ***/
    //reduce(max_fn, data)
    forEach(data, function(raw_row) {
        row = this.evaluate_row(MochiKit.Base.clone(raw_row));
        foreach(key in keys, {
            if (MochiKit.Base.isUndefinedOrNull(max[key]) || row[key]>max[key])
                max[key] = row[key];
            if (MochiKit.Base.isUndefinedOrNull(min[key]) || row[key]<mix[key])
                min[key] = row[key];
        })
    })
}

SVGPlot.prototype.evaluate_table = function(raw_table) {
    return applymap(this.evaluate_row, raw_table);
}

SVGPlot.prototype.evaluate_row = function(raw_row) {
    var row = MochiKit.Base.clone(raw_row)
    for(key in row) {
        if (typeof(row[key])=='function') {
            this.evaluate_item(row, key)
        }
    }
    return row;
}

SVGPlot.prototype.evaluate_item = function(row, key) {
    if(MochiKit.Base.isUndefinedOrNull(row['__circular_check__']) {
        row['__circular_check__']= {}
    }
    if (!MochiKit.Base.isUndefinedOrNull(row['__circular_check__'][key])) {
        throw "Circular reference in "+row+" for item "+key;
    }
    else {
        row['__circular_check__'][key] = 1;
        row[key] = row[key].call(this, row);  // Each function needs to call evaluate_item()
        row['__circular_check__'][key] = null;
    }
}


////////////////////////////
//  Override SVGCanvas to use Plot Coordinates
////////////////////////////


SVGPlot.map_xtoi = function(x) {
    if (this.plotView && typeof(x) != 'undefined' && x != null)
        return this.xtoi(x);
    return x;
}
SVGPlot.map_ytoj = function(y) {
    if (this.plotView && typeof(y) != 'undefined' && y != null)
        return this.ytoj(y);
    return y;
}
SVGPlot.map_width = function(width) {
    if (this.plotView && typeof(width) != 'undefined' && width != null)
        return Math.abs(this.xtoi(width) - this.xtoi(0))
    return width;
}
SVGPlot.map_height = function(height) {
    if (this.plotView && typeof(height) != 'undefined' && height != null)
        return Math.abs(this.ytoj(height) - this.ytoj(0))
    return height;
}
SVGPlot.map_radius = function(radius) {
}
/*
SVGPlot.prototype.translate = function(tx, ty) {}
SVGPlot.prototype.moveTo = function(x, y) {}
SVGPlot.prototype.lineTo = function(x, y) {}
SVGPlot.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {}
SVGPlot.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {}
SVGPlot.prototype.rect = function (x, y, w, h) {}
SVGPlot.prototype.arcTo = function (x1, y1, x2, y2, radius) {}
SVGPlot.prototype.arc = function (x, y, radius, startAngle, endAngle, anticlockwise) {}
SVGPlot.prototype.clip = function (x, y, width, height) {}
SVGPlot.prototype.clipRect = function(x, y, w, h) {}
SVGPlot.prototype.strokeRect = function (x, y, w, h) {}
SVGPlot.prototype.fillRect = function (x, y, w, h) {}
SVGPlot.prototype.clearRect = function (x, y, w, h) {}
SVGPlot.prototype.text = function(text, x , y) {}
SVGPlot.prototype.createLinearGradient = function (x0, y0, x1, y1) {}
SVGPlot.prototype.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {}
SVGPlot.prototype.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {}
*/


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

// independent vertical ranges on same plot for different types of data overlayed
// that have the same x-axis.  Dependent ranges like foot and meter.

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
