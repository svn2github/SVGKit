var Telescope = {
    'base' : '/telescope/',
    'idbase' : 'telescope_',

    command: function(methodName) {
        this.setError("");
        
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

    move: function() {
        // send move command
        log("webPosition" + queryString(getElement(this.idbase + "form")));
        deferred = doSimpleXMLHttpRequest(this.base+"webMove?" + 
                                queryString(getElement(this.idbase + "form")));
        deferred.addCallback(function (res) {
            response = res.responseText;
            if(response.indexOf("Traceback") != -1) {
                this.setError("Python error: \n" + response);
            }
        });
        deferred.addErrback(function (err) {
            this.setError("Error: " + repr(err));
        });
        // TODO: clean up this duplicate code
    },

    updateStatus: function() {
        log("Updating status");
        // get status
        deferred = doSimpleXMLHttpRequest(this.base+"statusSummary");
        deferred.addCallback(function(req) {
            Telescope.setStatus(req.responseText);
            // do it again in 5 seconds
            callLater(2, this.updateStatus);
        });
        deferred.addErrback(function(err) {
            Telescope.setStatus("Error updating status: " + repr(err));
            // wait longer
            callLater(10, this.updateStatus);
        });
    }

};
