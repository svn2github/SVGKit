var State = {
    base: "/state/",
    idbase: "state_",

    getKeys: function () {
        log("getting keys...");
        deferred = loadJSONDoc(this.base + "webGetState");
        deferred.addCallback(function(result) {
            var keys = keys(result);
        });
        return keys
    },
    
    //this runs very slowly.  
    //maybe store the values on the client, and check each time
    //if each value has changed.  if it has changed, then do a
    //getElementsByTagAndClassName
    update: function () {
        log("getting state...");
        deferred = loadJSONDoc(this.base + "webGetState");
        deferred.addCallback(function(result) {
            var resultkeys = keys(result)
            forEach(resultkeys, 
                function (key) {
                    log(key + " = " + result[key]);
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
        State.update();
        callLater(5, State.updateLoop);
    },
};

function doNothing() {
    }

//added to index.js ( onLoadScripts(): )
//addLoadEvent(function() {State.init();});
//addLoadEvent(function() {State.updateLoop();});