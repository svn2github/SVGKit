var PMT = {
    base:  "/pixel_view/",
    idbase: "pixel_view_",
    pixelL: [],
    pixelR: [],
    fillColorDefault:   "#000000",
    strokeColorDefault: "#545a65",
    color: [],

    init: function () {
        PMT.pixelL = document.getElementById(PMT.idbase+'pmt').contentDocument.getElementById("pmts_left").getElementsByTagName("rect");
        PMT.pixelR = document.getElementById(PMT.idbase+'pmt').contentDocument.getElementById("pmts_right").getElementsByTagName("rect");
        PMT.color = ["#D62728", "#2CA02C", "#1F77BF", "#FF7F0E", 
                     "#AA1155", "#5511AA", "#00AA66", "#AA6600",
                     "#FF0000", "#FFFF00", "#0000FF", "#00FFFF", 
                     "#FFFF00", "#FF00FF", "#22FFAA", "#FFAA22", 
                     "#BE0F10", "#108410", "#06539B", "#C65E01", 
                     "#550630", "#300655", "#005537", "#553700",
                     "#AA0000", "#AAAA00", "#0000AA", "#00AAAA", 
                     "#AAAA00", "#AA00AA", "#13AA77", "#AA7713",
                     "#000000"];
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
            PMT.setProps(PMT.snake_i, "both", "#FF0000", 1, PMT.strokeColorDefault, 1);
        }
        if (j >= 0) {
            PMT.setProps(j, "both", PMT.fillColorDefault, 0, PMT.strokeColorDefault, 1);
        }
        PMT.snake_i++;
        if (PMT.snake_i < 512+offset) {
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
    //variables:  chip       = IC that determines PulseNet state - "SETI", "Astro", "SuC", "AuC", "PN", or "FCT"
    //            stateParam = state parameter being plotted     - e.g. "programmingStatus";
    //            selection  = name of data to be displayed (used for id of key div)
    //            valueArray = possible parameter values         - e.g. PixelView.SETI_status_status_value_array;
    //            colorArray = possible pixel colors             - e.g. PMT.color;
    setAllWithOptions: function (chip, stateParam, selection, valueArray, colorArray) {
        PixelView.makeDiscreteKey(selection, valueArray, colorArray);
        for (pixelNum=0; pixelNum<512; pixelNum++) {
            //calculate value for pixel
            if      (chip == "SETI" | chip == "Astro")  {
                var PN         = Convert.pix2PN(pixelNum) ;
                var ES         = "ExperimentState.pulsenet";
                var stateVar   = ES + chip + "_State[" + PN + "]." + stateParam;
                var stateValue = State.currentState[stateVar];
            }
            else if (chip == "SuC") {
                var stateValue = Convert.pix2SuC(pixelNum);
            }
            else if (chip == "AuC") {
                var stateValue = Convert.pix2AuC(pixelNum);
            }
            else if (chip == "PN") {
                var stateValue = Convert.pix2PN(pixelNum);
            }
            else if (chip == "FCT") {
                var PN         = Convert.pix2PN(pixelNum);
                var stateValue = PN%4;
            }
            else                   {return}
            //set SVG pixel color according to state parameter
            for (valueIndex=0; valueIndex<valueArray.length; valueIndex++) {
                if (valueArray[valueIndex] == stateValue) {
                    var attrs = "fill:" + PMT.color[colorArray[valueIndex]] + ";" +
                                "fill-opacity:1;"                                 +
                                "stroke:" + PMT.strokeColorDefault + ";"          + 
                                "stroke-width:1;"                                 +
                                "stroke-opacity:1;"
                    PMT.pixelL[pixelNum].setAttribute("style",attrs);
                    PMT.pixelR[pixelNum].setAttribute("style",attrs);
                    //exit for loop early if match on stateValue?
                }
            }
        }        
    },

    //this function is not finished.
    setAllContinuous: function (chip, minValue, maxValue) {
        // TO DO: MAKE KEY FOR CONTINUOUS VARIABLES
        for (pixelNum=0; pixelNum<512; pixelNum++) {
            if (chip == "SETI" | chip == "Astro") {
                var PN          = Convert.pix2PN(pixelNum) ;
                var ES          = "ExperimentState.pulsenet";
                var stateVar    = ES + chip + "_State[" + PN + "].thresholdVoltage";
                var stateValue  = State.currentState[stateVar];
                var scaledValue = (stateValue-minValue)/(maxValue-minValue);
            }
            else {return}
            //set SVG pixel color according to state parameter 
            var redComp     = scaledValue;
            var greenComp   = (1-2*scaledValue)^2;
            var blueComp    = 1-scaledValue;
            var scaledColor = frgb(redComp,greenComp,blueComp));
            var attrs = "fill:" + scaledColor + ";"              +
                        "fill-opacity:1;"                        +
                        "stroke:" + PMT.strokeColorDefault + ";" +
                        "stroke-width:1;"                        +
                        "stroke-opacity:1;"
            PMT.pixelL[pixelNum].setAttribute("style",attrs);
            PMT.pixelR[pixelNum].setAttribute("style",attrs);
        }
    },
    
   
};

