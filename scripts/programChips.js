var ProgramChips = {

    base: '/expt/',
    idbase: 'expt_',

    command: function(methodName) {
        //this.setError("No error so far");
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

    setDAC: function(target, voltage, side) {
        if (target == 'pulsenet') {
            if (voltage == 'all') {
                ProgramChips.setDAC('pulsenet', 'bias');
                for (i = 0; i <= 6; i++) {
                    ProgramChips.setDAC('pulsenet', i);
                }
            }
            else {
                query_vref = queryString(getElement(this.idbase+'PulseNetDACForm'+voltage));
                ProgramChips.command('programDAC?chip=Pulsenet&channel='+voltage+'&'+query_vref);
            }
        }
        else if (target == 'pmt') {
            if (voltage == 'all') {
                for (i = 0; i <= 7; i++) {
                    ProgramChips.setDAC('pmt', i, side);
                }
            }
            else {
                query_vref = queryString(getElement(this.idbase+'PMTDACForm'+voltage+side));
                ProgramChips.command('programDAC?chip='+side+'&channel='+voltage+'&'+query_vref);
            }
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
