var AstroProgram = {

    base:   '/expt/',
    idbase: 'astro_program_',
	controlSettings: [],
    
    command: function(methodName) {
        log("AstroProgram.command(" + methodName +")");
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
    
    getControlSettings: function() {
        controlElems = getElement('astro_program_controls');
        log("There are this many controlElems: " + controlElems.length)
		forEach(controlElems, 
			function(elem) {
				elemName = elem.id;
                if (elemName != "") {
                    log(elemName);
                    if      (elem.type == "radio" | elem.type == "checkbox") {
                        AstroProgram.controlSettings[elemName] = elem.checked;
                    }
                    else if (elem.type == "text" | elem.type == "select") {
                        AstroProgram.controlSettings[elemName] = elem.value;
                    }
                }
			}
		);
    },
        
    checkAll: function(state,boxname) {
        for (i = 0; i < 32; i++) {
            getElement(document.forms[this.idbase].elements['PN'+i+boxname]).checked = state;
        }
    },
    
    program: function (option) {
        /***
        Program the astronomy channel of one or more PulseNets.
        It takes one parameter, option, which is allowed to have these values:
           'program', 'start', 'stop', 'read', 'auto'.
        ***/
        AstroProgram.getControlSettings();
        settings = AstroProgram.controlSettings;
        if (option == "program" | 
            option == "start"   | 
            option == "stop"    | 
            option == "read"    ) {
            for (uCno=11; uCno<=8; uCno++) {
                // note that daughterboards are number oppositely from uCs
                if (option == "program") {
                    //astConfigASIC(self, uCno, asicno, pixel, level):
                    AstroProgram.command();
                }
                else if (option == "stop" | option == "start") {
                    //
                }
                else if (option == "read") {
                    //
                }
            }
        }
        else if (option == "auto") {
            //
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
