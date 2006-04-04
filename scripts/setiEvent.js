var SetiEvent = {
    base:  "/expt/",
    idbase: "seti_event_",
    rows:    4,
    columns: 8,
    plotWidth:  600,
    plotHeight: 100,
    
    clearView: function () {
        //plotTableElem = $(setiEvent.idbase+'plot_table');
        for (i=0; i<8; i++) {
                currentCell = $(setiEvent.idbase+'plot_'+i);
                currentCell.innerHTML = "";
        }
    },
    
    setView: function() {
        setiEvent.clearView();
        setiEvent.rows = getElement(document.forms[this.idbase].elements['set_rows']).value
        setiEvent.plotHeight = setiEvent.plotWidth * 3/4;
        for (i=0; i<setiEvent.rows; i++) {
            var blankImg = IMG( {'src':'/static/images/blank_600x100.png'} );
            currentCell = $(setiEvent.idbase+'plot_'+i);
            currentCell.appendChild(blankImg);
        }
    },
    
    createPlotId: function(eventId) {
        /***
            Returns an SVGPlot object filled in with data
        ***/
        EventView.getEventWithCallback(eventId, 
            function(eventDetails, eventId) {
                var deferred = loadJSONDoc(State.base + "webGetState?id=" + eventDetails.stateID);
                deferred.addCallback( partial(SetiEvent.createPlotData, eventDetails, eventId) );
                deferred.addErrback(function (err) {
                    log("Error retreiving details for state " + stateID + ": " + repr(err));
                });
            });
    },
    
    createPlotData: function(eventDetails, eventId, stateDetails) {
        log('createPlotData:', eventDetails);
        // eventDetails.Aa is a string like "[1, 2, 3, 4]" strip the ends and split on ', '
        var Aa = eventDetails.Aa.substring(1, eventDetails.Aa.length-2).split(', ');
        var Ab = eventDetails.Ab.substring(1, eventDetails.Ab.length-2).split(', ');
        var Ba = eventDetails.Ba.substring(1, eventDetails.Ba.length-2).split(', ');
        var Bb = eventDetails.Bb.substring(1, eventDetails.Bb.length-2).split(', ');
        var left = SetiEvent.interleave(Aa, Ab);
        var right = SetiEvent.interleave(Ba, Bb);
        // Convert to voltage.
        var dac = stateDetails.pulsenet_DAC_State;
        var voltages = [dac.vref[0], dac.bias, 
                        dac.vref[1],  dac.vref[2], dac.vref[3], 
                        dac.vref[4], dac.vref[5], dac.vref[6] ];
        //var voltages = [1.7, 1.5, 1.4, 1.3, 1.1, 0.9, 0.7, 0.5];  // vref[0],  bias, vref[1], vref[2] ... vref[6]
        var microcontroller = parseInt(eventDetails.microcontroller);
        var asic = parseInt(eventDetails.asic);
        var pulsenetNumber = (7-microcontroller)*4+asic;  // Copied from osetiexptctrl.py line 522
        var threshold = stateDetails.pulsenetSETI_State[pulsenetNumber].thresholdVrefNumber;
        //var threshold = stateDetails.pulsenetSETI_State[pulsenetNumber].thresholdVoltage;
        var clockMHz = stateDetails.fastClockState.frequency;
        if (clockMHz == 0)
            clockMHz = 1;  // Should never happen, but for testing reasons...
        var halfclock = eventDetails.halfclock == "False" ? 2 : 1;
        //if (left.length != right.length)
        //    alert("left.length != right.length");  // TODO Remove this.
        var length = Math.min(left.length, right.length);
        var time_ns = Array(length);
        
        for (var i=0; i<length; i++) {
            left[i] = voltages[ left[i] ];
            right[i] = voltages[ right[i] ];
        }
        for (var i=0; i<time_ns.length; i++) {
            time_ns[i] = i/(halfclock*clockMHz)*1000;
        }
        for (var i=0; i<time_ns.length; i++) {
            //left[i] = voltages[0] - i*(voltages[0]-voltages[voltages.length-1])/length;
            //right[i] = voltages[0] - Math.cos(Math.PI*2*i/length);
        }
             
        var plot = new SVGPlot(530, 100);
        
        function plotFunction(p, time_ns, left, right, voltages) {
            p.strokeStyle = "#C6C6C6";
            p.fillStyle = "#C6C6C6";
            p.addBox();
            p.addBoxDefaults();
            p.setYTicks(voltages);
            p.setYStubs(voltages);
            p.fontSize = '10px';
            p.fontFamily="Helvetica, Geneva, Arial, SunSans-Regular, sans-serif"
            p.setXLabel("Time (ns)");
            p.setYLabel("Voltage (V)");
            p.strokeStyle = 'rgba(255, 50, 50, 0.5)';
            p.plotLine(time_ns, left);
            p.strokeStyle = 'rgba(50, 50, 255, 0.5)';
            p.plotLine(time_ns, right);
            p.render();
        }
        
        var container = getElement("coinc_plot");
        replaceChildNodes(container, plot.svg.htmlElement);
        plot.svg.whenReady( partial(plotFunction, plot, time_ns, left, right, voltages) );
    },
    
    interleave: function(a, b) {
        var inter = Array(a.length+b.length)
        for (var i=0; i<a.length; i++) {
            inter[2*i] = a[i];
            inter[2*i+1] = b[i];
        }
        return inter;
    },
    
    // SetiEvent.createPlotId(56291)
};

