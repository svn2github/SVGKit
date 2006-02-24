var Roof = {

    'base' : '/roof/',

    command: function(methodName) {
        var error = getElement("roof_error");
        
        replaceChildNodes(error);
        Roof.setStatus("Waiting for response...");
        
        deferred = doSimpleXMLHttpRequest(Roof.base+methodName);
        deferred.addCallback(function (res) {
            response = res.responseText;
            // todo: explicitly check for python exception message
            if(response.indexOf("Traceback") == -1) {
                Roof.setStatus("Success");
            }
            else {
                Roof.setStatus("Python error");
                replaceChildNodes(error, SPAN(null, response));
            }
        });
        deferred.addErrback(function (err) {
            Roof.setStatus("Error: " + repr(err));
        });
    },

    setStatus: function(statusText) {
        replaceChildNodes(getElement("roof_status"), SPAN(null, statusText));
    },

    updateProgress: function() {
        log("Updating");
        // get status
        deferred = loadJSONDoc(Roof.base+"webPosition");
        deferred.addCallback(function(progress) {
            log("Progress: " + progress);
            // update roof position pct text
            replaceChildNodes(getElement("roofpospct"), 
                              SPAN(null, (progress * 100).toPrecision(3) + "%"));
            
            // update progress bar
            bar = getElement("roof_progress");
            bar.style.width = (progress * 300).toFixed(0) + "px";

            // do it again in 5 seconds
            callLater(2, Roof.updateProgress);
        });
        deferred.addErrback(function(err) {
            Roof.setStatus("Error updating position: " + repr(err));
            // wait longer
            callLater(10, Roof.updateProgress);
        });
    },

};

window.addEventListener('load', Roof.updateProgress, false);
