function doCanvas(canvasTD, testFunction) {
    var canvas = CANVAS({'width':200, 'height':200});
    replaceChildNodes(canvasTD, canvas);
    if (canvas.getContext) {
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,200,200);
        try{
            testFunction(ctx);
        }
        catch (e) {
            log(""+e);
        }
    }
}

function doTest(type, canvasTD, svgTD, functionArea, svgSrcArea, buttonXML, include_canvas) {
    var target, svg;
    var testFunction = eval(functionArea.value);
    if (type=='svg') {
        target = new SVGKit(200, 200);
        svg = target;
    }
    else if (type=='canvas') {
        if (!isUndefinedOrNull(include_canvas) && include_canvas==true)
            doCanvas(canvasTD, testFunction)
        target = new SVGCanvas(200, 200);
        svg = target.svg;
    }
    else if (type=='plot') {
        target = new SVGPlot(200, 200);
        svg = target.svg;
    }
    var setSVGSrc = function (svg, textarea) {
        replaceChildNodes(textarea, svg.toXML());
    }
    svg.whenReady( partial(testFunction, target) );
    svg.whenReady( partial(setSVGSrc, svg, svgSrcArea) );  // Comment out for IE
    addToCallStack(buttonXML, 'onclick', partial(setSVGSrc, svg, svgSrcArea) );
    replaceChildNodes(svgTD, svg.htmlElement);
}


function addTests(start, number, type, include_canvas) {
    log("getting table");
    var table = MochiKit.DOM.getElement('tests');
    var i = 0;
    var buttonDoIt, buttonXML;
    for (var test in testFunctions) {
        if (i>=start && i-start<number) {
            log("doing test number ", i, "name ", test);
            var code = (''+testFunctions[test]+'\n').replace(/ +/g, " ");
            var functionArea, svgSrcArea, button, svgTD, button;
            var canvasTD = null
            var tr = TR(null, TD(null, ""+i+": "+test, BR(null), IMG({'src':'canvas_tests_images/'+test+'.png'}) ) );
            if (!isUndefinedOrNull(include_canvas) && include_canvas==true)
                appendChildNodes(tr, canvasTD=TD({width:210}) )
            appendChildNodes(tr, 
                              TD(null, functionArea=TEXTAREA({'rows':"14", 'cols':"40", 'wrap':"off"}, code),
                                       BR(null),
                                       buttonDoIt=INPUT({type:"button", value:"Do It"}),
                                       " ",
                                       buttonXML=INPUT({type:"button", value:"Update XML"}) ),
                              svgTD=TD({width:210}),
                              TD(null, 
                                FORM( { name:'form_'+test, method:'post', action:"http://brainflux.org/cgi-bin/convert_svg.py"}, 
                                   svgSrcArea=TEXTAREA({rows:"14", cols:"60", wrap:"off", name:'source'} ,"SVG Source"),
                                   BR(null),
                                   buttonSVG=INPUT({type:"submit", name:"type", value:"svg"}), " ",
                                   buttonPDF=INPUT({type:"submit", name:"type", value:"pdf"}), " ",
                                   buttonPNG=INPUT({type:"submit", name:"type", value:"png"}), " ",
                                   buttonJPEG=INPUT({type:"submit", name:"type", value:"jpg"}) )
                                )
                        );
            appendChildNodes(table, tr);
            addToCallStack(buttonDoIt, 'onclick', partial(doTest, type, canvasTD, svgTD, functionArea, svgSrcArea, buttonXML, include_canvas) );
            doTest(type, canvasTD, svgTD, functionArea, svgSrcArea, buttonXML, include_canvas);
        }
        i++;
    }
}
