var State = {
    base: "/state/",
    idbase: "state_",
    stateHash: null,
    currentState: [],

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
        deferred = loadJSONDoc(State.base + "webGetState");
        deferred.addCallback(function(result) {
            log("State received.  Creating hash table.");
            var resultkeys = keys(result);
            forEach(getElementsByTagAndClassName('span','autoUpdate'),
                function(elem) {                
                    stateVar = elem.className.match(/ExperimentState[..a-zA-Z0-9\_\[\]]*/)[0];
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
        if(State.stateHash == null) {
            log("Getting new hash.");
            State.makeHash();
        }
        deferred = loadJSONDoc(State.base + "webGetState");
        deferred.addCallback(function (newState) {
            var hashkeys = keys(State.stateHash);
            forEach(hashkeys, 
                function (hashkey) {
                    if (newState[hashkey] != State.currentState[hashkey]) {
                        State.stateHash[hashkey].innerHTML = newState[hashkey];
                    }
                }
            )
            State.currentState = newState;
            callLater(2, State.updateWithHash);
        });
        deferred.addErrback(function (err) {
            log("Error updating state: " + repr(err));
            callLater(30, State.updateWithHash);
        });
    },  
};
