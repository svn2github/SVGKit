var testFunctions = {
    
    'pollygon' : function(c) {
        c.translate(200/12,200/12);
        for (i=0;i<6;i++){
          for (j=0;j<6;j++){
            c.strokeStyle = 'rgb(0,' + Math.floor(255-42.5*i) + ',' + 
                             Math.floor(255-42.5*j) + ')';
            c.save();
            c.translate(i*200/6,j*200/6);
            c.pollygon(i+3, 10+10/(j+1), Math.PI/6/(i+3)*j);
            c.stroke();
            c.restore();
          }
        }
    },
    
    'star' : function(c) {
        c.translate(200/12,200/12);
        for (i=0;i<6;i++){
          for (j=0;j<6;j++){
            c.strokeStyle = 'rgb(0,' + Math.floor(255-42.5*i) + ',' + 
                             Math.floor(255-42.5*j) + ')';
            c.save();
            c.translate(i*200/6,j*200/6);
            c.star(i+3, 10+10/(j+1), (10+10/j)/(i+1), Math.PI/6/(i+3)*j);
            c.stroke();
            c.restore();
          }
        }
    },
    
    'asterisk' : function(c) {
        c.translate(200/12,200/12);
        for (i=0;i<6;i++){
          for (j=0;j<6;j++){
            c.strokeStyle = 'rgb(0,' + Math.floor(255-42.5*i) + ',' + 
                             Math.floor(255-42.5*j) + ')';
            c.save();
            c.translate(i*200/6,j*200/6);
            c.asterisk(i+3, 10+10/(j+1), (5+5/j)/(i+1), Math.PI/6/(i+3)*j);
            c.stroke();
            c.restore();
          }
        }
    },
    
    'svg_shapes' : function(c) {
        c.scale(.5,.5);
        
        c.beginPath();
        c.moveTo(125,75)
        c.ellipticalArc(100,50, 0, 0,0, 100,50);
        c.stroke();
        c.strokeStyle='blue'
        c.beginPath();
        c.moveTo(125,75)
        c.ellipticalArc(100,50, 0, 1,0, 100,50);
        c.stroke();
        c.strokeStyle='green'
        c.beginPath();
        c.moveTo(125,75)
        c.ellipticalArc(100,50, 0, 0,1, 100,50);
        c.stroke();
        c.strokeStyle='red'
        c.beginPath();
        c.moveTo(125,75)
        c.ellipticalArc(100,50, 0, 1,1, 100,50);
        c.stroke();
        
        c.translate(-25,50);
        c.strokeStyle='black'
        c.fillStyle='rgba(100,100,100,.3)'
        c.beginPath();
        c.moveTo(50,50)
        c.smoothCurveTo(150,50)
        c.smoothCurveTo(150,150)
        c.smoothCurveTo(50,150)
        c.smoothCurveTo(50,50)
        c.draw();
        
        c.translate(100,20);
        c.strokeStyle='black'
        c.fillStyle='rgba(255,0,0,.3)'
        c.strokePath("M50,50 T150,50 T150,150 T50,150 T50,50");
        c.fillPath("M50,50 T150,50 T150,150 T50,150 T50,50");
        c.translate(20,0);
        c.drawPath("M50,50 T150,50 T150,150 T50,150 T50,50");
        
        c.translate(100,-20);
        c.fillStyle='rgba(0,255,0,.3)'
        c.strokeRoundedRect(10,10,100,100,10,10);
        c.fillRoundedRect(10,10,100,100,10,10);
        c.translate(20,20);
        c.drawRoundedRect(10,10,100,100,10,10);
        
        c.translate(70,25);
        c.fillStyle='rgba(0,0,255,.3)'
        c.strokeCircle(50, 50, 40);
        c.fillCircle(50, 50, 40);
        c.translate(20,0);
        c.drawCircle(50, 50, 40);
        
        c.translate(-240,100);
        c.fillStyle='rgba(150,0,150,.3)'
        c.strokeEllipse(50, 50, 100, 40);
        c.fillEllipse(50, 50, 100, 40);
        c.translate(20,20);
        c.drawEllipse(50, 50, 100, 40);
        
        c.translate(130,-20);
        c.fillStyle='rgba(150,150,0,.3)'
        c.strokePolyline("50,50 150,50 150,150 50,150");
        c.fillPolyline("50,50 150,50 150,150 50,150");
        c.translate(20,20);
        c.drawPolyline("50,50 150,50 150,150 50,150");
        
        c.translate(-130,20);
        c.fillStyle='rgba(0,150,150,.3)'
        c.strokePolygon("50,50 150,50 150,150 50,150");
        c.fillPolygon("50,50 150,50 150,150 50,150");
        c.translate(20,20);
        c.drawPolygon("50,50 150,50 150,150 50,150");
        
    },
    
    'markers' : function(c) {
        var markers = [ c.pollygon(5, 10) ];
        var n = markers.length;
        for (var i=0; i<n; i++) {
            c.startMarker();
            c.pollygon(5, 10);
            c.stroke();
            var marker = c.endMarker();
            
            c.markerStart = marker;
            c.markerMid = marker;
            c.markerEnd = marker;
            c.moveTo(10,10);
            c.lineTo(100,100);
            c.lineTo(200-10,200-10);
            c.stroke();
        }
    },
    
    'inkscape_markers' : function(c) {
        var markers = [c.inkscapeArrow1, c.inkscapeArrow1Lstart, c.inkscapeArrow1Lend, c.inkscapeArrow1Mstart, c.inkscapeArrow1Mend, c.inkscapeArrow1Sstart, c.inkscapeArrow1Send, 
                        c.inkscapeArrow2, c.inkscapeArrow2Lstart, c.inkscapeArrow2Lend, c.inkscapeArrow2Mstart, c.inkscapeArrow2Mend, c.inkscapeArrow2Sstart, c.inkscapeArrow2Send, 
                        c.inkscapeTail, c.inkscapeDistance, c.inkscapeDistanceIn, c.inkscapeDistanceOut, c.inkscapeDot, c.inkscapeDot_l, c.inkscapeDot_m, c.inkscapeDot_s, 
                        c.inkscapeSquare, c.inkscapeSquareL, c.inkscapeSquareS, c.inkscapeDiamond, c.inkscapeDiamondM, c.inkscapeDiamondS, 
                        c.inkscapeTriangle, c.inkscapeTriangleInL, c.inkscapeTriangleInM, c.inkscapeTriangleInS, c.inkscapeTriangleOutL, c.inkscapeTriangleOutM, c.inkscapeTriangleOutS, 
                        c.inkscapeStop, c.inkscapeStopL, c.inkscapeStopS, c.inkscapeSemiCircleIn, c.inkscapeSemiCircleOut, c.inkscapeSemiCurveIn, c.inkscapeSemiCurveOut, 
                        c.inkscapeSemiScissors, c.inkscapeSemiClub]
        var n = markers.length;
        var across = Math.ceil(Math.sqrt(n));
        for (var j=0; j<across; j++) {
            for (var i=0; i<across && j*across+i<n; i++) {
                c.startMarker();
                markers[j*across+i].call(c);
                var marker = c.endMarker();
                c.markerStart = marker;
                c.markerMid = marker;
                c.markerEnd = marker;
                c.moveTo((i+.2)*200/across,(j+.2)*200/across);
                c.lineTo((i+.3)*200/across,(j+.5)*200/across);
                c.lineTo((i+.4)*200/across,(j+.8)*200/across);
                c.stroke();
            }
        }
    },
    
    'gears': function (c) {
        var n = 11;
        var bottom = 85;
        var diagonal = 70;
        var center = 100;

        var height = Math.sqrt(diagonal*diagonal-bottom*bottom/4)
        var r = diagonal/2
        var a = Math.acos(bottom/(2*diagonal))

        c.save()
        c.beginPath()
        c.moveTo(center,center)
        c.lineTo(center-bottom/2,center+height)
        c.stroke()
        c.restore()

        c.save()
        c.translate(center,center)
        var g1 = c.newGroup()
        c.beginPath();
        c.moveTo(0,0)
        c.lineTo(bottom/2,-height)
        c.lineTo(-bottom/2,-height)
        c.stroke()
        c.beginPath();
        c.rotate(-a+Math.PI/n)
        c.gear(n, .2,r-5, .3,r+2, .4,r+5, .6,r+5,  .7,r+2, .8,r-5);
        c.stroke();
        c.restore()

        c.save()
        c.translate(center-bottom/2,center+height);
        var g2 = c.newGroup()
        c.beginPath();
        c.moveTo(0,0)
        c.lineTo(bottom,0)
        c.stroke()
        c.beginPath();
        c.rotate(-a)
        c.gear(n, .2,r-5, .3,r+2, .4,r+5, .6,r+5,  .7,r+2, .8,r-5);
        c.stroke();
        c.restore()

        var rotate = 0.0 * 2*a
        c.svg.rotate(g1 ,rotate/Math.PI*180)
        c.svg.rotate(g2 ,-rotate/Math.PI*180)
    },
    
};

