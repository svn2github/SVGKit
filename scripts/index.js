function roundPanelCorners() {
    roundClass("div", "panel", {bgColor: "#000000"});
}

function topTimeFunc() {       
    topTimeRefresh = window.setTimeout( "topTimeFunc()", 1000 );       
    var dateToday = new Date();       
    $('top_time').innerHTML= toISOTimestamp(dateToday);
}

var TopBar = {
    /* Function to update state variables in the top toolbar.  
       Gets called by an addStateCallback at the bottom of the file.*/
        update: function (newstate) {
        //get the state variables
        myvals = [];
        myvals["instrumentMode"] = newstate.instrumentState.mode;
        tempState = newstate.temperatureTelemetryState;
        myvals["instTemp"]       = 0.;
        for (i=0; i<8; i++) {
            myvals["instTemp"]   = Math.max(myvals["instTemp"], 
                                            parseInt(tempState[i].temperature))
        }
        myvals["instHumidity"]   = newstate.humidityTelemetryState.humidity
        myvals["instrument"]     = myvals["instrumentMode"] + "  -  " + 
                                   myvals["instTemp"] + "°F / " + 
                                   myvals["instHumidity"] + "%";
        myvals["shutter"]        = newstate.shutterState.position;
        myvals["shutter"]        = myvals["shutter"].substring(0,1).toUpperCase() + 
                                   myvals["shutter"].substring(1,myvals['shutter'].length);
        myvals["telescopeDeg"]   = newstate.telescopeState.degrees 
        // TO-DO: add declination (it will depend on time, of course)
        myvals["telescope"]      = parseFloat(myvals["telescopeDeg"]) + 42.5 //convert to declination
        myvals["telescope"]      = myvals["telescope"].toPrecision(3) + "° dec";
        myvals["temperature"]    = newstate.weatherStationState.temperature + "°F";
        myvals["humidity"]       = newstate.weatherStationState.humidity + "%";
        myvals["environment"]    = newstate.weatherStationState.temperature + "°F / " + 
                                   newstate.weatherStationState.humidity + "%";
        myvals["cloudCover"]     = newstate.webCloudCoverState.cloudCover + "%";
        //replace the state variables in the top toolbar
        myvars = ["instrument", "shutter", "telescope", 
                  "environment", "cloudCover"];
        forEach(myvars,
            function (myvar) {
                elem = getElement("top_" + myvar);
                if (elem) {
                    replaceChildNodes(elem, SPAN(null, myvals[myvar]));
                }
            }
        );
    },
}

function loadClearSkyClock() {
    var dateToday = new Date();
    var myImg = IMG( {'src':'http://cleardarksky.com/csk/getcsk.php?id=OkRdgObMA'} );
    replaceChildNodes('img_skyclock', myImg);
    $('timestamp_skyclock').innerHTML= toISOTimestamp(dateToday);
}

function addPanel(elem) {
    newElem = getElement(elem);
    if (newElem != null) {
        if (hasElementClass(newElem, "panelInvisible")) {
            togglePanel(elem);
        }
    }
}

function togglePanel(elem,source,sourcetype) {
    makePanel(elem);
    toggleMenuItem(elem);
}

function toggleMenuItem(elem) {
    toggleElementClass("panelShown","bar_" + elem);
    //set cookies for panel state
    if (hasElementClass("bar_" + elem, "panelShown")) {
        Cookie.create(Cookie.panelPrefix + elem, "true", 30);
    }
    else Cookie.erase(Cookie.panelPrefix + elem);
}

function panelIsVisible(elem) {
    return !hasElementClass(elem, "panelInvisible");
}

function makePanel(elem) {
    toggleElementClass("panelInvisible", elem);
}

function isInt(str) {
    //function that returns true if str is an integer, and false otherwise
	var i = parseInt (str);
	if (isNaN (i)) {
		return false;
    } 
	i = i . toString ();
	if (i != str) {
		return false;
    }
	return true;
}

var Cookie = {
    panelPrefix: 'panel_',
    controlPrefix: 'event_view_controls_',

    create: function (name,value,days) {
    	if (days) {
    		var date = new Date();
    		date.setTime(date.getTime()+(days*24*60*60*1000));
    		var expires = "; expires="+date.toGMTString();
    	}
    	else var expires = "";
    	document.cookie = name + "=" + value + expires + "; path=/";
    },

    read: function (name) {
    	var nameEQ = name + "=";
    	var ca = document.cookie.split(';');
    	for(var i=0; i<ca.length; i++) {
    		var c = ca[i];
    		while (c.charAt(0)==' ') {
                c = c.substring(1, c.length);
            }
    		if (c.indexOf(nameEQ) == 0) { 
                return c.substring(nameEQ.length, c.length);
            }
        }
    	return null;
    },

    erase: function (name) {
    	Cookie.create(name, "", -1);
    },    

    restorePanels: function () {
    	var cookieArray = document.cookie.split(';');
    	for(var i=0;i < cookieArray.length;i++) {
    		while (cookieArray[i].charAt(0)==' ') {
                cookieArray[i] = cookieArray[i].substring(1, cookieArray[i].length);
            }
            var pair = cookieArray[i].split('=');
            //log(pair[0]);
            if (pair[0].substring(0, Cookie.panelPrefix.length) == Cookie.panelPrefix) {
                if (pair[1] == "true") {
                    togglePanel(pair[0].substring(Cookie.panelPrefix.length, pair[0].length));
                }
            }
            /*
            else if (pair[0].substring(0, Cookie.controlPrefix.length) == Cookie.controlPrefix) {
                log(pair[0]);
                elem = getElement(pair[0]);
                if (elem.type == "radio" | elem.type == "checkbox") {
                    elem.checked = pair[1];
                }
                else if (elem.type == "text") {
                    elem.value = pair[1];
                }
            }
            */
        }
    },
    
    restoreSettings: function () {
        getAllTelemetry
        //
    },

}    

