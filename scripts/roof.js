function command(methodName) {
    var error = getElement("error");
    
    replaceChildNodes(error);
    setStatus("Waiting for response...");
    
    deferred = doSimpleXMLHttpRequest(methodName);
    deferred.addCallback(function (res) {
        response = res.responseText;
        if(response == "") {
            setStatus("Success");
        }
        else {
            setStatus("Python error");
            replaceChildNodes(error, SPAN(null, response));
        }
    });
    deferred.addErrback(function (err) {
        setStatus("Error: " + repr(err));
    });
}

function setStatus(statusText) {
    replaceChildNodes(getElement("status"), SPAN(null, statusText));
}

function updateProgress() {
    log("Updating");
    // get status
    deferred = loadJSONDoc("webPosition");
    deferred.addCallback(function(progress) {
        log("Progress: " + progress);
        // update progress bar
        bar = getElement("progress");
        bar.style.width = (progress * 300) + "px";

        // do it again in 5 seconds
        callLater(2, updateProgress);
    });
    deferred.addErrback(function(err) {
        setStatus("Error updating position: " + repr(err));
        // wait longer
        callLater(10, updateProgress);
    });
}
