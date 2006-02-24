var telescope_base="/telescope/";

function telescope_command(methodName) {
    setError("");
    
    deferred = doSimpleXMLHttpRequest(telescope_base+methodName);
    deferred.addCallback(function (res) {
        response = res.responseText;
        if(response.indexOf("Traceback") != -1) {
            setError("Python error: \n" + response);
        }
    });
    deferred.addErrback(function (err) {
        setError("Error: " + repr(err));
    });
}

function telescope_setStatus(statusText) {
    replaceChildNodes(getElement("status"), SPAN(null, statusText));
}

function setError(errorText) {
    replaceChildNodes(getElement("error"), SPAN(null, errorText));
}

function move() {
    // send move command
    log("webPosition" + queryString(getElement("theform")));
    deferred = doSimpleXMLHttpRequest(telescope_base+"webMove?" + 
                                      queryString(getElement("theform")));
    deferred.addCallback(function (res) {
        response = res.responseText;
        if(response.indexOf("Traceback") != -1) {
            setError("Python error: \n" + response);
        }
    });
    deferred.addErrback(function (err) {
        setError("Error: " + repr(err));
    });
    // TODO: clean up this duplicate code
}

function telescope_updateStatus() {
    log("Updating status");
    // get status
    deferred = doSimpleXMLHttpRequest(telescope_base+"statusSummary");
    deferred.addCallback(function(req) {
        telescope_setStatus(req.responseText);
        // do it again in 5 seconds
        callLater(2, updateStatus);
    });
    deferred.addErrback(function(err) {
        telescope_setStatus("Error updating status: " + repr(err));
        // wait longer
        callLater(10, updateStatus);
    });
}
