var Telescope = {
    'base' : '/telescope/',

    command: function(methodName) {
        Telescope.setError("");
        
        deferred = doSimpleXMLHttpRequest(Telescope.base+methodName);
        deferred.addCallback(function (res) {
            response = res.responseText;
            if(response.indexOf("Traceback") != -1) {
                Telescope.setError("Python error: \n" + response);
            }
        });
        deferred.addErrback(function (err) {
            Telescope.setError("Error: " + repr(err));
        });
    },

    setStatus: function(statusText) {
        replaceChildNodes(getElement("telescope_status"), SPAN(null, statusText));
    },

    setError: function(errorText) {
        replaceChildNodes(getElement("telescope_error"), SPAN(null, errorText));
    },

    move: function() {
        // send move command
        log("webPosition" + queryString(getElement("telescope_form")));
        deferred = doSimpleXMLHttpRequest(Telescope.base+"webMove?" + 
                                          queryString(getElement("telescope_form")));
        deferred.addCallback(function (res) {
            response = res.responseText;
            if(response.indexOf("Traceback") != -1) {
                Telescope.setError("Python error: \n" + response);
            }
        });
        deferred.addErrback(function (err) {
            Telescope.setError("Error: " + repr(err));
        });
        // TODO: clean up this duplicate code
    },

    updateStatus: function() {
        log("Updating status");
        // get status
        deferred = doSimpleXMLHttpRequest(Telescope.base+"statusSummary");
        deferred.addCallback(function(req) {
            Telescope.setStatus(req.responseText);
            // do it again in 5 seconds
            callLater(2, Telescope.updateStatus);
        });
        deferred.addErrback(function(err) {
            Telescope.setStatus("Error updating status: " + repr(err));
            // wait longer
            callLater(10, Telescope.updateStatus);
        });
    }

};