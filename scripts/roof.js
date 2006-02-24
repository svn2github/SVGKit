var roof_base="/roof/"

function roof_command(methodName) {
    var error = getElement("error");
    
    replaceChildNodes(error);
    roof_setStatus("Waiting for response...");
    
    deferred = doSimpleXMLHttpRequest(roof_base+methodName);
    deferred.addCallback(function (res) {
        response = res.responseText;
        // todo: explicitly check for python exception message
        if(response.indexOf("Traceback") == -1) {
            roof_setStatus("Success");
        }
        else {
            roof_setStatus("Python error");
            replaceChildNodes(error, SPAN(null, response));
        }
    });
    deferred.addErrback(function (err) {
        roof_setStatus("Error: " + repr(err));
    });
}

function roof_setStatus(statusText) {
    replaceChildNodes(getElement("status"), SPAN(null, statusText));
}

function updateProgress() {
    log("Updating");
    // get status
    deferred = loadJSONDoc(roof_base+"webPosition");
    deferred.addCallback(function(progress) {
        log("Progress: " + progress);
        // update roof position pct text
        replaceChildNodes(getElement("roofpospct"), 
                          SPAN(null, (progress * 100) + "%"));
        
        // update progress bar
        bar = getElement("progress");
        bar.style.width = (progress * 300) + "px";

        // do it again in 5 seconds
        callLater(2, updateProgress);
    });
    deferred.addErrback(function(err) {
        roof_setStatus("Error updating position: " + repr(err));
        // wait longer
        callLater(10, updateProgress);
    });
}
