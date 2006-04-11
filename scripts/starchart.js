
var StarChart = {};

StarChart.base = '/starcatalog/';
StarChart.idbase = 'starcatalog_';
StarChart.svg = null;
StarChart.zoom = 1;
StarChart.moving = false;
StarChart.clientX = 0;
StarChart.clientY = 0;
StarChart.ramin = 0;
StarChart.ramax = 360;
StarChart.rarange = StarChart.ramax-StarChart.ramin
StarChart.decmin = -90;
StarChart.decmax = 90;
StarChart.decrange = StarChart.decmax-StarChart.decmin
StarChart.width = 720;
StarChart.height = 360;
StarChart.centerRa  = StarChart.ramin+StarChart.rarange/2;
StarChart.centerDec = StarChart.decmin+StarChart.decrange/2;
StarChart.currentDeferred = null;
StarChart.magmax = 13
StarChart.extraRoom = 1.3

/*
StarChart.current = {'ramin':StarChart.ramin,
                     'ramax':StarChart.ramax,
                     'decmin':StarChart.decmin,
                     'decmax':StarChart.decmax}
*/

StarChart.radecToScreen = function() {
    var sc = StarChart
    // Move the center over zero:
    var tx1 = -StarChart.centerRa
    var ty1 = -StarChart.centerDec
    // Zoom
    var sx = sc.zoom * sc.width / StarChart.rarange
    var sy = -sc.zoom * sc.height / StarChart.decrange
    // Move the center back over to width/2, height/2
    var tx2 = StarChart.width/2
    var ty2 = StarChart.height/2
    
    return 'translate('+tx2+','+ty2+')'+
            'scale('+sx+','+sy+')'+
            'translate('+tx1+','+ty1+')'
}

StarChart.down = function(self, evt) {
    log("mouse down", evt.clientX, evt.clientY);
    self.clientX = evt.clientX;
    self.clientY = evt.clientY;
    self.moving = true;
}

StarChart.move = function(self, evt) {
    if (self.moving) {
        self.translate(evt.clientX-self.clientX, evt.clientY-self.clientY);
        self.clientX = evt.clientX;
        self.clientY = evt.clientY;
    }
}

StarChart.up = function(self, evt) {
    log("mouse up", evt.clientX, evt.clientY);
    self.clientX = evt.clientX;
    self.clientY = evt.clientY;
    self.moving = false;
    self.loadStars()
    StarChart.svg.svgElement.forceRedraw()
}

StarChart.pad0 = function(string, newlength) {
  var pad = "";
  var len = newlength-String(string).length;
  var i;
  for (i = 0; i<len; i++) {
    pad += "0";
  }
  return pad+string;
}

StarChart.translate = function(dx, dy) {
    //StarChart.x += dx
    //StarChart.y += dy
    var sc = StarChart
    sc.centerRa -= dx/sc.width*StarChart.rarange/sc.zoom
    sc.centerDec += dy/sc.height*StarChart.decrange/sc.zoom
    sc.setDragables()
}

StarChart.scale = function(amount) {
    StarChart.zoom *= amount
    StarChart.setDragables()
    StarChart.loadStars()
    StarChart.svg.svgElement.forceRedraw()
}

StarChart.setDragables = function() {
    var dragable =  StarChart.svg.svgDocument.getElementsByTagName('g');
    for (i=0; i<dragable.length; i++)
        if (dragable[i].getAttribute('class')=='dragable' )
            dragable[i].setAttribute("transform", StarChart.radecToScreen());
    StarChart.svg.svgElement.forceRedraw()
}

StarChart.loadStars = function() {
    var sc = StarChart;
    var keys = ['magmax', 'ramin', 'ramax', 'decmin', 'decmax', 'max_stars'];
    var rahalf = sc.rarange / 2 / sc.zoom;
    var ramin = sc.centerRa - rahalf*sc.extraRoom
    var ramax = sc.centerRa + rahalf*sc.extraRoom
    var dechalf = sc.decrange / 2 / sc.zoom
    var decmin = sc.centerDec - dechalf*sc.extraRoom
    var decmax = sc.centerDec + dechalf*sc.extraRoom
    var values = [StarChart.magmax, ramin, ramax, decmin, decmax, 400];
    var query = this.base+'getStars?'+queryString(keys, values)
    log("query =", query);
    if (StarChart.currentDeferred != null) {
        StarChart.currentDeferred.cancel();
    }
    var deferred = loadJSONDoc(query);
    StarChart.currentDeferred = deferred;
    deferred.addCallback(function (response) {
        log("Got stars!");
        StarChart.s = response;
        StarChart.pruneStars();
        StarChart.displayStars(response);
    });
    deferred.addErrback(function (err) {
        log("error:", err);
    });
}