function doTest(svgTD, functionArea, svgSrcArea) {
    var testFunction = eval(functionArea.value);
    var ctx;
    ctx = new SVGCanvas(200, 200);
    var setSVGSrc = function (svg, textarea) {
        replaceChildNodes(textarea, svg.toXML());
    }
    ctx.svg.whenReady( partial(testFunction, ctx) );
    ctx.svg.whenReady( partial(setSVGSrc, ctx.svg, svgSrcArea) );
    replaceChildNodes(svgTD, ctx.svg.htmlElement);
}

function addTests() {
    log("getting table");
    var table = $('tests');
    var i = 0, start = 0, number = 50;
    for (var test in testFunctions) {
        if (i>=start && i-start<number) {
            log("doing test number ", i, "name ", test);
            var plotSrc = (''+testFunctions[test]+'\n').replace(/ +/g, " ");
            var functionArea, svgSrcArea, button, canvasTD, svgTD, button;
            var tr = TR(null, TD(null, ""+i+": "+test, BR(null), IMG({'src':'canvas_tests_images/'+test+'.png'}) ), 
                              TD(null, functionArea=TEXTAREA({'rows':"14", 'cols':"40", 'wrap':"off"}, plotSrc),
                                       BR(null),
                                       button=INPUT({'type':"button", 'value':"Do It"}) ),
                              svgTD=TD(null),
                              TD(null, svgSrcArea=TEXTAREA({'rows':"16", 'cols':"60", 'wrap':"off"} ,"SVG Source") )
                        );
            appendChildNodes(table, tr);
            addToCallStack(button, 'onclick', partial(doTest, svgTD, functionArea, svgSrcArea) );
            doTest(svgTD, functionArea, svgSrcArea);
        }
        i++;
    }
    var compositeTypes = [
          'source-over','source-in','source-out','source-atop',
          'destination-over','destination-in','destination-out','destination-atop',
          'lighter','darker','copy','xor'
    ];
    function draw() {
      for (i=0;i<compositeTypes.length;i++){
        var label = document.createTextNode(compositeTypes[i]);
        document.getElementById('lab'+i).appendChild(label);
        var ctx = document.getElementById('tut'+i).getContext('2d');

        // draw rectangle
        ctx.fillStyle = "#09f";
        ctx.fillRect(15,15,70,70);

        // set composite property
        ctx.globalCompositeOperation = compositeTypes[i];
        
        // draw circle
        ctx.fillStyle = "#f30";
        ctx.beginPath();
        ctx.arc(75,75,35,0,Math.PI*2,true);
        ctx.fill();
      }
    }
    //draw()
}

addLoadEvent(addTests);