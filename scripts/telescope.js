function command(methodName) {
    setError("");
    
    deferred = doSimpleXMLHttpRequest(methodName);
    deferred.addCallback(function (res) {
        response = res.responseText;
        if(response != "") {
            setError("Python error: \n" + response);
        }
    });
    deferred.addErrback(function (err) {
        setError("Error: " + repr(err));
    });
}

function setStatus(statusText) {
    replaceChildNodes(getElement("status"), SPAN(null, statusText));
}

function setError(errorText) {
    replaceChildNodes(getElement("error"), SPAN(null, errorText));
}

function move() {
    // send move command
    log("webPosition" + queryString(getElement("theform")));
    deferred = doSimpleXMLHttpRequest("webMove?" + 
                                      queryString(getElement("theform")));
    deferred.addCallback(function (res) {
        response = res.responseText;
        if(response != "") {
            setError("Python error: \n" + response);
        }
    });
    deferred.addErrback(function (err) {
        setError("Error: " + repr(err));
    });
    // TODO: clean up this duplicate code
}

function updateStatus() {
    log("Updating status");
    // get status
    deferred = doSimpleXMLHttpRequest("statusSummary");
    deferred.addCallback(function(req) {
        setStatus(req.responseText);
        // do it again in 5 seconds
        callLater(2, updateStatus);
    });
    deferred.addErrback(function(err) {
        setStatus("Error updating status: " + repr(err));
        // wait longer
        callLater(10, updateStatus);
    });
}
