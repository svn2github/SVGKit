var SetiEvent = {
    base:   "/expt/",
    idbase: "seti_event_",

    createPlotId: function(eventId, eventTime) {
        /***
            Returns an SVGPlot object filled in with data.
        ***/
        EventView.getEventWithCallback(eventId, 
            function(eventDetails, eventId) {
                var deferred = loadJSONDoc(State.base + "webGetState?id=" + eventDetails.stateID);
                deferred.addCallback( partial(SetiEvent.createPlotData, 
                                                eventDetails, eventId, eventTime) );
                deferred.addErrback(function (err) {
                    log("Error retreiving details for state " + stateID + ": " + repr(err));
                });
            });
    },
    
    createPlotData: function(eventDetails, eventId, eventTime, stateDetails) {
        /***
            
        ***/
        // Plot parameters
        var samplesInSmall = 32;
        var smallPlotWidth = 189;  // 32 samples at 5 px/sample, including overhead (on Carl)
        var largePlotWidth = 542;  // 512 samples at 1 px/sample, including overhead (on Carl)
        var plotHeight     = 100;

        // Process event details 
        var microcontroller = parseInt(eventDetails.microcontroller); // (0-7)
        var asic            = parseInt(eventDetails.asic);  // (0-3)
        var block           = parseInt(eventDetails.block); // (0-3)
        var pixel           = parseInt(eventDetails.pixel); // (0-3)
        var daughterboard   = Convert.SuC2DB(microcontroller); // (0-7)
        var pulsenetNumber  = Convert.SuC_asic2PN(microcontroller, asic); // (0-31)
        var pulsenetPixel   = Convert.blockPixel2PNPix(block, pixel); // (0-15)
        var pmtPixel        = Convert.PN2pix(pulsenetNumber, pulsenetPixel); // (0-511)
        var threshold       = stateDetails.pulsenetSETI_State[pulsenetNumber].thresholdVrefNumber; // (0-6)
        //var threshold       = stateDetails.pulsenetSETI_State[pulsenetNumber].thresholdVoltage;
        var vetoMode        = stateDetails.pulsenetSETI_State[pulsenetNumber].vetoMode;
        var instrumentMode  = stateDetails.instrumentState.mode;
        var clockMHz        = stateDetails.fastClockState.frequency;
        if (clockMHz == 0) clockMHz = 1;  // Should never happen, but for testing reasons...
        
        // Process plot data
        var Aa = eventDetails.Aa.substring(1, eventDetails.Aa.length-2).split(', ');
        var Ab = eventDetails.Ab.substring(1, eventDetails.Ab.length-2).split(', ');
        var Ba = eventDetails.Ba.substring(1, eventDetails.Ba.length-2).split(', ');
        var Bb = eventDetails.Bb.substring(1, eventDetails.Bb.length-2).split(', ');
        var left  = SetiEvent.interleave(Aa, Ab);
        var right = SetiEvent.interleave(Ba, Bb);
        var dac = stateDetails.pulsenet_DAC_State;
        var voltages = [dac.vref[0], dac.bias, 
                        dac.vref[1], dac.vref[2], dac.vref[3], 
                        dac.vref[4], dac.vref[5], dac.vref[6] ];
        log(voltages);
        //var voltages = [1.7, 1.5, 1.4, 1.3, 1.1, 0.9, 0.7, 0.5];  // vref[0],  bias, vref[1], vref[2] ... vref[6]
        var length = Math.min(left.length, right.length);
        var time_ns = Array(length);
        for (var i=0; i<length; i++) {
            left[i]  = voltages[ left[i]  ];
            right[i] = voltages[ right[i] ];
        }
        for (var i=0; i<time_ns.length; i++) {
            time_ns[i] = i / (2 * clockMHz) * 1000;
        }

        // Construct table of event details
        var eventText     = "Event " + eventId;
        var dateText      = eventTime.slice(0, 10);
        var timeStampText = eventTime.slice(11, eventTime.length) + 
                            "    (GPS: " + eventDetails.timestamp + ")";
        var pulseNetText  = "PN" + pulsenetNumber + 
                            " (asic" + asic + " on DB" + daughterboard + 
                            " / uC" + microcontroller + ")";
        var instrumentModeText = instrumentMode;
        var vetoModeText = vetoMode;
        var pixelPairSpan2 = SPAN( { "style" : { "color" : "#3232FF" } }, pmtPixel + "L" );
        var pixelPairSpan3 = SPAN( null, " / " );
        var pixelPairSpan4 = SPAN( { "style" : { "color" : "#FF3232" } }, pmtPixel + "R" );
        var pixelPairSpan5 = SPAN( null, " on PMTs " );
        var pmtSpan1       = SPAN( { "style" : { "color" : "#3232FF" } }, daughterboard + "L" );
        var pmtSpan2       = SPAN( null, " / " );
        var pmtSpan3       = SPAN( { "style" : { "color" : "#FF3232" } }, daughterboard + "R" );
        var pixelPairSpan  = SPAN( null, "" );
        var keyComment     = eventText + ": " + eventTime;
        appendChildNodes(pixelPairSpan, pixelPairSpan2, pixelPairSpan3, pixelPairSpan4, 
                                        pixelPairSpan5, 
                                        pmtSpan1, pmtSpan2, pmtSpan3);
        var row1 = TR( { "style" : { "verticalAlign" : "top" }, 
                         "align" : "left" }, 
                       [TH( { "width" : "95px" }, 
                              eventText ),
                        TH( null, "" )]
                     );
        var row2 = TR( null, 
                       [TD( null, "Date:" ), 
                        TD( null, dateText )]
                     );
        var row3 = TR( null, 
                       [TD( null, "Time:" ), 
                        TD( null, timeStampText )]
                     );
        var row4 = TR( null, 
                       [TD( null, "Pixel pair:" ), 
                        TD( null, pixelPairSpan )]
                     );
        var row5 = TR( null, 
                       [TD( null, "PulseNet:" ), 
                        TD( null, pulseNetText )]
                     );
        var row6 = TR( null, 
                       [TD( null, "Instrument mode:" ), 
                        TD( null, instrumentModeText )]
                     );
        var row7 = TR( null, 
                       [TD( null, "Veto mode:" ), 
                        TD( null, vetoModeText )]
                     );
        var plotDetailsTable = TABLE ( { "class" : "program",
                                         "width" : "250px" }, 
                                      [row1, row2, row3, row4, row5, row6, row7]);
        var plotDetailsContainer = getElement(SetiEvent.idbase + "plotDetailsContainer");
        replaceChildNodes(plotDetailsContainer, plotDetailsTable);

        // Create plots
        var plotLarge = new SVGPlot(largePlotWidth, plotHeight);
        var plotSmall = new SVGPlot(smallPlotWidth, plotHeight);
        
        function plotFunction(p, time_ns, left, right, voltages) {
            p.strokeStyle = "#C6C6C6";
            p.fillStyle   = "#C6C6C6";
            p.fontSize   = '7px';
            //p.fontFamily = "Arial, SunSans-Regular, sans-serif"
            p.addBox();
            p.addBoxDefaults();
            p.setYRange(voltages[voltages.length-1]-0.1, voltages[0]+0.1);
            p.setYTicks(voltages);
            p.setYStubs(voltages);
            p.fontSize   = '10px';
            p.fontFamily = "Helvetica, Geneva, Arial, SunSans-Regular, sans-serif"
            p.setXLabel("Time (ns)");
            p.setYLabel("Voltage (V)");
            p.strokeStyle = 'rgba(255, 50, 50, 0.5)';
            p.plotLine(time_ns, left);
            p.strokeStyle = 'rgba(50, 50, 255, 0.5)';
            p.plotLine(time_ns, right);
            p.render();
        }
        
        var smallPlotContainer = getElement(SetiEvent.idbase + "smallPlotContainer");
        var largePlotContainer = getElement(SetiEvent.idbase + "largePlotContainer");
        replaceChildNodes(smallPlotContainer, plotSmall.svg.htmlElement);
        replaceChildNodes(largePlotContainer, plotLarge.svg.htmlElement);
        plotSmall.svg.whenReady( partial(plotFunction, 
                                         plotSmall, 
                                         time_ns.slice(0,samplesInSmall), 
                                         right.slice(0,samplesInSmall), 
                                         left.slice(0,samplesInSmall), 
                                         voltages) 
                                );
        plotLarge.svg.whenReady( partial(plotFunction, 
                                         plotLarge, 
                                         time_ns, 
                                         right, 
                                         left, 
                                         voltages) 
                                );
        PixelView.highlightPixels([[pmtPixel, keyComment]]);
    },
    
    interleave: function(a, b) {
        var inter = Array(a.length+b.length)
        for (var i=0; i<a.length; i++) {
            inter[2*i]   = a[i];
            inter[2*i+1] = b[i];
        }
        return inter;
    },
    
};

