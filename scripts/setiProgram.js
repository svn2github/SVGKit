var setiProgram = {

    base:   '/expt/',
    idbase: 'seti_program_',
    expt:   'ExperimentState.pulsenetSETI_State',
    
    command: function(methodName) {
        log("setiProgram.command(" + methodName +")");
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

    checkAll: function(state,boxname) {
        for (i = 0; i < 32; i++) {
            getElement(document.forms[this.idbase].elements['PN'+i+boxname]).checked = state;
        }
    },
    
    setCoincMask: function() {
        for (uCno = 0; uCno < 1;uCno++) {
            // daughterboard are numbered opposite to uCs
            DBno = 7 - uCno;
            checked = []; checked_cap = [];
            for (asicNo = 0; asicNo < 4; asicNo++) {
                // PulseNet number (0-31) defined
                // Note: asicNo (0-3) is PulseNet address on a given daughterboard (DBno)
                PNno = 4*DBno + asicNo
                //log("pulsenet = " + PNno)
                checked[asicNo] = getElement(document.forms[this.idbase].elements['PN'+PNno+'_coincMask']).checked;
                if (checked[asicNo] == true) {checked_cap[asicNo] = 'True';}
                else                         {checked_cap[asicNo] = 'False';}
            }
            var pnMask = checked_cap[0] + ',' + checked_cap[1] + ',' +
                         checked_cap[2] + ',' + checked_cap[3];
            setiProgram.command('setCoincMask?uCno=' + uCno + '&pnMask=' + pnMask); 
        }
    },
    
    program: function (option) {
        for (uCno = 0; uCno < 1; uCno++) {
            // see definitions of DBno, asicNo, and PNno above in setCoincMask()
            DBno = 7 - uCno;
            for (asicNo = 0; asicNo < 4; asicNo++) {
                PNno = 4*DBno + asicNo
                if (getElement(document.forms[this.idbase].elements['PN'+PNno+'_program']).checked == true) {
                    if (option == 'reset') {
                        setiProgram.command('resetASIC?uCno=' + uCno + '&asicno=' + asicNo);
                    }
                    else if (option == 'program') {
                        thresh    = getElement(document.forms[this.idbase].elements['thresh']).value;
                        veto      = getElement(document.forms[this.idbase].elements['veto']).value;
                        clockhalf = getElement(document.forms[this.idbase].elements['clockhalf']).value;
                        setiProgram.command('setiConfigASIC?uCno=' + uCno + 
                                            '&asicno='             + asicNo + 
                                            '&threshold='          + thresh + 
                                            '&veto='               + veto + 
                                            '&halfclock='          + clockhalf);
                    }
                }
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
