var State = {
    base: "/state/",
    idbase: "state_",

    update: function () {
        deferred = loadJSONDoc(this.base + "webGetState");
        deferred.addCallback(function(result) {
            var resultkeys = keys(result)
            forEach(resultkeys,
                function (key) {
                    var elemlist = getElementsByTagAndClassName(null,key);
                    forEach(elemlist,
                        function (elem) {
                            elem.innerHTML = result[key];
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
        callLater(3, State.updateLoop);
    },
};

//added to index.js ( onLoadScripts(): )
//addLoadEvent(function() {State.init();});
//addLoadEvent(function() {State.updateLoop();});