
var POINT_COUNT = 40;

var TRIG_XMIN = -2*Math.PI;
var TRIG_XMAX = 2*Math.PI;
var trigx = Array(POINT_COUNT);
var sin = Array(POINT_COUNT);
var cos = Array(POINT_COUNT);
var tan = Array(POINT_COUNT);
var atan = Array(POINT_COUNT);
var ints = Array(POINT_COUNT);
var squares = Array(POINT_COUNT);
for (var i=0; i<POINT_COUNT; i++) {
    var x = TRIG_XMIN + (TRIG_XMAX-TRIG_XMIN)*i/(POINT_COUNT-1);
    //log("in trig x=" + x);
    trigx[i] = x;
    sin[i] = Math.sin(x);
    cos[i] = Math.cos(x);
    tan[i] = Math.tan(x);
    atan[i] = Math.atan(x);
    ints[i] = i;
    squares[i] = i*i;
}


var testFunctions = {
    
    'simpleLine' : function(p) {
        p.plotLine(squares)
        p.render()
    },
    
    'simpleSquares' : function(p) {
        p.plotLine([0,1,2,3,4,5,6], [0,1,4,9,16,25,36]);
        p.render()
    },
    
    'xyLine' : function(p) {
        p.plotLine(trigx, sin)
        p.render()
    },
    
    'multiPlot' : function(p) {
        p.plotLine(trigx, sin)
        p.plotLine(trigx, cos)
        p.render()
    },
    
    'styleLine' : function(p) {
        p.strokeStyle = "#00E";
        p.plotLine(trigx, sin);
        p.strokeStyle = "#E00";
        p.plotLine(trigx, cos);
        
        p.strokeStyle = "rgba(100, 0, 100, .5)";
        p.lineWidth = '5' 
        p.dasharray = ".5,1,2";
        p.dashoffset = 2;
        p.plotLine(trigx, atan);
        p.render()
    },
    
    'functionPlot' : function(p) {
        p.plotFunction('Math.atan(x)', 'x', -8, 8);
        p.render()
    },
    
    'trickyFunctionPlot' : function(p) {
        p.plotFunction('Math.sin(1/x)', 'x', -4, 4);
        p.render()
    },
    
    'decorations' : function(p) {
        p.strokeStyle = 'rgba(255, 50, 50, 0.5)';
        p.plotLine(trigx, sin);
        p.strokeStyle = 'rgba(50, 50, 255, 0.5)';
        p.plotLine(trigx, cos);
        p.strokeStyle = "#888";
        p.fillStyle = "#888";
        p.setYScale(-1.5,1.5)
        p.setXScale(-7,7)
        var locations = [-2*Math.PI, -Math.PI, 0, Math.PI, 2*Math.PI]
        p.setXTicks(locations)
        p.setXTickLabels(locations, ['-2pi', '-pi', '0', 'pi', '2pi'])
        locations = [-1, -0.5, 0, 0.5, 1]
        p.setYTicks(locations)
        p.setYTickLabels(locations)
        p.fontSize = '10';
        p.fontFamily="Verdana, Arial, Helvetica, Sans"
        p.setXAxisTitle("Time (ns)");
        p.setYAxisTitle("Voltage (V)");
        p.render();
    },
    
    'seti': function(p) {
        var voltages = [1.7, 1.5, 1.375, 1.25, 1.1, 0.95, 0.75, 0.5]
        var time_ns = []
        var left = []
        var right = []
        for (var i=0; i<100; i++) {
            time_ns[i] = i/3.0
            var r = Math.floor(Math.random()*voltages.length)
            right[i] = voltages[r]
            var l = Math.floor(Math.random()*voltages.length)
            left[i] = voltages[l]
        }
        p.strokeStyle = "#C6C6C6";
        p.fillStyle   = "#C6C6C6";
        p.fontSize   = '7px';
        //p.fontFamily = "Arial, SunSans-Regular, sans-serif"
        p.addBox();
        p.box.addDefaults();
        p.setYScale(voltages[voltages.length-1]-0.1, voltages[0]+0.1);
        p.setYTicks(voltages);
        p.setYTickLabels(voltages);
        p.fontSize   = '10px';
        p.fontFamily = "Helvetica, Geneva, Arial, SunSans-Regular, sans-serif"
        p.setXAxisTitle("Time (ns)");
        p.setYAxisTitle("Voltage (V)");
        p.strokeStyle = 'rgba(255, 75, 75, 0.9)';
        p.plotLine(time_ns, left);
        p.strokeStyle = 'rgba(75, 75, 255, 0.9)';
        p.plotLine(time_ns, right);
        p.render();
    },
    
    'ticks' : function(p) {
        p.plotLine(trigx, sin)
        p.setXTicks(trigx)
        p.setYTicks(sin)
        p.removeXTickLabels()
        p.removeYTickLabels()
        p.render()
    },
    
    'axisstyles' : function(p) {
        p.fillStyle = "#950";
        var box = p.addBox();
        box.addDefaults();
        p.strokeStyle = "rgba(255,0,0,.5)";
        p.plotFunction("Math.sin(x)", "x", -2 * Math.PI, 2 * Math.PI);
        p.strokeStyle = "rgba(0,0,255,.5)";
        p.plotFunction("Math.cos(x)", "x", -2 * Math.PI, 2 * Math.PI);
        p.render();
    },
    
        
    'floatingaxes' : function(p) {
        p.strokeStyle = "rgba(255,0,0,.5)";
        p.plotFunction("Math.sin(x)", "x", -2 * Math.PI, 2 * Math.PI);
        p.strokeStyle = "rgba(0,0,255,.5)";
        p.plotFunction("Math.cos(x)", "x", -2 * Math.PI, 2 * Math.PI);
        p.setXAxis(-.6)
        p.setYAxis(-4)
        p.render();
    },
    
    'dependentaxes' : function(p) {
        p.addBox()
        p.addView()
        p.setXScale(-10, 10)
        p.setYScale(-7, 7)
        var colors = ['#990000', '#009900', '#000099'];
        for (var i=0; i<3; i++) {
            p.strokeStyle = colors[i];
            p.fillStyle = colors[i];
            p.addXAxis('top')
            p.addXTicks('auto', 'top')
            p.addXTickLabels('auto', 'auto', 'top')
            p.addXTicks([-5, 0, 5], 'bottom')
            p.addXTickLabels([-5, 0, 5], 'auto', 'bottom')
            p.addXAxis('bottom')
            p.addXTicks('auto', 'top')
            p.addXTickLabels('auto', 'auto', 'top')
            p.addXTicks([-5, 0, 5], 'bottom')
            p.addXTickLabels([-5, 0, 5], 'auto', 'bottom')
            p.addYAxis('right')
            p.addYTicks('auto', 'left')
            p.addYTickLabels('auto', 'auto', 'left')
            p.addYTicks([-5, 0, 5], 'right')
            p.addYTickLabels([-5, 0, 5], 'auto', 'right')
            p.addYAxis('left')
            p.addYTicks('auto', 'left')
            p.addYTickLabels('auto', 'auto', 'left')
            p.addYTicks([-5, 0, 5], 'right')
            p.addYTickLabels([-5, 0, 5], 'auto', 'right')
        }
        p.strokeStyle = "rgba(255,0,0,.5)";
        p.plotFunction("Math.sin(x)", "x", -2 * Math.PI, 2 * Math.PI);
        p.strokeStyle = "rgba(0,0,255,.5)";
        p.plotFunction("Math.cos(x)", "x", -2 * Math.PI, 2 * Math.PI);
        p.render();
    },
    
    'independentaxes' : function(p) {
        p.addBox()
        var colors = ['#990000', '#009900', '#000099'];
        for (var i=0; i<3; i++) {
            p.strokeStyle = colors[i];
            p.fillStyle = colors[i];
            p.addView()
            p.setXScale(-i*3-1, i*3+1)
            p.setYScale(-i*3-1, i*3+1)
            p.addXAxis('top')
            p.addXTicks('auto', 'top')
            p.addXTickLabels('auto', 'auto', 'top')
            p.addXTicks([-5, 0, 5], 'bottom')
            p.addXTickLabels([-5, 0, 5], 'auto', 'bottom')
            p.addXAxis('bottom')
            p.addXTicks('auto', 'top')
            p.addXTickLabels('auto', 'auto', 'top')
            p.addXTicks([-5, 0, 5], 'bottom')
            p.addXTickLabels([-5, 0, 5], 'auto', 'bottom')
            p.addYAxis('right')
            p.addYTicks('auto', 'left')
            p.addYTickLabels('auto', 'auto', 'left')
            p.addYTicks([-5, 0, 5], 'right')
            p.addYTickLabels([-5, 0, 5], 'auto', 'right')
            p.addYAxis('left')
            p.addYTicks('auto', 'left')
            p.addYTickLabels('auto', 'auto', 'left')
            p.addYTicks([-5, 0, 5], 'right')
            p.addYTickLabels([-5, 0, 5], 'auto', 'right')
            p.plotFunction("Math.sin(x)", "x", -2 * Math.PI, 2 * Math.PI);
        }
        p.render();
    },
    
    'logplot' : function(p) {
        p.logplot(ints.slice(1,ints.length-1), squares.slice(1,squares.length-1))
        p.render()
    },
    
    'loglogplot' : function(p) {
        p.loglogplot(ints.slice(1,ints.length-1), squares.slice(1,squares.length-1))
        p.render()
    },
    
    'draw_on_plot' : function(p) {
        p.plotFunction("Math.sin(x)", "x", -2 * Math.PI, 2 * Math.PI);
        p.render();
        p.circle(Math.PI/2, Math.sin(Math.PI/2), 10);
    },
    /*
    'label' : function(p) {
        p.plotFunction("Math.sin(x)", "x", -2 * Math.PI, 2 * Math.PI);
        //p.label(Math.PI/2, Math.sin(Math.PI/2), "sin(pi/2)");
        //p.label(Math.PI/2, Math.sin(-Math.PI/2), "sin(-pi/2)", 'arrow');
        //p.label(Math.PI/2, Math.sin(3*Math.PI/2), "sin(3pi/2)", 'dot');
        //p.label(Math.PI/2, Math.sin(-3*Math.PI/2), "sin(-3pi/2)", 'line');
        p.render();
    },
    
    'post_style' : function(p) {
        p.plotFunction("Math.sin(x)", "x", -2 * Math.PI, 2 * Math.PI);
        p.box.background = 'red'
        //p.xAxis.strokeStyle = 'blue'
        //p.xGrid.spacing = .3
        //p.yGrid.fillStyle = "rgba(100, 0, 100, .5)";
        p.render();
    },
    */
    'date_plot' : function(p) {
        d = datetime.now()
        dates = []
        data = []
        for (var i=0; i<20; i++) {
            // Add days
            date = datetime.addPeriod(d, {day: i*9})
            var s = datetime.toISOTimestamp(date)
            var s2 = datetime.toISOTimestamp(datetime.parse(s))
            var ord = datetime.ordinalDay(date)
            log(s, s2, ord)
            dates.push(s)
            //data.push(Math.random())
            data.push(ord)
        }
        p.plot(dates, data)
        p.render();
    },
    
    'date_simple' : function(p) {
        var dates = ['2007-05-01 20:20:30', '2007-05-17 13:47:19']
        var data = [-1, 1]
        p.plot(dates, data);
        p.render();
    },
    
    'date_plot_temp' : function(p) {
        var reasonable_temp = function(row) {
            return row[1] < 40
        }
        var tempfilt = filter(reasonable_temp, temp)
        var cols = SVGPlot.prototype.transpose(tempfilt)
        p.plot(cols[0], cols[1])
        p.render();
    }
    
};

type = 'plot'
