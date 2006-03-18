var PMT = {
    base:  "/pixel_view/",
    idbase: "pixel_view_",
    pixelL: [],
    pixelR: [],
    fillColorDefault:   "#FF0025",
    strokeColorDefault: "#0A246A",
    color: [],

    init: function () {
        PMT.pixelL = document.getElementById(PMT.idbase+'pmt').contentDocument.getElementById("pmts_left").getElementsByTagName("rect");
        PMT.pixelR = document.getElementById(PMT.idbase+'pmt').contentDocument.getElementById("pmts_right").getElementsByTagName("rect");
        PMT.color = ["#FF0000", "#00FF00", "#0000FF", "#00FFFF", 
                     "#FF00FF", "#FFFF00", "#AA6600", "#00AA66",
                     "#AA0066", "0066AA#", "6600AA#", "#66AA00", 
                     "#FF9933", "99FF33#", "3399FF#", "33FF99#", ]
        // TODO: Loop through and add onclick event to each rect
    },
    
    setProps: function (pixnum, side, fillColor, fillOpacity, strokeColor, strokeOpacity) {
        attrs = "fill: " + fillColor + "; " +
                "fill-opacity: " + fillOpacity + "; " + 
                "stroke: " + strokeColor + "; " + 
                "stroke-linejoin: round; " + 
                "stroke-opacity: " + strokeOpacity + "; "
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
    snake: function () {
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
            callLater(0.1, PMT.snake);
        }
        else {
            PMT.snake_i = 0;
        }
    },
    
    //set all pixels back to the defaults (state=0), or bright red (state=1)
    all: function (state) {
        for (i=0; i<512; i++) {
            PMT.setProps(i, "both", PMT.fillColorDefault, state, PMT.strokeColorDefault, 1);
        }
    },
    
    //set all pixels to a solid color (opacity=1) according to a state parameter 
    //variables:  chip       = IC that determines PulseNet state - "PN", "SuC", or "AuC"
    //            astroSETI  = SETI or Astro parameter           - "SETI" or "Astro"
    //            stateParam = state parameter being plotted     - e.g. "programmingStatus";
    //            valueArray = possible parameter values         - e.g. PixelView.SETI_status_status_value_array;
    //            colorArray = possible pixel colors             - e.g. PMT.color;
    setAllWithOptions: function (chip, astroSETI, stateParam, valueArray, colorArray) {
        for (pixelNum=0; pixelNum<512; pixelNum++) {
            //calculate PN# or uC# for pixel
            if      (chip = "PN")  {var PN = Convert.pix2PN(pixelNum)}
            else if (chip = "SuC") {var PN = Convert.pix2SuC(pixelNum)}
            else if (chip = "AuC") {var PN = Convert.pix2AuC(pixelNum)}
            else                   {return}
            //get state variable (for left and right pixel[i])
            var stateVar   = "ExperimentState.pulsenet" + astroSETI + "_State[" + PN + "]." + stateParam
            var stateValue = State.currentState[stateVar];
            //set SVG pixel color according to state parameter
            for (valueIndex=0; valueIndex<valueArray.length; valueIndex++) {
                if (valueArray[valueIndex] == stateValue) {
                    var attrs = "fill: " + PMT.color[colorArray[valueIndex]] + "; " +
                                "fill-opacity: 1; "  
                                "stroke: " + PMT.strokeColorDefault + "; " + 
                                "stroke-linejoin: round; " + 
                                "stroke-opacity: 1; "
                    PMT.pixelL[pixelNum].setAttribute("style",attrs);
                    PMT.pixelR[pixelNum].setAttribute("style",attrs);
                    //exit for loop early if match?
                }
            }
        }
        
    },
};

