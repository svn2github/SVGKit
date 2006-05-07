var Telescope = {
    'base' : '/telescope/',
    'idbase' : 'telescope_',
    
    'latitude' : 42.5,
    
    declinationToDegrees: function(declination) {
        return declination + 90.0 - Telescope.latitude;
    },
    
    degreesToDeclination: function(degrees) {
        return Telescope.latitude + degrees - 90.0;
    },

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
    
    goto: function() {
        // send goto command
        deferred = doSimpleXMLHttpRequest(this.base+"webGoto?" + 
                            queryString(getElement(this.idbase + "goto_form")));
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
    
    update: function(state) {
        dec = getElement(Telescope.idbase + 'posdec');
        dec.innerHTML = Telescope.degreesToDeclination(state.telescopeState.degrees).toPrecision(4)
        //dec.innerHTML = (42.5 + state.telescopeState.degrees).toPrecision(4)
    	ObsSvg.rotateTelescope(state.telescopeState.degrees);
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


State.addStateCallback(Telescope.update);
