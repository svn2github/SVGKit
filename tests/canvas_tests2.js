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
    
    'lineargradient' : function(ctx) {
        // Create gradients
        var lingrad = ctx.createLinearGradient(0,0,0,150);
        lingrad.addColorStop(0, '#00ABEB');
        lingrad.addColorStop(0.5, '#fff');
        lingrad.addColorStop(0.5, '#26C000');
        lingrad.addColorStop(1, '#fff');

        var lingrad2 = ctx.createLinearGradient(0,50,0,95);
        lingrad2.addColorStop(0.5, '#000');
        lingrad2.addColorStop(1, 'rgba(0,0,0,0)');

        // assign gradients to fill and stroke styles
        ctx.fillStyle = lingrad;
        ctx.strokeStyle = lingrad2;

        // draw shapes
        ctx.fillRect(10,10,130,130);
        ctx.strokeRect(50,50,50,50);
    },
    
    'radialgradient' : function(ctx) {
        // Create gradients
        var radgrad = ctx.createRadialGradient(45,45,10,52,50,30);
        radgrad.addColorStop(0, '#A7D30C');
        radgrad.addColorStop(0.9, '#019F62');
        radgrad.addColorStop(1, 'rgba(1,159,98,0)');

        var radgrad2 = ctx.createRadialGradient(105,105,20,112,120,50);
        radgrad2.addColorStop(0, '#FF5F98');
        radgrad2.addColorStop(0.75, '#FF0188');
        radgrad2.addColorStop(1, 'rgba(255,1,136,0)');

        var radgrad3 = ctx.createRadialGradient(95,15,15,102,20,40);
        radgrad3.addColorStop(0, '#00C9FF');
        radgrad3.addColorStop(0.8, '#00B5E2');
        radgrad3.addColorStop(1, 'rgba(0,201,255,0)');

        var radgrad4 = ctx.createRadialGradient(0,150,50,0,140,90);
        radgrad4.addColorStop(0, '#F4F201');
        radgrad4.addColorStop(0.8, '#E4C700');
        radgrad4.addColorStop(1, 'rgba(228,199,0,0)');

        // draw shapes
        ctx.fillStyle = radgrad4;
        ctx.fillRect(0,0,150,150);
        ctx.fillStyle = radgrad3;
        ctx.fillRect(0,0,150,150);
        ctx.fillStyle = radgrad2;
        ctx.fillRect(0,0,150,150);
        ctx.fillStyle = radgrad;
        ctx.fillRect(0,0,150,150);
    },
    
    'savestate' : function(ctx) {
      ctx.fillRect(0,0,150,150);   //  draw a rectangle with default settings
      ctx.save();                  //  Save the default state

      ctx.fillStyle = '#09F'       // Make changes to the settings
      ctx.fillRect(15,15,120,120); // Draw a rectangle with new settings

      ctx.save();                  // Save the current state
      ctx.fillStyle = '#FFF'       // Make changes to the settings
      ctx.globalAlpha = 0.5;
      ctx.fillRect(30,30,90,90);   // Draw a rectangle with new settings

      ctx.restore();               // Restore previous state
      ctx.fillRect(45,45,60,60);   // Draw a rectangle with restored settings

      ctx.restore();               // Restore original state
      ctx.fillRect(60,60,30,30);   // Draw a rectangle with restored settings
    },
    
    'translate' : function(ctx) {
        ctx.fillRect(0,0,300,300);
        for (var i=0;i<3;i++) {
            for (var j=0;j<3;j++) {
                ctx.save();
                ctx.strokeStyle = "#9CFF00";
                ctx.translate(50+j*100,50+i*100);
                drawSpirograph(ctx,20*(j+2)/(j+1),-8*(i+3)/(i+1),10);
                ctx.restore();
            }
        }
    },
    
    'rotate' : function(ctx) {
      ctx.translate(75,75);

      for (i=1;i<6;i++){ // Loop through rings (from inside to out)
        ctx.save();
        ctx.fillStyle = 'rgb('+(51*i)+','+(255-51*i)+',255)';

        for (j=0;j<i*6;j++){ // draw individual dots
          ctx.rotate(Math.PI*2/(i*6));
          ctx.beginPath();
          ctx.arc(0,i*12.5,5,0,Math.PI*2,true);
          ctx.fill();
        }

        ctx.restore();
      }
    },
    
    'scale' : function(ctx) {
      ctx.strokeStyle = "#fc0";
      ctx.lineWidth = 1.5;
      ctx.fillRect(0,0,300,300);

      // Uniform scaling
      ctx.save()
      ctx.translate(50,50);
      drawSpirograph(ctx,22,6,5);  // no scaling

      ctx.translate(100,0);
      ctx.scale(0.75,0.75);
      drawSpirograph(ctx,22,6,5);

      ctx.translate(133.333,0);
      ctx.scale(0.75,0.75);
      drawSpirograph(ctx,22,6,5);
      ctx.restore();

      // Non uniform scaling (y direction)
      ctx.strokeStyle = "#0cf";
      ctx.save()
      ctx.translate(50,150);
      ctx.scale(1,0.75);
      drawSpirograph(ctx,22,6,5);

      ctx.translate(100,0);
      ctx.scale(1,0.75);
      drawSpirograph(ctx,22,6,5);

      ctx.translate(100,0);
      ctx.scale(1,0.75);
      drawSpirograph(ctx,22,6,5);
      ctx.restore();

      // Non uniform scaling (x direction)
      ctx.strokeStyle = "#cf0";
      ctx.save()
      ctx.translate(50,250);
      ctx.scale(0.75,1);
      drawSpirograph(ctx,22,6,5);

      ctx.translate(133.333,0);
      ctx.scale(0.75,1);
      drawSpirograph(ctx,22,6,5);

      ctx.translate(177.777,0);
      ctx.scale(0.75,1);
      drawSpirograph(ctx,22,6,5);
      ctx.restore();
    },
    
    'createpattern' : function (context) {
        // create new image object to use as pattern
        var image = new Image();
        image.src = '../tests/canvas_tests_images/createpattern.png';
        log("outter image function called for ", image.src);
        var imageStuff3 = function(ctx, img) {
            // create pattern
            log("inner image function called for ", img.src, ctx);
            var ptrn = ctx.createPattern(img,'repeat');
            ctx.fillStyle = ptrn;
            ctx.fillRect(0,0,150,150);
        }
        if (image.complete)
            imageStuff3(context, image);
        else
            addToCallStack(image, 'onload', partial(imageStuff3, context, image));
    },
    
    'clip' : function (ctx) {
          ctx.fillRect(0,0,150,150);
          ctx.translate(75,75);

          // Create a circular clipping path        
          ctx.beginPath();
          ctx.arc(0,0,60,0,Math.PI*2,true);
          ctx.clip();

          // draw background
          var lingrad = ctx.createLinearGradient(0,-75,0,75);
          lingrad.addColorStop(0, '#232256');
          lingrad.addColorStop(1, '#143778');
          
          ctx.fillStyle = lingrad;
          ctx.fillRect(-75,-75,150,150);
          
          function drawStar(ctx,r){
                ctx.save();
                ctx.beginPath()
                ctx.moveTo(r,0);
                for (i=0;i<9;i++){
                  ctx.rotate(Math.PI/5);
                  if(i%2 == 0) {
                    ctx.lineTo((r/0.525731)*0.200811,0);
                  } else {
                    ctx.lineTo(r,0);
                  }
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
          }

          // draw stars
          for (j=1;j<50;j++){
            ctx.save();
            ctx.fillStyle = '#fff';
            ctx.translate(75-Math.floor(Math.random()*150),
                          75-Math.floor(Math.random()*150));
            drawStar(ctx,Math.floor(Math.random()*4)+2);
            ctx.restore();
          }
    },
    
    
    'solarsystem' : function (context) {
        var drawSolarSystem = function(ctx) {
            ctx.globalCompositeOperation = 'destination-over';
            ctx.clearRect(0,0,300,300); // clear canvas

            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.strokeStyle = 'rgba(0,153,255,0.4)';
            ctx.translate(150,150);

            // Earth
            var time = new Date();
            ctx.rotate( ((2*Math.PI)/60)*time.getSeconds() + ((2*Math.PI)/60000)*time.getMilliseconds() );
            ctx.translate(105,0);
            ctx.fillRect(0,-12,50,24); // Shadow
            ctx.drawImage(earth,-12,-12);

            // Moon
            ctx.save();
            ctx.rotate( ((2*Math.PI)/6)*time.getSeconds() + ((2*Math.PI)/6000)*time.getMilliseconds() );
            ctx.translate(0,28.5);
            ctx.drawImage(moon,-3.5,-3.5);
            ctx.restore();

            ctx.restore();

            ctx.beginPath();
            ctx.arc(150,150,105,0,Math.PI*2,false); // Earth orbit
            ctx.stroke();

            ctx.drawImage(sun,0,0);
        }
        var sun = new Image();
        var moon = new Image();
        var earth = new Image();
        sun.src = '../tests/canvas_tests_images/sun.png';
        moon.src = '../tests/canvas_tests_images/moon.png';
        earth.src = '../tests/canvas_tests_images/earth.png';
        //setInterval( partial(drawSolarSystem, context) ,10000);
    },
    
    'clock' : function(context) {
        function doClock(ctx) {
          var now = new Date();
          ctx.save();
          ctx.clearRect(0,0,150,150);
          ctx.translate(75,75);
          ctx.scale(0.4,0.4);
          ctx.rotate(-Math.PI/2);
          ctx.strokeStyle = "black";
          ctx.fillStyle = "white";
          ctx.lineWidth = 8;
          ctx.lineCap = "round";

          // Hour marks
          ctx.save();
          ctx.beginPath();
          for (i=0;i<12;i++){
            ctx.rotate(Math.PI/6);
            ctx.moveTo(100,0);
            ctx.lineTo(120,0);
          }
          ctx.stroke();
          ctx.restore();

          // Minute marks
          ctx.save();
          ctx.lineWidth = 5;
          ctx.beginPath();
          for (i=0;i<60;i++){
            if (i%5!=0) {
              ctx.moveTo(117,0);
              ctx.lineTo(120,0);
            }
            ctx.rotate(Math.PI/30);
          }
          ctx.stroke();
          ctx.restore();
          
          var sec = now.getSeconds();
          var min = now.getMinutes();
          var hr  = now.getHours();
          hr = hr>=12 ? hr-12 : hr;

          ctx.fillStyle = "black";

          // write Hours
          ctx.save();
          ctx.rotate( hr*(Math.PI/6) + (Math.PI/360)*min + (Math.PI/21600)*sec )
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.moveTo(-20,0);
          ctx.lineTo(80,0);
          ctx.stroke();
          ctx.restore();

          // write Minutes
          ctx.save();
          ctx.rotate( (Math.PI/30)*min + (Math.PI/1800)*sec )
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(-28,0);
          ctx.lineTo(112,0);
          ctx.stroke();
          ctx.restore();
          
          // Write seconds
          ctx.save();
          ctx.rotate(sec * Math.PI/30);
          ctx.strokeStyle = "#D40000";
          ctx.fillStyle = "#D40000";
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(-30,0);
          ctx.lineTo(83,0);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0,0,10,0,Math.PI*2,true);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(95,0,10,0,Math.PI*2,true);
          ctx.stroke();
          ctx.fillStyle = "#555";
          ctx.arc(0,0,3,0,Math.PI*2,true);
          ctx.fill();
          ctx.restore();

          ctx.beginPath();
          ctx.lineWidth = 14;
          ctx.strokeStyle = '#325FA2';
          ctx.arc(0,0,142,0,Math.PI*2,true);
          ctx.stroke();

          ctx.restore();
        }
        doClock(context);
        //setInterval( partial(doClock, context) ,2000);
    },
    
    'arcTo' :  function(c) {
        with (c) {
            beginPath();
            strokeStyle='rgba(0,0,255,.25)'
            var x0=0, y0=100, x1=200, y1=0, x2=200, y2=200;
            moveTo(x0, y0);
            lineTo(x1, y1);
            lineTo(x2, y2);
            stroke();
            
            strokeStyle='rgba(255,0,0,.5)'
            beginPath();
            moveTo(x0, y0);
            arcTo(x1, y1, x2, y2,60);
            lineTo(x2, y2);
            stroke();
            
            x0=200, y0=200, x1=50, y1=100, x2=0, y2=200;
            strokeStyle='rgba(255,0,0,.2)'
            beginPath();
            moveTo(x0, y0);
            lineTo(x1, y1);
            lineTo(x2, y2);
            stroke();
            
            strokeStyle='rgba(0,0,255,.2)'
            for (var r=30; r<300; r+=30) {
                moveTo(x0, y0);
                arcTo(x1, y1, x2, y2, r);
                lineTo(x2, y2);
                stroke();
            }
        }
    },
    
    'linespacing' : function(ctx) {
        //ctx.strokeRect(0, 0, 200, 200);
        for (j = 0; j < 12; j++) {
            var max = j < 4 ?80 : Math.floor(3*80/j);
            for (i = 0; i < max; i++) {
                ctx.beginPath();
                var spacing = j < 4 ? j / 3 : j;
                var x = 0.5 + i * (spacing + 1.1);
                var y = j * 17;
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + 13);
                ctx.stroke();
            }
        }
    },
    
    'linespacing_rounded' : function(ctx) {
        //ctx.strokeRect(0, 0, 200, 200);
        for (j = 0; j < 12; j++) {
            var max = j < 4 ?80 : Math.floor(3*80/j);
            for (i = 0; i < max; i++) {
                ctx.beginPath();
                var spacing = j < 4 ? j / 3 : j;
                var x = 0.5 + Math.round(i * (spacing  + 1.1));
                var y = Math.round(j * 17);
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + 13);
                ctx.stroke();
            }
        }
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


type = 'canvas'
