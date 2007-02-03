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
    
    'arctest' : function(c) {
        log("Doing arctest");
        //     x, y, radius, startAngle, endAngle, anticlockwise
        c.rect(95,95,10,10);
        c.arc(100,100, 25, -0.2 *Math.PI, 0.2 *Math.PI, false);
        c.stroke();
    },
    
    'squares' : function (ctx) {
        ctx.fillStyle = "rgb(200,0,0)";
        ctx.fillRect (10, 10, 50, 50);

        ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        ctx.fillRect (30, 30, 50, 50);
    },
    
    'bowTies' : function(ctx) {
        function drawBowtie(ctx, fillStyle) {
            ctx.fillStyle = "rgba(200,200,200,0.3)";
            ctx.fillRect(-30, -30, 60, 60);

            ctx.fillStyle = fillStyle;
            ctx.globalAlpha = 1.0;
            ctx.beginPath();
            ctx.moveTo(25, 25);
            ctx.lineTo(-25, -25);
            ctx.lineTo(25, -25);
            ctx.lineTo(-25, 25);
            ctx.closePath();
            ctx.fill();
        }

            function dot(ctx) {
            ctx.save();
            ctx.fillStyle = "black";
            ctx.fillRect(-2, -2, 4, 4);
            ctx.restore();
        }

        // note that all other translates are relative to this
        // one
        ctx.translate(45, 45);

        ctx.save();
        //ctx.translate(0, 0); // unnecessary
        drawBowtie(ctx, "red");
        dot(ctx);
        ctx.restore();

        ctx.save();
        ctx.translate(85, 0);
        ctx.rotate(45 * Math.PI / 180);
        drawBowtie(ctx, "green");
        dot(ctx);
        ctx.restore();

        ctx.save();
        ctx.translate(0, 85);
        ctx.rotate(135 * Math.PI / 180);
        drawBowtie(ctx, "blue");
        dot(ctx);
        ctx.restore();

        ctx.save();
        ctx.translate(85, 85);
        ctx.rotate(90 * Math.PI / 180);
        drawBowtie(ctx, "yellow");
        dot(ctx);
        ctx.restore();
    },

    'blackRects' : function(ctx) {
        ctx.strokeRect(0,0,200-1,200-1);
        ctx.fillRect(25,25,100,100);
        ctx.clearRect(45,45,60,60);
        ctx.strokeRect(50,50,50,50);
    },
    
    'swoosh' : function(ctx) {
        ctx.fillStyle = "red";

        ctx.beginPath();
        ctx.moveTo(30, 30);
        ctx.lineTo(150, 150);
        ctx.quadraticCurveTo(60, 70, 70, 150);
        ctx.lineTo(30, 30);
        ctx.fill();
    },
    
    'smiley' : function(ctx) {
        ctx.beginPath();
        ctx.arc(75,75,50,0,Math.PI*2,true); // Outer circle
        ctx.moveTo(110,75);
        ctx.arc(75,75,35,0,Math.PI,false);   // Mouth (clockwise)
        ctx.moveTo(65,65);
        ctx.arc(60,65,5,0,Math.PI*2,true);  // Left eye
        ctx.moveTo(95,65);
        ctx.arc(90,65,5,0,Math.PI*2,true);  // Right eye
        ctx.stroke();
    },
    
    'triangles' : function(ctx) {
        // Filled triangle
        ctx.beginPath();
        ctx.moveTo(25,25);
        ctx.lineTo(105,25);
        ctx.lineTo(25,105);
        ctx.fill();

        // Stroked triangle
        ctx.beginPath();
        ctx.moveTo(125,125);
        ctx.lineTo(125,45);
        ctx.lineTo(45,125);
        ctx.closePath();
        ctx.stroke();
    },
    
    'arcs' : function(ctx) {
        for (var i=0;i<4;i++){
          for(var j=0;j<3;j++){
            ctx.beginPath();
            var x              = 25+j*50;               // x coordinate
            var y              = 25+i*50;               // y coordinate
            var radius         = 20;                    // Arc radius
            var startAngle     = 0;                     // Starting point on circle
            var endAngle       = Math.PI+(Math.PI*j)/2; // End point on circle
            var anticlockwise  = i%2==0 ? false : true; // clockwise or anticlockwise

            ctx.arc(x,y,radius,startAngle,endAngle, anticlockwise);

            if (i>1){
              ctx.fill();
            } else {
              ctx.stroke();
            }
          }
        }
    },
    
    'quadraticquotebox' : function(ctx) {
        // Quadratric curves example
        ctx.beginPath();
        ctx.moveTo(75,25);
        ctx.quadraticCurveTo(25,25,25,62.5);
        ctx.quadraticCurveTo(25,100,50,100);
        ctx.quadraticCurveTo(50,120,30,125);
        ctx.quadraticCurveTo(60,120,65,100);
        ctx.quadraticCurveTo(125,100,125,62.5);
        ctx.quadraticCurveTo(125,25,75,25);
        ctx.stroke();
    },
    
    'bezierheart' : function(ctx) {
        // Bezier curves example
        ctx.beginPath();
        ctx.moveTo(75,40);
        ctx.bezierCurveTo(75,37,70,25,50,25);
        ctx.bezierCurveTo(20,25,20,62.5,20,62.5);
        ctx.bezierCurveTo(20,80,40,102,75,120);
        ctx.bezierCurveTo(110,102,130,80,130,62.5);
        ctx.bezierCurveTo(130,62.5,130,25,100,25);
        ctx.bezierCurveTo(85,25,75,37,75,40);
        ctx.stroke();
    },
    
    'pacman' : function(ctx) {
    
        function roundedRect(ctx,x,y,width,height,radius){
            ctx.beginPath();
            ctx.moveTo(x,y+radius);
            ctx.lineTo(x,y+height-radius);
            ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
            ctx.lineTo(x+width-radius,y+height);
            ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
            ctx.lineTo(x+width,y+radius);
            ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
            ctx.lineTo(x+radius,y);
            ctx.quadraticCurveTo(x,y,x,y+radius);
            ctx.stroke();
        }

        // Draw shapes
        roundedRect(ctx,12,12,150,150,15);
        roundedRect(ctx,19,19,150,150,9);
        roundedRect(ctx,53,53,49,33,10);
        roundedRect(ctx,53,119,49,16,6);
        roundedRect(ctx,135,53,49,33,10);
        roundedRect(ctx,135,119,25,49,10);

        // Character 1
        ctx.beginPath();
        ctx.arc(37,37,13,Math.PI/7,-Math.PI/7,false);
        ctx.lineTo(34,37);
        ctx.fill();

        // blocks
        for(i=0;i<8;i++){
          ctx.fillRect(51+i*16,35,4,4);
        }
        for(i=0;i<6;i++){
          ctx.fillRect(115,51+i*16,4,4);
        }
        for(i=0;i<8;i++){
          ctx.fillRect(51+i*16,99,4,4);
        }

        // character 2
        ctx.beginPath();
        ctx.moveTo(83,116);
        ctx.lineTo(83,102);
        ctx.bezierCurveTo(83,94,89,88,97,88);
        ctx.bezierCurveTo(105,88,111,94,111,102);
        ctx.lineTo(111,116);
        ctx.lineTo(106.333,111.333);
        ctx.lineTo(101.666,116);
        ctx.lineTo(97,111.333);
        ctx.lineTo(92.333,116);
        ctx.lineTo(87.666,111.333);
        ctx.lineTo(83,116);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(91,96);
        ctx.bezierCurveTo(88,96,87,99,87,101);
        ctx.bezierCurveTo(87,103,88,106,91,106);
        ctx.bezierCurveTo(94,106,95,103,95,101);
        ctx.bezierCurveTo(95,99,94,96,91,96);
        ctx.moveTo(103,96);
        ctx.bezierCurveTo(100,96,99,99,99,101);
        ctx.bezierCurveTo(99,103,100,106,103,106);
        ctx.bezierCurveTo(106,106,107,103,107,101);
        ctx.bezierCurveTo(107,99,106,96,103,96);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(101,102,2,0,Math.PI*2,true);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(89,102,2,0,Math.PI*2,true);
        ctx.fill();
    },
    
    'graphImage' : function(context) {
        var image = new Image();
        image.src = '../tests/canvas_tests_images/graphImage.png';
        log("outter image function called for ", image.src);
        var imageStuff = function(ctx, img) {
            log("inner imageStuff called for ", image.src);
            log("drawing image stuff for ctx = ", ctx, "img = ", img, img.width, img.height, img.complete  );
            ctx.drawImage(img,0,0);
            ctx.beginPath();
            ctx.moveTo(30,96);
            ctx.lineTo(70,66);
            ctx.lineTo(103,76);
            ctx.lineTo(170,15);
            ctx.stroke();
        }
        if (image.complete)
            imageStuff(context, image);
        else
            addToCallStack(image, 'onload', partial(imageStuff, context, image));
    },
    
    'scale_image' : function(context) {
        var image = new Image();
        image.src = '../svgplot/canvas_tests_images/rhino.jpg';
        log("outter image function called for ", image.src);
        var innerImage = function(ctx, img) {
            log("inner imageStuff called for ", image.src);
            var i, j;
            for (i=0;i<4;i++) {
                for (j=0;j<3;j++) {
                  ctx.drawImage(img,j*50,i*38,50,38);
                }
            }
        }
        if (image.complete)
            innerImage(context, image);
        else
            addToCallStack(image, 'onload', partial(innerImage, context, image));
    },
    
    'fillstyle' : function(ctx) {
        for (i=0;i<6;i++){
            for (j=0;j<6;j++){
              ctx.fillStyle = 'rgb(' + Math.floor(255-42.5*i) + ',' + 
                               Math.floor(255-42.5*j) + ',0)';
              ctx.fillRect(j*25,i*25,25,25);
            }
        }
    },
    
    'strokestyle' : function(ctx) {
        for (i=0;i<6;i++){
          for (j=0;j<6;j++){
            ctx.strokeStyle = 'rgb(0,' + Math.floor(255-42.5*i) + ',' + 
                             Math.floor(255-42.5*j) + ')';
            ctx.beginPath();
            ctx.arc(12.5+j*25,12.5+i*25,10,0,Math.PI*2,true);
            ctx.stroke();
          }
        }
    },
    
    'globalalpha' : function(ctx) {
        // draw background
        ctx.fillStyle = '#FD0';
        ctx.fillRect(0,0,75,75);
        ctx.fillStyle = '#6C0';
        ctx.fillRect(75,0,75,75);
        ctx.fillStyle = '#09F';
        ctx.fillRect(0,75,75,75);
        ctx.fillStyle = '#F30';
        ctx.fillRect(75,75,75,75);
        ctx.fillStyle = '#FFF';

        // set transparency value
        ctx.globalAlpha = 0.2;

        // Draw semi transparent circles
        for (i=0;i<7;i++){
          ctx.beginPath();
          ctx.arc(75,75,10+10*i,0,Math.PI*2,true);
          ctx.fill();
        }
    },
    
    'rgba' : function(ctx) {
        // Draw background
        ctx.fillStyle = 'rgb(255,221,0)';
        ctx.fillRect(0,0,150,37.5);
        ctx.fillStyle = 'rgb(102,204,0)';
        ctx.fillRect(0,37.5,150,37.5);
        ctx.fillStyle = 'rgb(0,153,255)';
        ctx.fillRect(0,75,150,37.5);
        ctx.fillStyle = 'rgb(255,51,0)';
        ctx.fillRect(0,112.5,150,37.5);

        // Draw semi transparent rectangles
        for (i=0;i<10;i++){
            ctx.fillStyle = 'rgba(255,255,255,'+(i+1)/10+')';
            for (j=0;j<4;j++){
                ctx.fillRect(5+i*14,5+j*37.5,14,27.5)
            }
        }
    },
    
    'linewidth' : function(ctx) {
        for (i=0;i<10;i++){
            ctx.lineWidth = 1+i;
            ctx.beginPath();
            ctx.moveTo(5+i*14,5);
            ctx.lineTo(5+i*14,140);
            ctx.stroke();
        }
    },
    
    'linecap' : function(ctx) {
    var lineCap = ['butt','round','square'];
        // Draw guides
        ctx.strokeStyle = '#09f';
        ctx.beginPath();
        ctx.moveTo(10,10);
        ctx.lineTo(140,10);
        ctx.moveTo(10,140);
        ctx.lineTo(140,140);
        ctx.stroke();

        // Draw lines
        ctx.strokeStyle = 'black';
        for (i=0;i<lineCap.length;i++){
            ctx.lineWidth = 15;
            ctx.lineCap = lineCap[i];
            ctx.beginPath();
            ctx.moveTo(25+i*50,10);
            ctx.lineTo(25+i*50,140);
            ctx.stroke();
        }
    },
    
    'linejoin' : function(ctx) {
        var lineJoin = ['round','bevel','miter'];
        ctx.lineWidth = 10;
        for (i=0;i<lineJoin.length;i++){
            ctx.lineJoin = lineJoin[i];
            ctx.beginPath();
            ctx.moveTo(-5,5+i*40);
            ctx.lineTo(35,45+i*40);
            ctx.lineTo(75,5+i*40);
            ctx.lineTo(115,45+i*40);
            ctx.lineTo(155,5+i*40);
            ctx.stroke();
        }
    },
    
    'miterlimit' : function(ctx) {
        // Clear canvas
        ctx.clearRect(0,0,150,150);
  
        // Draw guides
        ctx.strokeStyle = '#09f';
        ctx.lineWidth   = 2;
        ctx.strokeRect(-5,50,160,50);
  
        // Set line styles
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 10;
  
        // check input
        ctx.miterLimit = 5;
  
        // Draw lines
        ctx.beginPath();
        ctx.moveTo(0,100);
        for (i=0;i<24;i++){
          var dy = i%2==0 ? 25 : -25 ;
          ctx.lineTo(Math.pow(i,1.5)*2,75+dy);
        }
        ctx.stroke();
        return false;
    }
    
};

function compositeTests() {
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

addLoadEvent(partial(addTests, 0, 50, 'canvas', true));
