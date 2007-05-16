var testFunctions = {

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
    /*
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
    },
    */
    'interactive_gears': function (c) {
        var n = 15  // Spokes on gear
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


type = 'canvas'
