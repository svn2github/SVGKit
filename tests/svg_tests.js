var testFunctions = {
    
    'boxcircle' : function(svg) {
        var rect = svg.RECT({'x':10, 'y':10, 'width':80, 'height':80, 'fill':'blue', 'fill-opacity':.5});
        svg.append(rect);
        svg.append( svg.CIRCLE( {'cx':50, 'cy':50, 'r':20, 'fill':'purple', 'fill-opacity':.3} ) );
    },
    
    'drag' : function(svg) {
        var rect = svg.RECT({'x':10, 'y':10, 'width':80, 'height':80, 'fill':'blue', 'fill-opacity':.5});
        svg.append(rect);
        svg.enableDrag(rect);
    },
    
    'zoom' : function(svg) {
        var rect = svg.RECT({'x':10, 'y':10, 'width':80, 'height':80, 'fill':'blue', 'fill-opacity':.5});
        svg.append(rect);
        svg.enableZoom(rect);
    },
    
    'pan' : function(svg) {
        var rect = svg.RECT({'x':10, 'y':10, 'width':80, 'height':80, 'fill':'blue', 'fill-opacity':.5});
        svg.append(rect);
        svg.enablePan(rect);
    },
    
    'panzoom' : function(svg) {
        var rect = svg.RECT({'x':10, 'y':10, 'width':80, 'height':80, 'fill':'blue', 'fill-opacity':.5});
        svg.append(rect);
        svg.enablePan(rect);
        svg.enableZoom(rect);
    },
    
    'follow' : function(svg) {
        var rect = svg.RECT({'x':10, 'y':10, 'width':80, 'height':80, 'fill':'blue', 'fill-opacity':.5});
        svg.append(rect);
        svg.enableFollow(rect);
    },
    
    'PanZoomImmunity' : function(svg) {
        var rect = svg.RECT({'x':10, 'y':10, 'width':80, 'height':80, 'fill':'blue', 'fill-opacity':.5});
        svg.append(rect);
        svg.enablePanZoomImmunity(rect);
    }
};

function doTest(svgTD, functionArea, svgSrcArea, buttonXML) {
    var svg;
    var testFunction = eval(functionArea.value);
    svg = new SVGKit(200, 200);
    var setSVGSrc = function (svg, textarea) {
        replaceChildNodes(textarea, svg.toXML());
    }
    svg.whenReady( partial(testFunction, svg) );
    svg.whenReady( partial(setSVGSrc, svg, svgSrcArea) );
    addToCallStack(buttonXML, 'onclick', partial(setSVGSrc, svg, svgSrcArea) );
    replaceChildNodes(svgTD, svg.htmlElement);
}

function addTests() {
    log("getting table");
    var table = $('tests');
    var i = 0, start = 0, number = 2;
    var buttonDoIt, buttonXML;
    for (var test in testFunctions) {
        if (i>=start && i-start<number) {
            log("doing test number ", i, "name ", test);
            var plotSrc = (''+testFunctions[test]+'\n').replace(/ +/g, " ");
            var functionArea, svgSrcArea, button, svgTD, button;
            var tr = TR(null, TD(null, ""+i+": "+test, BR(null), IMG({'src':'canvas_tests_images/'+test+'.png'}) ), 
                              TD(null, functionArea=TEXTAREA({'rows':"14", 'cols':"40", 'wrap':"off"}, plotSrc),
                                       BR(null),
                                       buttonDoIt=INPUT({'type':"button", 'value':"Do It"}),
                                       " ",
                                       buttonXML=INPUT({'type':"button", 'value':"Update XML"}) ),
                              svgTD=TD(null),
                              TD(null, svgSrcArea=TEXTAREA({'rows':"16", 'cols':"60", 'wrap':"off"} ,"SVG Source") )
                        );
            appendChildNodes(table, tr);
            addToCallStack(buttonDoIt, 'onclick', partial(doTest, svgTD, functionArea, svgSrcArea, buttonXML) );
            doTest(svgTD, functionArea, svgSrcArea, buttonXML);
        }
        i++;
    }
}

addLoadEvent(addTests);
