converter_url = 'http://brainflux.org/cgi-bin/convert_svg.py'

function setupTopBar() {
    getElement('start').value = 0
    var i = 0;
    for (var test in testFunctions) {
        i++
    }
    getElement('end').value = i-1
    getElement('count').textContent = i-1
}

function runTests() {
    addTests(getElement('start').value, getElement('end').value)
}

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

function doTest(canvasTD, svgTD, functionArea, svgSrcArea, buttonXML, include_canvas) {
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


function addTests(start, end) {
    log("getting table");
    var tbody = getElement('tests');
    replaceChildNodes(tbody)
    var i = 0;
    var buttonDoIt, buttonXML;
    for (var test in testFunctions) {
        if (i>=start && i<=end) {
            log("doing test number ", i, "name ", test);
            var code = (''+testFunctions[test]+'\n').replace(/ +/g, " ");
            var functionArea, svgSrcArea, button, svgTD, button, form;
            var canvasTD = null
            var tr = TR(null, TD(null, ""+i+": "+test, BR(null), IMG({'src':'canvas_tests_images/'+test+'.png'}) ) );
            var include_canvas = (type=='canvas')
            if (include_canvas)
                appendChildNodes(tr, canvasTD=TD({width:210}) )
            var types = ['svg', 'pdf', 'png', 'jpg']
            appendChildNodes(tr, 
                              TD(null, functionArea=TEXTAREA({'rows':"14", 'cols':"40", 'wrap':"off", id:test+'_code'}, code),
                                       BR(null),
                                       buttonDoIt=INPUT({type:"button", value:"Do It"}),
                                       " ",
                                       buttonXML=INPUT({type:"button", value:"Update XML"}) ),
                              svgTD=TD({width:210}),
                              TD(null,  
                                // Form will open result in new window. 
                                // target="_blank" is a deprecated feature, but very useful since you can't right click 
                                // on the submit button to choose if you want to open it in a new window, and going back is SLOW
                                form=FORM( { name:'form_'+test, method:'post', action:converter_url, id:test+'_form', target:"_blank"}, 
                                   svgSrcArea=TEXTAREA({rows:"14", cols:"60", wrap:"off", name:'source', id:test+'_src'} ,"SVG Source"),
                                   BR(null) // Buttons get added below.
                                )
                              )
                        );
            appendChildNodes(tbody, tr);
            var make_input = function(type) {
                var button=INPUT({type:"submit", name:"type", value:type, id:test+'_'+type})
                //addToCallStack(button, 'onclick', partial(convert, test, type))  // Doesn't work to external site
                return SPAN(null, button, " ")  // Put a space after each button
            }
            appendChildNodes(form, map(make_input, types))
            appendChildNodes(form, '(opens in new window)')
            addToCallStack(buttonDoIt, 'onclick', partial(doTest,canvasTD, svgTD, functionArea, svgSrcArea, buttonXML, include_canvas) );
            doTest(canvasTD, svgTD, functionArea, svgSrcArea, buttonXML, include_canvas);
        }
        i++;
    }
}

/*
// For security reasons, browsers won't let JavaScript get the converted file - it must be opened in a new window.
function convert(name, type) {
    var src = name+'_src'
    var contents = formContents(name+'_form')
    //var s = queryString(contents)
    var d = doXHR(converter_url, {method: 'POST', queryString: contents})
    var got_converted = function(response) {
        log(repr(response))
    }
    var failed_converted = function(response) {
        log("failed: "+repr(response))
    }
    d.addCallbacks(got_converted, failed_converted)
}
*/

type = 'svg'  // Can be overriden by other files.
addLoadEvent(setupTopBar)
addLoadEvent(partial(addTests, 0, 0))
