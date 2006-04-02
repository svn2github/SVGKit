var Weather = {

    loadClearSkyClock: function() {
        var dateToday = new Date();
        var url = 'http://cleardarksky.com/csk/getcsk.php?id=OkRdgObMA';
        var myImg = new IMG( {'src': url} );
        if (myImg) {
            replaceChildNodes('img_skyClock', myImg);
            $('timestamp_skyClock').innerHTML= toISOTimestamp(dateToday);
        }
    },

    loadRadarImage: function () {
        var dateToday = new Date();
        var url = 'http://sirocco.accuweather.com/nx_mosaic_640x480c/SIR/inmaSIRNE.gif';
        var myImg = new IMG( {'src': url} );
        if (myImg) {
            updateNodeAttributes(myImg, {'width' : '320px'});
            replaceChildNodes('img_radarImage', myImg);
            $('timestamp_radarImage').innerHTML= toISOTimestamp(dateToday);
        }
    },

    getCloudCover: function (zipCode) {
        url = "http://wwwa.accuweather.com/forecast-current-conditions.asp";
        log(url);
        var deferred = doSimpleXMLHttpRequest(url, {zipcode: zipCode});
        deferred.addCallback(function (content) {
            log(content);
        });
        deferred.addErrback(function (err) {
            log("Error getting cloud cover: " + repr(err));
        });

    },
    
}

