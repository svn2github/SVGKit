function roundPanelCorners() {
    roundClass("div", "panel", {bgColor: "#000000"});
}

function loadClearSkyClock() {
    var dateToday = new Date();
    var myImg = IMG( {'src':'http://cleardarksky.com/csk/getcsk.php?id=OkRdgObMA'} );
    replaceChildNodes('img_skyclock', myImg);
    $('timestamp_skyclock').innerHTML= toISOTimestamp(dateToday);
}

function topTimeFunc() {       
    topTimeRefresh = window.setTimeout( "topTimeFunc()", 1000 );       
    var dateToday = new Date();       
    $('top_time').innerHTML= toISOTimestamp(dateToday);
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
    	for(var i=0;i < ca.length;i++) {
    		var c = ca[i];
    		while (c.charAt(0)==' ') c = c.substring(1,c.length);
    		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    	}
    	return null;
    },

    erase: function (name) {
    	Cookie.create(name,"",-1);
    },    

    restorePanels: function () {
    	var cookieArray = document.cookie.split(';');
    	for(var i=0;i < cookieArray.length;i++) {
    		while (cookieArray[i].charAt(0)==' ') {
                cookieArray[i] = cookieArray[i].substring(1, cookieArray[i].length);
            }
            var pair = cookieArray[i].split('=');
            if (pair[0].substring(0, Cookie.panelPrefix.length) == Cookie.panelPrefix) {
                if (pair[1] == "true") {
                    togglePanel(pair[0].substring(Cookie.panelPrefix.length, pair[0].length));
                }
            }
        }
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

    //convert PMT pixel number (0-511) to PMT number (0-7, 8-15)
    pix2PMT: function (pixelNum) {
        var pmtL = (pixelNum-pixelNum%64)/64;
        return pmtL
    },
    
    //convert PMT pixel number (0-511) to PMT pixel number (0-63) [on the given PMT]
    pix2PMTpix: function (pixelNum) {
        var PMTpix = pixelNum%64;
        return PMTpix
    },
       
    //convert PMT pixel number (0-511) to SETI uC number (0-7)
    pix2SuC: function (pixelNum) {
        var SuC = 7 - (pixelNum-pixelNum%64)/64;
        return SuC
    },

    //convert PMT pixel number (0-511) to Astronomy uC number (8-11)
    pix2AuC: function (pixelNum) {
        var AuC = 11 - (pixelNum-pixelNum%128)/128;
        return AuC
    },
    
    //convert PMT pixel number (0-511) to PulseNet number (0-3) [on the given daughterboard]
    pix2PNonBoard: function (pixelNum) {
        var temp = 2 * (((pixelNum-pixelNum%8)/8) % 2) + (pixelNum%2)
        var PNonBoard = Convert.PMTdict1[temp];
        return PNonBoard
    },
    
    //convert PMT pixel number (0-511) to PulseNet number (0-31) [on all daughterboards]
    pix2PN: function (pixelNum) {
        var SuC = Convert.pix2SuC(pixelNum);
        var PNonBoard = Convert.pix2PNonBoard(pixelNum);
        var PN = 4*(7-SuC) + PNonBoard;
        return PN
    },
    
    //convert PMT pixel number (0-511) to PulseNet pixel number (0-15)
    pix2PNpix: function (pixelNum) {
        var PMTpix = Convert.pix2PMTpix(pixelNum)
        var PNpix = Convert.PMTdict2[PMTpix];
        return PNpix
    },  
}

var Emulator = {
    //make test coincidence (only works if PC104 emulator is running)
    testCoincidence: function () {
        doSimpleXMLHttpRequest("/expt/testCoincidence");
        log(Test coincidence generated (assuming ));
    }
}
  

addLoadEvent(roundPanelCorners);
addLoadEvent(topTimeFunc);
addLoadEvent(Cookie.restorePanels);
