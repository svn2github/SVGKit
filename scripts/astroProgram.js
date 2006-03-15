var astroProgram = {

    base:   '/expt/',
    idbase: 'astro_program_',
    expt:   'ExperimentState.pulsenetAstroState',
    
    command: function(methodName) {
        log("astroProgram.command(" + methodName +")");
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
        for (i = 0; i < 8; i++) {
            checked = []; checked_cap = [];
            for (j = 0; j < 4; j++) {
                k = 4*i+j;
                checked[j] = getElement(document.forms[this.idbase].elements['PN'+k+'_coincMask']).checked;
                if (checked[j] == true) {checked_cap[j] = '1';}
                else                    {checked_cap[j] = '0';}
            }
            astroProgram.command('setCoincMask?uCno='+i+
                                '&pulseNet0='+checked_cap[0]+'&pulseNet1='+checked_cap[1]+
                                '&pulseNet2='+checked_cap[2]+'&pulseNet3='+checked_cap[3]); 
        }
    },
    
    program: function (option) {
        for (i = 7; i >= 0; i--) {
            i_reverse = 7-i;
            for (j = 0; j < 4; j++) {
                k = 4*i_reverse + j
                if (getElement(document.forms[this.idbase].elements['PN'+k+'_program']).checked == true) {
                    if (option == 'reset') {
                        astroProgram.command('resetASIC?uCno=' + i + '&asicno=' + j);
                    }
                    else if (option == 'program') {
                        thresh    = getElement(document.forms[this.idbase].elements['thresh']).value;
                        veto      = getElement(document.forms[this.idbase].elements['veto']).value;
                        clockhalf = getElement(document.forms[this.idbase].elements['clockhalf']).value;
                        astroProgram.command('setiConfigASIC?uCno=' + i + '&asicno=' + j + 
                                            '&threshold=' + thresh + '&veto=' + veto + '&halfclock=' + clockhalf);
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
