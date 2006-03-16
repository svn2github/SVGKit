var PMT = {
    base:  "/diagnostics/",
    idbase: "diagnostics_",
    pixelL: [],
    pixelR: [],
    fillColorDefault:  "#FF0025",
    strokeColorDefault: "#0A246A",

    init: function () {
        PMT.pixelL = document.getElementById('diagnostics_pmt').contentDocument.getElementById("pmts_left").getElementsByTagName("rect");
        PMT.pixelR = document.getElementById('diagnostics_pmt').contentDocument.getElementById("pmts_right").getElementsByTagName("rect");
        // TODO: Loop through and add onclick event to each rect
    },
    
    setProps: function(pixnum, side, fillColor, fillOpacity, strokeColor, strokeOpacity) {
        attrs = "fill: " + fillColor + "; " +
                "fill-opacity: " + fillOpacity + "; " + 
                "stroke: " + strokeColor + "; " + 
                "stroke-linejoin: round; " + 
                "stroke-opacity: " + strokeOpacity + "; "
        //log(attrs);
        if (side == "both") {
            PMT.pixelL[pixnum].setAttribute("style",attrs);
            PMT.pixelR[pixnum].setAttribute("style",attrs);
        }
        if (side == "left") {
            PMT.pixelL[pixnum].setAttribute("style",attrs);
        }
        else if (side == "right"){
            PMT.pixelR[pixnum].setAttribute("style",attrs);
        }
    },
    
    snake_i : 0,
    snake: function() {
        var offset = 8;
        var j = PMT.snake_i-offset;
        if (PMT.snake_i < 512) {
            PMT.setProps(PMT.snake_i, "both", PMT.fillColorDefault, 1, PMT.strokeColorDefault, 1);
        }
        if (j >= 0) {
            PMT.setProps(j, "both", PMT.fillColorDefault, 0, PMT.strokeColorDefault, 1);
        }
        PMT.snake_i++;
        if (PMT.snake_i <  512+offset) {
            callLater(0, PMT.snake);
        }
        else {
            PMT.snake_i = 0;
        }
    },
    
    all: function(state) {
        for (i=0; i<512; i++) {
            PMT.setProps(i, "both", PMT.fillColorDefault, state, PMT.strokeColorDefault, 1);
        }
    },
};

addLoadEvent(function() {PMT.init();});
addLoadEvent(function() {PMT.init();});