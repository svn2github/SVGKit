function drawSpirograph(ctx,R,r,O){
      var x1 = R-O;
      var y1 = 0;
      var i  = 1;
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      do {
            if (i>20000) break;
            var x2 = (R+r)*Math.cos(i*Math.PI/72) - (r+O)*Math.cos(((R+r)/r)*(i*Math.PI/72))
            var y2 = (R+r)*Math.sin(i*Math.PI/72) - (r+O)*Math.sin(((R+r)/r)*(i*Math.PI/72))
            ctx.lineTo(x2,y2);
            x1 = x2;
            y1 = y2;
            i++;
      } while (x2 != R-O && y2 != 0 );
      ctx.stroke();
}

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
    
    'enableDrag': function(c) {
        c.text("Drag red square.  Blue one follows", 5, 10) 
    
        c.fillStyle = "rgb(200,0,0)";
        var r1 = c.fillRect (20, 20, 50, 50);

        c.fillStyle = "rgba(0, 0, 200, 0.5)";
        var r2 = c.fillRect (40, 40, 50, 50);
        
        c.svg.enableDrag(r1, null, null, null, [r1, r2])
        c.svg.enableDrag(r2)
    },
    
    'enableDrag2': function(c) {
        c.text("Drag red square.  Blue one follows", 5, 10) 
        
        c.translate(20,20)
        c.rotate(0.1)
    
        c.fillStyle = "rgb(200,0,0)";
        var r1 = c.fillRect (20, 20, 50, 50);

        c.fillStyle = "rgba(0, 0, 200, 0.5)";
        var r2 = c.fillRect (40, 40, 50, 50);
        
        c.svg.enableDrag(r1, null, null, null, [r1, r2])
        c.svg.enableDrag(r2)
    },
    
    'enableRotate': function(c) {
        c.text("Drag red square around circle.  Blue one follows", 5, 10) 
    
        c.fillStyle = "rgb(200,0,0)";
        var r1 = c.fillRect(150, 75, 50, 50);

        c.fillStyle = "rgba(0, 0, 200, 0.5)";
        var r2 = c.fillRect(0, 0, 50, 50);
        
        c.fillStyle = "rgba(100, 100, 100, 0.7)";
        c.fillCircle(100, 100, 20);
        
        c.svg.enableRotate(r1, new MochiKit.Style.Coordinates(100,100), null, null, null, [r1, r2])
        c.svg.enableRotate(r2)
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
    
    'interactive_gears': function (c) {
        var n = 30  // Spokes on gear
        var bottom = 85  // Length of bottom line
        var diagonal = 70  // Distance between centers of gears.
        var center = 100  // (center, center) is the middle of the canvas.
        var thickness = 25;  // Thickness of ZW Piece
		
        var height = Math.sqrt(diagonal*diagonal-bottom*bottom/4) // vertical difference of two axes.
        var r = diagonal/2  // Radius of the gear (between the outer and inner teeth)
        var a = Math.acos(bottom/(2*diagonal))  // Half-angle through which it rotates (angle of Z initially)
		var rectangle_width = r+diagonal+bottom/2+1.5*thickness
        var rectangle_height = 2*height+r+1.3*thickness // + half of the width of the ZW bars.
		
		//var gear_diagonal = 3.5;  // Big
		var gear_diagonal = 2.0;  // Small
		var scale = gear_diagonal/diagonal
		
        //Radii of the two arcs of numbers
        var r1 = diagonal
        //var r1 = diagonal-thickness
        //var r2 = bottom  // Too close to the center, but also blocked by top of Z comming around.
        //var r2 = (diagonal+bottom)/2  
        var r2 = diagonal-thickness*0.9
        
        var medium = 'rgba(0, 0, 0, 0.3)'
        var light = 'rgba(0, 0, 0, 0.1)'
        var black = 'rgb(0, 0, 0)'
        
        c.strokeStyle = medium
		c.strokeRect(center-bottom/2-r-thickness/2, center-height-thickness, rectangle_width, rectangle_height)
		log('scale:', scale,
			'width:',rectangle_width*scale, 	
			'in  height:', rectangle_height*scale, 
			'in.  To get inches scale('+rectangle_height*scale/1.61+')')
		
        c.strokeStyle = medium
		
        ZWstyle = function() {
            c.lineWidth = thickness
            c.strokeStyle = light
            c.lineCap = "round"
            c.lineJoin = "round"
        }
        
        // Draw center circle
        c.fillStyle = 'red'
        center_circ = c.fillCircle(center,center, thickness/3)
        
        // Draw Circles for times
        c.lineWidth = 1
        c.beginPath()
        // arc(x, y, radius, startAngle, endAngle, anticlockwise)
        //c.arc(center, center, r1, 0, -2*a, true)  // On Top
        //c.arc(center, center, r1, a, -a, true)  // On Side
		var da = 9/180*Math.PI
        c.arc(center, center, r1-thickness/2, a+da/2, -a-da/2, true)
        c.stroke()
        c.beginPath()
        c.arc(center, center, r1+thickness/2, -a-da/2, a+da/2, false)
        c.stroke()
        c.beginPath()
        c.moveTo(center+(r1-thickness/4)*Math.cos(a+da), center+(r1-thickness/4)*Math.sin(a+da))
		c.lineTo(center+(r1+thickness/4)*Math.cos(a+da), center+(r1+thickness/4)*Math.sin(a+da))
        c.stroke()
        c.beginPath()
        c.moveTo(center+(r1-thickness/4)*Math.cos(-a-da), center+(r1-thickness/4)*Math.sin(-a-da))
		c.lineTo(center+(r1+thickness/4)*Math.cos(-a-da), center+(r1+thickness/4)*Math.sin(-a-da))
        c.stroke()
		// Bottom
        c.beginPath()
        //c.arc(center-bottom/2, center+height, r2, 0, -2*a, true)
		da = 12/180*Math.PI
        c.arc(center-bottom/2, center+height, r2-thickness/2, da/2, -2*a-da/2, true)
        c.stroke()
        c.beginPath()
        c.arc(center-bottom/2, center+height, r2+thickness/2, -2*a-da/2, da/2, false)
        c.stroke()
        c.beginPath()
        c.moveTo(center-bottom/2+(r2-thickness/4)*Math.cos(da), center+height+(r2-thickness/4)*Math.sin(da))
		c.lineTo(center-bottom/2+(r2+thickness/4)*Math.cos(da), center+height+(r2+thickness/4)*Math.sin(da))
        c.stroke()
        c.beginPath()
        c.moveTo(center-bottom/2+(r2-thickness/4)*Math.cos(-2*a-da), center+height+(r2-thickness/4)*Math.sin(-2*a-da))
		c.lineTo(center-bottom/2+(r2+thickness/4)*Math.cos(-2*a-da), center+height+(r2+thickness/4)*Math.sin(-2*a-da))
        c.stroke()
        
        // Draw the numbers
        c.fillStyle = 'rgb(100, 0, 100)'
        //c.textAlign = 'center'
        c.textAnchor = 'middle'
        c.fontFamily = 'Verdana'
        c.fontSize = '14'
        c.fontWeight = 'bold'
        //t = c.text("1234567890", 10, 10)
        //var h = t.getBBox().height  // For some reason this returns (NS_ERROR_FAILURE) [nsIDOMSVGLocatable.getBBox]
        var h = 10/2
        var i
        // Draw numbers 12-6
        for (i=0; i<=6; i++) {
           var text = ""+i
           if (i==0) {
               text = "12"
           }
           // On Side
           var x = center   + r1 * Math.cos(-a+2*i*a/6)
           var y = center+h + r1 * Math.sin(-a+2*i*a/6)
           // On Top
           //var x = center   + r1 * Math.cos(-2*a+2*i*a/6)
           //var y = center+h + r1 * Math.sin(-2*a+2*i*a/6)
		   // On Bottom
           //var x = center-bottom/2  + r2 * Math.cos(-2*a+2*(i)*a/6)
           //var y = center+height+h  + r2 * Math.sin(-2*a+2*(i)*a/6)
           c.text(text, x, y) 
        }
        // Draw numbers 6-12
        for (i=6; i<=12; i++) {
           var text = ""+i;
           // On Side
           //var x = center   + r1 * Math.cos(-a+2*(i-6)*a/6)
           //var y = center+h + r1 * Math.sin(-a+2*(i-6)*a/6)
           // On Bottom
           var x = center-bottom/2  + r2 * Math.cos(-2*a+2*(i-6)*a/6)
           var y = center+height+h  + r2 * Math.sin(-2*a+2*(i-6)*a/6)
           c.text(""+i, x, y) 
        }
        
        // Draw fixed segment.
        c.save()
        ZWstyle()
        c.beginPath()
        c.moveTo(center,center)
        c.lineTo(center-bottom/2,center+height)
        c.stroke()
        c.restore()

        // Draw Top of Z (up and over) then top gear as a group.
        c.save()
        c.translate(center,center)
        var g1 = c.newGroup()
        ZWstyle()
        c.beginPath()
        c.moveTo(0,0)
        c.lineTo(bottom/2,-height)
        /*  // If you want two seperate pieces, uncomment these three lines.
         c.stroke()
         c.beginPath()
         c.moveTo(bottom/2,-height)
         */
        c.lineTo(-bottom/2,-height)
        c.stroke()
        c.fillStyle = 'rgba(0,0,255,0.3)'
        c.fillCircle(bottom/2,-height, thickness/2.5)
        c.lineWidth = 1
        c.fillStyle = 'rgba(0, 0, 0, 0.1)'
        c.strokeStyle = medium
        c.beginPath()
        c.rotate(-a+Math.PI/n)
        c.gear(n, .2,r-1, .3,r+1, .4,r+2, .6,r+2,  .7,r+1, .8,r-1);
        c.fill()
        //c.stroke()
        c.restore()

        // Draw bottom of Z (draw to right) then bottom gear as a group.
        c.save()
        c.translate(center-bottom/2,center+height)
        var g2 = c.newGroup()
        ZWstyle()
        c.beginPath()
        c.moveTo(0,0)
        c.lineTo(bottom,0)
        c.stroke()
        c.fillStyle = 'rgba(0,0,255,0.3)'
        c.fillCircle(r2,0, thickness/2.5)
        c.lineWidth = 1
        c.fillStyle = 'rgba(0, 0, 0, 0.1)'
        c.strokeStyle = medium
        c.beginPath()
        c.rotate(-a)
        c.gear(n, .2,r-1, .3,r+1, .4,r+2, .6,r+2,  .7,r+1, .8,r-1);
        c.fill()
        //c.stroke()
        c.restore()
        
        
        log("Max Angle:", 2*a/Math.PI*180)
        
        
        var downCallback = function(g1, g2, e, drag) {
            drag.setOriginalTransforms([g1, g2])
        }
        var rotateGears = function(c, g1, g2, sign, e, drag) {
           g1.setAttribute('transform', c.svg.rotate(drag.original_transforms[0], sign*drag.rotate.degrees));
           g2.setAttribute('transform', c.svg.rotate(drag.original_transforms[1], -sign*drag.rotate.degrees));
        }
        
        c.svg.enableRotate(g1, new MochiKit.Style.Coordinates(center,center), 
                            partial(downCallback, g1 ,g2), 
                            partial(rotateGears, c,g1,g2,+1), 
                            null, [] )
                            
        c.svg.enableRotate(g2, new MochiKit.Style.Coordinates(center-bottom/2,center+height), 
                            partial(downCallback, g1 ,g2), 
                            partial(rotateGears, c,g1,g2,-1), 
                            null, [] )
    }

    /*
    'a1' : function(c) {
    },
    
    'a2' : function(c) {
    },
    */
    
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
    var i = 0, start = 6, number = 50;
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