//functions that convert PMT pixel numbers (0-511) to various other numbers
var Convert = {
    PMTdict1 : [ 2, 3, 0, 1 ],
    PMTdict2 : [ 0, 14,  5, 10, 13,  2,  9,  7,
                12,  3,  8,  7,  0, 15,  4, 11, 
                 1, 13,  4, 11, 12,  3, 10,  6, 
                13,  0,  9,  6,  1, 14,  7, 10, 
                 2, 15,  6,  9, 14,  1,  8,  5, 
                14,  2, 11,  4,  3, 12,  5,  9, 
                 3, 12,  7,  8, 15,  0, 11,  4, 
                15,  1, 10,  5,  2, 13,  6,  8],
    // dictionary that converts [PNonBoard, PNpix] into PMT pixel number (0-63)
    // not that DBonBoard = asicNo and has range (0-3)
    PMTdict3   : [[12, 28, 60, 44, 14, 46, 62, 30, 10, 26, 58, 42,  8, 24, 40, 56], 
                  [25, 57, 41,  9, 43, 59, 27, 11, 63, 47, 31, 15, 45, 61, 29, 13], 
                  [ 0, 16, 32, 48, 18,  2, 34, 50, 38,  6, 22, 54, 20,  4, 36, 52], 
                  [53, 37,  5, 21, 55, 39, 23,  7, 51, 35,  3, 19, 49, 17,  1, 33]],

    // convert PMT pixel number (0-511) to PMT number (0-7, 8-15)
    pix2PMT: function (pixelNum) {
        var pmtL = (pixelNum-pixelNum%64) / 64;
        return pmtL
    },
    
    // convert PMT pixel number (0-511) to PMT pixel number (0-63) [on the given PMT]
    pix2PMTpix: function (pixelNum) {
        var PMTpix = pixelNum%64;
        return PMTpix
    },
       
    // convert PMT pixel number (0-511) to SETI uC number (0-7)
    pix2SuC: function (pixelNum) {
        var SuC = 7 - (pixelNum-pixelNum%64) / 64;
        return SuC
    },

    // convert PMT pixel number (0-511) to Astronomy uC number (8-11)
    pix2AuC: function (pixelNum) {
        var AuC = 11 - (pixelNum-pixelNum%128) / 128;
        return AuC
    },
    
    // convert PMT pixel number (0-511) to PulseNet number (0-3) [on the given daughterboard]
    pix2PNonBoard: function (pixelNum) {
        var temp = 2 * (((pixelNum-pixelNum%8) / 8) % 2) + (pixelNum%2)
        var PNonBoard = Convert.PMTdict1[temp];
        return PNonBoard
    },
    
    // convert PMT pixel number (0-511) to PulseNet number (0-31) [on all daughterboards]
    pix2PN: function (pixelNum) {
        var SuC = Convert.pix2SuC(pixelNum);
        var PNonBoard = Convert.pix2PNonBoard(pixelNum);
        var PN = 4 * (7 - SuC) + PNonBoard;
        return PN
    },
    
    // convert PMT pixel number (0-511) to PulseNet pixel number (0-15)
    pix2PNpix: function (pixelNum) {
        var PMTpix = Convert.pix2PMTpix(pixelNum);
        var PNpix = Convert.PMTdict2[PMTpix];
        return PNpix
    },

    // convert SETI uC (0-7) number to daughterboard number (0-7)
    SuC2DB: function (SuC) {
        DB = 7 - SuC;
        return DB
    },
    
    // convert daughterboard number (0-7) to SETI uC number (0-7)
    DB2SuC: function (DB) {
        SuC = 7 - DB;
        return SuC
    },
    
    // convert SETI uC number and asic number (0-3; on a daugherboad) to PulseNet number (0-31)
    SuC_asic2PN: function (SuC, asic) {
        PN = (7 - SuC) * 4 + asic;
        return PN 
    },
    
    // convert 2-bit block address on PulseNet (0-3) and 2-bit pixel address on PulseNet (0-3) 
    // to the full pixel address on PulseNet (0-15) 
    blockPixel2PNPix: function (block, pixel) {
        var PNpix = (3 * block) + pixel;
        return PNpix
    },
    
    // convert PulseNet pixel (0-15) and PulseNet number (0-3) [on the given daughterboard]
    // to PMT pixel number
    PNpixPNonBoard2PMTpix: function (PNpix, PNonBoard) {
        PMTpix = Convert.PMTdict3[PNonBoard][PNpix];
        return PMTpix
    },
    
    // convert PulseNet number (0-31) and PulseNet pixel (0-15) to PMT pixel (0-511)
    PN2pix: function (PN, PNpix) {
        var PNonBoard = PN % 4;
        var DB = (PN - PNonBoard) / 8;
        var PMTpix = Convert.PNpixPNonBoard2PMTpix(PNpix, PNonBoard);
        pixelNum = 64 * DB + PMTpix; 
        return pixelNum
    },
      
}

var Emulator = {
    //make test coincidence (only works if PC104 emulator is running)
    testCoincidence: function () {
        doSimpleXMLHttpRequest("/expt/testCoincidence");
        log("Test coincidence generated, if PC104 Emulator is running.");
    },
}

var Telemetry = {
    getAllTelemetry: function () {
        doSimpleXMLHttpRequest("/expt/getAllTelemetry");
        log("Requested telemetry from all uCs.");
    },
}

addLoadEvent(roundPanelCorners);
addLoadEvent(topTimeFunc);
addLoadEvent(Cookie.restorePanels);

State.addStateCallback(TopBar.update);
