var ProgramChips = {

    base: '/expt/',
    idbase: 'expt_',

    command: function(methodName) {
        this.setError("No error so far");
        log("ProgramChips.command(" + methodName +")");
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

    setDAC: function(vref) {
        if (vref == 'all') {
            for (i = 0; i <= 6; i++) {
                ProgramChips.setDAC(i);
            }
            ProgramChips.setDAC('bias');
        }
        else {
            query_vref = queryString(getElement(idbase+'PulseNetDACForm'+vref));
            ProgramChips.command('programDACPulseNet?vref='+vref+'&'+query_vref);         
        }
    },
    
    setStatus: function(statusText) {
        replaceChildNodes(getElement(this.idbase + "status"), 
                          SPAN(null, statusText));
    },

    setError: function(errorText) {
        replaceChildNodes(getElement(this.idbase + "error"), 
                          SPAN(null, errorText));
    },

};
