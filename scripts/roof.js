var Roof = {

    base: '/roof/',
    idbase: 'roof_',

    command: function(methodName) {
        var error = getElement(this.idbase + "error");
        log("This: " + this);
        
        replaceChildNodes(error);
        Roof.setStatus("Waiting for response...");
        
        deferred = doSimpleXMLHttpRequest(this.base+methodName);
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
        replaceChildNodes(getElement(this.idbase + "status"), 
                          SPAN(null, statusText));
    },

    updateProgress: function(newstate) {
        // update roof position pct text
        //log("Updating roof");
        percent     = newstate.roofState.percentOpen;
        percent_str = percent.toPrecision(3) + "%";
        replaceChildNodes(getElement(Roof.idbase + "pospct"),  
                            SPAN(null, percent_str));
        element = getElement("top_" + Roof.idbase + "pospct");
        if (element) {
            replaceChildNodes(element,  SPAN(null, percent_str));
        }
        // update progress bar (OLD)
        //bar = getElement(Roof.idbase + "progress");
        //bar.style.width = (progress * 300).toFixed(0) + "px";
        // update svg drawing of observatory
        // do it again in 2 seconds
        ObsSvg.translateRoof(percent);
    },

};

State.addStateCallback(Roof.updateProgress);
