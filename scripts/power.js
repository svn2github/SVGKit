var Power = {
    base: "/power/",
    idbase: "power_",
    
    init: function() {
        this.redimg =   getElement(this.idbase + 'redimg').href;
        this.greenimg = getElement(this.idbase + 'greenimg').href;
        this.grayimg =  getElement(this.idbase + 'grayimg').href;
    },
    
    update: function (newstate) {
        //log("Updating power");
        powerState = newstate.shulskyBoxState
        remoteControl = powerState.remoteControl;
        switches = powerState.switches;
        
        controlStatus = remoteControl ? "remote" : "manual";

        // set control status stuff
        getElement(Power.idbase + "controltype").innerHTML = controlStatus;
        takeControl = getElement(Power.idbase + "takecontrol");
        if(remoteControl) 
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
                if(remoteControl) offlink.setAttribute('href', 
                                                       switchHref + '"off");');
                else offlink.removeAttribute('href');
            }
            else {
                onlight.src = Power.grayimg;
                offlight.src = Power.redimg;
                offlink.removeAttribute('href');
                if(remoteControl) onlink.setAttribute('href', 
                                                      switchHref + '"on");');
                else onlink.removeAttribute('href');
            }
        }
    },
    
    takeControl: function() {
        deferred = loadJSONDoc(Power.base + "webTakeControl");
        deferred.addCallback(function(res) {
            State.update();
        });
    },
    
    setEEPROM: function() {
        deferred = loadJSONDoc(Power.base + "webSetEEPROM");
        deferred.addCallback(function(res) {
            // nothing to do
        });
    },
    
    setSwitch: function(number, val) {
        switchURL = Power.base + "webSetSwitch?" + 
                    queryString({'switchNum' : number,
                                 'value' : val}); // set value later
        deferred = loadJSONDoc(switchURL);
        deferred.addCallback(function(res) {
            State.update();
        });
    },
    
    updateLoop: function() {
        Power.update();
        callLater(60, Power.updateLoop);
    },
};

addLoadEvent(function() {Power.init();});
State.addStateCallback(Power.update);
