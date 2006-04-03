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
        EventView.getEventWithCallback(eventId, SetiEvent.createPlotData)
    },
    
    createPlotData: function(eventDetails, eventId) {
        log('createPlotData:', eventDetails);
        var Aa = eventDetails['Aa'].substring(1, eventDetails['Aa'].length-2).split(', ');
        var Ab = eventDetails['Ab'].substring(1, eventDetails['Ab'].length-2).split(', ');
        var Ba = eventDetails['Ba'].substring(1, eventDetails['Ba'].length-2).split(', ');
        var Bb = eventDetails['Bb'].substring(1, eventDetails['Bb'].length-2).split(', ');
        var left = SetiEvent.interleave(Aa, Ab);
        var right = SetiEvent.interleave(Ba, Bb);
        // Convert to voltage.
        var voltages = [1.7, 1.5, 1.4, 1.3, 1.1, 0.9, 0.7, 0.5];  // vref[0],  bias, vref[1], vref[2] ... vref[6]
        var threshold = 2;
        var clockMHz = 200;
        //if (left.length != right.length)
        //    alert("left.length != right.length");  // TODO Remove this.
        var length = Math.min(left.length, right.length);
        var time_ns = Array(length);
        
        for (var i=0; i<length; i++) {
            left[i] = voltages[ left[i] ];
            right[i] = voltages[ right[i] ];
        }
        for (var i=0; i<time_ns.length; i++) {
            time_ns[i] = i/(2*clockMHz)*1000;
        }
        for (var i=0; i<time_ns.length; i++) {
            left[i] = voltages[0] - i*(voltages[0]-voltages[voltages.length-1])/length;
            right[i] = voltages[0] - Math.cos(Math.PI*2*i/length);
        }
             
        var plot = new SVGPlot(530, 100);
        
        function plotFunction(p) {
            p.strokeStyle = 'rgba(255, 50, 50, 0.5)';
            p.plotLine(time_ns, left);
            p.strokeStyle = 'rgba(50, 50, 255, 0.5)';
            p.plotLine(time_ns, right);
            p.strokeStyle = '#FFF';
            p.setYTicks(voltages);
            p.setYStubs(voltages);
            p.setXLabel("Time (ns)");
            p.setYLabel("Voltage (V)");
            p._doBoxLayout();
        }
        
        var container = getElement("coinc_plot");
        replaceChildNodes(container, plot.svg.htmlElement);
        plot.svg.whenReady( partial(plotFunction, plot) );
    },
    
    interleave: function(a, b) {
        var inter = Array(a.length+b.length)
        for (var i=0; i<a.length; i++) {
            inter[2*i] = a[i];
            inter[2*i+1] = b[i];
        }
        return inter;
    },
    
    // SetiEvent.createPlotId(1642)
};

