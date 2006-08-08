
var POINT_COUNT = 40;

var intsquares = Array(POINT_COUNT); // squares of their position
for (var i=0; i<POINT_COUNT; i++)
    intsquares[i] = i*i;

var TRIG_XMIN = -2*Math.PI;
var TRIG_XMAX = 2*Math.PI;
var trigx = Array(POINT_COUNT);
var sin = Array(POINT_COUNT);
var cos = Array(POINT_COUNT);
var tan = Array(POINT_COUNT);
var atan = Array(POINT_COUNT);
for (var i=0; i<POINT_COUNT; i++) {
    var x = TRIG_XMIN + (TRIG_XMAX-TRIG_XMIN)*i/(POINT_COUNT-1);
    //log("in trig x=" + x);
    trigx[i] = x;
    sin[i] = Math.sin(x);
    cos[i] = Math.cos(x);
    tan[i] = Math.tan(x);
    atan[i] = Math.atan(x);
}


var testFunctions = {
    
    'simpleLine' : function(p) {
        var intsquares = Array(POINT_COUNT); // squares of their position
        for (var i=0; i<POINT_COUNT; i++)
            intsquares[i] = i*i;
        p.plotLine(intsquares)
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
        p.setYRange(-1.5,1.5)
        p.setXRange(-7,7)
        var locations = [-2*Math.PI, -Math.PI, 0, Math.PI, 2*Math.PI]
        p.setXTicks(locations)
        p.setXStubs(locations, ['-2pi', '-pi', '0', 'pi', '2pi'])
        locations = [-1, -0.5, 0, 0.5, 1]
        p.setYTicks(locations)
        p.setYStubs(locations)
        p.fontSize = '10';
        p.fontFamily="Verdana, Arial, Helvetica, Sans"
        p.setXLabel("Time (ns)");
        p.setYLabel("Voltage (V)");
        p.render();
    },
    
    'ticks' : function(p) {
        p.plotLine(trigx, sin)
        p.setXTicks(trigx)
        p.setYTicks(sin)
        p.removeXStubs()
        p.removeYStubs()
        p.render()
    },
    
    'axisstyles' : function(p) {
        p.fillStyle = "#950";
        p.addBox();
        p.addBoxDefaults();
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
        p.addRange(-10, 10, -7, 7)
        var colors = ['#990000', '#009900', '#000099'];
        for (var i=0; i<3; i++) {
            p.strokeStyle = colors[i];
            p.fillStyle = colors[i];
            p.addXAxis('top')
            p.addXTicks('auto', 'top')
            p.addXStubs('auto', 'auto', 'top')
            p.addXTicks([-5, 0, 5], 'bottom')
            p.addXStubs([-5, 0, 5], 'auto', 'bottom')
            p.addXAxis('bottom')
            p.addXTicks('auto', 'top')
            p.addXStubs('auto', 'auto', 'top')
            p.addXTicks([-5, 0, 5], 'bottom')
            p.addXStubs([-5, 0, 5], 'auto', 'bottom')
            p.addYAxis('right')
            p.addYTicks('auto', 'left')
            p.addYStubs('auto', 'auto', 'left')
            p.addYTicks([-5, 0, 5], 'right')
            p.addYStubs([-5, 0, 5], 'auto', 'right')
            p.addYAxis('left')
            p.addYTicks('auto', 'left')
            p.addYStubs('auto', 'auto', 'left')
            p.addYTicks([-5, 0, 5], 'right')
            p.addYStubs([-5, 0, 5], 'auto', 'right')
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
            p.addRange(-i*3-1, i*3+1, -i*3-1, i*3+1)
            p.addXAxis('top')
            p.addXTicks('auto', 'top')
            p.addXStubs('auto', 'auto', 'top')
            p.addXTicks([-5, 0, 5], 'bottom')
            p.addXStubs([-5, 0, 5], 'auto', 'bottom')
            p.addXAxis('bottom')
            p.addXTicks('auto', 'top')
            p.addXStubs('auto', 'auto', 'top')
            p.addXTicks([-5, 0, 5], 'bottom')
            p.addXStubs([-5, 0, 5], 'auto', 'bottom')
            p.addYAxis('right')
            p.addYTicks('auto', 'left')
            p.addYStubs('auto', 'auto', 'left')
            p.addYTicks([-5, 0, 5], 'right')
            p.addYStubs([-5, 0, 5], 'auto', 'right')
            p.addYAxis('left')
            p.addYTicks('auto', 'left')
            p.addYStubs('auto', 'auto', 'left')
            p.addYTicks([-5, 0, 5], 'right')
            p.addYStubs([-5, 0, 5], 'auto', 'right')
            p.plotFunction("Math.sin(x)", "x", -2 * Math.PI, 2 * Math.PI);
        }
        p.render();
    },
    
    'draw_on_plot' : function(p) {
        p.plotFunction("Math.sin(x)", "x", -2 * Math.PI, 2 * Math.PI);
        p.circle(Math.PI/2, Math.sin(Math.PI/2), 10);
        p.render();
    },
    
    'label' : function(p) {
        p.plotFunction("Math.sin(x)", "x", -2 * Math.PI, 2 * Math.PI);
        p.label(Math.PI/2, Math.sin(Math.PI/2), "sin(pi/2)");
        p.label(Math.PI/2, Math.sin(-Math.PI/2), "sin(-pi/2)", 'arrow');
        p.label(Math.PI/2, Math.sin(3*Math.PI/2), "sin(3pi/2)", 'dot');
        p.label(Math.PI/2, Math.sin(-3*Math.PI/2), "sin(-3pi/2)", 'line');
        p.render();
    },
    
    'post_style' : function(p) {
        p.plotFunction("Math.sin(x)", "x", -2 * Math.PI, 2 * Math.PI);
        p.box.background = 'red'
        p.xaxis.strokeStyle = 'blue'
        p.xgrid.spacing = .3
        p.ygrid.fillStyle = "rgba(100, 0, 100, .5)";
        p.render();
    }
    
};

addLoadEvent(partial(addTests, 0, 50, 'plot'));
