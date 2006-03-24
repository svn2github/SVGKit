function (c) {
 log("closePath then lineTo");
 c.moveTo(20,20)
 c.lineTo(50,50)
 c.lineTo(80,10)
 c.closePath()
 c.lineTo(180,90)
 c.lineTo(150,60)
 c.stroke();
 
 log("stroke then more then stroke some more");
 c.moveTo(20,80)
 c.lineTo(30,90)
 c.stroke();
 c.lineTo(20,120)
 c.stroke();
 
 log("fill then more then stroke -- make sure paths don't close.");
 c.fillStyle='#fcf'
 c.moveTo(10,80)
 c.lineTo(50,90)
 c.lineTo(90,10)
 c.fill();
 c.strokeStyle='#000'
 c.lineTo(90,90)
 c.stroke();
 log("Then do it again without calling beginPath()");
 c.fillStyle='#fcf'
 c.moveTo(110,80)
 c.lineTo(150,90)
 c.lineTo(190,10)
 c.fill();
 c.strokeStyle='#000'
 c.lineTo(190,90)
 c.stroke();
 
 log("calling fill multiple times to darken")
 c.fillStyle='rgba(200,0,200,.2)'
 c.moveTo(10,80)
 c.lineTo(50,90)
 c.lineTo(90,10)
 c.fill()
 c.fill()
 c.fill()
 
 log("draw translate draw translate draw fill")
 c.strokeRect(10,10,50,50)
 c.fillStyle='rgba(200,0,200,.5)'
 c.beginPath()
 c.moveTo(10,10)
 c.translate(50,0)
 c.lineTo(10,10)
 c.translate(0,50)
 c.lineTo(10,10)
 c.translate(-50,0)
 c.lineTo(10,10)
 c.translate(0,-50)
 c.lineTo(10,10)
 c.fill()
 
 log("save/restore test")
 c.strokeRect(10,10,50,50)
 c.fillStyle='rgba(200,0,200,.5)'
 c.beginPath()
 c.moveTo(10,10)
 c.save()
 c.translate(50,0)
 c.lineTo(10,10)
 c.translate(0,50)
 c.lineTo(10,10)
 c.translate(-50,0)
 c.lineTo(10,10)
 //c.translate(0,-50)
 c.restore()
 c.lineTo(10,10)
 c.fill()
 
 log("rotate test")
 //c.strokeRect(10,10,50,50)
 c.fillStyle='rgba(200,0,200,.5)'
 c.beginPath()
 c.moveTo(100,0)
 c.save()
 c.rotate(Math.PI/8)
 c.lineTo(100,0)
 c.rotate(Math.PI/8)
 c.lineTo(100,0)
 c.rotate(Math.PI/8)
 c.lineTo(100,0)
 c.rotate(Math.PI/8)
 c.lineTo(100,0)
 c.rotate(Math.PI/8)
 c.lineTo(100,0)
 c.rotate(Math.PI/8)
 c.lineTo(100,0)
 c.restore()
 c.lineTo(100,0)
 c.fill()
 
 log("arcTo test");
  c.moveTo(20,20)
 c.lineTo(50,50)
 c.lineTo(80,10)
 c.closePath()
 c.lineTo(180,90)
 c.lineTo(150,60)
 c.stroke();
}

log("arc and rotate")
c.rotate(-Math.PI/16)
c.arc(100,50,20,0,2*Math.PI-0.1, false);
c.arc(150,75,20,0,2*Math.PI-0.1, false);
c.moveTo(50,50)
c.lineTo(150,90)
c.rotate(Math.PI/8)
c.arc(100,100,50,0,2*Math.PI, true);
c.stroke()


log("arcTo test")
c.moveTo(20,150)
c.arcTo(100,20, 200,200, 50)
c.stroke()


 
 log("draw translate draw translate draw fill")
 m = c.svg.SVGMatrix(1,2,3,4,5,6)