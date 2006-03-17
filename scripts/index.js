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
        Cookie.create(Cookie.panelPrefix + elem, "true", 1);
    }
    else Cookie.erase(Cookie.panelPrefix + elem);
}

function panelIsVisible(elem) {
    return !hasElementClass(elem, "panelInvisible");
}

function makePanel(elem) {
    toggleElementClass("panelInvisible", elem);
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

addLoadEvent(roundPanelCorners);
addLoadEvent(topTimeFunc);
addLoadEvent(jsInterpreterManager.initialize);
addLoadEvent(Cookie.restorePanels); 
addLoadEvent(State.updateWithHash);