StarChart.pruneStars = function() {
    stars = StarChart.svg.svgDocument.getElementById('stars');
    SVG.removeAllChildren(stars)
}

StarChart.displayStars = function(newstars)  {
    var stars = StarChart.svg.svgDocument.getElementById('stars');
    log("Got ", newstars.length, " stars");
    for (i=0; i<newstars.length; i++) {
        var mag = newstars[i].mag;
        var dark255 = Math.round(255/StarChart.magmax*(StarChart.magmax-mag))
        var darkness = StarChart.pad0(Math.min(255, dark255).toString(16),2);
        //var darkness = 'FF';
        var circle = StarChart.svg.CIRCLE(
                                 {'cx': newstars[i].ra,
                                  'cy': newstars[i].dec,
                                  'r': (StarChart.magmax+1.-newstars[i].mag)*.04, // /Math.sqrt(StarChart.zoom),
                                  'fill': '#'+darkness+darkness+darkness,
                                  //'fill-opacity': darkness/255.,
                                  'stroke' : 'none'});
        stars.appendChild(circle);
    }
}

StarChart.createRandom = function(number) {
    if (typeof(number)=='undefined' || number==null)
        number = 200;
    log("In createRandom");
    // evt.preventDefault();
    // var SVGDoc=evt.currentTarget.getOwnerDocument();
    var stars = StarChart.svg.svgDocument.getElementById('stars');
    
    for (i=0; i<number; i++) {
        var darkness = StarChart.pad0(Math.round(Math.random()*0xff).toString(16),2);
        var circle = StarChart.svg.CIRCLE(
                                 {'cx': Math.random()*360,
                                  'cy': Math.random()*180-90,
                                  'r': Math.random()*0.3+'%',
                                  'fill': '#'+darkness+darkness+darkness });
        stars.appendChild(circle);
    }
}

StarChart.createRects = function(stripes) {
    if (typeof(stripes)=='undefined' || stripes==null)
        stripes = 10;
    var coverage = StarChart.svg.svgDocument.getElementById('coverage');
    
    var multiple = 2;
    var start = -(stripes>>1)
    for (var i=start; i<start+stripes; i++) {
        for (var m=0; m<multiple; m++) {
            var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            var length = Math.random()*360
            rect.setAttribute("x", Math.random()*360 );
            rect.setAttribute("y", ((i*300)/stripes)+50+'%' );
            rect.setAttribute("width", Math.random()*200+'%' );
            rect.setAttribute("height", .9+'%' );
            var darkness = StarChart.pad0(Math.round(Math.random()*0xff).toString(16),2);
            rect.setAttribute("fill", 'blue' );
            rect.setAttribute("opacity", '.6' );
            coverage.appendChild(rect);
        }
    }
}

StarChart.startup = function() {
    var sc = StarChart
    sc.svg = new MochiKit.SVG(sc.idbase+'starchart');
    var s = sc.svg
    function ready(sc, s) {
        sc.width = parseInt(s.svgElement.getAttribute('width'))
        sc.height = parseInt(s.svgElement.getAttribute('height'))
        // ra goes from 0 to 360 and dec goes from -90 to 90
        var stars = s.$('stars')
        log("element width =", sc.width, " height = ", sc.height, " transform = ", sc.radecToScreen());
        stars.setAttribute('transform', sc.radecToScreen())
        //sc.createRandom();
        sc.loadStars();
        //sc.createRects();
        addToCallStack(s.svgElement, 'onmousedown', partial(sc.down, sc));
        addToCallStack(s.svgElement, 'onmousemove', partial(sc.move, sc));
        addToCallStack(s.svgElement, 'onmouseup', partial(sc.up, sc));
        addToCallStack(s.$('up_arrow'), 'onclick', partial(sc.translate, 0, 10));
        addToCallStack(s.$('down_arrow'), 'onclick', partial(sc.translate, 0, -10));
        addToCallStack(s.$('left_arrow'), 'onclick', partial(sc.translate, 10, 0));
        addToCallStack(s.$('right_arrow'), 'onclick', partial(sc.translate, -10, 0));
        addToCallStack(s.$('plus_zoom'), 'onclick', partial(sc.scale, 1.5));
        addToCallStack(s.$('minus_zoom'), 'onclick', partial(sc.scale, 1/1.5));
    }
    StarChart.svg.whenReady(partial(ready,sc, s));
}


//log("Adding createRandom and createRects");
//addLoadEvent(StarChart.startup);
