var Diagnostics = {

    command: function(methodName) {
        log("Diagnostics.command(" + methodName +")");
        deferred = doSimpleXMLHttpRequest(this.base+methodName);
        deferred.addCallback(function (res) {
            response = res.responseText;
            if(response.indexOf("Traceback") != -1) {
                this.setError("Python error: \n" + response);
            }
        });
        deferred.addErrback(function (err) {
            this.setError("Error: " + repr(err));
        });
    },

    setStatus: function(statusText) {
        replaceChildNodes(getElement(this.idbase + "status"), 
                          SPAN(null, statusText));
    },

    setError: function(errorText) {
        replaceChildNodes(getElement(this.idbase + "error"), 
                          SPAN(null, errorText));
    },

    doFixedFlash: function() {
        Diagnostics.command('doFixedFlash');
    },
    
}

