/***

MochiKit.SVGCanvas 1.2

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.
(c) 2006 Jason Gallicchio.  All rights Reserved.
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
    MochiKit.SVGPlot = function (widthOrIdOrNode /*=100*/, height /*=100*/, id /*optional*/) {
        if (typeof(this.__init__)=='undefined' || this.__init__ == null){
            log("You called SVGCanvas() as a fnuction without new.  Shame on you, but I'll give you a new object anyway");
            return new MochiKit.SVGPlot(widthOrIdOrNode, height, id);
        }
        this.__init__(widthOrIdOrNode, height, id);
        return null;
    };
}

MochiKit.SVGPlot.NAME = "MochiKit.SVGCanvas";
MochiKit.SVGPlot.VERSION = "1.2";
MochiKit.SVGPlot.__repr__ = function () {
    return "[" + MochiKit.SVGCanvas.NAME + " " + MochiKit.SVGCanvas.VERSION + "]";
};
MochiKit.SVGPlot.prototype.__repr__ = MochiKit.SVGCanvas.__repr__;

MochiKit.SVGPlot.toString = function () {
    return this.__repr__();
};
MochiKit.SVGPlot.prototype.toString = MochiKit.SVGCanvas.toString;


MochiKit.SVGPlot.EXPORT = [
    "SVGPlot"
];

MochiKit.SVGPlot.EXPORT_OK = [
];

/* Create a SVGCanvas object that acts just like a canvas context */

MochiKit.SVGPlot.prototype.__init__ = function (widthOrIdOrNode /*=100*/, height /*=100*/, id /*optional*/) {
    /***
        Can pass it in an SVG object, or can pass it things that the SVG constructor uses.
    ***/
    var isSVG = typeof(widthOrIdOrNode) == 'object' && widthOrIdOrNode.constructor == MochiKit.SVG;
    this.svg = isSVG ? widthOrIdOrNode : new SVG(widthOrIdOrNode, height, id);
    log("Working with svg: ", this.svg, " this: ", this);
    this.svg.whenReady( bind(this.reset, this, null) );
}

MochiKit.SVGPlot.prototype.reset = function() {
    this.plotingAreas = [];
    this.currentPlottingArea = -1;
}

MochiKit.SVGPlot.prototype.plotLine = function(xdata /* ydata1, ydata2, ... */) {
    for (int i=1; i<args.length; i++) {
        this.linePlotPath(xdata, args[i]);
    }
}

MochiKit.SVGPlot.prototype.linePlotPath = function(xdata, ydata) {
    d = "";
    if (squares.length >= 1) {
        this.ctx.moveTo(xdata[0], ydata[0]);
    }
    for (var i=1; i<squares.length; i++) {
        this.ctx.lineTo(xdata[0], ydata[0]);
    }
}

// When you call something, it sets up reasonable defaults for everything else.

// autoColorIncrement = true // cycle through predefined nice default colors

// be able to pass in error bars or stock ranges with any plot
// grid lines
// grid stripes
// ledgend and/or labeling of lines

// hook up live data-sources -- JSON, XML, plain text.

/* Everything is object-oriented, but objects get created for you rather than 
   having to call constructors and link them in.  Complimentary like SVG DOM vs Canvas
   You can always access the objects through the scene-tree:
   Page  // Bad name for SVG, I guess.
     Layout[]  // How things are arranged  PlotCanvases are independent entities that can be moved anywhere without changing properties.
     PlotCanvas[]  // Arranged in some way 2x3 or floating, etc.
       Graphics[]  // Random circles floating around
       Ledgend[]  // List of the names of the overlays.  Auto or manual.
       PlotOverlay[]  // Independent sets of things all plotted over each other.  They share the same physical canvas size.
         Grid[]  // The cartesian or polar grid or checkerboard, displayed or not displayed.
         XAxis[], YAxis[], XLabels[] XTicks[], YTicks[] // Normally you want one or none, but ability to have an array of them for related axes like both deg C and deg F.
         PlotDataset[] // If you have multiple line plots that all use the same axes, they get listed here.  Also area accumulations get listed here
           Data, Label, Color, ColorFunction
           Arrows[] // pointing to specific places on the plot.
   This is all represented in the XML structure of the SVG with custom namespace to completly reconstruct these objects uppon load like Inkscape
*/


// plotLine(data)
// plotSmooth(data)
// plotStock(data)  // "Box and whisker"
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

// addColorFunction() // for complex plots and such.
// setDashing()

// addAxes('side')  // These return an Axis list so you can set currentAxis yourself
// addAxes('zero')  // For classic sin(x) plots
// addAxes('box')
// replaceAxes(axesToReplace /* optional */) // If no parameter is given, all axes replaced
// deleteAxes()
// drawXTicks('linear')  // Assumes default axis otherwise you can change currentAxis
// drawXTicks('linear', everyn)  // Multiples of pi, Months, time, 10^1, 10^2...
// drawXTicks('log')
// drawXTicks('log', everyn)
// drawXTicks(data)

// repeated for drawMinorXTicks()

// labelXAxis('linear')
// ... same
// labelXAxis(data, values)



function SVGPlot_xy_to_path_data(xydata)
{
    // TODO:  Apply scale operation to points so that linewidth stays the same.

}
