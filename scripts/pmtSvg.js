var PMT = {
    base:  "/pixel_view/",
    idbase: "pixel_view_",
    pixelL: [],
    pixelR: [],
    //keyGradient:    null,
    //keyGradientText: [],
    fillColorDefault:   "#000000",
    strokeColorDefault: "#545a65",
    gradientColorTop:     Color.fromHexString('#FF0000'),
    gradientColorBottom : Color.fromHexString('#0000FF'),

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

    //initKeyGradient: function () {
    //    PMT.keyGradient     = document.getElementById(PMT.idbase+'keyGradient').contentDocument;
    //    PMT.keyGradientText = PMT.keyGradient.getElementById("key").getElementsByTagName("text");
    //    addElementClass(PMT.keyGradient,"invisible");
    //},
    
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
            PMT.setProps(j, "both", PMT.fillColorDefault, 1, PMT.strokeColorDefault, 1);
        }
        PMT.snake_i++;
        if (PMT.snake_i < 512+offset) {
            callLater(0.1, PMT.snake);
        }
        else {
            PMT.snake_i = 0;
        }
    },
    
    all: function (state) {
        /*
        Set all pixels back to the defaults (state=0), or bright red (state=1)
        */
        for (i=0; i<512; i++) {
            PMT.setProps(i, "both", PMT.fillColorDefault, state, PMT.strokeColorDefault, 1);
        }
    },
    
    setOne: function (pixel, color) {
        /*
        Set one pixel to a color.
        */
        PMT.setProps(pixel, "both", color, 1, PMT.strokeColorDefault, 1);
    },
    
    setAllDiscrete: function (chip, stateParam, selection, valueArray, colorArray) {
        /*
        Set all pixels to a solid color (opacity=1) according to a state parameter.
        Variables:  chip       = IC that determines PulseNet state 
                                    - "SETI", "Astro", "SuC", "AuC", "PN", or "FCT"
                    stateParam = state parameter being plotted     
                                    - e.g. "programmingStatus";
                    selection  = name of data to be displayed (used for id of key div)
                    valueArray = possible parameter values         
                                    - e.g. PixelView.SETI_status_status_value_array;
                    colorArray = possible pixel colors             
                                    - e.g. PMT.color;
        */
        PixelView.makeDiscreteKey(selection, valueArray, colorArray);
        for (pixelNum=0; pixelNum<512; pixelNum++) {
            // calculate value for pixel
            if      (chip == "SETI" | chip == "Astro")  {
                var PN         = Convert.pix2PN(pixelNum) ;
                var chipName   = "pulsenet" + chip + "_State";
                var stateValue = State.currentState[chipName][PN][stateParam];
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
            // set SVG pixel color according to state parameter
            for (valueIndex=0; valueIndex<valueArray.length; valueIndex++) {
                if (valueArray[valueIndex] == stateValue) {
                    var attrs = "fill:" + PMT.color[colorArray[valueIndex]] + ";" +
                                "fill-opacity:1;"                                 +
                                "stroke:" + PMT.strokeColorDefault + ";"          + 
                                "stroke-width:1;"                                 +
                                "stroke-opacity:1;"
                    PMT.pixelL[pixelNum].setAttribute("style",attrs);
                    PMT.pixelR[pixelNum].setAttribute("style",attrs);
                    // exit for loop early if match on stateValue?
                }
            }
        }        
    },

    //  removeElementClass(document.getElementById(PMT.idbase + "key_continuous"),"invisible");
    
    // this function is not finished.
    setAllContinuous: function (chip, minValue, maxValue) {
        removeElementClass("invisible", PMT.idbase + "key_continuous");
        keyDiv = document.getElementById(PMT.idbase + "key_continuous")
        deferred = doSimpleXMLHttpRequest("/static/images/keyGradient.svg");
        deferred.addCallback(function(result) {
            log("setAllContinuous.result = " + result);
            keyDiv.innerHTML = result;
            keyGradient = document.getElementById(PMT.idbase+'keyGradient').contentDocument;
            keyText     = keyGradient.contentDocument.getElementById("key").getElementsByTagName("text");
            for (i=0; i<5; i++) {
                var value = minValue + i*(maxValue - minValue)/4;
                keyText[i].firstChild.firstChild.textContent = value.toPrecision(3);
            }
            // set pixel values
            for (pixelNum=0; pixelNum<512; pixelNum++) {
                if (chip == "SETI" | chip == "Astro") {
                    var PN          = Convert.pix2PN(pixelNum) ;
                    var ES          = "ExperimentState.pulsenet";
                    var stateVar    = ES + chip + "_State[" + PN + "].thresholdVoltage";
                    var stateValue  = State.currentState[stateVar];
                    var scaledValue = (stateValue-minValue)/(maxValue-minValue);
                }
                else {return}
                scaledColor = PMT.gradientColorTop.blendedColor(PMT.gradientColorBottom, 
                                 scaledValue).toHexString();
                log(pixelNum + "  " + scaledColor);
                var attrs = "fill:" + scaledColor + ";"              +
                            "fill-opacity:1;"                        +
                            "stroke:" + PMT.strokeColorDefault + ";" +
                            "stroke-width:1;"                        +
                            "stroke-opacity:1;"
                PMT.pixelL[pixelNum].setAttribute("style",attrs);
                PMT.pixelR[pixelNum].setAttribute("style",attrs);
            }
        });
        deferred.addErrback(function (err) {
            log("Error toggling key: " + repr(err));
        });
    },
    
   
};

