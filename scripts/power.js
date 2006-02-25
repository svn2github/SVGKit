var Power = {
    base: "/power/",
    idbase: "power_",
    
    init: function() {
        this.redimg =   getElement(this.idbase + 'redimg').href;
        this.greenimg = getElement(this.idbase + 'greenimg').href;
        this.grayimg =  getElement(this.idbase + 'grayimg').href;
    },
    
    update: function () {
        log("Updating power");
        deferred = loadJSONDoc(this.base + "webGetSwitches");
        deferred.addCallback(function(result) {
            controlStatus = result["status"];
            switches = result["switches"];
            auto = (controlStatus == "automatic");
            
            // set control status stuff
            getElement(Power.idbase + "controltype").innerHTML = controlStatus;
            takeControl = getElement(Power.idbase + "takecontrol");
            if(auto) 
                addElementClass(takeControl, "invisible");
            else
                removeElementClass(takeControl, "invisible");
            
            // set each light
            for (i in switches) {
                onlight =   getElement(Power.idbase + "on" + i + "_img");
                onlink =    getElement(Power.idbase + "on" + i + "_link");
                offlight =  getElement(Power.idbase + "off" + i + "_img");
                offlink =   getElement(Power.idbase + "off" + i + "_link");
                
                switchHref = "javascript:Power.setSwitch(" + 
                             (parseInt(i)+1) + ", ";
                
                if(switches[i]) {
                    onlight.src = Power.greenimg;
                    offlight.src = Power.grayimg;
                    onlink.removeAttribute('href');
                    if(auto) offlink.setAttribute('href', 
                                                  switchHref + '"off");');
                    else offlink.removeAttribute('href');
                }
                else {
                    onlight.src = Power.grayimg;
                    offlight.src = Power.redimg;
                    offlink.removeAttribute('href');
                    if(auto) onlink.setAttribute('href', switchHref + '"on");');
                    else onlink.removeAttribute('href');
                }
            }
        });
        deferred.addErrback(function(err) {
            log("Error updating power: " + repr(err));
        });
    },
    
    takeControl: function() {
        deferred = loadJSONDoc(Power.base + "webTakeControl");
        deferred.addCallback(function(res) {
            Power.update();
        });
    },
    
    setSwitch: function(number, val) {
        switchURL = Power.base + "webSetSwitch?" + 
                    queryString({'switchNum' : number,
                                 'value' : val}); // set value later
        deferred = loadJSONDoc(switchURL);
        deferred.addCallback(function(res) {
            Power.update();
        });
    },
    
    updateLoop: function() {
        Power.update();
        callLater(2, Power.updateLoop);
    },
};

addLoadEvent(function() {Power.init();});
addLoadEvent(function() {Power.updateLoop();});
