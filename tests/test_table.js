// Default global variables that can be overriden by other files
var type = 'svg' 
var include_canvas = false

function setupTopBar() {

    var count = 0;
    for (var test in testFunctions) {
        count++
    }
    var max = count-1

    var form = FORM({id:"test_form", action:"javascript: void(0)"},
            ' starting at ', 
            INPUT({name:"start", id:"start", type:"text", value:0, 'class':"text", size:5}),
            ' going to ',
            INPUT({name:"end", id:"end", type:"text", value:max, 'class':"text", size:5}), 
            ' / ',
            SPAN({id:"count"},max),
            ' ',
            INPUT({name:"doTests", type:"button", id:"doTests", value:"Do These Tests", 'class':"button", onclick:"runTests()"}),
            ' ',
            INPUT({name:"doAllTests", type:"button", id:"doAllTests", value:"Do All Tests", 'class':"button", onclick:"runAllTests()"})
        )
    replaceChildNodes('test_bar', form)
}

function runTests() {
    addTests(getElement('start').value, getElement('end').value)
}

function runAllTests() {
    addTests(0,99999)
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

function doTest(canvasTD, svgTD, srcTD, testFunction) {
    /***
        Populates the varios <td> elements
        
        @global type is a global variable which can get overriden
    ***/
    
    var target, svg;
    if (type=='svg') {
        target = new SVGKit(200, 200);
        svg = target;
    }
    else if (type=='canvas') {
        if (canvasTD != null)
            doCanvas(canvasTD, testFunction)
        target = new SVGCanvas(200, 200);
        svg = target.svg;
    }
    else if (type=='plot') {
        target = new SVGPlot(200, 200);
        svg = target.svg;
    }
    svg.whenReady( partial(testFunction, target) );
    
    var convert_form = svg.convertForm()
    replaceChildNodes(srcTD, convert_form)
    replaceChildNodes(svgTD, svg.htmlElement);
}


function addTests(start, end) {
    log("getting table");
    var tbody = getElement('tests');
    replaceChildNodes(tbody)
    var i = 0;
    for (var test in testFunctions) {
        if (i>=start && i<=end) {
            log("doing test number ", i, "name ", test);
            var testFunction = testFunctions[test]
            var code = (''+testFunction+'\n').replace(/ +/g, " ");
            
            //var w = 210  used to be {width:w}
            var canvasTD = (include_canvas) ? TD({id:test+'_canvas'}) : null
            var codeTD = TD({id:test+'_code'})
            var svgTD = TD({id:test+'_svg'})
            var srcTD = TD({id:test+'_src'})
            
            var doit = partial(doTest, canvasTD, svgTD, srcTD)
            
            // Do the test on startup here
            doit(testFunction)
            
            // Create the code and Do It button for future executions
            replaceChildNodes(codeTD, SVGKit.codeContainer(code, doit) )
            
            var tr = TR(null, 
                        TD(null, ""+i+": "+test, BR(null), IMG({'src':'canvas_tests_images/'+test+'.png'}) ),
                        canvasTD,
                        codeTD,
                        svgTD,
                        srcTD
                      );
            appendChildNodes(tbody, tr);
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

addLoadEvent(setupTopBar)
addLoadEvent(partial(addTests, 0, 9999))
