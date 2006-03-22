/* actual tests */

function genericTest(num, plotfunc) {
    var g = new CanvasGraph("test" + num + "canvas");
    g.padding = {"top": 10, "left": 30, "bottom": 20, "right": 10};
	g.setDatasetFromTable('data', $('test' + num));
	g[plotfunc]({"data": Color.redColor()});
}

function genericTestAndClear(num, plotfunc) {
    var g = new CanvasGraph("test" + num + "canvas");
    g.padding = {"top": 10, "left": 30, "bottom": 20, "right": 10};
	g.setDatasetFromTable('data', $('test' + num));
	g[plotfunc]({"data": Color.redColor()});
    g.clear();
}

function dualDataSet(num, plotfunc) {
    var g = new CanvasGraph("test" + num + "canvas");
    g.padding = {"top": 10, "left": 30, "bottom": 20, "right": 10};
	g.setDatasetFromTable('data1', $('test' + num), 0, 1);
	g.setDatasetFromTable('data2', $('test' + num), 0, 2);	
	g[plotfunc]({"data1": Color.redColor(), "data2": Color.blueColor()});    
}

/* create HTML for tests */

function makeTableRow(list) {
    return TR({}, map(partial(TD, null), list));
}

function generateTestTable(num, data) {
    var tableid = "test" + num;
    var tablehead = THEAD(null, map(makeTableRow, [["x", "y"]]));
    var tablebody = TBODY(null, map(makeTableRow, data));
    
    var table = TABLE({"class": "data", "id": tableid}, [tablehead, tablebody]);
    return table;
}

function generateCanvas(num) {
    var canvasid = "test" + num + "canvas";
    //var canvas = CANVAS({"id":canvasid, "width": "400", "height": "200"}, "");
    var svg = new MochiKit.SVG(400, 200, canvasid);
    var canvas = svg.htmlElement;
    return canvas
}

function generateUnitTest(num, func, data, type, desc) {
    var table = DIV({"class": "data"}, generateTestTable(num, data));
    var canvas = DIV({"class": "canvas"}, generateCanvas(num));
    var ending = DIV({"class":"ending"}, desc);
    
    addLoadEvent(partial(func, num, type));
    
    return DIV({"class": "unit"}, [table, canvas, ending]);
    
}

function generateTests() {
    var tests = $('tests');
    
    // datasets 
    var simpleData1 = [[0, 0], [1, 1], [2, 2], [3, 3]];
    var simpleData2 = [[1, 2], [2, 3], [3, 4], [4, 5]];
    var singleData = [[1, 1]];
    
    var floatData1 = [[0, 0.5], [1, 0.4], [2, 0.3]];
    var missingData = [[0, 1], [1, 4], [3, 16], [5, 17]];
    
    var dualData = [[0,0,0], [1,1,2], [2,4,4], [3,9,8], [4,16,16], [5,25,32], [6, 36, 64], [7, 49, 128]];

    tests.appendChild(H2(null, "Simple Tests"));

    tests.appendChild(generateUnitTest(1, genericTest, simpleData1,
    "drawBarChart", ""));
    tests.appendChild(generateUnitTest(2, genericTest, simpleData1, 
    "drawLinePlot", ""));
    tests.appendChild(generateUnitTest(3, genericTest, simpleData2, 
    "drawPieChart", ""));

    tests.appendChild(H2(null, "One Value Set"));

    tests.appendChild(generateUnitTest(4, genericTest, singleData,
    "drawBarChart", ""));
    tests.appendChild(generateUnitTest(5, genericTest, singleData, 
    "drawLinePlot", ""));
    tests.appendChild(generateUnitTest(6, genericTest, singleData, 
    "drawPieChart", ""));

    tests.appendChild(H2(null, "Float Values Set"));
    tests.appendChild(generateUnitTest(7, genericTest, floatData1,
    "drawBarChart", ""));
    tests.appendChild(generateUnitTest(8, genericTest, floatData1, 
    "drawLinePlot", ""));
    tests.appendChild(generateUnitTest(9, genericTest, floatData1, 
    "drawPieChart", ""));    

    tests.appendChild(H2(null, "Dual Value Set"));
    tests.appendChild(generateUnitTest(10, dualDataSet, dualData,
    "drawBarChart", ""));
    tests.appendChild(generateUnitTest(11, dualDataSet, dualData, 
    "drawLinePlot", ""));
    
    tests.appendChild(H2(null, "Drawing and Clearing"));
    tests.appendChild(generateUnitTest(12, genericTest, floatData1,
"drawBarChart", ""));    
    tests.appendChild(generateUnitTest(13, genericTestAndClear, floatData1,
"drawBarChart", ""));
    tests.appendChild(generateUnitTest(14, genericTest, floatData1,
    "drawPieChart", ""));    
    tests.appendChild(generateUnitTest(15, genericTestAndClear, floatData1,
    "drawPieChart", ""));        

}

addLoadEvent(generateTests);
