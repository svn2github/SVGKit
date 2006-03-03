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

    updateProgress: function() {
        // get status
        deferred = loadJSONDoc(this.base+"webPosition");
        deferred.addCallback(function(progress) {
            // update roof position pct text
            percent_str = (progress*100).toPrecision(3) + "%"
            replaceChildNodes(getElement(Roof.idbase + "pospct"),  
                                SPAN(null, percent_str));
            element = getElement("top_" + Roof.idbase + "pospct");
            if (element) {
                replaceChildNodes(element,  SPAN(null, percent_str));
            }
            // update progress bar
            bar = getElement(Roof.idbase + "progress");
            bar.style.width = (progress * 300).toFixed(0) + "px";
            // do it again in 5 seconds
            callLater(60, function() {Roof.updateProgress();});
        });
        deferred.addErrback(function(err) {
            Roof.setStatus("Error updating position: " + repr(err));
            // wait longer
            callLater(10, function() {Roof.updateProgress();});
        });
    },

};

addLoadEvent(function() {Roof.updateProgress();});
/* For some reason, you have to wrap the Roof.updateProgress() call in a 
 * function, or within the call 'this' will be undefined.  My suspicion is that
 * somehow when you directly pass Roof.updateProgress as a function object, it
 * gets separated from its parent object.  Sucks, but I don't know what else to
 * do.
 * I think this may be caused by Javascript's weird closure handling.  I'll
 * look into it more at some point.
 */
