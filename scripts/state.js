var State = {
    base: "/state/",
    idbase: "state_",
    stateHash: [],
    currentState: [],

    update: function () {
        log("Updating state.");
        deferred = loadJSONDoc(this.base + "webGetState");
        deferred.addCallback(function(result) {
            var resultkeys = keys(result);
            forEach(resultkeys, 
                function (resultkey) {
                    var elem = window.getElement(resultkey);
                    if (elem == null) {
                        //code to add if id not a match
                        //getElementsByTagAndClassName('span',resultkey);
                    }
                    else {
                        elem.innerHTML = result[resultkey];
                    }
                }
            )  
        });
        deferred.addErrback(function (err) {
            log("Error updating state: " + repr(err));
        });
    },
    
    //this older version of State.update() runs very slowly.  
    //maybe store the values on the client, and check each time
    //if each value has changed.  if it has changed, then do a
    //getElementsByTagAndClassName
    updateOld: function () {
        log("getting state...");
        deferred = loadJSONDoc(this.base + "webGetState");
        deferred.addCallback(function(result) {
            var resultkeys = keys(result)
            forEach(resultkeys, 
                function (key) {
                    //log(key + " = " + result[key]);
                    var elemlist = getElementsByTagAndClassName('span',key);
                    forEach(elemlist,
                        function (elem) {
                            callLater(0, function () {
                                elem.innerHTML = result[key];});
                        }
                    )
                }
            )
        });
        deferred.addErrback(function (err) {
            log("Error updating state: " + repr(err));
        });
    },
    
    updateLoop: function() {
        State.updateWithHash();
        callLater(1, State.updateLoop);
    },
    
    makeHash: function () {
        //makeHash is function that constructs State.stateHash - a hash table with 
        //with (key, pointer) pairs where: 
        //   key = a state variable (e.g. "ExperimentState.pmt_DAC_State[6].voltage")
        //   pointer = a pointer to one HTML element that matches that state variable
        //So, for example, 
        // > stateHash[key] = pointer
        // > stateHash[ExperimentState.pmt_DAC_State[6].voltage] = [object HTMLSpanElement]
        log("Getting state from server.");
        State.stateHash = [];
        deferred = loadJSONDoc(this.base + "webGetState");
        deferred.addCallback(function(result) {
            log("State received.  Creating hash table.");
            var resultkeys = keys(result);
            //log(resultkeys);
            forEach(getElementsByTagAndClassName('span','autoUpdate'),
                function(elem) {
                    stateVar = (sp=elem.className.split(' '), sp[0]=="autoUpdate" ? sp[1] : sp[0])
                    State.stateHash[stateVar] = elem;
                    }
            )
            log("Finished creating State.stateHash.  It has " + keys(State.stateHash).length + " entries.");
        });
        deferred.addErrback(function (err) {
            log("Error updating state: " + repr(err));
        });
    },

    updateWithHash: function () {
        log("Updating state.");
        deferred = loadJSONDoc(this.base + "webGetState");
        deferred.addCallback(function (newState) {
            var hashkeys = keys(State.stateHash);
            forEach(hashkeys, 
                function (hashkey) {
                    if (newState[hashkey] == State.currentState[hashkey]) {
                        //do nothing if there is no change
                    }
                    else {
                        //if there is a change, put the new data in the appropriate elements
                        State.stateHash[hashkey].innerHTML = newState[hashkey];
                        //log("changed " + hashkey);
                    }
                }
            )
            State.currentState = newState;
        });
        deferred.addErrback(function (err) {
            log("Error updating state: " + repr(err));
        });
    },
    
};
