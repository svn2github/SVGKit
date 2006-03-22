// Require MochiKit.SVG

// Class Declaration with constructor parameters
function SVGPlot(document)
{
    this.SVGDocument = document;   // Default to document.  Okay for within SVG, must be changed externally
    this.addLinePlot = SVGPlot_addLinePlot;
    this.runExample = SVGPlot_runExample;

}

// Method Functions (done this way to save memory)

function SVGPlot_addLinePlot(xydata)
{
    var plotCanvas = this.SVGDocument.getElementById("plotcanvas")
    var plotPath = new this.xy_to_path(xydata)
    plotCanvas.addChildNode(plotPath)
    var roof = this.SVGDocument.getElementById("roof");
    roof.setAttribute("transform", 'translate(' + 290*(1-percentOpen/100) + ',0)' );
}

function SVGPlot_rotateTelescope(degrees)
{
    var telescope = this.SVGDocument.getElementById("telescope");
    var transform = 'translate(535,210) rotate(' + degrees + ') translate(-535,-210)';
    telescope.setAttribute("transform", transform);
}

function SVGPlot_runExample()
{   /*
    var squares = [][];
    for (var i=0; i<10; i++) {
        squares[i][1] = i;
        squares[i][2] = i*i;
    }
    this.addLinePlot(squares)
    */
}

function SVGPlot_xy_to_path_data(xydata)
{
    d = "";
    if (squares.length >= 1) {
        d += "M " + xydata[0][1] + "," + xydata[0][2];
    }
    for (var i=1; i<squares.length; i++) {
        d += "L " + xydata[i][1] + "," + xydata[i][2];
    }
    return d;
}
