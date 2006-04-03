var State = {
    base: "/state/",
    idbase: "state_",
    stateHash: null,
    currentState: null,
    callbackList: [],

    makeHash: function () {
        // makeHash is function that constructs State.stateHash - a hash table
        // with (key, pointer) pairs where: 
        //   key = a state variable (e.g. "ExperimentState.pmt_DAC_State[6].voltage")
        //   pointer = a pointer to one HTML element that matches that state variable
        //So, for example, 
        // > stateHash[key] = pointer
        // > stateHash[ExperimentState.pmt_DAC_State[6].voltage] = [object HTMLSpanElement]
        State.stateHash = {};
        forEach(getElementsByTagAndClassName('span','autoUpdate'),
            function(elem) {                
                var stateVar = elem.className.match(/ExperimentState[..a-zA-Z0-9\_\[\]]*/)[0];
                if(typeof(State.stateHash[stateVar]) == 'undefined' ||
                   State.stateHash[stateVar] == null) {
                    State.stateHash[stateVar] = [];
                }
                State.stateHash[stateVar].push(elem);
            }
        )
        log("Finished creating State.stateHash.  It has " + 
            keys(State.stateHash).length + " entries.");
    },
    
    processState: function (obj, oldObj, path) {
        if(typeof(obj) == "object") {
            if(typeof(obj.length) == "undefined" || obj.length == null) {
                // object
                for(var key in obj) {
                    var newpath = path + '.' + key;
                    var val = obj[key];
                    if(typeof(val) == "undefined" || val == null)
                        log("State error on " + newpath);
                    var oldval = (oldObj == null ? null : oldObj[key]);
                    State.processState(val, oldval, newpath);
                }
            }
            else {
                // list
                for(var i = 0; i < obj.length; i++) {
                    var newpath = path + "[" + i + "]";
                    var oldval = (oldObj == null ? null : oldObj[i]);
                    State.processState(obj[i], oldval, newpath);
                }
            }
        }
        else {
            // primitive
            if(obj == oldObj) return; // do nothing if it hasn't changed
            elts = State.stateHash[path];
            if(typeof(elts) == "undefined" || elts == null) {
                //log("Unused state: " + path + " (" + obj + ")");
            }
            else {
                for(var i = 0; i < elts.length; i++) {
                    elts[i].innerHTML = obj;
                }
            }
        }
    },

    update: function () {
        if(State.stateHash == null) {
            log("Getting new hash.");
            State.makeHash();
        }
        var deferred = loadJSONDoc(State.base + "webGetState");
        deferred.addCallback(function (newState) {
            State.processState(newState, State.currentState, 'ExperimentState');
            for(i in State.callbackList) {
                State.callbackList[i](newState);
            }
            State.currentState = newState;
            callLater(5, State.update);
        });
        deferred.addErrback(function (err) {
            log("Error updating state: " + repr(err));
            callLater(5, State.update);
        });
    },
    
    addStateCallback: function(callback) {
        State.callbackList[State.callbackList.length] = callback;
    },
};

addLoadEvent(State.update);
